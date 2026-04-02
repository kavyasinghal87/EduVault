export interface SM2Result {
  easiness_factor: number;
  interval: number;
  repetitions: number;
  next_review_at: string;
}

/**
 * Calculates the next interval for a flashcard based on the SM-2 algorithm.
 * @param quality 0-5 rating (0: Complete blackout, 1: Wrong/familiar, 2: Wrong/easy, 3: Hard, 4: Good, 5: Easy)
 * @param previousEasiness Current easiness factor (default: 2.5)
 * @param previousInterval Current interval in days (default: 0)
 * @param previousRepetitions Current consecutive correct repetitions (default: 0)
 * @returns SM2Result containing the new values
 */
export function calculateSM2(
  quality: number,
  previousEasiness: number = 2.5,
  previousInterval: number = 0,
  previousRepetitions: number = 0
): SM2Result {
  let repetitions = previousRepetitions;
  let interval = previousInterval;
  let easiness = previousEasiness;

  // Rating < 3 means incorrect response
  if (quality >= 3) {
    // Correct response answers
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easiness);
    }
    repetitions += 1;
  } else {
    // Incorrect response
    repetitions = 0;
    interval = 1;
  }

  // Update easiness factor
  easiness =
    previousEasiness +
    (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Ensure easiness factor never drops below 1.3
  if (easiness < 1.3) {
    easiness = 1.3;
  }

  // Calculate next review timestamp
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    easiness_factor: Number(easiness.toFixed(2)),
    interval,
    repetitions,
    next_review_at: nextReview.toISOString(),
  };
}
