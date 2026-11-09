import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { HeartPulse, LineChart, ShieldCheck, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const points = [
  { icon: LineChart, text: 'Lihat pola nyeri, suasana hati, dan tidur dalam satu layar.' },
  { icon: Stethoscope, text: 'Bawa laporan klinis rapi ke ruang periksa.' },
  { icon: ShieldCheck, text: 'Data Anda hanya bisa dibuka dengan akun Anda.' },
];

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');

  const onSuccess = async ({ credential }) => {
    setError('');
    try {
      await loginWithGoogle(credential);
    } catch {
      setError('Tidak bisa masuk dengan Google. Periksa koneksi Anda lalu coba lagi.');
    }
  };

  return (
    <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-[1.15fr_0.85fr]">
      <section>
        <div className="mb-8 flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-sunset-gradient"><HeartPulse size={20} aria-hidden /></span>
          <span className="font-display text-xl font-semibold">FemCare Analytics</span>
        </div>
        <h1 className="font-display text-5xl font-semibold leading-[1.08] sm:text-6xl">
          <span className="text-sunset-gradient">Bridging Technology</span>
          <br />and Humanity
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
          Catat siklus Anda dengan tenang. Biarkan data menjelaskan apa yang sulit diceritakan di ruang periksa.
        </p>
        <ul className="mt-10 space-y-4">
          {points.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-white/75">
              <Icon size={20} className="mt-0.5 shrink-0 text-blush" aria-hidden /> {text}
            </li>
          ))}
        </ul>
      </section>

      <section className="glass rounded-3xl p-8 sm:p-10" aria-labelledby="login-title">
        <h2 id="login-title" className="font-display text-2xl font-semibold">Masuk ke akun Anda</h2>
        <p className="mt-2 text-sm text-white/60">Gunakan akun Google. Kami tidak menyimpan kata sandi Google Anda.</p>
        <div className="mt-8 flex justify-center">
          <GoogleLogin onSuccess={onSuccess} onError={() => setError('Login Google dibatalkan atau gagal.')} theme="filled_black" shape="pill" size="large" text="signin_with" locale="id" />
        </div>
        {error && <p role="alert" className="mt-5 rounded-lg bg-rose-500/15 px-4 py-3 text-sm text-rose-200">{error}</p>}
        <p className="mt-8 text-xs leading-relaxed text-white/45">
          FemCare membantu Anda mencatat dan memahami pola. Aplikasi ini bukan alat diagnosis dan tidak menggantikan pemeriksaan dokter.
        </p>
      </section>
    </div>
  );
}
