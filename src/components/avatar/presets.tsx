import { useId } from 'react';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

// Illustrated GRATEAPEX avatars: medical students in white coats, drawn as
// shaded cartoon portraits (original artwork — no photos, no third-party
// assets). Stored on the profile as "preset:<id>" in `avatar_url`.

export type AvatarPresetId = 'male-1' | 'male-2' | 'male-3' | 'female-1' | 'female-2' | 'female-3';

type HairStyle = 'crop' | 'sidepart' | 'fade-beard' | 'long' | 'curly' | 'hijab';

type Preset = {
  id: AvatarPresetId;
  group: 'male' | 'female';
  label: string;
  style: HairStyle;
  skin: { base: string; light: string; shade: string; lip: string; lipLight: string; blush: string };
  hair: { base: string; light: string; dark: string };
  iris: string;
  scrub: { base: string; dark: string };
  bg: readonly [string, string];
  glasses?: boolean;
  earrings?: boolean;
};

export const AVATAR_PRESETS: readonly Preset[] = [
  {
    id: 'male-1',
    group: 'male',
    label: 'Male avatar, short textured hair',
    style: 'crop',
    skin: { base: '#B87B54', light: '#CF9670', shade: '#8F5A38', lip: '#8E4B3B', lipLight: '#A65C4A', blush: '#C9604A' },
    hair: { base: '#1F1814', light: '#4E3D32', dark: '#0F0C0A' },
    iris: '#3B2414',
    scrub: { base: '#2F6BFF', dark: '#1F4FCC' },
    bg: ['#3A6FE8', '#0D2D8C'],
  },
  {
    id: 'male-2',
    group: 'male',
    label: 'Male avatar, side-parted hair and glasses',
    style: 'sidepart',
    skin: { base: '#F2CBA8', light: '#FADDC4', shade: '#D9A783', lip: '#C9786A', lipLight: '#DC8C7C', blush: '#E8907E' },
    hair: { base: '#6B4428', light: '#9C6C46', dark: '#4A2D19' },
    iris: '#5E7A3E',
    scrub: { base: '#1F8A70', dark: '#156B56' },
    bg: ['#2C4FA8', '#0B1E5B'],
    glasses: true,
  },
  {
    id: 'male-3',
    group: 'male',
    label: 'Male avatar, short fade and beard',
    style: 'fade-beard',
    skin: { base: '#6E432A', light: '#87573A', shade: '#4E2E1C', lip: '#5E3226', lipLight: '#7A4433', blush: '#8A4A32' },
    hair: { base: '#161210', light: '#3D332D', dark: '#0B0908' },
    iris: '#2A1A10',
    scrub: { base: '#123A8F', dark: '#0C2966' },
    bg: ['#54A0FF', '#0F62D4'],
  },
  {
    id: 'female-1',
    group: 'female',
    label: 'Female avatar, long hair',
    style: 'long',
    skin: { base: '#D9A27C', light: '#ECBC97', shade: '#B9805A', lip: '#B85A55', lipLight: '#D27268', blush: '#E07A6A' },
    hair: { base: '#3A2418', light: '#71492F', dark: '#22140D' },
    iris: '#4A2E1C',
    scrub: { base: '#1F8A70', dark: '#156B56' },
    bg: ['#3A6FE8', '#0D2D8C'],
  },
  {
    id: 'female-2',
    group: 'female',
    label: 'Female avatar, natural curly hair',
    style: 'curly',
    skin: { base: '#7F4B2E', light: '#9A5E3B', shade: '#5C341F', lip: '#6E3528', lipLight: '#8E4B3A', blush: '#9A4E3A' },
    hair: { base: '#1C1411', light: '#4A3A30', dark: '#0E0A08' },
    iris: '#2C1A10',
    scrub: { base: '#2F6BFF', dark: '#1F4FCC' },
    bg: ['#2C4FA8', '#0B1E5B'],
    earrings: true,
  },
  {
    id: 'female-3',
    group: 'female',
    label: 'Female avatar, hijab',
    style: 'hijab',
    skin: { base: '#EEC6A3', light: '#F8DCC2', shade: '#D4A27E', lip: '#C46B63', lipLight: '#D9807A', blush: '#E58E7E' },
    hair: { base: '#2E4A94', light: '#4A69BB', dark: '#20356E' }, // the hijab
    iris: '#5A3A22',
    scrub: { base: '#1F8A70', dark: '#156B56' },
    bg: ['#54A0FF', '#0F62D4'],
  },
];

export function getAvatarPreset(value: string | null | undefined): Preset | undefined {
  if (!value?.startsWith('preset:')) return undefined;
  const id = value.slice('preset:'.length);
  return AVATAR_PRESETS.find((preset) => preset.id === id);
}

export function presetValue(id: AvatarPresetId) {
  return `preset:${id}`;
}

// ── Geometry (viewBox 0 0 200 200) ──────────────────────────────────────

const HEAD_MALE =
  'M100 36C124 36 140 52 141 76C142 90 141 100 138 110C135 124 124 138 108 142C103 143.5 97 143.5 92 142C76 138 65 124 62 110C59 100 58 90 59 76C60 52 76 36 100 36Z';
const HEAD_FEMALE =
  'M100 38C123 38 138 53 139 76C140 90 139 100 136 110C132 124 120 138 106 142.5C102 144 98 144 94 142.5C80 138 68 124 64 110C61 100 60 90 61 76C62 53 77 38 100 38Z';

// A curly outline: small outward bumps along an ellipse arc.
function scallop(cx: number, cy: number, rx: number, ry: number, from: number, to: number, count: number, bump: number) {
  let d = '';
  for (let i = 0; i <= count; i++) {
    const angle = ((from + ((to - from) * i) / count) * Math.PI) / 180;
    const x = (cx + rx * Math.cos(angle)).toFixed(1);
    const y = (cy + ry * Math.sin(angle)).toFixed(1);
    d += i === 0 ? `${x} ${y}` : ` A${bump} ${bump} 0 0 1 ${x} ${y}`;
  }
  return d;
}

const CURLY_BACK = `M${scallop(100, 86, 72, 66, 150, 390, 24, 7.5)} L156 152 Q100 172 44 152 Z`;
const CURLY_FRONT = `M57 98C51 58 74 29 100 29C126 29 149 58 143 98L${scallop(100, 102, 41, 44, -14, -166, 12, 6)} Z`;

// Little curl marks for texture inside the curly volume.
const CURL_MARKS = Array.from({ length: 16 }, (_, i) => {
  const angle = ((160 + (220 * i) / 15) * Math.PI) / 180;
  const ring = i % 2 === 0 ? 0.84 : 0.7;
  const x = 100 + 72 * ring * Math.cos(angle);
  const y = 86 + 66 * ring * Math.sin(angle);
  return `M${x.toFixed(1)} ${y.toFixed(1)}a3.6 3.6 0 1 1 5.6 1.8`;
}).join('');

export function AvatarPresetArt({ preset, size }: { preset: Preset; size: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (name: string) => `${name}${uid}`;
  const { skin, hair, style } = preset;
  const female = preset.group === 'female';
  const hijab = style === 'hijab';
  const head = female ? HEAD_FEMALE : HEAD_MALE;

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label={preset.label}>
      <Defs>
        <LinearGradient id={id('bg')} x1="0" y1="0" x2="0.35" y2="1">
          <Stop offset="0" stopColor={preset.bg[0]} />
          <Stop offset="1" stopColor={preset.bg[1]} />
        </LinearGradient>
        <RadialGradient id={id('glow')} cx="50%" cy="38%" r="55%">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.2} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={id('skin')} cx="42%" cy="36%" r="72%">
          <Stop offset="0" stopColor={skin.light} />
          <Stop offset="0.55" stopColor={skin.base} />
          <Stop offset="1" stopColor={skin.shade} />
        </RadialGradient>
        <LinearGradient id={id('hair')} x1="0.2" y1="0" x2="0.6" y2="1">
          <Stop offset="0" stopColor={hair.light} />
          <Stop offset="0.45" stopColor={hair.base} />
          <Stop offset="1" stopColor={hair.dark} />
        </LinearGradient>
        <LinearGradient id={id('coat')} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#D9E1F1" />
        </LinearGradient>
        <LinearGradient id={id('metal')} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F1F4FA" />
          <Stop offset="1" stopColor="#8E99AE" />
        </LinearGradient>
        <RadialGradient id={id('iris')} cx="45%" cy="40%" r="60%">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.25} />
          <Stop offset="0.35" stopColor={preset.iris} />
          <Stop offset="1" stopColor="#120B07" />
        </RadialGradient>
        <ClipPath id={id('clip')}>
          <Circle cx={100} cy={100} r={100} />
        </ClipPath>
        <ClipPath id={id('eyeL')}>
          <Path d="M74 94C78 88.5 90 88.5 94 94C90 98.5 78 98.5 74 94Z" />
        </ClipPath>
        <ClipPath id={id('eyeR')}>
          <Path d="M106 94C110 88.5 122 88.5 126 94C122 98.5 110 98.5 106 94Z" />
        </ClipPath>
      </Defs>

      <G clipPath={`url(#${id('clip')})`}>
        {/* Background */}
        <Circle cx={100} cy={100} r={100} fill={`url(#${id('bg')})`} />
        <Circle cx={100} cy={100} r={100} fill={`url(#${id('glow')})`} />
        <Circle cx={100} cy={100} r={91} fill="none" stroke="#FFFFFF" strokeOpacity={0.07} strokeWidth={1.5} />

        {/* Hair or hijab behind the head */}
        {style === 'long' ? (
          <Path d="M56 100C44 56 70 24 102 24C136 24 160 56 148 104C144 132 150 158 162 184C148 196 128 196 116 190L84 190C72 196 52 196 38 184C50 158 60 132 56 100Z" fill={`url(#${id('hair')})`} />
        ) : null}
        {style === 'curly' ? (
          <>
            <Path d={CURLY_BACK} fill={`url(#${id('hair')})`} />
            <Path d={CURL_MARKS} fill="none" stroke={hair.light} strokeOpacity={0.55} strokeWidth={1.6} strokeLinecap="round" />
          </>
        ) : null}
        {hijab ? <Path d="M50 110C44 60 70 26 100 26C130 26 156 60 150 110C148 138 132 158 100 166C68 158 52 138 50 110Z" fill={`url(#${id('hair')})`} /> : null}

        {/* White coat, scrubs, stethoscope and a gold GRATEAPEX pin */}
        <Path d="M18 200C20 170 40 152 72 146C80 156 120 156 128 146C160 152 180 170 182 200Z" fill={`url(#${id('coat')})`} />
        <Path d="M80 147C88 158 94 170 100 181C106 170 112 158 120 147C112 151 88 151 80 147Z" fill={preset.scrub.base} />
        <Path d="M84 148.5C90 156 110 156 116 148.5" stroke={preset.scrub.dark} strokeWidth={3} strokeOpacity={0.55} fill="none" strokeLinecap="round" />
        <Path d="M80 147C84 166 88 183 92 200M120 147C116 166 112 183 108 200" stroke="#BCC7DD" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <Path d="M72 146C70 160 68 176 66 200M128 146C130 160 132 176 134 200" stroke="#E7ECF6" strokeWidth={6} strokeOpacity={0.9} fill="none" />
        {!hijab ? (
          <>
            <Path d="M82 151C70 163 70 184 82 194" stroke="#3E4A63" strokeWidth={4.5} fill="none" strokeLinecap="round" />
            <Path d="M118 151C128 160 128 171 123 177" stroke="#3E4A63" strokeWidth={4.5} fill="none" strokeLinecap="round" />
            <Circle cx={122} cy={184} r={7.5} fill={`url(#${id('metal')})`} stroke="#6E7890" strokeWidth={1.2} />
            <Circle cx={122} cy={184} r={3.4} fill="#7A8499" />
          </>
        ) : null}
        <Path d="M146 168l1.9 3.9 4.3.6-3.1 3 .7 4.2-3.8-2-3.8 2 .7-4.2-3.1-3 4.3-.6z" fill="#FDC00A" stroke="#C89400" strokeWidth={0.6} />

        {/* Hijab drape over the shoulders */}
        {hijab ? (
          <>
            <Path d="M56 200C58 178 70 160 88 152C96 158 104 158 112 152C130 160 142 178 144 200Z" fill={hair.base} />
            <Path d="M82 168C88 180 92 190 94 200M118 168C112 180 108 190 106 200M100 162C100 176 100 188 100 200" stroke={hair.dark} strokeWidth={2} strokeOpacity={0.55} fill="none" strokeLinecap="round" />
          </>
        ) : null}

        {/* Neck and ears */}
        {!hijab ? (
          <>
            <Path d="M84 118L84 150C92 158 108 158 116 150L116 118Z" fill={skin.base} />
            <Path d="M84 126C92 138 108 138 116 126L116 141C108 149 92 149 84 141Z" fill={skin.shade} opacity={0.55} />
            <Path d="M61 88C52 84 49 98 53 106C56 113 62 114 64 110L62 92Z" fill={skin.base} />
            <Path d="M59 94C55.5 95.5 55.5 103 59 106" stroke={skin.shade} strokeWidth={2} strokeOpacity={0.7} fill="none" strokeLinecap="round" />
            <Path d="M139 88C148 84 151 98 147 106C144 113 138 114 136 110L138 92Z" fill={skin.base} />
            <Path d="M141 94C144.5 95.5 144.5 103 141 106" stroke={skin.shade} strokeWidth={2} strokeOpacity={0.7} fill="none" strokeLinecap="round" />
          </>
        ) : null}
        {preset.earrings ? (
          <>
            <Circle cx={57} cy={114} r={4.6} fill="none" stroke="#FDC00A" strokeWidth={1.8} />
            <Circle cx={143} cy={114} r={4.6} fill="none" stroke="#FDC00A" strokeWidth={1.8} />
          </>
        ) : null}

        {/* Head, with soft shading */}
        <Path d={head} fill={`url(#${id('skin')})`} />
        <Path d="M128 66C137 84 137 108 129 124C123 134 113 140 104 142.5C116 132 125 118 127 104C129 91 129 79 128 66Z" fill={skin.shade} opacity={0.32} />
        <Ellipse cx={92} cy={60} rx={18} ry={8} fill="#FFFFFF" opacity={0.1} />
        <Ellipse cx={80} cy={110} rx={8.5} ry={5} fill={skin.blush} opacity={female ? 0.22 : 0.12} />
        <Ellipse cx={120} cy={110} rx={8.5} ry={5} fill={skin.blush} opacity={female ? 0.22 : 0.12} />

        {/* Beard (under the mouth) */}
        {style === 'fade-beard' ? (
          <>
            <Path d="M61 96C60 126 79 149 100 150C121 149 140 126 139 96C135 110 129 119 121 122C115 117.5 108 117 100 117.5C92 117 85 117.5 79 122C71 119 65 110 61 96Z" fill={`url(#${id('hair')})`} />
            <Path d="M85 120.5C91 115.5 97 116 100 117.8C103 116 109 115.5 115 120.5C109 122.4 104.5 121.6 100 120.8C95.5 121.6 91 122.4 85 120.5Z" fill={hair.base} />
          </>
        ) : null}

        {/* Eyes */}
        <Path d="M74 94C78 88.5 90 88.5 94 94C90 98.5 78 98.5 74 94Z" fill="#FFFFFF" />
        <Path d="M106 94C110 88.5 122 88.5 126 94C122 98.5 110 98.5 106 94Z" fill="#FFFFFF" />
        <G clipPath={`url(#${id('eyeL')})`}>
          <Circle cx={84} cy={93.6} r={4.8} fill={`url(#${id('iris')})`} />
          <Circle cx={84} cy={93.6} r={2.2} fill="#0B0705" />
          <Circle cx={85.7} cy={92} r={1.35} fill="#FFFFFF" />
        </G>
        <G clipPath={`url(#${id('eyeR')})`}>
          <Circle cx={116} cy={93.6} r={4.8} fill={`url(#${id('iris')})`} />
          <Circle cx={116} cy={93.6} r={2.2} fill="#0B0705" />
          <Circle cx={117.7} cy={92} r={1.35} fill="#FFFFFF" />
        </G>
        <Path d="M72.5 93.5C77 86.5 91 86.5 95.5 93.5M104.5 93.5C109 86.5 123 86.5 127.5 93.5" stroke="#2A1A12" strokeWidth={2.3} fill="none" strokeLinecap="round" />
        {female ? <Path d="M73.6 92L69.8 89.4M126.4 92L130.2 89.4" stroke="#2A1A12" strokeWidth={2} strokeLinecap="round" /> : null}
        <Path d="M76 97.4C80 99.2 88 99.2 92 97.4M108 97.4C112 99.2 120 99.2 124 97.4" stroke={skin.shade} strokeWidth={1.2} strokeOpacity={0.6} fill="none" strokeLinecap="round" />

        {/* Brows */}
        {female ? (
          <Path
            d="M72 81C78 75 89 75 95 78.6C95.4 79.8 94.6 80.6 93.4 80.3C87.6 78.6 80 78.8 74.2 82.6C72.8 83.3 71.4 82.2 72 81ZM128 81C122 75 111 75 105 78.6C104.6 79.8 105.4 80.6 106.6 80.3C112.4 78.6 120 78.8 125.8 82.6C127.2 83.3 128.6 82.2 128 81Z"
            fill={hijab ? '#3A2A20' : hair.dark}
          />
        ) : (
          <Path
            d="M71 82C77 76.5 88 75.5 95 78.5C95.8 80.4 94.8 81.6 93 81.2C87 79.6 80 80.4 74 84.2C72.4 85 70.6 83.6 71 82ZM129 82C123 76.5 112 75.5 105 78.5C104.2 80.4 105.2 81.6 107 81.2C113 79.6 120 80.4 126 84.2C127.6 85 129.4 83.6 129 82Z"
            fill={hair.dark}
          />
        )}

        {/* Nose */}
        <Path d="M102 97C104.5 104 105.5 110 107 114" stroke={skin.shade} strokeWidth={2.2} strokeOpacity={0.35} fill="none" strokeLinecap="round" />
        <Path d="M93.5 115.5C96.5 118.6 103.5 118.6 106.5 115.5" stroke={skin.shade} strokeWidth={2.2} strokeOpacity={0.7} fill="none" strokeLinecap="round" />
        <Path d="M99 99C98.8 104 98.8 108 99.2 112" stroke="#FFFFFF" strokeWidth={2.2} strokeOpacity={0.16} fill="none" strokeLinecap="round" />

        {/* Mouth: a soft closed smile */}
        <Path d="M88.5 124.2C92.5 122.6 96.5 122.4 100 123.8C103.5 122.4 107.5 122.6 111.5 124.2C106 126.4 94 126.4 88.5 124.2Z" fill={skin.lip} />
        <Path d="M90.5 125.8C94 131.6 106 131.6 109.5 125.8C104.5 128.4 95.5 128.4 90.5 125.8Z" fill={skin.lipLight} />
        <Path d="M88 124C94 128.2 106 128.2 112 124" stroke={skin.lip} strokeWidth={1.8} fill="none" strokeLinecap="round" />
        <Path d="M96 129.4C98.6 130.2 101.4 130.2 104 129.4" stroke="#FFFFFF" strokeWidth={1.2} strokeOpacity={0.25} fill="none" strokeLinecap="round" />

        {/* Glasses */}
        {preset.glasses ? (
          <>
            <Rect x={70.5} y={84.5} width={27} height={19} rx={8} fill="#FFFFFF" fillOpacity={0.06} stroke="#2B2F3E" strokeWidth={2.6} />
            <Rect x={102.5} y={84.5} width={27} height={19} rx={8} fill="#FFFFFF" fillOpacity={0.06} stroke="#2B2F3E" strokeWidth={2.6} />
            <Path d="M97.5 92C99 89.5 101 89.5 102.5 92M70.5 91L60.5 89M129.5 91L139.5 89" stroke="#2B2F3E" strokeWidth={2.4} fill="none" strokeLinecap="round" />
            <Path d="M75.5 88.5L81.5 87M107.5 88.5L113.5 87" stroke="#FFFFFF" strokeWidth={1.8} strokeOpacity={0.55} strokeLinecap="round" />
          </>
        ) : null}

        {/* Hair in front */}
        {style === 'crop' ? (
          <>
            <Path d="M58 92C52 58 72 31 101 31C130 31 148 56 142 92C141 80 138 72 133 66C126 63 120 64 113 60C105 64 95 64 87 60C80 64 72 64 67 68C62 74 59 82 58 92Z" fill={`url(#${id('hair')})`} />
            <Path d="M59 90C59 96 60 101 62 104L64 104C63 99 62.5 94 63 89ZM141 90C141 96 140 101 138 104L136 104C137 99 137.5 94 137 89Z" fill={hair.base} />
            <Path d="M72 48C78 42 88 39 96 40M106 39C116 40 126 44 132 52M80 56C88 52 98 51 108 53M114 54C120 55 126 58 130 62" stroke={hair.light} strokeWidth={2.4} strokeOpacity={0.5} fill="none" strokeLinecap="round" />
          </>
        ) : null}
        {style === 'sidepart' ? (
          <>
            <Path d="M58 94C50 54 76 28 104 29C134 30 150 56 142 94C140 78 135 67 127 60C116 66 100 68 86 64C80 62 76 60 72 58C65 66 60 78 58 94Z" fill={`url(#${id('hair')})`} />
            <Path d="M72 58C84 46 104 41 126 45C133 47 137 52 139 58C128 50 112 48 96 51C86 53 78 55 72 58Z" fill={hair.light} opacity={0.55} />
            <Path d="M84 38C81 44 78 51 76 57" stroke={hair.dark} strokeWidth={1.6} strokeOpacity={0.7} fill="none" strokeLinecap="round" />
            <Path d="M104 34C118 35 130 42 136 52" stroke={hair.light} strokeWidth={2.2} strokeOpacity={0.45} fill="none" strokeLinecap="round" />
          </>
        ) : null}
        {style === 'fade-beard' ? (
          <>
            <Path d="M62 80C60 52 78 35 100 35C122 35 140 52 138 80C134 67 124 59 112 57C104 55.6 96 55.6 88 57C76 59 66 67 62 80Z" fill={`url(#${id('hair')})`} />
            <Path d="M62 80C60.8 87 61 93 62.5 99L65 98C64 91 64 85 66 78ZM138 80C139.2 87 139 93 137.5 99L135 98C136 91 136 85 134 78Z" fill={hair.base} opacity={0.6} />
            <Path d="M80 46C88 42 98 41 106 42M110 43C118 45 124 49 128 54" stroke={hair.light} strokeWidth={2} strokeOpacity={0.45} fill="none" strokeLinecap="round" />
          </>
        ) : null}
        {style === 'long' ? (
          <>
            <Path d="M60 98C54 60 76 34 104 33C132 33 148 58 141 98C138 82 132 70 124 62C114 68 100 72 86 72C76 78 66 86 60 98Z" fill={`url(#${id('hair')})`} />
            <Path d="M61 96C54 122 52 150 58 178C64 178 70 170 72 158C70 138 68 118 66 98ZM139 96C146 122 148 150 142 178C136 178 130 170 128 158C130 138 132 118 134 98Z" fill={`url(#${id('hair')})`} />
            <Path d="M102 36C118 38 132 48 138 64M90 38C76 46 66 60 62 76M60 112C58 132 58 150 61 168M140 112C142 132 142 150 139 168" stroke={hair.light} strokeWidth={2.6} strokeOpacity={0.45} fill="none" strokeLinecap="round" />
          </>
        ) : null}
        {style === 'curly' ? (
          <>
            <Path d={CURLY_FRONT} fill={`url(#${id('hair')})`} />
            <Path d="M78 46a3.4 3.4 0 1 1 5.4 1.6M96 40a3.4 3.4 0 1 1 5.4 1.6M114 44a3.4 3.4 0 1 1 5.4 1.6M68 60a3.2 3.2 0 1 1 5 1.4M126 56a3.2 3.2 0 1 1 5 1.4" stroke={hair.light} strokeWidth={1.5} strokeOpacity={0.55} fill="none" strokeLinecap="round" />
          </>
        ) : null}
        {hijab ? (
          <>
            <Path d="M62 86C63 60 80 46 100 46C120 46 137 60 138 86C132 68 118 58 100 58C82 58 68 68 62 86Z" fill={hair.dark} />
            <Path d="M62 90C62 112 70 130 84 140M138 90C138 112 130 130 116 140" stroke={hair.dark} strokeWidth={3} strokeOpacity={0.35} fill="none" strokeLinecap="round" />
            <Path d="M70 40C82 32 100 30 116 33" stroke={hair.light} strokeWidth={3} strokeOpacity={0.5} fill="none" strokeLinecap="round" />
            <Circle cx={134} cy={132} r={3.4} fill="#FDC00A" stroke="#C89400" strokeWidth={0.8} />
          </>
        ) : null}
      </G>
    </Svg>
  );
}
