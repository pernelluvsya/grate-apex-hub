// Source references, concepts, discrepancies and diagram knowledge for
// Biochemistry → Inborn Errors of Metabolism.
//
// Lecture source (defines WHAT is taught; see content-catalog.ts):
//   PDF = "Inborn Errors of Metabolism" — Samuel Nkansah Darko, Dept of
//         Molecular Medicine, KNUST (a 38-page PDF export of the slides).
// References use PDF page numbers. From page 27 on, the slide number printed
// on the page is higher (page 27 shows "28" … page 38 shows "44") because
// some slides were left out of the export. Pages 23/24 and 25/26 repeat the
// same text with different pictures.
// Figures on pages 3, 20–26, 28–31, 33, 34 and 36 were read and are
// written out in `diagrams`.
//
// Reference (clarification only): Lehninger Principles of Biochemistry —
// printed pages, via leh(...). p. 551 G6PD deficiency; pp. 679–681 PKU,
// alkaptonuria, Garrod and newborn screening; p. 924 Beadle and Tatum.
import { LEHNINGER_ID } from '@/data/content-catalog';
import type {
  SourceDiagram,
  SourceDiscrepancy,
  SourceReference,
} from '@/data/lesson-types';
import type { ConceptDraft } from '@/data/topics/build';

export const TOPIC_ID = 'inborn-errors-of-metabolism';
const PDF = 'iem-inborn-errors-of-metabolism';

const VISUAL = [3, 20, 21, 22, 23, 24, 25, 26, 28, 29, 30, 31, 33, 34, 36];

// ref([20, 21]) → PDF pages 20 and 21 (pictures marked as diagrams).
export function ref(numbers: number[]): SourceReference[] {
  return [...numbers]
    .sort((a, b) => a - b)
    .map((page) => ({ sourceId: PDF, page, ...(VISUAL.includes(page) ? { visual: true } : {}) }));
}

// leh(681) → Lehninger page 681.
export function leh(...pages: number[]): SourceReference[] {
  return pages.map((page) => ({ sourceId: LEHNINGER_ID, page }));
}

const L1 = `${TOPIC_ID}-1`;
const L2 = `${TOPIC_ID}-2`;
const L3 = `${TOPIC_ID}-3`;
const L4 = `${TOPIC_ID}-4`;
const L5 = `${TOPIC_ID}-5`;
const L6 = `${TOPIC_ID}-6`;
export const LESSON_IDS = [L1, L2, L3, L4, L5, L6] as const;

// ─── Concepts ───────────────────────────────────────────────────────
// Names are shown to learners (Results, Review), so they read plainly.
// IDs are kept stable: saved progress and review schedules use them.

export const concepts = {
  // Lesson 1 — What inborn errors are
  'garrod-hypothesis': {
    lessonId: L1, name: 'Garrod’s hypothesis', category: 'core', relevance: 'core',
    sourceRefs: [...ref([3]), ...leh(681)],
  },
  'age-of-onset': {
    lessonId: L1, name: 'When inborn errors show themselves', category: 'core', relevance: 'core',
    sourceRefs: [...ref([4]), ...leh(551)],
  },
  'metabolic-block': {
    lessonId: L1, name: 'Consequences of a metabolic block', category: 'core', relevance: 'core',
    sourceRefs: ref([3, 5]),
  },
  'remote-effects': {
    lessonId: L1, name: 'Remote products and feedback effects', category: 'core', relevance: 'core',
    difficulty: 'intermediate',
    sourceRefs: ref([6]),
  },

  // Lesson 2 — Detection and newborn screening
  'detection-methods': {
    lessonId: L2, name: 'Laboratory detection and specimens', category: 'core', relevance: 'core',
    sourceRefs: ref([7]),
  },
  'prenatal-diagnosis': {
    lessonId: L2, name: 'Prenatal diagnosis', category: 'core', relevance: 'core',
    sourceRefs: ref([8]),
  },
  'screening-criteria': {
    lessonId: L2, name: 'Criteria for neonatal screening', category: 'core', relevance: 'core',
    sourceRefs: ref([9]),
  },
  'uk-screening': {
    lessonId: L2, name: 'Conditions screened in UK newborns', category: 'important-detail', relevance: 'core',
    sourceRefs: ref([10]),
  },

  // Lesson 3 — Suspecting, investigating and managing an IEM
  'suspect-features': {
    lessonId: L3, name: 'When to suspect an inborn error', category: 'clinical', relevance: 'core',
    sourceRefs: ref([11, 12]),
  },
  'late-findings': {
    lessonId: L3, name: 'Late clinical findings', category: 'clinical', relevance: 'core',
    sourceRefs: ref([13]),
  },
  'routine-investigations': {
    lessonId: L3, name: 'Routine laboratory investigations', category: 'core', relevance: 'core',
    sourceRefs: ref([14, 15]),
  },
  'specialised-tests': {
    lessonId: L3, name: 'Specialised tests', category: 'core', relevance: 'core',
    sourceRefs: ref([16, 17]),
  },
  management: {
    lessonId: L3, name: 'Principles of management', category: 'core', relevance: 'core',
    sourceRefs: [...ref([18]), ...leh(680)],
  },

  // Lesson 4 — Enzyme defects
  'enzyme-defects': {
    lessonId: L4, name: 'Enzyme defects by metabolic class', category: 'core', relevance: 'core',
    sourceRefs: ref([19]),
  },
  pku: {
    lessonId: L4, name: 'Phenylketonuria', category: 'clinical', relevance: 'core',
    sourceRefs: [...ref([20]), ...leh(679, 680)],
  },
  galactosaemia: {
    lessonId: L4, name: 'Galactosaemia', category: 'clinical', relevance: 'core',
    sourceRefs: ref([21]),
  },
  'methylmalonic-aciduria': {
    lessonId: L4, name: 'Methylmalonic aciduria', category: 'clinical', relevance: 'core',
    sourceRefs: ref([22]),
  },
  'tay-sachs': {
    lessonId: L4, name: 'Tay-Sachs disease', category: 'clinical', relevance: 'core',
    sourceRefs: ref([23, 24]),
  },
  scid: {
    lessonId: L4, name: 'Severe combined immunodeficiency', category: 'clinical', relevance: 'core',
    sourceRefs: ref([25, 26]),
  },

  // Lesson 5 — Transport protein defects
  'transport-defects': {
    lessonId: L5, name: 'Transport protein defects', category: 'core', relevance: 'core',
    sourceRefs: ref([27]),
  },
  thalassaemia: {
    lessonId: L5, name: 'Thalassaemias', category: 'clinical', relevance: 'core',
    sourceRefs: ref([28]),
  },
  'cystic-fibrosis': {
    lessonId: L5, name: 'Cystic fibrosis', category: 'clinical', relevance: 'core',
    sourceRefs: ref([29]),
  },
  cystinosis: {
    lessonId: L5, name: 'Cystinosis', category: 'clinical', relevance: 'core',
    sourceRefs: ref([30]),
  },
  menkes: {
    lessonId: L5, name: 'Menkes syndrome', category: 'clinical', relevance: 'core',
    sourceRefs: ref([31]),
  },

  // Lesson 6 — Structural, homeostatic and signalling defects
  'structural-defects': {
    lessonId: L6, name: 'Defects in cell and organ structure', category: 'core', relevance: 'core',
    sourceRefs: ref([32]),
  },
  'osteogenesis-imperfecta': {
    lessonId: L6, name: 'Osteogenesis imperfecta', category: 'clinical', relevance: 'core',
    sourceRefs: ref([33]),
  },
  zellweger: {
    lessonId: L6, name: 'Zellweger syndrome', category: 'clinical', relevance: 'core',
    sourceRefs: ref([34]),
  },
  'homeostasis-defects': {
    lessonId: L6, name: 'Defects in extracellular homeostasis', category: 'core', relevance: 'core',
    sourceRefs: ref([35]),
  },
  'haemophilia-a': {
    lessonId: L6, name: 'Haemophilia A', category: 'clinical', relevance: 'core',
    sourceRefs: ref([36]),
  },
  'growth-control-defects': {
    lessonId: L6, name: 'Growth-control defects', category: 'core', relevance: 'core',
    sourceRefs: ref([37]),
  },
  'receptor-hormone-defects': {
    lessonId: L6, name: 'Receptor and hormone defects', category: 'core', relevance: 'core',
    sourceRefs: ref([38]),
  },
} satisfies Record<string, ConceptDraft>;

export type ConceptId = keyof typeof concepts;

// ─── Discrepancies ──────────────────────────────────────────────────

export const discrepancies: SourceDiscrepancy[] = [
  {
    id: 'one-gene-one-enzyme',
    concept: 'Who proposed “one gene → one enzyme”',
    status: 'resolved',
    statements: [
      { text: 'Page 3 (under a figure titled “Garrod’s Hypothesis”): “Early 1900s • ONE GENE → ONE ENZYME • Studied alkaptonuria • Hypothesized that defective enzyme leads to ‘in born error in metabolism’.”', sourceRefs: ref([3]) },
    ],
    resolution: {
      text: 'Lehninger: Archibald Garrod discovered in the early 1900s that alkaptonuria is inherited and traced it to the absence of a single enzyme — the first link between an inherited trait and an enzyme (p. 681). The “one gene–one enzyme” hypothesis itself was proposed by Beadle and Tatum in 1940, and later broadened to one gene–one polypeptide (p. 924).',
      sourceRefs: leh(681, 924),
    },
    note: 'Lessons teach Garrod’s idea as the slide does and credit the phrase to Beadle and Tatum in a labelled textbook note. Who coined the phrase is not quizzed.',
  },
  {
    id: 'g6pase-g6pd',
    concept: 'Glucose-6-phosphatase vs glucose-6-phosphate dehydrogenase deficiency',
    status: 'unresolved',
    statements: [
      { text: 'Page 10 lists “Glucose 6 phosphatase deficiency” among the conditions screened in the UK between the 5th and 8th day postpartum.', sourceRefs: ref([10]) },
      { text: 'Page 4 gives “Glucose 6 phosphate dehydrogenase deficiency” as the inborn error whose clinical manifestation depends on external factors.', sourceRefs: ref([4]) },
    ],
    note: 'These are two different enzymes. The supplied sources do not confirm which deficiency the lecturer meant on page 10, so that item is not quizzed — confirm with your lecturer.',
  },
];

// ─── Diagram knowledge ──────────────────────────────────────────────

export const diagrams: SourceDiagram[] = [
  {
    id: 'garrod-figure',
    title: 'Garrod’s hypothesis (page 3)',
    sourceRefs: ref([3]),
    shows: [
      'A pathway A → B → C with the step B → C blocked (✗).',
      'B builds up (“substrate excess”), C is lacking (“product deficiency”), and B is diverted to D, a “toxic metabolite”.',
    ],
  },
  {
    id: 'pku-figure',
    title: 'Phenylketonuria (page 20)',
    sourceRefs: ref([20]),
    shows: [
      'Phenylalanine → tyrosine, catalysed by phenylalanine hydroxylase (PAH).',
      'The PAH gene is on the long (q) arm of chromosome 12 (12q22–q24.2).',
      'Autosomal recessive inheritance: two unaffected carrier parents → 25% affected, 50% unaffected carriers, 25% unaffected.',
    ],
  },
  {
    id: 'galactose-figure',
    title: 'Galactose metabolism (page 21)',
    sourceRefs: ref([21]),
    shows: [
      'Lactase splits lactose into galactose and glucose.',
      'Galactokinase (GALK) phosphorylates galactose to galactose-1-phosphate (ATP → ADP).',
      'Galactose-1-phosphate uridylyltransferase (GALT, highlighted) converts Gal-1P + UDP-glucose → glucose-1-phosphate + UDP-galactose.',
      'UDP-galactose 4′-epimerase (GALE) interconverts UDP-galactose and UDP-glucose (and UDP-GlcNAc and UDP-GalNAc).',
    ],
  },
  {
    id: 'mma-figure',
    title: 'Methylmalonic acidaemia (page 22)',
    sourceRefs: ref([22]),
    shows: [
      'Isoleucine, valine, methionine and threonine from dietary protein, plus odd-chain fatty acids and gut flora, feed into methylmalonyl-CoA.',
      'Methylmalonyl-CoA mutase, with cobalamin (vitamin B12), converts methylmalonyl-CoA to succinyl-CoA, which yields energy.',
      'When the mutase step is blocked (MMA), methylmalonyl-CoA rises and backs up to propionyl-CoA, which inhibits the urea cycle, the citric acid cycle and other pathways. This occurs across tissues, including the liver.',
    ],
  },
  {
    id: 'tay-sachs-figures',
    title: 'Tay-Sachs disease (pages 23–24)',
    sourceRefs: ref([23, 24]),
    shows: [
      'Normal lysosomes carry the full set of digestive enzymes, including hexosaminidase A; ganglioside GM2 in a digestive vacuole is digested and the residue removed by exocytosis.',
      'Tay-Sachs lysosomes have every digestive enzyme except hexosaminidase A, so digestion is incomplete: residual vacuoles accumulate because GM2 cannot be digested, and there is no exocytosis.',
      'HEXA gene mutation → β-hexosaminidase A deficiency → GM2 ganglioside accumulates in neurons → swollen neurons with lamellar inclusions and neuronal degradation → a “cherry red spot” in the macula and narrowing of the retinal blood vessels.',
    ],
  },
  {
    id: 'scid-figures',
    title: 'Adenosine deaminase and SCID (pages 25–26)',
    sourceRefs: ref([25, 26]),
    shows: [
      'Adenosine deaminase (ADA) removes the amino group from deoxyadenosine, giving deoxyinosine, which goes on to uric acid or purine salvage.',
      'Without ADA, deoxyadenosine is phosphorylated to dAMP → dADP → dATP (deoxyadenosine triphosphate), which is toxic to lymphocytes (lymphotoxicity).',
      'Page 26 shows the “bubble boy”: a child in a protective suit.',
    ],
  },
  {
    id: 'thalassaemia-figure',
    title: 'Molecular basis of the thalassaemias (page 28)',
    sourceRefs: ref([28]),
    shows: [
      'Thalassaemias are caused by deletions and/or mutations in either the β or the α subunit of normal adult haemoglobin (HbA, α₂β₂).',
      'β-thalassaemia: the β-globin genes are present but their mRNA is made inefficiently or rapidly degraded; less β-chain is made, so unpaired α-chains increase. Forms shown: β-thalassaemia minor trait, intermedia (relatively mild) and major (severe).',
      'α-thalassaemia: α-globin genes are deleted (there are 4 α genes); less α-chain is made, so tetramers of β-chains increase. One or two genes deleted → carrier traits; three → haemoglobin H disease; four → Hb Barts hydrops fetalis (fatal).',
    ],
  },
  {
    id: 'cf-figure',
    title: 'Cystic fibrosis (page 29)',
    sourceRefs: ref([29]),
    shows: [
      'Normal airway epithelium: CFTR moves Cl⁻ out onto the surface while ENaC takes up Na⁺, and the mucus layer stays normal.',
      'Cystic fibrosis: Cl⁻ movement through CFTR fails (dashed arrow) while Na⁺ uptake continues (large arrow), leaving dehydrated mucus.',
    ],
  },
  {
    id: 'cystinosis-figure',
    title: 'Cystinosis (page 30)',
    sourceRefs: ref([30]),
    shows: [
      'The CTNS gene (expressed in all tissues) encodes cystinosin, an H⁺-driven cystine transporter in the lysosomal membrane; a proton pump (ATP → ADP + Pi) acidifies the lysosome.',
      'When cystinosin is defective, cystine cannot leave the lysosome and accumulates, leading to multisystemic disease.',
      'Cysteamine is shown entering the lysosome and leaving as a cysteamine–cysteine complex.',
    ],
  },
  {
    id: 'menkes-figure',
    title: 'Copper transport by ATP7A (page 31)',
    sourceRefs: ref([31]),
    shows: [
      'ATP7A is a copper-transporting ATPase. At low copper it sits in the trans-Golgi; at high copper it travels in secretory vesicles to the plasma membrane and exports copper, then returns via endosomes.',
    ],
  },
  {
    id: 'oi-figure',
    title: 'Collagen production in osteogenesis imperfecta (page 33)',
    sourceRefs: ref([33]),
    shows: [
      'Side-by-side panels compare collagen production in a normal situation and in osteogenesis imperfecta: intracellular steps (chain synthesis, hydroxylation and glycosylation, triple-helix formation) and extracellular steps (cleavage of the ends, fibril assembly and cross-linking).',
      'In osteogenesis imperfecta a defect in one chain disturbs the triple helix and the fibrils assembled from it. The slide text names COL1A1 and glycine substitution.',
    ],
  },
  {
    id: 'zellweger-figure',
    title: 'Peroxisome biogenesis (page 34)',
    sourceRefs: ref([34]),
    shows: [
      'A pre-peroxisome forms from the ER, imports matrix proteins made on free polyribosomes, grows, and divides (fission) into metabolically active peroxisomes; old peroxisomes are degraded by pexophagy.',
    ],
  },
  {
    id: 'haemophilia-figure',
    title: 'Haemophilia A (page 36)',
    sourceRefs: ref([36]),
    shows: [
      'Injury to a blood vessel causes bleeding; the vessel constricts and clotting factors are activated.',
      'Normal: with other substances, factor VIII helps a strong platelet plug form, and a stable fibrin clot seals the injury so the bleeding stops.',
      'Haemophilia A: lack of factor VIII gives a weak platelet plug, and incomplete or delayed fibrin clot formation lets the bleeding continue.',
    ],
  },
];
