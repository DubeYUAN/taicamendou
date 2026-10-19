import React, { useState } from 'react';
import { 
  BookOpen, 
  BrainCircuit, 
  Keyboard, 
  AlertCircle, 
  Headphones, 
  Sparkles, 
  Flame, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { Flashcard, Deck, QuizSettings } from '../types';
import { MultipleChoiceQuiz } from './MultipleChoiceQuiz';
import { SpellingQuiz } from './SpellingQuiz';
import { FlashcardReview } from './FlashcardReview';

interface QuizCenterProps {
  cards: Flashcard[];
  decks: Deck[];
  settings: QuizSettings;
  onUpdateCard: (card: Flashcard) => void;
  onOpenCardModal: (card: Flashcard) => void;
  onCompleteSession: () => void;
  initialMode?: 'choice' | 'spelling' | 'flashcard';
  initialMistakesOnly?: boolean;
}

export const QuizCenter: React.FC<QuizCenterProps> = ({
  cards,
  decks,
  settings,
  onUpdateCard,
  onOpenCardModal,
  onCompleteSession,
  initialMode = 'choice',
  initialMistakesOnly = false,
}) => {
  const [activeQuizType, setActiveQuizType] = useState<'choice' | 'spelling' | 'flashcard'>(initialMode);
  const [filterMode, setFilterMode] = useState<'all' | 'mistakes'>(initialMistakesOnly ? 'mistakes' : 'all');
  const [selectedDeckId, setSelectedDeckId] = useState<string>('all');

  const mistakeCardsCount = cards.filter((c) => c.isMistake || c.mistakeCount > 0).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top Header & Mode Toggle Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-5 mb-6 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-full md:w-auto dark:bg-slate-800">
            <button
              onClick={() => setActiveQuizType('choice')}
              className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeQuizType === 'choice'
                  ? 'bg-white text-indigo-700 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <BookOpen size={15} />
              <span>四選一測驗</span>
            </button>

            <button
              onClick={() => setActiveQuizType('spelling')}
              className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeQuizType === 'spelling'
                  ? 'bg-white text-indigo-700 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Keyboard size={15} />
              <span>拼寫默寫</span>
            </button>

            <button
              onClick={() => setActiveQuizType('flashcard')}
              className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeQuizType === 'flashcard'
                  ? 'bg-white text-indigo-700 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <BrainCircuit size={15} />
              <span>記憶卡翻牌</span>
            </button>
          </div>

          {/* Scope Filters: All cards vs Mistakes Only */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {/* Deck selector */}
            <select
              value={selectedDeckId}
              onChange={(e) => setSelectedDeckId(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">所有卡組單字</option>
              {decks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Mistakes Only Toggle Button */}
            <button
              onClick={() => setFilterMode((prev) => (prev === 'all' ? 'mistakes' : 'all'))}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                filterMode === 'mistakes'
                  ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs ring-2 ring-rose-300 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              <AlertCircle size={14} className={filterMode === 'mistakes' ? 'text-rose-500' : 'text-slate-400'} />
              <span>專做錯題 ({mistakeCardsCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render selected quiz mode */}
      {activeQuizType === 'choice' && (
        <MultipleChoiceQuiz
          cards={cards}
          decks={decks}
          settings={settings}
          onUpdateCard={onUpdateCard}
          filterMode={filterMode}
          selectedDeckId={selectedDeckId}
          onStartMistakeDrill={() => setFilterMode('mistakes')}
        />
      )}

      {activeQuizType === 'spelling' && (
        <SpellingQuiz
          cards={cards}
          decks={decks}
          settings={settings}
          onUpdateCard={onUpdateCard}
          filterMode={filterMode}
          selectedDeckId={selectedDeckId}
          onStartMistakeDrill={() => setFilterMode('mistakes')}
        />
      )}

      {activeQuizType === 'flashcard' && (
        <FlashcardReview
          cards={cards}
          decks={decks}
          settings={settings}
          onUpdateCard={onUpdateCard}
          onOpenCardModal={onOpenCardModal}
          onCompleteSession={onCompleteSession}
          filterMode={filterMode === 'mistakes' ? 'mistakes' : 'all'}
          selectedDeckId={selectedDeckId}
          onStartMistakeDrill={() => setFilterMode('mistakes')}
        />
      )}
    </div>
  );
};
