// Source references, concepts, discrepancies and diagram knowledge for
// Biochemistry → Blood Coagulation and Fibrinolysis.
//
// Lecture source (defines WHAT is taught; see content-catalog.ts):
//   DECK = "Blood Coagulation" + "Fibrinolysis" — Edwin F. Laing
//          (Blood Coag23Dia2 [Autosaved].ppt, 77 slides; fibrinolysis
//          starts at slide 58). Slides marked "Appendix" or "additional
//          information" are taught as supporting material.
//
// Many slides carry pasted textbook pages; all were read and are written
// out in `diagrams`. Speaker notes on slides 28, 41 and 43 are catalogued
// as annotations (not quizzed).
import type {
  SourceDiagram,
  SourceDiscrepancy,
  SourceReference,
} from '@/data/lesson-types';
import { slides, type ConceptDraft } from '@/data/topics/build';

export const TOPIC_ID = 'blood-coagulation-and-fibrinolysis';
const DECK = 'coag-blood-coag23dia2-autosaved';

const VISUAL = [6, 7, 8, 9, 10, 11, 12, 15, 16, 19, 20, 21, 22, 23, 27, 30, 31, 32, 35, 37, 40, 41, 43, 44, 49, 64, 67];

// ref([2, 3]) → deck slides 2 and 3.
export function ref(numbers: number[]): SourceReference[] {
  return slides(DECK, numbers, numbers.filter((n) => VISUAL.includes(n)));
}

const L1 = `${TOPIC_ID}-1`;
const L2 = `${TOPIC_ID}-2`;
const L3 = `${TOPIC_ID}-3`;
const L4 = `${TOPIC_ID}-4`;
export const LESSON_IDS = [L1, L2, L3, L4] as const;

// ─── Concepts ───────────────────────────────────────────────────────

export const concepts = {
  // Lesson 1 — The cascade
  'cascade-principles': {
    lessonId: L1, name: 'Why clotting is a cascade', category: 'core', relevance: 'core',
    sourceRefs: ref([2, 3, 4, 5, 6]),
  },
  'haemostasis-events': {
    lessonId: L1, name: 'The three events of haemostasis', category: 'core', relevance: 'core',
    sourceRefs: ref([6, 13]),
  },
  'intrinsic-extrinsic': {
    lessonId: L1, name: 'Intrinsic, extrinsic and common pathways', category: 'visual-process', relevance: 'core',
    sourceRefs: ref([7, 8, 9, 11, 55, 56]),
  },
  'pathway-activators': {
    lessonId: L1, name: 'What triggers the intrinsic pathway', category: 'important-detail', relevance: 'core',
    sourceRefs: ref([28, 29, 53, 54]),
  },
  'clotting-factors': {
    lessonId: L1, name: 'The clotting factors', category: 'core', relevance: 'core',
    sourceRefs: ref([10, 11, 12]),
  },

  // Lesson 2 — Platelets, fibrinogen and fibrin
  'platelets': {
    lessonId: L2, name: 'Platelets and their granules', category: 'core', relevance: 'core',
    sourceRefs: ref([14, 15, 16, 17, 57]),
  },
  'fibrinogen-structure': {
    lessonId: L2, name: 'Fibrinogen', category: 'core', relevance: 'core',
    sourceRefs: ref([18, 19, 20, 21]),
  },
  'fibrinopeptides': {
    lessonId: L2, name: 'Fibrinopeptides', category: 'core', relevance: 'core',
    sourceRefs: ref([20, 22, 23, 24, 25, 26, 27]),
  },
  'fibrin-cross-linking': {
    lessonId: L2, name: 'Cross-linking fibrin (factor XIII)', category: 'core', relevance: 'core',
    sourceRefs: ref([43, 44]),
  },

  // Lesson 3 — Prothrombin, vitamin K, calcium and bleeding disorders
  'prothrombin-thrombin': {
    lessonId: L3, name: 'Prothrombin and thrombin', category: 'core', relevance: 'core',
    sourceRefs: ref([30, 31, 32, 33]),
  },
  'phospholipid-calcium': {
    lessonId: L3, name: 'Platelet phospholipid and calcium', category: 'core', relevance: 'core',
    sourceRefs: ref([34, 36, 37]),
  },
  'vitamin-k-gla': {
    lessonId: L3, name: 'Vitamin K and γ-carboxyglutamate', category: 'core', relevance: 'core',
    sourceRefs: ref([35, 37, 38, 39, 40, 41, 42]),
  },
  'haemophilia': {
    lessonId: L3, name: 'Haemophilia', category: 'clinical', relevance: 'core',
    sourceRefs: ref([45, 46]),
  },
  'vwf-kallikrein': {
    lessonId: L3, name: 'Von Willebrand factor and kallikreins', category: 'supporting', relevance: 'supporting',
    sourceRefs: ref([47, 48, 49, 50, 51, 52]),
  },

  // Lesson 4 — Control of clotting and fibrinolysis
  'clot-limitation': {
    lessonId: L4, name: 'What keeps clotting local', category: 'core', relevance: 'core',
    sourceRefs: ref([4, 59, 60]),
  },
  'antithrombin-heparin': {
    lessonId: L4, name: 'Antithrombin III and heparin', category: 'core', relevance: 'core',
    sourceRefs: ref([61, 62, 63, 64]),
  },
  'plasmin-activators': {
    lessonId: L4, name: 'Plasmin and its activators', category: 'core', relevance: 'core',
    sourceRefs: ref([65, 66, 67, 68, 69, 70, 71, 72, 73]),
    verificationNote: 'Slide 65 says plasminogen is synthesised in the kidneys. No other supplied source addresses the site; it is shown as the lecture states it and not quizzed.',
  },
  'antiplatelet-thrombolytics': {
    lessonId: L4, name: 'Aspirin and thrombolytic drugs', category: 'clinical', relevance: 'core',
    sourceRefs: ref([69, 74, 75, 76, 77]),
  },
} satisfies Record<string, ConceptDraft>;

export type ConceptId = keyof typeof concepts;

// ─── Discrepancies ──────────────────────────────────────────────────

export const discrepancies: SourceDiscrepancy[] = [
  {
    id: 'fibrinogen-length',
    concept: 'Length of the fibrinogen molecule',
    status: 'unresolved',
    statements: [
      { text: 'Slide 18 (and the textbook page on slide 7): fibrinogen is 460 Å long.', sourceRefs: ref([7, 18]) },
      { text: 'Textbook page on slide 6: fibrinogen is 45 nm long (450 Å).', sourceRefs: ref([6]) },
    ],
    note: 'A small difference between pasted sources (460 Å vs 45 nm). The exact length is not quizzed.',
  },
];

// ─── Diagram knowledge ──────────────────────────────────────────────

export const diagrams: SourceDiagram[] = [
  {
    id: 'cascade-outline',
    title: 'Cascade activation of endopeptidases; haemostasis (slide 6, textbook page)',
    sourceRefs: ref([6]),
    shows: [
      'Proenzymes are synthesised as glycoproteins by the liver; a triggering event activates enzyme 1, which activates enzyme 2, and so on, until the final substrate becomes product.',
      'Active enzymes are removed by inhibitors (inactive complexes) and destroyed, usually by the liver.',
      'Haemostasis (cessation of bleeding) has three events: vasoconstriction, clumping of platelets, and aggregation of fibrin into a clot. A clot formed within an intact vessel is a thrombus.',
      'Platelets: disk-shaped, about 1 × 3 microns, no nuclei, with mitochondria and dense granules; about one platelet per 20 red cells; from megakaryocytes; they adhere to collagen.',
    ],
  },
  {
    id: 'three-pathways',
    title: 'Intrinsic, extrinsic and common pathways (slides 7–9, 11)',
    sourceRefs: ref([7, 8, 9, 11]),
    shows: [
      'Intrinsic trigger: contact with an abnormal (damaged) surface. XII → XIIa (with kininogen and kallikrein) → XI → XIa → IX → IXa; IXa with VIIIa activates X.',
      'Extrinsic trigger: trauma to tissue releases tissue factor; tissue factor + VIIa activate X.',
      'Common pathway: Xa (with Va) converts prothrombin (II) → thrombin (IIa); thrombin converts fibrinogen (I) → fibrin (Ia); XIIIa cross-links fibrin → stable clot.',
      'Modifier (non-enzyme) proteins: factor V, factor VIII and tissue factor.',
    ],
  },
  {
    id: 'factor-tables',
    title: 'Blood coagulation factors (slides 10–12)',
    sourceRefs: ref([10, 11, 12]),
    shows: [
      'Names: I fibrinogen; II prothrombin; III tissue factor; IV Ca²⁺; V proaccelerin (accelerin); VII proconvertin; VIII antihaemophilic factor; IX Christmas factor; X Stuart(-Prower) factor; XI plasma thromboplastin antecedent; XII Hageman factor; XIII fibrin-stabilising factor (protransglutaminase); prekallikrein = Fletcher factor; HMW kininogen = Fitzgerald factor.',
      'Site of synthesis (slide 12 table): mostly the liver; von Willebrand factor in the endothelium.',
      'Vitamin K-dependent (slide 12): prothrombin, VII, IX and X.',
      'Function of active form: serine proteases (II, VII, IX, X, XI, XII, prekallikrein); cofactors (V, VIII, HMW kininogen); clot structural protein (fibrinogen); transamidase (XIII).',
    ],
  },
  {
    id: 'fibrin-formation',
    title: 'Fibrinogen → fibrin (slides 18–23, textbook pages)',
    sourceRefs: ref([7, 19, 20, 21, 22, 23]),
    shows: [
      'Fibrinogen: three nodules joined by two rods; 340 kDa; six chains, two each of Aα, Bβ and γ, joined by disulfide bonds in the central region.',
      'Thrombin cleaves four Arg–Gly bonds in the central globule, releasing two A peptides (18 residues) and two B peptides (20 residues) — the fibrinopeptides.',
      'The fibrin monomer, (αβγ)₂, keeps about 97% of fibrinogen’s residues; the exposed knobs bind holes on neighbouring monomers, which assemble into fibrin.',
    ],
  },
  {
    id: 'cross-link-figure',
    title: 'Cross-linking of fibrin (slides 43–44)',
    sourceRefs: ref([43, 44]),
    shows: [
      'Factor XIIIa (a transglutaminase) links the glutamyl side chain of a glutamine to the lysine side chain of an adjacent fibrin monomer, releasing NH₄⁺.',
      'The cross-links (amide bonds between glutamyl and lysine side chains) make the clot rigid; Ca²⁺ is needed.',
    ],
  },
  {
    id: 'prothrombin-figures',
    title: 'Prothrombin and its activation (slides 30–32, 35, 37, 40–41)',
    sourceRefs: ref([30, 31, 32, 35, 37, 40, 41]),
    shows: [
      'Factor Xa cleaves prothrombin at two Arg bonds (positions 274 and 323 on slide 31) to release thrombin.',
      'Prothrombin is anchored through Ca²⁺ to platelet phospholipid by its γ-carboxyglutamate residues near the amino terminus.',
      'γ-Carboxylation of glutamate is done by a vitamin K-dependent enzyme system.',
      'Vitamin K antagonists dicoumarol and warfarin are anticoagulants and effective rat poisons; without vitamin K, prothrombin lacks its Ca²⁺-binding sites.',
    ],
  },
  {
    id: 'fibrinolysis-figure',
    title: 'Kallikrein, bradykinin and plasmin (slide 67)',
    sourceRefs: ref([67]),
    shows: [
      'Factor XII on a negative surface with HMW kininogen → XIIa, which activates prekallikrein → kallikrein (and more XIIa).',
      'Kallikrein turns kininogen into bradykinin (destroyed by a lung peptidase) and activates plasma activator; tissue activators and urokinase also act.',
      'Plasminogen → plasmin, which breaks fibrin into soluble peptides (fibrin degradation products); α₂-antiplasmin inactivates plasmin.',
    ],
  },
];
