import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import {
  QUIZ_DECKS,
  QUIZ_TIME_PER_QUESTION,
  TOTAL_QUESTIONS_PER_GAME,
  calculateQuestionScore,
} from './src/data/quizzes.ts';
import type {
  AvatarConfig,
  ParticipantResult,
  QuestionAttempt,
  QuizDeck,
  RoomPhase,
  RoomPlayerPublic,
  RoomRevealPayload,
  RoomStateSnapshot,
  StudentInfo,
} from './src/types/game.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

interface ServerPlayer {
  id: string;
  token: string;
  student: StudentInfo;
  avatar: AvatarConfig;
  totalScore: number;
  correctCount: number;
  currentStreak: number;
  maxStreak: number;
  attempts: QuestionAttempt[];
  connected: boolean;
  socket: WebSocket | null;
}

interface ServerRoom {
  pin: string;
  hostToken: string;
  hostSockets: Set<WebSocket>;
  deck: QuizDeck;
  phase: RoomPhase;
  currentQuestionIndex: number;
  questionStartedAtMs: number;
  questionEndsAtMs: number;
  questionTimer: ReturnType<typeof setTimeout> | null;
  earlyRevealTimer: ReturnType<typeof setTimeout> | null;
  players: Map<string, ServerPlayer>;
  revealPayload: RoomRevealPayload | null;
  finalResults: ParticipantResult[] | null;
  lastActivityAtMs: number;
}

const rooms = new Map<string, ServerRoom>();

function generatePin(): string {
  for (let i = 0; i < 25; i++) {
    const pin = String(crypto.randomInt(100000, 999999));
    if (!rooms.has(pin)) return pin;
  }
  return String(crypto.randomInt(100000, 999999));
}

function clampString(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function sanitizeStudent(raw: unknown): StudentInfo | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const studentId = clampString(obj.studentId, 32);
  const fullName = clampString(obj.fullName, 80);
  const nickname = clampString(obj.nickname, 40);
  const faculty = clampString(obj.faculty, 80);
  const major = clampString(obj.major, 80);
  const year = clampString(obj.year, 24) || 'ปี 1';
  const section = clampString(obj.section, 24) || 'Sec 01';

  if (!studentId || !fullName || !nickname) return null;
  return {
    studentId,
    fullName,
    nickname,
    faculty: faculty || '-',
    major: major || '-',
    year,
    section,
  };
}

function sanitizeAvatar(raw: unknown): AvatarConfig {
  const fallback: AvatarConfig = {
    bgColor: '#E0E7FF',
    skinColor: '#F3D2B3',
    hairStyle: 'sidePart',
    hairColor: '#18181B',
    eyeStyle: 'normal',
    accessory: 'none',
    outfitStyle: 'polo',
    outfitColor: '#312E81',
  };
  if (!raw || typeof raw !== 'object') return fallback;
  const obj = raw as Record<string, unknown>;
  const safeColor = (v: unknown, def: string) =>
    typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? v : def;
  return {
    bgColor: safeColor(obj.bgColor, fallback.bgColor),
    skinColor: safeColor(obj.skinColor, fallback.skinColor),
    hairStyle: (typeof obj.hairStyle === 'string' ? obj.hairStyle : fallback.hairStyle) as AvatarConfig['hairStyle'],
    hairColor: safeColor(obj.hairColor, fallback.hairColor),
    eyeStyle: (typeof obj.eyeStyle === 'string' ? obj.eyeStyle : fallback.eyeStyle) as AvatarConfig['eyeStyle'],
    accessory: (typeof obj.accessory === 'string' ? obj.accessory : fallback.accessory) as AvatarConfig['accessory'],
    outfitStyle: (typeof obj.outfitStyle === 'string' ? obj.outfitStyle : fallback.outfitStyle) as AvatarConfig['outfitStyle'],
    outfitColor: safeColor(obj.outfitColor, fallback.outfitColor),
  };
}

function buildPublicPlayers(room: ServerRoom): RoomPlayerPublic[] {
  return Array.from(room.players.values())
    .map((p) => {
      const hasAnsweredCurrent =
        room.phase === 'PLAYING' || room.phase === 'REVEAL'
          ? p.attempts.some((a) => a.questionNumber === room.currentQuestionIndex + 1)
          : false;
      const lastAttempt = p.attempts.length > 0 ? p.attempts[p.attempts.length - 1] : null;
      return {
        id: p.id,
        student: p.student,
        avatar: p.avatar,
        totalScore: p.totalScore,
        correctCount: p.correctCount,
        currentStreak: p.currentStreak,
        maxStreak: p.maxStreak,
        connected: p.connected,
        hasAnsweredCurrent,
        lastAttempt,
      };
    })
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return b.correctCount - a.correctCount;
    });
}

function buildSnapshot(room: ServerRoom): RoomStateSnapshot {
  const publicPlayers = buildPublicPlayers(room);
  const currentQ = room.deck.questions[room.currentQuestionIndex];
  const answeredCount = publicPlayers.filter((p) => p.hasAnsweredCurrent).length;

  return {
    pin: room.pin,
    deckId: room.deck.id,
    deckTitle: room.deck.title,
    deckSubtitle: room.deck.subtitle,
    phase: room.phase,
    currentQuestionIndex: room.currentQuestionIndex,
    totalQuestions: TOTAL_QUESTIONS_PER_GAME,
    serverNowMs: Date.now(),
    players: publicPlayers,
    answeredCount,
    question:
      (room.phase === 'PLAYING' || room.phase === 'REVEAL') && currentQ
        ? {
            index: room.currentQuestionIndex,
            totalQuestions: TOTAL_QUESTIONS_PER_GAME,
            id: currentQ.id,
            category: currentQ.category,
            prompt: currentQ.prompt,
            options: currentQ.options,
            timeLimitSec: QUIZ_TIME_PER_QUESTION,
            endsAtMs: room.questionEndsAtMs,
          }
        : null,
    reveal: room.phase === 'REVEAL' ? room.revealPayload : null,
    finalResults: room.phase === 'RESULTS' ? room.finalResults : null,
  };
}

function sendJson(ws: WebSocket | null, payload: unknown) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify(payload));
}

function broadcastRoomState(room: ServerRoom) {
  const snapshot = buildSnapshot(room);
  const msg = JSON.stringify({ type: 'room:state', state: snapshot });

  for (const hostWs of room.hostSockets) {
    if (hostWs.readyState === WebSocket.OPEN) {
      hostWs.send(msg);
    }
  }
  for (const player of room.players.values()) {
    if (player.socket && player.socket.readyState === WebSocket.OPEN) {
      player.socket.send(msg);
    }
  }
}

function clearRoomTimers(room: ServerRoom) {
  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
    room.questionTimer = null;
  }
  if (room.earlyRevealTimer) {
    clearTimeout(room.earlyRevealTimer);
    room.earlyRevealTimer = null;
  }
}

function revealCurrentQuestion(room: ServerRoom) {
  if (room.phase !== 'PLAYING') return;
  clearRoomTimers(room);

  const q = room.deck.questions[room.currentQuestionIndex];
  const questionNumber = room.currentQuestionIndex + 1;
  const optionCounts: [number, number, number, number] = [0, 0, 0, 0];

  for (const player of room.players.values()) {
    const existing = player.attempts.find((a) => a.questionNumber === questionNumber);
    if (!existing) {
      player.currentStreak = 0;
      player.attempts.push({
        questionId: q.id,
        questionNumber,
        selectedIndex: null,
        correctIndex: q.correctIndex,
        isCorrect: false,
        timeTakenSec: QUIZ_TIME_PER_QUESTION,
        pointsEarned: 0,
      });
    } else if (
      existing.selectedIndex !== null &&
      existing.selectedIndex >= 0 &&
      existing.selectedIndex <= 3
    ) {
      optionCounts[existing.selectedIndex] += 1;
    }
  }

  room.phase = 'REVEAL';
  room.revealPayload = {
    questionIndex: room.currentQuestionIndex,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    optionCounts,
  };
  room.lastActivityAtMs = Date.now();
  broadcastRoomState(room);
}

function startQuestion(room: ServerRoom, index: number) {
  clearRoomTimers(room);
  room.currentQuestionIndex = index;
  room.phase = 'PLAYING';
  room.revealPayload = null;
  room.questionStartedAtMs = Date.now();
  room.questionEndsAtMs = room.questionStartedAtMs + QUIZ_TIME_PER_QUESTION * 1000;
  room.lastActivityAtMs = room.questionStartedAtMs;

  room.questionTimer = setTimeout(() => {
    revealCurrentQuestion(room);
  }, QUIZ_TIME_PER_QUESTION * 1000);

  broadcastRoomState(room);
}

function finalizeRoomResults(room: ServerRoom) {
  clearRoomTimers(room);
  const completedAt = new Date().toISOString();

  const results: ParticipantResult[] = Array.from(room.players.values())
    .map((p) => {
      const totalTime = p.attempts.reduce((sum, a) => sum + a.timeTakenSec, 0);
      const count = p.attempts.length || TOTAL_QUESTIONS_PER_GAME;
      return {
        id: p.id,
        isSimulated: false,
        student: p.student,
        avatar: p.avatar,
        deckId: room.deck.id,
        deckTitle: room.deck.title,
        totalScore: p.totalScore,
        correctCount: p.correctCount,
        totalQuestions: TOTAL_QUESTIONS_PER_GAME,
        accuracyPercent: Math.round((p.correctCount / TOTAL_QUESTIONS_PER_GAME) * 100),
        avgTimeSec: Number((totalTime / count).toFixed(1)),
        maxStreak: p.maxStreak,
        attempts: p.attempts,
        completedAt,
      };
    })
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return a.avgTimeSec - b.avgTimeSec;
    });

  room.phase = 'RESULTS';
  room.finalResults = results;
  room.lastActivityAtMs = Date.now();
  broadcastRoomState(room);
}

function verifyHost(room: ServerRoom | undefined, hostToken: unknown): room is ServerRoom {
  if (!room || typeof hostToken !== 'string') return false;
  if (hostToken.length !== room.hostToken.length) return false;
  return crypto.timingSafeEqual(Buffer.from(hostToken), Buffer.from(room.hostToken));
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/rooms', (req, res) => {
    const deckId = typeof req.body?.deckId === 'string' ? req.body.deckId : QUIZ_DECKS[0].id;
    const deck = QUIZ_DECKS.find((d) => d.id === deckId) ?? QUIZ_DECKS[0];

    const pin = generatePin();
    const hostToken = crypto.randomBytes(24).toString('hex');
    const room: ServerRoom = {
      pin,
      hostToken,
      hostSockets: new Set(),
      deck,
      phase: 'LOBBY',
      currentQuestionIndex: 0,
      questionStartedAtMs: 0,
      questionEndsAtMs: 0,
      questionTimer: null,
      earlyRevealTimer: null,
      players: new Map(),
      revealPayload: null,
      finalResults: null,
      lastActivityAtMs: Date.now(),
    };
    rooms.set(pin, room);
    res.status(201).json({
      pin,
      hostToken,
      state: buildSnapshot(room),
    });
  });

  app.get('/api/rooms/:pin', (req, res) => {
    const pin = clampString(req.params.pin, 10);
    const room = rooms.get(pin);
    if (!room) {
      res.status(404).json({ exists: false, message: 'ไม่พบห้องเรียนหมายเลข PIN นี้' });
      return;
    }
    res.json({
      exists: true,
      pin: room.pin,
      phase: room.phase,
      deckTitle: room.deck.title,
      playerCount: room.players.size,
    });
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    let boundRoom: ServerRoom | null = null;
    let boundPlayerId: string | null = null;
    let boundIsHost = false;

    ws.on('message', (raw) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        sendJson(ws, { type: 'room:error', message: 'รูปแบบคำสั่งไม่ถูกต้อง' });
        return;
      }

      const type = typeof msg.type === 'string' ? msg.type : '';
      const pin = clampString(msg.pin, 10);
      const room = rooms.get(pin);

      if (type === 'host:auth' || (type === 'room:sync' && msg.role === 'host')) {
        if (!verifyHost(room, msg.hostToken)) {
          sendJson(ws, { type: 'room:error', message: 'ไม่พบห้องเรียนหรือสิทธิ์ผู้คุมห้องไม่ถูกต้อง' });
          return;
        }
        boundRoom = room;
        boundIsHost = true;
        room.hostSockets.add(ws);
        room.lastActivityAtMs = Date.now();
        sendJson(ws, { type: 'room:state', state: buildSnapshot(room) });
        return;
      }

      if (type === 'host:start') {
        if (!verifyHost(room, msg.hostToken)) {
          sendJson(ws, { type: 'room:error', message: 'ไม่มีสิทธิ์ควบคุมห้องเรียนนี้' });
          return;
        }
        if (room.phase !== 'LOBBY') return;
        startQuestion(room, 0);
        return;
      }

      if (type === 'host:reveal') {
        if (!verifyHost(room, msg.hostToken)) return;
        if (room.phase === 'PLAYING') {
          revealCurrentQuestion(room);
        }
        return;
      }

      if (type === 'host:next') {
        if (!verifyHost(room, msg.hostToken)) return;
        if (room.phase !== 'REVEAL') return;
        const nextIdx = room.currentQuestionIndex + 1;
        if (nextIdx < TOTAL_QUESTIONS_PER_GAME) {
          startQuestion(room, nextIdx);
        } else {
          finalizeRoomResults(room);
        }
        return;
      }

      if (type === 'host:restart') {
        if (!verifyHost(room, msg.hostToken)) return;
        clearRoomTimers(room);
        if (typeof msg.deckId === 'string') {
          const nextDeck = QUIZ_DECKS.find((d) => d.id === msg.deckId);
          if (nextDeck) room.deck = nextDeck;
        }
        room.phase = 'LOBBY';
        room.currentQuestionIndex = 0;
        room.revealPayload = null;
        room.finalResults = null;
        for (const p of room.players.values()) {
          p.totalScore = 0;
          p.correctCount = 0;
          p.currentStreak = 0;
          p.maxStreak = 0;
          p.attempts = [];
        }
        room.lastActivityAtMs = Date.now();
        broadcastRoomState(room);
        return;
      }

      if (type === 'player:join') {
        if (!room) {
          sendJson(ws, { type: 'room:error', message: 'ไม่พบห้องเรียนหมายเลข PIN นี้' });
          return;
        }

        const existingId = typeof msg.playerId === 'string' ? msg.playerId : '';
        const existingToken = typeof msg.playerToken === 'string' ? msg.playerToken : '';
        const existingPlayer = existingId ? room.players.get(existingId) : undefined;

        if (
          existingPlayer &&
          existingToken.length === existingPlayer.token.length &&
          crypto.timingSafeEqual(Buffer.from(existingToken), Buffer.from(existingPlayer.token))
        ) {
          existingPlayer.socket = ws;
          existingPlayer.connected = true;
          boundRoom = room;
          boundPlayerId = existingPlayer.id;
          room.lastActivityAtMs = Date.now();
          sendJson(ws, {
            type: 'player:joined',
            playerId: existingPlayer.id,
            playerToken: existingPlayer.token,
            state: buildSnapshot(room),
          });
          broadcastRoomState(room);
          return;
        }

        if (room.phase !== 'LOBBY') {
          sendJson(ws, {
            type: 'room:error',
            message: 'ห้องนี้เริ่มเกมไปแล้ว กรุณารออาจารย์เปิดรอบใหม่',
          });
          return;
        }

        const student = sanitizeStudent(msg.student);
        if (!student) {
          sendJson(ws, {
            type: 'room:error',
            message: 'กรุณากรอกข้อมูลนักศึกษา (รหัสนักศึกษา, ชื่อ-นามสกุล, ชื่อเล่น) ให้ครบถ้วน',
          });
          return;
        }

        const avatar = sanitizeAvatar(msg.avatar);

        // Idempotent check by studentId if already in lobby
        let targetPlayer: ServerPlayer | undefined;
        for (const p of room.players.values()) {
          if (p.student.studentId === student.studentId) {
            targetPlayer = p;
            break;
          }
        }

        if (targetPlayer) {
          targetPlayer.student = student;
          targetPlayer.avatar = avatar;
          targetPlayer.connected = true;
          targetPlayer.socket = ws;
        } else {
          const playerId = `p_${crypto.randomBytes(8).toString('hex')}`;
          const playerToken = crypto.randomBytes(16).toString('hex');
          targetPlayer = {
            id: playerId,
            token: playerToken,
            student,
            avatar,
            totalScore: 0,
            correctCount: 0,
            currentStreak: 0,
            maxStreak: 0,
            attempts: [],
            connected: true,
            socket: ws,
          };
          room.players.set(playerId, targetPlayer);
        }

        boundRoom = room;
        boundPlayerId = targetPlayer.id;
        room.lastActivityAtMs = Date.now();

        sendJson(ws, {
          type: 'player:joined',
          playerId: targetPlayer.id,
          playerToken: targetPlayer.token,
          state: buildSnapshot(room),
        });
        broadcastRoomState(room);
        return;
      }

      if (type === 'room:sync' && msg.role === 'player') {
        if (!room) {
          sendJson(ws, { type: 'room:error', message: 'ห้องเรียนถูกปิดแล้ว' });
          return;
        }
        const playerId = typeof msg.playerId === 'string' ? msg.playerId : '';
        const playerToken = typeof msg.playerToken === 'string' ? msg.playerToken : '';
        const player = room.players.get(playerId);
        if (
          !player ||
          playerToken.length !== player.token.length ||
          !crypto.timingSafeEqual(Buffer.from(playerToken), Buffer.from(player.token))
        ) {
          sendJson(ws, { type: 'room:error', message: 'เซสชันผู้เล่นหมดอายุ กรุณาเข้าห้องใหม่อีกครั้ง' });
          return;
        }
        player.socket = ws;
        player.connected = true;
        boundRoom = room;
        boundPlayerId = player.id;
        sendJson(ws, { type: 'room:state', state: buildSnapshot(room) });
        broadcastRoomState(room);
        return;
      }

      if (type === 'player:answer') {
        if (!room || room.phase !== 'PLAYING') return;
        const playerId = typeof msg.playerId === 'string' ? msg.playerId : '';
        const playerToken = typeof msg.playerToken === 'string' ? msg.playerToken : '';
        const player = room.players.get(playerId);
        if (
          !player ||
          playerToken.length !== player.token.length ||
          !crypto.timingSafeEqual(Buffer.from(playerToken), Buffer.from(player.token))
        ) {
          return;
        }

        const qIdx = typeof msg.questionIndex === 'number' ? msg.questionIndex : -1;
        const selectedIndex = typeof msg.selectedIndex === 'number' ? msg.selectedIndex : -1;
        if (qIdx !== room.currentQuestionIndex) return;
        if (selectedIndex < 0 || selectedIndex > 3 || !Number.isInteger(selectedIndex)) return;

        const questionNumber = qIdx + 1;
        if (player.attempts.some((a) => a.questionNumber === questionNumber)) {
          return; // Idempotent guard
        }

        const q = room.deck.questions[qIdx];
        const elapsedSec = (Date.now() - room.questionStartedAtMs) / 1000;
        const timeTakenSec = Number(
          Math.max(0.2, Math.min(QUIZ_TIME_PER_QUESTION, elapsedSec)).toFixed(1)
        );
        const isCorrect = selectedIndex === q.correctIndex;
        const pointsEarned = calculateQuestionScore(
          isCorrect,
          timeTakenSec,
          player.currentStreak
        );

        if (isCorrect) {
          player.correctCount += 1;
          player.currentStreak += 1;
          if (player.currentStreak > player.maxStreak) {
            player.maxStreak = player.currentStreak;
          }
        } else {
          player.currentStreak = 0;
        }
        player.totalScore += pointsEarned;
        player.attempts.push({
          questionId: q.id,
          questionNumber,
          selectedIndex,
          correctIndex: q.correctIndex,
          isCorrect,
          timeTakenSec,
          pointsEarned,
        });
        room.lastActivityAtMs = Date.now();

        broadcastRoomState(room);

        // If all connected players have answered, reveal immediately
        const activePlayers = Array.from(room.players.values()).filter((p) => p.connected);
        const allAnswered =
          activePlayers.length > 0 &&
          activePlayers.every((p) =>
            p.attempts.some((a) => a.questionNumber === questionNumber)
          );

        if (allAnswered && !room.earlyRevealTimer) {
          room.earlyRevealTimer = setTimeout(() => {
            revealCurrentQuestion(room);
          }, 350);
        }
      }
    });

    ws.on('close', () => {
      if (!boundRoom) return;
      if (boundIsHost) {
        boundRoom.hostSockets.delete(ws);
      }
      if (boundPlayerId) {
        const p = boundRoom.players.get(boundPlayerId);
        if (p && p.socket === ws) {
          p.connected = false;
          p.socket = null;
          broadcastRoomState(boundRoom);
        }
      }
    });
  });

  // Periodic cleanup of inactive rooms (older than 4 hours)
  setInterval(() => {
    const cutoff = Date.now() - 4 * 60 * 60 * 1000;
    for (const [pin, room] of rooms.entries()) {
      if (room.lastActivityAtMs < cutoff) {
        clearRoomTimers(room);
        rooms.delete(pin);
      }
    }
  }, 15 * 60 * 1000);

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Kahoot Classroom server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
