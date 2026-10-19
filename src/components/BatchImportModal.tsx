import React, { useState } from 'react';
import { X, Upload, Sparkles, Check, AlertCircle, FileText } from 'lucide-react';
import { Flashcard, Deck, LANGUAGE_OPTIONS } from '../types';
import { getMidnight } from '../services/srs';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  decks: Deck[];
  onBatchImport: (newCards: Flashcard[]) => void;
}

const SAMPLE_TEXT = `ubiquitous | 無所不在的 | /juːˈbɪk.wə.təs/ | Smartphones are ubiquitous now.
ephemeral | 短暫的、轉瞬即逝的 | /ɪˈfem.ər.əl/ | Beauty can be ephemeral.
resilience | 復原力、韌性 | /rɪˈzɪl.jəns/ | She showed great resilience.
nostalgia | 懷舊之情 | /nɒsˈtæl.dʒə/ | The old song brought deep nostalgia.`;

export const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  onClose,
  decks,
  onBatchImport,
}) => {
  const [rawText, setRawText] = useState('');
  const [selectedDeckId, setSelectedDeckId] = useState(decks[0]?.id || '');
  const [selectedLang, setSelectedLang] = useState(decks[0]?.defaultLang || 'en-US');
  const [tagsInput, setTagsInput] = useState('匯入');

  if (!isOpen) return null;

  // Parse raw text into prospective cards
  const parsedRows = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      // Check delimiter: pipe '|', tab '\t', comma ',', or dash '-'
      let parts: string[] = [];
      if (line.includes('|')) {
        parts = line.split('|').map((s) => s.trim());
      } else if (line.includes('\t')) {
        parts = line.split('\t').map((s) => s.trim());
      } else if (line.includes(' - ')) {
        parts = line.split(' - ').map((s) => s.trim());
      } else if (line.includes(',')) {
        parts = line.split(',').map((s) => s.trim());
      } else {
        parts = [line];
      }

      const word = parts[0] || '';
      const meaning = parts[1] || '';
      const phonetic = parts[2] || '';
      const example = parts[3] || '';

      return {
        word,
        meaning,
        phonetic,
        example,
        isValid: Boolean(word && meaning),
      };
    });

  const validRows = parsedRows.filter((r) => r.isValid);

  const handleImport = () => {
    if (validRows.length === 0) return;

    const now = Date.now();
    const todayMidnight = getMidnight(now);
    const tags = tagsInput
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const newCards: Flashcard[] = validRows.map((row, idx) => ({
      id: `card-${now}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      word: row.word,
      phonetic: row.phonetic,
      meaning: row.meaning,
      example: row.example,
      exampleTranslation: '',
      notes: '',
      lang: selectedLang,
      deckId: selectedDeckId || (decks[0]?.id ?? 'default'),
      tags,
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

    onBatchImport(newCards);
    setRawText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              批次快速匯入單字
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Deck & Lang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                匯入至卡組
              </label>
              <select
                value={selectedDeckId}
                onChange={(e) => setSelectedDeckId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 cursor-pointer"
              >
                {decks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                單字發音語言
              </label>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 cursor-pointer"
              >
                {LANGUAGE_OPTIONS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Paste area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                貼上單字文字 (支援直式貼上、試算表複製、或自訂符號)
              </label>
              <button
                type="button"
                onClick={() => setRawText(SAMPLE_TEXT)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
              >
                帶入範例格式
              </button>
            </div>

            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="每行一個單字，格式支援：&#10;單字 | 中文解釋 | 音標(選填) | 例句(選填)&#10;或從 Excel / Google Sheets 直接複製貼上"
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              支援的分隔符號：垂直線 ( | )、Tab 定位點、破折號 ( - )、逗號 ( , )
            </p>
          </div>

          {/* Tag input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              預設添加標籤
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="例如：初級, 旅遊, 考試"
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          {/* Parse Preview Table */}
          {parsedRows.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <span>解析預覽 (成功辨識 {validRows.length} / {parsedRows.length} 行)</span>
                {validRows.length < parsedRows.length && (
                  <span className="text-rose-500 text-[11px]">部分格式未包含中文解釋</span>
                )}
              </div>

              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2">單字</th>
                      <th className="p-2">中文釋義</th>
                      <th className="p-2">音標</th>
                      <th className="p-2">例句</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={row.isValid ? '' : 'bg-rose-50/50 dark:bg-rose-950/20 text-rose-600'}
                      >
                        <td className="p-2 font-bold">{row.word || '-'}</td>
                        <td className="p-2">{row.meaning || '(缺釋義)'}</td>
                        <td className="p-2 font-mono text-slate-400">{row.phonetic || '-'}</td>
                        <td className="p-2 text-slate-500 truncate max-w-xs">{row.example || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            disabled={validRows.length === 0}
            onClick={handleImport}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check size={14} />
            <span>確認匯入 {validRows.length} 個單字</span>
          </button>
        </div>
      </div>
    </div>
  );
};
