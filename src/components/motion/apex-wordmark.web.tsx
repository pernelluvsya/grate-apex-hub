import { useReducedMotion } from 'react-native-reanimated';

// Web: the APEX wordmark draws itself as a gold stroke, then fills — a
// React Bits-style "stroke text" effect done with plain SVG + CSS (no
// extra dependency). Reduced-motion users get the finished wordmark.
export function ApexWordmark({ size = 72 }: { size?: number }) {
  const reduceMotion = useReducedMotion();
  const width = size * 4.2;
  const css = `
    @keyframes apexDraw { from { stroke-dashoffset: 900; } to { stroke-dashoffset: 0; } }
    @keyframes apexFill { 0%, 55% { fill-opacity: 0; } 100% { fill-opacity: 1; } }
    @keyframes apexGlow { 0%, 100% { filter: drop-shadow(0 0 4px rgba(253,192,10,0.35)); } 50% { filter: drop-shadow(0 0 14px rgba(253,192,10,0.65)); } }
    .apex-wordmark text { stroke-dasharray: 900; animation: apexDraw 1.6s ease-out forwards, apexFill 1.9s ease-out forwards; }
    .apex-wordmark { animation: apexGlow 3.2s ease-in-out 1.9s infinite; }
  `;
  return (
    <div role="img" aria-label="Apex Challenge" style={{ display: 'flex', justifyContent: 'center' }}>
      {!reduceMotion ? <style>{css}</style> : null}
      <svg className={reduceMotion ? undefined : 'apex-wordmark'} width={width} height={size * 1.2} viewBox={`0 0 ${width} ${size * 1.2}`}>
        <defs>
          <linearGradient id="apexGold" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#FFE07A" />
            <stop offset="55%" stopColor="#FDC00A" />
            <stop offset="100%" stopColor="#C98F00" />
          </linearGradient>
        </defs>
        <text
          x="50%"
          y="78%"
          textAnchor="middle"
          fontSize={size}
          fontWeight={900}
          letterSpacing={size * 0.12}
          fontFamily="var(--font-display), system-ui, sans-serif"
          fill="url(#apexGold)"
          fillOpacity={reduceMotion ? 1 : 0}
          stroke="#FDC00A"
          strokeWidth={1.6}
        >
          APEX
        </text>
      </svg>
    </div>
  );
}
