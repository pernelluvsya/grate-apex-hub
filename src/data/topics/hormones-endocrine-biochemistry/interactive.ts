// Biochemistry → Endocrine System: Hormones — layer 1 (learn by answering)
// and reading-layer extras. Checkpoint IDs: cN-xx; recall prompts: rN-xx.
import type { LessonConfusion } from '@/data/lesson-types';
import { ask, fill, learn, match, mcq, multi, order, recall, type InteractiveDraft } from '@/data/topics/build';
import { ref, type ConceptId } from '@/data/topics/hormones-endocrine-biochemistry/sources';

type Steps = InteractiveDraft<ConceptId>[];

export const interactive: Record<string, Steps> = {
  // ─── Lesson 1 — The endocrine system ───────────────────────────────
  'hormones-endocrine-biochemistry-1': [
    ask(
      mcq('c1-01', 'hormone-definition', 'Before you start: how does a hormone reach its target?', 'It is secreted by a ductless gland into the extracellular fluid and carried in the blood', ['It travels along a nerve fibre', 'It passes through a duct onto a surface', 'It stays inside the cell that made it'], {
        explanation: 'Slide 8: hormones are secreted by ductless glands into the extracellular fluid; the endocrine system has a rich vascular and lymphatic drainage.',
        skill: 'prediction',
      })
    ),
    learn('Ten glands', ['Hypothalamus, pituitary (anterior and posterior), pineal, thyroid, parathyroid, thymus, adrenals, pancreatic islets, ovaries and testes (slide 5). Adipose tissue is also considered an endocrine organ (slides 4, 8).'], {
      sourceRefs: ref([4, 5, 8]),
    }),
    ask(
      multi('c1-02', 'endocrine-glands', 'Which are among the lecture’s ten endocrine glands? Select all that apply.', ['Pineal', 'Thymus', 'Parathyroid', 'Hypothalamus'], ['Spleen', 'Liver'], {
        explanation: 'Slide 5.',
      })
    ),
    learn('Target cells', [
      'Hormones reach almost all tissues, but only cells with specific receptors respond. ACTH receptors are on certain adrenal cortex cells; thyroxine receptors are on nearly all cells.',
      'The size of the response depends on three things: the hormone’s blood level, the number of receptors, and the affinity of the hormone–receptor complex.',
    ], { sourceRefs: ref([9, 10]) }),
    ask(
      multi('c1-03', 'target-specificity', 'Which three factors decide how strongly a target cell responds? Select all that apply.', ['Blood level of the hormone', 'Number of receptors', 'Affinity of the hormone–receptor complex'], ['The size of the gland', 'The colour of the hormone'], {
        explanation: 'Slide 10.',
      })
    ),
    ask(
      mcq('c1-04', 'target-specificity', 'Which hormone has receptors on nearly all body cells?', 'Thyroxine', ['ACTH', 'Oxytocin', 'FSH'], {
        explanation: 'Slide 9: thyroxine is the principal hormonal stimulant of cellular metabolism, and nearly all cells have its receptors.',
      })
    ),
    learn('What hormones control', ['Reproduction; growth and development; defences against stressors; electrolyte, water and nutrient balance; cellular metabolism and energy balance (slide 11).'], {
      sourceRefs: ref([11]),
    }),
    ask(
      match('c1-05', 'hormone-functions', 'Match each process to a hormone that serves it (examples from Lessons 2–3).', [
        ['Reproduction', 'Estrogens and testosterone'],
        ['Electrolyte balance', 'Aldosterone'],
        ['Cellular metabolism', 'Thyroxine'],
      ], { explanation: 'Slides 9, 11 and 20.' })
    ),
    recall('r1-01', 'target-specificity', 'Explain why a hormone in the blood affects only some cells, and what sets the strength of the response.', [
      'Only target cells carry specific protein receptors for the hormone (e.g. ACTH receptors on adrenal cortex cells).',
      'Hormone–receptor binding is the crucial first step.',
      'The response depends on the hormone’s blood level, the number of receptors and the affinity of the complex.',
    ]),
  ],

  // ─── Lesson 2 — Classes and second messengers ──────────────────────
  'hormones-endocrine-biochemistry-2': [
    ask(
      mcq('c2-01', 'hormone-effects', 'Peptide hormones cannot easily cross the cell membrane. How do you expect them to act?', 'Through receptors on the cell surface that trigger second messengers inside', ['By diffusing into the nucleus', 'By dissolving the membrane', 'By being taken up and stored in the cell'], {
        explanation: 'Slide 14: peptide hormones use G proteins and second messengers; lipid-soluble steroids act on genes directly.',
        skill: 'prediction',
      })
    ),
    learn('Structural classes', ['Slide 12 groups hormones as proteins, glycoproteins, polypeptides, amino acid derivatives and lipid/fatty acid derivatives.'], {
      terms: [
        { term: 'Glycoproteins', meaning: 'FSH, LH, TSH.' },
        { term: 'Amino acid derivatives', meaning: 'Epinephrine, norepinephrine, thyroxine, tri-iodothyronine.' },
        { term: 'Lipid derivatives', meaning: 'Steroids (estrogen, testosterone, cortisol, aldosterone), leukotrienes, thromboxanes.' },
      ],
      sourceRefs: ref([12]),
    }),
    ask(
      match('c2-02', 'structural-categories', 'Match each hormone to its structural category.', [
        ['Insulin', 'Protein'],
        ['TSH', 'Glycoprotein'],
        ['Oxytocin', 'Polypeptide'],
        ['Thyroxine', 'Amino acid derivative'],
        ['Aldosterone', 'Lipid derivative'],
      ], { explanation: 'Slide 12.' })
    ),
    learn('cAMP', [
      'Hormone → receptor → G protein (GTPase; GTP → GDP + Pi) → adenylate cyclase → cAMP from ATP → protein kinase → phosphorylation → response. An inhibitory G protein can switch adenylate cyclase off.',
    ], { sourceRefs: ref([15, 16, 17]) }),
    ask(
      order('c2-03', 'camp-pathway', 'Order the cAMP pathway.', [
        'Hormone binds its receptor',
        'G protein activates adenylate cyclase',
        'ATP is converted to cAMP',
        'cAMP activates protein kinase',
        'Proteins are phosphorylated → response',
      ], { explanation: 'Slides 15–17.' })
    ),
    learn('DAG, IP₃ and calcium', [
      'A phospholipase splits PIP₂ into DAG and IP₃. DAG activates protein kinases; IP₃ releases Ca²⁺ from the ER; Ca²⁺ (alone or with calmodulin) is the third messenger.',
    ], { sourceRefs: ref([18, 19]) }),
    ask(
      mcq('c2-04', 'ip3-dag-calcium', 'What does IP₃ do?', 'Releases Ca²⁺ from the endoplasmic reticulum', ['Activates adenylate cyclase', 'Binds DNA', 'Hydrolyses GTP'], {
        explanation: 'Slide 18.',
      })
    ),
    ask(
      fill('c2-05', 'ip3-dag-calcium', 'Calcium acts as a third messenger, often by binding the regulatory protein ____.', ['calmodulin'], {
        explanation: 'Slide 18.',
        skill: 'terminology',
      })
    ),
    recall('r2-01', 'camp-pathway', 'Describe how a peptide hormone raises cAMP and changes the cell.', [
      'The hormone (first messenger) binds its surface receptor.',
      'A G protein (with GTPase activity) relays the signal to adenylate cyclase, which makes cAMP from ATP.',
      'cAMP activates protein kinases; phosphorylated proteins produce the response (enzyme activation, secretion, permeability changes, gene activation).',
    ]),
  ],

  // ─── Lesson 3 — Steroid hormones ───────────────────────────────────
  'hormones-endocrine-biochemistry-3': [
    ask(
      mcq('c3-01', 'steroid-classes', 'Before you start: what molecule are all steroid hormones made from?', 'Cholesterol', ['Tyrosine', 'Arachidonic acid', 'Glucose'], {
        explanation: 'Slide 20: steroid hormones are all derived from cholesterol.',
        skill: 'prediction',
      })
    ),
    learn('Classes', ['Sex hormones (gonads) and corticosteroids (adrenal cortex): mineralocorticoids (aldosterone — Na⁺/K⁺ balance) and glucocorticoids (cortisol — gluconeogenesis, protein breakdown, anti-inflammatory).'], {
      sourceRefs: ref([20, 25]),
    }),
    ask(
      multi('c3-02', 'steroid-classes', 'What does mineralocorticoid deficiency cause (slide 20)? Select all that apply.', ['Hyperkalaemia', 'Hyponatraemia'], ['Hypoglycaemia only', 'Hypercalcaemia'], {
        explanation: 'Slide 20: less K⁺ excreted and less Na⁺ reabsorbed by the kidney.',
      })
    ),
    learn('Adrenal synthesis', [
      'Cholesterol → pregnenolone is rate-limiting (ACTH; angiotensin in the glomerulosa). Progesterone is shared. Fasciculata/reticularis: 17, 21, 11-hydroxylation → cortisol. Glomerulosa lacks 17-hydroxylase: 21, 11, 18 → aldosterone.',
    ], { sourceRefs: ref([21, 22]) }),
    ask(
      mcq('c3-03', 'adrenal-synthesis', 'Why can’t the zona glomerulosa make cortisol?', 'It lacks 17-hydroxylase', ['It lacks cholesterol', 'It has no ACTH receptors at all', 'It cannot make pregnenolone'], {
        explanation: 'Slide 21: the zona glomerulosa does not contain 17-hydroxylase activity; it hydroxylates at 21, 11 and 18 to make aldosterone.',
        skill: 'cause-effect',
      })
    ),
    learn('Mechanism and feedback', [
      'Steroids diffuse into cells, bind receptors, and the complex binds chromatin to switch on transcription.',
      'HPA axis: CRF → ACTH → cortisol; cortisol inhibits CRF and ACTH; ACTH inhibits CRF.',
    ], { sourceRefs: ref([23, 24, 26]) }),
    ask(
      order('c3-04', 'hpa-axis', 'Order the HPA axis, from the brain to the hormone.', [
        'Hypothalamus releases CRF',
        'Anterior pituitary releases ACTH',
        'Adrenal cortex makes cortisol',
        'Cortisol inhibits CRF and ACTH release',
      ], { explanation: 'Slides 25–26.' })
    ),
    ask(
      mcq('c3-05', 'steroid-mechanism', 'How do steroid hormones mainly change a cell’s behaviour?', 'The hormone–receptor complex binds chromatin and switches on transcription', ['They raise cAMP', 'They open ion channels on the surface', 'They split PIP₂'], {
        explanation: 'Slide 23.',
      })
    ),
    recall('r3-01', 'adrenal-synthesis', 'Explain how the adrenal cortex makes cortisol and aldosterone from the same start.', [
      'Cholesterol (made in situ or from LDL) → pregnenolone: the rate-limiting step (ACTH; angiotensin in the glomerulosa).',
      'Pregnenolone → progesterone, common to both.',
      'Fasciculata/reticularis hydroxylate at 17, 21, 11 → cortisol; glomerulosa lacks 17-hydroxylase and hydroxylates at 21, 11, 18 → aldosterone.',
    ]),
  ],
};

export const readingExtras: Record<
  string,
  { highYield: string[]; confusions: LessonConfusion[]; estimatedMinutes: number; xp: number }
> = {
  'hormones-endocrine-biochemistry-1': {
    estimatedMinutes: 8,
    xp: 20,
    highYield: [
      'Ten endocrine glands; pancreas and gonads are both endocrine and exocrine; adipose tissue is an endocrine organ.',
      'Hormone: secreted by a ductless gland into ECF; acts only on cells with receptors.',
      'Response = hormone level × receptor number × affinity.',
    ],
    confusions: [
      { confusion: 'Only classic endocrine glands make hormones.', clarification: 'The gut, stomach, kidney and adipose tissue also make hormones (slide 8).' },
      { confusion: 'Every cell responds to every hormone in the blood.', clarification: 'Only target cells with specific receptors respond.' },
    ],
  },
  'hormones-endocrine-biochemistry-2': {
    estimatedMinutes: 10,
    xp: 25,
    highYield: [
      'Peptide hormones → G protein → second messengers; steroids → direct gene activation.',
      'cAMP: receptor + G protein (GTPase) + adenylate cyclase → protein kinase.',
      'PIP₂ → DAG (protein kinase) + IP₃ (Ca²⁺ from ER); Ca²⁺/calmodulin = third messenger.',
    ],
    confusions: [
      { confusion: 'cAMP is the first messenger.', clarification: 'The hormone is the first messenger; cAMP is the second.' },
      { confusion: 'IP₃ activates protein kinases directly.', clarification: 'DAG activates protein kinases; IP₃ releases Ca²⁺.' },
    ],
  },
  'hormones-endocrine-biochemistry-3': {
    estimatedMinutes: 10,
    xp: 25,
    highYield: [
      'All steroids come from cholesterol; rate-limiting step: cholesterol → pregnenolone.',
      'Cortisol: 17, 21, 11-hydroxylation (fasciculata/reticularis). Aldosterone: 21, 11, 18 (glomerulosa — no 17-hydroxylase).',
      'HPA axis: CRF → ACTH → cortisol, with negative feedback.',
    ],
    confusions: [
      { confusion: 'Cortisol is a mineralocorticoid.', clarification: 'Cortisol is the major glucocorticoid; aldosterone is the mineralocorticoid.' },
      { confusion: 'CRF acts directly on the adrenal cortex.', clarification: 'CRF acts on the anterior pituitary, whose ACTH stimulates the adrenal cortex.' },
    ],
  },
};
