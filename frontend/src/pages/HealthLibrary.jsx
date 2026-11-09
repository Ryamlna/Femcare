import { BadgeCheck, Clock } from 'lucide-react';

// KONTEN CONTOH. Wajib ditinjau dan ditandatangani tenaga medis sungguhan sebelum rilis;
// ganti `reviewer` dan `reviewedOn` dengan data peninjau yang sebenarnya.
const ARTICLES = [
  {
    id: 1, category: 'Nyeri', minutes: 4, title: 'Nyeri haid: kapan wajar, kapan perlu diperiksa',
    summary: 'Nyeri ringan hingga sedang pada 1–2 hari pertama haid umum terjadi. Yang perlu dicermati adalah nyeri yang mengganggu aktivitas.',
    know: ['Kompres hangat dan gerak ringan sering membantu meredakan.', 'Obat pereda nyeri bebas dapat dipakai sesuai petunjuk kemasan.', 'Catat skala nyeri tiap hari agar polanya terlihat.'],
    doctor: 'Nyeri tidak membaik dengan obat umum, makin berat dari waktu ke waktu, atau membuat Anda tidak bisa beraktivitas.',
  },
  {
    id: 2, category: 'Perdarahan', minutes: 4, title: 'Perdarahan haid yang berlebihan',
    summary: 'Perdarahan banyak bisa menguras tenaga dan menyebabkan kekurangan zat besi. Volume dan lamanya perlu dicatat.',
    know: ['Haid umumnya berlangsung hingga sekitar 7 hari.', 'Catat volume (sedikit, sedang, banyak) setiap hari.', 'Rasa lemas, pucat, atau jantung berdebar bisa menandakan kekurangan darah.'],
    doctor: 'Pembalut penuh tiap 1–2 jam selama beberapa jam berturut-turut, gumpalan besar, atau haid lebih dari 7 hari.',
  },
  {
    id: 3, category: 'Siklus', minutes: 3, title: 'Memahami panjang siklus Anda',
    summary: 'Panjang siklus dihitung dari hari pertama haid hingga sehari sebelum haid berikutnya. Pada orang dewasa, rentang umumnya 21–35 hari.',
    know: ['Selisih beberapa hari antar siklus masih wajar.', 'Stres, perubahan berat badan, dan kurang tidur dapat menggeser siklus.', 'Butuh beberapa siklus tercatat untuk melihat rata-rata Anda.'],
    doctor: 'Siklus sering di luar 21–35 hari, haid berhenti lebih dari 3 bulan (dan Anda tidak hamil), atau pola berubah drastis.',
  },
  {
    id: 4, category: 'Suasana hati', minutes: 5, title: 'Sindrom pramenstruasi dan suasana hati',
    summary: 'Banyak orang merasakan perubahan fisik dan emosi dalam 1–2 minggu sebelum haid. Pada sebagian orang, gejalanya jauh lebih berat.',
    know: ['Tidur cukup dan olahraga teratur dapat membantu meringankan gejala.', 'Mengurangi kafein dan alkohol menjelang haid bisa membantu.', 'Mencatat suasana hati menunjukkan apakah gejala selalu muncul di fase yang sama.'],
    doctor: 'Gejala mengganggu pekerjaan atau hubungan. Bila muncul pikiran untuk menyakiti diri, segera hubungi tenaga kesehatan atau orang tepercaya.',
  },
  {
    id: 5, category: 'Nyeri panggul', minutes: 5, title: 'Endometriosis: tanda yang sering terlewat',
    summary: 'Endometriosis sering terlambat terdiagnosis karena nyerinya dianggap "biasa". Catatan gejala yang rapi membantu dokter menilai.',
    know: ['Tanda yang sering muncul: nyeri panggul menahun, nyeri saat berhubungan, nyeri saat buang air saat haid.', 'Kesulitan hamil juga bisa menjadi petunjuk.', 'Bawa laporan medis dari aplikasi ini saat konsultasi.'],
    doctor: 'Nyeri haid berat yang berulang setiap siklus, atau nyeri panggul di luar masa haid.',
  },
  {
    id: 6, category: 'Gaya hidup', minutes: 3, title: 'Tidur dan siklus haid',
    summary: 'Kualitas tidur dan siklus saling memengaruhi. Sebagian orang lebih sulit tidur menjelang haid.',
    know: ['Jam tidur dan bangun yang konsisten membantu.', 'Catat jam tidur agar terlihat hubungannya dengan nyeri dan suasana hati.', 'Hindari layar dan kafein menjelang tidur.'],
    doctor: 'Sulit tidur berlangsung berminggu-minggu atau mengganggu aktivitas harian.',
  },
];

export default function HealthLibrary() {
  return (
    <>
      <h1 className="font-display text-3xl font-semibold">Pustaka kesehatan</h1>
      <p className="mt-2 max-w-xl text-white/60">Bacaan singkat untuk memahami apa yang Anda catat. Informasi ini bersifat umum dan bukan pengganti konsultasi dokter.</p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {ARTICLES.map((a) => (
          <article key={a.id} className="glass flex flex-col rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/75">{a.category}</span>
              <span className="flex items-center gap-1 text-xs text-white/50"><Clock size={13} aria-hidden /> {a.minutes} menit baca</span>
            </div>
            <h2 className="font-display text-xl font-semibold leading-snug">{a.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{a.summary}</p>
            <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-white/75">
              {a.know.map((k) => <li key={k}>{k}</li>)}
            </ul>
            <p className="mt-4 rounded-xl border border-sunset/30 bg-sunset/10 px-4 py-3 text-sm text-white/85">
              <b>Kapan ke dokter: </b>{a.doctor}
            </p>
            <p className="mt-5 flex items-center gap-1.5 border-t border-white/10 pt-4 text-xs text-emerald-300">
              <BadgeCheck size={15} aria-hidden /> Medically Reviewed
              <span className="text-white/45">· Peninjau: [nama dokter] · [tanggal]</span>
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
