// Tanggal log selalu string 'YYYY-MM-DD' (UTC) agar konsisten dengan backend.
export const todayISO = () => new Date().toLocaleDateString('en-CA'); // tanggal lokal pengguna
export const isoOf = (d) => String(d).slice(0, 10);
const toMs = (iso) => Date.parse(`${iso}T00:00:00Z`);
export const addDays = (iso, n) => new Date(toMs(iso) + n * 86400000).toISOString().slice(0, 10);
export const diffDays = (a, b) => Math.round((toMs(a) - toMs(b)) / 86400000);
export const weekday = (iso) => new Date(toMs(iso)).getUTCDay();
export const fmtLong = (iso) =>
  new Date(toMs(iso)).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const fmtShort = (iso) =>
  new Date(toMs(iso)).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', timeZone: 'UTC' });
