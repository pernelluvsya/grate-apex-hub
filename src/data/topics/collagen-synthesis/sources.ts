// Source references, concepts, discrepancies and diagram knowledge for
// Biochemistry → Collagen and Elastin.
//
// Lecture source (defines WHAT is taught; see content-catalog.ts):
//   DECK = "Structural Proteins: Collagen, Elastin" — Edwin F. Laing
//          (Collagen.ppt, 81 slides).
// Many slides are pictures: textbook figures and photographed textbook pages
// placed in the deck by the lecturer. They were read and are written out in
// `diagrams`; lessons use them as lecture material. The ZIP's study guide
// and the student "Scurvy" presentation are study aids and are not used.
import type {
  SourceDiagram,
  SourceDiscrepancy,
  SourceReference,
} from '@/data/lesson-types';
import { slides, type ConceptDraft } from '@/data/topics/build';

export const TOPIC_ID = 'collagen-synthesis';
const DECK = 'coll-collagen';

const VISUAL = [5, 6, 7, 8, 9, 11, 14, 16, 17, 18, 19, 20, 21, 23, 26, 27, 28, 32, 33, 34, 35, 37, 38, 39, 42, 43, 48, 49, 52, 55, 56, 57, 58, 59, 60, 67, 80, 81];

// ref([24, 28]) → deck slides 24 and 28 (28 marked as a diagram).
export function ref(numbers: number[]): SourceReference[] {
  return slides(DECK, numbers, numbers.filter((n) => VISUAL.includes(n)));
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
  // Lesson 1 — Structural proteins, the matrix and repair
  'protein-functions': {
    lessonId: L1, name: 'What proteins do', category: 'core', relevance: 'core',
    sourceRefs: ref([2]),
  },
  'structural-proteins': {
    lessonId: L1, name: 'Structural proteins', category: 'core', relevance: 'core',
    sourceRefs: ref([3, 4]),
  },
  'matrix-adhesion': {
    lessonId: L1, name: 'The matrix, fibronectin and integrins', category: 'visual-process', relevance: 'core',
    sourceRefs: ref([5, 7, 8]),
  },
  'connective-tissue-cells': {
    lessonId: L1, name: 'Connective tissue cells', category: 'core', relevance: 'core',
    sourceRefs: ref([15, 16, 17, 18]),
  },
  'wound-healing': {
    lessonId: L1, name: 'Phases of wound healing', category: 'core', relevance: 'core',
    sourceRefs: ref([9, 10, 11]),
  },
  'scar-types': {
    lessonId: L1, name: 'Types of scars', category: 'clinical', relevance: 'core',
    sourceRefs: ref([12, 18]),
  },

  // Lesson 2 — Collagen types and the triple helix
  'collagen-overview': {
    lessonId: L2, name: 'Collagen: what it is and where', category: 'core', relevance: 'core',
    sourceRefs: ref([13, 14, 19, 20]),
  },
  'collagen-types': {
    lessonId: L2, name: 'Types of collagen', category: 'core', relevance: 'core',
    difficulty: 'intermediate',
    sourceRefs: ref([21, 22, 23]),
  },
  tropocollagen: {
    lessonId: L2, name: 'Tropocollagen: the triple helix', category: 'core', relevance: 'core',
    sourceRefs: ref([24, 25, 26, 27]),
  },
  'collagen-composition': {
    lessonId: L2, name: 'Collagen’s amino acid composition', category: 'core', relevance: 'core',
    sourceRefs: ref([29, 30, 31, 32]),
  },

  // Lesson 3 — Hydroxylation and glycosylation
  'synthesis-overview': {
    lessonId: L3, name: 'Steps in making collagen', category: 'visual-process', relevance: 'core',
    sourceRefs: ref([33, 34, 35]),
  },
  'hydroxylated-residues': {
    lessonId: L3, name: 'Hydroxyproline and hydroxylysine', category: 'core', relevance: 'core',
    sourceRefs: ref([36, 37, 38, 39]),
  },
  'prolyl-hydroxylase': {
    lessonId: L3, name: 'Prolyl hydroxylase and ascorbate', category: 'core', relevance: 'core',
    sourceRefs: ref([40, 41, 42, 43]),
  },
  'hydroxylation-rules': {
    lessonId: L3, name: 'Where hydroxylation happens', category: 'important-detail', relevance: 'core',
    difficulty: 'intermediate',
    sourceRefs: ref([44, 45, 46]),
  },
  'helix-stability': {
    lessonId: L3, name: 'Melting and stability of the helix', category: 'core', relevance: 'core',
    difficulty: 'intermediate',
    sourceRefs: ref([47, 48, 49]),
  },
  glycosylation: {
    lessonId: L3, name: 'Sugars on hydroxylysine', category: 'core', relevance: 'core',
    sourceRefs: ref([50, 51, 52]),
  },

  // Lesson 4 — Fibre assembly and cross-links
  'fibre-formation': {
    lessonId: L4, name: 'From molecules to fibres', category: 'core', relevance: 'core',
    sourceRefs: ref([53, 60]),
  },
  'procollagen-processing': {
    lessonId: L4, name: 'Procollagen and its peptidases', category: 'core', relevance: 'core',
    sourceRefs: ref([34, 54, 55]),
  },
  'collagen-crosslinks': {
    lessonId: L4, name: 'Collagen cross-links', category: 'visual-process', relevance: 'core',
    difficulty: 'intermediate',
    sourceRefs: ref([28, 56, 57, 58, 59]),
  },

  // Lesson 5 — Collagen disorders
  scurvy: {
    lessonId: L5, name: 'Scurvy', category: 'clinical', relevance: 'core',
    sourceRefs: ref([43, 61, 62, 63, 64]),
  },
  'ehlers-danlos': {
    lessonId: L5, name: 'Ehlers-Danlos syndrome', category: 'clinical', relevance: 'core',
    sourceRefs: ref([65, 66, 67]),
  },
  dermatoparaxis: {
    lessonId: L5, name: 'Dermatoparaxis', category: 'clinical', relevance: 'supporting',
    sourceRefs: ref([68]),
  },
  lathyrism: {
    lessonId: L5, name: 'Lathyrism', category: 'clinical', relevance: 'core',
    sourceRefs: ref([28, 69, 70]),
  },
  'osteogenesis-imperfecta': {
    lessonId: L5, name: 'Osteogenesis imperfecta', category: 'clinical', relevance: 'core',
    difficulty: 'intermediate',
    sourceRefs: ref([71, 72, 73]),
  },

  // Lesson 6 — Elastin
  'elastin-distribution': {
    lessonId: L6, name: 'Where elastin is and what it does', category: 'core', relevance: 'core',
    sourceRefs: ref([6, 74, 75]),
  },
  'elastin-composition': {
    lessonId: L6, name: 'Elastin’s amino acid composition', category: 'core', relevance: 'core',
    sourceRefs: ref([76, 77]),
  },
  'elastin-crosslinks': {
    lessonId: L6, name: 'Elastin cross-links and desmosine', category: 'core', relevance: 'core',
    difficulty: 'intermediate',
    sourceRefs: ref([78, 79, 80, 81]),
  },
} satisfies Record<string, ConceptDraft>;

export type ConceptId = keyof typeof concepts;

// ─── Discrepancies ──────────────────────────────────────────────────

export const discrepancies: SourceDiscrepancy[] = [
  {
    id: 'lathyrism-two-conditions',
    concept: 'What lathyrism is',
    status: 'unresolved',
    statements: [
      { text: 'Slide 69: “Acute spastic paralysis in lathyrus pea (lathyris adoratus) eaters with no satisfactory treatment.”', sourceRefs: ref([69]) },
      { text: 'Slides 69–70 and the pasted text on slide 28: lathyrism is a condition in animals that eat sweet pea seeds, in which collagen is extremely fragile because β-aminopropionitrile blocks the conversion of lysyl side chains to aldehydes.', sourceRefs: ref([28, 69, 70]) },
    ],
    note: 'The deck describes both a paralysis in people who eat lathyrus peas and a collagen disease in animals. The collagen mechanism (β-aminopropionitrile, no cross-links, fragile collagen) is taught and quizzed; how the paralysis relates to it is not explained in the deck and is not quizzed.',
  },
];

// ─── Diagram knowledge ──────────────────────────────────────────────

export const diagrams: SourceDiagram[] = [
  {
    id: 'connective-tissue',
    title: 'Connective tissue (slide 5)',
    sourceRefs: ref([5]),
    shows: [
      'Under the epithelium and basal lamina, connective tissue holds cells (fibroblasts, macrophages, mast cells), capillaries, collagen fibres and elastic fibres in a ground substance of hyaluronan, proteoglycans and glycoproteins.',
    ],
  },
  {
    id: 'elastin-network',
    title: 'Elastic fibre network (slide 6)',
    sourceRefs: ref([6]),
    shows: [
      'Single elastin molecules are joined by cross-links into a network; the network stretches and relaxes, each molecule expanding and contracting like a coil.',
    ],
  },
  {
    id: 'fibronectin-integrin',
    title: 'Fibronectin and integrins (slides 7–8)',
    sourceRefs: ref([7, 8]),
    shows: [
      'Fibronectin is two long chains joined by disulfide bonds near their C-termini, with domains for self-association, collagen binding, heparin binding and cell binding; the cell-binding domain carries the RGD (Arg-Gly-Asp) sequence and a synergy sequence.',
      'An integrin has α and β subunits spanning the plasma membrane: outside it binds an extracellular matrix protein; inside it links, through α-actinin, talin or filamin and vinculin, to actin filaments.',
    ],
  },
  {
    id: 'fibroblast-activation',
    title: 'Activation of fibroblasts — collagen fibrillogenesis (slide 9)',
    sourceRefs: ref([9]),
    shows: [
      'TGF-β is secreted from cells or released from platelets as a latent complex (bound to its latency-associated peptide, LAP), which can be activated directly or stored in the matrix; active TGF-β signals through serine–threonine kinase receptors.',
      'After release from degranulating platelets, low concentrations of active TGF-β1 attract lymphocytes, monocytes, neutrophils and fibroblasts; higher concentrations activate macrophages to secrete cytokines and fibroblasts to make extracellular matrix. Each of these cells is stimulated to secrete TGF-β1 too, extending its action in repair.',
    ],
  },
  {
    id: 'wound-phases',
    title: 'The four phases of acute wound healing (slide 11)',
    sourceRefs: ref([10, 11]),
    shows: [
      'Haemostasis (seconds to hours): vasoconstriction, platelet aggregation, leucocyte migration.',
      'Inflammatory phase (hours to days): early neutrophils, chemoattractant release, late macrophages, phagocytosis and removal of foreign bodies and bacteria.',
      'Proliferative phase (days to a week): fibroblast proliferation, collagen synthesis, extracellular matrix reorganisation, angiogenesis, granulation tissue formation, epithelialisation.',
      'Remodelling (a week to months): remodelling, epithelialisation, ECM remodelling and increasing tensile strength of the wound → healed tissue. Growth factors act across the phases.',
    ],
  },
  {
    id: 'collagen-synthesis-steps',
    title: 'Steps in the formation of mature collagen fibres (slide 33)',
    sourceRefs: ref([33]),
    shows: [
      'Inside the fibroblast: (1) polypeptide synthesis, (2) hydroxylation and glycosylation, (3) triple-helix formation, (4) secretion.',
      'Outside: procollagen bundles → (5) hydrolysis of peptide bonds → tropocollagen bundles → (6) assembly near the cell surface → collagen fibre → (7) formation of cross-links → mature collagen fibre.',
    ],
  },
  {
    id: 'procollagen-figure',
    title: 'From procollagen to tropocollagen (slides 34–35)',
    sourceRefs: ref([34, 35]),
    shows: [
      'Nascent procollagen chains are made on ribosomes on the endoplasmic reticulum and hydroxylated by prolyl and lysyl hydroxylases.',
      'The C-terminal extension segments carry cysteines that form disulfide bonds; these first hold the three chains together and help the triple helix form.',
      'The N- and C-terminal extensions are then cut off, leaving the collagen monomer (tropocollagen).',
    ],
  },
  {
    id: 'proline-hydroxylation',
    title: 'Hydroxylation of proline (slide 42)',
    sourceRefs: ref([42]),
    shows: [
      'Prolyl hydroxylase, with ferrous iron at its active site, attaches one oxygen atom of O₂ to proline; the other oxygen ends up in succinate, formed from α-ketoglutarate (CO₂ is released).',
      'A reducing agent such as ascorbate keeps the iron in the ferrous state.',
    ],
  },
  {
    id: 'thermal-stability',
    title: 'Imino acid content and thermal stability (slides 48–49)',
    sourceRefs: ref([48, 49]),
    shows: [
      'Heating tropocollagen abruptly destroys the triple helix, giving gelatin (a random coil); the abrupt transition shows the helix is held by many cooperative, individually weak bonds.',
      'Tm (melting temperature) is the temperature at which half the helical structure is lost; for intact fibres the comparable index is the shrinkage temperature (Ts).',
      'Pro + Hyp per 1000 residues, Ts, Tm, body temperature: calf skin 232, 65 °C, 39 °C, 37 °C; shark skin 191, 53 °C, 29 °C, 24–28 °C; cod skin 155, 40 °C, 16 °C, 10–14 °C. The higher the imino acid content, the more stable the helix.',
    ],
  },
  {
    id: 'staggered-array',
    title: 'Structural design of a collagen fibre (slide 60)',
    sourceRefs: ref([60]),
    shows: [
      'Tropocollagen molecules (3000 Å) form a quarter-staggered array. Along a row they are not joined end to end: a gap of about 400 Å separates one molecule from the next, and these gaps may be nucleation sites in bone formation.',
    ],
  },
  {
    id: 'crosslink-chemistry',
    title: 'Collagen cross-links (slides 28, 56–59)',
    sourceRefs: ref([28, 56, 57, 58, 59]),
    shows: [
      'Lysyl oxidase converts the ε-amino group of certain lysine side chains to an aldehyde (allysine).',
      'Two allysines join by an aldol condensation to give an aldol cross-link.',
      'A histidine side chain can add across the aldol cross-link’s C=C double bond (histidine–aldol cross-link), and its aldehyde can form a Schiff base with another side chain such as hydroxylysine — four side chains joined covalently.',
      'Cross-links can be intramolecular or intermolecular. The extent of cross-linking varies with function and age: the Achilles tendon of mature rats is highly cross-linked, the flexible tail tendon much less so.',
      'β-Aminopropionitrile (from sweet pea seeds) blocks the conversion of lysyl side chains to aldehydes, so collagen is extremely fragile (lathyrism).',
    ],
  },
  {
    id: 'eds-gel',
    title: 'Ehlers-Danlos syndrome type VII (slide 67)',
    sourceRefs: ref([67]),
    shows: [
      'Gel electrophoresis of skin (type I) collagen: normal collagen shows only α1 and α2 chains; in Ehlers-Danlos syndrome type VII, pro-α1 and pro-α2 chains appear as well — propeptides not removed.',
    ],
  },
  {
    id: 'elastin-crosslinks-figure',
    title: 'Lysinonorleucine and desmosine (slides 80–81)',
    sourceRefs: ref([80, 81]),
    shows: [
      'A lysine residue reacts with an aldehyde derived from lysine to form a Schiff base, which is reduced to lysinonorleucine.',
      'Desmosine joins four lysine-derived side chains around a pyridinium ring.',
    ],
  },
];
