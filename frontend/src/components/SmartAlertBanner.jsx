import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, HeartHandshake, X } from 'lucide-react';

/** Banner empati: tampil bila nyeri > 8 selama >= 3 hari berturut-turut (dihitung di backend). */
export default function SmartAlertBanner({ alert }) {
  const [hidden, setHidden] = useState(false);
  if (!alert?.triggered || hidden) return null;

  return (
    <div role="alert" className="relative mb-6 overflow-hidden rounded-2xl border border-sunset/40 p-5 pr-12 sm:p-6"
      style={{ background: 'linear-gradient(120deg, rgba(251,146,60,0.2), rgba(244,114,182,0.14) 60%, rgba(155,107,255,0.12))', backdropFilter: 'blur(18px)' }}>
      <button onClick={() => setHidden(true)} aria-label="Tutup peringatan" className="absolute right-3 top-3 rounded-lg p-1.5 text-white/60 hover:bg-white/10">
        <X size={18} />
      </button>
      <div className="flex gap-4">
        <HeartHandshake size={28} className="mt-0.5 shrink-0 text-sunset" aria-hidden />
        <div>
          <h2 className="font-display text-xl font-semibold">Nyeri Anda berat selama {alert.streakDays} hari berturut-turut</h2>
          <p className="mt-1.5 max-w-2xl leading-relaxed text-white/80">
            Anda tidak perlu menahannya sendirian. Nyeri di atas 8 dari 10 selama beberapa hari sebaiknya diperiksa dokter. Kami sudah merangkum catatan Anda supaya penjelasan di ruang periksa lebih mudah.
          </p>
          <Link to="/report" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-night hover:bg-white/90">
            <FileText size={16} aria-hidden /> Buka laporan medis
          </Link>
        </div>
      </div>
    </div>
  );
}
