import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

// The GRATEAPEX icon set — drawn for this app on a 24px grid with round
// caps, so every icon shares one stroke weight and one personality.
// Replaces emoji in the interface (emoji render differently on every OS
// and undercut the academic tone).
//
//   <Icon name="streak" size={18} color={colors.accent} />
//
// Decorative by default; pass `label` when the icon carries meaning on
// its own (no visible text next to it).

type Draw = (p: { color: string; filled: boolean; sw: number }) => ReactNode;

// A gear outline, generated so it stays perfectly symmetrical.
function gearPath(cx: number, cy: number, outer: number, inner: number, teeth: number) {
  const points: string[] = [];
  const step = (Math.PI * 2) / (teeth * 4);
  for (let i = 0; i < teeth * 4; i++) {
    const r = i % 4 === 0 || i % 4 === 1 ? outer : inner;
    const angle = i * step - Math.PI / 2 + step / 2;
    points.push(`${(cx + r * Math.cos(angle)).toFixed(2)} ${(cy + r * Math.sin(angle)).toFixed(2)}`);
  }
  return `M${points.join('L')}Z`;
}
const GEAR = gearPath(12, 12, 8.6, 6.6, 8);

const stroke = (color: string, sw: number) => ({
  stroke: color,
  strokeWidth: sw,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
});

const ICONS = {
  // ── Navigation ──
  home: ({ color, filled, sw }) => (
    <Path d="M4 10.4 12 4l8 6.4V19a1.5 1.5 0 0 1-1.5 1.5H15v-5.2a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5.2H5.5A1.5 1.5 0 0 1 4 19z" {...stroke(color, sw)} fill={filled ? color : 'none'} />
  ),
  explore: ({ color, filled, sw }) => (
    <>
      <Circle cx={12} cy={12} r={8.5} {...stroke(color, sw)} />
      <Path d="M15.6 8.4 13.7 13.7 8.4 15.6 10.3 10.3z" {...stroke(color, sw)} fill={filled ? color : 'none'} />
    </>
  ),
  learn: ({ color, filled, sw }) => (
    <>
      <Path d="M12 6.6C10.2 5.3 7.7 4.7 4.5 4.8v12.6c3.2-.1 5.7.5 7.5 1.8 1.8-1.3 4.3-1.9 7.5-1.8V4.8c-3.2-.1-5.7.5-7.5 1.8z" {...stroke(color, sw)} fill={filled ? color : 'none'} fillOpacity={filled ? 0.18 : 0} />
      <Path d="M12 6.6v12.6" {...stroke(color, sw)} />
    </>
  ),
  social: ({ color, filled, sw }) => (
    <>
      <Circle cx={9} cy={8.6} r={3.1} {...stroke(color, sw)} fill={filled ? color : 'none'} />
      <Path d="M3.4 19.2c.6-3.1 2.8-5 5.6-5s5 1.9 5.6 5" {...stroke(color, sw)} />
      <Circle cx={16.6} cy={9.6} r={2.5} {...stroke(color, sw)} />
      <Path d="M16 14.4c2.3.1 4 1.7 4.6 4.3" {...stroke(color, sw)} />
    </>
  ),
  heart: ({ color, filled, sw }) => (
    <Path d="M20.4 8.8c0 4.5-8.4 10.4-8.4 10.4S3.6 13.3 3.6 8.8a4.3 4.3 0 0 1 8.4-1.2 4.3 4.3 0 0 1 8.4 1.2Z" {...stroke(color, sw)} fill={filled ? color : 'none'} />
  ),
  share: ({ color, filled, sw }) => (
    <>
      <Path d="m8.6 12.1 6.8-4.2M8.6 12.1l6.8 4.2" {...stroke(color, sw)} />
      <Circle cx={6.1} cy={12.1} r={2.2} {...stroke(color, sw)} fill={filled ? color : 'none'} />
      <Circle cx={17.9} cy={5.1} r={2.2} {...stroke(color, sw)} fill={filled ? color : 'none'} />
      <Circle cx={17.9} cy={19.1} r={2.2} {...stroke(color, sw)} fill={filled ? color : 'none'} />
    </>
  ),
  profile: ({ color, filled, sw }) => (
    <>
      <Circle cx={12} cy={8.4} r={3.6} {...stroke(color, sw)} fill={filled ? color : 'none'} />
      <Path d="M4.8 19.6c.9-3.5 3.7-5.6 7.2-5.6s6.3 2.1 7.2 5.6" {...stroke(color, sw)} />
    </>
  ),
  settings: ({ color, sw }) => (
    <>
      <Path d={GEAR} {...stroke(color, sw)} />
      <Circle cx={12} cy={12} r={2.8} {...stroke(color, sw)} />
    </>
  ),
  bell: ({ color, filled, sw }) => (
    <>
      <Path d="M6.2 16.4V11a5.8 5.8 0 0 1 11.6 0v5.4l1.6 1.6H4.6z" {...stroke(color, sw)} fill={filled ? color : 'none'} />
      <Path d="M10 20.4a2.1 2.1 0 0 0 4 0" {...stroke(color, sw)} />
    </>
  ),
  search: ({ color, sw }) => (
    <>
      <Circle cx={11} cy={11} r={6.4} {...stroke(color, sw)} />
      <Path d="M15.8 15.8 20 20" {...stroke(color, sw)} />
    </>
  ),
  filter: ({ color, sw }) => <Path d="M4 7h16M7 12h10M10 17h4" {...stroke(color, sw)} />,
  menu: ({ color, sw }) => <Path d="M4 7h16M4 12h16M4 17h16" {...stroke(color, sw)} />,
  sidebar: ({ color, sw }) => (
    <>
      <Rect x={3.8} y={5} width={16.4} height={14} rx={2.2} {...stroke(color, sw)} />
      <Path d="M9.4 5v14" {...stroke(color, sw)} />
    </>
  ),
  grid: ({ color, sw }) => (
    <>
      <Rect x={4} y={4} width={6.6} height={6.6} rx={1.6} {...stroke(color, sw)} />
      <Rect x={13.4} y={4} width={6.6} height={6.6} rx={1.6} {...stroke(color, sw)} />
      <Rect x={4} y={13.4} width={6.6} height={6.6} rx={1.6} {...stroke(color, sw)} />
      <Rect x={13.4} y={13.4} width={6.6} height={6.6} rx={1.6} {...stroke(color, sw)} />
    </>
  ),

  // ── Progression ──
  // Rank: stacked service chevrons (an insignia, not a trophy).
  rank: ({ color, sw }) => <Path d="M6 8.6 12 4.8l6 3.8M6 13.4l6-3.8 6 3.8M6 18.2l6-3.8 6 3.8" {...stroke(color, sw)} />,
  // XP: the star from the GRATEAPEX logo.
  xp: ({ color, filled, sw }) => (
    <Path d="m12 3.6 2.4 5.2 5.6.6-4.2 3.8 1.2 5.6L12 15.9l-5 2.9 1.2-5.6L4 9.4l5.6-.6z" {...stroke(color, sw)} fill={filled ? color : 'none'} />
  ),
  level: ({ color, filled, sw }) => (
    <Path d="M12 3.5 19.4 7.8v8.4L12 20.5l-7.4-4.3V7.8z" {...stroke(color, sw)} fill={filled ? color : 'none'} fillOpacity={filled ? 0.2 : 0} />
  ),
  mastery: ({ color, filled, sw }) => (
    <>
      <Circle cx={12} cy={12} r={8.4} {...stroke(color, sw)} />
      <Circle cx={12} cy={12} r={4.9} {...stroke(color, sw)} />
      <Circle cx={12} cy={12} r={1.5} fill={color} stroke="none" opacity={filled ? 1 : 0.9} />
    </>
  ),
  streak: ({ color, filled, sw }) => (
    <Path
      d="M12 20.6c3.4 0 5.7-2.4 5.7-5.6 0-3.4-2.4-5.3-3.6-8.1-.5-1.1-.6-2.2-.4-3.4-2.9 1.5-4.6 4-4.9 6.9-.9-.5-1.6-1.4-1.9-2.6-1.6 1.6-2.6 3.6-2.6 5.6 0 4.1 3.3 7.2 7.7 7.2z"
      {...stroke(color, sw)}
      fill={filled ? color : 'none'}
    />
  ),
  // Reinforcement: spaced review coming back around.
  reinforce: ({ color, sw }) => (
    <>
      <Path d="M19 12a7 7 0 0 1-12.3 4.6M5 12a7 7 0 0 1 12.3-4.6" {...stroke(color, sw)} />
      <Path d="M17.6 3.8v3.9h-3.9M6.4 20.2v-3.9h3.9" {...stroke(color, sw)} />
    </>
  ),
  achievement: ({ color, filled, sw }) => (
    <>
      <Circle cx={12} cy={9.2} r={5.2} {...stroke(color, sw)} fill={filled ? color : 'none'} fillOpacity={filled ? 0.2 : 0} />
      <Path d="M9 13.6 7.6 20.4l4.4-2.1 4.4 2.1-1.4-6.8" {...stroke(color, sw)} />
      <Path d="m12 6.7.8 1.6 1.7.2-1.3 1.2.4 1.7-1.6-.9-1.6.9.4-1.7-1.3-1.2 1.7-.2z" fill={color} stroke="none" />
    </>
  ),
  challenge: ({ color, filled, sw }) => (
    <Path d="M13.4 3 5.6 13.4h6.1l-1.1 7.6 7.8-10.4h-6.1z" {...stroke(color, sw)} fill={filled ? color : 'none'} />
  ),
  course: ({ color, sw }) => (
    <>
      <Path d="M12 3.6 3.6 8 12 12.4 20.4 8z" {...stroke(color, sw)} />
      <Path d="M3.6 12 12 16.4 20.4 12M3.6 16 12 20.4 20.4 16" {...stroke(color, sw)} />
    </>
  ),
  lesson: ({ color, sw }) => (
    <>
      <Path d="M7 3.5h7l4.5 4.5v11A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z" {...stroke(color, sw)} />
      <Path d="M14 3.5V8h4.5M8.6 12.4h6.8M8.6 16h4.6" {...stroke(color, sw)} />
    </>
  ),
  chart: ({ color, sw }) => <Path d="M4.5 20h15M7.6 16.4v-4.6M12 16.4V7.2M16.4 16.4V9.8" {...stroke(color, sw)} />,
  trend: ({ color, sw }) => <Path d="m4 16.5 5-5 4 4 7-7M15.2 8.5H20v4.8" {...stroke(color, sw)} />,
  timer: ({ color, sw }) => (
    <>
      <Circle cx={12} cy={13.4} r={7} {...stroke(color, sw)} />
      <Path d="M12 13.4V9.8M10 3.4h4M18.6 6.8l-1.4 1.4" {...stroke(color, sw)} />
    </>
  ),
  clock: ({ color, sw }) => (
    <>
      <Circle cx={12} cy={12} r={8.5} {...stroke(color, sw)} />
      <Path d="M12 7.5V12l3 2" {...stroke(color, sw)} />
    </>
  ),
  calendar: ({ color, sw }) => (
    <>
      <Rect x={4} y={5.4} width={16} height={14.6} rx={2.2} {...stroke(color, sw)} />
      <Path d="M4 10h16M8.4 3.4v3.8M15.6 3.4v3.8" {...stroke(color, sw)} />
    </>
  ),

  // ── Subjects ──
  biochemistry: ({ color, sw }) => (
    <Path d="M9.4 3.6h5.2M10.4 3.6v5.6L5.3 17.7a1.9 1.9 0 0 0 1.6 2.8h10.2a1.9 1.9 0 0 0 1.6-2.8l-5.1-8.5V3.6M7.6 14.2h8.8" {...stroke(color, sw)} />
  ),
  physiology: ({ color, sw }) => (
    <>
      <Path d="M12 19.6s-7.6-4.4-7.6-10A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.6 2.4c0 5.6-7.6 10-7.6 10z" {...stroke(color, sw)} />
      <Path d="M6.8 12.2h2.6l1.3-2.2 2.2 4.4 1.3-2.2h3" {...stroke(color, sw)} />
    </>
  ),
  // Anatomy: the human body, front view (head, shoulders, arms, legs).
  anatomy: ({ color, filled, sw }) => (
    <>
      <Circle cx={11.9} cy={4.2} r={2.15} {...stroke(color, sw)} fill={filled ? color : 'none'} />
      <Path
        d="M10.9 7.2c-1.4.2-2.6.5-3.3 1.3-.6.8-1.1 2.8-1.7 5.1-.1.6.6.9 1 .4l1.6-3.4.2 4.2.4 5.7c.1.7 1.3.7 1.4 0l.9-5.2c.1-.5.9-.5 1 0l.9 5.2c.1.7 1.3.7 1.4 0l.4-5.7.2-4.2 1.6 3.4c.4.5 1.1.2 1-.4-.6-2.3-1.1-4.3-1.7-5.1-.7-.8-1.9-1.1-3.3-1.3z"
        {...stroke(color, sw)}
        fill={filled ? color : 'none'}
        fillOpacity={filled ? 0.2 : 0}
      />
    </>
  ),

  // ── Discovery ──
  research: ({ color, sw }) => (
    <>
      <Path d="M5 5.4h11v13.1a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 18.5z" {...stroke(color, sw)} />
      <Path d="M16 9h2.6v9.4A1.6 1.6 0 0 1 17 20h-2.4M8 9h5M8 12.4h5M8 15.8h3" {...stroke(color, sw)} />
    </>
  ),
  connection: ({ color, sw }) => (
    <Path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" {...stroke(color, sw)} />
  ),
  repost: ({ color, sw }) => (
    <Path d="m17 2.5 3.5 3.5L17 9.5M3.5 11V9.5A3.5 3.5 0 0 1 7 6h13.5M7 21.5 3.5 18 7 14.5M20.5 13v1.5A3.5 3.5 0 0 1 17 18H3.5" {...stroke(color, sw)} />
  ),
  announcement: ({ color, sw }) => (
    <Path d="M4.6 10.2v3.6a1 1 0 0 0 1 1H8l7 4V5.2l-7 4H5.6a1 1 0 0 0-1 1zM18.2 9.4a3.6 3.6 0 0 1 0 5.2M8.6 14.8l1 4.4" {...stroke(color, sw)} />
  ),
  sparkle: ({ color, filled, sw }) => (
    <>
      <Path d="m11 4.6 1.7 4.7 4.7 1.7-4.7 1.7L11 17.4l-1.7-4.7L4.6 11l4.7-1.7z" {...stroke(color, sw)} fill={filled ? color : 'none'} />
      <Path d="M18.4 3.6v3.2M16.8 5.2H20M17.8 16.6v2.6M16.5 17.9h2.6" {...stroke(color, sw)} />
    </>
  ),
  book: ({ color, sw }) => (
    <>
      <Path d="M5.5 5.5A2 2 0 0 1 7.5 3.5h11v14h-11a2 2 0 0 0-2 2z" {...stroke(color, sw)} />
      <Path d="M5.5 19.5a2 2 0 0 0 2 1h11v-3" {...stroke(color, sw)} />
    </>
  ),
  upload: ({ color, sw }) => (
    <Path d="M12 15.4V4.6M7.6 9 12 4.6 16.4 9M4.6 15v3.4A1.6 1.6 0 0 0 6.2 20h11.6a1.6 1.6 0 0 0 1.6-1.6V15" {...stroke(color, sw)} />
  ),
  camera: ({ color, sw }) => (
    <>
      <Path d="M4 8.6A1.6 1.6 0 0 1 5.6 7h2.5l1.5-2.4h4.8L15.9 7h2.5A1.6 1.6 0 0 1 20 8.6v9.3a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 17.9z" {...stroke(color, sw)} />
      <Circle cx={12} cy={13} r={3.4} {...stroke(color, sw)} />
    </>
  ),
  image: ({ color, sw }) => (
    <>
      <Rect x={4} y={5} width={16} height={14} rx={2.2} {...stroke(color, sw)} />
      <Circle cx={9} cy={10} r={1.6} {...stroke(color, sw)} />
      <Path d="m20 15.6-4.4-4.4L7.2 19" {...stroke(color, sw)} />
    </>
  ),

  // ── Utility ──
  check: ({ color, sw }) => <Path d="m5 12.6 4.4 4.4L19 7.4" {...stroke(color, sw)} />,
  close: ({ color, sw }) => <Path d="m6.4 6.4 11.2 11.2M17.6 6.4 6.4 17.6" {...stroke(color, sw)} />,
  trash: ({ color, sw }) => <><Path d="M4.8 7.2h14.4M9 7.2V4.8h6v2.4M7 7.4l.8 12h8.4l.8-12M10 10.5v5.8M14 10.5v5.8" {...stroke(color, sw)} /></>,
  plus: ({ color, sw }) => <Path d="M12 5v14M5 12h14" {...stroke(color, sw)} />,
  minus: ({ color, sw }) => <Path d="M5 12h14" {...stroke(color, sw)} />,
  chevronRight: ({ color, sw }) => <Path d="m9.6 6 6 6-6 6" {...stroke(color, sw)} />,
  chevronLeft: ({ color, sw }) => <Path d="m14.4 6-6 6 6 6" {...stroke(color, sw)} />,
  chevronDown: ({ color, sw }) => <Path d="m6 9.6 6 6 6-6" {...stroke(color, sw)} />,
  chevronUp: ({ color, sw }) => <Path d="m6 14.4 6-6 6 6" {...stroke(color, sw)} />,
  arrowRight: ({ color, sw }) => <Path d="M5 12h14M13.4 6l6 6-6 6" {...stroke(color, sw)} />,
  arrowLeft: ({ color, sw }) => <Path d="M19 12H5M10.6 6l-6 6 6 6" {...stroke(color, sw)} />,
  play: ({ color, filled, sw }) => <Path d="M8 5.6v12.8L18 12z" {...stroke(color, sw)} fill={filled ? color : 'none'} />,
  info: ({ color, sw }) => (
    <>
      <Circle cx={12} cy={12} r={8.5} {...stroke(color, sw)} />
      <Path d="M12 11v5M12 8h.01" {...stroke(color, sw)} />
    </>
  ),
  warning: ({ color, sw }) => (
    <>
      <Path d="M10.6 4.8a1.6 1.6 0 0 1 2.8 0l7 12.4a1.6 1.6 0 0 1-1.4 2.4H5a1.6 1.6 0 0 1-1.4-2.4z" {...stroke(color, sw)} />
      <Path d="M12 10v4M12 16.8h.01" {...stroke(color, sw)} />
    </>
  ),
  lock: ({ color, sw }) => (
    <>
      <Rect x={5.4} y={10.4} width={13.2} height={10} rx={2.2} {...stroke(color, sw)} />
      <Path d="M8.4 10.4V8a3.6 3.6 0 0 1 7.2 0v2.4" {...stroke(color, sw)} />
    </>
  ),
  edit: ({ color, sw }) => <Path d="m15.4 5.4 3.2 3.2L9 18.2l-4 .8.8-4zM13.4 7.4l3.2 3.2" {...stroke(color, sw)} />,
  logout: ({ color, sw }) => (
    <Path d="M14 4.6H6.6A1.6 1.6 0 0 0 5 6.2v11.6a1.6 1.6 0 0 0 1.6 1.6H14M10.4 12H20M16.6 8.6 20 12l-3.4 3.4" {...stroke(color, sw)} />
  ),
  mail: ({ color, sw }) => (
    <>
      <Rect x={3.6} y={5.6} width={16.8} height={12.8} rx={2.2} {...stroke(color, sw)} />
      <Path d="m4.4 7.4 7.6 5.8 7.6-5.8" {...stroke(color, sw)} />
    </>
  ),
  key: ({ color, sw }) => (
    <>
      <Circle cx={8} cy={15.4} r={3.6} {...stroke(color, sw)} />
      <Path d="M10.6 12.8 19 4.4M16.2 7.2l2.2 2.2M14 9.4l1.6 1.6" {...stroke(color, sw)} />
    </>
  ),
  eye: ({ color, sw }) => (
    <>
      <Path d="M2.6 12S6 5.6 12 5.6 21.4 12 21.4 12 18 18.4 12 18.4 2.6 12 2.6 12z" {...stroke(color, sw)} />
      <Circle cx={12} cy={12} r={2.8} {...stroke(color, sw)} />
    </>
  ),
  eyeOff: ({ color, sw }) => (
    <>
      <Path d="M9.9 5.9A9.6 9.6 0 0 1 12 5.6c6 0 9.4 6.4 9.4 6.4a16 16 0 0 1-2.6 3.4M6.6 6.6C3.9 8.3 2.6 12 2.6 12S6 18.4 12 18.4c1.8 0 3.3-.6 4.6-1.4" {...stroke(color, sw)} />
      <Path d="M4 4l16 16M10 10a2.8 2.8 0 0 0 4 4" {...stroke(color, sw)} />
    </>
  ),
  // ── Added for the Hub's social, messaging and study tools (same grid, same stroke) ──
  chat: ({ color, filled, sw }) => (
    <Path d="M20 11.4a7.6 7.6 0 0 1-8.2 7.6c-.9 0-1.8-.2-2.6-.5L4.4 20l1.2-4A7.4 7.4 0 0 1 4 11.4C4 7.3 7.6 4 12 4s8 3.3 8 7.4z" {...stroke(color, sw)} fill={filled ? color : 'none'} fillOpacity={filled ? 0.2 : 0} />
  ),
  phone: ({ color, sw }) => (
    <Path d="M6.6 4h2.8l1.4 3.6-1.8 1.2a11 11 0 0 0 5.2 5.2l1.2-1.8L19 13.6v2.8A1.8 1.8 0 0 1 17.2 18C10.4 17.6 6.4 13.6 6 6.8A1.8 1.8 0 0 1 6.6 4z" {...stroke(color, sw)} />
  ),
  phoneOff: ({ color, sw }) => (
    <>
      <Path d="M6.6 4h2.8l1.4 3.6-1.8 1.2c.5 1 1.1 1.9 1.9 2.7M14.4 14.4l1.2-1.8L19 14v2.4A1.8 1.8 0 0 1 17.2 18c-2.2-.1-4.1-.8-5.7-1.9" {...stroke(color, sw)} />
      <Path d="M4 4l16 16" {...stroke(color, sw)} />
    </>
  ),
  mic: ({ color, sw }) => (
    <>
      <Rect x={9} y={3.6} width={6} height={10.4} rx={3} {...stroke(color, sw)} />
      <Path d="M5.8 11.4a6.2 6.2 0 0 0 12.4 0M12 17.6V21M9 21h6" {...stroke(color, sw)} />
    </>
  ),
  paperclip: ({ color, sw }) => (
    <Path d="m19.4 11.2-7.1 7.1a4.4 4.4 0 0 1-6.2-6.2l7.5-7.5a2.9 2.9 0 0 1 4.1 4.1l-7.5 7.5a1.5 1.5 0 0 1-2.1-2.1l6.8-6.8" {...stroke(color, sw)} />
  ),
  file: ({ color, sw }) => (
    <>
      <Path d="M6.4 3.6h7.2l4 4V19a1.4 1.4 0 0 1-1.4 1.4H6.4A1.4 1.4 0 0 1 5 19V5a1.4 1.4 0 0 1 1.4-1.4z" {...stroke(color, sw)} />
      <Path d="M13.4 3.8V8h4.2M8.4 12.6h7.2M8.4 16h5" {...stroke(color, sw)} />
    </>
  ),
  users: ({ color, sw }) => (
    <>
      <Circle cx={9} cy={8.6} r={3.1} {...stroke(color, sw)} />
      <Path d="M3.4 19.2c.6-3.1 2.8-5 5.6-5s5 1.9 5.6 5" {...stroke(color, sw)} />
      <Circle cx={16.6} cy={9.6} r={2.5} {...stroke(color, sw)} />
      <Path d="M16 14.4c2.3.1 4 1.7 4.6 4.3" {...stroke(color, sw)} />
    </>
  ),
  star: ({ color, filled, sw }) => (
    <Path d="m12 4 2.4 5 5.4.7-4 3.8 1 5.4-4.8-2.6-4.8 2.6 1-5.4-4-3.8 5.4-.7z" {...stroke(color, sw)} fill={filled ? color : 'none'} />
  ),
  trophy: ({ color, filled, sw }) => (
    <>
      <Path d="M8 4h8v5a4 4 0 0 1-8 0z" {...stroke(color, sw)} fill={filled ? color : 'none'} fillOpacity={filled ? 0.2 : 0} />
      <Path d="M8 6H4.8v1.4A3 3 0 0 0 8 10.4M16 6h3.2v1.4a3 3 0 0 1-3.2 3M12 13v4M8.6 20h6.8M9.8 17h4.4" {...stroke(color, sw)} />
    </>
  ),
  repeat: ({ color, sw }) => (
    <>
      <Path d="M17 3.6 20.4 7 17 10.4M4 11.4V10a3 3 0 0 1 3-3h13.2M7 20.4 3.6 17 7 13.6M20 12.6V14a3 3 0 0 1-3 3H3.8" {...stroke(color, sw)} />
    </>
  ),
  target: ({ color, sw }) => (
    <>
      <Circle cx={12} cy={12} r={8.2} {...stroke(color, sw)} />
      <Circle cx={12} cy={12} r={4.6} {...stroke(color, sw)} />
      <Circle cx={12} cy={12} r={1.2} fill={color} />
    </>
  ),
  swords: ({ color, sw }) => (
    <>
      <Path d="M5 5l9 9M5 5V8.4L7.6 11M19 5l-9 9M19 5v3.4L16.4 11M8 16l-2.4 2.4M5 17l2 2M16 16l2.4 2.4M17 19l2-2" {...stroke(color, sw)} />
    </>
  ),
  shuffle: ({ color, sw }) => (
    <Path d="M4 7h3.2c1.6 0 3 .8 3.9 2.1l2.8 3.8c.9 1.3 2.3 2.1 3.9 2.1H20M4 17h3.2c1.6 0 3-.8 3.9-2.1M13.9 8.1c.9-1.3 2.3-2.1 3.9-2.1H20M17.6 3.6 20 6l-2.4 2.4M17.6 12.6 20 15l-2.4 2.4" {...stroke(color, sw)} />
  ),
  list: ({ color, sw }) => <Path d="M8.6 7h10.8M8.6 12h10.8M8.6 17h10.8M4.6 7h.01M4.6 12h.01M4.6 17h.01" {...stroke(color, sw)} />,
  send: ({ color, sw }) => <Path d="M20.4 3.6 10.6 13.4M20.4 3.6 14 20.4l-3.4-7-7-3.4z" {...stroke(color, sw)} />,
  flag: ({ color, sw }) => <Path d="M5.6 20.6V4.4M5.6 5c3.6-1.6 5.6 1.6 9.2 0 1.6-.7 3-.7 3.6-.4v7.4c-.6-.3-2-.3-3.6.4-3.6 1.6-5.6-1.6-9.2 0" {...stroke(color, sw)} />,
  brain: ({ color, sw }) => (
    <>
      <Path d="M9.4 4.6A3 3 0 0 0 6.5 7.4 3.2 3.2 0 0 0 5 10.2a3.2 3.2 0 0 0 1.2 2.6 3.3 3.3 0 0 0 .6 3.1 3 3 0 0 0 3.2 2.5 2 2 0 0 0 2-2V6.6a2 2 0 0 0-2.4-2z" {...stroke(color, sw)} />
      <Path d="M14.6 4.6a3 3 0 0 1 2.9 2.8 3.2 3.2 0 0 1 1.5 2.8 3.2 3.2 0 0 1-1.2 2.6 3.3 3.3 0 0 1-.6 3.1 3 3 0 0 1-3.2 2.5 2 2 0 0 1-2-2V6.6a2 2 0 0 1 2.4-2z" {...stroke(color, sw)} />
    </>
  ),
  crown: ({ color, filled, sw }) => <Path d="M4.4 8.6 8 12l4-6.4 4 6.4 3.6-3.4-1.4 9H5.8z" {...stroke(color, sw)} fill={filled ? color : 'none'} fillOpacity={filled ? 0.25 : 0} />,
  link: ({ color, sw }) => <Path d="M10.4 13.6a3.6 3.6 0 0 0 5.1 0l3-3a3.6 3.6 0 0 0-5.1-5.1l-1.1 1.1M13.6 10.4a3.6 3.6 0 0 0-5.1 0l-3 3a3.6 3.6 0 0 0 5.1 5.1l1.1-1.1" {...stroke(color, sw)} />,
  bookmark: ({ color, filled, sw }) => <Path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.8L6 20V5a1 1 0 0 1 1-1z" {...stroke(color, sw)} fill={filled ? color : 'none'} />,
  volume: ({ color, sw }) => <Path d="M4.6 9.6h3L12 6v12l-4.4-3.6h-3zM15.4 9.2a4 4 0 0 1 0 5.6M17.8 6.8a7.4 7.4 0 0 1 0 10.4" {...stroke(color, sw)} />,
  volumeOff: ({ color, sw }) => <Path d="M4.6 9.6h3L12 6v12l-4.4-3.6h-3zM16 9.6l4 4.8M20 9.6l-4 4.8" {...stroke(color, sw)} />,
  globe: ({ color, sw }) => (
    <>
      <Circle cx={12} cy={12} r={8.4} {...stroke(color, sw)} />
      <Path d="M3.8 12h16.4M12 3.6c2.4 2.4 3.4 5.2 3.4 8.4s-1 6-3.4 8.4c-2.4-2.4-3.4-5.2-3.4-8.4s1-6 3.4-8.4z" {...stroke(color, sw)} />
    </>
  ),
  cloud: ({ color, sw }) => <Path d="M7.4 18.4a4.2 4.2 0 0 1-.6-8.3 5.6 5.6 0 0 1 10.8 1.2 3.6 3.6 0 0 1-.4 7.1z" {...stroke(color, sw)} />,
  cloudOff: ({ color, sw }) => (
    <>
      <Path d="M8.2 18.4h9a3.6 3.6 0 0 0 1.6-6.8M6.6 10.2a4.2 4.2 0 0 0 .8 8.2M9.4 6.4a5.6 5.6 0 0 1 8.2 4.9" {...stroke(color, sw)} />
      <Path d="M4 4l16 16" {...stroke(color, sw)} />
    </>
  ),
  palette: ({ color, sw }) => (
    <>
      <Path d="M12 3.6a8.4 8.4 0 0 0 0 16.8c1.3 0 1.9-.9 1.5-1.9-.5-1.2.2-2.4 1.6-2.4h1.7a3.6 3.6 0 0 0 3.6-3.6C20.4 7.2 16.6 3.6 12 3.6z" {...stroke(color, sw)} />
      <Circle cx={7.8} cy={11.4} r={1} fill={color} />
      <Circle cx={10.6} cy={7.6} r={1} fill={color} />
      <Circle cx={15.2} cy={8} r={1} fill={color} />
    </>
  ),
  arrowUp: ({ color, sw }) => <Path d="M12 19V5M6 11l6-6 6 6" {...stroke(color, sw)} />,
  arrowDown: ({ color, sw }) => <Path d="M12 5v14M6 13l6 6 6-6" {...stroke(color, sw)} />,
  drop: ({ color, filled, sw }) => <Path d="M12 3.8c3 3.6 5.4 6.5 5.4 9.6a5.4 5.4 0 0 1-10.8 0c0-3.1 2.4-6 5.4-9.6z" {...stroke(color, sw)} fill={filled ? color : 'none'} fillOpacity={filled ? 0.25 : 0} />,
  help: ({ color, sw }) => (
    <>
      <Circle cx={12} cy={12} r={8.4} {...stroke(color, sw)} />
      <Path d="M9.6 9.6a2.5 2.5 0 0 1 4.9.6c0 1.7-2.5 2.1-2.5 3.6M12 16.8h.01" {...stroke(color, sw)} />
    </>
  ),
  layers: ({ color, sw }) => (
    <>
      <Rect x={4} y={7.6} width={13.4} height={11} rx={2} {...stroke(color, sw)} />
      <Path d="M7 5h12a1.4 1.4 0 0 1 1.4 1.4V16" {...stroke(color, sw)} />
    </>
  ),
  ruler: ({ color, sw }) => <Path d="M4.4 15.6 15.6 4.4l4 4L8.4 19.6zM8.6 11.4l2 2M11.4 8.6l2 2M5.6 14.4l1.6 1.6" {...stroke(color, sw)} />,
  download: ({ color, sw }) => <Path d="M12 4v11M7 10.6l5 5 5-5M5 19.4h14" {...stroke(color, sw)} />,
  more: ({ color }) => (
    <>
      <Circle cx={5.8} cy={12} r={1.6} fill={color} />
      <Circle cx={12} cy={12} r={1.6} fill={color} />
      <Circle cx={18.2} cy={12} r={1.6} fill={color} />
    </>
  ),
  bug: ({ color, sw }) => (
    <>
      <Path d="M9 8.4a3 3 0 0 1 6 0v6.2a3 3 0 0 1-6 0zM9 11h6M5 8l3 1.6M19 8l-3 1.6M4.6 13.2H9M19.4 13.2H15M5.4 18.6 8.6 16.4M18.6 18.6l-3.2-2.2M10.4 5.6 9 3.6M13.6 5.6 15 3.6" {...stroke(color, sw)} />
    </>
  ),
  smile: ({ color, sw }) => (
    <>
      <Circle cx={12} cy={12} r={8.4} {...stroke(color, sw)} />
      <Path d="M8.6 14a4.2 4.2 0 0 0 6.8 0M9.4 9.8h.01M14.6 9.8h.01" {...stroke(color, sw)} />
    </>
  ),
  dot: ({ color }) => <Circle cx={12} cy={12} r={3.4} fill={color} />,
} satisfies Record<string, Draw>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 20,
  color,
  filled = false,
  strokeWidth = 1.8,
  label,
  style,
}: {
  name: IconName;
  size?: number;
  color: string;
  filled?: boolean;
  strokeWidth?: number;
  label?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const draw: Draw = ICONS[name];
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={[{ transform: [{ scale: 1.07 }] }, style]}
      // Standard ARIA props: they work on native and render as real
      // attributes on the web (the legacy accessibility* props would be
      // passed to the <svg> element and trigger React warnings).
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {draw({ color, filled, sw: strokeWidth })}
    </Svg>
  );
}
