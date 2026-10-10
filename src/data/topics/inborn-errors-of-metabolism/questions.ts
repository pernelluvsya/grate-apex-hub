// Biochemistry → Inborn Errors of Metabolism — the topic question bank.
//
// Rules: only what the lessons teach (S. N. Darko's lecture, its figures,
// and labelled Lehninger points). Not asked: who coined “one gene–one
// enzyme”, or the glucose-6-phosphatase item on the UK screening list
// (see discrepancies). Options are shuffled at quiz time. IDs: qN-xx,
// N = lesson.
import { fill, match, mcq, multi, order, tf, type QuestionDraft } from '@/data/topics/build';
import type { ConceptId } from '@/data/topics/inborn-errors-of-metabolism/sources';

type Q = QuestionDraft<ConceptId>;

// ─── Lesson 1 — What inborn errors are ──────────────────────────────
const lesson1: Q[] = [
  mcq('q1-01', 'garrod-hypothesis', 'When did Garrod study alkaptonuria and propose his hypothesis?', 'In the early 1900s', ['In the 1850s', 'In the 1950s', 'In the 1990s'], {
    explanation: 'Page 3.',
  }),
  mcq('q1-02', 'garrod-hypothesis', 'What did Garrod propose causes an “inborn error in metabolism”?', 'A defective enzyme', ['A vitamin deficiency', 'An infection in infancy', 'A toxin in the diet'], {
    explanation: 'Page 3.',
  }),
  mcq('q1-03', 'garrod-hypothesis', 'Which condition did Garrod study?', 'Alkaptonuria', ['Phenylketonuria', 'Gout', 'Galactosaemia'], {
    explanation: 'Page 3; Lehninger p. 681.',
  }),
  mcq('q1-04', 'garrod-hypothesis', 'In Garrod’s figure (A → B → C, with B → C blocked), which compound shows “product deficiency”?', 'C', ['A', 'B', 'D'], {
    explanation: 'Page 3: C is the product the blocked step can no longer make.',
  }),
  mcq('q1-05', 'garrod-hypothesis', 'In Garrod’s figure, what is D?', 'A toxic metabolite made from B by another route', ['The normal end product', 'The defective enzyme', 'A vitamin cofactor'], {
    explanation: 'Page 3.',
  }),
  match('q1-06', 'garrod-hypothesis', 'Match each compound in Garrod’s figure to its label.', [
    ['B', 'Substrate excess'],
    ['C', 'Product deficiency'],
    ['D', 'Toxic metabolite'],
  ], { explanation: 'Page 3.' }),
  tf({
    id: 'q1-07', conceptId: 'garrod-hypothesis',
    statement: 'Garrod linked an inherited condition to the absence of a single enzyme.',
    answer: true,
    explanation: 'Page 3; Lehninger p. 681: Garrod was the first to connect an inheritable trait with an enzyme.',
  }),
  mcq('q1-08', 'age-of-onset', 'Which inborn error does the lecture give as one that manifests early in life?', 'Phenylketonuria', ['Gout', 'Glucose-6-phosphate dehydrogenase deficiency'], {
    explanation: 'Page 4.',
  }),
  mcq('q1-09', 'age-of-onset', 'Which inborn error does the lecture give as one that may manifest much later in life?', 'Gout', ['Phenylketonuria', 'Glucose-6-phosphate dehydrogenase deficiency'], {
    explanation: 'Page 4.',
  }),
  mcq('q1-10', 'age-of-onset', 'What does G6PD deficiency illustrate about inborn errors?', 'Their clinical manifestation can depend on external factors', ['They always appear in the newborn period', 'They never cause symptoms', 'They are caused by infection'], {
    explanation: 'Page 4.',
  }),
  tf({
    id: 'q1-11', conceptId: 'age-of-onset',
    statement: 'An inborn error of metabolism always shows its effects in the newborn period.',
    answer: false,
    explanation: 'Page 4: some appear much later in life (gout), and some only with external factors (G6PD deficiency).',
    skill: 'misconception',
  }),
  mcq('q1-12', 'age-of-onset', 'Most people with G6PD deficiency have no symptoms. What brings on red-cell breakdown?', 'An environmental trigger, such as fava beans or the drug primaquine', ['Simply growing older', 'A high-carbohydrate diet in infancy', 'Exercise in cold weather'], {
    explanation: 'Lehninger p. 551: only G6PD deficiency combined with certain environmental factors produces the clinical picture — the “external factors” of page 4.',
    skill: 'application',
  }),
  mcq('q1-13', 'metabolic-block', 'Which is NOT one of the four biochemical consequences of a metabolic block?', 'Increased formation of the product', ['Accumulation of substrate', 'Use of an alternate pathway', 'Effects on other metabolic reactions'], {
    explanation: 'Page 5: product formation is reduced, not increased.',
    skill: 'misconception',
  }),
  mcq('q1-14', 'metabolic-block', 'In PKU, phenylalanine builds up because the enzyme that uses it is defective. Which consequence of a block is this?', 'Accumulation of substrate', ['Reduced formation of product', 'Interference with feedback control', 'Reduced formation of a remote product'], {
    explanation: 'Page 5: phenylalanine is the substrate of the blocked step (page 20).',
    skill: 'application',
  }),
  mcq('q1-15', 'metabolic-block', 'If phenylalanine hydroxylase is blocked, what happens to the formation of tyrosine from phenylalanine?', 'It is reduced', ['It increases', 'It is unchanged', 'It switches to the liver'], {
    explanation: 'Pages 5 and 20: reduced formation of product — tyrosine is the product of the blocked step.',
    skill: 'application',
  }),
  fill('q1-16', 'metabolic-block', 'When the main route is blocked, the substrate may be used by an ____ pathway of metabolism.', ['alternate', 'alternative'], {
    explanation: 'Page 5.',
  }),
  tf({
    id: 'q1-17', conceptId: 'metabolic-block',
    statement: 'A metabolic block can affect metabolic reactions other than the blocked one.',
    answer: true,
    explanation: 'Page 5: effects on other metabolic reactions.',
  }),
  mcq('q1-18', 'metabolic-block', 'In Garrod’s figure, B is converted to D when B → C is blocked. Which consequence of a metabolic block does this show?', 'Use of an alternate pathway', ['Reduced formation of a remote product', 'Interference with feedback control', 'Accumulation of product'], {
    explanation: 'Pages 3 and 5.',
    skill: 'application',
  }),
  mcq('q1-19', 'remote-effects', 'Which enzyme deficiency does the lecture link to reduced cortisol in congenital adrenal hyperplasia?', '21-hydroxylase', ['Phenylalanine hydroxylase', 'Adenosine deaminase', 'Hexosaminidase A'], {
    explanation: 'Page 6.',
  }),
  mcq('q1-20', 'remote-effects', 'In hypothyroidism, TSH rises. Which feature of inborn errors does the lecture use this to illustrate?', 'Interference with feedback control', ['Reduced formation of a remote product', 'Use of an alternate pathway', 'Accumulation of substrate'], {
    explanation: 'Page 6.',
  }),
  match('q1-21', 'remote-effects', 'Match each feature to the lecture’s example.', [
    ['Reduced formation of a remote product', '↓ cortisol in congenital adrenal hyperplasia'],
    ['Interference with feedback control', '↑ TSH in hypothyroidism'],
    ['Accumulation of substrate', 'Phenylalanine build-up in PKU'],
  ], { explanation: 'Pages 5–6 and 20.' }),
  tf({
    id: 'q1-22', conceptId: 'remote-effects',
    statement: 'In congenital adrenal hyperplasia due to 21-hydroxylase deficiency, cortisol is increased.',
    answer: false,
    explanation: 'Page 6: cortisol is reduced — a remote product of the blocked pathway.',
    skill: 'misconception',
  }),
  mcq('q1-23', 'remote-effects', 'Why is cortisol called a “remote” product in 21-hydroxylase deficiency?', 'It is made further along the pathway than the blocked step, so its formation falls', ['It is made in a different organ from the enzyme', 'It is the substrate of the blocked enzyme', 'It is made by gut bacteria'], {
    explanation: 'Page 6: reduced formation of remote products.',
    skill: 'cause-effect',
  }),
  mcq('q1-24', 'remote-effects', 'Cortisol is lacking in CAH. Which principle of management answers this problem (page 18)?', 'Supplying the deficient product', ['Limiting dietary precursors', 'Removing the accumulated product', 'Screening the parents'], {
    explanation: 'Page 18: cortisol is supplied in CAH.',
    skill: 'application',
  }),
  tf({
    id: 'q1-25', conceptId: 'garrod-hypothesis',
    statement: 'In Garrod’s model, the substrate in front of the blocked step accumulates.',
    answer: true,
    explanation: 'Page 3: “substrate excess”.',
  }),
];

// ─── Lesson 2 — Detection and newborn screening ─────────────────────
const lesson2: Q[] = [
  mcq('q2-01', 'detection-methods', 'Chemical investigations for inborn errors rely extensively on which two techniques?', 'Chromatography and electrophoresis', ['Radiography and ultrasound', 'ECG and EEG', 'Microscopy and culture'], {
    explanation: 'Page 7.',
  }),
  tf({
    id: 'q2-02', conceptId: 'detection-methods',
    statement: 'The first specimens examined for a suspected inborn error are usually urine and blood.',
    answer: true,
    explanation: 'Page 7.',
  }),
  multi('q2-03', 'detection-methods', 'Which further specimens may be explored? Select all that apply.', ['Leucocyte concentrates', 'Red cell haemolysates', 'Skin biopsy', 'Liver biopsy'], ['Hair clippings', 'Nail clippings'], {
    explanation: 'Page 7.',
  }),
  mcq('q2-04', 'detection-methods', 'Biopsies of which organs does the lecture mention?', 'Skin, liver and thyroid', ['Kidney, heart and lung', 'Brain, spleen and bone', 'Muscle, pancreas and gut'], {
    explanation: 'Page 7.',
  }),
  fill('q2-05', 'detection-methods', 'Red cell ____ are among the further specimens examined.', ['haemolysates', 'hemolysates', 'haemolysate', 'hemolysate'], {
    explanation: 'Page 7.',
    skill: 'terminology',
  }),
  mcq('q2-06', 'detection-methods', 'Which specimen is made by breaking open red blood cells?', 'Red cell haemolysate', ['Leucocyte concentrate', 'Skin biopsy', 'Urine'], {
    explanation: 'Page 7: a haemolysate is the contents of lysed red cells.',
    skill: 'terminology',
  }),
  tf({
    id: 'q2-07', conceptId: 'detection-methods',
    statement: 'Thyroid biopsies may be examined when detecting inborn errors.',
    answer: true,
    explanation: 'Page 7.',
  }),
  mcq('q2-08', 'prenatal-diagnosis', 'Which cells are cultured from amniotic fluid for prenatal diagnosis?', 'Fibroblasts', ['Leucocytes', 'Erythrocytes', 'Hepatocytes'], {
    explanation: 'Page 8.',
  }),
  mcq('q2-09', 'prenatal-diagnosis', 'In which trimester does the lecture place chorionic villus sampling?', 'The first', ['The second', 'The third'], {
    explanation: 'Page 8.',
  }),
  tf({
    id: 'q2-10', conceptId: 'prenatal-diagnosis',
    statement: 'Chorionic villus sampling is done after birth.',
    answer: false,
    explanation: 'Page 8: it is used during the first trimester for prenatal screening.',
    skill: 'misconception',
  }),
  multi('q2-11', 'prenatal-diagnosis', 'Which methods does the lecture name for diagnosing an inborn error before birth? Select all that apply.', ['Culturing fibroblasts from amniotic fluid', 'Chorionic villus sampling'], ['A heel-prick test on the newborn', 'Measuring urine organic acids in the infant'], {
    explanation: 'Page 8.',
  }),
  mcq('q2-12', 'prenatal-diagnosis', 'A family wants to know early in pregnancy whether the fetus has an inborn error. Which method does the lecture describe for the first trimester?', 'Chorionic villus sampling', ['Neonatal screening on days 5–8', 'Skin biopsy of the infant', 'Plasma carnitine'], {
    explanation: 'Page 8.',
    skill: 'application',
  }),
  mcq('q2-13', 'screening-criteria', 'Which is NOT a criterion for neonatal screening?', 'The disease should already be clinically obvious at the time of screening', ['The disease should be treatable, or early treatment should improve outcome', 'Results should be available before irreversible damage', 'The test should be simple and reliable'], {
    explanation: 'Page 9: the disease should NOT be clinically apparent at screening.',
    skill: 'misconception',
  }),
  mcq('q2-14', 'screening-criteria', 'Why must screening results be available quickly?', 'So treatment can start before irreversible damage occurs', ['So the test costs less', 'So the baby can leave hospital sooner', 'Because the samples spoil'], {
    explanation: 'Page 9.',
    skill: 'cause-effect',
  }),
  tf({
    id: 'q2-15', conceptId: 'screening-criteria',
    statement: 'A disease chosen for neonatal screening should be relatively common in the population.',
    answer: true,
    explanation: 'Page 9.',
  }),
  tf({
    id: 'q2-16', conceptId: 'screening-criteria',
    statement: 'A disease is worth screening for even when early treatment does not improve the outcome.',
    answer: false,
    explanation: 'Page 9: it should be treatable, or early treatment should improve the outcome.',
  }),
  mcq('q2-17', 'screening-criteria', 'What should the screening test itself be like?', 'Simple and reliable', ['Invasive and detailed', 'Expensive and specialised', 'Slow but exhaustive'], {
    explanation: 'Page 9.',
  }),
  mcq('q2-18', 'screening-criteria', 'Disease X cannot be treated, and diagnosing it early does not change its course. By the lecture’s criteria, is it a good candidate for neonatal screening?', 'No — screening needs a treatable disease, or one where early treatment improves outcome', ['Yes, if it is rare', 'Yes — every disease should be screened', 'Only if it is already obvious at birth'], {
    explanation: 'Page 9.',
    skill: 'application',
  }),
  mcq('q2-19', 'screening-criteria', 'Which screening criterion explains why PKU is tested in the first week rather than waiting for symptoms?', 'Results must be available before irreversible damage occurs', ['The disease must be rare', 'The test must be invasive', 'The disease must be clinically apparent'], {
    explanation: 'Page 9; Lehninger p. 681: early detection and treatment of PKU prevent much of the damage.',
    skill: 'application',
  }),
  mcq('q2-20', 'uk-screening', 'Between which days after birth are UK newborns screened (page 10)?', 'The 5th and 8th', ['The 1st and 2nd', 'The 10th and 14th', 'The 28th and 30th'], {
    explanation: 'Page 10.',
  }),
  multi('q2-21', 'uk-screening', 'Which conditions are on the lecture’s UK newborn screening list? Select all that apply.', ['Neonatal hypothyroidism', 'Phenylketonuria', 'Galactosaemia', 'Congenital adrenal hyperplasia'], ['Tay-Sachs disease', 'Menkes syndrome'], {
    explanation: 'Page 10.',
  }),
  tf({
    id: 'q2-22', conceptId: 'uk-screening',
    statement: 'Sickle cell disease and thalassaemia are on the lecture’s UK newborn screening list.',
    answer: true,
    explanation: 'Page 10.',
  }),
  mcq('q2-23', 'uk-screening', 'Which thyroid condition is on the lecture’s UK screening list?', 'Neonatal hypothyroidism', ['Graves’ disease', 'Thyroid cancer', 'Thyroiditis'], {
    explanation: 'Page 10.',
  }),
  mcq('q2-24', 'uk-screening', 'Which adrenal condition is on the lecture’s UK screening list?', 'Congenital adrenal hyperplasia', ['Addison’s disease', 'Phaeochromocytoma', 'Cushing’s syndrome'], {
    explanation: 'Page 10.',
  }),
  mcq('q2-25', 'uk-screening', 'Which of these is on the lecture’s UK newborn screening list?', 'Phenylketonuria', ['Alkaptonuria', 'Tay-Sachs disease', 'Haemophilia A'], {
    explanation: 'Page 10.',
  }),
  tf({
    id: 'q2-26', conceptId: 'uk-screening',
    statement: 'In the lecture, UK newborns are screened within the first 24 hours of life.',
    answer: false,
    explanation: 'Page 10: between the 5th and 8th day postpartum.',
  }),
];

// ─── Lesson 3 — Suspecting, investigating and managing ──────────────
const lesson3: Q[] = [
  multi('q3-01', 'suspect-features', 'Which features in an infant are suggestive of an inborn error? Select all that apply.', ['Persistent vomiting', 'Failure to thrive', 'Hepatosplenomegaly', 'Persistent jaundice'], ['Rapid weight gain', 'Walking early'], {
    explanation: 'Pages 11–12.',
  }),
  mcq('q3-02', 'suspect-features', 'An infant’s napkins have a peculiar smell and staining. What should you consider?', 'An inborn error of metabolism', ['Normal variation that needs no thought', 'Teething', 'Overfeeding'], {
    explanation: 'Page 12.',
    skill: 'application',
  }),
  tf({
    id: 'q3-03', conceptId: 'suspect-features',
    statement: 'Renal calculi in an infant can suggest an inborn error of metabolism.',
    answer: true,
    explanation: 'Page 12.',
  }),
  mcq('q3-04', 'suspect-features', 'Which acid–base disturbance is listed as suggestive of an inborn error?', 'Metabolic acidosis', ['Respiratory alkalosis', 'Respiratory acidosis', 'Metabolic alkalosis'], {
    explanation: 'Page 12.',
  }),
  mcq('q3-05', 'suspect-features', 'Which blood glucose finding is listed as suggestive?', 'Hypoglycaemia', ['Hyperglycaemia', 'A normal fasting glucose'], {
    explanation: 'Page 12.',
  }),
  multi('q3-06', 'suspect-features', 'Which neurological features does page 12 list? Select all that apply.', ['Retarded mental development', 'Fits', 'Spasticity'], ['Hearing loss in adulthood', 'Migraine'], {
    explanation: 'Page 12.',
  }),
  fill('q3-07', 'suspect-features', 'Persistent ____ (yellowing of the skin) is a suggestive feature.', ['jaundice'], {
    explanation: 'Page 12.',
  }),
  mcq('q3-08', 'suspect-features', 'What kind of findings should raise the suspicion of an inborn error in an infant?', 'Bizarre and unexplained clinical or laboratory findings', ['Any single fever', 'Only a known family history', 'Only abnormal DNA results'], {
    explanation: 'Page 11.',
  }),
  mcq('q3-09', 'late-findings', 'Which is a LATE clinical finding of inborn errors?', 'Short stature', ['Persistent vomiting', 'Hypoglycaemia', 'Persistent jaundice'], {
    explanation: 'Page 13. The others are features that make you suspect an IEM in an infant (pages 11–12).',
  }),
  multi('q3-10', 'late-findings', 'Which are the three late clinical findings? Select all that apply.', ['Intellectual disability', 'Neuropathy', 'Short stature'], ['Cataract at birth', 'Persistent vomiting'], {
    explanation: 'Page 13.',
  }),
  mcq('q3-11', 'routine-investigations', 'Which routine investigation measures a toxic nitrogen product that can accumulate in inborn errors?', 'Plasma ammonia', ['Lipid profile', 'Thyroid function test', 'Full blood count'], {
    explanation: 'Page 14; ammonia is also the lecture’s example of an accumulated product to remove (page 18).',
  }),
  mcq('q3-12', 'routine-investigations', 'When does the lecture specify serum electrolytes, bicarbonate and blood gases?', 'In cases of acid–base disturbance', ['Only in bleeding disorders', 'Only in jaundice', 'Never — they are specialised tests'], {
    explanation: 'Page 14.',
  }),
  multi('q3-13', 'routine-investigations', 'Which are routine investigations for a suspected IEM? Select all that apply.', ['Full blood count', 'Liver function test', 'Serum uric acid', 'Porphyrins'], ['Specific enzyme assay', 'DNA analysis of fibroblasts'], {
    explanation: 'Pages 14–15. Enzyme assays and DNA analysis are specialised (page 17).',
  }),
  tf({
    id: 'q3-14', conceptId: 'routine-investigations',
    statement: 'Urine ketones are part of the routine work-up for a suspected IEM.',
    answer: true,
    explanation: 'Page 15.',
  }),
  mcq('q3-15', 'routine-investigations', 'Which urine test is on the ROUTINE list?', 'Urine ketones', ['Urine orotic acid', 'Urine organic acids', 'Urine amino acids by chromatography'], {
    explanation: 'Page 15. The other three are specialised tests (page 16).',
    skill: 'comparison',
  }),
  mcq('q3-16', 'routine-investigations', 'Which routine test looks for a disorder of the haem pathway?', 'Porphyrins', ['Lipid profile', 'Serum uric acid', 'Renal function test'], {
    explanation: 'Page 15.',
  }),
  mcq('q3-17', 'specialised-tests', 'Which technique is used to measure plasma and urine amino acids?', 'Chromatography', ['Electrocardiography', 'Radiography', 'Spirometry'], {
    explanation: 'Page 16.',
  }),
  mcq('q3-18', 'specialised-tests', 'Which technique does the specialised list use for metabolites in urine and plasma?', 'Mass spectroscopy', ['Ultrasound', 'Light microscopy', 'Bone densitometry'], {
    explanation: 'Page 16.',
  }),
  multi('q3-19', 'specialised-tests', 'Which are specialised tests? Select all that apply.', ['Urine orotic acid', 'Urine organic acids', 'Plasma carnitine', 'Specific enzyme assays'], ['Full blood count', 'Blood glucose'], {
    explanation: 'Pages 16–17.',
  }),
  mcq('q3-20', 'specialised-tests', 'Which cells are used for DNA analysis in the specialised tests?', 'Leucocytes or fibroblasts', ['Mature red cells or platelets', 'Neurons only', 'Hair cells'], {
    explanation: 'Page 17.',
  }),
  tf({
    id: 'q3-21', conceptId: 'specialised-tests',
    statement: 'Histological study of affected tissue is one of the specialised tests.',
    answer: true,
    explanation: 'Page 17.',
  }),
  mcq('q3-22', 'management', 'What does limiting the dietary intake of precursors aim to do?', 'Reduce the substrate reaching the blocked step', ['Increase the activity of the defective enzyme', 'Replace the missing gene', 'Raise the level of the deficient product'], {
    explanation: 'Page 18, linked to page 5: less precursor means less substrate accumulates.',
    skill: 'cause-effect',
  }),
  mcq('q3-23', 'management', 'Which example does the lecture give of supplying a deficient product?', 'Cortisol in congenital adrenal hyperplasia', ['Ammonia in a urea cycle defect', 'Phenylalanine in PKU', 'Galactose in galactosaemia'], {
    explanation: 'Page 18.',
  }),
  mcq('q3-24', 'management', 'Which accumulated product does the lecture name as one to remove or reduce?', 'Ammonia', ['Cortisol', 'Tyrosine', 'Glucose'], {
    explanation: 'Page 18.',
  }),
  fill('q3-25', 'management', 'When cortisol is supplied in CAH, the gene involved (page 18) is ____.', ['CYP21A', 'CYP21A2', 'CYP21'], {
    explanation: 'Page 18: cortisol in CAH (CYP21A) — the 21-hydroxylase gene (page 6).',
    skill: 'terminology',
  }),
  mcq('q3-26', 'management', 'Treating PKU with a diet low in phenylalanine applies which principle?', 'Limiting the dietary intake of precursors', ['Supplying the deficient product', 'Removing the accumulated product', 'Screening the parents'], {
    explanation: 'Page 18; Lehninger p. 680: early rigid dietary control of phenylalanine largely prevents mental retardation.',
    skill: 'application',
  }),
  tf({
    id: 'q3-27', conceptId: 'management',
    statement: 'Supplying cortisol in CAH is an example of removing an accumulated product.',
    answer: false,
    explanation: 'Page 18: it is supplying the deficient product.',
    skill: 'misconception',
  }),
];

// ─── Lesson 4 — Enzyme defects ──────────────────────────────────────
const lesson4: Q[] = [
  match('q4-01', 'enzyme-defects', 'Match each area of metabolism to its disease (page 19).', [
    ['Amino acids', 'Phenylketonuria'],
    ['Carbohydrate', 'Galactosaemia'],
    ['Organic acids', 'Methylmalonic aciduria'],
    ['Complex lipids', 'Tay-Sachs disease'],
    ['Purines', 'Severe combined immunodeficiency'],
    ['Porphyrins', 'Acute intermittent porphyria'],
  ], { explanation: 'Page 19.' }),
  mcq('q4-02', 'enzyme-defects', 'Which enzyme is defective in acute intermittent porphyria?', 'Porphobilinogen deaminase', ['Adenosine deaminase', 'Hexosaminidase A', 'Phenylalanine hydroxylase'], {
    explanation: 'Page 19.',
  }),
  mcq('q4-03', 'enzyme-defects', 'Adenosine deaminase deficiency is a defect of which area of metabolism?', 'Purines', ['Porphyrins', 'Complex lipids', 'Carbohydrate'], {
    explanation: 'Page 19.',
  }),
  mcq('q4-04', 'enzyme-defects', 'Tay-Sachs disease is a defect in the metabolism of:', 'Complex lipids', ['Organic acids', 'Purines', 'Amino acids'], {
    explanation: 'Page 19.',
  }),
  tf({
    id: 'q4-05', conceptId: 'enzyme-defects',
    statement: 'Galactosaemia is caused by a defect in an enzyme of carbohydrate metabolism.',
    answer: true,
    explanation: 'Page 19.',
  }),
  mcq('q4-06', 'pku', 'Which enzyme is defective in PKU?', 'Phenylalanine hydroxylase', ['Tyrosinase', 'Hexosaminidase A', 'Galactokinase'], {
    explanation: 'Pages 19–20.',
  }),
  mcq('q4-07', 'pku', 'How is PKU inherited?', 'Autosomal recessive', ['Autosomal dominant', 'X-linked recessive', 'Mitochondrial'], {
    explanation: 'Page 20.',
  }),
  mcq('q4-08', 'pku', 'What incidence does the lecture give for PKU?', 'About 1 in 10,000', ['About 1 in 320,000', 'About 1 in 5,000,000', 'About 1 in 100'], {
    explanation: 'Page 20.',
  }),
  tf({
    id: 'q4-09', conceptId: 'pku',
    statement: 'PKU is associated with light hair, eye and skin colour.',
    answer: true,
    explanation: 'Page 20.',
  }),
  mcq('q4-10', 'pku', 'Two unaffected carriers of PKU have a child. What is the chance the child is affected (page 20 figure)?', '25%', ['50%', '75%', '0%'], {
    explanation: 'Page 20 figure: 25% affected, 50% unaffected carriers, 25% unaffected.',
    skill: 'application',
  }),
  mcq('q4-11', 'pku', 'Why is the disease called phenyl“ketonuria”?', 'Excess phenylalanine is diverted to phenylpyruvate, a phenylketone that appears in the urine', ['Phenylalanine is converted into ketone bodies in the liver', 'The urine contains acetone from fasting', 'Tyrosine is excreted as a ketone'], {
    explanation: 'Lehninger pp. 679–680.',
  }),
  mcq('q4-12', 'galactosaemia', 'Which enzyme is defective in galactosaemia, according to the lecture’s table?', 'Galactose-1-phosphate uridyl transferase', ['Galactokinase', 'Lactase', 'UDP-galactose 4′-epimerase'], {
    explanation: 'Page 19; the page 21 figure highlights GALT.',
    skill: 'comparison',
  }),
  multi('q4-13', 'galactosaemia', 'Which features of galactosaemia does the lecture list? Select all that apply.', ['Jaundice', 'Lethargy', 'Renal tubular dysfunction', 'Cataract'], ['Mousy odour', 'Kinky hair'], {
    explanation: 'Page 21.',
  }),
  order('q4-14', 'galactosaemia', 'Put galactose’s route from lactose in order (page 21 figure).', [
    'Lactase splits lactose into glucose and galactose',
    'Galactokinase phosphorylates galactose to galactose-1-phosphate',
    'GALT converts galactose-1-phosphate (with UDP-glucose) to glucose-1-phosphate and UDP-galactose',
  ], { explanation: 'Page 21 figure.' }),
  mcq('q4-15', 'galactosaemia', 'What incidence does the lecture give for galactosaemia?', '1 in 30,000–60,000', ['1 in 3,000–6,000', '1 in 320,000', '1 in 5,000'], {
    explanation: 'Page 21.',
  }),
  mcq('q4-16', 'methylmalonic-aciduria', 'Which enzyme is defective in methylmalonic aciduria?', 'Methylmalonyl-CoA mutase', ['Phenylalanine hydroxylase', 'Adenosine deaminase', 'Porphobilinogen deaminase'], {
    explanation: 'Page 19.',
  }),
  mcq('q4-17', 'methylmalonic-aciduria', 'What does methylmalonyl-CoA mutase produce (page 22 figure)?', 'Succinyl-CoA', ['Propionyl-CoA', 'Acetyl-CoA', 'Malonyl-CoA'], {
    explanation: 'Page 22 figure: succinyl-CoA then yields energy.',
  }),
  multi('q4-18', 'methylmalonic-aciduria', 'Which feed into methylmalonyl-CoA in the page 22 figure? Select all that apply.', ['Isoleucine', 'Valine', 'Odd-chain fatty acids', 'Gut flora'], ['Glucose', 'Leucine'], {
    explanation: 'Page 22 figure: isoleucine, valine, methionine, threonine, odd-chain fatty acids and gut flora.',
  }),
  multi('q4-19', 'methylmalonic-aciduria', 'Which features of methylmalonic aciduria does the lecture list? Select all that apply.', ['Respiratory distress', 'Lethargy', 'Muscle weakness', 'Severe ketoacidosis'], ['Cataract', 'Cherry red spot'], {
    explanation: 'Page 22.',
  }),
  mcq('q4-20', 'methylmalonic-aciduria', 'When the mutase is blocked, propionyl-CoA backs up. What does it inhibit (page 22 figure)?', 'The urea cycle, the citric acid cycle and other pathways', ['Glycolysis only', 'Haem synthesis only', 'Nothing — it is harmless'], {
    explanation: 'Page 22 figure.',
    skill: 'cause-effect',
  }),
  tf({
    id: 'q4-21', conceptId: 'methylmalonic-aciduria',
    statement: 'Methylmalonic aciduria is X-linked.',
    answer: false,
    explanation: 'Page 22: autosomal recessive.',
  }),
  mcq('q4-22', 'tay-sachs', 'Which enzyme is missing from Tay-Sachs lysosomes?', 'Hexosaminidase A', ['Adenosine deaminase', 'Galactokinase', 'Methylmalonyl-CoA mutase'], {
    explanation: 'Pages 19 and 23.',
  }),
  mcq('q4-23', 'tay-sachs', 'What eye sign does the page 24 figure show in Tay-Sachs disease?', 'A cherry red spot in the macula', ['Blue sclerae', 'Cataract', 'Photophobia'], {
    explanation: 'Page 24 figure. Blue sclerae belong to osteogenesis imperfecta, cataract to galactosaemia, photophobia to cystinosis.',
    skill: 'comparison',
  }),
  multi('q4-24', 'tay-sachs', 'Which features of Tay-Sachs disease does the lecture list? Select all that apply.', ['Muscle stiffness and restricted movement', 'Diminished muscle tone', 'Seizures', 'Deterioration of cognitive processes'], ['Mousy odour', 'Salty-tasting skin'], {
    explanation: 'Pages 23–24.',
  }),
  order('q4-25', 'tay-sachs', 'Put the chain of events in Tay-Sachs disease in order (page 24 figure).', [
    'HEXA gene mutation',
    'β-hexosaminidase A deficiency',
    'GM2 ganglioside accumulates in neurons',
    'Neurons swell and degenerate',
  ], { explanation: 'Page 24 figure.' }),
  mcq('q4-26', 'tay-sachs', 'Which of the lecture’s enzyme-defect diseases has the lowest incidence?', 'Tay-Sachs disease (about 1 in 320,000)', ['Phenylketonuria (about 1 in 10,000)', 'Galactosaemia (1 in 30,000–60,000)', 'SCID (about 1 in 100,000)'], {
    explanation: 'Pages 20–25.',
    skill: 'comparison',
  }),
  mcq('q4-27', 'scid', 'Which metabolite is toxic to lymphocytes in adenosine deaminase deficiency?', 'dATP (deoxyadenosine triphosphate)', ['Uric acid', 'Deoxyinosine', 'GM2 ganglioside'], {
    explanation: 'Page 25 figure.',
  }),
  mcq('q4-28', 'scid', 'How is SCID inherited, according to the lecture?', 'Autosomal recessive or X-linked', ['Autosomal dominant only', 'Mitochondrial', 'Not inherited'], {
    explanation: 'Page 25.',
  }),
  multi('q4-29', 'scid', 'Which features of SCID does the lecture list? Select all that apply.', ['Severe yeast and bacterial infections', 'Viral infection from breast milk and vaccinations'], ['Easy bruising', 'Frequent bone fractures'], {
    explanation: 'Page 25.',
  }),
  mcq('q4-30', 'scid', 'Page 26 shows the “bubble boy” — a child in a protective suit. Which feature of SCID explains this?', 'Severe infections, even from breast milk and vaccinations', ['Easy bruising', 'Photophobia', 'Brittle bones'], {
    explanation: 'Pages 25–26.',
    skill: 'cause-effect',
  }),
  mcq('q4-31', 'scid', 'Which enzyme normally converts deoxyadenosine to deoxyinosine?', 'Adenosine deaminase', ['Porphobilinogen deaminase', 'Hexosaminidase A', 'Phenylalanine hydroxylase'], {
    explanation: 'Page 25 figure.',
  }),
];

// ─── Lesson 5 — Transport protein defects ───────────────────────────
const lesson5: Q[] = [
  match('q5-01', 'transport-defects', 'Match each defective protein to its disease (page 27).', [
    ['Haemoglobin', 'Thalassaemia'],
    ['Lysosomal cystine transport protein', 'Cystinosis'],
    ['Copper transport protein', 'Menkes syndrome'],
    ['Chloride transport protein', 'Cystic fibrosis'],
  ], { explanation: 'Page 27.' }),
  mcq('q5-02', 'transport-defects', 'Cystinosis is a defect at which transport site?', 'Organelle membrane', ['Epithelial membrane', 'Inter-organ', 'Intracellular transport'], {
    explanation: 'Page 27.',
  }),
  mcq('q5-03', 'transport-defects', 'Where is the chloride transport protein that is defective in cystic fibrosis found (page 27)?', 'Lungs, sweat glands and pancreas', ['Liver, kidney and brain', 'Bone, cartilage and skin', 'Heart, muscle and fat'], {
    explanation: 'Page 27.',
  }),
  mcq('q5-04', 'transport-defects', 'Menkes syndrome is a defect in the transport of which metal?', 'Copper', ['Iron', 'Zinc', 'Calcium'], {
    explanation: 'Page 27.',
  }),
  mcq('q5-05', 'thalassaemia', 'Thalassaemias are caused by deletions and/or mutations of:', 'The α or β subunit of normal adult haemoglobin', ['Myoglobin', 'Spectrin', 'Collagen'], {
    explanation: 'Page 28 figure.',
  }),
  fill('q5-06', 'thalassaemia', 'Normal adult haemoglobin (HbA) has the subunit composition ____.', ['α2β2', 'α₂β₂', 'a2b2', 'alpha2beta2', 'alpha 2 beta 2'], {
    explanation: 'Page 28 figure.',
    skill: 'terminology',
  }),
  mcq('q5-07', 'thalassaemia', 'How many α-globin genes are there (page 28 figure)?', 'Four', ['Two', 'One', 'Six'], {
    explanation: 'Page 28 figure.',
  }),
  mcq('q5-08', 'thalassaemia', 'What is the usual genetic defect in α-thalassaemia (page 28 figure)?', 'Deletion of α-globin genes', ['Inefficient production of β-globin mRNA', 'A mutation in spectrin', 'Loss of CFTR'], {
    explanation: 'Page 28 figure.',
    skill: 'comparison',
  }),
  mcq('q5-09', 'thalassaemia', 'What results when all four α-globin genes are lost?', 'Hb Barts hydrops fetalis (fatal)', ['A carrier trait', 'Haemoglobin H disease', 'β-thalassaemia major'], {
    explanation: 'Page 28 figure.',
  }),
  mcq('q5-10', 'thalassaemia', 'What results when three α-globin genes are deleted?', 'Haemoglobin H disease', ['Hb Barts hydrops fetalis', 'A silent carrier state', 'Normal haemoglobin'], {
    explanation: 'Page 28 figure.',
  }),
  multi('q5-11', 'thalassaemia', 'Which features of thalassaemia does the lecture list? Select all that apply.', ['Jaundice', 'Hyperuricaemia', 'Gallstones'], ['Kinky hair', 'Photophobia'], {
    explanation: 'Page 28.',
  }),
  tf({
    id: 'q5-12', conceptId: 'thalassaemia',
    statement: 'In β-thalassaemia the β-globin genes are present, but their mRNA is made inefficiently or rapidly degraded.',
    answer: true,
    explanation: 'Page 28 figure.',
  }),
  mcq('q5-13', 'thalassaemia', 'In α-thalassaemia, which chains are in excess?', 'β-chains, which form tetramers', ['α-chains', 'Neither — the chains stay balanced'], {
    explanation: 'Page 28 figure: increased levels of tetrameric β-globin chains.',
    skill: 'cause-effect',
  }),
  mcq('q5-14', 'cystic-fibrosis', 'Which ion does the CF protein transport, according to page 27?', 'Chloride', ['Sodium', 'Potassium', 'Calcium'], {
    explanation: 'Page 27; in the page 29 figure Na⁺ moves through ENaC instead.',
  }),
  multi('q5-15', 'cystic-fibrosis', 'Which features of cystic fibrosis does the lecture list? Select all that apply.', ['Very salty-tasting skin', 'Persistent cough', 'Frequent lung infections', 'Poor growth and weight gain'], ['Kinky hair', 'Blue sclerae'], {
    explanation: 'Page 29.',
  }),
  mcq('q5-16', 'cystic-fibrosis', 'What inheritance and incidence does the lecture give for cystic fibrosis?', 'Autosomal recessive, 1 in 3,000–6,000', ['X-linked, 1 in 5,000', 'Autosomal dominant, 1 in 20,000', 'X-linked recessive, 1 in 300,000'], {
    explanation: 'Page 29. The distractors belong to haemophilia A, osteogenesis imperfecta and Menkes syndrome.',
    skill: 'comparison',
  }),
  mcq('q5-17', 'cystic-fibrosis', 'In CF airways (page 29 figure), why does the mucus become dehydrated?', 'Chloride movement through CFTR fails while sodium absorption continues', ['Too much chloride is secreted', 'Sodium absorption stops completely', 'The mucus glands disappear'], {
    explanation: 'Page 29 figure.',
    skill: 'cause-effect',
  }),
  tf({
    id: 'q5-18', conceptId: 'cystic-fibrosis',
    statement: 'ENaC is the chloride channel that is defective in cystic fibrosis.',
    answer: false,
    explanation: 'Page 29 figure: the defective protein is CFTR; ENaC carries Na⁺.',
    skill: 'misconception',
  }),
  mcq('q5-19', 'cystinosis', 'Where does cystine accumulate in cystinosis?', 'Inside lysosomes', ['In the plasma', 'In mitochondria', 'In the Golgi'], {
    explanation: 'Pages 27 and 30.',
  }),
  multi('q5-20', 'cystinosis', 'Which features of cystinosis does the lecture list? Select all that apply.', ['Photophobia', 'Fanconi syndrome', 'Failure to thrive'], ['Gallstones', 'Kinky hair'], {
    explanation: 'Page 30.',
  }),
  mcq('q5-21', 'cystinosis', 'Which gene encodes cystinosin (page 30 figure)?', 'CTNS', ['CFTR', 'ATP7A', 'HEXA'], {
    explanation: 'Page 30 figure.',
  }),
  mcq('q5-22', 'cystinosis', 'What does cystinosin do (page 30 figure)?', 'It is an H⁺-driven transporter that moves cystine out of the lysosome', ['It exports copper from the cell', 'It secretes chloride onto the airway surface', 'It digests GM2 ganglioside'], {
    explanation: 'Page 30 figure.',
  }),
  mcq('q5-23', 'menkes', 'Which hair change is typical of Menkes syndrome?', 'Brittle, “kinky” hair', ['Light hair', 'Premature greying', 'Patchy hair loss'], {
    explanation: 'Page 31. Light hair belongs to PKU (page 20).',
    skill: 'comparison',
  }),
  multi('q5-24', 'menkes', 'Which features of Menkes syndrome does the lecture list? Select all that apply.', ['Loss of muscle tone', 'Mental retardation', 'Seizures'], ['Salty-tasting skin', 'Cataract'], {
    explanation: 'Page 31.',
  }),
  mcq('q5-25', 'menkes', 'Which protein in the page 31 figure exports copper from the cell?', 'ATP7A, a copper-transporting ATPase', ['CFTR', 'Cystinosin', 'Spectrin'], {
    explanation: 'Page 31 figure.',
  }),
  mcq('q5-26', 'menkes', 'Which transport defect in the lecture is X-linked recessive?', 'Menkes syndrome', ['Cystic fibrosis', 'Cystinosis', 'Thalassaemia'], {
    explanation: 'Page 31. The others are autosomal recessive (pages 28–30).',
    skill: 'comparison',
  }),
  match('q5-27', 'transport-defects', 'Match each disease to a feature the lecture lists for it.', [
    ['Thalassaemia', 'Gallstones'],
    ['Cystic fibrosis', 'Very salty-tasting skin'],
    ['Cystinosis', 'Photophobia'],
    ['Menkes syndrome', 'Brittle, kinky hair'],
  ], { explanation: 'Pages 28–31.' }),
];

// ─── Lesson 6 — Structural, homeostatic and signalling defects ──────
const lesson6: Q[] = [
  match('q6-01', 'structural-defects', 'Match each site to its disease (page 32).', [
    ['Extracellular', 'Osteogenesis imperfecta'],
    ['Cell membrane', 'Hereditary spherocytosis'],
    ['Cytoskeleton', 'Duchenne/Becker muscular dystrophy'],
    ['Organelle', 'Zellweger syndrome'],
  ], { explanation: 'Page 32.' }),
  mcq('q6-02', 'structural-defects', 'Which red cell membrane protein is defective in hereditary spherocytosis?', 'Spectrin', ['Dystrophin', 'Collagen', 'Haemoglobin'], {
    explanation: 'Page 32.',
  }),
  mcq('q6-03', 'structural-defects', 'In the lecture’s table, dystrophin is listed under which site?', 'Cytoskeleton', ['Extracellular', 'Organelle', 'Cell membrane'], {
    explanation: 'Page 32.',
  }),
  mcq('q6-04', 'structural-defects', 'Osteogenesis imperfecta, hereditary spherocytosis and Zellweger syndrome are grouped as mutations affecting:', 'The structure of cells and organs', ['Transport proteins', 'Extracellular homeostasis', 'Growth control'], {
    explanation: 'Page 32.',
  }),
  mcq('q6-05', 'osteogenesis-imperfecta', 'Which gene does the lecture name for osteogenesis imperfecta?', 'COL1A1', ['HEXA', 'CTNS', 'ATP7A'], {
    explanation: 'Page 33.',
  }),
  mcq('q6-06', 'osteogenesis-imperfecta', 'What kind of change in collagen does the lecture name for osteogenesis imperfecta?', 'Glycine substitution', ['Deletion of four genes', 'Loss of a chloride channel', 'Absence of a lysosomal enzyme'], {
    explanation: 'Page 33.',
  }),
  multi('q6-07', 'osteogenesis-imperfecta', 'Which features of osteogenesis imperfecta does the lecture list? Select all that apply.', ['Frequent bone fractures', 'Bone deformity', 'Bluish discolouration of the whites of the eyes'], ['Cherry red spot', 'Haematuria'], {
    explanation: 'Page 33.',
  }),
  mcq('q6-08', 'osteogenesis-imperfecta', 'What inheritance and incidence does the lecture give for osteogenesis imperfecta?', 'Autosomal dominant, 1 in 20,000', ['Autosomal recessive, 1 in 10,000', 'X-linked, 1 in 5,000', 'X-linked recessive, 1 in 300,000'], {
    explanation: 'Page 33.',
  }),
  mcq('q6-09', 'zellweger', 'Zellweger syndrome results from a defect in a protein needed for:', 'Peroxisome biogenesis', ['Lysosomal digestion of GM2', 'Copper export', 'Chloride secretion'], {
    explanation: 'Page 32.',
  }),
  mcq('q6-10', 'zellweger', 'What accumulates in Zellweger syndrome?', 'Very-long-chain fatty acids', ['GM2 ganglioside', 'Cystine', 'Copper'], {
    explanation: 'Page 34. GM2 accumulates in Tay-Sachs, cystine in cystinosis.',
    skill: 'comparison',
  }),
  fill('q6-11', 'zellweger', 'Zellweger syndrome degenerates the brain, liver and kidney — described as cerebro-hepato-____.', ['renal'], {
    explanation: 'Page 34.',
    skill: 'terminology',
  }),
  tf({
    id: 'q6-12', conceptId: 'zellweger',
    statement: 'Zellweger syndrome is autosomal recessive.',
    answer: true,
    explanation: 'Page 34.',
  }),
  match('q6-13', 'homeostasis-defects', 'Match each function to its disease (page 35).', [
    ['Immune protection', 'Complement C3 deficiency'],
    ['Haemostasis', 'Haemophilia A'],
    ['Protease inhibition', 'Pulmonary emphysema'],
  ], { explanation: 'Page 35.' }),
  mcq('q6-14', 'homeostasis-defects', 'Which protein is defective in haemophilia A?', 'Factor VIII', ['α1-antitrypsin', 'Complement C3', 'Spectrin'], {
    explanation: 'Page 35.',
  }),
  mcq('q6-15', 'homeostasis-defects', 'What function does α1-antitrypsin serve in the lecture’s table?', 'Protease inhibition', ['Immune protection', 'Haemostasis', 'Oxygen transport'], {
    explanation: 'Page 35.',
  }),
  mcq('q6-16', 'haemophilia-a', 'How is haemophilia A inherited?', 'X-linked', ['Autosomal recessive', 'Autosomal dominant', 'Mitochondrial'], {
    explanation: 'Page 36.',
  }),
  multi('q6-17', 'haemophilia-a', 'Which features of haemophilia A does the lecture list? Select all that apply.', ['Spontaneous bleeding', 'Deep tissue haemorrhage', 'Easy bruising', 'Haematuria'], ['Frequent bone fractures', 'Photophobia'], {
    explanation: 'Page 36.',
  }),
  order('q6-18', 'haemophilia-a', 'Put the normal response to a vessel injury in order (page 36 figure).', [
    'Injury to the vessel causes bleeding',
    'The vessel constricts and clotting factors are activated',
    'Factor VIII, with other substances, helps form a strong platelet plug',
    'A stable fibrin clot seals the injury and bleeding stops',
  ], { explanation: 'Page 36 figure.' }),
  mcq('q6-19', 'haemophilia-a', 'What happens when factor VIII is lacking (page 36 figure)?', 'A weak platelet plug forms and the fibrin clot is incomplete or delayed, so bleeding continues', ['The vessel cannot constrict at all', 'Clots form too quickly and block the vessel', 'Platelets are destroyed in the spleen'], {
    explanation: 'Page 36 figure.',
    skill: 'cause-effect',
  }),
  mcq('q6-20', 'growth-control-defects', 'Which protein is the tumour suppressor in the lecture’s table?', 'Rb protein', ['bcr-abl', 'Rhodopsin', 'Insulin'], {
    explanation: 'Page 37.',
  }),
  multi('q6-21', 'growth-control-defects', 'Which cancers does the lecture link to Rb protein mutations? Select all that apply.', ['Retinoblastoma', 'Osteosarcoma'], ['Chronic myelogenous leukaemia', 'Retinitis pigmentosa'], {
    explanation: 'Page 37.',
  }),
  mcq('q6-22', 'growth-control-defects', 'Which disease does the lecture link to bcr-abl?', 'Chronic myelogenous leukaemia', ['Retinoblastoma', 'Osteosarcoma', 'Dwarfism'], {
    explanation: 'Page 37.',
  }),
  mcq('q6-23', 'receptor-hormone-defects', 'Which defect causes familial hypercholesterolaemia?', 'A defective LDL receptor', ['A defective androgen receptor', 'Defective rhodopsin', 'A defective vitamin D receptor'], {
    explanation: 'Page 38.',
  }),
  mcq('q6-24', 'receptor-hormone-defects', 'Which defect leads to X-linked colour blindness?', 'Defective green and red light opsins', ['Defective rhodopsin', 'A defective vitamin D receptor', 'A defective androgen receptor'], {
    explanation: 'Page 38. Rhodopsin defects cause retinitis pigmentosa.',
    skill: 'comparison',
  }),
  mcq('q6-25', 'receptor-hormone-defects', 'What does a defective androgen receptor cause?', 'Testicular feminisation', ['Dwarfism', 'Vitamin D-dependent rickets', 'Type II diabetes mellitus'], {
    explanation: 'Page 38.',
  }),
  match('q6-26', 'receptor-hormone-defects', 'Match each defective protein to its disease (page 38).', [
    ['Growth hormone', 'Dwarfism'],
    ['Insulin', 'Type II diabetes mellitus'],
    ['Vitamin D receptor', 'Vitamin D-dependent rickets'],
  ], { explanation: 'Page 38.' }),
  tf({
    id: 'q6-27', conceptId: 'receptor-hormone-defects',
    statement: 'Retinitis pigmentosa results from a defect in rhodopsin.',
    answer: true,
    explanation: 'Page 38.',
  }),
  mcq('q6-28', 'haemophilia-a', 'Which of these inborn errors is X-linked?', 'Haemophilia A', ['Osteogenesis imperfecta', 'Zellweger syndrome', 'Cystic fibrosis'], {
    explanation: 'Page 36. OI is autosomal dominant; Zellweger and CF are autosomal recessive.',
    skill: 'comparison',
  }),
];

export const questions: Q[] = [...lesson1, ...lesson2, ...lesson3, ...lesson4, ...lesson5, ...lesson6];
