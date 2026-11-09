import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { moodByKey, volumeLabel } from '../utils/constants.js';
import { addDays, fmtLong, isoOf, todayISO } from '../utils/dates.js';
import { avg, cycleLengths, findAnomalies, round1, topSymptoms } from '../utils/analytics.js';

const PERIODS = [30, 90, 180];
const NAVY = '#0B2447';

function Section({ title, children }) {
  return (
    <section className="mt-7" style={{ breakInside: 'avoid-page' }}>
      <h2 className="border-b-2 pb-1 text-[15px] font-bold" style={{ color: NAVY, borderColor: NAVY }}>{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function MedicalReport() {
  const { user } = useAuth();
  const [days, setDays] = useState(90);
  const [allLogs, setAllLogs] = useState([]);
  const [allCycles, setAllCycles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/logs', { params: { days: 180 } }), api.get('/cycles')])
      .then(([l, c]) => { setAllLogs(l.data.logs); setAllCycles(c.data.cycles); })
      .catch(() => setError('Data laporan belum bisa dimuat.'))
      .finally(() => setLoading(false));
  }, []);

  const today = todayISO();
  const from = addDays(today, -days);

  const r = useMemo(() => {
    const logs = allLogs.filter((l) => isoOf(l.date) >= from).map((l) => ({ ...l, date: isoOf(l.date) }));
    const cycles = allCycles.filter((c) => !c.endDate || isoOf(c.endDate) >= from);
    const lens = cycleLengths(cycles);
    const pains = logs.map((l) => l.painScale);
    return {
      logs, cycles,
      anomalies: findAnomalies(logs, cycles),
      avgCycle: avg(lens),
      avgPain: avg(pains),
      maxPain: pains.length ? Math.max(...pains) : null,
      avgSleep: avg(logs.filter((l) => l.sleepHours != null).map((l) => l.sleepHours)),
      menstrualDays: logs.filter((l) => l.isMenstruating).length,
      symptoms: topSymptoms(logs, 3),
    };
  }, [allLogs, allCycles, from]);

  const docNo = `FC-${today.replaceAll('-', '')}-${(user?.id ?? '').slice(0, 6).toUpperCase()}`;
  const th = 'border border-black/70 px-2 py-1.5 text-left font-semibold text-white';
  const td = 'border border-black/40 px-2 py-1.5 align-top';

  return (
    <>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/" className="mb-2 inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white"><ArrowLeft size={15} aria-hidden /> Dashboard</Link>
          <h1 className="font-display text-3xl font-semibold">Laporan medis</h1>
          <p className="mt-1 text-sm text-white/55">Pratinjau langsung. Pilih "Simpan sebagai PDF" pada dialog cetak.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-white/70">
            Periode
            <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded-lg border border-white/15 bg-night px-3 py-2">
              {PERIODS.map((p) => <option key={p} value={p}>{p} hari terakhir</option>)}
            </select>
          </label>
          <button onClick={() => window.print()} className="bg-sunset-gradient flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold">
            <Printer size={17} aria-hidden /> Unduh PDF
          </button>
        </div>
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-500/15 px-4 py-3 text-rose-200">{error}</p>}
      {loading && <p className="text-white/60" role="status">Menyusun laporan…</p>}

      {!loading && (
        <article id="report-sheet" className="mx-auto max-w-[210mm] bg-white p-8 font-report text-[13px] leading-relaxed text-black shadow-2xl sm:p-12" aria-label="Pratinjau laporan medis">
          <header className="flex items-start justify-between gap-6 border-b-4 pb-4" style={{ borderColor: NAVY }}>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Clinical Health Record</h1>
              <p className="text-sm">Catatan siklus menstruasi dan gejala</p>
            </div>
            <dl className="text-right text-xs">
              <div><dt className="inline font-semibold">No. dokumen: </dt><dd className="inline">{docNo}</dd></div>
              <div><dt className="inline font-semibold">Dibuat: </dt><dd className="inline">{fmtLong(today)}</dd></div>
            </dl>
          </header>

          <Section title="1. Identitas pasien">
            <table className="w-full border-collapse"><tbody>
              {[
                ['Nama', user?.name], ['Email', user?.email], ['ID pasien', docNo.split('-')[2]],
                ['Periode data', `${fmtLong(from)} s.d. ${fmtLong(today)}`],
                ['Tanggal lahir', '…………………………'], ['Berat / tinggi badan', '…………………………'],
              ].map(([k, v]) => (
                <tr key={k}><td className={`${td} w-44 font-semibold`}>{k}</td><td className={td}>{v}</td></tr>
              ))}
            </tbody></table>
          </Section>

          <Section title="2. Ringkasan siklus">
            <table className="w-full border-collapse"><tbody>
              {[
                ['Siklus tercatat', `${r.cycles.length} siklus`],
                ['Rata-rata panjang siklus', r.avgCycle == null ? 'Belum cukup data (perlu minimal 1 siklus selesai)' : `${round1(r.avgCycle)} hari`],
                ['Hari haid tercatat', `${r.menstrualDays} hari`],
                ['Nyeri (skala 0–10)', r.avgPain == null ? '—' : `rata-rata ${round1(r.avgPain)}, tertinggi ${r.maxPain}`],
                ['Rata-rata tidur', r.avgSleep == null ? '—' : `${round1(r.avgSleep)} jam/hari`],
                ['Gejala tersering', r.symptoms.length ? r.symptoms.map(([s, n]) => `${s} (${n}×)`).join(', ') : '—'],
                ['Jumlah hari dicatat', `${r.logs.length} dari ${days} hari`],
              ].map(([k, v]) => (
                <tr key={k}><td className={`${td} w-56 font-semibold`}>{k}</td><td className={td}>{v}</td></tr>
              ))}
            </tbody></table>
          </Section>

          <Section title="3. Highlight anomali">
            {r.anomalies.length === 0 ? (
              <p>Tidak ada anomali yang terdeteksi pada periode ini berdasarkan ambang yang digunakan aplikasi.</p>
            ) : (
              <ul className="space-y-1.5">
                {r.anomalies.map((a, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-0.5 h-fit shrink-0 border px-1.5 text-[11px] font-bold"
                      style={a.level === 'high' ? { background: NAVY, color: '#fff', borderColor: NAVY } : { color: NAVY, borderColor: NAVY }}>
                      {a.level === 'high' ? 'Prioritas' : 'Dicermati'}
                    </span>
                    <span>{a.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="4. Rekapitulasi harian">
            {r.logs.length === 0 ? <p>Belum ada catatan pada periode ini.</p> : (
              <table className="w-full border-collapse text-[12px]">
                <thead style={{ background: NAVY }}>
                  <tr>{['Tanggal', 'Haid', 'Volume', 'Nyeri', 'Gejala', 'Mood', 'Tidur', 'Catatan'].map((h) => <th key={h} className={th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {[...r.logs].reverse().map((l) => (
                    <tr key={l.id} style={{ breakInside: 'avoid' }} className={l.painScale > 8 ? 'font-bold' : ''}>
                      <td className={td}>{l.date}</td>
                      <td className={td}>{l.isMenstruating ? 'Ya' : '—'}</td>
                      <td className={td}>{l.bleedingVolume ? volumeLabel[l.bleedingVolume] : '—'}</td>
                      <td className={td}>{l.painScale}/10</td>
                      <td className={td}>{l.symptoms?.join(', ') || '—'}</td>
                      <td className={td}>{moodByKey[l.mood]?.label ?? '—'}</td>
                      <td className={td}>{l.sleepHours ?? '—'}</td>
                      <td className={td}>{l.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          <Section title="5. Penilaian dokter">
            <div className="h-28 border border-black/60" aria-label="Ruang catatan dokter" />
            <div className="mt-8 grid grid-cols-2 gap-10" style={{ breakInside: 'avoid' }}>
              <div>
                <p>Tanggal pemeriksaan: ……………………</p>
                <p className="mt-2">No. STR/SIP: ……………………</p>
              </div>
              <div className="text-center">
                <p>Dokter pemeriksa,</p>
                <div className="h-20" />
                <p className="border-t border-black pt-1">(Nama dan tanda tangan)</p>
              </div>
            </div>
          </Section>

          <footer className="mt-8 border-t border-black/50 pt-3 text-[11px] leading-snug">
            Dokumen ini disusun otomatis dari catatan mandiri pasien melalui FemCare Analytics. Dokumen ini bukan hasil diagnosis dan tidak menggantikan penilaian klinis dokter.
          </footer>
        </article>
      )}
    </>
  );
}
