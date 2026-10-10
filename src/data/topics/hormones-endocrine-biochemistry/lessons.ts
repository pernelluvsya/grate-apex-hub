// Biochemistry → Endocrine System: Hormones — the three lessons (reading
// layer). Source: Prof. FAY's lecture deck (29 slides) and its figures;
// Guyton (guy(...)) only settles points within that scope.
import type { LessonDraft } from '@/data/topics/build';
import { interactive, readingExtras } from '@/data/topics/hormones-endocrine-biochemistry/interactive';
import { guy, ref, type ConceptId } from '@/data/topics/hormones-endocrine-biochemistry/sources';

type Draft = LessonDraft<ConceptId>;

// ─── Lesson 1 ───────────────────────────────────────────────────────

const lesson1: Draft = {
  id: 'hormones-endocrine-biochemistry-1',
  title: 'The Endocrine System and Hormones',
  description: 'The endocrine glands, what a hormone is, why only target cells respond, and what hormones control.',
  xp: 20,
  sourceRefs: ref([2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
  objectives: [
    'Name the ten endocrine glands',
    'Define a hormone',
    'Name organs that make hormones without being classic endocrine glands',
    'Explain target-cell specificity and what decides the size of the response',
    'List the major processes hormones control',
  ],
  chunks: [
    {
      title: 'The endocrine glands',
      kind: 'overview',
      paragraphs: [
        'The endocrine system is the body’s controlling system alongside the CNS; it interacts with the CNS to coordinate and integrate the body’s activities (slide 8). The lecture counts ten endocrine glands (slide 5):',
      ],
      steps: [
        { label: 'Hypothalamus' },
        { label: 'Pituitary (anterior and posterior)' },
        { label: 'Pineal' },
        { label: 'Thyroid' },
        { label: 'Parathyroid' },
        { label: 'Thymus' },
        { label: 'Adrenals' },
        { label: 'Pancreas (islets)' },
        { label: 'Ovaries (females)' },
        { label: 'Testes (males)' },
      ],
      sourceRefs: ref([4, 5, 6, 7, 8]),
    },
    {
      title: 'What a hormone is',
      kind: 'definitions',
      paragraphs: [
        'A hormone is a chemical (organic) substance secreted by a ductless gland into the extracellular fluid, where it regulates the metabolic function of cells, tissues and organs (slide 8). The endocrine system has a rich vascular and lymphatic drainage.',
        'Some organs contain discrete areas of endocrine tissue and make both hormones and exocrine products — the pancreas and the gonads. Other tissues produce hormones though they are not endocrine glands, e.g. the small intestine, stomach and kidney (slide 8).',
        'Adipose tissue is considered an endocrine organ: it mediates effects on metabolism and inflammation, helps maintain energy homeostasis, and probably contributes to disease. Slide 4 points out that it is missing from the usual picture of the endocrine glands; white and brown adipose tissue (WAT and BAT) have different cellular functions and locations.',
      ],
      sourceRefs: ref([4, 8]),
    },
    {
      title: 'Target-cell specificity',
      kind: 'mechanism',
      paragraphs: [
        'Major hormones reach virtually all tissues, but each affects only its target cells — those with specific protein receptors for it. Receptors for ACTH, for example, are found on certain cells of the adrenal cortex, whereas thyroxine, the main stimulant of cellular metabolism, has receptors on nearly all body cells (slide 9).',
        'Hormone–receptor binding is the crucial first step. How strongly a target cell is activated depends equally on three factors (slide 10):',
      ],
      steps: [
        { label: 'Blood level of the hormone' },
        { label: 'Relative number of receptors' },
        { label: 'Affinity (strength) of the hormone–receptor complex' },
      ],
      sourceRefs: ref([9, 10]),
    },
    {
      title: 'What hormones control',
      kind: 'overview',
      paragraphs: ['Slide 11 lists the major processes hormones control and integrate:'],
      steps: [
        { label: 'Reproduction' },
        { label: 'Growth and development' },
        { label: 'Mobilising body defences against stressors' },
        { label: 'Maintaining electrolyte, water and nutrient balance' },
        { label: 'Regulating cellular metabolism and energy balance' },
      ],
      sourceRefs: ref([11]),
      notes: [{ kind: 'lecturer', text: 'Slide 11 asks you to “Give examples for each!!” — e.g. from the hormones in Lessons 2–3.' }],
    },
  ],
  summary: [
    'Ten endocrine glands: hypothalamus, pituitary, pineal, thyroid, parathyroid, thymus, adrenals, pancreatic islets, ovaries, testes.',
    'Hormone: an organic substance secreted by a ductless gland into the ECF, regulating metabolic function.',
    'Pancreas and gonads are mixed endocrine/exocrine; gut, stomach and kidney also make hormones; adipose tissue is an endocrine organ.',
    'Only cells with receptors respond (ACTH → adrenal cortex; thyroxine → nearly all cells). Response depends on hormone level, receptor number and affinity.',
    'Hormones control reproduction, growth, stress defences, electrolyte/water/nutrient balance and metabolism.',
  ],
};

// ─── Lesson 2 ───────────────────────────────────────────────────────

const lesson2: Draft = {
  id: 'hormones-endocrine-biochemistry-2',
  title: 'Hormone Classes and Second Messengers',
  description: 'The structural classes of hormones, what hormones do to cells, cAMP, and the DAG–IP₃–calcium system.',
  xp: 25,
  sourceRefs: ref([12, 13, 14, 15, 16, 17, 18, 19]),
  objectives: [
    'Classify hormones by structure',
    'List the changes a hormone can produce in a cell',
    'Contrast the two main mechanisms of hormone action',
    'Explain the cAMP second-messenger system',
    'Explain how DAG, IP₃ and calcium carry a signal',
  ],
  chunks: [
    {
      title: 'Structural categories',
      kind: 'classification',
      paragraphs: ['Slide 12:'],
      table: {
        columns: ['Category', 'Examples'],
        rows: [
          ['Proteins', 'Growth hormone, prolactin, insulin, parathyroid hormone'],
          ['Glycoproteins', 'FSH, LH, TSH'],
          ['Polypeptides', 'Oxytocin, antidiuretic hormone, calcitonin, glucagon'],
          ['Amino acid derivatives', 'Epinephrine, norepinephrine, thyroxine, tri-iodothyronine'],
          ['Lipid / fatty acid derivatives', 'Estrogen, progestins, testosterone, cortisol, aldosterone, leukotrienes, thromboxanes'],
        ],
      },
      sourceRefs: ref([12]),
    },
    {
      title: 'What a hormone does',
      kind: 'mechanism',
      paragraphs: ['A hormonal stimulus typically produces one or more of these changes (slide 13):'],
      steps: [
        { label: 'Changes in membrane permeability or electrical state', detail: 'By opening or closing ion channels.' },
        { label: 'Synthesis of proteins or regulatory molecules (e.g. enzymes)' },
        { label: 'Enzyme activation or deactivation' },
        { label: 'Induction of secretory activity' },
        { label: 'Stimulation of mitosis' },
      ],
      keyPoints: ['Two main mechanisms (slide 14): peptide hormones use G proteins and second messengers; lipid-soluble (steroid) hormones activate genes directly.'],
      sourceRefs: ref([13, 14]),
    },
    {
      title: 'cAMP as second messenger',
      kind: 'pathway',
      paragraphs: [
        'Three membrane components set the cell’s cAMP level: the hormone receptor, the signal transducer (a G protein) and the effector enzyme (adenylate cyclase) (slide 16).',
        'The hormone — the first messenger — binds its receptor. The G protein relays the signal to adenylate cyclase, which makes cAMP from ATP. The energy comes from GTP hydrolysis: the G protein has GTPase activity, cleaving GTP’s terminal phosphate much as an ATPase cleaves ATP (slides 15–16).',
        'cAMP activates protein kinases; phosphorylation of proteins then triggers the cell’s responses — enzyme activation, secretion, permeability changes, gene activation (slides 15, 17). Inhibitory G proteins can also inhibit adenylate cyclase (slide 17).',
      ],
      steps: [
        { label: 'Hormone binds receptor', detail: 'First messenger.' },
        { label: 'G protein (GTP → GDP + Pi) activates adenylate cyclase' },
        { label: 'ATP → cAMP', detail: 'Second messenger.' },
        { label: 'cAMP activates protein kinase' },
        { label: 'Protein phosphorylation → cell response' },
      ],
      keyPoints: ['cAMP hormones (slides 15, 17): ACTH, FSH, LH, PTH, TSH, catecholamines, calcitonin, glucagon.'],
      sourceRefs: ref([15, 16, 17]),
    },
    {
      title: 'DAG, IP₃ and calcium',
      kind: 'pathway',
      paragraphs: [
        'Here the hormone–receptor binding activates a membrane phospholipase that splits PIP₂ (phosphatidylinositol bisphosphate) into diacylglycerol (DAG) and IP₃ (inositol trisphosphate) — both second messengers (slide 18).',
        'DAG activates specific protein kinases; IP₃ releases Ca²⁺ from the endoplasmic reticulum and other stores. Ca²⁺ then acts as a third messenger — directly altering enzymes and ion channels, or by binding the regulatory protein calmodulin (slides 18–19).',
      ],
      steps: [
        { label: 'Hormone → receptor → G protein → phospholipase' },
        { label: 'PIP₂ → DAG + IP₃' },
        { label: 'DAG → protein kinase' },
        { label: 'IP₃ → Ca²⁺ released from the ER', detail: 'Ca²⁺ (and Ca²⁺–calmodulin) = third messenger.' },
      ],
      keyPoints: ['Examples on slide 19: catecholamines, TRH, ADH, LHRH, oxytocin.'],
      sourceRefs: ref([18, 19]),
    },
  ],
  summary: [
    'Classes: proteins (GH, prolactin, insulin, PTH); glycoproteins (FSH, LH, TSH); polypeptides (oxytocin, ADH, calcitonin, glucagon); amino acid derivatives (epinephrine, norepinephrine, T₄, T₃); lipid derivatives (steroids, leukotrienes, thromboxanes).',
    'Effects: ion channels, protein synthesis, enzyme (de)activation, secretion, mitosis.',
    'Peptide hormones → G protein → second messenger; steroids → direct gene activation.',
    'cAMP: receptor + G protein (GTPase) + adenylate cyclase; cAMP → protein kinase → phosphorylation.',
    'PIP₂ → DAG (protein kinase) + IP₃ (Ca²⁺ from ER); Ca²⁺/calmodulin is the third messenger.',
  ],
};

// ─── Lesson 3 ───────────────────────────────────────────────────────

const lesson3: Draft = {
  id: 'hormones-endocrine-biochemistry-3',
  title: 'Steroid Hormones',
  description: 'Classes of steroid hormones, adrenal steroid synthesis, how steroids act, and the HPA axis.',
  xp: 25,
  sourceRefs: [...ref([20, 21, 22, 23, 24, 25, 26, 27]), ...guy(955, 956)],
  objectives: [
    'Name the classes of steroid hormones and what they do',
    'Describe the adrenal steroid pathway and its rate-limiting step',
    'Explain why cortisol and aldosterone are made in different zones',
    'Describe how steroid hormones change gene expression',
    'Describe the feedback control of cortisol',
  ],
  chunks: [
    {
      title: 'Steroid hormones',
      kind: 'classification',
      paragraphs: [
        'All steroid hormones are derived from cholesterol and are lipid-soluble. There are two functional classes (slide 20):',
      ],
      table: {
        columns: ['Class', 'Made mainly in', 'Examples and roles'],
        rows: [
          ['Sex hormones', 'Gonads', 'Androgens, estrogens, progestins — sexual differentiation and function'],
          ['Mineralocorticoids', 'Adrenal cortex', 'Aldosterone — Na⁺/K⁺ balance in the ECF'],
          ['Glucocorticoids', 'Adrenal cortex', 'Cortisol (the major one in humans) — protein breakdown, gluconeogenesis, glycogen synthesis; anti-inflammatory'],
        ],
      },
      keyPoints: [
        'Mineralocorticoid deficiency → hyperkalaemia (less K⁺ excreted by the kidney) and hyponatraemia (less Na⁺ reabsorbed) (slide 20).',
        'Steroids are inactivated mainly in the liver and excreted in urine as methyl, sulphate and/or glucuronide conjugates (slide 20).',
      ],
      sourceRefs: [...ref([20, 25]), ...guy(955)],
      notes: [{ kind: 'clarified', text: 'Slide 20 gives cortisol as an example of a mineralocorticoid. The lecture’s own slides 21 and 25 treat cortisol as the major glucocorticoid made in the zona fasciculata, and Guyton agrees (cortisol from the zona fasciculata/reticularis; aldosterone, the mineralocorticoid, from the zona glomerulosa, p. 955).' }],
    },
    {
      title: 'Making adrenal steroids',
      kind: 'pathway',
      paragraphs: [
        'Adrenal steroid synthesis begins with cholesterol — made in the adrenal itself from acetate, or made in the liver and delivered by LDL (slide 21).',
        'The rate-limiting step for all steroids is cholesterol → pregnenolone. It is stimulated by ACTH in the zona fasciculata and reticularis, and by angiotensin in the zona glomerulosa (slide 21; see note).',
        'The pathway to progesterone is shared by aldosterone and cortisol. In the zona fasciculata and reticularis, progesterone is hydroxylated at positions 17, 21 and 11 to form cortisol (10–30 mg a day). The zona glomerulosa has no 17-hydroxylase, so it hydroxylates at 21, 11 and 18 instead — making aldosterone (slides 21–22).',
      ],
      steps: [
        { label: 'Acetyl-CoA → cholesterol' },
        { label: 'Cholesterol → pregnenolone', detail: 'Rate-limiting.' },
        { label: 'Pregnenolone → progesterone', detail: 'Common to cortisol and aldosterone.' },
        { label: 'Fasciculata/reticularis: 17-, 21-, 11-hydroxylation → cortisol' },
        { label: 'Glomerulosa: 21-, 11-, 18-hydroxylation → aldosterone', detail: 'No 17-hydroxylase.' },
      ],
      sourceRefs: [...ref([21, 22]), ...guy(955, 956)],
      notes: [
        { kind: 'textbook', text: 'Guyton: cholesterol is cleaved in the mitochondria by cholesterol desmolase to pregnenolone — the rate-limiting step; both ACTH and the angiotensin that stimulates aldosterone secretion increase it (p. 956).' },
        { kind: 'check', text: 'Slide 21 says angiotensin III stimulates the zona glomerulosa; Guyton names angiotensin II (p. 956). Confirm with your lecturer — not quizzed.' },
      ],
    },
    {
      title: 'How steroid hormones act',
      kind: 'mechanism',
      paragraphs: [
        'Steroids are small hydrophobic molecules, so they cross the cell membrane by simple diffusion. Some bind receptors in the cytoplasm and then move into the nucleus; others diffuse straight into the nucleus and bind an acceptor molecule (slide 23).',
        'The activated hormone–receptor complex binds specific sites on the chromatin, starting transcription of certain genes. The mRNA moves to the cytoplasm and directs synthesis of specific proteins (slides 23–24).',
      ],
      steps: [
        { label: 'Steroid diffuses across the membrane' },
        { label: 'Binds its receptor (cytoplasm or nucleus)' },
        { label: 'Hormone–receptor complex binds chromatin (acceptor)' },
        { label: 'Transcription → mRNA → new protein' },
      ],
      sourceRefs: ref([23, 24, 27]),
    },
    {
      title: 'Feedback control: the HPA axis',
      kind: 'regulation',
      paragraphs: [
        'Blood glucocorticoid levels are controlled by feedback between the hypothalamus, the pituitary and the adrenal cortex (slides 25–26). When cortisol falls, the hypothalamus secretes CRF, which stimulates the anterior pituitary to release ACTH, which stimulates the adrenal cortex to make cortisol (and corticosterone).',
        'As cortisol rises it acts on receptors in the hypothalamus and pituitary, inhibiting CRF and ACTH production. ACTH also feeds back to inhibit CRF release (slides 25–26).',
      ],
      steps: [
        { label: 'Hypothalamus → CRF (+)' },
        { label: 'Anterior pituitary → ACTH (+)' },
        { label: 'Adrenal cortex → cortisol' },
        { label: 'Cortisol (−) on hypothalamus and pituitary; ACTH (−) on hypothalamus' },
      ],
      sourceRefs: ref([25, 26]),
      notes: [{ kind: 'clarified', text: 'Slide 25’s text says CRF stimulates the adrenal cortex; the lecture’s own diagram (slide 26) shows CRF acting on the anterior pituitary, whose ACTH stimulates the adrenal cortex.' }],
    },
  ],
  summary: [
    'Steroids come from cholesterol: sex hormones (gonads) and corticosteroids (adrenal cortex — mineralocorticoids such as aldosterone; glucocorticoids such as cortisol).',
    'Mineralocorticoid deficiency → hyperkalaemia and hyponatraemia. Liver inactivates steroids → urinary conjugates.',
    'Rate-limiting: cholesterol → pregnenolone (ACTH; angiotensin in the glomerulosa). Progesterone is common to cortisol (17, 21, 11-hydroxylation) and aldosterone (21, 11, 18 — no 17-hydroxylase in glomerulosa).',
    'Steroids diffuse into cells, bind receptors, and the complex binds chromatin → transcription → new proteins.',
    'HPA axis: CRF → ACTH → cortisol; cortisol inhibits CRF and ACTH; ACTH inhibits CRF.',
  ],
};

export const lessons: Draft[] = [lesson1, lesson2, lesson3].map((lesson) => ({
  ...lesson,
  ...readingExtras[lesson.id],
  interactive: interactive[lesson.id],
}));
