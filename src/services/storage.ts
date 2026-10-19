import { Flashcard, Deck, QuizSettings } from '../types';
import { getMidnight } from './srs';

const STORAGE_KEYS = {
  CARDS: 'vocabflow_cards_v1',
  DECKS: 'vocabflow_decks_v1',
  SETTINGS: 'vocabflow_settings_v1',
  STREAK: 'vocabflow_streak_v1',
};

export const DEFAULT_SETTINGS: QuizSettings = {
  autoPronounce: true,
  speechRate: 0.95,
  audioQuiz: false,
  direction: 'word-to-meaning',
  maxCardsPerSession: 20,
  shuffle: true,
};

export const INITIAL_DECKS: Deck[] = [
  {
    id: 'deck-en-advanced',
    name: '精選實用高頻英文',
    description: '日常生活、閱讀與考試必備優質詞彙與片語',
    color: '#3B82F6', // Blue
    defaultLang: 'en-US',
    createdAt: Date.now() - 7 * 86400000,
  },
  {
    id: 'deck-ja-daily',
    name: '實用日語生活詞彙',
    description: '日語日常對話、唯美意境詞與動漫常用詞',
    color: '#EC4899', // Pink
    defaultLang: 'ja-JP',
    createdAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'deck-es-travel',
    name: '旅行西班牙語與基礎',
    description: '西班牙文初學常用句與旅行問路單字',
    color: '#F59E0B', // Amber
    defaultLang: 'es-ES',
    createdAt: Date.now() - 3 * 86400000,
  },
];

const now = Date.now();
const todayMidnight = getMidnight(now);

export const INITIAL_CARDS: Flashcard[] = [
  // English cards
  {
    id: 'card-en-1',
    word: 'serendipity',
    phonetic: '/ˌser.ənˈdɪp.ə.ti/',
    meaning: '意外發現的美好事物；機緣巧合',
    example: 'Finding this peaceful bookshop was pure serendipity.',
    exampleTranslation: '偶然發現這家安靜的書店真是個美好的巧合。',
    notes: '源自英國作家 Horace Walpole 的童話《錫蘭三王子》',
    lang: 'en-US',
    deckId: 'deck-en-advanced',
    tags: ['高級詞彙', '寫作'],
    createdAt: now - 3 * 86400000,
    updatedAt: now - 3 * 86400000,
    interval: 1,
    repetition: 0,
    easeFactor: 2.5,
    dueDate: todayMidnight, // Due today!
    isMistake: true, // Marked as mistake initially so user can test the mistake drill!
    mistakeCount: 2,
    correctCount: 1,
    lastMistakeAt: now - 86400000,
    reviewHistory: [{ date: now - 86400000, rating: 1, type: 'srs' }],
  },
  {
    id: 'card-en-2',
    word: 'ubiquitous',
    phonetic: '/juːˈbɪk.wə.təs/',
    meaning: '無所不在的；普遍存在的',
    example: 'Smartphones have become ubiquitous in modern daily life.',
    exampleTranslation: '智慧型手機在現代日常生活中已經無所不在。',
    notes: '同義詞：omnipresent, pervasive',
    lang: 'en-US',
    deckId: 'deck-en-advanced',
    tags: ['學術', '科技'],
    createdAt: now - 4 * 86400000,
    updatedAt: now - 4 * 86400000,
    interval: 3,
    repetition: 2,
    easeFactor: 2.5,
    dueDate: todayMidnight,
    isMistake: false,
    mistakeCount: 0,
    correctCount: 2,
    reviewHistory: [{ date: now - 4 * 86400000, rating: 3, type: 'srs' }],
  },
  {
    id: 'card-en-3',
    word: 'ephemeral',
    phonetic: '/ɪˈfem.ər.əl/',
    meaning: '短暫的；轉瞬即逝的',
    example: 'Fame in the internet age can be quite ephemeral.',
    exampleTranslation: '網路時代的名氣可能非常短暫。',
    notes: '同義詞：transient, fleeting',
    lang: 'en-US',
    deckId: 'deck-en-advanced',
    tags: ['文學', '哲思'],
    createdAt: now - 5 * 86400000,
    updatedAt: now - 5 * 86400000,
    interval: 6,
    repetition: 3,
    easeFactor: 2.6,
    dueDate: todayMidnight + 2 * 86400000,
    isMistake: false,
    mistakeCount: 1,
    correctCount: 3,
    reviewHistory: [{ date: now - 86400000, rating: 4, type: 'srs' }],
  },
  {
    id: 'card-en-4',
    word: 'resilience',
    phonetic: '/rɪˈzɪl.jəns/',
    meaning: '韌性；恢復力；適應力',
    example: 'She showed remarkable resilience after facing adversity.',
    exampleTranslation: '面對逆境後，她展現了非凡的心理韌性。',
    notes: '形容詞為 resilient',
    lang: 'en-US',
    deckId: 'deck-en-advanced',
    tags: ['心理', '心態'],
    createdAt: now - 2 * 86400000,
    updatedAt: now - 2 * 86400000,
    interval: 1,
    repetition: 0,
    easeFactor: 2.3,
    dueDate: todayMidnight,
    isMistake: true,
    mistakeCount: 3,
    correctCount: 0,
    lastMistakeAt: now - 2 * 86400000,
    reviewHistory: [{ date: now - 2 * 86400000, rating: 1, type: 'srs' }],
  },

  // Japanese cards
  {
    id: 'card-ja-1',
    word: '木漏れ日',
    phonetic: 'こもれび (komorebi)',
    meaning: '透過樹葉縫隙灑落的陽光',
    example: '森の中を歩きながら、美しい木漏れ日を眺めた。',
    exampleTranslation: '漫步在森林中，欣賞著美麗的林間日光。',
    notes: '日語獨特的意境美詞，難以用單一英文單字直譯',
    lang: 'ja-JP',
    deckId: 'deck-ja-daily',
    tags: ['美詞', '自然'],
    createdAt: now - 2 * 86400000,
    updatedAt: now - 2 * 86400000,
    interval: 2,
    repetition: 1,
    easeFactor: 2.5,
    dueDate: todayMidnight,
    isMistake: false,
    mistakeCount: 0,
    correctCount: 1,
    reviewHistory: [{ date: now - 2 * 86400000, rating: 3, type: 'srs' }],
  },
  {
    id: 'card-ja-2',
    word: '一期一会',
    phonetic: 'いちごいちえ (ichigo ichie)',
    meaning: '一期一會；一生僅有一次的相遇，當珍視珍惜',
    example: '人との出会いは一期一会だから、大切にしたい。',
    exampleTranslation: '人與人的相逢是一期一會，所以要好好珍惜。',
    notes: '源自茶道大師千利休之哲學',
    lang: 'ja-JP',
    deckId: 'deck-ja-daily',
    tags: ['成語', '哲學'],
    createdAt: now - 3 * 86400000,
    updatedAt: now - 3 * 86400000,
    interval: 1,
    repetition: 0,
    easeFactor: 2.4,
    dueDate: todayMidnight,
    isMistake: true,
    mistakeCount: 1,
    correctCount: 1,
    lastMistakeAt: now - 86400000,
    reviewHistory: [{ date: now - 86400000, rating: 1, type: 'srs' }],
  },
  {
    id: 'card-ja-3',
    word: '懐かしい',
    phonetic: 'なつかしい (natsukashii)',
    meaning: '令人懷念的；令人想起舊日時光的',
    example: 'この曲を聴くと、学生時代が懐かしくなる。',
    exampleTranslation: '一聽到這首歌，就令人懷念起學生時代。',
    notes: '動詞形式為 懐かしむ',
    lang: 'ja-JP',
    deckId: 'deck-ja-daily',
    tags: ['情緒', '日常'],
    createdAt: now - 1 * 86400000,
    updatedAt: now - 1 * 86400000,
    interval: 4,
    repetition: 2,
    easeFactor: 2.5,
    dueDate: todayMidnight + 86400000,
    isMistake: false,
    mistakeCount: 0,
    correctCount: 2,
    reviewHistory: [{ date: now - 86400000, rating: 4, type: 'srs' }],
  },

  // Spanish cards
  {
    id: 'card-es-1',
    word: 'mariposa',
    phonetic: '[ma.ɾiˈpo.sa]',
    meaning: '蝴蝶',
    example: 'Hay una mariposa azul en el jardín de flores.',
    exampleTranslation: '花園裡有一隻藍色的蝴蝶。',
    notes: '陰性名詞 (la mariposa)',
    lang: 'es-ES',
    deckId: 'deck-es-travel',
    tags: ['動物', '基礎'],
    createdAt: now - 4 * 86400000,
    updatedAt: now - 4 * 86400000,
    interval: 1,
    repetition: 0,
    easeFactor: 2.5,
    dueDate: todayMidnight,
    isMistake: false,
    mistakeCount: 0,
    correctCount: 1,
    reviewHistory: [{ date: now - 4 * 86400000, rating: 3, type: 'srs' }],
  },
  {
    id: 'card-es-2',
    word: 'despacio',
    phonetic: '[desˈpa.sjo]',
    meaning: '慢速地；慢慢來',
    example: 'Por favor, ¿puedes hablar más despacio?',
    exampleTranslation: '拜託，你可以說得更慢一點嗎？',
    notes: '旅行求助必備短語！',
    lang: 'es-ES',
    deckId: 'deck-es-travel',
    tags: ['旅遊', '日常'],
    createdAt: now - 2 * 86400000,
    updatedAt: now - 2 * 86400000,
    interval: 1,
    repetition: 0,
    easeFactor: 2.2,
    dueDate: todayMidnight,
    isMistake: true,
    mistakeCount: 2,
    correctCount: 0,
    lastMistakeAt: now - 86400000,
    reviewHistory: [{ date: now - 86400000, rating: 1, type: 'srs' }],
  },
];

export interface StreakInfo {
  currentStreak: number;
  lastStudiedDate: string; // YYYY-MM-DD
  totalDaysStudied: number;
}

export function loadCards(): Flashcard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CARDS);
    if (!raw) {
      saveCards(INITIAL_CARDS);
      return INITIAL_CARDS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load cards from localStorage:', err);
    return INITIAL_CARDS;
  }
}

export function saveCards(cards: Flashcard[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  } catch (err) {
    console.error('Failed to save cards to localStorage:', err);
  }
}

export function loadDecks(): Deck[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DECKS);
    if (!raw) {
      saveDecks(INITIAL_DECKS);
      return INITIAL_DECKS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load decks from localStorage:', err);
    return INITIAL_DECKS;
  }
}

export function saveDecks(decks: Deck[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
  } catch (err) {
    console.error('Failed to save decks to localStorage:', err);
  }
}

export function loadSettings(): QuizSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to load settings:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: QuizSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function loadStreak(): StreakInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    if (!raw) return { currentStreak: 1, lastStudiedDate: '', totalDaysStudied: 1 };
    return JSON.parse(raw);
  } catch {
    return { currentStreak: 1, lastStudiedDate: '', totalDaysStudied: 1 };
  }
}

export function recordStudyActivity(): StreakInfo {
  const streak = loadStreak();
  const todayStr = new Date().toISOString().split('T')[0];

  if (streak.lastStudiedDate === todayStr) {
    return streak; // already counted for today
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  let newCurrent = streak.currentStreak;

  if (streak.lastStudiedDate === yesterday) {
    newCurrent += 1;
  } else if (!streak.lastStudiedDate) {
    newCurrent = 1;
  } else {
    // missed one day
    newCurrent = 1;
  }

  const updated: StreakInfo = {
    currentStreak: newCurrent,
    lastStudiedDate: todayStr,
    totalDaysStudied: (streak.totalDaysStudied || 0) + 1,
  };

  try {
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(updated));
  } catch (err) {
    console.error(err);
  }
  return updated;
}
