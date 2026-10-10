// Source references, concepts, discrepancies and diagram knowledge for
// Biochemistry → Cholesterol and Bile Biosynthesis.
//
// Lecture sources (define WHAT is taught; see content-catalog.ts):
//   DECK    = Cholesterol Biosynthesis.ppt — R A Ngala (20 slides). The
//             same file sits loose in content/BIOCHEMISTRY and inside the
//             topic ZIP (chol-cholesterol-biosynthesis is an exact copy).
//   FA_DECK = the Fatty Acid Metabolism deck (second version), included in
//             this topic's ZIP because the Pyruvate–Malate cycle is shared
//             (slides 12–14 of that deck).
//
// Slides whose information is in an image (all read and written out in
// `diagrams` below): 4, 5, 6, 8, 9, 10, 11, 12, 17, 18, 19.
//
// Reference (clarification only, never extra syllabus):
//   Lehninger Principles of Biochemistry — printed pages, via leh(...).
//   pp. 816–820 cholesterol synthesis · p. 826 regulation · p. 827 statins
import { LEHNINGER_ID } from '@/data/content-catalog';
import type {
  SourceDiagram,
  SourceDiscrepancy,
  SourceReference,
} from '@/data/lesson-types';
import { slides, type ConceptDraft } from '@/data/topics/build';

export const TOPIC_ID = 'cholesterol-and-bile-biosynthesis';
const DECK = 'cholesterol-biosynthesis-slides';
const FA_DECK = 'chol-fatty-acid-biosynthesis';

const VISUAL = [4, 5, 6, 8, 9, 10, 11, 12, 17, 18, 19];
const FA_VISUAL = [14];

// ref([8, 12]) → cholesterol deck slides 8 and 12 (12 marked as a diagram).
export function ref(numbers: number[]): SourceReference[] {
  return slides(DECK, numbers, numbers.filter((n) => VISUAL.includes(n)));
}

// fa([13, 14]) → slides of the fatty acid deck included in this ZIP.
export function fa(numbers: number[]): SourceReference[] {
  return slides(FA_DECK, numbers, numbers.filter((n) => FA_VISUAL.includes(n)));
}

// leh(817) → Lehninger page 817.
export function leh(...pages: number[]): SourceReference[] {
  return pages.map((page) => ({ sourceId: LEHNINGER_ID, page }));
}

const L1 = `${TOPIC_ID}-1`;
const L2 = `${TOPIC_ID}-2`;
const L3 = `${TOPIC_ID}-3`;
const L4 = `${TOPIC_ID}-4`;
const L5 = `${TOPIC_ID}-5`;
export const LESSON_IDS = [L1, L2, L3, L4, L5] as const;

// ─── Concepts ───────────────────────────────────────────────────────
// Names are shown to learners (Results, Review), so they read plainly.
// IDs are kept stable: saved progress and review schedules use them.

export const concepts = {
  // Lesson 1 — Structure, sites and raw materials
  'steroid-nucleus': {
    lessonId: L1, name: 'The steroid nucleus', category: 'core', relevance: 'core',
    sourceRefs: [...ref([3, 4]), ...leh(820)],
  },
  'cholesterol-landmarks': {
    lessonId: L1, name: 'Landmarks on the cholesterol molecule', category: 'visual-process', relevance: 'core',
    sourceRefs: [...ref([4]), ...leh(816, 820)],
  },
  'synthesis-sites': {
    lessonId: L1, name: 'Where cholesterol is made', category: 'core', relevance: 'core',
    sourceRefs: [...ref([2, 3]), ...leh(820)],
    verificationNote: 'The lecture gives "about 20%" as the liver’s share of daily production; Lehninger says only that much of the synthesis is in the liver (discrepancy "liver-share"). The figure is not quizzed.',
  },
  'acetate-origin': {
    lessonId: L1, name: 'Every carbon from acetate', category: 'core', relevance: 'core',
    sourceRefs: [...ref([2, 3, 5]), ...leh(816)],
  },
  'pyruvate-malate-supply': {
    lessonId: L1, name: 'Pyruvate–malate cycle: acetyl-CoA and NADPH supply', category: 'visual-process', relevance: 'core',
    sourceRefs: [...ref([6, 12]), ...fa([13, 14])],
  },

  // Lesson 2 — Acetyl-CoA to mevalonate
  'five-stages': {
    lessonId: L2, name: 'The five stages of synthesis', category: 'core', relevance: 'core',
    sourceRefs: [...ref([7]), ...leh(816)],
  },
  'acetoacetyl-coa-step': {
    lessonId: L2, name: 'Two acetyl-CoA → acetoacetyl-CoA', category: 'core', relevance: 'core',
    sourceRefs: [...ref([2, 8]), ...leh(817)],
  },
  'hmg-coa-formation': {
    lessonId: L2, name: 'Making HMG-CoA', category: 'core', relevance: 'core',
    sourceRefs: [...ref([7, 8, 12]), ...leh(817)],
  },
  'hmg-coa-crossroads': {
    lessonId: L2, name: 'HMG-CoA at the crossroads', category: 'visual-process', relevance: 'core',
    sourceRefs: [...ref([8, 15]), ...leh(817)],
  },
  'hmg-coa-reductase-step': {
    lessonId: L2, name: 'HMG-CoA reductase: the key step', category: 'core', relevance: 'core',
    sourceRefs: [...ref([8, 12, 14]), ...leh(817)],
  },

  // Lesson 3 — Mevalonate to cholesterol
  'mevalonate-to-ipp': {
    lessonId: L3, name: 'Mevalonate → isopentenyl pyrophosphate', category: 'visual-process', relevance: 'core',
    sourceRefs: [...ref([7, 9, 12]), ...leh(817, 818)],
  },
  'prenyl-condensation': {
    lessonId: L3, name: 'Joining isoprene units', category: 'visual-process', relevance: 'core',
    sourceRefs: [...ref([10, 12]), ...leh(818, 819)],
  },
  'squalene-to-cholesterol': {
    lessonId: L3, name: 'Squalene → lanosterol → cholesterol', category: 'core', relevance: 'core',
    sourceRefs: [...ref([7, 11, 12]), ...leh(819, 820)],
  },
  'pathway-branches': {
    lessonId: L3, name: 'Products that branch off the pathway', category: 'core', relevance: 'core',
    sourceRefs: [...ref([12])],
  },

  // Lesson 4 — Regulation
  'supply-mechanisms': {
    lessonId: L4, name: 'Keeping the cholesterol supply steady', category: 'core', relevance: 'core',
    sourceRefs: [...ref([13]), ...leh(826)],
    verificationNote: 'Slide 13 announces "three distinct mechanisms" and then lists five (discrepancy "regulation-count"). All five are taught; the count is not quizzed.',
  },
  'hmgr-controls': {
    lessonId: L4, name: 'Four ways HMGR is controlled', category: 'core', relevance: 'core',
    sourceRefs: [...ref([14])],
  },
  'feedback-degradation': {
    lessonId: L4, name: 'Cholesterol feedback and HMGR degradation', category: 'core', relevance: 'core',
    sourceRefs: [...ref([14, 15, 16]), ...leh(826)],
  },
  'flux-ssd-statins': {
    lessonId: L4, name: 'Flux, the sterol-sensing domain and statins', category: 'important-detail', relevance: 'core',
    sourceRefs: [...ref([15]), ...leh(827)],
  },
  'hmgr-phosphorylation': {
    lessonId: L4, name: 'Phosphorylation switches HMGR off', category: 'visual-process', relevance: 'core',
    sourceRefs: [...ref([14, 16, 17]), ...leh(826)],
  },
  'hormonal-control': {
    lessonId: L4, name: 'Hormones: glucagon, epinephrine and insulin', category: 'core', relevance: 'core',
    sourceRefs: [...ref([16, 17]), ...leh(826)],
  },

  // Lesson 5 — Bile acids
  'bile-acid-synthesis': {
    lessonId: L5, name: 'Making bile acids from cholesterol', category: 'visual-process', relevance: 'core',
    sourceRefs: [...ref([12, 18]), ...leh(820)],
  },
  'bile-acid-conjugation': {
    lessonId: L5, name: 'Glycine and taurine conjugates', category: 'visual-process', relevance: 'core',
    sourceRefs: [...ref([19])],
  },
  'bile-acid-functions': {
    lessonId: L5, name: 'The four functions of bile acids', category: 'clinical', relevance: 'core',
    sourceRefs: [...ref([20]), ...leh(820)],
  },
} satisfies Record<string, ConceptDraft>;

export type ConceptId = keyof typeof concepts;

// ─── Discrepancies ──────────────────────────────────────────────────
// The lecture statements are kept word for word (traceability). Where
// Lehninger or the lecture's own diagram settles the point, `resolution`
// says so; lessons teach that version and quote the slide wording.
// Unresolved items are shown as "check" notes and never quizzed.

export const discrepancies: SourceDiscrepancy[] = [
  {
    id: 'liver-share',
    concept: 'How much cholesterol the liver makes',
    status: 'unresolved',
    statements: [
      { text: 'Slide 2: "About 20% of total daily cholesterol production occurs in the liver; other sites of higher synthesis rates include the intestines, adrenal glands, and reproductive organs."', sourceRefs: ref([2]) },
      { text: 'Slide 3: distribution — all cells; liver and intestinal mucosa.', sourceRefs: ref([3]) },
      { text: 'Lehninger: "Much of the cholesterol synthesis in vertebrates takes place in the liver."', sourceRefs: leh(820) },
    ],
    note: 'Lehninger gives no percentage, so it cannot confirm or correct the 20% figure. Lessons show the lecture figure with a "check" note; the number is not quizzed.',
  },
  {
    id: 'regulation-count',
    concept: 'How many mechanisms keep the cholesterol supply steady',
    status: 'unresolved',
    statements: [
      { text: 'Slide 13: "Cellular supply of cholesterol is maintained at a steady level by three distinct mechanisms:" — followed by five numbered points (HMGR; ACAT; LDL receptor / HDL; utilisation; cellular sterol content).', sourceRefs: ref([13]) },
    ],
    note: 'An internal mismatch on one slide. All five points are taught; how many the lecturer expects is not quizzed.',
  },
  {
    id: 'reductase-location',
    concept: 'Where HMG-CoA reductase works',
    status: 'resolved',
    statements: [
      { text: 'Slide 8 diagram: "reductase in cytosol" (contrasted with the "cleavage enzyme in mitochondria").', sourceRefs: ref([8]) },
      { text: 'Slide 15: "HMGR is localized in the ER and contains a sterol-sensing domain, SSD."', sourceRefs: ref([15]) },
    ],
    resolution: {
      text: 'Lehninger: HMG-CoA reductase is an integral membrane protein of the smooth ER. Both slides fit: the enzyme works outside the mitochondria (slide 8’s contrast), anchored in the ER membrane (slide 15).',
      sourceRefs: leh(817),
    },
  },
  {
    id: 'ppi1-wording',
    concept: 'How glucagon and epinephrine act through PPI-1',
    status: 'resolved',
    statements: [
      { text: 'Slide 16: hormones such as glucagon and epinephrine negatively affect cholesterol biosynthesis "by increasing the activity of the inhibitor of phosphoprotein phosphatase inhibitor-1, PPI-1".', sourceRefs: ref([16]) },
      { text: 'Slide 17 diagram: cAMP activates PKA; PKA phosphorylates PPI-1 to its active form PPI-1(a), which inhibits HMG-CoA reductase phosphatase, protein phosphatase 2C and phosphoprotein phosphatase.', sourceRefs: ref([17]) },
    ],
    resolution: {
      text: 'The lecture’s own diagram settles the wording: PPI-1 is itself the inhibitor (of the phosphatases). The hormonal route raises its activity, so the phosphatase that would reactivate HMGR is blocked and HMGR stays phosphorylated (inactive). Lehninger agrees on the outcome: glucagon promotes phosphorylation (inactivation) of HMG-CoA reductase; insulin promotes dephosphorylation (activation).',
      sourceRefs: [...ref([17]), ...leh(826)],
    },
  },
];

// ─── Diagram knowledge ──────────────────────────────────────────────

export const diagrams: SourceDiagram[] = [
  {
    id: 'cholesterol-structure',
    title: 'Cholesterol (slide 4)',
    sourceRefs: ref([4]),
    shows: [
      'Four fused rings labelled A, B, C (six-membered) and D (five-membered).',
      'HO– on carbon 3 (ring A).',
      'A double bond between carbons 5 and 6 (ring B).',
      'A branched hydrocarbon side chain on carbon 17 (ring D).',
    ],
  },
  {
    id: 'acetate-origin',
    title: 'Biosynthesis of cholesterol — origin of the carbons (slide 5)',
    sourceRefs: ref([5]),
    shows: [
      'Every carbon of cholesterol is drawn coloured by its origin in acetate (CH₃–COO⁻).',
      'Caption: "Cholesterol is synthesized from acetate precursors, with green carbons originating from the methyl group and red carbons from the carbonyl group."',
    ],
  },
  {
    id: 'pyruvate-malate-cycle',
    title: 'Pyruvate–Malate cycle (slide 6)',
    sourceRefs: ref([6]),
    shows: [
      'Matrix: acetyl-CoA + oxaloacetate → citrate (citrate synthase; CoA-SH released).',
      'Citrate crosses the inner and outer mitochondrial membranes to the cytosol.',
      'Cytosol: citrate + CoA + ATP → acetyl-CoA + oxaloacetate + ADP + Pi (ATP-citrate lyase).',
      'Cytosol: oxaloacetate → malate (malate dehydrogenase; NADH → NAD⁺).',
      'Cytosol: malate → pyruvate (malic enzyme; NADP⁺ → NADPH; CO₂ released).',
      'Pyruvate returns to the matrix; pyruvate carboxylase (CO₂ + ATP → ADP + Pi) turns it into oxaloacetate.',
    ],
  },
  {
    id: 'hmg-coa-branch',
    title: 'Cholesterol biosynthesis — HMG-CoA (slide 8)',
    sourceRefs: ref([8]),
    shows: [
      'Acetoacetyl-CoA + acetyl-CoA + H₂O → 3-hydroxy-3-methylglutaryl-CoA (HMG-CoA).',
      '"Cleavage enzyme in mitochondria": HMG-CoA → acetoacetate + acetyl-CoA.',
      '"Reductase in cytosol": HMG-CoA → mevalonate.',
    ],
  },
  {
    id: 'mevalonate-to-ipp',
    title: 'Mevalonate → isopentenyl pyrophosphate (slide 9)',
    sourceRefs: ref([9]),
    shows: [
      'Mevalonate → 5-phosphomevalonate (ATP → ADP).',
      '5-Phosphomevalonate → 5-pyrophosphomevalonate (ATP → ADP).',
      '5-Pyrophosphomevalonate → isopentenyl pyrophosphate (ATP → ADP + Pi + CO₂).',
    ],
  },
  {
    id: 'prenyl-condensation',
    title: 'Condensation with isopentenyl pyrophosphate (slide 10)',
    sourceRefs: ref([10]),
    shows: [
      'An allylic substrate (a pyrophosphate ester) loses PPi, leaving a positively charged carbon.',
      'Isopentenyl pyrophosphate attacks it, giving a "condensation carbonium ion".',
      'The condensation carbonium ion becomes geranyl (or farnesyl) pyrophosphate — the chain is now longer by one IPP unit.',
    ],
  },
  {
    id: 'squalene-cyclisation',
    title: 'Squalene → cholesterol (slide 11)',
    sourceRefs: ref([11]),
    shows: ['Linear squalene (C₃₀), drawn folded, closes into the four-ring structure of cholesterol.'],
  },
  {
    id: 'pathway-summary',
    title: 'Summary of cholesterol biosynthesis (slide 12)',
    sourceRefs: ref([12]),
    shows: [
      'Acetyl-CoA + acetoacetyl-CoA → HMG-CoA → mevalonate (HMG-CoA reductase; 2 NADPH).',
      'Mevalonate → isopentenyl pyrophosphate (3 ATP; CO₂ released) → geranyl pyrophosphate → farnesyl pyrophosphate → squalene → lanosterol → (several steps) cholesterol.',
      'Geranyl and farnesyl pyrophosphate → prenylated proteins.',
      'Farnesyl pyrophosphate → heme a, dolichol, ubiquinone.',
      'Cholesterol → bile salts (liver) and steroids (endocrine glands).',
    ],
  },
  {
    id: 'hmgr-regulation',
    title: 'Regulation of HMG-CoA reductase by phosphorylation (slide 17)',
    sourceRefs: ref([17]),
    shows: [
      'AMPK kinase phosphorylates AMP-activated kinase (ATP → ADP): inactive –OH form → active phosphorylated form.',
      'Protein phosphatase 2C removes that phosphate (Pi released), inactivating AMPK.',
      'Active AMPK phosphorylates HMG-CoA reductase (ATP → ADP): active –OH form → inactive phosphorylated form.',
      'HMG-CoA reductase phosphatase removes the phosphate (Pi released), reactivating HMGR.',
      'Cholesterol inhibits (–ve) the HMG-CoA reductase step.',
      'cAMP activates (+ve) PKA; PKA phosphorylates PPI-1(b) → PPI-1(a) (ATP → ADP); phosphoprotein phosphatase reverses this.',
      'PPI-1(a) inhibits (–ve) HMG-CoA reductase phosphatase, protein phosphatase 2C and phosphoprotein phosphatase.',
    ],
  },
  {
    id: 'bile-acid-synthesis',
    title: 'Biosynthesis of bile salts (slide 18)',
    sourceRefs: ref([18]),
    shows: [
      'Cholesterol → 7-hydroxycholesterol by 7α-hydroxylase (NADPH + H⁺ and O₂ used; NADP⁺ formed).',
      '7-Hydroxycholesterol → (several steps; NADPH + H⁺, O₂, 2 CoA-SH; propionyl-CoA released) → cholyl-CoA, which carries three –OH groups.',
      '7-Hydroxycholesterol → (NADPH + H⁺, O₂, 2 CoA-SH; propionyl-CoA released) → chenodeoxycholyl-CoA, which carries two –OH groups.',
      'In both products the side chain ends as a –CO–S-CoA thioester and the C5=C6 double bond is gone.',
    ],
  },
  {
    id: 'bile-acid-conjugates',
    title: 'Glycocholic and taurocholic acid (slide 19)',
    sourceRefs: ref([19]),
    shows: [
      'Glycocholic acid: the bile acid side chain ends –CO–NH–CH₂–COOH (glycine attached).',
      'Taurocholic acid: the side chain ends –CO–NH–(CH₂)₂–SO₃H (taurine attached).',
    ],
  },
];
