// Biochemistry → Endocrine System: Hormones — the topic question bank.
//
// Rules: only what the lessons teach (Prof. FAY's deck, its figures, and
// labelled Guyton points). Not asked: which angiotensin stimulates the zona
// glomerulosa (sources differ). Options are shuffled at quiz time.
// IDs: qN-xx, N = lesson.
import { fill, match, mcq, multi, order, tf, type QuestionDraft } from '@/data/topics/build';
import type { ConceptId } from '@/data/topics/hormones-endocrine-biochemistry/sources';

type Q = QuestionDraft<ConceptId>;

// ─── Lesson 1 — The endocrine system ────────────────────────────────
const lesson1: Q[] = [
  mcq('q1-01', 'endocrine-glands', 'How many endocrine glands does the lecture list?', 'Ten', ['Six', 'Eight', 'Twelve'], {
    explanation: 'Slide 5.',
  }),
  multi('q1-02', 'endocrine-glands', 'Which of these are endocrine glands in the lecture’s list? Select all that apply.', ['Adrenals', 'Thyroid', 'Pancreas (islets)', 'Testes'], ['Gall bladder', 'Salivary gland'], {
    explanation: 'Slide 5.',
  }),
  tf({
    id: 'q1-03', conceptId: 'endocrine-glands',
    statement: 'The lecture lists the thymus as an endocrine gland.',
    answer: true,
    explanation: 'Slide 5.',
  }),
  mcq('q1-04', 'endocrine-glands', 'Which tissue does slide 4 point out as missing from the usual picture of endocrine glands?', 'Adipose tissue', ['Bone marrow', 'Skeletal muscle', 'Skin'], {
    explanation: 'Slide 4: adipose tissue — white and brown adipose tissue have different cellular functions and locations.',
  }),
  mcq('q1-05', 'endocrine-glands', 'Which two parts of the pituitary does the lecture name?', 'Anterior and posterior', ['Upper and lower', 'Cortex and medulla', 'Left and right'], {
    explanation: 'Slide 5.',
  }),
  mcq('q1-06', 'hormone-definition', 'Which definition of a hormone matches the lecture?', 'An organic substance secreted by a ductless gland into the ECF that regulates metabolic function', ['A protein secreted through a duct onto an epithelial surface', 'A neurotransmitter released at a synapse', 'Any molecule found in blood'], {
    explanation: 'Slide 8.',
    skill: 'terminology',
  }),
  multi('q1-07', 'hormone-definition', 'Which organs make both hormones and exocrine products (slide 8)? Select all that apply.', ['Pancreas', 'Gonads'], ['Thyroid', 'Pineal'], {
    explanation: 'Slide 8.',
  }),
  multi('q1-08', 'hormone-definition', 'Which organs produce hormones even though they are not technically endocrine glands (slide 8)? Select all that apply.', ['Small intestine', 'Stomach', 'Kidney'], ['Hypothalamus', 'Thyroid'], {
    explanation: 'Slide 8.',
  }),
  tf({
    id: 'q1-09', conceptId: 'hormone-definition',
    statement: 'Adipose tissue is considered an endocrine organ that influences metabolism and inflammation.',
    answer: true,
    explanation: 'Slide 8.',
  }),
  mcq('q1-10', 'hormone-definition', 'How does the endocrine system relate to the CNS (slide 8)?', 'It is the body’s other controlling system and works with the CNS to coordinate the body', ['It replaces the CNS', 'It is part of the CNS', 'It works independently of the CNS'], {
    explanation: 'Slide 8.',
  }),
  tf({
    id: 'q1-11', conceptId: 'hormone-definition',
    statement: 'Endocrine glands release their hormones through ducts.',
    answer: false,
    explanation: 'Slide 8: hormones are secreted by ductless glands into the extracellular fluid.',
    skill: 'misconception',
  }),
  mcq('q1-12', 'target-specificity', 'What makes a cell a target for a hormone?', 'It has specific protein receptors for that hormone', ['It is near the gland', 'It has a nucleus', 'It is in the bloodstream'], {
    explanation: 'Slide 9.',
  }),
  mcq('q1-13', 'target-specificity', 'Where are ACTH receptors normally found (slide 9)?', 'On certain cells of the adrenal cortex', ['On nearly all body cells', 'On red blood cells', 'In the thyroid only'], {
    explanation: 'Slide 9.',
  }),
  mcq('q1-14', 'target-specificity', 'Why do nearly all cells respond to thyroxine?', 'Nearly all cells have thyroxine receptors', ['Thyroxine needs no receptor', 'Thyroxine is made in every cell', 'Thyroxine is a second messenger'], {
    explanation: 'Slide 9: thyroxine is the principal hormonal stimulant of cellular metabolism, and nearly all cells have its receptors.',
  }),
  fill('q1-15', 'target-specificity', 'Hormone–receptor ____ is the crucial first step in hormonal reactions.', ['binding'], {
    explanation: 'Slide 10.',
  }),
  multi('q1-16', 'target-specificity', 'Which factors decide how strongly a target cell is activated? Select all that apply.', ['Blood level of the hormone', 'Relative number of receptors', 'Affinity of the hormone–receptor complex'], ['Distance from the heart'], {
    explanation: 'Slide 10.',
  }),
  mcq('q1-17', 'target-specificity', 'A cell doubles its number of receptors for a hormone while the blood level stays the same. What would you expect?', 'A stronger response', ['No change at all', 'A weaker response', 'The hormone stops working'], {
    explanation: 'Slide 10: the relative number of receptors is one of three equal factors in activation.',
    skill: 'prediction',
  }),
  tf({
    id: 'q1-18', conceptId: 'target-specificity',
    statement: 'Most major hormones circulate to virtually all tissues.',
    answer: true,
    explanation: 'Slide 9 — yet only target cells respond.',
  }),
  multi('q1-19', 'hormone-functions', 'Which major processes do hormones control (slide 11)? Select all that apply.', ['Reproduction', 'Growth and development', 'Mobilising defences against stressors', 'Electrolyte, water and nutrient balance'], ['Conscious thought'], {
    explanation: 'Slide 11 (plus regulation of cellular metabolism and energy balance).',
  }),
  mcq('q1-20', 'hormone-functions', 'Which hormone fits “regulation of cellular metabolism”, from slide 9?', 'Thyroxine', ['Oxytocin', 'Calcitonin', 'FSH'], {
    explanation: 'Slide 9: thyroxine is the principal hormonal stimulant of cellular metabolism.',
    skill: 'application',
  }),
  mcq('q1-21', 'hormone-functions', 'Which hormone fits “electrolyte balance”, from slide 20?', 'Aldosterone', ['Insulin', 'Prolactin', 'TSH'], {
    explanation: 'Slide 20: mineralocorticoids such as aldosterone regulate Na⁺ and K⁺ in the ECF.',
    skill: 'application',
  }),
  tf({
    id: 'q1-22', conceptId: 'hormone-functions',
    statement: 'Regulating cellular metabolism and energy balance is one of the major processes hormones control.',
    answer: true,
    explanation: 'Slide 11.',
  }),
  mcq('q1-23', 'endocrine-glands', 'Which gland is listed only for females?', 'Ovaries', ['Thymus', 'Pineal', 'Adrenals'], {
    explanation: 'Slide 5: ovaries (females), testes (males).',
  }),
  mcq('q1-24', 'hormone-definition', 'What kind of drainage does the endocrine system have (slide 8)?', 'A rich vascular and lymphatic drainage', ['Ducts opening onto the skin', 'Drainage into the gut', 'None'], {
    explanation: 'Slide 8.',
  }),
  mcq('q1-25', 'target-specificity', 'A drug lowers a hormone receptor’s affinity for its hormone. What happens to the response?', 'It weakens', ['It strengthens', 'Nothing', 'The hormone becomes a second messenger'], {
    explanation: 'Slide 10: affinity of the complex is one of the three factors.',
    skill: 'prediction',
  }),
];

// ─── Lesson 2 — Classes and second messengers ───────────────────────
const lesson2: Q[] = [
  mcq('q2-01', 'structural-categories', 'Which category does insulin belong to?', 'Protein', ['Glycoprotein', 'Amino acid derivative', 'Lipid derivative'], {
    explanation: 'Slide 12.',
  }),
  multi('q2-02', 'structural-categories', 'Which are glycoprotein hormones? Select all that apply.', ['FSH', 'LH', 'TSH'], ['Insulin', 'Cortisol'], {
    explanation: 'Slide 12.',
  }),
  multi('q2-03', 'structural-categories', 'Which are amino acid derivatives? Select all that apply.', ['Epinephrine', 'Norepinephrine', 'Thyroxine'], ['Glucagon', 'Aldosterone'], {
    explanation: 'Slide 12.',
  }),
  mcq('q2-04', 'structural-categories', 'Which category includes oxytocin, ADH, calcitonin and glucagon?', 'Polypeptides', ['Glycoproteins', 'Lipid derivatives', 'Amino acid derivatives'], {
    explanation: 'Slide 12.',
  }),
  multi('q2-05', 'structural-categories', 'Which are lipid / fatty acid derivatives? Select all that apply.', ['Testosterone', 'Cortisol', 'Thromboxanes'], ['Prolactin', 'TSH'], {
    explanation: 'Slide 12.',
  }),
  match('q2-06', 'structural-categories', 'Match each hormone to its category.', [
    ['Growth hormone', 'Protein'],
    ['LH', 'Glycoprotein'],
    ['Calcitonin', 'Polypeptide'],
    ['Tri-iodothyronine', 'Amino acid derivative'],
  ], { explanation: 'Slide 12.' }),
  multi('q2-07', 'hormone-effects', 'Which changes can a hormonal stimulus produce (slide 13)? Select all that apply.', ['Opening or closing ion channels', 'Synthesis of proteins such as enzymes', 'Enzyme activation or deactivation', 'Stimulation of mitosis'], ['Changing the cell’s DNA sequence'], {
    explanation: 'Slide 13 (also induction of secretory activity).',
  }),
  mcq('q2-08', 'hormone-effects', 'Which mechanism do peptide hormones use?', 'G proteins and second messengers', ['Direct gene activation inside the nucleus', 'Diffusion through the membrane', 'Covalent binding to DNA'], {
    explanation: 'Slide 14.',
  }),
  mcq('q2-09', 'hormone-effects', 'Which mechanism do lipid-soluble (steroid) hormones use?', 'Direct gene activation', ['cAMP', 'IP₃ and DAG', 'Opening surface ion channels only'], {
    explanation: 'Slide 14.',
  }),
  multi('q2-10', 'camp-pathway', 'Which three membrane components set the cell’s cAMP level (slide 16)? Select all that apply.', ['The hormone receptor', 'The G protein (signal transducer)', 'Adenylate cyclase (effector enzyme)'], ['Calmodulin', 'Phospholipase C'], {
    explanation: 'Slide 16.',
  }),
  mcq('q2-11', 'camp-pathway', 'Which enzyme makes cAMP?', 'Adenylate cyclase', ['Protein kinase', 'Phospholipase', 'GTPase'], {
    explanation: 'Slides 15–17.',
  }),
  mcq('q2-12', 'camp-pathway', 'What is cAMP made from?', 'ATP', ['GTP', 'PIP₂', 'cholesterol'], {
    explanation: 'Slide 16.',
  }),
  mcq('q2-13', 'camp-pathway', 'Where does the energy for converting the first message into cAMP come from (slide 16)?', 'Hydrolysis of GTP by the G protein', ['Hydrolysis of cAMP', 'Oxidation of glucose in the receptor', 'Calcium binding'], {
    explanation: 'Slide 16: the G protein has GTPase activity.',
    difficulty: 'intermediate',
  }),
  mcq('q2-14', 'camp-pathway', 'What does cAMP activate?', 'Protein kinases', ['Adenylate cyclase', 'Phospholipase', 'The receptor'], {
    explanation: 'Slide 15.',
  }),
  multi('q2-15', 'camp-pathway', 'Which hormones act through cAMP (slides 15, 17)? Select all that apply.', ['ACTH', 'TSH', 'Glucagon', 'Calcitonin'], ['Cortisol', 'Estrogen'], {
    explanation: 'Slides 15 and 17. Steroids act on genes directly.',
  }),
  tf({
    id: 'q2-16', conceptId: 'camp-pathway',
    statement: 'In the cAMP system, the hormone is the first messenger and cAMP the second.',
    answer: true,
    explanation: 'Slide 16.',
  }),
  mcq('q2-17', 'camp-pathway', 'What can an inhibitory G protein do (slide 17)?', 'Inhibit adenylate cyclase', ['Activate DAG', 'Release calcium', 'Bind DNA'], {
    explanation: 'Slide 17.',
    difficulty: 'intermediate',
  }),
  multi('q2-18', 'camp-pathway', 'Which responses can protein phosphorylation trigger (slides 15, 17)? Select all that apply.', ['Enzyme activation', 'Cellular secretion', 'Membrane permeability changes', 'Gene activation'], ['Cell death in all cases'], {
    explanation: 'Slides 15 and 17.',
  }),
  mcq('q2-19', 'ip3-dag-calcium', 'Which molecule does the phospholipase split?', 'PIP₂ (phosphatidylinositol bisphosphate)', ['ATP', 'cAMP', 'Cholesterol'], {
    explanation: 'Slide 18.',
  }),
  multi('q2-20', 'ip3-dag-calcium', 'Which second messengers come from PIP₂? Select all that apply.', ['DAG', 'IP₃'], ['cAMP', 'Calmodulin'], {
    explanation: 'Slide 18.',
  }),
  mcq('q2-21', 'ip3-dag-calcium', 'What does DAG activate?', 'Specific protein kinases', ['Adenylate cyclase', 'Ca²⁺ release channels on the ER', 'Transcription directly'], {
    explanation: 'Slide 18.',
  }),
  mcq('q2-22', 'ip3-dag-calcium', 'In this system, what is the third messenger?', 'Calcium ions', ['IP₃', 'DAG', 'GTP'], {
    explanation: 'Slide 18.',
  }),
  multi('q2-23', 'ip3-dag-calcium', 'Which hormones use the PIP₂–calcium system (slide 19)? Select all that apply.', ['TRH', 'ADH', 'Oxytocin'], ['TSH', 'Aldosterone'], {
    explanation: 'Slide 19 (also catecholamines and LHRH).',
    difficulty: 'intermediate',
  }),
  order('q2-24', 'ip3-dag-calcium', 'Order the PIP₂–calcium pathway.', [
    'Hormone binds its receptor',
    'Phospholipase splits PIP₂ into DAG and IP₃',
    'IP₃ releases Ca²⁺ from the ER',
    'Ca²⁺ binds calmodulin and alters enzymes',
  ], { explanation: 'Slides 18–19.' }),
  tf({
    id: 'q2-25', conceptId: 'ip3-dag-calcium',
    statement: 'Calcium can act directly on enzymes and ion channels, or by binding calmodulin.',
    answer: true,
    explanation: 'Slide 18.',
  }),
  mcq('q2-26', 'hormone-effects', 'Catecholamines appear on both slide 17 and slide 19. What does that suggest?', 'They can act through both cAMP and the PIP₂–calcium system', ['They are steroids', 'They need no receptor', 'They act only on the nucleus'], {
    explanation: 'Slides 17 and 19 list catecholamines for both second-messenger systems.',
    skill: 'pathway-reasoning',
    difficulty: 'advanced',
  }),
];

// ─── Lesson 3 — Steroid hormones ────────────────────────────────────
const lesson3: Q[] = [
  mcq('q3-01', 'steroid-classes', 'Where are sex hormones mainly made?', 'The gonads', ['The adrenal medulla', 'The liver', 'The pituitary'], {
    explanation: 'Slide 20.',
  }),
  mcq('q3-02', 'steroid-classes', 'Where are corticosteroids mainly made?', 'The adrenal cortex', ['The gonads', 'The thyroid', 'The hypothalamus'], {
    explanation: 'Slide 20.',
  }),
  mcq('q3-03', 'steroid-classes', 'What is the major glucocorticoid in humans?', 'Cortisol', ['Aldosterone', 'Testosterone', 'Corticosterone'], {
    explanation: 'Slide 25.',
  }),
  multi('q3-04', 'steroid-classes', 'What do glucocorticoids do (slide 20)? Select all that apply.', ['Promote protein degradation', 'Promote gluconeogenesis', 'Promote glycogen synthesis', 'Have anti-inflammatory properties'], ['Regulate Na⁺/K⁺ balance (their main role)'], {
    explanation: 'Slide 20. Na⁺/K⁺ balance is the mineralocorticoids’ role.',
  }),
  mcq('q3-05', 'steroid-classes', 'What do mineralocorticoids regulate?', 'The balance of sodium and potassium in the ECF', ['Blood glucose', 'Sexual differentiation', 'Metabolic rate'], {
    explanation: 'Slide 20.',
  }),
  match('q3-06', 'steroid-classes', 'Match each hormone to its class.', [
    ['Aldosterone', 'Mineralocorticoid'],
    ['Cortisol', 'Glucocorticoid'],
    ['Testosterone', 'Sex hormone'],
  ], { explanation: 'Slides 20, 21 and 25.' }),
  mcq('q3-07', 'steroid-classes', 'Where are steroid hormones mainly inactivated?', 'The liver', ['The kidney', 'The adrenal cortex', 'The lungs'], {
    explanation: 'Slide 20.',
  }),
  multi('q3-08', 'steroid-classes', 'In which forms are inactivated steroids excreted in urine? Select all that apply.', ['Methyl conjugates', 'Sulphate conjugates', 'Glucuronide conjugates'], ['Free cholesterol'], {
    explanation: 'Slide 20.',
    difficulty: 'intermediate',
  }),
  mcq('q3-09', 'adrenal-synthesis', 'What is the rate-limiting step in the synthesis of all steroids?', 'Cholesterol → pregnenolone', ['Progesterone → cortisol', 'Acetyl-CoA → cholesterol', 'Corticosterone → aldosterone'], {
    explanation: 'Slide 21; Guyton p. 956.',
  }),
  mcq('q3-10', 'adrenal-synthesis', 'Which hormone stimulates the rate-limiting step in the zona fasciculata and reticularis?', 'ACTH', ['CRF', 'TSH', 'Insulin'], {
    explanation: 'Slide 21.',
  }),
  multi('q3-11', 'adrenal-synthesis', 'Where can adrenal cholesterol come from (slide 21)? Select all that apply.', ['Synthesis in the adrenal from acetate', 'Liver cholesterol delivered by LDL'], ['Bile acids', 'Dietary steroid hormones'], {
    explanation: 'Slide 21.',
  }),
  mcq('q3-12', 'adrenal-synthesis', 'Which intermediate is common to aldosterone and cortisol synthesis?', 'Progesterone', ['Testosterone', 'Estrone', 'Dehydroepiandrosterone'], {
    explanation: 'Slide 21.',
  }),
  mcq('q3-13', 'adrenal-synthesis', 'At which positions is progesterone hydroxylated to make cortisol?', '17, 21 and 11', ['21, 11 and 18', '3 and 17', '1, 2 and 3'], {
    explanation: 'Slide 21.',
    difficulty: 'intermediate',
  }),
  mcq('q3-14', 'adrenal-synthesis', 'At which positions does the zona glomerulosa hydroxylate instead?', '21, 11 and 18', ['17, 21 and 11', '17 only', '3 and 5'], {
    explanation: 'Slide 21.',
    difficulty: 'intermediate',
  }),
  mcq('q3-15', 'adrenal-synthesis', 'About how much cortisol is made each day?', '10–30 mg', ['1–3 µg', '1–3 g', '100–300 mg'], {
    explanation: 'Slide 21.',
    difficulty: 'intermediate',
  }),
  order('q3-16', 'adrenal-synthesis', 'Order the pathway to aldosterone (slide 22).', [
    'Cholesterol',
    'Pregnenolone',
    'Progesterone',
    '11-Deoxycorticosterone',
    'Corticosterone',
    'Aldosterone',
  ], { explanation: 'Slide 22.' }),
  order('q3-17', 'adrenal-synthesis', 'Order the pathway to cortisol (slide 22).', [
    'Progesterone',
    '17-Hydroxyprogesterone',
    '11-Deoxycortisol',
    'Cortisol',
  ], { explanation: 'Slide 22.' }),
  mcq('q3-18', 'adrenal-synthesis', 'Guyton: in which organelle is cholesterol cleaved to pregnenolone?', 'Mitochondria', ['Nucleus', 'Lysosome', 'Golgi'], {
    explanation: 'Guyton (p. 956): cholesterol desmolase in the mitochondria.',
    difficulty: 'intermediate',
  }),
  mcq('q3-19', 'steroid-mechanism', 'How do steroid hormones cross the cell membrane?', 'By simple diffusion — they are small and hydrophobic', ['Through a specific channel', 'By binding a surface G protein', 'By endocytosis only'], {
    explanation: 'Slide 23.',
  }),
  order('q3-20', 'steroid-mechanism', 'Order how a steroid hormone changes a cell.', [
    'The hormone diffuses into the cell',
    'It binds its receptor',
    'The complex binds chromatin',
    'Genes are transcribed into mRNA',
    'mRNA directs synthesis of new protein',
  ], { explanation: 'Slides 23–24.' }),
  tf({
    id: 'q3-21', conceptId: 'steroid-mechanism',
    statement: 'Some steroid hormones bind receptors in the cytoplasm and then move into the nucleus.',
    answer: true,
    explanation: 'Slide 23.',
  }),
  mcq('q3-22', 'hpa-axis', 'Which hypothalamic hormone starts the glucocorticoid axis?', 'CRF', ['TRH', 'GnRH', 'ADH'], {
    explanation: 'Slides 25–26.',
  }),
  mcq('q3-23', 'hpa-axis', 'Which pituitary hormone stimulates the adrenal cortex?', 'ACTH', ['TSH', 'LH', 'Prolactin'], {
    explanation: 'Slide 26.',
  }),
  multi('q3-24', 'hpa-axis', 'What does rising cortisol inhibit (slide 25)? Select all that apply.', ['CRF release from the hypothalamus', 'ACTH release from the pituitary'], ['Aldosterone release', 'Insulin release'], {
    explanation: 'Slide 25.',
  }),
  tf({
    id: 'q3-25', conceptId: 'hpa-axis',
    statement: 'ACTH also feeds back to inhibit CRF release from the hypothalamus.',
    answer: true,
    explanation: 'Slides 25–26.',
  }),
  mcq('q3-26', 'hpa-axis', 'Blood cortisol falls. What happens first?', 'The hypothalamus secretes more CRF', ['The adrenal cortex stops making cortisol', 'ACTH release stops', 'The liver makes cortisol'], {
    explanation: 'Slide 25.',
    skill: 'prediction',
  }),
];

export const questions: Q[] = [...lesson1, ...lesson2, ...lesson3];
