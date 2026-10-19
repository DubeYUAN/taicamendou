import { Flashcard, ReviewHistoryItem } from '../types';

/**
 * SM-2 Spaced Repetition Algorithm Implementation
 * Quality Ratings:
 * 1: Again (忘記了) - Reset interval to 1 day, repetition to 0, EF decreased
 * 2: Hard (困難) - Sub-interval increase, small EF decrease
 * 3: Good (記得) - Standard SM-2 interval increase
 * 4: Easy (熟練) - Accelerated interval increase, EF bonus
 */

export interface SRSResult {
  interval: number;
  repetition: number;
  easeFactor: number;
  dueDate: number;
  isMistake: boolean;
  mistakeCount: number;
  correctCount: number;
  lastMistakeAt?: number;
  historyItem: ReviewHistoryItem;
}

export function calculateSRS(
  card: Flashcard,
  rating: 1 | 2 | 3 | 4,
  reviewType: 'srs' | 'quiz' | 'spelling' | 'mistake-drill' = 'srs'
): SRSResult {
  let { interval, repetition, easeFactor, mistakeCount, correctCount } = card;
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  // Map 1-4 to SuperMemo SM-2 quality (0-5)
  // 1: Again -> q=1
  // 2: Hard  -> q=3
  // 3: Good  -> q=4
  // 4: Easy  -> q=5
  const q = rating === 1 ? 1 : rating === 2 ? 3 : rating === 3 ? 4 : 5;

  // Calculate new Ease Factor (EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
  let newEaseFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  let newInterval = interval;
  let newRepetition = repetition;
  let newIsMistake = card.isMistake;
  let lastMistakeAt = card.lastMistakeAt;

  if (rating === 1) {
    // Forgot card: mark as mistake, reset progress
    newInterval = 1;
    newRepetition = 0;
    newIsMistake = true;
    mistakeCount += 1;
    lastMistakeAt = now;
  } else if (rating === 2) {
    // Hard: small progress or repeated mistake
    if (newRepetition === 0) {
      newInterval = 1;
      newRepetition = 1;
    } else {
      newInterval = Math.max(1, Math.round(interval * 1.2));
    }
  } else if (rating === 3) {
    // Good: standard SM-2 progression
    correctCount += 1;
    if (newRepetition === 0) {
      newInterval = 1;
    } else if (newRepetition === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
    newRepetition += 1;

    // If card was in mistake notebook and answered Good, keep or clear?
    // We let users manually remove or if answered Good/Easy twice consecutively
  } else if (rating === 4) {
    // Easy: accelerated progression
    correctCount += 1;
    if (newRepetition === 0) {
      newInterval = 3;
    } else if (newRepetition === 1) {
      newInterval = 8;
    } else {
      newInterval = Math.round(interval * newEaseFactor * 1.35);
    }
    newRepetition += 1;
  }

  // Calculate next due date at midnight of that day
  const dueMidnight = getMidnight(now + newInterval * ONE_DAY_MS);

  return {
    interval: newInterval,
    repetition: newRepetition,
    easeFactor: Number(newEaseFactor.toFixed(2)),
    dueDate: dueMidnight,
    isMistake: newIsMistake,
    mistakeCount,
    correctCount,
    lastMistakeAt,
    historyItem: {
      date: now,
      rating,
      type: reviewType,
    },
  };
}

export function getMidnight(timestamp: number = Date.now()): number {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function isDue(card: Flashcard, targetDate: number = Date.now()): boolean {
  return card.dueDate <= targetDate;
}

export function getIntervalPreview(card: Flashcard, rating: 1 | 2 | 3 | 4): string {
  if (rating === 1) return '1天 (重溫)';
  if (rating === 2) {
    const days = card.repetition === 0 ? 1 : Math.max(1, Math.round(card.interval * 1.2));
    return `${days}天`;
  }
  if (rating === 3) {
    let days = 1;
    if (card.repetition === 0) days = 1;
    else if (card.repetition === 1) days = 6;
    else days = Math.round(card.interval * card.easeFactor);
    return `${days}天`;
  }
  // rating === 4
  let days = 3;
  if (card.repetition === 0) days = 3;
  else if (card.repetition === 1) days = 8;
  else days = Math.round(card.interval * card.easeFactor * 1.35);
  return `${days}天`;
}
