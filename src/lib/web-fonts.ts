import { Platform } from 'react-native';

// Loads the GRATEAPEX display face (Manrope) on the web without ever
// blocking the first paint: the stylesheet is added after start-up, text
// renders immediately in the system font, then swaps (font-display: swap).
// If the font cannot be reached, everything stays readable in the fallback.
const HREF = 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@600;700;800;900&display=swap';

let requested = false;

export function loadWebFonts() {
  if (requested || Platform.OS !== 'web' || typeof document === 'undefined') return;
  requested = true;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = HREF;
  document.head.appendChild(link);
}
