export type SupportedLanguage = 
  | 'auto'
  | 'en-US'
  | 'en-GB'
  | 'ja-JP'
  | 'ko-KR'
  | 'es-ES'
  | 'fr-FR'
  | 'de-DE'
  | 'it-IT'
  | 'zh-TW'
  | 'zh-CN'
  | 'vi-VN'
  | 'pt-BR'
  | 'ru-RU';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  defaultVoicePrefix?: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en-US', name: '英文 (美國)', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: '英文 (英國)', nativeName: 'English (UK)', flag: '🇬🇧' },
  { code: 'ja-JP', name: '日文', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko-KR', name: '韓文', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'es-ES', name: '西班牙文', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: '法文', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: '德文', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-IT', name: '義大利文', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'zh-CN', name: '簡體中文', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'vi-VN', name: '越南文', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'pt-BR', name: '葡萄牙文', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ru-RU', name: '俄文', nativeName: 'Русский', flag: '🇷🇺' },
];

export interface ReviewHistoryItem {
  date: number;
  rating: number; // 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
  type: 'srs' | 'quiz' | 'spelling' | 'mistake-drill';
}

export interface Flashcard {
  id: string;
  word: string;
  phonetic?: string;
  meaning: string;
  example?: string;
  exampleTranslation?: string;
  notes?: string;
  lang: string; // e.g. 'en-US', 'ja-JP'
  deckId: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;

  // SM-2 Spaced Repetition System fields
  interval: number; // In days
  repetition: number; // Consecutive successful reviews
  easeFactor: number; // Default 2.5
  dueDate: number; // Timestamp of next review (start of day)
  lastReviewedAt?: number;

  // Mistake Notebook & Stats
  isMistake: boolean; // Currently flagged in mistake notebook
  mistakeCount: number; // Lifetime wrong answers
  lastMistakeAt?: number;
  correctCount: number;
  reviewHistory: ReviewHistoryItem[];
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  color: string;
  defaultLang: string;
  createdAt: number;
}

export type QuizType = 'flashcard' | 'choice' | 'spelling';

export interface QuizSettings {
  autoPronounce: boolean;
  speechRate: number; // 0.7 - 1.3
  audioQuiz: boolean; // Hide word initially in choice quiz to test listening
  direction: 'word-to-meaning' | 'meaning-to-word' | 'random';
  maxCardsPerSession: number;
  shuffle: boolean;
}

export interface StudySessionSummary {
  total: number;
  correct: number;
  mistakes: number;
  cardsPracticed: Flashcard[];
}
