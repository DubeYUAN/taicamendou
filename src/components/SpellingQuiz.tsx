import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Volume2, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  AlertCircle, 
  Lightbulb, 
  Sparkles,
  Keyboard
} from 'lucide-react';
import { Flashcard, Deck, QuizSettings } from '../types';
import { AudioButton } from './AudioButton';
import { tts } from '../services/tts';
import { sounds } from '../assets';

interface SpellingQuizProps {
  cards: Flashcard[];
  decks: Deck[];
  settings: QuizSettings;
  onUpdateCard: (card: Flashcard) => void;
  filterMode?: 'all' | 'mistakes';
  selectedDeckId?: string;
  onStartMistakeDrill?: () => void;
}

export const SpellingQuiz: React.FC<SpellingQuizProps> = ({
  cards,
  decks,
  settings,
  onUpdateCard,
  filterMode = 'all',
  selectedDeckId,
}) => {
  const [questionCards, setQuestionCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [revealedLettersCount, setRevealedLettersCount] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [sessionMistakes, setSessionMistakes] = useState<Flashcard[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize pool
  const initQuiz = useCallback(() => {
    let pool = [...cards];
    if (selectedDeckId && selectedDeckId !== 'all') {
      pool = pool.filter((c) => c.deckId === selectedDeckId);
    }
    if (filterMode === 'mistakes') {
      pool = pool.filter((c) => c.isMistake || c.mistakeCount > 0);
    }

    const shuffled = pool.sort(() => Math.random() - 0.5);
    setQuestionCards(shuffled.slice(0, 15));
    setCurrentIndex(0);
    setInputVal('');
    setRevealedLettersCount(0);
    setIsAnswered(false);
    setIsCorrect(false);
    setScore(0);
    setSessionMistakes([]);
    setIsCompleted(false);
  }, [cards, selectedDeckId, filterMode]);

  useEffect(() => {
    initQuiz();
  }, [initQuiz]);

  const currentCard = questionCards[currentIndex];

  // Auto pronounce audio & focus input on new card
  useEffect(() => {
    if (currentCard && !isAnswered) {
      if (settings.autoPronounce) {
        tts.speak(currentCard.word, currentCard.lang, settings.speechRate);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [currentIndex, currentCard, isAnswered, settings.autoPronounce, settings.speechRate]);

  // Handle checking spelling
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentCard || isAnswered) return;

    const trimmedInput = inputVal.trim().toLowerCase();
    const targetClean = currentCard.word.trim().toLowerCase();

    // Check exact or punctuation-agnostic match
    const isMatch = trimmedInput === targetClean ||
      trimmedInput.replace(/[^a-z0-9\u4e00-\u9fa5\u3040-\u30ff]/gi, '') ===
      targetClean.replace(/[^a-z0-9\u4e00-\u9fa5\u3040-\u30ff]/gi, '');

    setIsAnswered(true);
    setIsCorrect(isMatch);

    if (isMatch) {
      sounds.playCorrect();
      setScore((prev) => prev + 1);
      if (filterMode === 'mistakes') {
        onUpdateCard({
          ...currentCard,
          isMistake: false,
          correctCount: (currentCard.correctCount || 0) + 1,
          reviewHistory: [
            ...(currentCard.reviewHistory || []),
            { date: Date.now(), rating: 3, type: 'spelling' },
          ],
        });
      }
    } else {
      sounds.playWrong();
      // Record mistake
      const updated: Flashcard = {
        ...currentCard,
        isMistake: true,
        mistakeCount: (currentCard.mistakeCount || 0) + 1,
        lastMistakeAt: Date.now(),
        reviewHistory: [
          ...(currentCard.reviewHistory || []),
          { date: Date.now(), rating: 1, type: 'spelling' },
        ],
      };
      onUpdateCard(updated);
      setSessionMistakes((prev) => [...prev, currentCard]);
    }
  };

  const handleGiveUp = () => {
    if (isAnswered || !currentCard) return;
    sounds.playWrong();
    setIsAnswered(true);
    setIsCorrect(false);
    // Record mistake
    const updated: Flashcard = {
      ...currentCard,
      isMistake: true,
      mistakeCount: (currentCard.mistakeCount || 0) + 1,
      lastMistakeAt: Date.now(),
      reviewHistory: [
        ...(currentCard.reviewHistory || []),
        { date: Date.now(), rating: 1, type: 'spelling' },
      ],
    };
    onUpdateCard(updated);
    setSessionMistakes((prev) => [...prev, currentCard]);
  };

  const handleRevealLetter = () => {
    if (!currentCard || isAnswered) return;
    if (revealedLettersCount < currentCard.word.length) {
      setRevealedLettersCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questionCards.length) {
      setCurrentIndex((prev) => prev + 1);
      setInputVal('');
      setRevealedLettersCount(0);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      setIsCompleted(true);
      sounds.playComplete();
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  if (questionCards.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center dark:bg-slate-900 dark:border-slate-800">
        <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
          {filterMode === 'mistakes' ? '目前無錯題需要拼寫特訓！' : '無可用單字'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          請先新增單字或切換卡組以開始拼寫默寫練習。
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
          拼寫練習完成！
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          答對 <span className="font-bold text-indigo-600 dark:text-indigo-400">{score}</span> / {total} 題
          （拼寫準確率 {accuracy}%）
        </p>

        {sessionMistakes.length > 0 && (
          <div className="mb-6 text-left p-4 bg-rose-50 rounded-2xl border border-rose-100 dark:bg-rose-950/30 dark:border-rose-900">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 mb-2">
              <AlertCircle size={14} />
              拼寫錯誤單字 ({sessionMistakes.length}) 已標記進錯題本：
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
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {sessionMistakes.length > 0 && (
            <button
              onClick={() => {
                setQuestionCards(sessionMistakes);
                setCurrentIndex(0);
                setInputVal('');
                setRevealedLettersCount(0);
                setIsAnswered(false);
                setIsCorrect(false);
                setScore(0);
                setSessionMistakes([]);
                setIsCompleted(false);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              重練本輪拼錯單字 ({sessionMistakes.length})
            </button>
          )}

          <button
            onClick={initQuiz}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            再來一組拼寫練習
          </button>
        </div>
      </div>
    );
  }

  // Hint representation
  const wordChars = currentCard.word.split('');
  const hintDisplay = wordChars.map((char, idx) => {
    if (char === ' ') return ' ';
    if (idx < revealedLettersCount) return char;
    return '_';
  }).join(' ');

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <Keyboard size={12} />
            拼寫與聽音默寫
          </span>
          {filterMode === 'mistakes' && (
            <span className="font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              錯題專攻
            </span>
          )}
        </div>
        <div>
          第 <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentIndex + 1}</span> / {questionCards.length} 題
          {' · '}得分: <span className="font-bold text-emerald-600">{score}</span>
        </div>
      </div>

      {/* Main Prompt Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 mb-6 dark:bg-slate-900 dark:border-slate-800 text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
          根據釋義與發音拼寫出單字
        </span>

        {/* Big Translation Definition */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
          {currentCard.meaning}
        </h2>

        {/* Audio Prompt button */}
        <div className="flex items-center justify-center gap-3 my-4">
          <button
            type="button"
            onClick={() => tts.speak(currentCard.word, currentCard.lang, settings.speechRate)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm border border-indigo-200 transition-all cursor-pointer dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300 active:scale-95"
          >
            <Volume2 size={20} className="text-indigo-600" />
            <span>聆聽發音 (可重複播放)</span>
          </button>
        </div>

        {/* Letter Hint Preview */}
        <div className="my-3 font-mono text-xl tracking-widest text-slate-700 dark:text-slate-300 select-none">
          {hintDisplay}
        </div>

        {/* Typing Form */}
        <form onSubmit={handleSubmit} className="mt-6 max-w-md mx-auto">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              autoFocus
              disabled={isAnswered}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="在此輸入正確單字拼寫..."
              className={`w-full px-5 py-3.5 text-center text-lg font-medium rounded-2xl border-2 transition-all outline-none ${
                isAnswered
                  ? isCorrect
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200'
                    : 'border-rose-500 bg-rose-50/50 text-rose-900 dark:bg-rose-950/30 dark:text-rose-200'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-indigo-950'
              }`}
            />
          </div>

          {/* Action buttons under input */}
          {!isAnswered ? (
            <div className="flex items-center justify-between gap-2 mt-4">
              <button
                type="button"
                onClick={handleRevealLetter}
                disabled={revealedLettersCount >= currentCard.word.length}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200/80 transition-colors cursor-pointer dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900"
              >
                <Lightbulb size={13} />
                <span>提示一個字母</span>
              </button>

              <button
                type="button"
                onClick={handleGiveUp}
                className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              >
                忘記了，看答案
              </button>

              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                提交檢查 (Enter)
              </button>
            </div>
          ) : (
            <div className="mt-5 animate-in fade-in">
              <div
                className={`p-4 rounded-2xl mb-4 text-center ${
                  isCorrect
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800'
                }`}
              >
                <div className="flex items-center justify-center gap-2 font-bold text-base mb-1">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 size={20} className="text-emerald-600" />
                      <span>拼寫正確！太棒了！</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={20} className="text-rose-600" />
                      <span>拼寫有誤，正確單字為：</span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 text-xl font-black mt-2">
                  <span>{currentCard.word}</span>
                  {currentCard.phonetic && (
                    <span className="text-xs font-mono font-normal opacity-80">
                      {currentCard.phonetic}
                    </span>
                  )}
                  <AudioButton text={currentCard.word} lang={currentCard.lang} rate={settings.speechRate} size="sm" />
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{currentIndex + 1 < questionCards.length ? '下一題' : '查看練習成績'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
