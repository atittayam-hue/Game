import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { AvatarBuilder } from './components/AvatarBuilder';
import { HomeHub } from './components/HomeHub';
import { HostArena } from './components/HostArena';
import { PlayerLiveArena } from './components/PlayerLiveArena';
import { QuizArena } from './components/QuizArena';
import { RegistrationForm } from './components/RegistrationForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { DEFAULT_AVATAR } from './data/avatarOptions';
import { QUIZ_DECKS } from './data/quizzes';
import {
  AppMode,
  AvatarConfig,
  GamePhase,
  ParticipantResult,
  StudentInfo,
} from './types/game';
import { soundFX } from './utils/sound';

const STORAGE_KEY = 'kahoot_student_results_v1';

const EMPTY_STUDENT: StudentInfo = {
  studentId: '',
  fullName: '',
  nickname: '',
  faculty: '',
  major: '',
  year: 'ปี 1',
  section: 'Sec 01',
};

function getInitialPinFromUrl(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const rawPin = params.get('pin') ?? '';
  const cleaned = rawPin.replace(/\D/g, '').slice(0, 6);
  return cleaned.length === 6 ? cleaned : '';
}

export default function App() {
  const initialUrlPin = getInitialPinFromUrl();

  const [mode, setMode] = useState<AppMode>(initialUrlPin ? 'PLAYER' : 'HOME');
  const [joinPin, setJoinPin] = useState<string>(initialUrlPin);

  // Solo Practice states
  const [soloPhase, setSoloPhase] = useState<GamePhase>('REGISTER');
  const [student, setStudent] = useState<StudentInfo>(EMPTY_STUDENT);
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [selectedDeckId, setSelectedDeckId] = useState<string>(QUIZ_DECKS[0].id);
  const [includePeers, setIncludePeers] = useState<boolean>(true);
  const [muted, setMuted] = useState<boolean>(false);

  const [recordedStudents, setRecordedStudents] = useState<ParticipantResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage read errors
    }
    return [];
  });

  const [currentGameResults, setCurrentGameResults] = useState<ParticipantResult[]>([]);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [arenaKey, setArenaKey] = useState<number>(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recordedStudents));
    } catch {
      // Ignore storage write errors
    }
  }, [recordedStudents]);

  const activeDeck = QUIZ_DECKS.find((d) => d.id === selectedDeckId) ?? QUIZ_DECKS[0];

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundFX.muted = next;
    if (!next) {
      soundFX.playClick();
    }
  };

  const handleStudentSubmit = (info: StudentInfo) => {
    setStudent(info);
    setSoloPhase('AVATAR');
  };

  const handleAvatarConfirmed = () => {
    setArenaKey((k) => k + 1);
    setSoloPhase('LOBBY');
  };

  const handleCompleteSoloGame = (
    playerResult: ParticipantResult,
    peerResults: ParticipantResult[]
  ) => {
    const roundResults = [playerResult, ...peerResults];
    setCurrentGameResults(roundResults);
    setActivePlayerId(playerResult.id);
    setRecordedStudents((prev) => [playerResult, ...prev]);
    setSoloPhase('RESULTS');
  };

  const handlePlayAgainSameStudent = () => {
    setArenaKey((k) => k + 1);
    setSoloPhase('LOBBY');
  };

  const handleRegisterNextStudent = () => {
    setStudent(EMPTY_STUDENT);
    setAvatar(DEFAULT_AVATAR);
    setSoloPhase('REGISTER');
  };

  const handleClearHistory = () => {
    setRecordedStudents([]);
    setCurrentGameResults([]);
    setActivePlayerId(null);
    setSoloPhase('REGISTER');
  };

  const handleSwitchMode = (nextMode: AppMode) => {
    soundFX.playClick();
    if (nextMode !== 'PLAYER') {
      setJoinPin('');
    }
    setMode(nextMode);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F6FA] text-slate-900">
      {/* Top Bar: 3-Zone Contract */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-4 sm:px-6">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleSwitchMode('HOME')}
            className="font-display text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Kahoot Classroom
          </button>

          {/* Zone 2: Concise Single-line Navigation Links */}
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <button
              type="button"
              onClick={() => handleSwitchMode('HOME')}
              className={`transition-colors whitespace-nowrap shrink-0 ${
                mode === 'HOME'
                  ? 'font-semibold text-indigo-700 underline decoration-2 underline-offset-8'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              หน้าหลัก
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('PLAYER')}
              className={`transition-colors whitespace-nowrap shrink-0 ${
                mode === 'PLAYER'
                  ? 'font-semibold text-indigo-700 underline decoration-2 underline-offset-8'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              เข้าร่วมด้วย PIN
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('HOST')}
              className={`transition-colors whitespace-nowrap shrink-0 ${
                mode === 'HOST'
                  ? 'font-semibold text-indigo-700 underline decoration-2 underline-offset-8'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              เปิดห้อง (Host)
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('SOLO')}
              className={`transition-colors whitespace-nowrap shrink-0 ${
                mode === 'SOLO'
                  ? 'font-semibold text-indigo-700 underline decoration-2 underline-offset-8'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              โหมดฝึกซ้อม
            </button>
          </nav>

          {/* Zone 3: Single Primary Utility Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleToggleMute}
              className="flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              {muted ? (
                <VolumeX className="h-4 w-4 text-slate-500" />
              ) : (
                <Volume2 className="h-4 w-4 text-indigo-600" />
              )}
              <span>{muted ? 'ปิดเสียงอยู่' : 'เปิดเสียงเอฟเฟกต์'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="flex-1">
        {mode === 'HOME' && (
          <HomeHub
            onSelectHost={() => handleSwitchMode('HOST')}
            onJoinWithPin={(pin) => {
              setJoinPin(pin);
              setMode('PLAYER');
            }}
            onSelectSolo={() => handleSwitchMode('SOLO')}
          />
        )}

        {mode === 'HOST' && (
          <HostArena onExitToHome={() => handleSwitchMode('HOME')} />
        )}

        {mode === 'PLAYER' && (
          <PlayerLiveArena
            key={joinPin || 'manual'}
            initialPin={joinPin}
            onExitToHome={() => handleSwitchMode('HOME')}
          />
        )}

        {mode === 'SOLO' && (
          <>
            {soloPhase === 'REGISTER' && (
              <RegistrationForm
                initialStudent={student}
                recordedStudentsCount={recordedStudents.length}
                onSubmit={handleStudentSubmit}
                onOpenExistingResults={
                  recordedStudents.length > 0
                    ? () => setSoloPhase('RESULTS')
                    : undefined
                }
              />
            )}

            {soloPhase === 'AVATAR' && (
              <AvatarBuilder
                student={student}
                avatar={avatar}
                selectedDeckId={selectedDeckId}
                onChangeAvatar={setAvatar}
                onChangeDeck={setSelectedDeckId}
                onBack={() => setSoloPhase('REGISTER')}
                onConfirm={handleAvatarConfirmed}
              />
            )}

            {(soloPhase === 'LOBBY' ||
              soloPhase === 'PLAYING' ||
              soloPhase === 'REVEAL') && (
              <QuizArena
                key={arenaKey}
                student={student}
                avatar={avatar}
                deck={activeDeck}
                includePeers={includePeers}
                onTogglePeers={setIncludePeers}
                onBackToAvatar={() => setSoloPhase('AVATAR')}
                onCompleteGame={handleCompleteSoloGame}
              />
            )}

            {soloPhase === 'RESULTS' && (
              <ResultsDashboard
                currentGameResults={currentGameResults}
                allRecordedStudents={recordedStudents}
                activePlayerId={activePlayerId}
                deck={activeDeck}
                onPlayAgainSameStudent={handlePlayAgainSameStudent}
                onRegisterNextStudent={handleRegisterNextStudent}
                onClearHistory={handleClearHistory}
              />
            )}
          </>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 text-xs text-slate-500 sm:px-6">
          <span>Kahoot Classroom Quiz · ระบบตอบคำถามห้องเรียนแบบเรียลไทม์</span>
          <span className="tabular-nums">5 คำถาม · ข้อละ 20 วินาที · ส่งออก CSV (UTF-8)</span>
        </div>
      </footer>
    </div>
  );
}
