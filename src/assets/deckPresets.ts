import { Deck, Flashcard } from '../types';
import { getMidnight } from '../services/srs';

export interface PresetDeckAsset {
  deck: Deck;
  cards: Omit<Flashcard, 'id' | 'deckId' | 'createdAt' | 'updatedAt' | 'dueDate' | 'interval' | 'repetition' | 'easeFactor' | 'isMistake' | 'mistakeCount' | 'correctCount' | 'reviewHistory'>[];
}

const todayMidnight = getMidnight();

export const PRESET_DECK_ASSETS: PresetDeckAsset[] = [
  {
    deck: {
      id: 'deck-preset-business-en',
      name: '商業職場英語核心片語',
      description: '會議、談判、專案管理與商業書信高頻用語',
      color: '#4F46E5',
      defaultLang: 'en-US',
      createdAt: Date.now(),
    },
    cards: [
      {
        word: 'touch base',
        phonetic: '/tʌtʃ beɪs/',
        meaning: '碰面小聊；交流一下情況',
        example: "Let's touch base next Monday regarding the project timeline.",
        exampleTranslation: '我們下週一針對專案時程交流確認一下。',
        notes: '源自棒球術語，職場极常用',
        lang: 'en-US',
        tags: ['商業', '會議', '職場'],
      },
      {
        word: 'circle back',
        phonetic: '/ˈsɜː.kəl bæk/',
        meaning: '稍後再回頭討論；過後再跟進',
        example: 'I need to check the data first, and then I will circle back with you.',
        exampleTranslation: '我需要先確認數據，之後再回頭跟你討論。',
        notes: '商務溝通高頻詞彙',
        lang: 'en-US',
        tags: ['商業', '專案'],
      },
      {
        word: 'bandwidth',
        phonetic: '/ˈbænd.wɪdθ/',
        meaning: '精力、時間或處理能力',
        example: 'I would love to help, but I do not have the bandwidth this week.',
        exampleTranslation: '我很想幫忙，但我這週真的沒有多餘的心力與時間。',
        notes: '原本指頻寬，現常用於比喻個人工作負荷能量',
        lang: 'en-US',
        tags: ['職場', '工作'],
      },
      {
        word: 'streamline',
        phonetic: '/ˈstriːm.laɪn/',
        meaning: '簡化；提高...的效率',
        example: 'We must streamline the approval workflow to reduce delays.',
        exampleTranslation: '我們必須簡化審核流程以減少拖延。',
        notes: '常用於效率提升與組織變革',
        lang: 'en-US',
        tags: ['商業', '管理'],
      },
    ],
  },
  {
    deck: {
      id: 'deck-preset-jlpt-travel',
      name: 'JLPT 日常旅行對話精華',
      description: '日本自由行點餐、問路、購物超實用會話單字',
      color: '#EC4899',
      defaultLang: 'ja-JP',
      createdAt: Date.now(),
    },
    cards: [
      {
        word: 'おすすめ',
        phonetic: 'お勧め (osusume)',
        meaning: '推薦；招牌推薦',
        example: '今日の店長のおすすめ料理は何ですか？',
        exampleTranslation: '今天店長推薦的菜色是什麼呢？',
        notes: '點餐必備首選詞',
        lang: 'ja-JP',
        tags: ['旅行', '美食', '點餐'],
      },
      {
        word: 'お会計',
        phonetic: 'おかいけい (okaikei)',
        meaning: '結帳；買單',
        example: 'すみません、お会計をお願いします。',
        exampleTranslation: '不好意思，麻煩結帳。',
        notes: '結帳時向店員示意',
        lang: 'ja-JP',
        tags: ['旅行', '結帳'],
      },
      {
        word: '手荷物',
        phonetic: 'てにもつ (tenimotsu)',
        meaning: '隨身行李；手提行李',
        example: '手荷物を預かっていただけますか？',
        exampleTranslation: '可以幫我寄放隨身行李嗎？',
        notes: '飯店與車站常見',
        lang: 'ja-JP',
        tags: ['旅行', '交通'],
      },
    ],
  },
  {
    deck: {
      id: 'deck-preset-french-lifestyle',
      name: '法語優雅生活入門',
      description: '法式日常、浪漫生活與經典社交用語',
      color: '#0EA5E9',
      defaultLang: 'fr-FR',
      createdAt: Date.now(),
    },
    cards: [
      {
        word: 'flâner',
        phonetic: '/flɑ.ne/',
        meaning: '漫無目的地漫步閒逛',
        example: "J'aime flâner le long de la Seine l'après-midi.",
        exampleTranslation: '我喜歡在午後沿著塞納河畔漫步閒逛。',
        notes: '法式浪漫生活哲學代表詞彙',
        lang: 'fr-FR',
        tags: ['法文', '生活', '浪漫'],
      },
      {
        word: 'délicieux',
        phonetic: '/de.li.sjø/',
        meaning: '美味的；精緻可口的',
        example: 'Ce croissant au beurre est absolument délicieux.',
        exampleTranslation: '這個奶油可頌真是美味極了。',
        notes: '常用於讚美料理',
        lang: 'fr-FR',
        tags: ['法文', '美食'],
      },
    ],
  },
];
