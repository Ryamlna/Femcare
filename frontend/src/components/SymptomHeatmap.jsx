import { useMemo } from 'react';
import { addDays, fmtLong, isoOf, todayISO, weekday } from '../utils/dates.js';
import { painLabel } from '../utils/constants.js';

const WEEKS = 18;
const CELL = 15;
const GAP = 4;

const colorFor = (log) => {
  if (!log) return 'rgba(255,255,255,0.06)';
  const p = log.painScale;
  if (p === 0) return 'rgba(155,107,255,0.22)';
  if (p <= 3) return '#7C4DDB';
  if (p <= 6) return '#C264D6';
  if (p <= 8) return '#F472B6';
  return '#FB923C';
};

const LEGEND = [
  ['rgba(255,255,255,0.06)', 'Belum dicatat'], ['rgba(155,107,255,0.22)', '0'], ['#7C4DDB', '1–3'],
  ['#C264D6', '4–6'], ['#F472B6', '7–8'], ['#FB923C', '9–10'],
];

export default function SymptomHeatmap({ logs }) {
  const { cells, byDate } = useMemo(() => {
    const today = todayISO();
    const start = addDays(today, -(weekday(today) + 7 * (WEEKS - 1)));
    const map = Object.fromEntries(logs.map((l) => [isoOf(l.date), l]));
    return { byDate: map, cells: Array.from({ length: WEEKS * 7 }, (_, i) => addDays(start, i)), today };
  }, [logs]);
  const today = todayISO();

  return (
    <section className="glass rounded-2xl p-5 sm:p-6" aria-labelledby="heatmap-title">
      <h2 id="heatmap-title" className="font-display text-xl font-semibold">Peta intensitas nyeri</h2>
      <p className="mt-1 text-sm text-white/55">18 minggu terakhir. Titik putih menandai hari haid.</p>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        <div className="grid text-[11px] text-white/40" style={{ gridTemplateRows: `repeat(7, ${CELL}px)`, rowGap: GAP }} aria-hidden>
          {['', 'Sen', '', 'Rab', '', 'Jum', ''].map((d, i) => <span key={i} className="leading-[15px]">{d}</span>)}
        </div>
        <div className="grid" role="img" aria-label="Heatmap intensitas nyeri harian"
          style={{ gridAutoFlow: 'column', gridTemplateRows: `repeat(7, ${CELL}px)`, gridAutoColumns: `${CELL}px`, gap: GAP }}>
          {cells.map((d) => {
            if (d > today) return <span key={d} />;
            const log = byDate[d];
            return (
              <span key={d} title={`${fmtLong(d)}: ${log ? `nyeri ${log.painScale}/10 (${painLabel(log.painScale)})` : 'belum dicatat'}`}
                className="relative rounded-[4px]" style={{ background: colorFor(log) }}>
                {log?.isMenstruating && <i className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/55">
        {LEGEND.map(([c, label]) => (
          <span key={label} className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-[3px]" style={{ background: c }} />{label}</span>
        ))}
      </div>
    </section>
  );
}
