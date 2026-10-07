import { SM2Revision } from '../types';

export interface SM2Result {
  intervalDays: number;
  repetitions: number;
  easinessFactor: number;
  nextReviewDate: string; // ISO date string YYYY-MM-DD
  retentionEstimate: number; // percentage (e.g. 92%)
}

/**
 * SuperMemo SM-2 Spaced Repetition Algorithm
 * @param grade Quality rating from 0 (blackout) to 5 (flawless recall)
 * @param currentRepetitions Previous number of consecutive successful repetitions
 * @param currentIntervalDays Previous interval in days
 * @param currentEF Previous Easiness Factor (default 2.5, min 1.3)
 */
export function calculateSM2(
  grade: number,
  currentRepetitions: number,
  currentIntervalDays: number,
  currentEF: number = 2.5
): SM2Result {
  const q = Math.max(0, Math.min(5, Math.round(grade)));
  let nextRepetitions = currentRepetitions;
  let nextInterval = currentIntervalDays;

  // Calculate new Easiness Factor
  let nextEF = currentEF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (nextEF < 1.3) {
    nextEF = 1.3;
  }

  // If grade < 3, review is failed: start repetitions from zero
  if (q < 3) {
    nextRepetitions = 0;
    nextInterval = 1;
  } else {
    // Review successful
    if (nextRepetitions === 0) {
      nextInterval = 1;
    } else if (nextRepetitions === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(currentIntervalDays * nextEF);
    }
    nextRepetitions += 1;
  }

  // Calculate next review date based on today
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + nextInterval);
  const nextReviewDate = nextDate.toISOString().split('T')[0];

  // Forgetting curve prediction: R = e^(-t / S)
  // Here retention estimate right after review is ~95-99%
  const stability = nextInterval * (nextEF / 2.5);
  const retentionEstimate = Math.min(99, Math.round(100 * Math.exp(-0.05 / Math.max(1, stability))));

  return {
    intervalDays: nextInterval,
    repetitions: nextRepetitions,
    easinessFactor: Number(nextEF.toFixed(2)),
    nextReviewDate,
    retentionEstimate,
  };
}

/**
 * Calculates days remaining until a review is due.
 * Negative number means overdue.
 */
export function getDaysUntilDue(nextReviewDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reviewDate = new Date(nextReviewDateStr);
  reviewDate.setHours(0, 0, 0, 0);
  const diffTime = reviewDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Returns current estimated retention percentage based on days elapsed since scheduled review.
 */
export function estimateCurrentRetention(item: SM2Revision): number {
  const daysUntilDue = getDaysUntilDue(item.nextReviewDate);
  if (daysUntilDue > 0) {
    // Not due yet: high retention
    const totalSpan = Math.max(1, item.intervalDays);
    const elapsed = totalSpan - daysUntilDue;
    const decay = (elapsed / totalSpan) * 15;
    return Math.max(82, Math.round(98 - decay));
  } else {
    // Overdue: drops exponentially
    const daysOverdue = Math.abs(daysUntilDue);
    const overdueDecay = daysOverdue * 6;
    return Math.max(25, Math.round(82 - overdueDecay));
  }
}
