import React from 'react';
import { 
  BookOpen, 
  BrainCircuit, 
  AlertCircle, 
  FolderKanban, 
  BarChart3, 
  Plus, 
  Flame, 
  Settings, 
  Upload
} from 'lucide-react';
import { StreakInfo } from '../services/storage';
import { ASSET_IMAGES } from '../assets';

export type ActiveTab = 'srs' | 'quiz' | 'mistakes' | 'cards' | 'stats';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  dueCount: number;
  mistakesCount: number;
  totalCardsCount: number;
  streak: StreakInfo;
  onOpenNewCard: () => void;
  onOpenBatchImport: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  dueCount,
  mistakesCount,
  totalCardsCount,
  streak,
  onOpenNewCard,
  onOpenBatchImport,
  onOpenSettings,
}) => {
  const navItems = [
    {
      id: 'srs' as ActiveTab,
      label: '間隔複習',
      icon: BrainCircuit,
      badge: dueCount > 0 ? dueCount : null,
      badgeColor: 'bg-indigo-600 text-white',
    },
    {
      id: 'quiz' as ActiveTab,
      label: '測驗出題',
      icon: BookOpen,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'mistakes' as ActiveTab,
      label: '錯題專區',
      icon: AlertCircle,
      badge: mistakesCount > 0 ? mistakesCount : null,
      badgeColor: 'bg-rose-500 text-white font-bold animate-pulse',
    },
    {
      id: 'cards' as ActiveTab,
      label: '單字庫',
      icon: FolderKanban,
      badge: totalCardsCount > 0 ? totalCardsCount : null,
      badgeColor: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    },
    {
      id: 'stats' as ActiveTab,
      label: '學習統計',
      icon: BarChart3,
      badge: null,
      badgeColor: '',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs dark:bg-slate-900/95 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('srs')}
              className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
            >
              <img
                src={ASSET_IMAGES.logo}
                alt="VocabFlow Logo"
                className="w-10 h-10 rounded-xl shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-900 via-indigo-700 to-sky-700 bg-clip-text text-transparent dark:from-white dark:to-indigo-300">
                  VocabFlow
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                  SRS 智能單字庫
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/50 dark:text-indigo-300'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span
                      className={`text-xs px-2 py-0.2 rounded-full font-medium ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 rounded-full dark:bg-indigo-400" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Counter */}
            <div
              title={`連續學習 ${streak.currentStreak} 天`}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-semibold dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300 select-none"
            >
              <Flame size={15} className="text-amber-500 fill-amber-500 animate-pulse" />
              <span>連續 {streak.currentStreak} 天</span>
            </div>

            {/* Quick Batch Import */}
            <button
              onClick={onOpenBatchImport}
              title="批次匯入單字"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Upload size={18} />
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              title="語音與學習設定"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Settings size={18} />
            </button>

            {/* Add Card Button */}
            <button
              onClick={onOpenNewCard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus size={16} className="stroke-[2.5]" />
              <span className="hidden sm:inline">新增單字</span>
              <span className="sm:hidden">新增</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium cursor-pointer relative ${
                  isActive
                    ? 'text-indigo-600 font-semibold dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <div className="relative">
                  <Icon size={18} />
                  {item.badge !== null && (
                    <span
                      className={`absolute -top-1 -right-2 text-[10px] px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full leading-none font-bold ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
