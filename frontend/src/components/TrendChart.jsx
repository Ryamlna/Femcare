import { useMemo } from 'react';
import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MOODS, moodByKey } from '../utils/constants.js';
import { addDays, fmtShort, isoOf, todayISO } from '../utils/dates.js';
import { moodScore } from '../utils/analytics.js';

const DAYS = 30;
const moodTick = (v) => MOODS.find((m) => m.score === v)?.emoji ?? '';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="glass-strong rounded-xl px-3.5 py-2.5 text-sm">
      <p className="font-semibold">{label}</p>
      <p className="text-blush">Nyeri: {row.pain ?? '—'}{row.pain != null && ' / 10'}</p>
      <p className="text-amethyst-300">Suasana hati: {row.moodKey ? `${moodByKey[row.moodKey].emoji} ${moodByKey[row.moodKey].label}` : '—'}</p>
    </div>
  );
}

export default function TrendChart({ logs }) {
  const data = useMemo(() => {
    const today = todayISO();
    const map = Object.fromEntries(logs.map((l) => [isoOf(l.date), l]));
    return Array.from({ length: DAYS }, (_, i) => {
      const d = addDays(today, -(DAYS - 1 - i));
      const l = map[d];
      return { date: d, label: fmtShort(d), pain: l ? l.painScale : null, mood: l ? moodScore(l.mood) : null, moodKey: l?.mood ?? null };
    });
  }, [logs]);

  return (
    <section className="glass rounded-2xl p-5 sm:p-6" aria-labelledby="trend-title">
      <h2 id="trend-title" className="font-display text-xl font-semibold">Nyeri dan suasana hati</h2>
      <p className="mt-1 text-sm text-white/55">30 hari terakhir. Lihat apakah suasana hati turun saat nyeri naik.</p>
      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="painFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F472B6" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#F472B6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} interval={4} tickLine={false} axisLine={false} />
            <YAxis yAxisId="pain" domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="mood" orientation="right" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tickFormatter={moodTick} tick={{ fontSize: 14 }} tickLine={false} axisLine={false} width={34} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }} />
            <Area yAxisId="pain" type="monotone" dataKey="pain" name="Tingkat nyeri" stroke="#F472B6" strokeWidth={2.5} fill="url(#painFill)" connectNulls dot={{ r: 2.5, fill: '#F472B6' }} />
            <Line yAxisId="mood" type="monotone" dataKey="mood" name="Suasana hati" stroke="#B08BFF" strokeWidth={2.5} strokeDasharray="5 4" connectNulls dot={{ r: 2.5, fill: '#B08BFF' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
