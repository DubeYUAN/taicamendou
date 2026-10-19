import React, { useState, useEffect } from 'react';
import { X, Volume2, Sparkles, Tag, Plus, Check } from 'lucide-react';
import { Flashcard, Deck, QuizSettings, LANGUAGE_OPTIONS } from '../types';
import { tts } from '../services/tts';
import { getMidnight } from '../services/srs';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardToEdit?: Flashcard | null;
  decks: Deck[];
  settings: QuizSettings;
  onSaveCard: (card: Flashcard) => void;
}

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  cardToEdit,
  decks,
  settings,
  onSaveCard,
}) => {
  const [word, setWord] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [exampleTranslation, setExampleTranslation] = useState('');
  const [notes, setNotes] = useState('');
  const [lang, setLang] = useState('en-US');
  const [deckId, setDeckId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isMistake, setIsMistake] = useState(false);

  useEffect(() => {
    if (cardToEdit) {
      setWord(cardToEdit.word);
      setPhonetic(cardToEdit.phonetic || '');
      setMeaning(cardToEdit.meaning);
      setExample(cardToEdit.example || '');
      setExampleTranslation(cardToEdit.exampleTranslation || '');
      setNotes(cardToEdit.notes || '');
      setLang(cardToEdit.lang || 'en-US');
      setDeckId(cardToEdit.deckId);
      setTagsInput(cardToEdit.tags?.join(', ') || '');
      setIsMistake(!!cardToEdit.isMistake);
    } else {
      setWord('');
      setPhonetic('');
      setMeaning('');
      setExample('');
      setExampleTranslation('');
      setNotes('');
      setLang(decks[0]?.defaultLang || 'en-US');
      setDeckId(decks[0]?.id || '');
      setTagsInput('');
      setIsMistake(false);
    }
  }, [cardToEdit, decks, isOpen]);

  if (!isOpen) return null;

  const handleTestAudio = () => {
    if (!word.trim()) return;
    tts.speak(word.trim(), lang, settings.speechRate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) return;

    const tags = tagsInput
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const now = Date.now();
    const todayMidnight = getMidnight(now);

    if (cardToEdit) {
      const updated: Flashcard = {
        ...cardToEdit,
        word: word.trim(),
        phonetic: phonetic.trim(),
        meaning: meaning.trim(),
        example: example.trim(),
        exampleTranslation: exampleTranslation.trim(),
        notes: notes.trim(),
        lang,
        deckId: deckId || (decks[0]?.id ?? 'default'),
        tags,
        isMistake,
        updatedAt: now,
      };
      onSaveCard(updated);
    } else {
      const newCard: Flashcard = {
        id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        word: word.trim(),
        phonetic: phonetic.trim(),
        meaning: meaning.trim(),
        example: example.trim(),
        exampleTranslation: exampleTranslation.trim(),
        notes: notes.trim(),
        lang,
        deckId: deckId || (decks[0]?.id ?? 'default'),
        tags,
        createdAt: now,
        updatedAt: now,
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        dueDate: todayMidnight, // Available for review right away
        isMistake,
        mistakeCount: isMistake ? 1 : 0,
        correctCount: 0,
        reviewHistory: [],
      };
      onSaveCard(newCard);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {cardToEdit ? '編輯單字卡' : '新增單字卡'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Word + Test audio button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                單字 / 詞彙 (Term) *
              </label>
              {word.trim() && (
                <button
                  type="button"
                  onClick={handleTestAudio}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold cursor-pointer"
                >
                  <Volume2 size={13} />
                  <span>試聽發音</span>
                </button>
              )}
            </div>
            <input
              type="text"
              required
              autoFocus
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="例如：ephemeral、木漏れ日、despacio..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-base font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          {/* Language & Deck selection row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                發音語言 (Language)
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 cursor-pointer"
              >
                {LANGUAGE_OPTIONS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                所屬卡組 (Deck)
              </label>
              <select
                value={deckId}
                onChange={(e) => setDeckId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 cursor-pointer"
              >
                {decks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Phonetic / Reading */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              音標 / 假名讀音 / 拼音 (選填)
            </label>
            <input
              type="text"
              value={phonetic}
              onChange={(e) => setPhonetic(e.target.value)}
              placeholder="例如：/ɪˈfem.ər.əl/ 或 こもれび"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          {/* Meaning / Translation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              中文釋義 / 翻譯 (Meaning) *
            </label>
            <textarea
              required
              rows={2}
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="例如：短暫的；轉瞬即逝的"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          {/* Example Sentence & Translation */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              例句與例句翻譯 (選填)
            </label>
            <input
              type="text"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="例句原文，例如：Fame can be quite ephemeral."
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
            <input
              type="text"
              value={exampleTranslation}
              onChange={(e) => setExampleTranslation(e.target.value)}
              placeholder="例句中文翻譯，例如：名氣可能相當短暫。"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          {/* Notes / Mnemonics */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              記憶口訣 / 詞根筆記 (選填)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="字根字首、同義詞、聯想記憶口訣..."
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              標籤 (以逗號或空格分隔)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="例如：TOEIC, 高級詞彙, 旅行"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          {/* Mistake Flag toggle */}
          <div className="pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isMistake}
                onChange={(e) => setIsMistake(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                加入錯題專區（加強專注練習此詞）
              </span>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              儲存單字卡
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
