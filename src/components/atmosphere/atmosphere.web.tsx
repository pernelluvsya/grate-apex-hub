import type { CSSProperties } from 'react';

import { atmosphereFor, type AtmosphereMood, MOODS, rgba } from '@/components/atmosphere/config';
import { PageMotifs } from '@/components/atmosphere/page-motifs';
import { useResolvedColorScheme, useTheme } from '@/hooks/use-theme';
import { useThemeDef } from '@/theme';

import classes from './atmosphere.module.css';

// Web atmosphere: pure CSS layers (no WebGL, no canvas), so it costs
// almost nothing and never blocks input. Decorative only — hidden from
// assistive technology.
export function Atmosphere({ mood }: { mood: AtmosphereMood }) {
  const scheme = useResolvedColorScheme();
  const tokens = useTheme();
  const def = useThemeDef();
  const palette = atmosphereFor(scheme, tokens, def.light);
  const levels = MOODS[mood];

  const vars = {
    '--atm-base': palette.base,
    '--atm-field-a': rgba(palette.fieldA),
    '--atm-field-b': rgba(palette.fieldB),
    '--atm-field-c': rgba(palette.fieldC),
    '--atm-aurora-a': rgba(palette.auroraA),
    '--atm-aurora-b': rgba(palette.auroraB),
    '--atm-aurora-c': rgba(palette.auroraC),
    '--atm-grid': rgba(palette.grid),
    '--atm-ray': rgba(palette.ray),
    '--atm-gold': rgba(palette.gold),
    '--atm-vignette': rgba(palette.vignette),
    '--atm-grain-blend': palette.grainBlend,
    '--o-fields': levels.fields,
    '--o-aurora': levels.aurora,
    '--o-rays': levels.rays,
    '--o-grid': levels.grid,
    '--o-gold': levels.gold,
    '--o-grain': palette.grain * levels.grain,
    '--o-vignette': levels.vignette,
  } as CSSProperties;

  return (
    <div
      aria-hidden="true"
      className={`${classes.root} ${levels.animate ? classes.animate : ''}`}
      style={vars}
      data-mood={mood}
      data-scheme={scheme}
    >
      <div className={`${classes.layer} ${classes.fields}`} />
      <div className={`${classes.layer} ${classes.aurora}`}>
        <div className={`${classes.blob} ${classes.blobA}`} />
        <div className={`${classes.blob} ${classes.blobB}`} />
        <div className={`${classes.blob} ${classes.blobC}`} />
      </div>
      <div className={`${classes.layer} ${classes.rays}`} />
      <div className={`${classes.layer} ${classes.grid}`} />
      <svg className={classes.doodles} viewBox="0 0 1440 1000" preserveAspectRatio="xMidYMid slice" focusable="false">
          <g fill="none" stroke={def.light ? '#274BA8' : '#C9D9FF'} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.68}>
            <g transform="translate(92 188) rotate(-12)">
              <circle cx="52" cy="42" r="8" /><circle cx="103" cy="72" r="6" /><circle cx="22" cy="105" r="5" />
              <path d="m58 46 39 23M48 50l-23 49m30-50 14-39m-8 4 12-5" />
              <circle cx="70" cy="8" r="3" /><circle cx="118" cy="92" r="3" />
            </g>
            <g transform="translate(1160 130) rotate(10)">
              <path d="M35 10c42 28 42 68 0 96s-42 68 0 96m42-192c-42 28-42 68 0 96s42 68 0 96M37 27h38M24 56h64M24 84h64M24 112h64M24 140h64M37 169h38" />
            </g>
            <g transform="translate(260 728) rotate(-8)">
              <path d="M14 18h82l-8 21-9 89a15 15 0 0 1-15 13H46a15 15 0 0 1-15-13l-9-89z" />
              <path d="M30 83c16 9 33-9 56 1m-61-46h58M6 18h98" />
              <circle cx="48" cy="97" r="3" /><circle cx="69" cy="111" r="3" />
            </g>
            <g transform="translate(1012 687) rotate(9)">
              <path d="M27 18v50a34 34 0 0 0 68 0V40a19 19 0 0 0-38 0v30a9 9 0 0 0 18 0V48" />
              <path d="M27 18a12 12 0 1 0-24 0v8a12 12 0 0 0 24 0m68-8a12 12 0 1 1 24 0v8a12 12 0 0 1-24 0" />
              <circle cx="61" cy="123" r="5" />
            </g>
            <g transform="translate(752 340) rotate(8)">
              <path d="M12 22h94v66H12zM59 22v66M24 39h24m-24 14h24m24-14h18m-18 14h18M20 98h78" />
            </g>
          </g>
          <g fill="#FFD46B" opacity={0.76}>
            <circle cx="252" cy="148" r="5" /><circle cx="1288" cy="332" r="5" />
            <path d="m905 192 4 12 12 4-12 4-4 12-4-12-12-4 12-4z" />
            <path d="m126 596 3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
            <path d="m1072 882 3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
          </g>
      </svg>
      <div className={`${classes.layer} ${classes.gold}`} />
      <div className={`${classes.layer} ${classes.grain}`} />
      <div className={`${classes.layer} ${classes.vignette}`} />
      <PageMotifs lively={mood === 'lively' || mood === 'expressive' || mood === 'auth'} />
    </div>
  );
}
