import { diffDays } from './dates.js';

/**
 * Smart Alert: painScale > threshold selama >= minDays hari kalender berturut-turut.
 * @param {{date: Date, painScale: number}[]} logs
 */
export function detectPainAlert(logs, threshold = 8, minDays = 3) {
  const sorted = [...logs].sort((a, b) => a.date - b.date);
  let run = [];
  let best = null;

  for (const log of sorted) {
    if (log.painScale > threshold) {
      const prev = run[run.length - 1];
      run = prev && diffDays(log.date, prev.date) === 1 ? [...run, log] : [log];
      if (run.length >= minDays) best = run;
    } else {
      run = [];
    }
  }

  return best
    ? { triggered: true, streakDays: best.length, startDate: best[0].date, endDate: best[best.length - 1].date }
    : { triggered: false, streakDays: 0, startDate: null, endDate: null };
}
