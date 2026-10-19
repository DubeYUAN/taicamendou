import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Volume2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Layers, 
  Download, 
  CheckSquare, 
  Square,
  Sparkles,
  LayoutGrid,
  List,
  Tag
} from 'lucide-react';
import { Flashcard, Deck, QuizSettings, LANGUAGE_OPTIONS } from '../types';
import { AudioButton } from './AudioButton';
import { PRESET_DECK_ASSETS } from '../assets';
import { getMidnight } from '../services/srs';

interface CardListProps {
  cards: Flashcard[];
  decks: Deck[];
  settings: QuizSettings;
  onOpenCardModal: (card?: Flashcard) => void;
  onUpdateCard: (card: Flashcard) => void;
  onDeleteCard: (id: string) => void;
  onBatchDeleteCards: (ids: string[]) => void;
  onOpenBatchImport: () => void;
  onCreateDeck: (deck: Deck) => void;
  onBatchImportCards?: (cards: Flashcard[]) => void;
}

export const CardList: React.FC<CardListProps> = ({
  cards,
  decks,
  settings,
  onOpenCardModal,
  onUpdateCard,
  onDeleteCard,
  onBatchDeleteCards,
  onOpenBatchImport,
  onCreateDeck,
  onBatchImportCards,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeck, setSelectedDeck] = useState('all');
  const [selectedLang, setSelectedLang] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'due' | 'mistake' | 'mastered'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'due' | 'mistakes' | 'alpha'>('created');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [newDeckColor, setNewDeckColor] = useState('#3B82F6');

  // Filtered Cards
  const filteredCards = useMemo(() => {
    let list = [...cards];
    const now = Date.now();

    // Deck filter
    if (selectedDeck !== 'all') {
      list = list.filter((c) => c.deckId === selectedDeck);
    }

    // Language filter
    if (selectedLang !== 'all') {
      list = list.filter((c) => c.lang === selectedLang);
    }

    // Status filter
    if (selectedStatus === 'due') {
      list = list.filter((c) => c.dueDate <= now);
    } else if (selectedStatus === 'mistake') {
      list = list.filter((c) => c.isMistake || (c.mistakeCount && c.mistakeCount > 0));
    } else if (selectedStatus === 'mastered') {
      list = list.filter((c) => c.repetition >= 4);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.word.toLowerCase().includes(q) ||
          c.meaning.toLowerCase().includes(q) ||
          c.phonetic?.toLowerCase().includes(q) ||
          c.notes?.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'created') return b.createdAt - a.createdAt;
      if (sortBy === 'due') return a.dueDate - b.dueDate;
      if (sortBy === 'mistakes') return (b.mistakeCount || 0) - (a.mistakeCount || 0);
      return a.word.localeCompare(b.word);
    });

    return list;
  }, [cards, selectedDeck, selectedLang, selectedStatus, searchQuery, sortBy]);

  // Selection toggle
  const toggleSelectCard = (id: string) => {
    setSelectedCardIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCardIds.length === filteredCards.length) {
      setSelectedCardIds([]);
    } else {
      setSelectedCardIds(filteredCards.map((c) => c.id));
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`確定要刪除選取的 ${selectedCardIds.length} 個單字嗎？`)) {
      onBatchDeleteCards(selectedCardIds);
      setSelectedCardIds([]);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const targetCards = selectedCardIds.length > 0 
      ? cards.filter(c => selectedCardIds.includes(c.id))
      : filteredCards;

    if (targetCards.length === 0) return;

    const headers = ['Word', 'Phonetic', 'Meaning', 'Example', 'ExampleTranslation', 'Language', 'Deck', 'Mistakes'];
    const rows = targetCards.map(c => [
      `"${c.word.replace(/"/g, '""')}"`,
      `"${(c.phonetic || '').replace(/"/g, '""')}"`,
      `"${c.meaning.replace(/"/g, '""')}"`,
      `"${(c.example || '').replace(/"/g, '""')}"`,
      `"${(c.exampleTranslation || '').replace(/"/g, '""')}"`,
      `"${c.lang}"`,
      `"${decks.find(d => d.id === c.deckId)?.name || ''}"`,
      c.mistakeCount || 0
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vocabflow_cards_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateDeckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;

    const newDeck: Deck = {
      id: `deck-${Date.now()}`,
      name: newDeckName.trim(),
      description: newDeckDesc.trim(),
      color: newDeckColor,
      defaultLang: 'en-US',
      createdAt: Date.now(),
    };

    onCreateDeck(newDeck);
    setNewDeckName('');
    setNewDeckDesc('');
    setShowDeckModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            單字管理中心
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            共收錄 <span className="font-bold text-indigo-600">{cards.length}</span> 個單字，
            支援跨語言自訂、標籤整理與備份匯出。
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowPresetModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer flex items-center gap-1.5"
            title="瀏覽預載的精選題庫資源卡組"
          >
            <Sparkles size={14} className="text-indigo-600" />
            <span>精選題庫範本</span>
          </button>

          <button
            onClick={() => setShowDeckModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Layers size={14} />
            <span>新增卡組分類</span>
          </button>

          <button
            onClick={onOpenBatchImport}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>批次匯入</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
            title="匯出單字卡為 CSV 試算表格式"
          >
            <Download size={14} />
            <span>匯出 CSV</span>
          </button>

          <button
            onClick={() => onOpenCardModal()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>新增單字卡</span>
          </button>
        </div>
      </div>

      {/* Decks Carousel / Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        <button
          onClick={() => setSelectedDeck('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
            selectedDeck === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
          }`}
        >
          全部卡組 ({cards.length})
        </button>

        {decks.map((deck) => {
          const deckCount = cards.filter((c) => c.deckId === deck.id).length;
          const isCurrent = selectedDeck === deck.id;
          return (
            <button
              key={deck.id}
              onClick={() => setSelectedDeck(deck.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                isCurrent
                  ? 'text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
              }`}
              style={isCurrent ? { backgroundColor: deck.color } : undefined}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: deck.color }}
              />
              <span>{deck.name}</span>
              <span className="opacity-75">({deckCount})</span>
            </button>
          );
        })}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 mb-6 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full lg:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋單字、中文釋義、例句或標籤..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Language filter */}
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">所有語言</option>
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">全部狀態</option>
              <option value="due">今日待複習</option>
              <option value="mistake">歷史錯題</option>
              <option value="mastered">已熟練 (≥4次)</option>
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="created">建立時間 (新到舊)</option>
              <option value="due">下次複習時間</option>
              <option value="mistakes">錯誤次數</option>
              <option value="alpha">字母 A-Z</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-slate-100 p-0.5 dark:bg-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="網格卡片檢視"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="清單列表檢視"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Batch selection controls */}
        {selectedCardIds.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              已選取 <span className="font-bold text-indigo-600">{selectedCardIds.length}</span> 張單字卡
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
              >
                匯出選取的單字
              </button>
              <button
                onClick={handleDeleteSelected}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer flex items-center gap-1"
              >
                <Trash2 size={13} />
                批次刪除
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Card Content Display */}
      {filteredCards.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center dark:bg-slate-900 dark:border-slate-800">
          <Sparkles size={40} className="mx-auto text-indigo-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
            找不到符合條件的單字
          </h3>
          <p className="text-xs text-slate-500 mb-6 dark:text-slate-400">
            請調整篩選器或關鍵字，或者立即手動建立新的單字卡。
          </p>
          <button
            onClick={() => onOpenCardModal()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus size={14} />
            新增第一張單字卡
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => {
            const cardDeck = decks.find((d) => d.id === card.deckId);
            const lang = LANGUAGE_OPTIONS.find((l) => l.code === card.lang);
            const isSelected = selectedCardIds.includes(card.id);

            return (
              <div
                key={card.id}
                className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between dark:bg-slate-900 relative group ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900/60'
                    : 'border-slate-200/90 shadow-xs hover:shadow-md dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Header: Select + Deck + Badges */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSelectCard(card.id)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-indigo-600" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                      {cardDeck && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: cardDeck.color }}
                        >
                          {cardDeck.name}
                        </span>
                      )}
                      {lang && <span className="text-xs">{lang.flag}</span>}
                    </div>

                    <div className="flex items-center gap-1">
                      {card.isMistake && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                          錯題 ({card.mistakeCount})
                        </span>
                      )}
                      {card.repetition >= 4 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          已熟練
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Word & Phonetic */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {card.word}
                      </h3>
                      {card.phonetic && (
                        <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                          {card.phonetic}
                        </p>
                      )}
                    </div>
                    <AudioButton text={card.word} lang={card.lang} rate={settings.speechRate} size="sm" />
                  </div>

                  {/* Meaning */}
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    {card.meaning}
                  </p>

                  {/* Example */}
                  {card.example && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800 dark:text-slate-400 mb-2">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{card.example}</p>
                      {card.exampleTranslation && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{card.exampleTranslation}</p>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {card.tags && card.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {card.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1 text-[11px]">
                    <Calendar size={12} />
                    <span>間隔 {card.interval} 天</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenCardModal(card)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="編輯卡片"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteCard(card.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="刪除卡片"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs dark:bg-slate-900 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-300">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedCardIds.length === filteredCards.length && filteredCards.length > 0}
                      onChange={handleSelectAll}
                      className="rounded text-indigo-600"
                    />
                  </th>
                  <th className="p-3">單字 / 詞彙</th>
                  <th className="p-3">發音 / 標音</th>
                  <th className="p-3">中文釋義</th>
                  <th className="p-3">所屬卡組</th>
                  <th className="p-3 text-center">出錯次數</th>
                  <th className="p-3 text-center">下次複習</th>
                  <th className="p-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCards.map((card) => {
                  const cardDeck = decks.find((d) => d.id === card.deckId);
                  const isSelected = selectedCardIds.includes(card.id);
                  const daysToDue = Math.round((card.dueDate - Date.now()) / (24 * 3600 * 1000));

                  return (
                    <tr
                      key={card.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectCard(card.id)}
                          className="rounded text-indigo-600"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {card.word}
                          </span>
                          <AudioButton text={card.word} lang={card.lang} rate={settings.speechRate} size="sm" />
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-500">
                        {card.phonetic || '-'}
                      </td>
                      <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                        {card.meaning}
                      </td>
                      <td className="p-3">
                        {cardDeck && (
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-semibold text-white"
                            style={{ backgroundColor: cardDeck.color }}
                          >
                            {cardDeck.name}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {card.mistakeCount > 0 ? (
                          <span className="px-1.5 py-0.5 rounded font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                            {card.mistakeCount} 次
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {daysToDue <= 0 ? (
                          <span className="text-amber-600 font-semibold">今日待複習</span>
                        ) : (
                          <span className="text-slate-500">{daysToDue} 天後</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenCardModal(card)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteCard(card.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Deck Modal */}
      {showDeckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
              建立新單字卡組
            </h3>
            <form onSubmit={handleCreateDeckSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  卡組名稱 *
                </label>
                <input
                  type="text"
                  required
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="例如：多益核心、法語日常生活、西文基礎..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  卡組描述
                </label>
                <input
                  type="text"
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  placeholder="簡短描述這套卡組的用途..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  主題色彩標籤
                </label>
                <div className="flex items-center gap-2">
                  {['#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'].map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewDeckColor(c)}
                      className={`w-7 h-7 rounded-full cursor-pointer transition-transform ${
                        newDeckColor === c ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDeckModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  確認建立
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preset Decks Asset Modal */}
      {showPresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  精選題庫資源卡組範本
                </h3>
              </div>
              <button
                onClick={() => setShowPresetModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                關閉
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              由系統 assets 預載的精選跨語言單字庫，點選即可一鍵將卡組與單字安裝至您的學習庫：
            </p>

            <div className="space-y-3 max-h-72 overflow-y-auto mb-5">
              {PRESET_DECK_ASSETS.map((preset) => {
                const isAlreadyAdded = decks.some((d) => d.id === preset.deck.id);

                return (
                  <div
                    key={preset.deck.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 dark:bg-slate-800/50 dark:border-slate-700 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: preset.deck.color }}
                        />
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {preset.deck.name}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          {preset.cards.length} 詞
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {preset.deck.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isAlreadyAdded}
                      onClick={() => {
                        const now = Date.now();
                        const todayMidnight = getMidnight(now);

                        if (!isAlreadyAdded) {
                          onCreateDeck({
                            ...preset.deck,
                            createdAt: now,
                          });
                        }

                        const newCards: Flashcard[] = preset.cards.map((c, i) => ({
                          ...c,
                          id: `card-preset-${now}-${i}`,
                          deckId: preset.deck.id,
                          createdAt: now,
                          updatedAt: now,
                          interval: 1,
                          repetition: 0,
                          easeFactor: 2.5,
                          dueDate: todayMidnight,
                          isMistake: false,
                          mistakeCount: 0,
                          correctCount: 0,
                          reviewHistory: [],
                        }));

                        if (onBatchImportCards) {
                          onBatchImportCards(newCards);
                        }
                        setShowPresetModal(false);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        isAlreadyAdded
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                      }`}
                    >
                      {isAlreadyAdded ? '已在卡庫中' : '加入卡組'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowPresetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 cursor-pointer"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
