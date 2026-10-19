import React, { useState, useMemo } from 'react';
import { 
  AlertCircle, 
  BrainCircuit, 
  BookOpen, 
  Keyboard, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  TrendingDown,
  Volume2,
  Edit,
  Flame,
  ArrowUpDown
} from 'lucide-react';
import { Flashcard, Deck, QuizSettings } from '../types';
import { AudioButton } from './AudioButton';
import { LANGUAGE_OPTIONS } from '../types';

interface MistakesNotebookProps {
  cards: Flashcard[];
  decks: Deck[];
  settings: QuizSettings;
  onUpdateCard: (card: Flashcard) => void;
  onStartMistakeSRS: () => void;
  onStartMistakeChoice: () => void;
  onStartMistakeSpelling: () => void;
  onOpenCardModal: (card: Flashcard) => void;
}

export const MistakesNotebook: React.FC<MistakesNotebookProps> = ({
  cards,
  decks,
  settings,
  onUpdateCard,
  onStartMistakeSRS,
  onStartMistakeChoice,
  onStartMistakeSpelling,
  onOpenCardModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeckFilter, setSelectedDeckFilter] = useState('all');
  const [filterFrequency, setFilterFrequency] = useState<'all' | 'high' | 'recent'>('all');
  const [sortBy, setSortBy] = useState<'mistakes' | 'recent' | 'word'>('mistakes');

  // Filter mistake cards
  const mistakeCards = useMemo(() => {
    return cards.filter((c) => c.isMistake || (c.mistakeCount && c.mistakeCount > 0));
  }, [cards]);

  const filteredCards = useMemo(() => {
    let list = [...mistakeCards];

    // Deck filter
    if (selectedDeckFilter !== 'all') {
      list = list.filter((c) => c.deckId === selectedDeckFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.word.toLowerCase().includes(q) ||
          c.meaning.toLowerCase().includes(q) ||
          c.phonetic?.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Frequency filter
    if (filterFrequency === 'high') {
      list = list.filter((c) => (c.mistakeCount || 0) >= 2);
    } else if (filterFrequency === 'recent') {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      list = list.filter((c) => (c.lastMistakeAt || 0) >= oneDayAgo);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'mistakes') {
        return (b.mistakeCount || 0) - (a.mistakeCount || 0);
      }
      if (sortBy === 'recent') {
        return (b.lastMistakeAt || 0) - (a.lastMistakeAt || 0);
      }
      return a.word.localeCompare(b.word);
    });

    return list;
  }, [mistakeCards, selectedDeckFilter, searchQuery, filterFrequency, sortBy]);

  // Remove from mistakes (mark as mastered)
  const handleResolveMistake = (card: Flashcard) => {
    onUpdateCard({
      ...card,
      isMistake: false,
    });
  };

  // Clear all mistakes flags
  const handleClearAllMistakes = () => {
    if (window.confirm('確定要將所有卡片的錯題標記清除為已攻克嗎？（歷史錯誤次數仍會保留在統計中）')) {
      mistakeCards.forEach((c) => {
        onUpdateCard({
          ...c,
          isMistake: false,
        });
      });
    }
  };

  const formatTimeAgo = (timestamp?: number) => {
    if (!timestamp) return '歷史記錄';
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '剛剛';
    if (mins < 60) return `${mins} 分鐘前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} 小時前`;
    const days = Math.floor(hours / 24);
    return `${days} 天前`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top Banner / Call To Action for Mistakes Drill */}
      <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-rose-500/20 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3">
              <AlertCircle size={14} />
              專屬錯題特訓中心
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              目前有 <span className="underline decoration-white/40">{mistakeCards.length}</span> 個待攻克弱點單字
            </h1>
            <p className="text-rose-100 text-sm mt-2 leading-relaxed">
              系統已自動為您記錄所有在翻牌、測驗或拼寫時答錯的題目。針對這些錯題重複練習，能讓記憶效率提升 3 倍以上！
            </p>
          </div>

          {/* Quick Launch Buttons: "只做錯題" */}
          {mistakeCards.length > 0 && (
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <button
                onClick={onStartMistakeSRS}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-rose-700 font-bold text-sm shadow-md hover:bg-rose-50 active:scale-98 transition-all cursor-pointer"
              >
                <BrainCircuit size={18} />
                <span>錯題翻牌特訓 (SRS)</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={onStartMistakeChoice}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  <BookOpen size={15} />
                  <span>錯題選擇題</span>
                </button>
                <button
                  onClick={onStartMistakeSpelling}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Keyboard size={15} />
                  <span>錯題拼寫測驗</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 mb-6 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋錯題單字或解釋..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-rose-500 focus:bg-white transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          {/* Filter options */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Deck filter */}
            <select
              value={selectedDeckFilter}
              onChange={(e) => setSelectedDeckFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">所有卡組 ({mistakeCards.length})</option>
              {decks.map((deck) => {
                const count = mistakeCards.filter((c) => c.deckId === deck.id).length;
                return (
                  <option key={deck.id} value={deck.id}>
                    {deck.name} ({count})
                  </option>
                );
              })}
            </select>

            {/* Frequency filter pills */}
            <div className="flex rounded-xl bg-slate-100 p-0.5 dark:bg-slate-800">
              <button
                onClick={() => setFilterFrequency('all')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  filterFrequency === 'all'
                    ? 'bg-white text-rose-700 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterFrequency('high')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  filterFrequency === 'high'
                    ? 'bg-white text-rose-700 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                高頻錯題 (≥2次)
              </button>
              <button
                onClick={() => setFilterFrequency('recent')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  filterFrequency === 'recent'
                    ? 'bg-white text-rose-700 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                24小時內出錯
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="mistakes">按出錯次數排序</option>
              <option value="recent">按最近出錯時間</option>
              <option value="word">按單字字母排序</option>
            </select>

            {/* Clear All Mistakes Button */}
            {mistakeCards.length > 0 && (
              <button
                onClick={handleClearAllMistakes}
                title="將目前錯題全部標記為已掌握"
                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer dark:hover:bg-rose-950/40"
              >
                全部標記已攻克
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredCards.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center dark:bg-slate-900 dark:border-slate-800">
          <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            太棒了！無符合條件的錯題
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6 dark:text-slate-400">
            {searchQuery
              ? '沒有找到符合搜尋條件的錯題。'
              : '你目前沒有累積的錯題記錄，代表記憶效果極佳！繼續保持！'}
          </p>
        </div>
      ) : (
        /* Mistake Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => {
            const cardDeck = decks.find((d) => d.id === card.deckId);
            const langOption = LANGUAGE_OPTIONS.find((l) => l.code === card.lang);

            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between dark:bg-slate-900 dark:border-slate-800 relative group"
              >
                {/* Card Top: Deck + Mistake Counter badge */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {cardDeck && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white"
                          style={{ backgroundColor: cardDeck.color }}
                        >
                          {cardDeck.name}
                        </span>
                      )}
                      {langOption && (
                        <span className="text-xs">{langOption.flag}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
                        <Flame size={12} className="text-rose-500 fill-rose-500" />
                        錯了 {card.mistakeCount} 次
                      </span>
                    </div>
                  </div>

                  {/* Word & Phonetic */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {card.word}
                      </h3>
                      {card.phonetic && (
                        <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {card.phonetic}
                        </p>
                      )}
                    </div>

                    <AudioButton
                      text={card.word}
                      lang={card.lang}
                      rate={settings.speechRate}
                      size="sm"
                    />
                  </div>

                  {/* Meaning */}
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    {card.meaning}
                  </p>

                  {/* Example sentence */}
                  {card.example && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800 dark:text-slate-400 mb-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {card.example}
                      </div>
                      {card.exampleTranslation && (
                        <div className="text-slate-500 mt-0.5">
                          {card.exampleTranslation}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {card.notes && (
                    <p className="text-[11px] text-amber-700 bg-amber-50/70 px-2 py-1 rounded-lg border border-amber-100 mb-3 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300">
                      💡 {card.notes}
                    </p>
                  )}
                </div>

                {/* Card Footer: Last error time & Resolve Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between dark:border-slate-800 text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {formatTimeAgo(card.lastMistakeAt)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenCardModal(card)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="編輯單字"
                    >
                      <Edit size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleResolveMistake(card)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200 transition-all cursor-pointer dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300"
                      title="標記已掌握，從錯題本中移除"
                    >
                      <CheckCircle2 size={13} />
                      <span>已攻克</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
