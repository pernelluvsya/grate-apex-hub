// Source references, concepts, discrepancies and diagram knowledge for
// Biochemistry → Haem and Haem Metabolism.
//
// Lecture sources (define WHAT is taught; see content-catalog.ts), both by
// Edwin F. Laing:
//   SYN = "The Porphyrins, Haem and Haem Synthesis" (Haem26.ppt, 42 slides)
//   CAT = "Haem Catabolism" (Haem Catabolism25C (1).ppt, 20 slides)
//
// Many slides carry pasted figures and textbook pages; they were read and
// are written out in `diagrams` below. Slide 2 of CAT has a speaker note
// (catalogued as an annotation; not quizzed).
//
// Reference (clarification only, never extra syllabus):
//   Lehninger Principles of Biochemistry — printed pages, via leh(...).
//   p. 434 haem guanylyl cyclase · pp. 854–857 porphyrins, bile pigments,
//   porphyrias (Box 22-1)
import { LEHNINGER_ID } from '@/data/content-catalog';
import type {
  SourceDiagram,
  SourceDiscrepancy,
  SourceReference,
} from '@/data/lesson-types';
import { slides, type ConceptDraft } from '@/data/topics/build';

export const TOPIC_ID = 'heme-metabolism';
const SYN = 'heme-haem26';
const CAT = 'heme-haem-catabolism25c-1';

const SYN_VISUAL = [3, 5, 6, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 29, 30, 36, 37, 40];
const CAT_VISUAL = [4, 5, 6, 7, 8, 10, 12, 17, 19, 20];

// syn([13, 14]) → synthesis deck slides 13 and 14.
export function syn(numbers: number[]): SourceReference[] {
  return slides(SYN, numbers, numbers.filter((n) => SYN_VISUAL.includes(n)));
}

// cat([3]) → catabolism deck slide 3.
export function cat(numbers: number[]): SourceReference[] {
  return slides(CAT, numbers, numbers.filter((n) => CAT_VISUAL.includes(n)));
}

// leh(855) → Lehninger page 855.
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
export const LESSON_IDS = [L1, L2, L3, L4, L5, L6, L7] as const;

// ─── Concepts ───────────────────────────────────────────────────────
// Names are shown to learners (Results, Review), so they read plainly.
// IDs are kept stable: saved progress and review schedules use them.

export const concepts = {
  // Lesson 1 — Porphyrins and haem
  'haem-proteins': {
    lessonId: L1, name: 'Haem-containing proteins', category: 'core', relevance: 'core',
    sourceRefs: [...syn([2, 3]), ...leh(434)],
  },
  'porphin-structure': {
    lessonId: L1, name: 'The porphin ring', category: 'core', relevance: 'core',
    sourceRefs: syn([4, 5, 6, 7]),
  },
  'porphyrin-series': {
    lessonId: L1, name: 'Uro-, copro- and protoporphyrins', category: 'core', relevance: 'core',
    sourceRefs: syn([9, 10, 11]),
  },
  'protoporphyrin-ix': {
    lessonId: L1, name: 'Protoporphyrin IX and haem iron', category: 'visual-process', relevance: 'core',
    sourceRefs: syn([3, 11, 12]),
  },

  // Lesson 2 — Synthesis I: ALA to uroporphyrinogen III
  'ala-formation': {
    lessonId: L2, name: 'Making ALA (ALA synthase)', category: 'core', relevance: 'core',
    sourceRefs: [...syn([13, 14, 15, 24, 25]), ...leh(855)],
  },
  'haem-atom-origins': {
    lessonId: L2, name: 'Where haem’s atoms come from', category: 'important-detail', relevance: 'core',
    sourceRefs: syn([14, 15]),
  },
  'pbg-formation': {
    lessonId: L2, name: 'Porphobilinogen (ALA dehydrase)', category: 'core', relevance: 'core',
    sourceRefs: syn([14, 15, 16, 24]),
  },
  'pbg-deaminase': {
    lessonId: L2, name: 'PBG deaminase and hydroxymethylbilane', category: 'core', relevance: 'core',
    sourceRefs: syn([15, 17, 18, 19, 25]),
  },
  'urogen-iii-synthase': {
    lessonId: L2, name: 'Uroporphyrinogen III vs I', category: 'core', relevance: 'core',
    sourceRefs: syn([20, 21, 22, 25]),
  },

  // Lesson 3 — Synthesis II: to haem; compartments
  'urogen-decarboxylase': {
    lessonId: L3, name: 'Uroporphyrinogen decarboxylase', category: 'core', relevance: 'core',
    sourceRefs: syn([23, 24, 25]),
  },
  'coprogen-oxidase': {
    lessonId: L3, name: 'Coproporphyrinogen oxidase', category: 'core', relevance: 'core',
    sourceRefs: syn([23, 24, 25]),
  },
  'ferrochelatase-step': {
    lessonId: L3, name: 'Protoporphyrin IX and ferrochelatase', category: 'core', relevance: 'core',
    sourceRefs: [...syn([24, 25, 40]), ...leh(855)],
  },
  'compartments': {
    lessonId: L3, name: 'Mitochondria vs cytosol', category: 'visual-process', relevance: 'core',
    sourceRefs: syn([24]),
  },

  // Lesson 4 — Regulation
  'alas-regulation': {
    lessonId: L4, name: 'Regulating ALA synthase', category: 'core', relevance: 'core',
    sourceRefs: [...syn([24, 26, 29, 40]), ...leh(855)],
  },
  'liver-vs-red-cells': {
    lessonId: L4, name: 'Haem synthesis in liver vs red cells', category: 'core', relevance: 'core',
    sourceRefs: syn([27, 28]),
  },
  'hemin-globin-balance': {
    lessonId: L4, name: 'Hemin balances haem and globin', category: 'visual-process', relevance: 'core',
    sourceRefs: syn([29]),
  },
  'hemin-drug': {
    lessonId: L4, name: 'Hemin as a drug', category: 'clinical', relevance: 'core',
    sourceRefs: syn([30, 31, 32, 39]),
  },

  // Lesson 5 — Porphyrias and lead poisoning
  'inborn-error-principles': {
    lessonId: L5, name: 'What an enzyme block does', category: 'core', relevance: 'core',
    sourceRefs: syn([38]),
  },
  'porphyria-basics': {
    lessonId: L5, name: 'Porphyrias: the basics', category: 'clinical', relevance: 'core',
    sourceRefs: [...syn([39]), ...leh(857)],
  },
  'porphyria-map': {
    lessonId: L5, name: 'Which enzyme, which porphyria', category: 'clinical', relevance: 'core',
    sourceRefs: syn([40]),
  },
  'acute-intermittent-porphyria': {
    lessonId: L5, name: 'Acute intermittent porphyria', category: 'clinical', relevance: 'core',
    sourceRefs: [...syn([41]), ...leh(857)],
  },
  'porphyria-cutanea-tarda': {
    lessonId: L5, name: 'Porphyria cutanea tarda', category: 'clinical', relevance: 'core',
    sourceRefs: syn([42]),
    verificationNote: 'The lecture calls PCT the most common porphyria; Lehninger calls acute intermittent porphyria the most common (discrepancy "most-common-porphyria"). Not quizzed.',
  },
  'lead-poisoning': {
    lessonId: L5, name: 'Lead poisoning', category: 'clinical', relevance: 'core',
    sourceRefs: syn([35, 36, 37]),
    verificationNote: 'Slide 35 lists ALA synthase among the enzymes lead inhibits; slide 37 says the ALA synthase gene is de-repressed (discrepancy "lead-ala-synthase"). Not quizzed.',
  },

  // Lesson 6 — Haem catabolism: haem to bilirubin
  'haem-sources': {
    lessonId: L6, name: 'Where the haem comes from', category: 'core', relevance: 'core',
    sourceRefs: cat([2, 4]),
  },
  'haem-oxygenase': {
    lessonId: L6, name: 'Haem oxygenase', category: 'core', relevance: 'core',
    sourceRefs: [...cat([3, 4, 20]), ...leh(855)],
  },
  'biliverdin-to-bilirubin': {
    lessonId: L6, name: 'Biliverdin → bilirubin', category: 'core', relevance: 'core',
    sourceRefs: [...cat([4, 19, 20]), ...leh(855)],
  },
  'macrophage-handling': {
    lessonId: L6, name: 'Inside the macrophage', category: 'visual-process', relevance: 'core',
    sourceRefs: cat([12, 19]),
  },

  // Lesson 7 — Conjugation, excretion and jaundice
  'bilirubin-transport': {
    lessonId: L7, name: 'Carrying bilirubin to the liver', category: 'core', relevance: 'core',
    sourceRefs: [...cat([5, 9, 12, 19]), ...leh(856)],
  },
  'bilirubin-conjugation': {
    lessonId: L7, name: 'Conjugating bilirubin', category: 'core', relevance: 'core',
    sourceRefs: [...cat([5, 8, 9, 10]), ...leh(856)],
  },
  'intestinal-fate': {
    lessonId: L7, name: 'Bilirubin in the gut', category: 'core', relevance: 'core',
    sourceRefs: [...cat([5, 11, 20]), ...leh(856)],
  },
  'jaundice-causes': {
    lessonId: L7, name: 'Causes of jaundice', category: 'clinical', relevance: 'core',
    sourceRefs: [...cat([13, 14, 15, 16, 17]), ...leh(856)],
    verificationNote: 'Slide 13 places physiological neonatal jaundice under prehepatic; the slide-17 table places it under intrahepatic (discrepancy "neonatal-jaundice-class"). Its category is not quizzed.',
  },
  'phototherapy': {
    lessonId: L7, name: 'Phototherapy for neonatal jaundice', category: 'clinical', relevance: 'core',
    sourceRefs: [...cat([13, 18]), ...leh(856)],
  },
} satisfies Record<string, ConceptDraft>;

export type ConceptId = keyof typeof concepts;

// ─── Discrepancies ──────────────────────────────────────────────────
// Lecture statements are kept word for word. Resolved items name what
// settles them; unresolved items are "check" notes and never quizzed.

export const discrepancies: SourceDiscrepancy[] = [
  {
    id: 'ala-synthase-substrate',
    concept: 'What condenses with glycine to make ALA',
    status: 'resolved',
    statements: [
      { text: 'Slide 25 figure: “Glycine + Succinate” → ALA synthase → 5-aminolaevulinic acid.', sourceRefs: syn([25]) },
      { text: 'Slide 13: “condensation of glycine & succinyl-CoA, with decarboxylation”; the figures on slides 14, 24, 29 and 40 also show succinyl-CoA.', sourceRefs: syn([13, 14, 24, 29, 40]) },
    ],
    resolution: {
      text: 'The lecture’s own text and four of its figures give succinyl-CoA, and Lehninger agrees: in mammals glycine reacts with succinyl-CoA. “Succinate” on the slide-25 figure is shorthand for the succinyl group that succinyl-CoA carries.',
      sourceRefs: [...syn([13]), ...leh(855)],
    },
  },
  {
    id: 'guanylate-enzyme',
    concept: 'The guanylate enzyme in the list of haem proteins',
    status: 'resolved',
    statements: [{ text: 'Slide 2 lists “Guanylate synthase” among haem-containing proteins.', sourceRefs: syn([2]) }],
    resolution: {
      text: 'Lehninger describes a cytosolic guanylyl (guanylate) cyclase with a tightly bound haem group, activated by nitric oxide — the haem enzyme the slide most likely means. It is not quizzed.',
      sourceRefs: leh(434),
    },
  },
  {
    id: 'lead-ala-synthase',
    concept: 'Does lead inhibit ALA synthase?',
    status: 'unresolved',
    statements: [
      { text: 'Slide 35: “Lead inhibits δ-ALA synthase, δ-ALA dehydrase (more than δ-ALA synthase) and ferrochelatase (haem synthase) activity.”', sourceRefs: syn([35]) },
      { text: 'Slide 37: inhibition of porphobilinogen synthase by Pb²⁺ raises blood ALA “as impaired heme synthesis leads to de-repression of transcription of the ALA Synthase gene”.', sourceRefs: syn([37]) },
      { text: 'Slide 36 figure: lead inhibits most haem-pathway enzymes; inhibition of ALA dehydratase and ferrochelatase leads to accumulation of their substrates.', sourceRefs: syn([36]) },
    ],
    note: 'All three agree that ALA dehydrase and ferrochelatase are the key targets. Whether ALA synthase activity itself is inhibited is not settled by the supplied sources, so it is not quizzed.',
  },
  {
    id: 'most-common-porphyria',
    concept: 'The most common porphyria',
    status: 'unresolved',
    statements: [
      { text: 'Slide 42: porphyria cutanea tarda — “Most common porphyria”.', sourceRefs: syn([42]) },
      { text: 'Lehninger (Box 22-1): “The most common form is acute intermittent porphyria.”', sourceRefs: leh(857) },
    ],
    note: 'The sources disagree. Learn the lecture’s statement for this course’s exams but confirm with the lecturer; it is not quizzed.',
  },
  {
    id: 'iron-released',
    concept: 'Oxidation state of the iron released by haem oxygenase',
    status: 'unresolved',
    statements: [
      { text: 'Textbook page on slide 4: for each mole of haem, “1 mole each of carbon monoxide, bilirubin, and ferric iron is produced”.', sourceRefs: cat([4]) },
      { text: 'Slide 20 figure: haem oxygenase releases Fe²⁺ (and CO).', sourceRefs: cat([20]) },
      { text: 'Lehninger: the products of haem oxygenase are “free Fe²⁺ and CO” (the same page also mentions free Fe³⁺ when introducing the pathway).', sourceRefs: leh(855) },
    ],
    note: 'Only the oxidation state differs; that iron is released and reused is agreed. The oxidation state is not quizzed.',
  },
  {
    id: 'deconjugation-site',
    concept: 'Where and by what bilirubin glucuronides are removed in the gut',
    status: 'unresolved',
    statements: [
      { text: 'Slide 11: the glucuronide residues are removed in the terminal ileum and large intestine by bacterial hydrolases.', sourceRefs: cat([11]) },
      { text: 'Textbook page on slide 5: hydrolysed in the alkaline pH of the upper small intestine by β-glucuronidase from liver, intestinal epithelial cells and intestinal bacteria.', sourceRefs: cat([5]) },
    ],
    note: 'Both agree that the glucuronides are removed by hydrolysis in the intestine before reduction to urobilinogens. The exact site and enzyme source are not quizzed.',
  },
  {
    id: 'neonatal-jaundice-class',
    concept: 'Where physiological neonatal jaundice is classified',
    status: 'unresolved',
    statements: [
      { text: 'Slide 13: under “Prehepatic (mainly haemolytic)” — “Neonatal jaundice: physiologic: immature conjugating system”.', sourceRefs: cat([13]) },
      { text: 'Slide 17 table: “neonatal — physiologic — very common” sits in the intrahepatic block.', sourceRefs: cat([17]) },
    ],
    note: 'Both agree on the cause (an immature conjugating system). Its category is not quizzed — confirm with the lecturer.',
  },
];

// ─── Diagram knowledge ──────────────────────────────────────────────

export const diagrams: SourceDiagram[] = [
  {
    id: 'porphyrin-side-chains',
    title: 'Uro-, copro- and protoporphyrins (slides 9–10, textbook page)',
    sourceRefs: syn([9, 10]),
    shows: [
      'Uroporphyrin: each of the 4 pyrroles carries an acetate (A) and a propionate (P).',
      'Coproporphyrin: each pyrrole carries a methyl and a propionate (the acetates are decarboxylated to methyls).',
      'Protoporphyrin: 2 pyrroles carry methyl + propionate, 2 carry methyl + vinyl.',
      'The four ways of arranging A and P around the ring give uroporphyrins I–IV (I = -AP-AP-AP-AP-, III = -AP-AP-AP-PA-).',
      'With a third kind of side chain (protoporphyrins) there are 15 possible arrangements; Hans Fischer’s ninth is the one in haemoglobin — protoporphyrin IX.',
      'Natural porphyrins derive from uroporphyrin I (regular alternation) or uroporphyrin III (one pyrrole reversed).',
    ],
  },
  {
    id: 'protoporphyrin-haem',
    title: 'Protoporphyrin IX and haem (slide 12, textbook page)',
    sourceRefs: syn([12]),
    shows: [
      'Four pyrroles linked by methene bridges; four methyl, two vinyl and two propionate side chains.',
      'Haem = Fe-protoporphyrin IX: the iron binds the four central nitrogens.',
      'The iron can form six bonds: four in the plane of the haem and one on each side (the fifth and sixth coordination positions).',
      'Iron may be ferrous (+2) or ferric (+3); ferric haemoglobin is methaemoglobin, and only the ferrous form binds oxygen.',
    ],
  },
  {
    id: 'ala-and-pbg',
    title: 'ALA and porphobilinogen (slides 14–16, textbook page)',
    sourceRefs: syn([14, 15, 16]),
    shows: [
      'Succinyl-CoA + glycine (+ H⁺) → δ-aminolevulinate + CO₂ + CoA, by δ-aminolevulinate synthetase — a PLP enzyme in mitochondria; the committed, regulated step.',
      '2 δ-aminolevulinate → porphobilinogen + 2 H₂O + H⁺ (a dehydration), by δ-aminolevulinate dehydrase.',
      'Labelling: haem’s nitrogens come from glycine; 8 of its carbons from glycine’s α-carbon (none from glycine’s carboxyl carbon); the other 26 carbons from acetate (via succinyl-CoA).',
      'Four porphobilinogens condense head-to-tail into a linear tetrapyrrole bound to the enzyme; one NH₄⁺ is released per methylene bridge formed; cyclisation gives uroporphyrinogen III. Synthetase alone gives the symmetric uroporphyrinogen I.',
    ],
  },
  {
    id: 'compartments-figure',
    title: 'Compartmentalisation of haem synthesis (slides 23–24, textbook page)',
    sourceRefs: syn([23, 24]),
    shows: [
      'Mitochondrion: succinyl-CoA (from the TCA cycle) + glycine → δ-aminolevulinate (ALA synthase; pyridoxal phosphate).',
      'Cytosol: porphobilinogen synthase (needs zinc) → uro’gen synthase + uro’gen cosynthase → uroporphyrinogen III → uro’gen decarboxylase → coproporphyrinogen III.',
      'Mitochondrion: copro’gen oxidase → protoporphyrinogen IX → proto’gen oxidase → protoporphyrin IX → ferrochelatase (Fe²⁺, inner mitochondrial membrane) → haem → haemoproteins.',
      'Text: the decarboxylase removes CO₂ from the four acetate side chains; copro’gen oxidase decarboxylates and dehydrogenates the propionates at positions 2 and 4 into vinyls.',
      'Text: only porphobilinogen synthase needs a metal (zinc); the four cytosolic enzymes are retained in erythrocytes after the mitochondria are lost.',
      'Text: haem represses the formation of ALA synthase and, in excess, inhibits the formed enzyme (feedback).',
    ],
  },
  {
    id: 'enzymic-steps',
    title: 'The enzymic steps in the synthesis of haem (slide 25)',
    sourceRefs: syn([25]),
    shows: [
      'Glycine + succinate → (ALA synthase) → ALA → (ALA dehydratase) → PBG.',
      'PBG deaminase alone → hydroxymethylbilane → spontaneous cyclisation → uroporphyrinogen I → (uroporphyrinogen decarboxylase) → coproporphyrinogen I.',
      'PBG deaminase plus uroporphyrinogen III cosynthase → uroporphyrinogen III → coproporphyrinogen III → (coproporphyrinogen oxidase) → protoporphyrinogen IX → (protoporphyrinogen oxidase) → protoporphyrin IXα → (ferrochelatase, Fe²⁺) → haem.',
    ],
  },
  {
    id: 'hemin-control',
    title: 'Regulation of haemoglobin synthesis by hemin (slide 29)',
    sourceRefs: syn([29]),
    shows: [
      'If free haem accumulates it is oxidised to hemin, which represses formation of δ-aminolevulinate synthase and perhaps blocks its transfer from the cytosol into the mitochondrial matrix.',
      'Hemin inhibits the protein kinase that phosphorylates (inactivates) eIF2, so globin synthesis continues and globin combines with the excess haem.',
      'Result: porphyrin and globin synthesis are kept in balance.',
    ],
  },
  {
    id: 'lead-figure',
    title: 'Effects of lead on the haem pathway (slide 36, textbook page)',
    sourceRefs: syn([36]),
    shows: [
      'Lead inhibits most enzymes of the pathway; inhibition of (a) δ-aminolevulinic acid dehydratase and (b) ferrochelatase causes their substrates — ALA and protoporphyrin IX — to accumulate, which is diagnostically useful.',
      'The excess protoporphyrin exists as a zinc chelate (zinc protoporphyrin); coproporphyrin production also rises.',
      'Laboratory signs: ↑ urinary ALA, ↑ urinary coproporphyrin, ↓ erythrocyte ALA dehydratase, ↑ erythrocyte protoporphyrin.',
      'Erythrocyte ALA dehydratase reflects acute exposure; raised erythrocyte protoporphyrin reflects chronic exposure.',
    ],
  },
  {
    id: 'porphyria-table',
    title: 'Porphyrias along the pathway (slide 40)',
    sourceRefs: syn([40]),
    shows: [
      'δ-ALA dehydratase → δ-ALA dehydratase porphyria.',
      'Porphobilinogen deaminase → acute intermittent porphyria.',
      'Uroporphyrinogen III cosynthase → congenital erythropoietic porphyria.',
      'Uroporphyrinogen decarboxylase → porphyria cutanea tarda.',
      'Coproporphyrinogen oxidase → hereditary coproporphyria.',
      'Protoporphyrinogen oxidase → variegate porphyria.',
      'Ferrochelatase → erythropoietic protoporphyria.',
      'Haem feeds back (dashed arrow) to repress and inhibit δ-ALA synthase.',
    ],
  },
  {
    id: 'haem-to-bilirubin',
    title: 'Catabolism of haem to bilirubin (slides 4 and 20)',
    sourceRefs: cat([4, 20]),
    shows: [
      'Microsomal haem oxygenase (with O₂, NADPH and the microsomal electron-transport system / cytochrome P450 reductase) opens the ring at the α-methene bridge.',
      'Products: biliverdin IXα (green), carbon monoxide (excreted via the lungs) and iron (reused).',
      'Biliverdin reductase (NADPH-dependent, cytosolic) → bilirubin IXα (orange-yellow).',
      'Daily bilirubin: 250–300 mg; ~85% from haemoglobin of senescent red cells, ~15% from ineffective erythropoiesis and other haem proteins.',
      'Bilirubin → UGT → bilirubin mono- and diglucuronides → excretion in faeces, with enterohepatic recirculation.',
    ],
  },
  {
    id: 'macrophage',
    title: 'Red-cell breakdown in the macrophage (slides 12 and 19)',
    sourceRefs: cat([12, 19]),
    shows: [
      'Effete red cells are phagocytosed by macrophages and degraded in the phagolysosome → haem + globin; globin → amino acids.',
      'Iron is stored (ferritin or haemosiderin), added to proteins, or released to transferrin with the aid of ceruloplasmin.',
      'The porphyrin becomes unconjugated bilirubin, which leaves the cell bound to albumin; in the hepatocyte it is conjugated and excreted in bile.',
    ],
  },
  {
    id: 'hepatocyte',
    title: 'Bilirubin in the hepatocyte (slide 5, textbook page)',
    sourceRefs: cat([5]),
    shows: [
      'Bilirubin bound to albumin reaches the sinusoidal membrane and is taken up; inside, it binds cytosolic proteins (ligandin).',
      'UDP-glucuronyltransferase (endoplasmic reticulum) forms the mono- and diglucuronides, which are excreted across the canalicular membrane into bile (an energy-dependent process).',
      'In the gut, bacteria reduce bilirubin to colourless urobilinogens; up to ~20% are reabsorbed (enterohepatic circulation) and 2–5% appear in urine; the rest oxidise to the orange-brown stool pigments.',
    ],
  },
  {
    id: 'jaundice-table',
    title: 'The causes of jaundice (slide 17)',
    sourceRefs: cat([17]),
    shows: [
      'Prehepatic: haemolysis (autoimmune; abnormal haemoglobin).',
      'Intrahepatic: infection (hepatitis A, B, C); chemical/drug (acetaminophen, alcohol); genetic errors of bilirubin metabolism (Gilbert’s, Crigler–Najjar, Dubin–Johnson, Rotor); specific proteins (Wilson’s disease, α₁-antitrypsin); autoimmune (chronic active hepatitis); neonatal (physiologic).',
      'Posthepatic: intrahepatic bile ducts (drugs, primary biliary cirrhosis, cholangitis); extrahepatic bile ducts (gall stones, pancreatic tumour, cholangiocarcinoma).',
    ],
  },
];
