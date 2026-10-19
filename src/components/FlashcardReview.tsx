import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Volume2, 
  RotateCw, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  Flame, 
  AlertCircle,
  Tag,
  Shuffle,
  Eye,
  Check,
  Repeat
} from 'lucide-react';
import { Flashcard, Deck, QuizSettings } from '../types';
import { calculateSRS, getIntervalPreview } from '../services/srs';
import { AudioButton } from './AudioButton';
import { tts } from '../services/tts';
import { LANGUAGE_OPTIONS } from '../types';
import { sounds, ASSET_IMAGES } from '../assets';

interface FlashcardReviewProps {
  cards: Flashcard[];
  decks: Deck[];
  settings: QuizSettings;
  onUpdateCard: (card: Flashcard) => void;
  onCompleteSession: () => void;
  onOpenCardModal: (card: Flashcard) => void;
  filterMode?: 'due' | 'all' | 'mistakes';
  selectedDeckId?: string;
  onStartMistakeDrill?: () => void;
}

export const FlashcardReview: React.FC<FlashcardReviewProps> = ({
  cards,
  decks,
  settings,
  onUpdateCard,
  onCompleteSession,
  onOpenCardModal,
  filterMode = 'due',
  selectedDeckId,
  onStartMistakeDrill,
}) => {
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  // Prepare cards based on mode
  useEffect(() => {
    let pool = [...cards];

    if (selectedDeckId && selectedDeckId !== 'all') {
      pool = pool.filter((c) => c.deckId === selectedDeckId);
    }

    if (filterMode === 'due') {
      const now = Date.now();
      pool = pool.filter((c) => c.dueDate <= now);
    } else if (filterMode === 'mistakes') {
      pool = pool.filter((c) => c.isMistake || c.mistakeCount > 0);
    }

    if (settings.shuffle) {
      pool.sort(() => Math.random() - 0.5);
    }

    const limited = pool.slice(0, settings.maxCardsPerSession || 30);
    setSessionCards(limited);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setIsFinished(false);
    setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 });
  }, [cards, filterMode, selectedDeckId, settings.shuffle, settings.maxCardsPerSession]);

  const currentCard = sessionCards[currentIndex];

  // Auto pronounce front card word when card appears
  useEffect(() => {
    if (currentCard && settings.autoPronounce && !isFlipped) {
      tts.speak(currentCard.word, currentCard.lang, settings.speechRate);
    }
  }, [currentIndex, isFlipped, currentCard, settings.autoPronounce, settings.speechRate]);

  const handleFlip = useCallback(() => {
    sounds.playFlip();
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRating = useCallback(
    (rating: 1 | 2 | 3 | 4) => {
      if (!currentCard) return;

      const reviewType = filterMode === 'mistakes' ? 'mistake-drill' : 'srs';
      const srsUpdate = calculateSRS(currentCard, rating, reviewType);

      // If user is doing mistake drill and answered Good or Easy, give option to mark mistake as resolved
      let updatedIsMistake = srsUpdate.isMistake;
      if (filterMode === 'mistakes' && (rating === 3 || rating === 4)) {
        updatedIsMistake = false; // resolved!
      }

      const updatedCard: Flashcard = {
        ...currentCard,
        interval: srsUpdate.interval,
        repetition: srsUpdate.repetition,
        easeFactor: srsUpdate.easeFactor,
        dueDate: srsUpdate.dueDate,
        isMistake: updatedIsMistake,
        mistakeCount: srsUpdate.mistakeCount,
        correctCount: srsUpdate.correctCount,
        lastMistakeAt: srsUpdate.lastMistakeAt,
        lastReviewedAt: Date.now(),
        reviewHistory: [...(currentCard.reviewHistory || []), srsUpdate.historyItem],
      };

      onUpdateCard(updatedCard);

      setSessionStats((prev) => ({
        ...prev,
        again: rating === 1 ? prev.again + 1 : prev.again,
        hard: rating === 2 ? prev.hard + 1 : prev.hard,
        good: rating === 3 ? prev.good + 1 : prev.good,
        easy: rating === 4 ? prev.easy + 1 : prev.easy,
      }));

      // Next card or finish
      if (currentIndex + 1 < sessionCards.length) {
        setIsFlipped(false);
        setShowHint(false);
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsFinished(true);
        sounds.playComplete();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        onCompleteSession();
      }
    },
    [currentCard, filterMode, currentIndex, sessionCards.length, onUpdateCard, onCompleteSession]
  );

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'r' || e.key === 'R') {
        if (currentCard) {
          tts.speak(currentCard.word, currentCard.lang, settings.speechRate);
        }
      } else if (isFlipped) {
        if (e.key === '1') handleRating(1);
        if (e.key === '2') handleRating(2);
        if (e.key === '3') handleRating(3);
        if (e.key === '4') handleRating(4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleRating, isFlipped, currentCard, settings.speechRate]);

  const deck = decks.find((d) => d.id === currentCard?.deckId);
  const langMeta = LANGUAGE_OPTIONS.find((l) => l.code === currentCard?.lang);

  // When no cards in review pool
  if (sessionCards.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 text-center p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800 animate-in fade-in">
        <div className="w-28 h-24 mx-auto mb-3">
          <img
            src={ASSET_IMAGES.emptyCards}
            alt="Cards Completed"
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {filterMode === 'mistakes' ? '太棒了！目前沒有未解決的錯題' : '今日待複習已全部完成！'}
        </h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6 dark:text-slate-400">
          {filterMode === 'mistakes'
            ? '所有標記的錯題都已攻克，或者你可以在單字列表中標記卡片進行特訓。'
            : '你的大腦記憶正在牢固建立中。想超前學習或挑戰測驗嗎？'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              // Reload all cards
              const all = [...cards].sort(() => Math.random() - 0.5);
              setSessionCards(all.slice(0, 20));
              setCurrentIndex(0);
              setIsFinished(false);
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors cursor-pointer dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            自由瀏覽複習 (全部單字)
          </button>
          {cards.some((c) => c.mistakeCount > 0) && (
            <button
              onClick={onStartMistakeDrill}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-semibold border border-rose-200/80 transition-colors cursor-pointer dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
            >
              複習歷史錯題 ({cards.filter((c) => c.mistakeCount > 0).length})
            </button>
          )}
        </div>
      </div>
    );
  }

  // Session Finished Summary
  if (isFinished) {
    const total = sessionCards.length;
    return (
      <div className="max-w-lg mx-auto my-8 p-8 bg-white rounded-3xl border border-slate-200/80 shadow-md text-center dark:bg-slate-900 dark:border-slate-800 animate-in fade-in duration-300">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-800 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-300/30">
          <Sparkles size={36} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
          本輪複習大功告成！
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          已成功複習 {total} 張單字卡，記憶間隔已自動為您重新計算
        </p>

        {/* Stats breakdown */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 dark:bg-rose-950/30 dark:border-rose-900">
            <span className="block text-xl font-bold text-rose-600 dark:text-rose-400">
              {sessionStats.again}
            </span>
            <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">忘記了</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 dark:bg-amber-950/30 dark:border-amber-900">
            <span className="block text-xl font-bold text-amber-600 dark:text-amber-400">
              {sessionStats.hard}
            </span>
            <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">困難</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 dark:bg-blue-950/30 dark:border-blue-900">
            <span className="block text-xl font-bold text-blue-600 dark:text-blue-400">
              {sessionStats.good}
            </span>
            <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">良好</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900">
            <span className="block text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {sessionStats.easy}
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">熟練</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {sessionStats.again > 0 && (
            <button
              onClick={() => {
                // Restart with just again cards
                const againCards = sessionCards.filter((c) => c.isMistake);
                if (againCards.length > 0) {
                  setSessionCards(againCards);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setIsFinished(false);
                }
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Repeat size={16} />
              立即重練本輪錯題 ({sessionStats.again})
            </button>
          )}

          <button
            onClick={() => {
              // Restart all
              const pool = [...cards].sort(() => Math.random() - 0.5);
              setSessionCards(pool.slice(0, 20));
              setCurrentIndex(0);
              setIsFlipped(false);
              setIsFinished(false);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            再來一輪
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / sessionCards.length) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Top Header & Progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {deck && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full text-white shadow-xs"
              style={{ backgroundColor: deck.color }}
            >
              {deck.name}
            </span>
          )}
          {filterMode === 'mistakes' && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
              <AlertCircle size={12} />
              錯題專攻模式
            </span>
          )}
          {langMeta && (
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>{langMeta.flag}</span>
              <span>{langMeta.name}</span>
            </span>
          )}
        </div>

        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          進度 <span className="text-indigo-600 font-bold dark:text-indigo-400">{currentIndex + 1}</span> / {sessionCards.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden dark:bg-slate-800">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-300 dark:bg-indigo-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Flashcard Container */}
      <div
        onClick={handleFlip}
        className="relative w-full min-h-[340px] sm:min-h-[380px] bg-white rounded-3xl border border-slate-200/90 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer p-6 sm:p-8 flex flex-col justify-between dark:bg-slate-900 dark:border-slate-800 group select-none"
      >
        {/* Card Header Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {currentCard.isMistake && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                <AlertCircle size={12} />
                歷史錯題 ({currentCard.mistakeCount}次)
              </span>
            )}
            {currentCard.tags?.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <AudioButton
              text={currentCard.word}
              lang={currentCard.lang}
              rate={settings.speechRate}
              size="md"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCardModal(currentCard);
              }}
              title="編輯此單字卡"
              className="text-xs text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              編輯
            </button>
          </div>
        </div>

        {/* Card Core Content */}
        <div className="my-auto py-4 text-center">
          {/* Word (Term) */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            {currentCard.word}
          </h1>

          {/* Phonetic / Reading */}
          {currentCard.phonetic && (
            <p className="text-sm sm:text-base font-mono text-indigo-600 dark:text-indigo-400 font-medium mb-4">
              {currentCard.phonetic}
            </p>
          )}

          {/* Front Hint Toggle */}
          {!isFlipped && (
            <div className="mt-4">
              {showHint ? (
                <div className="inline-block px-4 py-2 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-800 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200 animate-in fade-in">
                  💡 提示：{currentCard.notes || `首字母為 "${currentCard.word[0]}..."，意思為 ${currentCard.meaning.slice(0, 4)}...`}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(true);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-amber-600 transition-colors px-2 py-1 rounded-md hover:bg-amber-50 dark:hover:bg-amber-950/40"
                >
                  <HelpCircle size={14} />
                  <span>顯示提示</span>
                </button>
              )}
            </div>
          )}

          {/* Back Details (Visible when flipped) */}
          {isFlipped && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
              {/* Definition */}
              <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                {currentCard.meaning}
              </div>

              {/* Example Sentence */}
              {currentCard.example && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left dark:bg-slate-800/60 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {currentCard.example}
                    </p>
                    <AudioButton
                      text={currentCard.example}
                      lang={currentCard.lang}
                      rate={settings.speechRate}
                      size="sm"
                    />
                  </div>
                  {currentCard.exampleTranslation && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {currentCard.exampleTranslation}
                    </p>
                  )}
                </div>
              )}

              {/* Notes / Mnemonic */}
              {currentCard.notes && (
                <div className="mt-3 text-left text-xs text-slate-500 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50 dark:bg-indigo-950/20 dark:border-indigo-900/40 dark:text-slate-400">
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300">記憶小註記：</span>{' '}
                  {currentCard.notes}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Footer prompt */}
        <div className="text-center pt-2">
          {!isFlipped ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium group-hover:text-indigo-600 transition-colors">
              <RotateCw size={13} className="group-hover:rotate-180 transition-transform duration-500" />
              點擊卡片或按「空白鍵」翻開查看釋義
            </span>
          ) : (
            <span className="text-xs text-slate-400">
              根據記憶牢固度評分（或按數字鍵 1-4）
            </span>
          )}
        </div>
      </div>

      {/* SRS Rating Control Buttons (Active after flip) */}
      {isFlipped ? (
        <div className="grid grid-cols-4 gap-2.5 mt-5 animate-in slide-in-from-bottom-2 duration-200">
          {/* 1: Again */}
          <button
            type="button"
            onClick={() => handleRating(1)}
            className="flex flex-col items-center justify-center p-3 sm:py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 border border-rose-200 shadow-sm transition-all cursor-pointer dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
          >
            <span className="text-sm sm:text-base font-bold">忘記了</span>
            <span className="text-[11px] opacity-80 mt-0.5">
              {getIntervalPreview(currentCard, 1)} (鍵盤 1)
            </span>
          </button>

          {/* 2: Hard */}
          <button
            type="button"
            onClick={() => handleRating(2)}
            className="flex flex-col items-center justify-center p-3 sm:py-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-700 border border-amber-200 shadow-sm transition-all cursor-pointer dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900"
          >
            <span className="text-sm sm:text-base font-bold">困難</span>
            <span className="text-[11px] opacity-80 mt-0.5">
              {getIntervalPreview(currentCard, 2)} (鍵盤 2)
            </span>
          </button>

          {/* 3: Good */}
          <button
            type="button"
            onClick={() => handleRating(3)}
            className="flex flex-col items-center justify-center p-3 sm:py-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-700 border border-blue-200 shadow-sm transition-all cursor-pointer dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900"
          >
            <span className="text-sm sm:text-base font-bold">良好</span>
            <span className="text-[11px] opacity-80 mt-0.5">
              {getIntervalPreview(currentCard, 3)} (鍵盤 3)
            </span>
          </button>

          {/* 4: Easy */}
          <button
            type="button"
            onClick={() => handleRating(4)}
            className="flex flex-col items-center justify-center p-3 sm:py-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-700 border border-emerald-200 shadow-sm transition-all cursor-pointer dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
          >
            <span className="text-sm sm:text-base font-bold">熟練</span>
            <span className="text-[11px] opacity-80 mt-0.5">
              {getIntervalPreview(currentCard, 4)} (鍵盤 4)
            </span>
          </button>
        </div>
      ) : (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={handleFlip}
            className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-semibold text-base shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Eye size={18} />
            翻開卡片查看答案
          </button>
        </div>
      )}
    </div>
  );
};
