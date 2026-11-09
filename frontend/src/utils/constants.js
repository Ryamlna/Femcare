export const SYMPTOMS = [
  'Kram perut', 'Sakit kepala', 'Nyeri punggung', 'Mual', 'Kembung', 'Kelelahan',
  'Nyeri payudara', 'Jerawat', 'Pusing', 'Diare', 'Nafsu makan berubah', 'Sulit tidur',
];

export const MOODS = [
  { key: 'HAPPY', emoji: '😄', label: 'Senang', score: 5 },
  { key: 'CALM', emoji: '🙂', label: 'Tenang', score: 4 },
  { key: 'NEUTRAL', emoji: '😐', label: 'Biasa', score: 3 },
  { key: 'SAD', emoji: '😢', label: 'Sedih', score: 2 },
  { key: 'IRRITABLE', emoji: '😠', label: 'Mudah marah', score: 1 },
];

export const moodByKey = Object.fromEntries(MOODS.map((m) => [m.key, m]));

export const VOLUMES = [
  { key: 'LIGHT', label: 'Sedikit' },
  { key: 'MEDIUM', label: 'Sedang' },
  { key: 'HEAVY', label: 'Banyak' },
];
export const volumeLabel = Object.fromEntries(VOLUMES.map((v) => [v.key, v.label]));

export const painLabel = (n) =>
  n === 0 ? 'Tidak nyeri' : n <= 3 ? 'Ringan' : n <= 6 ? 'Sedang' : n <= 8 ? 'Berat' : 'Sangat berat';
