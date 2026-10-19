/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  loadCards, 
  saveCards, 
  loadDecks, 
  saveDecks, 
  loadSettings, 
  saveSettings, 
  loadStreak, 
  recordStudyActivity, 
  StreakInfo 
} from './services/storage';
import { Flashcard, Deck, QuizSettings } from './types';
import { Navbar, ActiveTab } from './components/Navbar';
import { SrsHome } from './components/SrsHome';
import { QuizCenter } from './components/QuizCenter';
import { MistakesNotebook } from './components/MistakesNotebook';
import { CardList } from './components/CardList';
import { StatsDashboard } from './components/StatsDashboard';
import { CardModal } from './components/CardModal';
import { BatchImportModal } from './components/BatchImportModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [cards, setCards] = useState<Flashcard[]>(() => loadCards());
  const [decks, setDecks] = useState<Deck[]>(() => loadDecks());
  const [settings, setSettings] = useState<QuizSettings>(() => loadSettings());
  const [streak, setStreak] = useState<StreakInfo>(() => loadStreak());

  const [activeTab, setActiveTab] = useState<ActiveTab>('srs');

  // Modals state
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Flashcard | null>(null);
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Quiz route params
  const [quizInitialMode, setQuizInitialMode] = useState<'choice' | 'spelling' | 'flashcard'>('choice');
  const [quizMistakesOnly, setQuizMistakesOnly] = useState<boolean>(false);

  // Sync cards to localStorage
  const handleUpdateCard = useCallback((updatedCard: Flashcard) => {
    setCards((prev) => {
      const next = prev.map((c) => (c.id === updatedCard.id ? updatedCard : c));
      saveCards(next);
      return next;
    });
  }, []);

  const handleSaveCard = useCallback((card: Flashcard) => {
    setCards((prev) => {
      const exists = prev.some((c) => c.id === card.id);
      const next = exists ? prev.map((c) => (c.id === card.id ? card : c)) : [card, ...prev];
      saveCards(next);
      return next;
    });
  }, []);

  const handleDeleteCard = useCallback((id: string) => {
    if (window.confirm('確定要刪除這張單字卡嗎？此操作無法還原。')) {
      setCards((prev) => {
        const next = prev.filter((c) => c.id !== id);
        saveCards(next);
        return next;
      });
    }
  }, []);

  const handleBatchDeleteCards = useCallback((ids: string[]) => {
    setCards((prev) => {
      const next = prev.filter((c) => !ids.includes(c.id));
      saveCards(next);
      return next;
    });
  }, []);

  const handleBatchImport = useCallback((newCards: Flashcard[]) => {
    setCards((prev) => {
      const next = [...newCards, ...prev];
      saveCards(next);
      return next;
    });
  }, []);

  const handleCreateDeck = useCallback((newDeck: Deck) => {
    setDecks((prev) => {
      const next = [...prev, newDeck];
      saveDecks(next);
      return next;
    });
  }, []);

  const handleSaveSettings = useCallback((newSettings: QuizSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  const handleRestoreData = useCallback((restoredCards: Flashcard[], restoredDecks: Deck[]) => {
    setCards(restoredCards);
    setDecks(restoredDecks);
    saveCards(restoredCards);
    saveDecks(restoredDecks);
  }, []);

  const handleCompleteSession = useCallback(() => {
    const updatedStreak = recordStudyActivity();
    setStreak(updatedStreak);
  }, []);

  // Open modal helpers
  const handleOpenNewCard = () => {
    setCardToEdit(null);
    setIsCardModalOpen(true);
  };

  const handleOpenEditCard = (card?: Flashcard) => {
    setCardToEdit(card || null);
    setIsCardModalOpen(true);
  };

  // Quick navigation helpers to QuizCenter
  const handleNavigateToQuiz = (
    mode: 'choice' | 'spelling' | 'flashcard' = 'choice',
    mistakesOnly: boolean = false
  ) => {
    setQuizInitialMode(mode);
    setQuizMistakesOnly(mistakesOnly);
    setActiveTab('quiz');
  };

  // Due & Mistakes counts for badges
  const dueCount = useMemo(() => {
    const now = Date.now();
    return cards.filter((c) => c.dueDate <= now).length;
  }, [cards]);

  const mistakesCount = useMemo(() => {
    return cards.filter((c) => c.isMistake || (c.mistakeCount && c.mistakeCount > 0)).length;
  }, [cards]);

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dueCount={dueCount}
        mistakesCount={mistakesCount}
        totalCardsCount={cards.length}
        streak={streak}
        onOpenNewCard={handleOpenNewCard}
        onOpenBatchImport={() => setIsBatchImportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'srs' && (
          <SrsHome
            cards={cards}
            decks={decks}
            settings={settings}
            streak={streak}
            dueCount={dueCount}
            mistakesCount={mistakesCount}
            onUpdateCard={handleUpdateCard}
            onOpenCardModal={handleOpenEditCard}
            onOpenBatchImport={() => setIsBatchImportOpen(true)}
            onCompleteSession={handleCompleteSession}
            onNavigateToQuiz={handleNavigateToQuiz}
            onNavigateToMistakes={() => setActiveTab('mistakes')}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizCenter
            key={`${quizInitialMode}-${quizMistakesOnly}`}
            cards={cards}
            decks={decks}
            settings={settings}
            onUpdateCard={handleUpdateCard}
            onOpenCardModal={handleOpenEditCard}
            onCompleteSession={handleCompleteSession}
            initialMode={quizInitialMode}
            initialMistakesOnly={quizMistakesOnly}
          />
        )}

        {activeTab === 'mistakes' && (
          <MistakesNotebook
            cards={cards}
            decks={decks}
            settings={settings}
            onUpdateCard={handleUpdateCard}
            onStartMistakeSRS={() => handleNavigateToQuiz('flashcard', true)}
            onStartMistakeChoice={() => handleNavigateToQuiz('choice', true)}
            onStartMistakeSpelling={() => handleNavigateToQuiz('spelling', true)}
            onOpenCardModal={handleOpenEditCard}
          />
        )}

        {activeTab === 'cards' && (
          <CardList
            cards={cards}
            decks={decks}
            settings={settings}
            onOpenCardModal={(c) => (c ? handleOpenEditCard(c) : handleOpenNewCard())}
            onUpdateCard={handleUpdateCard}
            onDeleteCard={handleDeleteCard}
            onBatchDeleteCards={handleBatchDeleteCards}
            onOpenBatchImport={() => setIsBatchImportOpen(true)}
            onCreateDeck={handleCreateDeck}
            onBatchImportCards={handleBatchImport}
          />
        )}

        {activeTab === 'stats' && (
          <StatsDashboard
            cards={cards}
            decks={decks}
            streak={streak}
          />
        )}
      </main>

      {/* Modals */}
      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        cardToEdit={cardToEdit}
        decks={decks}
        settings={settings}
        onSaveCard={handleSaveCard}
      />

      <BatchImportModal
        isOpen={isBatchImportOpen}
        onClose={() => setIsBatchImportOpen(false)}
        decks={decks}
        onBatchImport={handleBatchImport}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        cards={cards}
        decks={decks}
        onRestoreData={handleRestoreData}
      />
    </div>
  );
}
