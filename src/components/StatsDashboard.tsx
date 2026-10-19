import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Flame, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BookOpen, 
  Layers,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Flashcard, Deck, LANGUAGE_OPTIONS } from '../types';
import { StreakInfo } from '../services/storage';

interface StatsDashboardProps {
  cards: Flashcard[];
  decks: Deck[];
  streak: StreakInfo;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  cards,
  decks,
  streak,
}) => {
  const stats = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    let dueToday = 0;
    let dueTomorrow = 0;
    let dueIn3Days = 0;
    let dueIn7Days = 0;
    let newCards = 0;
    let learningCards = 0;
    let masteredCards = 0;
    let totalReviews = 0;
    let correctReviews = 0;
    let totalMistakes = 0;
    let activeMistakes = 0;

    const langCounts: Record<string, number> = {};

    cards.forEach((c) => {
      // Due forecast
      if (c.dueDate <= now) dueToday++;
      else if (c.dueDate <= now + oneDay) dueTomorrow++;
      else if (c.dueDate <= now + 3 * oneDay) dueIn3Days++;
      else if (c.dueDate <= now + 7 * oneDay) dueIn7Days++;

      // Mastery stages
      if (c.repetition === 0) newCards++;
      else if (c.repetition < 4) learningCards++;
      else masteredCards++;

      // Mistakes
      if (c.isMistake) activeMistakes++;
      totalMistakes += c.mistakeCount || 0;

      // History reviews
      if (c.reviewHistory) {
        totalReviews += c.reviewHistory.length;
        correctReviews += c.reviewHistory.filter((h) => h.rating >= 3).length;
      }

      // Lang distribution
      const l = c.lang || 'other';
      langCounts[l] = (langCounts[l] || 0) + 1;
    });

    const accuracyRate =
      totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 100;

    return {
      dueToday,
      dueTomorrow,
      dueIn3Days,
      dueIn7Days,
      newCards,
      learningCards,
      masteredCards,
      totalMistakes,
      activeMistakes,
      totalReviews,
      accuracyRate,
      langCounts,
    };
  }, [cards]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Overview Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {/* Streak */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              連續學習天數
            </span>
            <Flame size={18} className="text-amber-500 fill-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {streak.currentStreak} <span className="text-sm font-medium text-slate-400">天</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            累計學習 {streak.totalDaysStudied || 1} 天
          </div>
        </div>

        {/* Due Today */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              今日待複習
            </span>
            <Clock size={18} className="text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {stats.dueToday} <span className="text-sm font-medium text-slate-400">張</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            明天待複習：{stats.dueTomorrow} 張
          </div>
        </div>

        {/* Mastered */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              已牢記掌握
            </span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats.masteredCards} <span className="text-sm font-medium text-slate-400">張</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            掌握率 {cards.length > 0 ? Math.round((stats.masteredCards / cards.length) * 100) : 0}%
          </div>
        </div>

        {/* Mistakes */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              待攻克錯題
            </span>
            <AlertCircle size={18} className="text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {stats.activeMistakes} <span className="text-sm font-medium text-slate-400">張</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            歷史出錯累積：{stats.totalMistakes} 次
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Memory Retention & Stages */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs dark:bg-slate-900 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-600" />
            單字記憶掌握度分佈
          </h3>

          <div className="space-y-4">
            {/* Stage Bar */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-600 dark:text-slate-400">掌握度層次</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  總計 {cards.length} 張單字卡
                </span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex dark:bg-slate-800">
                <div
                  style={{
                    width: `${cards.length > 0 ? (stats.newCards / cards.length) * 100 : 0}%`,
                  }}
                  className="bg-slate-300 dark:bg-slate-600 transition-all"
                  title={`新單字: ${stats.newCards}`}
                />
                <div
                  style={{
                    width: `${cards.length > 0 ? (stats.learningCards / cards.length) * 100 : 0}%`,
                  }}
                  className="bg-indigo-500 transition-all"
                  title={`學習中: ${stats.learningCards}`}
                />
                <div
                  style={{
                    width: `${cards.length > 0 ? (stats.masteredCards / cards.length) * 100 : 0}%`,
                  }}
                  className="bg-emerald-500 transition-all"
                  title={`已牢記: ${stats.masteredCards}`}
                />
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl dark:bg-slate-800/60 text-center">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-400 mb-1" />
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  {stats.newCards}
                </div>
                <div className="text-[11px] text-slate-500">剛加入 (新卡)</div>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl dark:bg-indigo-950/30 text-center">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500 mb-1" />
                <div className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                  {stats.learningCards}
                </div>
                <div className="text-[11px] text-indigo-600 dark:text-indigo-400">間隔強化中</div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl dark:bg-emerald-950/30 text-center">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mb-1" />
                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                  {stats.masteredCards}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400">已牢固記憶</div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-2">
              依據艾賓浩斯遺忘曲線與 SM-2 間隔演算法，每個單字經過 4 次以上的成功間隔複習後，將進入長效記憶區。
            </p>
          </div>
        </div>

        {/* 7-Day Review Schedule Forecast */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs dark:bg-slate-900 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-sky-600" />
            未來複習排程預測
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900">
              <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                今日到期 (Today)
              </span>
              <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                {stats.dueToday} 張
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                明天 (Tomorrow)
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {stats.dueTomorrow} 張
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                未來 3 天內 (Next 3 Days)
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {stats.dueIn3Days} 張
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                未來一週內 (Next 7 Days)
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {stats.dueIn7Days} 張
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Language Breakdown */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-emerald-600" />
          跨語言學習統計
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(stats.langCounts).map(([code, count]) => {
            const langMeta = LANGUAGE_OPTIONS.find((l) => l.code === code);
            const percent = cards.length > 0 ? Math.round((count / cards.length) * 100) : 0;

            return (
              <div
                key={code}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800"
              >
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <span>{langMeta?.flag || '🌐'}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {langMeta?.name || code}
                  </span>
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {count} <span className="text-xs font-normal text-slate-400">詞 ({percent}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
