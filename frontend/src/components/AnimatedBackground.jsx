import { useEffect, useMemo, useRef } from 'react';

const PARTICLES = 26;
const COLORS = ['#C4A6FF', '#F9A8D4', '#FDBA74'];

// Angka acak deterministik agar posisi partikel stabil di setiap render.
const rand = (i, n) => {
  const x = Math.sin(i * 9301 + n * 49297) * 233280;
  return x - Math.floor(x);
};

export default function AnimatedBackground() {
  const glowRef = useRef(null);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLES }, (_, i) => ({
        left: rand(i, 1) * 100,
        size: 2 + rand(i, 2) * 4,
        duration: 16 + rand(i, 3) * 20,
        delay: -rand(i, 4) * 36,
        drift: (rand(i, 5) - 0.5) * 80,
        opacity: 0.3 + rand(i, 6) * 0.4,
        color: COLORS[i % COLORS.length],
      })),
    [],
  );

  // Cahaya lembut yang mengikuti kursor (hanya perangkat dengan mouse, dan bila animasi tidak dikurangi).
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (reduce || !fine) return undefined;

    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 3;
    const apply = () => {
      raf = 0;
      glowRef.current?.style.setProperty('--x', `${x}px`);
      glowRef.current?.style.setProperty('--y', `${y}px`);
    };
    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fc-bg" aria-hidden="true">
      <span className="fc-blob fc-blob-1" />
      <span className="fc-blob fc-blob-2" />
      <span className="fc-blob fc-blob-3" />
      <div ref={glowRef} className="fc-glow" />
      {particles.map((p, i) => (
        <i
          key={i}
          className="fc-dot"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            '--drift': `${p.drift}px`,
            '--o': p.opacity,
          }}
        />
      ))}
    </div>
  );
}
