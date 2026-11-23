import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  Clock,
  Copy,
  Link2,
  Play,
  RotateCcw,
  Users,
} from 'lucide-react';
import { QUIZ_DECKS, QUIZ_TIME_PER_QUESTION } from '../data/quizzes';
import { useRoomSocket } from '../hooks/useRoomSocket';
import { RoomStateSnapshot } from '../types/game';
import { soundFX } from '../utils/sound';
import { AvatarSvg } from './AvatarSvg';
import { ResultsDashboard } from './ResultsDashboard';

interface HostArenaProps {
  onExitToHome: () => void;
}

const OPTION_STYLES = [
  { shape: '▲', bg: 'bg-red-600', light: 'bg-red-50 border-red-200 text-red-900' },
  { shape: '◆', bg: 'bg-blue-600', light: 'bg-blue-50 border-blue-200 text-blue-900' },
  { shape: '●', bg: 'bg-amber-600', light: 'bg-amber-50 border-amber-200 text-amber-900' },
  { shape: '■', bg: 'bg-emerald-600', light: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
];

export const HostArena: React.FC<HostArenaProps> = ({ onExitToHome }) => {
  const [selectedDeckId, setSelectedDeckId] = useState(QUIZ_DECKS[0].id);
  const [pin, setPin] = useState<string | null>(null);
  const [hostToken, setHostToken] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'pin' | 'link' | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState(QUIZ_TIME_PER_QUESTION * 1000);

  const {
    roomState,
    connected,
    error: socketError,
    clockOffsetMs,
    hostStartGame,
    hostRevealEarly,
    hostNextStep,
    hostRestartRoom,
  } = useRoomSocket({
    role: 'host',
    pin,
    hostToken,
  });

  // Update countdown smoothly from server endsAtMs
  useEffect(() => {
    if (!roomState || roomState.phase !== 'PLAYING' || !roomState.question) return;
    const endsAt = roomState.question.endsAtMs;
    const update = () => {
      const serverNow = Date.now() + clockOffsetMs;
      setTimeLeftMs(Math.max(0, endsAt - serverNow));
    };
    update();
    const timer = window.setInterval(update, 50);
    return () => window.clearInterval(timer);
  }, [roomState, clockOffsetMs]);

  const handleCreateRoom = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckId: selectedDeckId }),
      });
      if (!res.ok) {
        throw new Error('Failed to create room');
      }
      const data = (await res.json()) as {
        pin: string;
        hostToken: string;
        state: RoomStateSnapshot;
      };
      soundFX.playClick();
      setPin(data.pin);
      setHostToken(data.hostToken);
    } catch {
      setCreateError('ไม่สามารถสร้างห้องได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (type: 'pin' | 'link') => {
    if (!pin) return;
    const text =
      type === 'pin' ? pin : `${window.location.origin}/?pin=${pin}`;
    navigator.clipboard.writeText(text).catch(() => {});
    soundFX.playClick();
    setCopiedType(type);
    window.setTimeout(() => setCopiedType(null), 2000);
  };

  if (!pin || !hostToken) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-10">
          <p className="text-xs font-semibold tracking-wide text-indigo-700">
            โหมดอาจารย์ผู้สอน · สร้างห้องแข่งขันแบบเรียลไทม์
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            เลือกชุดคำถามและเปิดห้องรับรหัส PIN
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            เมื่อสร้างห้องแล้ว นักศึกษาสามารถเปิดลิงก์เดียวกันแล้วกรอกรหัส PIN 6 หลักเพื่อเข้าร่วมแข่งพร้อมกันทั้งห้อง
          </p>

          <div className="mt-6 space-y-3">
            {QUIZ_DECKS.map((deck) => {
              const selected = deck.id === selectedDeckId;
              return (
                <button
                  key={deck.id}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setSelectedDeckId(deck.id);
                  }}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    selected
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-base font-bold text-slate-900">{deck.title}</span>
                    <span className="font-mono-tabular text-xs font-semibold text-indigo-700 whitespace-nowrap">
                      5 ข้อ · ข้อละ 20 วินาที
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{deck.subtitle}</p>
                </button>
              );
            })}
          </div>

          {createError && (
            <p className="mt-4 text-sm font-medium text-red-600">{createError}</p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={onExitToHome}
              className="min-h-[44px] rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              กลับหน้าหลัก
            </button>
            <button
              type="button"
              disabled={creating}
              onClick={handleCreateRoom}
              className="flex min-h-[46px] items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              <span>{creating ? 'กำลังสร้างห้อง...' : 'สร้างห้องเรียนและรับรหัส PIN'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!roomState) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-10">
          <div className="text-base font-semibold text-slate-800">
            กำลังเชื่อมต่อห้องเรียนหมายเลข {pin}...
          </div>
          {socketError && <p className="mt-2 text-sm text-red-600">{socketError}</p>}
        </div>
      </div>
    );
  }

  if (roomState.phase === 'RESULTS' && roomState.finalResults) {
    const activeDeck =
      QUIZ_DECKS.find((d) => d.id === roomState.deckId) ?? QUIZ_DECKS[0];
    return (
      <div>
        <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-3">
            <div className="text-sm font-semibold text-slate-800">
              ห้องเรียน PIN <span className="font-mono-tabular text-indigo-700">{roomState.pin}</span>
              <span className="mx-2 text-slate-300" aria-hidden="true">·</span>
              <span className="text-slate-600">
                จำนวนนักศึกษาทั้งหมด {roomState.finalResults.length} คน
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                hostRestartRoom();
              }}
              className="flex min-h-[40px] items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>เปิดรอบใหม่ด้วย PIN เดิม</span>
            </button>
          </div>
        </div>
        <ResultsDashboard
          currentGameResults={roomState.finalResults}
          allRecordedStudents={roomState.finalResults}
          activePlayerId={null}
          deck={activeDeck}
          onPlayAgainSameStudent={() => hostRestartRoom()}
          onRegisterNextStudent={onExitToHome}
          onClearHistory={onExitToHome}
        />
      </div>
    );
  }

  if (roomState.phase === 'LOBBY') {
    const activePlayers = roomState.players;
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
          {/* PIN & Share Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 lg:col-span-5">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-700">ห้องเรียนสด (Host)</span>
                <span className={connected ? 'text-emerald-700 font-medium' : 'text-amber-700'}>
                  {connected ? 'เชื่อมต่อเรียลไทม์แล้ว' : 'กำลังเชื่อมต่อใหม่...'}
                </span>
              </div>

              <div className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center">
                <div className="text-xs font-semibold text-indigo-800">รหัส PIN สำหรับนักศึกษาเข้าห้อง</div>
                <div className="font-mono-tabular mt-2 text-5xl font-extrabold tracking-[0.18em] text-indigo-950">
                  {roomState.pin}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleCopy('pin')}
                  className="flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copiedType === 'pin' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedType === 'pin' ? 'คัดลอก PIN แล้ว' : 'คัดลอก PIN'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy('link')}
                  className="flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copiedType === 'link' ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4" />}
                  <span>{copiedType === 'link' ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกลิงก์เชิญ'}</span>
                </button>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="text-xs text-slate-500">ชุดคำถามที่เลือก</div>
                <div className="mt-1 text-base font-bold text-slate-900">{roomState.deckTitle}</div>
                <div className="mt-1 text-xs text-slate-500">5 ข้อ · ข้อละ 20 วินาที</div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button
                type="button"
                disabled={activePlayers.length === 0}
                onClick={() => {
                  soundFX.playClick();
                  hostStartGame();
                }}
                className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-base font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Play className="h-5 w-5 fill-current" />
                <span>
                  {activePlayers.length === 0
                    ? 'รอนักศึกษาเข้าห้องอย่างน้อย 1 คน'
                    : `เริ่มเกมพร้อมกัน (${activePlayers.length} คน)`}
                </span>
              </button>
            </div>
          </div>

          {/* Live Joined Students Roster */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Users className="h-5 w-5 text-indigo-600" />
                <span>นักศึกษาที่เข้าห้องแล้ว</span>
              </h2>
              <span className="font-mono-tabular text-sm font-bold text-indigo-700">
                {activePlayers.length} คน
              </span>
            </div>

            {activePlayers.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <p className="text-base font-semibold text-slate-700">
                  ยังไม่มีนักศึกษาเข้ามาในห้อง
                </p>
                <p className="mt-1.5 max-w-md text-sm text-slate-500">
                  แชร์รหัส PIN <span className="font-mono-tabular font-bold text-slate-800">{roomState.pin}</span> หรือกดคัดลอกลิงก์เชิญให้นักศึกษาเปิดบนมือถือหรือคอมพิวเตอร์
                </p>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {activePlayers.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <AvatarSvg config={p.avatar} size={48} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-slate-900">
                        {p.student.nickname} · {p.student.fullName}
                      </div>
                      <div className="font-mono-tabular truncate text-xs text-slate-500">
                        {p.student.studentId} · {p.student.major}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // PLAYING or REVEAL for Host
  const q = roomState.question!;
  const secondsRemaining = Math.ceil(timeLeftMs / 1000);
  const progressRatio = Math.max(0, Math.min(1, timeLeftMs / (QUIZ_TIME_PER_QUESTION * 1000)));
  const isPlaying = roomState.phase === 'PLAYING';
  const reveal = roomState.reveal;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <div>
          <div className="text-xs font-semibold text-indigo-700">
            ห้อง PIN <span className="font-mono-tabular">{roomState.pin}</span> · หมวด {q.category}
          </div>
          <div className="font-mono-tabular mt-0.5 text-base font-bold text-slate-900">
            ข้อที่ {q.index + 1} / {q.totalQuestions}
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="text-xs text-slate-500">นักศึกษาที่ตอบแล้ว</div>
            <div className="font-mono-tabular text-lg font-bold text-slate-900">
              {roomState.answeredCount} / {roomState.players.length} คน
            </div>
          </div>

          {isPlaying && (
            <div
              className={`flex min-w-[100px] items-center justify-center gap-2 rounded-xl border px-4 py-2 ${
                secondsRemaining <= 5
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : 'border-slate-200 bg-slate-50 text-slate-900'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span className="font-mono-tabular text-xl font-bold">{secondsRemaining} วิ</span>
            </div>
          )}
        </div>
      </div>

      {isPlaying && (
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full w-full origin-left ${
              secondsRemaining <= 5 ? 'bg-red-600' : 'bg-indigo-600'
            }`}
            style={{ transform: `scaleX(${progressRatio})` }}
          />
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-7 text-center sm:p-9">
        <h2
          className="mx-auto max-w-3xl text-2xl font-bold text-slate-900 sm:text-3xl"
          style={{ textWrap: 'balance' }}
        >
          {q.prompt}
        </h2>
      </div>

      {isPlaying ? (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {q.options.map((opt, idx) => (
              <div
                key={idx}
                className={`flex min-h-[84px] items-center gap-4 rounded-2xl p-5 text-white ${OPTION_STYLES[idx].bg}`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/20 text-xl font-bold">
                  {OPTION_STYLES[idx].shape}
                </span>
                <span className="text-base font-semibold sm:text-lg">{opt}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                hostRevealEarly();
              }}
              className="min-h-[42px] rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              ปิดรับคำตอบและเฉลยข้อนี้ทันที
            </button>
          </div>
        </div>
      ) : (
        reveal && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Answer Distribution */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-7">
              <h3 className="text-base font-bold text-slate-900">เฉลยและสัดส่วนคำตอบของนักศึกษา</h3>
              <div className="mt-4 space-y-3">
                {q.options.map((opt, idx) => {
                  const isCorrect = idx === reveal.correctIndex;
                  const count = reveal.optionCounts[idx];
                  const total = Math.max(1, roomState.players.length);
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border p-3.5 ${
                        isCorrect
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-2.5 font-semibold text-slate-900">
                          <span>{OPTION_STYLES[idx].shape}</span>
                          <span>{opt}</span>
                          {isCorrect && (
                            <span className="text-xs font-bold text-emerald-700">(คำตอบที่ถูก)</span>
                          )}
                        </div>
                        <span className="font-mono-tabular text-xs font-bold text-slate-700">
                          {count} คน ({pct}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">คำอธิบาย: </span>
                {reveal.explanation}
              </div>
            </div>

            {/* Live Leaderboard */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">อันดับคะแนนรวมล่าสุด</h3>
                <div className="mt-4 space-y-2.5">
                  {roomState.players.slice(0, 6).map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono-tabular w-5 text-sm font-bold text-slate-500">
                          {idx + 1}
                        </span>
                        <AvatarSvg config={p.avatar} size={32} />
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {p.student.nickname}
                        </div>
                      </div>
                      <span className="font-mono-tabular text-sm font-bold text-slate-900">
                        {p.totalScore.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  hostNextStep();
                }}
                className="mt-6 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <span>
                  {q.index + 1 < q.totalQuestions
                    ? `ส่งคำถามข้อถัดไป (ข้อที่ ${q.index + 2}/${q.totalQuestions})`
                    : 'แสดงโพเดียมสรุปผลรวมทั้งห้อง'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};
