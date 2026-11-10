import { useEffect, useId, useRef, useState } from 'react';
import './mascot.css';

const INK = '#2A1745';
const MOUTHS = {
  happy: 'M88 128 Q100 142 112 128',
  calm: 'M91 130 Q100 137 109 130',
  sad: 'M91 138 Q100 128 109 138',
  concerned: 'M91 135 Q95.5 131 100 135 T109 135',
};
const SPARKS = [
  { x: 28, y: 52, delay: '0s' },
  { x: 176, y: 70, delay: '0.9s' },
  { x: 158, y: 30, delay: '1.7s' },
];

function Face({ mood }) {
  const line = { stroke: INK, strokeWidth: 4, strokeLinecap: 'round', fill: 'none' };
  const worried = mood === 'sad' || mood === 'concerned';
  return (
    <g>
      {mood === 'happy' ? (
        <>
          <path d="M70 112 Q78 102 86 112" {...line} />
          <path d="M114 112 Q122 102 130 112" {...line} />
        </>
      ) : (
        <g className="mc-blink">
          <ellipse cx="78" cy="110" rx="6" ry="8" fill={INK} />
          <ellipse cx="122" cy="110" rx="6" ry="8" fill={INK} />
          <circle cx="80" cy="107" r="2" fill="#fff" />
          <circle cx="124" cy="107" r="2" fill="#fff" />
        </g>
      )}
      {worried && (
        <>
          <path d="M68 98 L86 92" {...line} strokeWidth="3.5" />
          <path d="M114 92 L132 98" {...line} strokeWidth="3.5" />
        </>
      )}
      <circle cx="62" cy="124" r="8" fill="#F472B6" opacity="0.45" />
      <circle cx="138" cy="124" r="8" fill="#F472B6" opacity="0.45" />
      <path d={MOUTHS[mood] || MOUTHS.happy} {...line} />
      {mood === 'sad' && <path className="mc-tear" d="M131 120 Q127 128 131 132 Q135 128 131 120Z" fill="#7DD3FC" />}
    </g>
  );
}

/**
 * Maskot "Luna". mood: 'happy' | 'calm' | 'sad' | 'concerned'.
 * Sentuh/klik maskot untuk membuatnya melompat kecil.
 */
export default function Mascot({ mood = 'happy', message, size = 160 }) {
  const gid = `mc${useId().replace(/:/g, '')}`;
  const [bump, setBump] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const poke = () => {
    setBump(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setBump(false), 650);
  };

  return (
    <button type="button" className="mc" onClick={poke} style={{ '--mc-size': `${size}px` }}
      aria-label={message ? `Maskot Luna: ${message}` : 'Maskot Luna'}>
      {message && <span className="mc-bubble">{message}</span>}
      <svg className={`mc-svg ${bump ? 'mc-bump' : ''}`} viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#B08BFF" />
            <stop offset="55%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>
        </defs>

        {SPARKS.map((s) => (
          <g key={s.x} transform={`translate(${s.x} ${s.y})`}>
            <path className="mc-spark" style={{ animationDelay: s.delay }} fill="#FDE68A"
              d="M0 -8 L2.2 -2.2 L8 0 L2.2 2.2 L0 8 L-2.2 2.2 L-8 0 L-2.2 -2.2Z" />
          </g>
        ))}

        <ellipse className="mc-shadow" cx="100" cy="190" rx="44" ry="7" fill="#000" opacity="0.35" />

        <g className="mc-float">
          <g className="mc-sway">
            <ellipse cx="100" cy="30" rx="7" ry="13" fill="#F9A8D4" transform="rotate(-38 100 46)" />
            <ellipse cx="100" cy="30" rx="7" ry="13" fill="#F9A8D4" transform="rotate(38 100 46)" />
            <ellipse cx="100" cy="28" rx="7" ry="13" fill="#FBCFE8" />
            <circle cx="100" cy="44" r="6" fill="#FDBA74" />
          </g>

          <ellipse cx="32" cy="132" rx="12" ry="17" fill={`url(#${gid})`} transform="rotate(18 32 132)" />
          <ellipse className="mc-wave" cx="168" cy="132" rx="12" ry="17" fill={`url(#${gid})`} transform="rotate(-18 168 132)" />

          <path fill={`url(#${gid})`}
            d="M100 44 C150 44 170 82 168 116 C166 156 135 174 100 174 C65 174 34 156 32 116 C30 82 50 44 100 44Z" />
          <ellipse cx="76" cy="76" rx="17" ry="9" fill="#fff" opacity="0.28" transform="rotate(-30 76 76)" />

          <Face mood={mood} />
        </g>
      </svg>
    </button>
  );
}
