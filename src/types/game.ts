export type GamePhase =
  | 'REGISTER'
  | 'AVATAR'
  | 'LOBBY'
  | 'PLAYING'
  | 'REVEAL'
  | 'RESULTS';

export type AppMode = 'HOME' | 'HOST' | 'PLAYER' | 'SOLO';

export type RoomPhase = 'LOBBY' | 'PLAYING' | 'REVEAL' | 'RESULTS';

export interface StudentInfo {
  studentId: string;
  fullName: string;
  nickname: string;
  faculty: string;
  major: string;
  year: string;
  section: string;
}

export type HairStyle =
  | 'short'
  | 'sidePart'
  | 'curly'
  | 'bob'
  | 'long'
  | 'ponytail'
  | 'spiky'
  | 'bun';

export type EyeStyle =
  | 'normal'
  | 'happy'
  | 'focused'
  | 'sparkle'
  | 'wink';

export type AccessoryStyle =
  | 'none'
  | 'roundGlasses'
  | 'squareGlasses'
  | 'headphones'
  | 'gradCap'
  | 'headband';

export type OutfitStyle =
  | 'tshirt'
  | 'polo'
  | 'hoodie'
  | 'blazer'
  | 'varsity';

export interface AvatarConfig {
  bgColor: string;
  skinColor: string;
  hairStyle: HairStyle;
  hairColor: string;
  eyeStyle: EyeStyle;
  accessory: AccessoryStyle;
  outfitStyle: OutfitStyle;
  outfitColor: string;
}

export interface StudentProfile {
  id: string;
  student: StudentInfo;
  avatar: AvatarConfig;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  category: string;
}

export interface QuizDeck {
  id: string;
  title: string;
  subtitle: string;
  questions: [QuizQuestion, QuizQuestion, QuizQuestion, QuizQuestion, QuizQuestion];
}

export interface QuestionAttempt {
  questionId: string;
  questionNumber: number;
  selectedIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
  timeTakenSec: number;
  pointsEarned: number;
}

export interface ParticipantResult {
  id: string;
  isSimulated: boolean;
  student: StudentInfo;
  avatar: AvatarConfig;
  deckId: string;
  deckTitle: string;
  totalScore: number;
  correctCount: number;
  totalQuestions: number;
  accuracyPercent: number;
  avgTimeSec: number;
  maxStreak: number;
  attempts: QuestionAttempt[];
  completedAt: string;
}

export interface RoomPlayerPublic {
  id: string;
  student: StudentInfo;
  avatar: AvatarConfig;
  totalScore: number;
  correctCount: number;
  currentStreak: number;
  maxStreak: number;
  connected: boolean;
  hasAnsweredCurrent: boolean;
  lastAttempt: QuestionAttempt | null;
}

export interface RoomQuestionPublic {
  index: number;
  totalQuestions: number;
  id: string;
  category: string;
  prompt: string;
  options: [string, string, string, string];
  timeLimitSec: number;
  endsAtMs: number;
}

export interface RoomRevealPayload {
  questionIndex: number;
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  optionCounts: [number, number, number, number];
}

export interface RoomStateSnapshot {
  pin: string;
  deckId: string;
  deckTitle: string;
  deckSubtitle: string;
  phase: RoomPhase;
  currentQuestionIndex: number;
  totalQuestions: number;
  serverNowMs: number;
  players: RoomPlayerPublic[];
  answeredCount: number;
  question: RoomQuestionPublic | null;
  reveal: RoomRevealPayload | null;
  finalResults: ParticipantResult[] | null;
}
