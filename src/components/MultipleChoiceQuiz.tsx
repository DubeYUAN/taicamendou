import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle, 
  XCircle, 
  Volume2, 
  ArrowRight, 
  RotateCcw, 
  AlertCircle, 
  Sparkles, 
  Headphones,
  Check,
  X,
  HelpCircle
} from 'lucide-react';
import { Flashcard, Deck, QuizSettings } from '../types';
import { AudioButton } from './AudioButton';
import { tts } from '../services/tts';
import { sounds } from '../assets';

interface MultipleChoiceQuizProps {
  cards: Flashcard[];
  decks: Deck[];
  settings: QuizSettings;
  onUpdateCard: (card: Flashcard) => void;
  filterMode?: 'all' | 'mistakes';
  selectedDeckId?: string;
  onStartMistakeDrill?: () => void;
}

type QuizDirection = 'word-to-meaning' | 'meaning-to-word' | 'listening';

interface QuizOption {
  text: string;
  cardId: string;
  isCorrect: boolean;
}

export const MultipleChoiceQuiz: React.FC<MultipleChoiceQuizProps> = ({
  cards,
  decks,
  settings,
  onUpdateCard,
  filterMode = 'all',
  selectedDeckId,
  onStartMistakeDrill,
}) => {
  const [direction, setDirection] = useState<QuizDirection>('word-to-meaning');
  const [questionCards, setQuestionCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<QuizOption | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [sessionMistakes, setSessionMistakes] = useState<Flashcard[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Filter eligible cards
  const eligibleCards = useMemo(() => {
    let pool = [...cards];
    if (selectedDeckId && selectedDeckId !== 'all') {
      pool = pool.filter((c) => c.deckId === selectedDeckId);
    }
    if (filterMode === 'mistakes') {
      pool = pool.filter((c) => c.isMistake || c.mistakeCount > 0);
    }
    return pool;
  }, [cards, selectedDeckId, filterMode]);

  // Start new quiz round
  const startQuiz = useCallback(() => {
    if (eligibleCards.length === 0) return;

    const shuffled = [...eligibleCards].sort(() => Math.random() - 0.5);
    setQuestionCards(shuffled.slice(0, Math.min(shuffled.length, 15)));
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setSessionMistakes([]);
    setIsCompleted(false);
  }, [eligibleCards]);

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  const currentCard = questionCards[currentIndex];

  // Auto pronounce audio if autoPronounce or listening mode
  useEffect(() => {
    if (currentCard && (settings.autoPronounce || direction === 'listening') && !isAnswered) {
      tts.speak(currentCard.word, currentCard.lang, settings.speechRate);
    }
  }, [currentIndex, currentCard, direction, isAnswered, settings.autoPronounce, settings.speechRate]);

  // Generate 4 randomized options (1 correct + 3 distractors)
  const options = useMemo(() => {
    if (!currentCard || cards.length < 2) return [];

    const isTargetWord = direction === 'meaning-to-word' || direction === 'listening';
    const correctText = isTargetWord ? currentCard.word : currentCard.meaning;

    // Distractor pool from all available cards
    const distractorsPool = cards.filter((c) => c.id !== currentCard.id);
    const shuffledPool = [...distractorsPool].sort(() => Math.random() - 0.5);
    const chosenDistractors = shuffledPool.slice(0, 3).map((c) => ({
      text: isTargetWord ? c.word : c.meaning,
      cardId: c.id,
      isCorrect: false,
    }));

    const allOptions: QuizOption[] = [
      { text: correctText, cardId: currentCard.id, isCorrect: true },
      ...chosenDistractors,
    ];

    // Shuffle options
    return allOptions.sort(() => Math.random() - 0.5);
  }, [currentCard, cards, direction]);

  const handleSelectOption = (option: QuizOption) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    if (option.isCorrect) {
      sounds.playCorrect();
      setScore((prev) => prev + 1);
      // If was mistake and answered right in mistake drill, update
      if (filterMode === 'mistakes') {
        const updated: Flashcard = {
          ...currentCard,
          correctCount: currentCard.correctCount + 1,
          isMistake: false, // resolve mistake
          reviewHistory: [
            ...(currentCard.reviewHistory || []),
            { date: Date.now(), rating: 3, type: 'quiz' },
          ],
        };
        onUpdateCard(updated);
      }
    } else {
      sounds.playWrong();
      // Wrong answer! Automatically record as mistake!
      const updatedCard: Flashcard = {
        ...currentCard,
        isMistake: true,
        mistakeCount: (currentCard.mistakeCount || 0) + 1,
        lastMistakeAt: Date.now(),
        reviewHistory: [
          ...(currentCard.reviewHistory || []),
          { date: Date.now(), rating: 1, type: 'quiz' },
        ],
      };
      onUpdateCard(updatedCard);
      setSessionMistakes((prev) => [...prev, currentCard]);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questionCards.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
      sounds.playComplete();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  if (cards.length < 4) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center dark:bg-slate-900 dark:border-slate-800">
        <HelpCircle size={40} className="mx-auto text-amber-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
          單字數量不足以出選擇題
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          選擇題需要至少 4 個單字才能生成干擾選項，請先新增或匯入更多單字卡。
        </p>
      </div>
    );
  }

  if (eligibleCards.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center dark:bg-slate-900 dark:border-slate-800">
        <CheckCircle size={40} className="mx-auto text-emerald-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
          {filterMode === 'mistakes' ? '太棒了！無錯題需複習' : '目前分類無可用單字'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {filterMode === 'mistakes'
            ? '所有錯題都已練習完畢，你可以切換至全部單字進行全方位測驗！'
            : '請嘗試選擇其他卡組或新增單字。'}
        </p>
      </div>
    );
  }

  // Completed Screen
  if (isCompleted) {
    const total = questionCards.length;
    const accuracy = Math.round((score / total) * 100);

    return (
      <div className="max-w-lg mx-auto my-8 p-8 bg-white rounded-3xl border border-slate-200/90 shadow-md text-center dark:bg-slate-900 dark:border-slate-800 animate-in fade-in">
        <div className="w-16 h-16 mx-auto mb-4 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center dark:bg-indigo-950/40 dark:text-indigo-400">
          <Sparkles size={36} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
          測驗完成！
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          你的得分：<span className="font-bold text-indigo-600 dark:text-indigo-400">{score}</span> / {total}
          （正確率 {accuracy}%）
        </p>

        {/* Mistake feedback */}
        {sessionMistakes.length > 0 ? (
          <div className="mb-6 text-left p-4 bg-rose-50 rounded-2xl border border-rose-100 dark:bg-rose-950/30 dark:border-rose-900">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 mb-2">
              <AlertCircle size={14} />
              本輪測驗出錯的單字 ({sessionMistakes.length}) 已加入錯題本：
            </div>
            <div className="flex flex-wrap gap-2">
              {sessionMistakes.map((card) => (
                <span
                  key={card.id}
                  className="text-xs px-2.5 py-1 bg-white rounded-lg border border-rose-200 text-rose-800 font-medium dark:bg-slate-900 dark:border-rose-800 dark:text-rose-200"
                >
                  {card.word} ({card.meaning})
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-emerald-50 rounded-2xl text-emerald-800 text-sm font-semibold dark:bg-emerald-950/30 dark:text-emerald-300">
            🎉 太厲害了！全對零失誤！
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {sessionMistakes.length > 0 && (
            <button
              onClick={() => {
                setQuestionCards(sessionMistakes);
                setCurrentIndex(0);
                setSelectedOption(null);
                setIsAnswered(false);
                setScore(0);
                setSessionMistakes([]);
                setIsCompleted(false);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              只測剛才答錯的題目 ({sessionMistakes.length})
            </button>
          )}

          <button
            onClick={startQuiz}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            再來一組新測驗
          </button>
        </div>
      </div>
    );
  }

  const currentDeck = decks.find((d) => d.id === currentCard.deckId);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Quiz Direction Selector Tabs */}
      <div className="flex items-center justify-between gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl dark:bg-slate-800/80">
        <button
          onClick={() => {
            setDirection('word-to-meaning');
            setIsAnswered(false);
            setSelectedOption(null);
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            direction === 'word-to-meaning'
              ? 'bg-white text-indigo-700 shadow-xs dark:bg-slate-700 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          睇詞選義 (看單字選意思)
        </button>
        <button
          onClick={() => {
            setDirection('meaning-to-word');
            setIsAnswered(false);
            setSelectedOption(null);
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            direction === 'meaning-to-word'
              ? 'bg-white text-indigo-700 shadow-xs dark:bg-slate-700 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          睇義選詞 (看意思選單字)
        </button>
        <button
          onClick={() => {
            setDirection('listening');
            setIsAnswered(false);
            setSelectedOption(null);
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
            direction === 'listening'
              ? 'bg-white text-indigo-700 shadow-xs dark:bg-slate-700 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <Headphones size={13} />
          聽力辨詞
        </button>
      </div>

      {/* Progress & Stats */}
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-3">
        <div className="flex items-center gap-2">
          {filterMode === 'mistakes' && (
            <span className="font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              錯題專攻模式
            </span>
          )}
          {currentDeck && (
            <span
              className="px-2 py-0.5 rounded-md text-white text-[11px] font-semibold"
              style={{ backgroundColor: currentDeck.color }}
            >
              {currentDeck.name}
            </span>
          )}
        </div>
        <div>
          第 <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentIndex + 1}</span> / {questionCards.length} 題
          {' · '}得分: <span className="font-bold text-emerald-600">{score}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 mb-6 dark:bg-slate-900 dark:border-slate-800 text-center">
        {direction === 'word-to-meaning' && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              請選出正確的中文解釋
            </span>
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                {currentCard.word}
              </h2>
              <AudioButton text={currentCard.word} lang={currentCard.lang} rate={settings.speechRate} size="md" />
            </div>
            {currentCard.phonetic && (
              <p className="text-sm font-mono text-indigo-600 dark:text-indigo-400">
                {currentCard.phonetic}
              </p>
            )}
          </div>
        )}

        {direction === 'meaning-to-word' && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              請選出對應的正確單字
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
              {currentCard.meaning}
            </h2>
            {currentCard.notes && (
              <p className="text-xs text-slate-400 italic">
                提示：{currentCard.notes}
              </p>
            )}
          </div>
        )}

        {direction === 'listening' && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 block">
              點擊聆聽發音，選出對應單字
            </span>
            <div className="my-3">
              <button
                onClick={() => tts.speak(currentCard.word, currentCard.lang, settings.speechRate)}
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-lg border-2 border-indigo-200 shadow-sm transition-all cursor-pointer dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300 active:scale-95"
              >
                <Volume2 size={24} className="animate-pulse" />
                <span>播放發音</span>
              </button>
            </div>
            <p className="text-xs text-slate-400">
              {isAnswered ? currentCard.word : '（單字暫隱藏，請仔細聆聽）'}
            </p>
          </div>
        )}
      </div>

      {/* 4 Multiple Choice Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {options.map((option, idx) => {
          let btnStyle =
            'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800';

          if (isAnswered) {
            if (option.isCorrect) {
              btnStyle =
                'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold dark:bg-emerald-950/60 dark:border-emerald-600 dark:text-emerald-200 ring-2 ring-emerald-400';
            } else if (selectedOption === option && !option.isCorrect) {
              btnStyle =
                'bg-rose-50 border-rose-500 text-rose-800 font-bold dark:bg-rose-950/60 dark:border-rose-600 dark:text-rose-200 ring-2 ring-rose-400';
            } else {
              btnStyle = 'opacity-50 border-slate-200 text-slate-400 dark:border-slate-800';
            }
          }

          const optionLabels = ['A', 'B', 'C', 'D'];

          return (
            <button
              key={idx}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelectOption(option)}
              className={`p-4 rounded-2xl border text-left text-sm sm:text-base transition-all duration-150 cursor-pointer flex items-center justify-between shadow-xs ${btnStyle} ${
                isAnswered ? 'cursor-default' : 'active:scale-98'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {optionLabels[idx]}
                </span>
                <span className="leading-snug">{option.text}</span>
              </div>

              {isAnswered && (
                <div>
                  {option.isCorrect ? (
                    <Check size={18} className="text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                  ) : selectedOption === option ? (
                    <X size={18} className="text-rose-600 dark:text-rose-400 stroke-[3]" />
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Answer Explanation & Next Button */}
      {isAnswered && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {currentCard.word}
                </span>
                {currentCard.phonetic && (
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                    {currentCard.phonetic}
                  </span>
                )}
                <AudioButton text={currentCard.word} lang={currentCard.lang} rate={settings.speechRate} size="sm" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
                釋義：{currentCard.meaning}
              </p>
            </div>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <span>{currentIndex + 1 < questionCards.length ? '下一題' : '查看總結果'}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {currentCard.example && (
            <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl dark:bg-slate-800/60 dark:text-slate-400">
              <span className="font-bold text-slate-700 dark:text-slate-300">例句：</span> {currentCard.example}
              {currentCard.exampleTranslation && <span> ({currentCard.exampleTranslation})</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
