import React, { useRef, useState } from 'react';
import { X, Volume2, Download, Upload, RotateCcw, Check, Sparkles } from 'lucide-react';
import { QuizSettings, Flashcard, Deck } from '../types';
import { tts } from '../services/tts';
import { INITIAL_CARDS, INITIAL_DECKS } from '../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: QuizSettings;
  onSaveSettings: (settings: QuizSettings) => void;
  cards: Flashcard[];
  decks: Deck[];
  onRestoreData: (cards: Flashcard[], decks: Deck[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  cards,
  decks,
  onRestoreData,
}) => {
  const [localSettings, setLocalSettings] = useState<QuizSettings>(settings);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSpeechRateChange = (rate: number) => {
    setLocalSettings((prev) => ({ ...prev, speechRate: rate }));
  };

  const handleTestAudio = () => {
    tts.speak('Hello! Welcome to VocabFlow. 歡迎使用智能間隔複習。', 'en-US', localSettings.speechRate);
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  // Export full JSON backup
  const handleExportJSON = () => {
    const payload = {
      version: 1,
      exportDate: new Date().toISOString(),
      decks,
      cards,
      settings: localSettings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vocabflow_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  // Import JSON backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.cards) && Array.isArray(parsed.decks)) {
          onRestoreData(parsed.cards, parsed.decks);
          setMessage(`成功還原 ${parsed.cards.length} 張單字卡與 ${parsed.decks.length} 個卡組！`);
          setTimeout(() => setMessage(null), 3500);
        } else {
          alert('匯入格式不符合 VocabFlow 備份格式。');
        }
      } catch (err) {
        alert('解析 JSON 檔案失敗，請檢查檔案格式。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset to initial
  const handleResetSampleData = () => {
    if (
      window.confirm('確定要重置為預設示範資料嗎？現有單字卡將被預設卡片取代。建議先下載備份！')
    ) {
      onRestoreData(INITIAL_CARDS, INITIAL_DECKS);
      setMessage('已重置為預設示範單字庫！');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            偏好設定與資料備份
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {message && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 flex items-center gap-1.5">
              <Check size={14} className="text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          {/* Audio & Speech synthesis Settings */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              自動發音與語音合成 (TTS)
            </h3>

            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
              {/* Auto Pronounce Switch */}
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    顯示單字卡時自動發音
                  </div>
                  <div className="text-xs text-slate-400">
                    在翻開卡片或進入測驗時立即朗讀
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.autoPronounce}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      autoPronounce: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
                />
              </label>

              {/* Speech Rate Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    發音語速：{localSettings.speechRate}x
                  </span>
                  <button
                    type="button"
                    onClick={handleTestAudio}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                  >
                    <Volume2 size={13} />
                    <span>試聽語速</span>
                  </button>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.3"
                  step="0.05"
                  value={localSettings.speechRate}
                  onChange={(e) => handleSpeechRateChange(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>慢速 (0.7x)</span>
                  <span>標準 (1.0x)</span>
                  <span>快速 (1.3x)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Session settings */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              測驗與複習偏好
            </h3>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  每輪最大練習卡片數
                </span>
                <select
                  value={localSettings.maxCardsPerSession}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      maxCardsPerSession: parseInt(e.target.value),
                    }))
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                >
                  <option value={10}>10 張</option>
                  <option value={20}>20 張</option>
                  <option value={30}>30 張</option>
                  <option value={50}>50 張</option>
                </select>
              </div>

              <label className="flex items-center justify-between cursor-pointer pt-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  出題隨機打亂順序
                </span>
                <input
                  type="checkbox"
                  checked={localSettings.shuffle}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      shuffle: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded text-indigo-600"
                />
              </label>
            </div>
          </div>

          {/* Backup & Restore */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              資料備份與還原
            </h3>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold dark:bg-slate-800 dark:text-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download size={14} />
                <span>下載完整備份 (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold dark:bg-slate-800 dark:text-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Upload size={14} />
                <span>還原備份檔案</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="mt-3 text-right">
              <button
                type="button"
                onClick={handleResetSampleData}
                className="text-xs text-rose-500 hover:text-rose-700 cursor-pointer inline-flex items-center gap-1"
              >
                <RotateCcw size={12} />
                <span>恢復系統示範單字卡</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer"
          >
            儲存設定
          </button>
        </div>
      </div>
    </div>
  );
};
