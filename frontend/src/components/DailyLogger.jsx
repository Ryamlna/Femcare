import { useEffect, useState } from 'react';
import { Droplets, Save, X } from 'lucide-react';
import api from '../api.js';
import { MOODS, SYMPTOMS, VOLUMES, painLabel } from '../utils/constants.js';
import { isoOf, todayISO } from '../utils/dates.js';

const blank = (date) => ({
  date, isMenstruating: false, bleedingVolume: 'MEDIUM', painScale: 0,
  symptoms: [], mood: null, sleepHours: '', notes: '',
});

const fromLog = (l) => ({
  date: isoOf(l.date), isMenstruating: l.isMenstruating, bleedingVolume: l.bleedingVolume || 'MEDIUM',
  painScale: l.painScale, symptoms: l.symptoms || [], mood: l.mood, sleepHours: l.sleepHours ?? '', notes: l.notes || '',
});

export default function DailyLogger({ open, onClose, onSaved, logs }) {
  const [form, setForm] = useState(blank(todayISO()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadDate = (date) => {
    const existing = logs.find((l) => isoOf(l.date) === date);
    setForm(existing ? fromLog(existing) : blank(date));
  };

  useEffect(() => {
    if (!open) return;
    loadDate(todayISO());
    setError('');
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const toggleSymptom = (s) =>
    set({ symptoms: form.symptoms.includes(s) ? form.symptoms.filter((x) => x !== s) : [...form.symptoms, s] });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/logs', {
        date: form.date,
        isMenstruating: form.isMenstruating,
        bleedingVolume: form.isMenstruating ? form.bleedingVolume : null,
        painScale: Number(form.painScale),
        symptoms: form.symptoms,
        mood: form.mood,
        sleepHours: form.sleepHours === '' ? null : Number(form.sleepHours),
        notes: form.notes.trim() || null,
      });
      await onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Catatan belum tersimpan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button className="absolute inset-0 bg-black/60" aria-label="Tutup" onClick={onClose} tabIndex={-1} />
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logger-title"
        className="glass-strong relative flex h-full w-full max-w-md flex-col overflow-y-auto p-6 sm:rounded-l-3xl"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 id="logger-title" className="font-display text-2xl font-semibold">Catatan harian</h2>
            <p className="mt-1 text-sm text-white/55">Cukup yang Anda rasakan hari ini.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-white/60 hover:bg-white/10" aria-label="Tutup panel">
            <X size={20} />
          </button>
        </div>

        <label className="mb-6 block text-sm">
          <span className="mb-1.5 block text-white/70">Tanggal</span>
          <input type="date" max={todayISO()} value={form.date} onChange={(e) => loadDate(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 [color-scheme:dark]" />
        </label>

        {/* Status menstruasi */}
        <div className="mb-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <span className="flex items-center gap-2"><Droplets size={18} className="text-blush" aria-hidden /> Sedang haid</span>
          <button type="button" role="switch" aria-checked={form.isMenstruating} aria-label="Sedang haid"
            onClick={() => set({ isMenstruating: !form.isMenstruating })}
            className={`relative h-7 w-12 rounded-full transition-colors ${form.isMenstruating ? 'bg-sunset-gradient' : 'bg-white/20'}`}>
            <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${form.isMenstruating ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>
        {form.isMenstruating && (
          <div className="mb-6 flex gap-2" role="radiogroup" aria-label="Volume perdarahan">
            {VOLUMES.map((v) => (
              <button type="button" key={v.key} role="radio" aria-checked={form.bleedingVolume === v.key}
                onClick={() => set({ bleedingVolume: v.key })}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm transition-colors ${form.bleedingVolume === v.key ? 'border-blush bg-blush/20' : 'border-white/15 hover:bg-white/10'}`}>
                {v.label}
              </button>
            ))}
          </div>
        )}
        {!form.isMenstruating && <div className="mb-3" />}

        {/* Skala nyeri */}
        <div className="mb-6">
          <div className="mb-3 flex items-baseline justify-between text-sm">
            <label htmlFor="pain" className="text-white/70">Tingkat nyeri</label>
            <span><b className="font-display text-2xl">{form.painScale}</b><span className="text-white/50"> / 10 · {painLabel(Number(form.painScale))}</span></span>
          </div>
          <input id="pain" type="range" min="0" max="10" step="1" value={form.painScale}
            onChange={(e) => set({ painScale: Number(e.target.value) })} className="pain-range w-full" />
          <div className="mt-1.5 flex justify-between text-xs text-white/40"><span>0</span><span>5</span><span>10</span></div>
        </div>

        {/* Gejala */}
        <fieldset className="mb-6">
          <legend className="mb-2 text-sm text-white/70">Gejala</legend>
          <div className="flex flex-wrap gap-2">
            {SYMPTOMS.map((s) => {
              const on = form.symptoms.includes(s);
              return (
                <button type="button" key={s} aria-pressed={on} onClick={() => toggleSymptom(s)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${on ? 'border-amethyst-400 bg-amethyst-500/30' : 'border-white/15 text-white/70 hover:bg-white/10'}`}>
                  {s}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Mood */}
        <fieldset className="mb-6">
          <legend className="mb-2 text-sm text-white/70">Suasana hati</legend>
          <div className="grid grid-cols-5 gap-2" role="radiogroup">
            {MOODS.map((m) => (
              <button type="button" key={m.key} role="radio" aria-checked={form.mood === m.key} onClick={() => set({ mood: form.mood === m.key ? null : m.key })}
                className={`rounded-xl border py-2.5 text-center transition-colors ${form.mood === m.key ? 'border-sunset bg-sunset/20' : 'border-white/15 hover:bg-white/10'}`}>
                <span className="block text-2xl" aria-hidden>{m.emoji}</span>
                <span className="mt-0.5 block text-[11px] text-white/65">{m.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mb-6 grid grid-cols-[8rem_1fr] gap-4">
          <label className="text-sm">
            <span className="mb-1.5 block text-white/70">Tidur (jam)</span>
            <input type="number" min="0" max="24" step="0.5" value={form.sleepHours} onChange={(e) => set({ sleepHours: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5" placeholder="7.5" />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-white/70">Catatan</span>
            <textarea rows={2} maxLength={2000} value={form.notes} onChange={(e) => set({ notes: e.target.value })}
              className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-3 py-2.5" placeholder="Obat yang diminum, pemicu, dll." />
          </label>
        </div>

        {error && <p role="alert" className="mb-4 rounded-lg bg-rose-500/15 px-4 py-3 text-sm text-rose-200">{error}</p>}

        <button type="submit" disabled={saving}
          className="bg-sunset-gradient mt-auto flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white disabled:opacity-60">
          <Save size={18} aria-hidden /> {saving ? 'Menyimpan…' : 'Simpan catatan'}
        </button>
      </form>
    </div>
  );
}
