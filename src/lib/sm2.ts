export type Rating = 0 | 1 | 2 | 3;

export interface SRSData {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
}

export function calculateNextReview(data: SRSData, rating: Rating): SRSData {
  let { easeFactor, interval, repetitions } = data;
  let newEaseFactor = easeFactor;
  let newInterval: number;
  let newRepetitions: number;

  if (rating === 0) {
    newRepetitions = 0;
    newInterval = 1;
    newEaseFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    const quality = rating + 2;
    newEaseFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (repetitions === 0) newInterval = 1;
    else if (repetitions === 1) newInterval = 6;
    else newInterval = Math.round(interval * easeFactor);
    newRepetitions = repetitions + 1;
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);
  return { easeFactor: newEaseFactor, interval: newInterval, repetitions: newRepetitions, nextReview };
}

export function getDefaultSRSData(): SRSData {
  return { easeFactor: 2.5, interval: 0, repetitions: 0, nextReview: new Date() };
}

export function isDue(nextReview: Date): boolean {
  return new Date() >= nextReview;
}

export function calculateXPGained(rating: Rating, streak: number): number {
  const base = [0, 5, 10, 15][rating];
  return Math.round(base * Math.min(1 + streak * 0.05, 2));
}
