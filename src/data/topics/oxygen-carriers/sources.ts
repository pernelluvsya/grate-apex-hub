// Source references, concepts, discrepancies and diagram knowledge for
// Biochemistry → Oxygen Carriers: Myoglobin and Haemoglobin.
//
// Lecture source (defines WHAT is taught; see content-catalog.ts):
//   DECK = "Oxygen Carriers: Myoglobin and Haemoglobin" — Edwin F. Laing
//          (Oxygen carriers25.ppt, 58 slides).
//
// Many slides carry pasted textbook pages and figures (four of them as
// vector metafiles); all were read and are written out in `diagrams`.
// Slide 33 has a speaker note (catalogued as an annotation; not quizzed).
//
// Reference (clarification only, never extra syllabus):
//   Lehninger Principles of Biochemistry — printed pages, via leh(...).
//   p. 162 CO vs O₂ binding · p. 171 pH and O₂ binding · p. 172 BPG, fetal Hb
import { LEHNINGER_ID } from '@/data/content-catalog';
import type {
  SourceDiagram,
  SourceDiscrepancy,
  SourceReference,
} from '@/data/lesson-types';
import { slides, type ConceptDraft } from '@/data/topics/build';

export const TOPIC_ID = 'oxygen-carriers';
const DECK = 'o2c-oxygen-carriers25';

const VISUAL = [3, 5, 9, 11, 15, 17, 23, 25, 28, 29, 32, 33, 34, 37, 38, 42, 45, 46, 48, 49, 50, 54, 55, 58];

// ref([24, 25]) → deck slides 24 and 25.
export function ref(numbers: number[]): SourceReference[] {
  return slides(DECK, numbers, numbers.filter((n) => VISUAL.includes(n)));
}

// leh(172) → Lehninger page 172.
export function leh(...pages: number[]): SourceReference[] {
  return pages.map((page) => ({ sourceId: LEHNINGER_ID, page }));
}

const L1 = `${TOPIC_ID}-1`;
const L2 = `${TOPIC_ID}-2`;
const L3 = `${TOPIC_ID}-3`;
const L4 = `${TOPIC_ID}-4`;
export const LESSON_IDS = [L1, L2, L3, L4] as const;

// ─── Concepts ───────────────────────────────────────────────────────

export const concepts = {
  // Lesson 1 — Myoglobin: roles, haem iron and structure
  'carrier-roles': {
    lessonId: L1, name: 'What the oxygen carriers do', category: 'core', relevance: 'core',
    sourceRefs: ref([2]),
  },
  'haem-iron': {
    lessonId: L1, name: 'Haem iron: coordination and oxidation state', category: 'core', relevance: 'core',
    sourceRefs: ref([4, 5, 6]),
  },
  'myoglobin-shape': {
    lessonId: L1, name: 'Myoglobin’s helices and naming', category: 'core', relevance: 'core',
    sourceRefs: ref([7, 8, 9]),
  },
  'helix-termination': {
    lessonId: L1, name: 'What ends an α-helix', category: 'important-detail', relevance: 'core',
    sourceRefs: ref([10, 11, 12]),
  },
  'residue-distribution': {
    lessonId: L1, name: 'Inside vs outside myoglobin', category: 'core', relevance: 'core',
    sourceRefs: ref([13, 14, 15, 16, 17]),
  },

  // Lesson 2 — The active site
  'proximal-distal-histidine': {
    lessonId: L2, name: 'Proximal and distal histidines', category: 'core', relevance: 'core',
    sourceRefs: ref([16, 17]),
  },
  'preventing-oxidation': {
    lessonId: L2, name: 'How the protein protects the haem iron', category: 'core', relevance: 'core',
    sourceRefs: ref([18, 19, 20]),
  },
  'co-binding': {
    lessonId: L2, name: 'Why CO binds less tightly to the proteins', category: 'clinical', relevance: 'core',
    sourceRefs: [...ref([21, 22, 23]), ...leh(162)],
  },
  'conserved-residues': {
    lessonId: L2, name: 'Conserved residues of haemoglobin', category: 'important-detail', relevance: 'core',
    sourceRefs: ref([26, 27, 28, 29]),
  },

  // Lesson 3 — Haemoglobin structure, allostery and cooperativity
  'haemoglobin-structure': {
    lessonId: L3, name: 'Haemoglobin A: α₂β₂', category: 'core', relevance: 'core',
    sourceRefs: ref([24, 25]),
  },
  'allostery': {
    lessonId: L3, name: 'Haemoglobin as an allosteric protein', category: 'core', relevance: 'core',
    sourceRefs: ref([30, 31]),
  },
  't-r-switch': {
    lessonId: L3, name: 'T and R states', category: 'visual-process', relevance: 'core',
    sourceRefs: ref([32, 33, 34]),
  },
  'mb-vs-hb-binding': {
    lessonId: L3, name: 'Myoglobin vs haemoglobin oxygen binding', category: 'core', relevance: 'core',
    sourceRefs: ref([35]),
  },
  'dissociation-curve': {
    lessonId: L3, name: 'The oxygen dissociation curve', category: 'visual-process', relevance: 'core',
    sourceRefs: ref([36, 37, 38]),
  },

  // Lesson 4 — Bohr effect, 2,3-BPG and fetal haemoglobin
  'bohr-effect': {
    lessonId: L4, name: 'The Bohr–Haldane effect', category: 'core', relevance: 'core',
    sourceRefs: [...ref([39, 40, 41, 42, 45, 46]), ...leh(171)],
  },
  'bohr-mechanism': {
    lessonId: L4, name: 'Which residues carry the Bohr protons', category: 'important-detail', relevance: 'core',
    sourceRefs: ref([43, 44]),
  },
  'bpg-binding': {
    lessonId: L4, name: 'How 2,3-BPG binds haemoglobin', category: 'core', relevance: 'core',
    sourceRefs: [...ref([47, 48, 49, 50, 51]), ...leh(172)],
    verificationNote: 'The lecture gives 2,3-BPG five negative charges; the textbook page pasted on slide 50 says four (discrepancy "bpg-charges"). The number is not quizzed.',
  },
  'bpg-p50': {
    lessonId: L4, name: '2,3-BPG and P50', category: 'core', relevance: 'core',
    sourceRefs: ref([52, 53, 54, 55, 58]),
  },
  'fetal-haemoglobin': {
    lessonId: L4, name: 'Fetal haemoglobin', category: 'clinical', relevance: 'core',
    sourceRefs: [...ref([56, 57, 58]), ...leh(172)],
  },
} satisfies Record<string, ConceptDraft>;

export type ConceptId = keyof typeof concepts;

// ─── Discrepancies ──────────────────────────────────────────────────

export const discrepancies: SourceDiscrepancy[] = [
  {
    id: 'bpg-charges',
    concept: 'Number of negative charges on 2,3-BPG',
    status: 'unresolved',
    statements: [
      { text: 'Slide 47: six positive charges on haemoglobin “bind to the five negative charges on 2,3-BPG”.', sourceRefs: ref([47]) },
      { text: 'Textbook page pasted on slide 50: the positive groups interact with DPG’s “four negative charges”.', sourceRefs: ref([50]) },
    ],
    note: 'Both agree that 2,3-BPG is strongly negative and binds positively charged groups (three per β chain). The exact number of negative charges is not quizzed.',
  },
  {
    id: 'serine-charge',
    concept: 'Why fetal haemoglobin binds less 2,3-BPG',
    status: 'resolved',
    statements: [
      { text: 'Slide 57: residue H21 is serine instead of histidine; “Serine is more negatively charged than histidine and relatively repels 2,3-BPG.”', sourceRefs: ref([57]) },
      { text: 'Slide 47: His H21 (His 143) is one of the positively charged groups on each β chain that bind 2,3-BPG.', sourceRefs: ref([47]) },
    ],
    resolution: {
      text: 'Lehninger confirms the outcome: fetal haemoglobin (α₂γ₂) has a much lower affinity for BPG and so a higher affinity for O₂. Read with slide 47, the point is that serine lacks the positive charge histidine provides at H21, so the BPG pocket is less positive — “more negatively charged” in relative terms.',
      sourceRefs: [...ref([47]), ...leh(172)],
    },
  },
  {
    id: 'mb-curve-shape',
    concept: 'Name of the myoglobin curve shape',
    status: 'resolved',
    statements: [
      { text: 'Slide 37: myoglobin — “Left; rectangular parabolic”.', sourceRefs: ref([37]) },
      { text: 'Textbook page on slide 38: the myoglobin equation Y = pO₂/(pO₂ + P50) “plots as a hyperbola”.', sourceRefs: ref([38]) },
    ],
    resolution: {
      text: 'The lecture’s own pasted page settles it: myoglobin’s curve is hyperbolic (a rectangular hyperbola). Lessons say “hyperbolic”.',
      sourceRefs: ref([38]),
    },
  },
];

// ─── Diagram knowledge ──────────────────────────────────────────────

export const diagrams: SourceDiagram[] = [
  {
    id: 'oxygen-site',
    title: 'The oxygen-binding site in myoglobin (slide 17, textbook page)',
    sourceRefs: ref([17]),
    shows: [
      'The haem sits in a crevice; its polar propionates are on the surface (ionised at physiological pH); the rest of the haem is inside, among nonpolar residues except two histidines.',
      'The iron is bonded to histidine F8 — the proximal histidine — at the fifth coordination position; the iron sits about 0.3 Å out of the porphyrin plane, on the F8 side.',
      'O₂ binds on the other side of the haem plane, at the sixth coordination position. Histidine E7, the distal histidine, is nearby but not bonded to the haem.',
      'Threonine, tyrosine and tryptophan point their polar groups outward.',
    ],
  },
  {
    id: 'co-figure',
    title: 'Diminished CO affinity (slide 23)',
    sourceRefs: ref([23]),
    shows: [
      'A: in isolated iron porphyrins CO binds linearly (Fe–C–O in a straight line).',
      'B: in myoglobin and haemoglobin the distal histidine (E7) prevents linear binding; CO binds bent, and its affinity is markedly reduced.',
      'C: O₂ binds in a bent mode in myoglobin and haemoglobin (and in isolated porphyrins).',
    ],
  },
  {
    id: 'conserved-table',
    title: 'Conserved amino acid residues in haemoglobin (slides 28–29)',
    sourceRefs: ref([28, 29]),
    shows: [
      'F8 His — proximal haem-linked histidine. E7 His — distal histidine near the haem.',
      'CD1 Phe and F4 Leu — haem contacts.',
      'B6 Gly — allows the close approach of the B and E helices (no space for a larger side chain).',
      'C2 Pro — helix termination. HC2 Tyr — cross-links the H and F helices.',
      'C4 Thr and H10 Lys — role uncertain.',
    ],
  },
  {
    id: 'subunit-contacts',
    title: 'Haemoglobin subunit contacts (slide 32)',
    sourceRefs: ref([32]),
    shows: [
      'Tetramer (molecular weight about 64,500); each subunit’s haem sits in a pocket near the surface, linked to a histidine.',
      'α₁β₁: a large, relatively fixed (stabilising) contact area.',
      'α₁β₂: a smaller functional contact area, closely connected to the haems, where movement occurs during oxygenation and deoxygenation.',
    ],
  },
  {
    id: 't-r-figure',
    title: 'The α₁β₂ T ↔ R switch (slides 33–34)',
    sourceRefs: ref([33, 34]),
    shows: [
      'T (deoxy) form: α₁ Tyr C7 hydrogen-bonds to β₂ Asp G1; hydrogen bonds, electrostatic attractions, salt links and van der Waals forces are intact.',
      'R (oxy) form: after oxygenation, α₁ Asp G1 hydrogen-bonds to β₂ Asn G4; those T-state bonds are broken.',
      'The dove-tailed interface lets the subunits slide across each other.',
      'Slide 34: ion pairs (salt bridges) between and within subunits — e.g. α Arg HC3 with Asp H9 of the other α chain, α Lys C5 with a β C-terminal carboxylate, and β His HC3 with Asp FG1 — stabilise the T state.',
    ],
  },
  {
    id: 'odc-figures',
    title: 'Oxygen dissociation curves (slides 37–38)',
    sourceRefs: ref([37, 38]),
    shows: [
      'Myoglobin: hyperbolic, to the left (P50 ≈ 1 torr), non-cooperative. Haemoglobin: sigmoid, to the right (P50 = 26 torr), cooperative.',
      'At every pO₂ above 0, myoglobin is more saturated than haemoglobin.',
      'Typical pO₂: about 100 torr in the alveoli of the lungs; about 20 torr in the capillaries of active muscle — haemoglobin’s P50 lies between them.',
    ],
  },
  {
    id: 'bohr-figures',
    title: 'Effect of pH (slides 42, 45, 46)',
    sourceRefs: ref([42, 45, 46]),
    shows: [
      'Lowering the pH from 7.6 to 7.2 shifts the haemoglobin curve to the right — H⁺ releases O₂.',
      'Summary: O₂Hb + H⁺ + CO₂ ⇌ Hb(H⁺)(CO₂) + O₂ — to the right in actively metabolising tissue, to the left in the alveoli.',
      'Higher CO₂ (at constant pH) also lowers the affinity. Bohr described the effect in 1904; Haldane the reciprocal effect in the lungs ten years later.',
      'Curves at pH 7.6 (lungs), 7.4 (blood) and 7.2 (tissues).',
    ],
  },
  {
    id: 'bpg-figures',
    title: '2,3-BPG binding and its effect (slides 48–50, 54–55)',
    sourceRefs: ref([48, 49, 50, 54, 55]),
    shows: [
      'One 2,3-BPG binds in the central cavity of deoxyhaemoglobin, interacting with three positively charged groups on each β chain (His 2 / the N-terminal amino group, Lys 82, His 143).',
      'BPG binds deoxyhaemoglobin but not oxyhaemoglobin; the binding of O₂ and BPG is mutually exclusive: Hb–BPG + 4 O₂ ⇌ Hb(O₂)₄ + BPG.',
      'No BPG: P50 ≈ 1 torr; with BPG: P50 = 26 torr. Rising BPG concentrations shift the curve further right.',
      'Stored blood (acid-citrate-dextrose) loses BPG (4.5 → <0.5 mM in ten days), so its P50 falls to 16 torr; adding inosine prevents the loss.',
      'In hypoxia (e.g. severe emphysema) and at high altitude (4.5 → 7.0 mM within two days at 4500 m), BPG rises and more O₂ is unloaded.',
    ],
  },
  {
    id: 'fetal-figure',
    title: 'Fetal haemoglobin (slide 58)',
    sourceRefs: ref([58]),
    shows: [
      'Haemoglobin F is α₂γ₂; haemoglobin A is α₂β₂.',
      'Fetal red cells have a higher oxygen affinity than maternal red cells (in the presence of BPG), so O₂ flows from maternal oxyhaemoglobin to fetal deoxyhaemoglobin.',
    ],
  },
];
