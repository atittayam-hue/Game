import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  Users,
  XCircle,
} from 'lucide-react';
import { DEFAULT_AVATAR } from '../data/avatarOptions';
import { QUIZ_DECKS, QUIZ_TIME_PER_QUESTION } from '../data/quizzes';
import { useRoomSocket } from '../hooks/useRoomSocket';
import { AvatarConfig, StudentInfo } from '../types/game';
import { soundFX } from '../utils/sound';
import { AvatarBuilder } from './AvatarBuilder';
import { AvatarSvg } from './AvatarSvg';
import { RegistrationForm } from './RegistrationForm';
import { ResultsDashboard } from './ResultsDashboard';

interface PlayerLiveArenaProps {
  initialPin?: string;
  onExitToHome: () => void;
}

const EMPTY_STUDENT: StudentInfo = {
  studentId: '',
  fullName: '',
  nickname: '',
  faculty: '',
  major: '',
  year: 'ปี 1',
  section: 'Sec 01',
};

const OPTION_THEMES = [
  { keyHint: '1', shape: '▲', bg: 'bg-red-600 hover:bg-red-700' },
  { keyHint: '2', shape: '◆', bg: 'bg-blue-600 hover:bg-blue-700' },
  { keyHint: '3', shape: '●', bg: 'bg-amber-600 hover:bg-amber-700' },
  { keyHint: '4', shape: '■', bg: 'bg-emerald-600 hover:bg-emerald-700' },
];

export const PlayerLiveArena: React.FC<PlayerLiveArenaProps> = ({
  initialPin = '',
  onExitToHome,
}) => {
  const [step, setStep] = useState<'PIN' | 'REGISTER' | 'AVATAR' | 'ROOM'>(
    initialPin.length === 6 ? 'REGISTER' : 'PIN'
  );
  const [pinInput, setPinInput] = useState(initialPin);
  const [verifiedPin, setVerifiedPin] = useState<string | null>(
    initialPin.length === 6 ? initialPin : null
  );
  const [roomPreview, setRoomPreview] = useState<{
    deckTitle: string;
    playerCount: number;
  } | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [checkingPin, setCheckingPin] = useState(false);

  const [student, setStudent] = useState<StudentInfo>(EMPTY_STUDENT);
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState(QUIZ_TIME_PER_QUESTION * 1000);

  const {
    roomState,
    connected,
    error: socketError,
    clockOffsetMs,
    playerId,
    joinAsPlayer,
    submitAnswer,
  } = useRoomSocket({
    role: 'player',
    pin: step === 'ROOM' ? verifiedPin : null,
  });

  // Verify initialPin if provided in URL
  useEffect(() => {
    if (initialPin.length !== 6) return;
    fetch(`/api/rooms/${initialPin}`)
      .then(async (res) => {
        if (!res.ok) {
          setPinError('ลิงก์ห้องเรียนหมดอายุหรือไม่พบห้องหมายเลข PIN นี้');
          setVerifiedPin(null);
          setStep('PIN');
          return;
        }
        const data = (await res.json()) as {
          deckTitle: string;
          playerCount: number;
          phase: string;
        };
        if (data.phase !== 'LOBBY') {
          setPinError('ห้องนี้เริ่มเกมไปแล้ว กรุณารอรอบใหม่');
          setVerifiedPin(null);
          setStep('PIN');
          return;
        }
        setRoomPreview({ deckTitle: data.deckTitle, playerCount: data.playerCount });
      })
      .catch(() => {
        setStep('PIN');
      });
  }, [initialPin]);

  // Reset local chosen index when question advances
  useEffect(() => {
    if (roomState?.phase === 'PLAYING') {
      const me = roomState.players.find((p) => p.id === playerId);
      if (!me?.hasAnsweredCurrent) {
        setSelectedChoice(null);
      }
    }
  }, [roomState?.currentQuestionIndex, roomState?.phase, roomState?.players, playerId]);

  // Play outcome sounds on reveal / results
  useEffect(() => {
    if (!roomState || !playerId) return;
    const me = roomState.players.find((p) => p.id === playerId);
    if (!me) return;
    if (roomState.phase === 'REVEAL' && me.lastAttempt) {
      if (me.lastAttempt.isCorrect) {
        soundFX.playCorrect();
      } else {
        soundFX.playWrong();
      }
    } else if (roomState.phase === 'RESULTS') {
      soundFX.playPodium();
    }
  }, [roomState?.phase, roomState?.currentQuestionIndex, playerId]);

  // Live countdown timer from server endsAtMs
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

  // Keyboard shortcuts 1-4 during PLAYING
  useEffect(() => {
    if (
      step !== 'ROOM' ||
      roomState?.phase !== 'PLAYING' ||
      !roomState.question ||
      selectedChoice !== null
    ) {
      return;
    }
    const qIdx = roomState.question.index;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4') {
        const idx = Number(e.key) - 1;
        soundFX.playClick();
        setSelectedChoice(idx);
        submitAnswer(qIdx, idx);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [step, roomState, selectedChoice, submitAnswer]);

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = pinInput.replace(/\D/g, '').slice(0, 6);
    if (cleaned.length !== 6) {
      setPinError('กรุณากรอกรหัส PIN 6 หลัก');
      return;
    }
    setCheckingPin(true);
    setPinError(null);
    try {
      const res = await fetch(`/api/rooms/${cleaned}`);
      if (!res.ok) {
        setPinError('ไม่พบห้องเรียนหมายเลข PIN นี้');
        setCheckingPin(false);
        return;
      }
      const data = (await res.json()) as {
        deckTitle: string;
        playerCount: number;
        phase: string;
      };
      if (data.phase !== 'LOBBY') {
        setPinError('ห้องนี้เริ่มเกมไปแล้ว กรุณารอรอบใหม่จากอาจารย์');
        setCheckingPin(false);
        return;
      }
      soundFX.playClick();
      setVerifiedPin(cleaned);
      setRoomPreview({ deckTitle: data.deckTitle, playerCount: data.playerCount });
      setStep('REGISTER');
    } catch {
      setPinError('ไม่สามารถตรวจสอบห้องเรียนได้ กรุณาลองใหม่');
    } finally {
      setCheckingPin(false);
    }
  };

  if (step === 'PIN') {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-9">
          <p className="text-xs font-semibold tracking-wide text-indigo-700">
            เข้าร่วมห้องเรียนสด · สำหรับนักศึกษา
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">กรอกรหัส PIN ห้องเรียน</h1>
          <p className="mt-1.5 text-sm text-slate-600">
            รับรหัส 6 หลักจากหน้าจอของอาจารย์เพื่อเข้าลงทะเบียนและสร้างอวตาร
          </p>

          <form onSubmit={handleVerifyPin} className="mt-6 space-y-4">
            <div>
              <label htmlFor="live-pin" className="block text-sm font-medium text-slate-700">
                รหัส PIN 6 หลัก
              </label>
              <input
                id="live-pin"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                  if (pinError) setPinError(null);
                }}
                placeholder="เช่น 482910"
                className="font-mono-tabular mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-center text-2xl font-bold tracking-[0.25em] text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              {pinError && (
                <p className="mt-2 text-xs font-medium text-red-600">{pinError}</p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onExitToHome}
                className="min-h-[44px] rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                กลับหน้าหลัก
              </button>
              <button
                type="submit"
                disabled={checkingPin}
                className="flex min-h-[44px] items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                <span>{checkingPin ? 'กำลังตรวจสอบ...' : 'ถัดไป'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'REGISTER') {
    return (
      <div>
        {verifiedPin && (
          <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs text-indigo-950">
              <div>
                กำลังเข้าร่วมห้อง PIN{' '}
                <span className="font-mono-tabular font-bold">{verifiedPin}</span>
                {roomPreview && (
                  <>
                    <span className="mx-2" aria-hidden="true">·</span>
                    <span>{roomPreview.deckTitle}</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setStep('PIN')}
                className="font-semibold text-indigo-700 underline"
              >
                เปลี่ยนรหัส PIN
              </button>
            </div>
          </div>
        )}
        <RegistrationForm
          initialStudent={student}
          recordedStudentsCount={0}
          onSubmit={(info) => {
            setStudent(info);
            setStep('AVATAR');
          }}
        />
      </div>
    );
  }

  if (step === 'AVATAR') {
    return (
      <AvatarBuilder
        student={student}
        avatar={avatar}
        selectedDeckId={QUIZ_DECKS[0].id}
        lockedDeck={
          roomPreview
            ? {
                title: roomPreview.deckTitle,
                subtitle: `ห้องเรียน PIN ${verifiedPin}`,
              }
            : undefined
        }
        onChangeAvatar={setAvatar}
        onChangeDeck={() => {}}
        onBack={() => setStep('REGISTER')}
        onConfirm={() => {
          setStep('ROOM');
          joinAsPlayer(student, avatar);
        }}
      />
    );
  }

  // ROOM VIEW
  if (!roomState) {
    return (
      <div className="mx-auto max-w-lg px-4 py-14 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <div className="text-base font-bold text-slate-900">
            กำลังเชื่อมต่อเข้าสู่ห้องเรียน PIN {verifiedPin}...
          </div>
          {socketError && (
            <div className="mt-4 space-y-4">
              <p className="text-sm font-medium text-red-600">{socketError}</p>
              <button
                type="button"
                onClick={() => setStep('PIN')}
                className="min-h-[42px] rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
              >
                กรอกรหัส PIN ใหม่
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (roomState.phase === 'RESULTS' && roomState.finalResults) {
    const activeDeck =
      QUIZ_DECKS.find((d) => d.id === roomState.deckId) ?? QUIZ_DECKS[0];
    return (
      <ResultsDashboard
        currentGameResults={roomState.finalResults}
        allRecordedStudents={roomState.finalResults}
        activePlayerId={playerId}
        deck={activeDeck}
        onRegisterNextStudent={onExitToHome}
        onClearHistory={onExitToHome}
      />
    );
  }

  const me = roomState.players.find((p) => p.id === playerId);

  if (roomState.phase === 'LOBBY') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <p className="text-xs font-semibold text-indigo-700">
                ห้องเรียน PIN <span className="font-mono-tabular">{roomState.pin}</span>
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                เข้าห้องสำเร็จ · รออาจารย์กดเริ่มเกม
              </h1>
              <p className="mt-1 text-sm text-slate-600">{roomState.deckTitle}</p>
            </div>
            <span className={`text-xs font-semibold ${connected ? 'text-emerald-700' : 'text-amber-700'}`}>
              {connected ? 'ออนไลน์ในห้องเรียน' : 'กำลังเชื่อมต่อใหม่...'}
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 items-center gap-8 md:grid-cols-12">
            <div className="flex flex-col items-center rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center md:col-span-5">
              <AvatarSvg config={avatar} size={132} />
              <div className="mt-4 text-xl font-bold text-slate-900">{student.nickname}</div>
              <div className="text-sm font-medium text-slate-700">{student.fullName}</div>
              <div className="font-mono-tabular mt-1 text-xs text-slate-500">
                รหัส {student.studentId}
              </div>
            </div>

            <div className="md:col-span-7">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <span>เพื่อนร่วมห้องที่เข้ามาแล้ว ({roomState.players.length} คน)</span>
                </h2>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {roomState.players.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 ${
                      p.id === playerId
                        ? 'border-indigo-300 bg-indigo-50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <AvatarSvg config={p.avatar} size={32} />
                    <span className="truncate text-xs font-semibold text-slate-800">
                      {p.student.nickname}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = roomState.question!;

  if (roomState.phase === 'PLAYING') {
    const secondsRemaining = Math.ceil(timeLeftMs / 1000);
    const progressRatio = Math.max(0, Math.min(1, timeLeftMs / (QUIZ_TIME_PER_QUESTION * 1000)));
    const hasAnswered = Boolean(me?.hasAnsweredCurrent || selectedChoice !== null);

    return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <AvatarSvg config={avatar} size={42} />
            <div>
              <div className="text-sm font-bold text-slate-900">{student.nickname}</div>
              <div className="font-mono-tabular text-xs text-slate-500">
                คะแนน {(me?.totalScore ?? 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="font-mono-tabular text-sm font-bold text-slate-800">
              ข้อที่ {q.index + 1} / {q.totalQuestions}
            </div>
            <div
              className={`flex min-w-[96px] items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 ${
                secondsRemaining <= 5
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : 'border-slate-200 bg-slate-50 text-slate-900'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span className="font-mono-tabular text-lg font-bold">{secondsRemaining} วิ</span>
            </div>
          </div>
        </div>

        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full w-full origin-left ${
              secondsRemaining <= 5 ? 'bg-red-600' : 'bg-indigo-600'
            }`}
            style={{ transform: `scaleX(${progressRatio})` }}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-7 text-center sm:p-10">
          <div className="text-xs font-semibold text-indigo-700">หมวด: {q.category}</div>
          <h2
            className="mx-auto mt-2.5 max-w-3xl text-xl font-bold text-slate-900 sm:text-3xl"
            style={{ textWrap: 'balance' }}
          >
            {q.prompt}
          </h2>
        </div>

        {hasAnswered ? (
          <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-8 text-center">
            <div className="text-lg font-bold text-indigo-950">ส่งคำตอบเรียบร้อยแล้ว</div>
            <p className="mt-1 text-sm text-indigo-800">
              รอเพื่อนร่วมห้องอีก {Math.max(0, roomState.players.length - roomState.answeredCount)} คน หรือรอหมดเวลาเพื่อดูเฉลยพร้อมกัน
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {q.options.map((opt, idx) => {
              const theme = OPTION_THEMES[idx];
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setSelectedChoice(idx);
                    submitAnswer(q.index, idx);
                  }}
                  className={`flex min-h-[96px] items-center gap-4 rounded-2xl p-5 text-left text-white shadow-sm transition-transform duration-150 active:scale-[0.985] ${theme.bg}`}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/20 text-xl font-bold">
                    {theme.shape}
                  </span>
                  <span className="flex-1 text-base font-semibold sm:text-lg">{opt}</span>
                  <span className="font-mono-tabular hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/20 text-xs font-bold sm:flex">
                    {theme.keyHint}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // REVEAL for Player
  const reveal = roomState.reveal!;
  const myAttempt = me?.lastAttempt;
  const isCorrect = myAttempt?.isCorrect ?? false;
  const isTimedOut = myAttempt?.selectedIndex === null;
  const myRank = roomState.players.findIndex((p) => p.id === playerId) + 1;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
      <div
        className={`rounded-2xl border p-6 sm:p-8 ${
          isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {isCorrect ? (
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            ) : (
              <XCircle className="h-10 w-10 text-red-600" />
            )}
            <div>
              <h2 className={`text-2xl font-bold ${isCorrect ? 'text-emerald-950' : 'text-red-950'}`}>
                {isCorrect ? 'ตอบถูกต้อง!' : isTimedOut ? 'หมดเวลาสำหรับข้อนี้' : 'ยังไม่ถูกต้อง'}
              </h2>
              <p className={`mt-0.5 text-sm ${isCorrect ? 'text-emerald-800' : 'text-red-800'}`}>
                {myAttempt
                  ? `ใช้เวลา ${myAttempt.timeTakenSec.toFixed(1)} วินาที · ได้รับ +${myAttempt.pointsEarned.toLocaleString()} คะแนน`
                  : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {(me?.currentStreak ?? 0) >= 2 && (
              <div className="flex items-center gap-1.5 text-sm font-bold text-amber-700">
                <Flame className="h-4 w-4" />
                <span className="tabular-nums">ต่อเนื่อง {me?.currentStreak} ข้อ</span>
              </div>
            )}
            <div className="text-right">
              <div className="text-xs text-slate-600">คะแนนสะสม</div>
              <div className="font-mono-tabular text-2xl font-extrabold text-slate-900">
                {(me?.totalScore ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-7">
          <div className="text-xs font-semibold text-slate-500">
            เฉลยข้อที่ {q.index + 1} / {q.totalQuestions}
          </div>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{q.prompt}</h3>
          <div className="mt-4 space-y-2">
            {q.options.map((opt, idx) => {
              const isAnswer = idx === reveal.correctIndex;
              const isChosen = idx === myAttempt?.selectedIndex;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                    isAnswer
                      ? 'border-emerald-500 bg-emerald-50 font-semibold text-emerald-950'
                      : isChosen
                        ? 'border-red-300 bg-red-50 text-red-900'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}
                >
                  <span>{opt}</span>
                  {isAnswer && <span className="text-xs font-bold text-emerald-700">คำตอบที่ถูก</span>}
                  {!isAnswer && isChosen && (
                    <span className="text-xs font-semibold text-red-700">คำตอบที่คุณเลือก</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">คำอธิบาย: </span>
            {reveal.explanation}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">อันดับห้องเรียนล่าสุด</h3>
              <span className="font-mono-tabular text-xs font-bold text-indigo-700">
                อันดับของคุณ: #{myRank}
              </span>
            </div>
            <div className="mt-4 space-y-2.5">
              {roomState.players.slice(0, 6).map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 ${
                    p.id === playerId
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono-tabular w-5 text-sm font-bold text-slate-500">
                      {idx + 1}
                    </span>
                    <AvatarSvg config={p.avatar} size={32} />
                    <span className="truncate text-sm font-semibold text-slate-900">
                      {p.student.nickname} {p.id === playerId ? '(คุณ)' : ''}
                    </span>
                  </div>
                  <span className="font-mono-tabular text-sm font-bold text-slate-900">
                    {p.totalScore.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-xs font-medium text-slate-600">
            {q.index + 1 < q.totalQuestions
              ? 'รออาจารย์กดส่งคำถามข้อถัดไป...'
              : 'รออาจารย์เปิดหน้าสรุปอันดับรวมทั้งห้อง...'}
          </div>
        </div>
      </div>
    </div>
  );
};
