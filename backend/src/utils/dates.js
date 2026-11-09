// Semua tanggal log disimpan sebagai 00:00 UTC agar tidak bergeser antar zona waktu.
export const toUTCDate = (iso) => new Date(`${iso}T00:00:00.000Z`);
export const addDays = (date, n) => new Date(date.getTime() + n * 86400000);
export const diffDays = (a, b) => Math.round((a.getTime() - b.getTime()) / 86400000);
export const todayUTC = () => toUTCDate(new Date().toISOString().slice(0, 10));
