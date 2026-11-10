import { useCallback, useEffect, useMemo, useState } from 'react';
import { PencilLine } from 'lucide-react';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import DailyLogger from '../components/DailyLogger.jsx';
import SymptomHeatmap from '../components/SymptomHeatmap.jsx';
import TrendChart from '../components/TrendChart.jsx';
import SmartAlertBanner from '../components/SmartAlertBanner.jsx';
import Mascot from '../components/Mascot.jsx';
import { addDays, diffDays, isoOf, todayISO } from '../utils/dates.js';
import { avg, round1 } from '../utils/analytics.js';

function Stat({ label, value, hint }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-sm text-white/60">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-white/45">{hint}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [cycle, setCycle] = useState(null);
  const [alert, setAlert] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [l, c, a] = await Promise.all([
        api.get('/logs', { params: { days: 120 } }),
        api.get('/cycles/current'),
        api.get('/logs/alert'),
      ]);
      setLogs(l.data.logs);
      setCycle(c.data.cycle);
      setAlert(a.data.alert);
      setError('');
    } catch {
      setError('Data belum bisa dimuat. Periksa koneksi lalu muat ulang halaman.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const today = todayISO();
    const last7 = logs.filter((l) => isoOf(l.date) >= addDays(today, -6));
    return {
      cycleDay: cycle ? diffDays(today, isoOf(cycle.startDate)) + 1 : null,
      pain7: avg(last7.map((l) => l.painScale)),
      sleep7: avg(last7.filter((l) => l.sleepHours != null).map((l) => l.sleepHours)),
      logged30: logs.filter((l) => isoOf(l.date) >= addDays(today, -29)).length,
      loggedToday: logs.some((l) => isoOf(l.date) === today),
    };
  }, [logs, cycle]);

  // Ekspresi dan ucapan maskot mengikuti kondisi data pengguna.
  const mascot = useMemo(() => {
    if (alert?.triggered) return { mood: 'concerned', text: 'Aku khawatir. Yuk periksakan ke dokter ya.' };
    if (stats.pain7 != null && stats.pain7 >= 7) return { mood: 'sad', text: 'Hari yang berat ya. Pelan-pelan saja, aku di sini.' };
    if (!stats.loggedToday) return { mood: 'calm', text: 'Halo! Sudah catat hari ini?' };
    return { mood: 'happy', text: 'Mantap, catatan hari ini sudah ada!' };
  }, [alert, stats]);

  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <>
      <SmartAlertBanner alert={alert} />

      <section className="glass mb-6 grid items-center gap-6 rounded-3xl p-6 sm:p-8 md:grid-cols-[auto_1fr_auto]">
        <div className="mx-auto md:mx-0">
          <Mascot mood={mascot.mood} message={mascot.text} size={130} />
        </div>
        <div className="text-center md:text-left">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Halo, {firstName}.</h1>
          <p className="mt-2 text-lg text-white/70">
            {stats.cycleDay
              ? <>Hari ke-<b className="text-sunset-gradient">{stats.cycleDay}</b> dari siklus ini.</>
              : 'Catat hari ini untuk mulai membangun pola siklus Anda.'}
          </p>
          <p className="mt-1 text-sm text-white/50">{stats.loggedToday ? 'Catatan hari ini sudah ada. Anda bisa mengubahnya kapan saja.' : 'Catatan hari ini belum diisi.'}</p>
        </div>
        <button onClick={() => setOpen(true)} className="bg-sunset-gradient flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold text-white shadow-lg shadow-fuchsia-900/30">
          <PencilLine size={18} aria-hidden /> {stats.loggedToday ? 'Ubah catatan hari ini' : 'Catat hari ini'}
        </button>
      </section>

      {error && <p role="alert" className="mb-6 rounded-xl bg-rose-500/15 px-4 py-3 text-rose-200">{error}</p>}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Hari siklus" value={stats.cycleDay ?? '—'} />
        <Stat label="Nyeri rata-rata" value={round1(stats.pain7)} hint="7 hari terakhir, skala 0–10" />
        <Stat label="Tidur rata-rata" value={stats.sleep7 == null ? '—' : `${round1(stats.sleep7)} jam`} hint="7 hari terakhir" />
        <Stat label="Hari tercatat" value={`${stats.logged30}/30`} hint="30 hari terakhir" />
      </div>

      {loading ? (
        <p className="text-white/60" role="status">Memuat data…</p>
      ) : (
        <div className="grid gap-6">
          <SymptomHeatmap logs={logs} />
          <TrendChart logs={logs} />
        </div>
      )}

      <DailyLogger open={open} onClose={() => setOpen(false)} onSaved={load} logs={logs} />
    </>
  );
}
