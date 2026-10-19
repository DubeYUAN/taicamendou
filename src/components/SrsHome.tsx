import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  Flame, 
  AlertCircle, 
  BookOpen, 
  Plus, 
  Clock, 
  Play, 
  CheckCircle2, 
  ArrowRight,
  Upload,
  Keyboard
} from 'lucide-react';
import { Flashcard, Deck, QuizSettings } from '../types';
import { StreakInfo } from '../services/storage';
import { FlashcardReview } from './FlashcardReview';

interface SrsHomeProps {
  cards: Flashcard[];
  decks: Deck[];
  settings: QuizSettings;
  streak: StreakInfo;
  dueCount: number;
  mistakesCount: number;
  onUpdateCard: (card: Flashcard) => void;
  onOpenCardModal: (card?: Flashcard) => void;
  onOpenBatchImport: () => void;
  onCompleteSession: () => void;
  onNavigateToQuiz: (mode?: 'choice' | 'spelling' | 'flashcard', mistakesOnly?: boolean) => void;
  onNavigateToMistakes: () => void;
}

export const SrsHome: React.FC<SrsHomeProps> = ({
  cards,
  decks,
  settings,
  streak,
  dueCount,
  mistakesCount,
  onUpdateCard,
  onOpenCardModal,
  onOpenBatchImport,
  onCompleteSession,
  onNavigateToQuiz,
  onNavigateToMistakes,
}) => {
  const [isStudyingNow, setIsStudyingNow] = useState(false);
  const [studyFilterMode, setStudyFilterMode] = useState<'due' | 'all' | 'mistakes'>('due');
  const [selectedDeckFilter, setSelectedDeckFilter] = useState('all');

  const startReviewSession = (mode: 'due' | 'all' | 'mistakes', deckId: string = 'all') => {
    setStudyFilterMode(mode);
    setSelectedDeckFilter(deckId);
    setIsStudyingNow(true);
  };

  if (isStudyingNow) {
    return (
      <div className="py-4">
        <div className="max-w-2xl mx-auto px-4 mb-2 flex items-center justify-between">
          <button
            onClick={() => setIsStudyingNow(false)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer flex items-center gap-1"
          >
            ← 結束並返回儀表板
          </button>
        </div>

        <FlashcardReview
          cards={cards}
          decks={decks}
          settings={settings}
          onUpdateCard={onUpdateCard}
          onCompleteSession={onCompleteSession}
          onOpenCardModal={onOpenCardModal}
          filterMode={studyFilterMode}
          selectedDeckId={selectedDeckFilter}
          onStartMistakeDrill={() => {
            setStudyFilterMode('mistakes');
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300 mb-3">
          <Sparkles size={13} />
          <span>SM-2 艾賓浩斯智能間隔記憶法</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          歡迎回來！準備好強化記憶了嗎？
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-xl">
          支援多國語言發音、客製單字卡與即時測驗。專注錯題練習，高效告別遺忘！
        </p>
      </div>

      {/* Main Action Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Card 1: Due Today SRS Review */}
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold backdrop-blur-md">
                每日記憶強化
              </span>
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                <Flame size={16} className="fill-amber-400" />
                <span>連續第 {streak.currentStreak} 天</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">
              今日待複習：<span className="text-indigo-300 underline decoration-indigo-400/40">{dueCount}</span> 張單字卡
            </h2>
            <p className="text-indigo-100/80 text-xs sm:text-sm leading-relaxed max-w-lg">
              {dueCount > 0
                ? '這些單字今天已達記憶衰減臨界點，立即翻牌複習能讓記憶留存率提高 80%！'
                : '太棒了！今天所有的排程卡片都已複習完畢。你可以自由瀏覽全部單字，或進入測驗中心小試身手。'}
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => startReviewSession(dueCount > 0 ? 'due' : 'all')}
              className="px-6 py-3.5 rounded-2xl bg-white text-indigo-900 font-bold text-sm shadow-lg hover:bg-indigo-50 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <Play size={16} className="fill-indigo-900" />
              <span>{dueCount > 0 ? '開始今日間隔複習' : '自由複習全部卡片'}</span>
            </button>

            <button
              onClick={() => onNavigateToQuiz('choice')}
              className="px-5 py-3 rounded-2xl bg-indigo-700/50 hover:bg-indigo-700/70 text-white font-semibold text-xs backdrop-blur-md transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <BookOpen size={15} />
              <span>智能四選一出題</span>
            </button>
          </div>
        </div>

        {/* Card 2: Mistakes Quick Drill (錯題特訓) */}
        <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 rounded-3xl p-6 sm:p-7 text-white shadow-lg shadow-rose-500/20 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3">
              <AlertCircle size={14} />
              弱點集中攻克
            </div>
            <h3 className="text-xl font-bold mb-1">
              專做錯題特訓
            </h3>
            <div className="text-3xl font-extrabold my-2">
              {mistakesCount} <span className="text-sm font-normal text-rose-100">個待複習錯題</span>
            </div>
            <p className="text-xs text-rose-100/90 leading-relaxed mb-4">
              專為容易記錯、混淆的單字量身打造，練習完可直接移出錯題本！
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={onNavigateToMistakes}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-rose-700 font-bold text-xs shadow-md hover:bg-rose-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>進入錯題本管理</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => onNavigateToQuiz('choice', true)}
              className="w-full py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>只測錯題 (選擇題)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Launchpad Action Grid */}
      <div className="mb-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
          多元學習模式出題
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1: Flip Card */}
          <div
            onClick={() => startReviewSession('all')}
            className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer dark:bg-slate-900 dark:border-slate-800 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform dark:bg-indigo-950/50 dark:text-indigo-400">
              <BrainCircuit size={20} />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              記憶卡翻牌 (SRS)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              真實卡片正反面翻轉，搭配 SM-2 間隔計算法自動安排複習。
            </p>
          </div>

          {/* Action 2: Multiple Choice Quiz */}
          <div
            onClick={() => onNavigateToQuiz('choice')}
            className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer dark:bg-slate-900 dark:border-slate-800 group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform dark:bg-sky-950/50 dark:text-sky-400">
              <BookOpen size={20} />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              智慧選擇題
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              以單字庫自動生成 4 選 1 題目，包含聽力辨詞與反向選詞。
            </p>
          </div>

          {/* Action 3: Spelling */}
          <div
            onClick={() => onNavigateToQuiz('spelling')}
            className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer dark:bg-slate-900 dark:border-slate-800 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform dark:bg-emerald-950/50 dark:text-emerald-400">
              <Keyboard size={20} />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              拼寫與聽音默寫
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              主動回憶拼寫練習，提供音標、字母提示與發音重播。
            </p>
          </div>

          {/* Action 4: Quick Add */}
          <div
            onClick={() => onOpenCardModal()}
            className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer dark:bg-slate-900 dark:border-slate-800 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform dark:bg-amber-950/50 dark:text-amber-400">
              <Plus size={20} />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              新增自訂單字
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              支援任何語言、音標、例句與自訂分類卡組。
            </p>
          </div>
        </div>
      </div>

      {/* Decks Quick Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            我的單字卡組 ({decks.length})
          </h3>
          <button
            onClick={onOpenBatchImport}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer inline-flex items-center gap-1"
          >
            <Upload size={13} />
            <span>批次匯入單字</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {decks.map((deck) => {
            const deckCards = cards.filter((c) => c.deckId === deck.id);
            const deckDue = deckCards.filter((c) => c.dueDate <= Date.now()).length;
            const deckMistakes = deckCards.filter((c) => c.isMistake).length;

            return (
              <div
                key={deck.id}
                className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: deck.color }}
                    />
                    <span className="text-xs font-semibold text-slate-400">
                      {deckCards.length} 詞
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    {deck.name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 dark:text-slate-400 mb-4">
                    {deck.description || '自訂單字組'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    {deckDue > 0 && <span className="text-amber-600 font-semibold mr-2">{deckDue} 張待複習</span>}
                    {deckMistakes > 0 && <span className="text-rose-600 font-semibold">{deckMistakes} 錯題</span>}
                  </div>

                  <button
                    onClick={() => startReviewSession('all', deck.id)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
                  >
                    複習此組 →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
