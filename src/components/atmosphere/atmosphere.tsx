import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { atmosphereFor, type AtmosphereMood, MOODS } from '@/components/atmosphere/config';
import { PageMotifs } from '@/components/atmosphere/page-motifs';
import { useResolvedColorScheme, useTheme } from '@/hooks/use-theme';
import { useThemeDef } from '@/theme';

// Native atmosphere: the same tonal fields and glow as the web version,
// drawn once as static SVG gradients. No blur, no animation, no grain —
// phones get the depth without the cost.
export function Atmosphere({ mood }: { mood: AtmosphereMood }) {
  const scheme = useResolvedColorScheme();
  const tokens = useTheme();
  const def = useThemeDef();
  const palette = atmosphereFor(scheme, tokens, def.light);
  const levels = MOODS[mood];

  const fields = [
    { id: 'fa', tint: palette.fieldA, cx: '8%', cy: '-8%', rx: '110%', ry: '60%', scale: levels.fields },
    { id: 'fb', tint: palette.fieldB, cx: '105%', cy: '22%', rx: '85%', ry: '50%', scale: levels.fields },
    { id: 'fc', tint: palette.fieldC, cx: '50%', cy: '112%', rx: '120%', ry: '45%', scale: levels.fields },
    { id: 'aa', tint: palette.auroraA, cx: '10%', cy: '4%', rx: '75%', ry: '40%', scale: levels.aurora },
    { id: 'gd', tint: palette.gold, cx: '86%', cy: '4%', rx: '55%', ry: '28%', scale: levels.gold },
    { id: 'vg', tint: palette.vignette, cx: '50%', cy: '35%', rx: '95%', ry: '80%', scale: levels.vignette, inverted: true },
  ];

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: palette.base }]} accessible={false}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          {fields.map((field) => (
            <RadialGradient key={field.id} id={field.id} cx={field.cx} cy={field.cy} rx={field.rx} ry={field.ry} fx={field.cx} fy={field.cy}>
              {field.inverted
                ? [
                    <Stop key="a" offset="0.55" stopColor={field.tint[0]} stopOpacity={0} />,
                    <Stop key="b" offset="1" stopColor={field.tint[0]} stopOpacity={field.tint[1] * field.scale} />,
                  ]
                : [
                    <Stop key="a" offset="0" stopColor={field.tint[0]} stopOpacity={field.tint[1] * field.scale} />,
                    <Stop key="b" offset="1" stopColor={field.tint[0]} stopOpacity={0} />,
                  ]}
            </RadialGradient>
          ))}
        </Defs>
        {fields.map((field) =>
          field.scale > 0 ? <Rect key={field.id} x="0" y="0" width="100%" height="100%" fill={`url(#${field.id})`} /> : null
        )}
      </Svg>
      <PageMotifs lively={mood === 'lively' || mood === 'expressive' || mood === 'auth'} />
    </View>
  );
}
