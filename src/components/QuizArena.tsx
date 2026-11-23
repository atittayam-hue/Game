import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  Play,
  Users,
  XCircle,
} from 'lucide-react';
import {
  QUIZ_TIME_PER_QUESTION,
  TOTAL_QUESTIONS_PER_GAME,
  calculateQuestionScore,
  generateSimulatedPeerResults,
} from '../data/quizzes';
import {
  AvatarConfig,
  ParticipantResult,
  QuestionAttempt,
  QuizDeck,
  StudentInfo,
} from '../types/game';
import { soundFX } from '../utils/sound';
import { AvatarSvg } from './AvatarSvg';

interface QuizArenaProps {
  student: StudentInfo;
  avatar: AvatarConfig;
  deck: QuizDeck;
  includePeers: boolean;
  onTogglePeers: (include: boolean) => void;
  onBackToAvatar: () => void;
  onCompleteGame: (
    playerResult: ParticipantResult,
    peerResults: ParticipantResult[]
  ) => void;
}

const OPTION_THEMES = [
  {
    keyHint: '1',
    shape: '▲',
    bg: 'bg-red-600 hover:bg-red-700',
    ring: 'focus-visible:outline-red-700',
    label: 'ตัวเลือก 1',
  },
  {
    keyHint: '2',
    shape: '◆',
    bg: 'bg-blue-600 hover:bg-blue-700',
    ring: 'focus-visible:outline-blue-700',
    label: 'ตัวเลือก 2',
  },
  {
    keyHint: '3',
    shape: '●',
    bg: 'bg-amber-600 hover:bg-amber-700',
    ring: 'focus-visible:outline-amber-700',
    label: 'ตัวเลือก 3',
  },
  {
    keyHint: '4',
    shape: '■',
    bg: 'bg-emerald-600 hover:bg-emerald-700',
    ring: 'focus-visible:outline-emerald-700',
    label: 'ตัวเลือก 4',
  },
];

export const QuizArena: React.FC<QuizArenaProps> = ({
  student,
  avatar,
  deck,
  includePeers,
  onTogglePeers,
  onBackToAvatar,
  onCompleteGame,
}) => {
  const [stage, setStage] = useState<'LOBBY' | 'PLAYING' | 'REVEAL'>('LOBBY');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(QUIZ_TIME_PER_QUESTION * 1000);
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const startTimestampRef = useRef<number>(0);
  const lastTickSecRef = useRef<number>(QUIZ_TIME_PER_QUESTION);
  const answeredRef = useRef<boolean>(false);

  const peerResults = useMemo(
    () => (includePeers ? generateSimulatedPeerResults(deck) : []),
    [deck, includePeers]
  );

  const currentQuestion = deck.questions[questionIndex];
  const latestAttempt = attempts[attempts.length - 1];

  const startQuestion = useCallback((idx: number) => {
    answeredRef.current = false;
    setQuestionIndex(idx);
    setTimeLeftMs(QUIZ_TIME_PER_QUESTION * 1000);
    lastTickSecRef.current = QUIZ_TIME_PER_QUESTION;
    startTimestampRef.current = performance.now();
    setStage('PLAYING');
  }, []);

  const finishQuestion = useCallback(
    (selectedIndex: number | null) => {
      if (answeredRef.current) return;
      answeredRef.current = true;

      const elapsedSecRaw = (performance.now() - startTimestampRef.current) / 1000;
      const timeTakenSec =
        selectedIndex === null
          ? QUIZ_TIME_PER_QUESTION
          : Number(Math.max(0.2, Math.min(QUIZ_TIME_PER_QUESTION, elapsedSecRaw)).toFixed(1));

      const isCorrect =
        selectedIndex !== null && selectedIndex === currentQuestion.correctIndex;
      const pointsEarned = calculateQuestionScore(isCorrect, timeTakenSec, currentStreak);

      if (isCorrect) {
        soundFX.playCorrect();
        const nextStreak = currentStreak + 1;
        setCurrentStreak(nextStreak);
        setMaxStreak((prev) => Math.max(prev, nextStreak));
      } else {
        soundFX.playWrong();
        setCurrentStreak(0);
      }

      setTotalScore((prev) => prev + pointsEarned);
      setAttempts((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          questionNumber: questionIndex + 1,
          selectedIndex,
          correctIndex: currentQuestion.correctIndex,
          isCorrect,
          timeTakenSec,
          pointsEarned,
        },
      ]);
      setStage('REVEAL');
    },
    [currentQuestion, currentStreak, questionIndex]
  );

  // High-precision 20s countdown loop
  useEffect(() => {
    if (stage !== 'PLAYING') return;

    const interval = window.setInterval(() => {
      const elapsed = performance.now() - startTimestampRef.current;
      const remaining = Math.max(0, QUIZ_TIME_PER_QUESTION * 1000 - elapsed);
      setTimeLeftMs(remaining);

      const ceilSec = Math.ceil(remaining / 1000);
      if (ceilSec < lastTickSecRef.current && ceilSec > 0 && ceilSec <= 5) {
        soundFX.playTick(ceilSec <= 3);
      }
      lastTickSecRef.current = ceilSec;

      if (remaining <= 0) {
        window.clearInterval(interval);
        finishQuestion(null);
      }
    }, 50);

    return () => window.clearInterval(interval);
  }, [stage, finishQuestion]);

  // Keyboard shortcuts 1-4 during PLAYING
  useEffect(() => {
    if (stage !== 'PLAYING') return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4') {
        finishQuestion(Number(e.key) - 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [stage, finishQuestion]);

  const handleNextOrFinish = () => {
    soundFX.playClick();
    if (questionIndex + 1 < TOTAL_QUESTIONS_PER_GAME) {
      startQuestion(questionIndex + 1);
    } else {
      const correctCount = attempts.filter((a) => a.isCorrect).length;
      const totalTime = attempts.reduce((sum, a) => sum + a.timeTakenSec, 0);
      const playerResult: ParticipantResult = {
        id: `student-${student.studentId}-${Date.now()}`,
        isSimulated: false,
        student,
        avatar,
        deckId: deck.id,
        deckTitle: deck.title,
        totalScore,
        correctCount,
        totalQuestions: TOTAL_QUESTIONS_PER_GAME,
        accuracyPercent: Math.round((correctCount / TOTAL_QUESTIONS_PER_GAME) * 100),
        avgTimeSec: Number((totalTime / TOTAL_QUESTIONS_PER_GAME).toFixed(1)),
        maxStreak,
        attempts,
        completedAt: new Date().toISOString(),
      };
      soundFX.playPodium();
      onCompleteGame(playerResult, peerResults);
    }
  };

  // Live partial leaderboard for REVEAL screen
  const liveStandings = useMemo(() => {
    const answeredCount = attempts.length;
    const peerPartials = peerResults.map((peer) => {
      const partialScore = peer.attempts
        .slice(0, answeredCount)
        .reduce((acc, item) => acc + item.pointsEarned, 0);
      return {
        id: peer.id,
        nickname: peer.student.nickname,
        studentId: peer.student.studentId,
        avatar: peer.avatar,
        score: partialScore,
        isSelf: false,
      };
    });

    const selfEntry = {
      id: 'self',
      nickname: student.nickname,
      studentId: student.studentId,
      avatar,
      score: totalScore,
      isSelf: true,
    };

    return [selfEntry, ...peerPartials].sort((a, b) => b.score - a.score);
  }, [attempts.length, avatar, peerResults, student.nickname, student.studentId, totalScore]);

  if (stage === 'LOBBY') {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <p className="text-xs font-semibold tracking-wide text-indigo-700">
                ขั้นตอนที่ 3 จาก 3 · ห้องเตรียมพร้อมก่อนเริ่มเกม
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                {deck.title}
              </h1>
              <p className="mt-1 text-sm text-slate-600">{deck.subtitle}</p>
            </div>

            <button
              type="button"
              onClick={onBackToAvatar}
              className="flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>แก้ไขอวตาร</span>
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 items-center gap-8 md:grid-cols-12">
            {/* Student Ready Card */}
            <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center md:col-span-5">
              <AvatarSvg config={avatar} size={136} />
              <div className="mt-4 text-xl font-bold text-slate-900">{student.nickname}</div>
              <div className="text-sm font-medium text-slate-700">{student.fullName}</div>
              <div className="mt-1.5 text-xs text-slate-500">
                <span className="font-mono-tabular">รหัส {student.studentId}</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>{student.major}</span>
              </div>
            </div>

            {/* Game Rules & Start */}
            <div className="space-y-6 md:col-span-7">
              <div className="grid grid-cols-3 gap-4 rounded-xl border border-slate-200 p-4">
                <div>
                  <div className="text-xs text-slate-500">จำนวนคำถาม</div>
                  <div className="font-mono-tabular mt-1 text-2xl font-bold text-slate-900">
                    5 ข้อ
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">เวลาแต่ละข้อ</div>
                  <div className="font-mono-tabular mt-1 text-2xl font-bold text-slate-900">
                    20 วินาที
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">คะแนนสูงสุด/ข้อ</div>
                  <div className="font-mono-tabular mt-1 text-2xl font-bold text-slate-900">
                    1,200
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 shrink-0 text-indigo-600" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      ผู้ร่วมแข่งขันในห้องเรียน (5 คน)
                    </div>
                    <div className="text-xs text-slate-500">
                      เพิ่มเพื่อนร่วมห้องจำลองเพื่อจัดอันดับบนโพเดียมทันที
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={includePeers}
                  onClick={() => {
                    soundFX.playClick();
                    onTogglePeers(!includePeers);
                  }}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                    includePeers ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      includePeers ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {includePeers && (
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    ผู้เล่นที่รออยู่ในห้องนี้ ({peerResults.length + 1} คน)
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5">
                      <AvatarSvg config={avatar} size={28} />
                      <span className="text-xs font-semibold text-indigo-900">
                        {student.nickname} (คุณ)
                      </span>
                    </div>
                    {peerResults.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5"
                      >
                        <AvatarSvg config={p.avatar} size={28} />
                        <span className="text-xs font-medium text-slate-700">
                          {p.student.nickname}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  startQuestion(0);
                }}
                className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-bold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <Play className="h-5 w-5 fill-current" />
                <span>เริ่มเล่นเกมเลย</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'PLAYING') {
    const secondsRemaining = Math.ceil(timeLeftMs / 1000);
    const progressRatio = Math.max(0, Math.min(1, timeLeftMs / (QUIZ_TIME_PER_QUESTION * 1000)));
    const isUrgent = secondsRemaining <= 5;

    return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
        {/* Top Arena HUD */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <AvatarSvg config={avatar} size={44} />
            <div>
              <div className="text-sm font-bold text-slate-900">{student.nickname}</div>
              <div className="font-mono-tabular text-xs text-slate-500">
                รหัส {student.studentId} · คะแนน {totalScore.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-slate-500">ความคืบหน้า</div>
              <div className="font-mono-tabular text-base font-bold text-slate-900">
                ข้อที่ {questionIndex + 1} / {TOTAL_QUESTIONS_PER_GAME}
              </div>
            </div>

            <div
              className={`flex min-w-[104px] items-center justify-center gap-2 rounded-xl border px-4 py-2 ${
                isUrgent
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : 'border-slate-200 bg-slate-50 text-slate-900'
              }`}
            >
              <Clock className="h-4 w-4 shrink-0" />
              <span className="font-mono-tabular text-xl font-bold">
                {secondsRemaining} วิ
              </span>
            </div>
          </div>
        </div>

        {/* Compositor-only smooth progress bar */}
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full w-full origin-left transition-colors duration-200 ${
              isUrgent ? 'bg-red-600' : secondsRemaining <= 10 ? 'bg-amber-500' : 'bg-indigo-600'
            }`}
            style={{ transform: `scaleX(${progressRatio})` }}
          />
        </div>

        {/* Question Card */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-7 text-center sm:p-10">
          <div className="text-xs font-semibold text-indigo-700">
            หมวด: {currentQuestion.category}
          </div>
          <h2
            className="mx-auto mt-3 max-w-3xl text-xl font-bold leading-snug text-slate-900 sm:text-3xl"
            style={{ textWrap: 'balance' }}
          >
            {currentQuestion.prompt}
          </h2>
        </div>

        {/* 4 Geometric Kahoot Options */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {currentQuestion.options.map((optText, idx) => {
            const theme = OPTION_THEMES[idx];
            return (
              <button
                key={idx}
                type="button"
                onClick={() => finishQuestion(idx)}
                className={`group flex min-h-[96px] items-center gap-4 rounded-2xl p-5 text-left text-white shadow-sm transition-transform duration-150 active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.bg} ${theme.ring}`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/20 text-xl font-bold">
                  {theme.shape}
                </span>
                <span className="flex-1 text-base font-semibold leading-snug sm:text-lg">
                  {optText}
                </span>
                <span className="font-mono-tabular hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/20 text-xs font-bold sm:flex">
                  {theme.keyHint}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          คลิกเลือกคำตอบหรือกดปุ่มตัวเลข 1 – 4 บนคีย์บอร์ด
        </p>
      </div>
    );
  }

  // REVEAL STAGE
  const isTimedOut = latestAttempt?.selectedIndex === null;
  const isCorrect = latestAttempt?.isCorrect ?? false;
  const selfRank = liveStandings.findIndex((s) => s.isSelf) + 1;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
      {/* Outcome Banner */}
      <div
        className={`rounded-2xl border p-6 sm:p-8 ${
          isCorrect
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-red-200 bg-red-50'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {isCorrect ? (
              <CheckCircle2 className="h-10 w-10 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="h-10 w-10 shrink-0 text-red-600" />
            )}
            <div>
              <h2
                className={`text-2xl font-bold ${
                  isCorrect ? 'text-emerald-950' : 'text-red-950'
                }`}
              >
                {isCorrect
                  ? 'ตอบถูกต้อง!'
                  : isTimedOut
                    ? 'หมดเวลาสำหรับข้อนี้'
                    : 'ยังไม่ถูกต้อง'}
              </h2>
              <p
                className={`mt-0.5 text-sm ${
                  isCorrect ? 'text-emerald-800' : 'text-red-800'
                }`}
              >
                {isCorrect
                  ? `ใช้เวลา ${latestAttempt?.timeTakenSec.toFixed(1)} วินาที · ได้รับ +${latestAttempt?.pointsEarned.toLocaleString()} คะแนน`
                  : `ใช้เวลา ${latestAttempt?.timeTakenSec.toFixed(1)} วินาที · ได้รับ 0 คะแนน`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {currentStreak >= 2 && (
              <div className="flex items-center gap-1.5 text-sm font-bold text-amber-700">
                <Flame className="h-4 w-4" />
                <span className="tabular-nums">ต่อเนื่อง {currentStreak} ข้อ</span>
              </div>
            )}
            <div className="text-right">
              <div className="text-xs text-slate-600">คะแนนสะสม</div>
              <div className="font-mono-tabular text-2xl font-extrabold text-slate-900">
                {totalScore.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Correct Answer & Explanation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-7">
          <div className="text-xs font-semibold text-slate-500">
            เฉลยข้อที่ {questionIndex + 1} จาก {TOTAL_QUESTIONS_PER_GAME}
          </div>
          <h3 className="mt-1.5 text-lg font-bold text-slate-900">
            {currentQuestion.prompt}
          </h3>

          <div className="mt-4 space-y-2.5">
            {currentQuestion.options.map((optText, idx) => {
              const isAnswer = idx === currentQuestion.correctIndex;
              const isChosen = idx === latestAttempt?.selectedIndex;
              const theme = OPTION_THEMES[idx];
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
                    isAnswer
                      ? 'border-emerald-500 bg-emerald-50 font-semibold text-emerald-950'
                      : isChosen
                        ? 'border-red-300 bg-red-50 text-red-900'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{theme.shape}</span>
                    <span>{optText}</span>
                  </div>
                  {isAnswer && (
                    <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">
                      คำตอบที่ถูก
                    </span>
                  )}
                  {!isAnswer && isChosen && (
                    <span className="text-xs font-semibold text-red-700 whitespace-nowrap">
                      คำตอบที่คุณเลือก
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            <span className="font-semibold text-slate-900">คำอธิบายเพิ่มเติม: </span>
            {currentQuestion.explanation}
          </div>
        </div>

        {/* Live Standings */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">อันดับคะแนนล่าสุด</h3>
              <span className="font-mono-tabular text-xs font-semibold text-indigo-700">
                อันดับของคุณ: #{selfRank}
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {liveStandings.slice(0, 6).map((row, idx) => (
                <div
                  key={row.id}
                  className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 ${
                    row.isSelf
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono-tabular w-5 text-sm font-bold text-slate-500">
                      {idx + 1}
                    </span>
                    <AvatarSvg config={row.avatar} size={32} />
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {row.nickname} {row.isSelf ? '(คุณ)' : ''}
                    </div>
                  </div>
                  <span className="font-mono-tabular text-sm font-bold text-slate-900">
                    {row.score.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextOrFinish}
            className="mt-6 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <span>
              {questionIndex + 1 < TOTAL_QUESTIONS_PER_GAME
                ? `ไปข้อถัดไป (ข้อที่ ${questionIndex + 2} / ${TOTAL_QUESTIONS_PER_GAME})`
                : 'ดูสรุปอันดับและดาวน์โหลด CSV'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
