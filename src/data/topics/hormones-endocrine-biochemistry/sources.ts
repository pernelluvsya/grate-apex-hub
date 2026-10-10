// Source references, concepts, discrepancies and diagram knowledge for
// Biochemistry → Endocrine System: Hormones.
//
// Lecture source (defines WHAT is taught; see content-catalog.ts):
//   DECK = "Hormones" — Prof. FAY, Dept. of Molecular Medicine
//          (PROF FAY- HORMONES NEW.ppt, 29 slides).
// Figures on slides 17, 19 and 24 were read and are written out in
// `diagrams`. Slide 29 is an unlabelled clinical photograph and is not used.
//
// Reference (clarification only): Guyton and Hall, Textbook of Medical
// Physiology (14th ed.) — printed pages, via guy(...). pp. 955–956 adrenal
// cortex zones and steroid synthesis.
import type {
  SourceDiagram,
  SourceDiscrepancy,
  SourceReference,
} from '@/data/lesson-types';
import { slides, type ConceptDraft } from '@/data/topics/build';

export const TOPIC_ID = 'hormones-endocrine-biochemistry';
const DECK = 'horm-prof-fay-hormones-new';
const GUYTON_ID = 'guyton-hall-14e';

const VISUAL = [4, 7, 17, 19, 24];

// ref([12]) → deck slide 12.
export function ref(numbers: number[]): SourceReference[] {
  return slides(DECK, numbers, numbers.filter((n) => VISUAL.includes(n)));
}

// guy(956) → Guyton page 956.
export function guy(...pages: number[]): SourceReference[] {
  return pages.map((page) => ({ sourceId: GUYTON_ID, page }));
}

const L1 = `${TOPIC_ID}-1`;
const L2 = `${TOPIC_ID}-2`;
const L3 = `${TOPIC_ID}-3`;
export const LESSON_IDS = [L1, L2, L3] as const;

// ─── Concepts ───────────────────────────────────────────────────────

export const concepts = {
  // Lesson 1 — The endocrine system and hormones
  'endocrine-glands': {
    lessonId: L1, name: 'The endocrine glands', category: 'core', relevance: 'core',
    sourceRefs: ref([4, 5, 6, 7]),
  },
  'hormone-definition': {
    lessonId: L1, name: 'What a hormone is', category: 'core', relevance: 'core',
    sourceRefs: ref([8]),
  },
  'target-specificity': {
    lessonId: L1, name: 'Target-cell specificity', category: 'core', relevance: 'core',
    sourceRefs: ref([9, 10]),
  },
  'hormone-functions': {
    lessonId: L1, name: 'What hormones control', category: 'core', relevance: 'core',
    sourceRefs: ref([11]),
  },

  // Lesson 2 — Structural classes and peptide-hormone signalling
  'structural-categories': {
    lessonId: L2, name: 'Structural categories of hormones', category: 'core', relevance: 'core',
    sourceRefs: ref([12]),
  },
  'hormone-effects': {
    lessonId: L2, name: 'What a hormone does to a cell', category: 'core', relevance: 'core',
    sourceRefs: ref([13, 14]),
  },
  'camp-pathway': {
    lessonId: L2, name: 'cAMP as second messenger', category: 'visual-process', relevance: 'core',
    sourceRefs: ref([15, 16, 17]),
  },
  'ip3-dag-calcium': {
    lessonId: L2, name: 'DAG, IP₃ and calcium', category: 'visual-process', relevance: 'core',
    sourceRefs: ref([18, 19]),
  },

  // Lesson 3 — Steroid hormones
  'steroid-classes': {
    lessonId: L3, name: 'Classes of steroid hormones', category: 'core', relevance: 'core',
    sourceRefs: [...ref([20, 25]), ...guy(955)],
  },
  'adrenal-synthesis': {
    lessonId: L3, name: 'Making adrenal steroids', category: 'core', relevance: 'core',
    sourceRefs: [...ref([21, 22]), ...guy(955, 956)],
  },
  'steroid-mechanism': {
    lessonId: L3, name: 'How steroid hormones act', category: 'visual-process', relevance: 'core',
    sourceRefs: ref([23, 24, 27]),
  },
  'hpa-axis': {
    lessonId: L3, name: 'The hypothalamic–pituitary–adrenal axis', category: 'core', relevance: 'core',
    sourceRefs: ref([25, 26]),
  },
} satisfies Record<string, ConceptDraft>;

export type ConceptId = keyof typeof concepts;

// ─── Discrepancies ──────────────────────────────────────────────────

export const discrepancies: SourceDiscrepancy[] = [
  {
    id: 'cortisol-class',
    concept: 'Is cortisol a mineralocorticoid or a glucocorticoid?',
    status: 'resolved',
    statements: [
      { text: 'Slide 20: “The mineralocorticoids (e.g. cortisol, aldosterone) regulate the balance of sodium and potassium in the ECF.”', sourceRefs: ref([20]) },
      { text: 'Slide 25: “In humans, cortisol is the major glucocorticoid”; slide 21: cortisol is made in the zona fasciculata/reticularis, aldosterone in the zona glomerulosa.', sourceRefs: ref([21, 25]) },
    ],
    resolution: {
      text: 'The lecture’s own slides 21 and 25, and Guyton (the zona fasciculata and reticularis secrete cortisol; the zona glomerulosa secretes aldosterone), settle it: cortisol is the major glucocorticoid and aldosterone the mineralocorticoid.',
      sourceRefs: [...ref([21, 25]), ...guy(955)],
    },
  },
  {
    id: 'crf-target',
    concept: 'What CRF stimulates',
    status: 'resolved',
    statements: [
      { text: 'Slide 25: “the hypothalamus secretes CRF which in turn stimulates the adrenal cortex to synthesize the glucocorticoids”.', sourceRefs: ref([25]) },
      { text: 'Slide 26 diagram: hypothalamus → CRF (+) → anterior pituitary → ACTH (+) → adrenal cortex → cortisol, with cortisol (−) feeding back on both, and ACTH (−) on the hypothalamus.', sourceRefs: ref([26]) },
    ],
    resolution: {
      text: 'The lecture’s own diagram (slide 26), and slide 25’s own mention of cortisol inhibiting both CRF and ACTH, show the full chain: CRF acts on the anterior pituitary, whose ACTH then stimulates the adrenal cortex.',
      sourceRefs: ref([25, 26]),
    },
  },
  {
    id: 'angiotensin-glomerulosa',
    concept: 'Which angiotensin stimulates the zona glomerulosa',
    status: 'unresolved',
    statements: [
      { text: 'Slide 21: the rate-limiting step is stimulated “by angiotensin III in the zona glomerulosa”.', sourceRefs: ref([21]) },
      { text: 'Guyton: “angiotensin II, which stimulates aldosterone secretion”, increases the conversion of cholesterol to pregnenolone.', sourceRefs: guy(956) },
    ],
    note: 'The sources name different angiotensins. Which one the lecturer expects is not quizzed — confirm with the lecturer.',
  },
];

// ─── Diagram knowledge ──────────────────────────────────────────────

export const diagrams: SourceDiagram[] = [
  {
    id: 'camp-figure',
    title: 'cAMP second-messenger system (slide 17)',
    sourceRefs: ref([17]),
    shows: [
      'A hormone binds its receptor; a stimulatory G protein (GTP → GDP + Pi) activates adenylate cyclase (+); another hormone acting through an inhibitory G protein inhibits it (−).',
      'Adenylate cyclase converts ATP to cyclic AMP; cAMP converts inactive protein kinase into active protein kinase.',
      'Phosphorylation of proteins triggers the responses of the target cell (enzyme activation, cellular secretion, membrane permeability changes, gene activation, etc.).',
      'Hormones using this system: catecholamines, ACTH, FSH, LH, glucagon, PTH, TSH, calcitonin.',
    ],
  },
  {
    id: 'ip3-figure',
    title: 'PIP₂–calcium signalling (slide 19)',
    sourceRefs: ref([19]),
    shows: [
      'Hormone → receptor → G protein (GTP → GDP + Pi) → phospholipase (PIP complex) (+).',
      'Diacylglycerol activates protein kinase; IP₃ releases Ca²⁺ from the endoplasmic reticulum; Ca²⁺ and Ca²⁺–calmodulin trigger responses of the target cell.',
      'Hormones using this system: catecholamines, TRH, ADH, LHRH, oxytocin.',
    ],
  },
  {
    id: 'steroid-figure',
    title: 'Steroid hormone action (slide 24)',
    sourceRefs: ref([24]),
    shows: [
      'The steroid hormone crosses the cell membrane and binds a receptor; the hormone–receptor complex binds an acceptor on the DNA in the nucleus.',
      'Transcription makes mRNA, which leaves for the cytoplasm, where ribosomes translate it into new protein.',
    ],
  },
  {
    id: 'adrenal-pathway',
    title: 'Biosynthesis of adrenocorticosteroids (slide 22)',
    sourceRefs: ref([22]),
    shows: [
      'Acetyl-CoA → cholesterol → 5-pregnenolone.',
      'Pregnenolone → progesterone → 11-deoxycorticosterone → corticosterone → aldosterone.',
      'Pregnenolone → 17-hydroxypregnenolone → dehydroepiandrosterone; progesterone → 17-hydroxyprogesterone → 11-deoxycortisol → cortisol; 17-hydroxyprogesterone → androstenedione → testosterone / estrone → estriol.',
    ],
  },
  {
    id: 'hpa-figure',
    title: 'Hypothalamic–pituitary–adrenal axis (slide 26)',
    sourceRefs: ref([26]),
    shows: [
      'Hypothalamus —CRF (+)→ anterior pituitary —ACTH (+)→ adrenal cortex → cortisol.',
      'Cortisol inhibits (−) the hypothalamus and the anterior pituitary; ACTH inhibits (−) the hypothalamus.',
    ],
  },
];
