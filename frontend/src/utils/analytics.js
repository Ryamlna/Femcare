import { addDays, diffDays, isoOf } from './dates.js';
import { moodByKey } from './constants.js';

export const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
export const round1 = (n) => (n == null ? '—' : (Math.round(n * 10) / 10).toString());

/** Run hari berturut-turut dengan painScale > threshold (>= minDays). */
export function painStreaks(logs, threshold = 8, minDays = 3) {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const streaks = [];
  let run = [];
  const flush = () => { if (run.length >= minDays) streaks.push({ start: run[0], end: run[run.length - 1], days: run.length }); };
  for (const l of sorted) {
    const d = isoOf(l.date);
    if (l.painScale > threshold) {
      if (run.length && diffDays(d, run[run.length - 1]) === 1) run.push(d);
      else { flush(); run = [d]; }
    } else { flush(); run = []; }
  }
  flush();
  return streaks;
}

export function topSymptoms(logs, n = 3) {
  const count = {};
  logs.forEach((l) => l.symptoms?.forEach((s) => { count[s] = (count[s] || 0) + 1; }));
  return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, n);
}

/** Panjang siklus (hari) untuk siklus yang sudah selesai. */
export function cycleLengths(cycles) {
  return cycles
    .filter((c) => c.endDate)
    .map((c) => diffDays(isoOf(c.endDate), isoOf(c.startDate)) + 1);
}

/** Highlight Anomali untuk laporan medis. Bersifat penanda untuk didiskusikan dengan dokter, bukan diagnosis. */
export function findAnomalies(logs, cycles) {
  const out = [];
  const L = (s) => s.slice(0, 10);

  painStreaks(logs).forEach((s) =>
    out.push({ level: 'high', text: `Nyeri >8/10 selama ${s.days} hari berturut-turut (${L(s.start)} s.d. ${L(s.end)}).` }));

  const severe = logs.filter((l) => l.painScale >= 9);
  if (severe.length) out.push({ level: 'high', text: `Nyeri sangat berat (9–10/10) tercatat pada ${severe.length} hari.` });

  const heavy = logs.filter((l) => l.bleedingVolume === 'HEAVY');
  if (heavy.length >= 2) out.push({ level: 'high', text: `Volume perdarahan "banyak" tercatat pada ${heavy.length} hari.` });

  cycles.forEach((c) => {
    const days = logs.filter((l) => l.cycleId === c.id && l.isMenstruating).length;
    if (days > 7) out.push({ level: 'moderate', text: `Durasi haid ${days} hari pada siklus yang dimulai ${isoOf(c.startDate)} (lebih dari 7 hari).` });
  });

  cycleLengths(cycles).forEach((len, i) => {
    if (len < 21 || len > 35) out.push({ level: 'moderate', text: `Panjang siklus ${len} hari (di luar rentang umum 21–35 hari).` });
  });

  const lowSleep = logs.filter((l) => l.sleepHours != null && l.sleepHours < 5);
  if (lowSleep.length >= 3) out.push({ level: 'moderate', text: `Tidur kurang dari 5 jam pada ${lowSleep.length} hari.` });

  return out;
}

export const moodScore = (key) => moodByKey[key]?.score ?? null;
export { addDays };
