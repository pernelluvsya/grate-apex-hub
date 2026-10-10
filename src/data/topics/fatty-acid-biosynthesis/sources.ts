// Source references, concepts, discrepancies and diagram knowledge for
// Biochemistry → Fatty Acid Biosynthesis.
//
// Lecture sources (define WHAT is taught; merged — see content-catalog.ts):
//   A = FATTY ACID BIOSYNTHESIS.pptx      (17 slides; the PDF is a copy of it)
//   B = FATTY ACID BIOSYNTHESIS (1).pptx  (14 slides; adds annotations)
//
// Slide map (A ↔ B): A5=B2, A6=B3, A7=B4, A8=B6, A9=B5, A11=B7, A12=B9,
// A13=B10, A14=B11, A15=B12, A16=B13, A17=B14. Only in A: 2, 3, 4, 10.
// Only in B: 8 (ER chart image).
//
// Reference (clarification only, never extra syllabus):
//   Lehninger Principles of Biochemistry — printed pages, via leh(...).
//   p. 613 enzyme names (Box 16-1) · p. 638 β-oxidation
//   pp. 787–798 fatty acid synthesis (Ch. 21.1)
import { LEHNINGER_ID } from '@/data/content-catalog';
import type {
  SourceDiagram,
  SourceDiscrepancy,
  SourceReference,
} from '@/data/lesson-types';
import { slides, withExports, type ConceptDraft } from '@/data/topics/build';

export const TOPIC_ID = 'fatty-acid-biosynthesis';
const DECK_A = 'fatty-acid-original-slides';
const DECK_B = 'fatty-acid-revised-slides';

// Slides whose information is in an image rather than text.
const VISUAL_A = [8, 17];
const VISUAL_B = [6, 8, 14];

// ref([6, 7], [3, 4]) → A slides 6–7 and B slides 3–4.
export function ref(a: number[], b: number[] = []): SourceReference[] {
  return [
    ...slides(DECK_A, a, a.filter((n) => VISUAL_A.includes(n))),
    ...slides(DECK_B, b, b.filter((n) => VISUAL_B.includes(n))),
  ];
}

// leh(790, 791) → Lehninger pages 790 and 791.
export function leh(...pages: number[]): SourceReference[] {
  return pages.map((page) => ({ sourceId: LEHNINGER_ID, page }));
}

const L1 = `${TOPIC_ID}-1`;
const L2 = `${TOPIC_ID}-2`;
const L3 = `${TOPIC_ID}-3`;
const L4 = `${TOPIC_ID}-4`;
const L5 = `${TOPIC_ID}-5`;
const L6 = `${TOPIC_ID}-6`;
const L7 = `${TOPIC_ID}-7`;
const L8 = `${TOPIC_ID}-8`;
export const LESSON_IDS = [L1, L2, L3, L4, L5, L6, L7, L8] as const;

// ─── Concepts ───────────────────────────────────────────────────────
// Names are shown to learners (Results, Review), so they read plainly.
// IDs are kept stable: saved progress and review schedules use them.

export const concepts = {
  // Lesson 1 — Recap and enzyme names
  'beta-oxidation-product': {
    lessonId: L1, name: 'Product of β-oxidation', category: 'core', relevance: 'core',
    sourceRefs: [...ref([2]), ...leh(638)],
  },
  'enzyme-nomenclature': {
    lessonId: L1, name: 'Enzyme nomenclature', category: 'terminology', relevance: 'core',
    sourceRefs: [...ref([2]), ...leh(613)],
  },
  'hydratase-vs-dehydratase': {
    lessonId: L1, name: 'Hydratase vs dehydratase', category: 'terminology', relevance: 'core',
    sourceRefs: [...ref([2, 10]), ...leh(613, 638, 791)],
    verificationNote: 'Slide 2 defines a hydratase as removing water. Resolved with Lehninger: a hydratase adds water; a dehydratase removes it (discrepancy "hydratase-definition").',
  },
  'synthase-vs-synthetase': {
    lessonId: L1, name: 'Synthase vs synthetase', category: 'terminology', relevance: 'core',
    sourceRefs: [...ref([3]), ...leh(613)],
  },
  'enzyme-names-in-topic': {
    lessonId: L1, name: 'Reading the enzyme names in this topic', category: 'terminology', relevance: 'core',
    sourceRefs: [...ref([5, 7, 9, 12, 16], [2, 4, 5, 9, 13]), ...leh(613, 790)],
  },

  // Lesson 2 — The big picture
  'synthesis-location-state': {
    lessonId: L2, name: 'Location and fed state', category: 'core', relevance: 'core',
    sourceRefs: [...ref([4, 15], [12]), ...leh(794)],
  },
  'citrate-shunt': {
    lessonId: L2, name: 'Citrate shunt', category: 'core', relevance: 'core',
    sourceRefs: [...ref([4]), ...leh(795)],
  },
  'not-simple-reversal': {
    lessonId: L2, name: 'Why synthesis is not β-oxidation reversed', category: 'core', relevance: 'core',
    sourceRefs: [...ref([5], [2]), ...leh(787, 788)],
  },
  'synthesis-stages': {
    lessonId: L2, name: 'Stages of synthesis', category: 'core', relevance: 'core',
    sourceRefs: [...ref([4]), ...leh(788)],
  },

  // Lesson 3 — Malonyl-CoA
  'acetyl-coa-carboxylase': {
    lessonId: L3, name: 'Acetyl-CoA carboxylase', category: 'core', relevance: 'core',
    sourceRefs: [...ref([5], [2]), ...leh(787)],
  },
  'malonyl-coa': {
    lessonId: L3, name: 'Malonyl-CoA', category: 'core', relevance: 'core',
    sourceRefs: [...ref([5, 8], [2, 6]), ...leh(787)],
    verificationNote: 'The two decks write the product formula differently. Resolved with Lehninger: malonyl-CoA carries the added carboxyl group, as deck A writes it (discrepancy "malonyl-formula").',
  },
  'acc-energy': {
    lessonId: L3, name: 'Paying for malonyl-CoA (ATP and biotin)', category: 'supporting', relevance: 'supporting',
    sourceRefs: [...ref([5], [2]), ...leh(787, 793)],
  },
  'co2-fate': {
    lessonId: L3, name: 'Fate of the added CO₂', category: 'core', relevance: 'core',
    sourceRefs: [...ref([7, 8], [4, 6]), ...leh(791)],
  },

  // Lesson 4 — The synthase complex
  'fas-carriers': {
    lessonId: L4, name: 'ACP₁ and ACP₂', category: 'core', relevance: 'core',
    sourceRefs: [...ref([6], [3]), ...leh(789, 790)],
    verificationNote: 'Lecture labels ACP₁/ACP₂ are kept. Lehninger (and the speaker note on deck B) name them the Cys –SH of β-ketoacyl-ACP synthase and the phosphopantetheine –SH of acyl carrier protein.',
  },
  'carrier-loading': {
    lessonId: L4, name: 'Loading acetyl and malonyl groups', category: 'core', relevance: 'core',
    sourceRefs: [...ref([7, 8], [4, 6]), ...leh(790)],
  },
  'condensation': {
    lessonId: L4, name: 'Condensation', category: 'core', relevance: 'core',
    sourceRefs: [...ref([7, 8], [4, 6]), ...leh(791)],
  },

  // Lesson 5 — Reduce, dehydrate, reduce
  'keto-reduction': {
    lessonId: L5, name: 'Reducing the β-keto group', category: 'core', relevance: 'core',
    sourceRefs: [...ref([8, 9, 12], [5, 6, 9]), ...leh(791)],
  },
  'dehydration-step': {
    lessonId: L5, name: 'Dehydration step', category: 'core', relevance: 'core',
    sourceRefs: [...ref([8, 9, 12], [5, 6, 9]), ...leh(791)],
    verificationNote: 'Slide 9 says “Enoyl-ACP hydrase” and “cis”. Resolved with Lehninger: β-hydroxyacyl-ACP dehydratase forms a trans double bond (discrepancies "enoyl-geometry", "dehydration-enzyme-name").',
  },
  'enoyl-reduction': {
    lessonId: L5, name: 'Reducing the enoyl group', category: 'core', relevance: 'core',
    sourceRefs: [...ref([8, 9, 12], [5, 6, 9]), ...leh(791)],
  },
  'acyl-transfer': {
    lessonId: L5, name: 'Transfer back to ACP₁', category: 'core', relevance: 'core',
    sourceRefs: [...ref([9], [5]), ...leh(793)],
  },
  'synthase-activities': {
    lessonId: L5, name: 'KR, DH, ER and TE', category: 'terminology', relevance: 'core',
    sourceRefs: [...ref([12], [9]), ...leh(790)],
  },
  'palmitate-release': {
    lessonId: L5, name: 'Releasing palmitate', category: 'core', relevance: 'core',
    sourceRefs: [...ref([4, 8, 12], [6, 9]), ...leh(793)],
  },
  'cycle-accounting': {
    lessonId: L5, name: 'Cycles and NADPH', category: 'important-detail', relevance: 'core',
    sourceRefs: [...ref([8, 9], [5, 6]), ...leh(793)],
    verificationNote: 'Diagram: 1 worked cycle + “6 cycles”; Lehninger: seven cycles in total (discrepancy "cycle-count", resolved).',
  },

  // Lesson 6 — Synthesis vs β-oxidation
  'beta-oxidation-reactions': {
    lessonId: L6, name: 'β-oxidation reactions', category: 'core', relevance: 'core',
    sourceRefs: [...ref([10]), ...leh(638)],
  },
  'pathway-comparison': {
    lessonId: L6, name: 'Synthesis vs β-oxidation', category: 'core', relevance: 'core',
    sourceRefs: [...ref([5, 8, 9, 10, 15], [2, 5, 6, 12]), ...leh(788, 791, 794)],
  },
  'electron-carriers': {
    lessonId: L6, name: 'NADPH vs FAD and NAD⁺', category: 'core', relevance: 'core',
    sourceRefs: [...ref([5, 9, 10], [2, 5]), ...leh(788, 794)],
  },

  // Lesson 7 — Elongation
  'other-fatty-acids': {
    lessonId: L7, name: 'Where other fatty acids come from', category: 'core', relevance: 'core',
    sourceRefs: [...ref([13], [10]), ...leh(797)],
  },
  'er-elongation': {
    lessonId: L7, name: 'ER elongation', category: 'core', relevance: 'core',
    sourceRefs: [...ref([11, 13], [7, 10]), ...leh(797)],
  },
  'unsaturated-elongation': {
    lessonId: L7, name: 'Elongating unsaturated fatty acids', category: 'important-detail', relevance: 'core',
    sourceRefs: [...ref([13], [10]), ...leh(798)],
  },
  'mitochondrial-elongation': {
    lessonId: L7, name: 'Mitochondrial elongation', category: 'important-detail', relevance: 'core',
    sourceRefs: [...ref([14], [11]), ...leh(797)],
  },
  'er-elongation-chart': {
    lessonId: L7, name: 'ER elongation chart', category: 'visual-process', relevance: 'needs-review',
    sourceRefs: ref([], [8]),
    verificationNote: 'Image added to deck B (not lecture text). Shown in the lesson; not used in quizzes until confirmed.',
  },

  // Lesson 8 — The Pyruvate–Malate (Citrate–Pyruvate) cycle
  'transport-problem': {
    lessonId: L8, name: 'Acetyl-CoA transport problem', category: 'core', relevance: 'core',
    sourceRefs: [...ref([15], [12]), ...leh(795)],
  },
  'citrate-export': {
    lessonId: L8, name: 'Citrate export', category: 'core', relevance: 'core',
    sourceRefs: [...ref([15, 17], [12, 14]), ...leh(795)],
  },
  'citrate-cleavage': {
    lessonId: L8, name: 'Cleaving citrate in the cytosol', category: 'core', relevance: 'core',
    sourceRefs: [...ref([15, 16, 17], [12, 13, 14]), ...leh(795)],
  },
  'oaa-to-malate': {
    lessonId: L8, name: 'Oxaloacetate → malate', category: 'core', relevance: 'core',
    sourceRefs: [...ref([16, 17], [13, 14]), ...leh(795)],
    verificationNote: 'Slide 16 says “dehydrogenated”. Resolved with Lehninger and the lecture diagram: oxaloacetate is reduced to malate using NADH (discrepancy "oxaloacetate-to-malate").',
  },
  'malic-enzyme': {
    lessonId: L8, name: 'Malic enzyme and NADPH', category: 'core', relevance: 'core',
    sourceRefs: [...ref([16, 17], [13, 14]), ...leh(794, 795)],
  },
  'cycle-return': {
    lessonId: L8, name: 'Completing the cycle', category: 'visual-process', relevance: 'core',
    sourceRefs: [...ref([16, 17], [13, 14]), ...leh(795)],
  },
  'glycolysis-coupling': {
    lessonId: L8, name: 'Coupling to glycolysis', category: 'core', relevance: 'core',
    sourceRefs: [...ref([15, 17], [12, 14]), ...leh(795)],
  },
} satisfies Record<string, ConceptDraft>;

export type ConceptId = keyof typeof concepts;

// ─── Discrepancies ──────────────────────────────────────────────────
// The lecture statements are kept word for word (traceability). Where
// Lehninger settles the point, `resolution` says what it establishes;
// lessons teach that version and show the slide wording in a
// "clarified" note. Nothing here is silently rewritten.

export const discrepancies: SourceDiscrepancy[] = [
  {
    id: 'enoyl-geometry',
    concept: 'Double bond formed in the dehydration step',
    status: 'resolved',
    statements: [
      { text: 'Slide text: elimination "to give the cis-2,3-enoyl group".', sourceRefs: withExports(ref([9], [5])) },
      { text: 'Pathway diagram: "2,3-trans-Enoyl-ACP reductase" acting on crotonyl-ACP.', sourceRefs: withExports(ref([8], [6])) },
      { text: 'Comment added to deck B: forms "trans-Δ²-enoyl-ACP".', sourceRefs: ref([], [9]) },
    ],
    resolution: {
      text: 'Lehninger: water is removed from C-2 and C-3 of D-β-hydroxybutyryl-ACP to give trans-Δ²-butenoyl-ACP — a TRANS double bond. The diagram (and the deck B comment) agree; the slide-9 word "cis" is not supported.',
      sourceRefs: leh(791),
    },
  },
  {
    id: 'malonyl-formula',
    concept: 'Formula written for malonyl-CoA',
    status: 'resolved',
    statements: [
      { text: 'Deck A / PDF: Acetyl-CoA + CO₂ → ⁻OOC-CH₂-CO-CoA, labelled "Malonyl CoA".', sourceRefs: withExports(ref([5])) },
      { text: 'Deck B: Acetyl-CoA + CO₂ → "CH3CH2COCoA", with no label.', sourceRefs: ref([], [2]) },
    ],
    resolution: {
      text: 'Lehninger: acetyl-CoA carboxylase transfers a carboxyl group to acetyl-CoA, giving the three-carbon malonyl-CoA. Malonyl-CoA therefore carries the added carboxyl (⁻OOC–CH₂–CO–S-CoA), as deck A writes it. Deck B’s CH₃CH₂CO-CoA has no added carboxyl group, so it does not match.',
      sourceRefs: leh(787),
    },
    note: 'Both decks name the enzyme acetyl-CoA carboxylase; only the written product differed.',
  },
  {
    id: 'hydratase-definition',
    concept: 'What a hydratase does',
    status: 'resolved',
    statements: [
      { text: 'Nomenclature slide: a hydratase "belongs to lyase. Catalyse the removal of water from a substrate".', sourceRefs: withExports(ref([2])) },
      { text: 'β-oxidation slide: enoyl-CoA hydratase adds H₂O (R.CH=CH.CO.SCoA + H₂O → R.CH(OH).CH₂CO.SCoA).', sourceRefs: withExports(ref([10])) },
    ],
    resolution: {
      text: 'Lehninger: enoyl-CoA hydratase ADDS water across the trans-Δ² double bond (p. 638). Lyases catalyse cleavages or, in reverse, additions (p. 613), so "belongs to the lyases" is correct. Removing water is what a DEHYDRATASE does — e.g. β-hydroxyacyl-ACP dehydratase in synthesis (p. 791). Slide 2’s definition describes a dehydratase.',
      sourceRefs: leh(613, 638, 791),
    },
  },
  {
    id: 'dehydration-enzyme-name',
    concept: 'Name of the dehydration enzyme',
    status: 'resolved',
    statements: [
      { text: 'Slide text: "Enoyl-ACP hydrase".', sourceRefs: withExports(ref([9], [5])) },
      { text: 'Pathway diagram: "β-Hydroxyacyl-ACP dehydratase"; slide 12: "dehydratase (DH)".', sourceRefs: withExports(ref([8, 12], [6, 9])) },
    ],
    resolution: {
      text: 'Lehninger names it β-hydroxyacyl-ACP dehydratase: it removes water from β-hydroxyacyl-ACP. The diagram and slide 12 agree; lessons use "β-hydroxyacyl-ACP dehydratase (DH)".',
      sourceRefs: leh(790, 791),
    },
  },
  {
    id: 'oxaloacetate-to-malate',
    concept: 'Oxaloacetate → malate step',
    status: 'resolved',
    statements: [
      { text: 'Slide text: "The cytosolic oxaloacetate is now dehydrogenated to give malate and NAD+".', sourceRefs: withExports(ref([16], [13])) },
      { text: 'Pathway diagram: malate DH converts oxaloacetate to malate with NADH + H⁺ → NAD⁺.', sourceRefs: withExports(ref([17], [14])) },
    ],
    resolution: {
      text: 'Lehninger: cytosolic malate dehydrogenase REDUCES oxaloacetate to malate (using NADH, which becomes NAD⁺). The diagram is correct; "dehydrogenated" on slide 16 describes the reverse direction. The slide’s product "NAD⁺" is right.',
      sourceRefs: leh(795),
    },
  },
  {
    id: 'complex-name',
    concept: 'Synthase or synthetase complex',
    status: 'resolved',
    statements: [
      { text: '"Fatty acid synthase complex".', sourceRefs: withExports(ref([6], [3])) },
      { text: '"Fatty Acid Synthetase Complex".', sourceRefs: withExports(ref([13], [10])) },
      { text: 'Slide 3 defines synthetases as enzymes that must hydrolyse ATP and synthases as ones that do not.', sourceRefs: withExports(ref([3])) },
    ],
    resolution: {
      text: 'Lehninger calls the complex "fatty acid synthase" throughout and gives the same synthase/synthetase definitions as slide 3 (p. 613). The ATP of fatty acid synthesis is spent by acetyl-CoA carboxylase making malonyl-CoA (p. 793), not by the complex — so "synthase" is the fitting name.',
      sourceRefs: leh(613, 789, 793),
    },
  },
  {
    id: 'palmitate-wording',
    concept: 'Name of the C16 product',
    status: 'resolved',
    statements: [
      { text: 'Slide 12: "palmitidic acid".', sourceRefs: withExports(ref([12], [9])) },
      { text: 'Elsewhere: "palmitate", "palmitoyl-ACP", "palmitoyl-CoA".', sourceRefs: withExports(ref([4, 8, 11, 13], [6, 7, 10])) },
    ],
    resolution: {
      text: 'Lehninger: the product is palmitate (16:0). "Palmitic acid" is the same molecule in acid form; "palmitidic" is not a standard name. Lessons use palmitate.',
      sourceRefs: leh(788, 793),
    },
  },
  {
    id: 'cycle-count',
    concept: 'Number of cycles to palmitate',
    status: 'resolved',
    statements: [
      { text: 'Diagram: one worked cycle to butyryl-ACP, then "6 cycles" to palmitoyl-ACP.', sourceRefs: withExports(ref([8], [6])) },
      { text: 'Comment added to deck B: the cycle is "repeated 7 times".', sourceRefs: ref([], [9]) },
    ],
    resolution: {
      text: 'Lehninger: seven cycles of condensation and reduction produce palmitoyl-ACP. The diagram’s 1 worked cycle + 6 further cycles is the same total of 7.',
      sourceRefs: leh(793),
    },
  },
  {
    id: 'acp-terminology',
    concept: 'ACP1 / ACP2 labels',
    status: 'resolved',
    statements: [
      { text: 'Slides: two carriers, "ACP1" (cysteinyl –SH) and "ACP2" (phosphopantetheine).', sourceRefs: withExports(ref([6], [3])) },
      { text: 'Speaker note added to deck B: textbooks call ACP1 the ketoacyl synthase (KS) cysteine and ACP2 the acyl carrier protein.', sourceRefs: ref([], [3]) },
    ],
    resolution: {
      text: 'Lehninger: intermediates are held on two thiol groups — the Cys –SH of β-ketoacyl-ACP synthase (the lecture’s ACP₁) and the phosphopantetheine –SH of acyl carrier protein (the lecture’s ACP₂). Only the naming differs; lessons keep the lecture labels and give the textbook names.',
      sourceRefs: leh(789, 790),
    },
  },
  {
    id: 'slide-12-context',
    concept: 'Which process slide 12 describes',
    status: 'resolved',
    statements: [
      { text: 'Slide 12 opens "Following each round of elongation…" and sits after the ER-elongation slide.', sourceRefs: withExports(ref([11, 12], [7, 9])) },
      { text: 'Its content (ACP, phosphopantetheine, thioesterase release at C16) describes the fatty acid synthase cycle.', sourceRefs: withExports(ref([12], [9])) },
    ],
    resolution: {
      text: 'Lehninger describes KR, dehydratase, ER, the phosphopantetheine arm of ACP and hydrolytic release at C16 as parts of the fatty acid synthase cycle. Lessons teach slide 12 with the synthase cycle ("each round of elongation" = each round of chain building).',
      sourceRefs: leh(789, 790, 793),
    },
  },
];

// ─── Diagram knowledge ──────────────────────────────────────────────

export const diagrams: SourceDiagram[] = [
  {
    id: 'fas-cycle-diagram',
    title: 'Fatty acid synthase: first cycle to palmitate',
    sourceRefs: withExports(ref([8], [6])),
    shows: [
      'Acetyl-CoA → acetyl-ACP (acetyl transferase, releases CoASH) → acetyl-KSase (ACP-SH freed).',
      'Malonyl-CoA → malonyl-ACP (malonyl transferase, releases CoASH).',
      'Acetyl-KSase + malonyl-ACP → acetoacetyl-ACP; CO₂ released.',
      'Acetoacetyl-ACP → D-β-hydroxybutyryl-ACP (β-ketoacyl-ACP reductase; NADPH + H⁺ → NADP⁺).',
      'D-β-hydroxybutyryl-ACP → crotonyl-ACP (β-hydroxyacyl-ACP dehydratase; H₂O removed).',
      'Crotonyl-ACP → butyryl-ACP (2,3-trans-enoyl-ACP reductase; NADPH + H⁺ → NADP⁺).',
      'Note on the figure: these three steps are the reverse of those in β-oxidation.',
      '"6 cycles" → palmitoyl-ACP. Animal cells: hydrolysis (H₂O) → palmitate + ACP-SH. E. coli: palmitoyl-ACP → triacylglycerol and phospholipid synthesis.',
    ],
  },
  {
    id: 'pyruvate-malate-cycle',
    title: 'Pyruvate–Malate Cycle',
    sourceRefs: withExports(ref([17], [14])),
    shows: [
      'Cytosol: glucose → (glycolysis) → pyruvate, which enters the mitochondrion.',
      'Mitosol: pyruvate → acetyl-CoA (pyruvate DH complex; NAD⁺ → NADH + H⁺; CoASH in; CO₂ out).',
      'Mitosol: pyruvate → oxaloacetate (pyruvate carboxylase; CO₂ + ATP → ADP + Pi).',
      'Mitosol: oxaloacetate + acetyl-CoA → citrate (citrate synthase).',
      'Citrate crosses to the cytosol on a transporter.',
      'Cytosol: citrate → acetyl-CoA + oxaloacetate (ATP-citrate lyase; ATP + CoASH → ADP + Pi).',
      'Cytosol: oxaloacetate → malate (malate DH; NADH + H⁺ → NAD⁺).',
      'Cytosol: malate → pyruvate (malic enzyme; NADP⁺ → NADPH + H⁺; CO₂ released).',
      'Malate can also cross into the mitochondrion; membrane transporters exchange ATP/ADP and Pi.',
    ],
  },
  {
    id: 'er-elongation-chart',
    title: 'Fatty acids elongation in the endoplasmic reticulum (added image)',
    sourceRefs: ref([], [8]),
    shows: [
      'Long-chain fatty acid → long-chain acyl-CoA by long-chain-fatty-acid-CoA ligase (ATP + CoA → AMP + PPi).',
      'Malonyl-CoA + acyl-CoA condense (fatty-acyl-CoA synthase; CO₂ + CoA released), then reduction, dehydration (H₂O removed) and a second reduction give a longer acyl-CoA.',
      'Stearoyl-CoA → oleoyl-CoA by stearoyl-CoA desaturase, with cytochrome b5, cytochrome b5 reductase, O₂ and NADPH.',
      'Branches to sphingomyelin/ceramide metabolism, and to N-myristoylation, S-palmitoylation and prenylation of proteins.',
    ],
    note: 'Screenshot added to deck B; includes EC numbers and a reference to the apicoplast (a parasite organelle). Confirm relevance before teaching as examinable.',
  },
];
