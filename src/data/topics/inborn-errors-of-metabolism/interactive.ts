// Biochemistry → Inborn Errors of Metabolism — layer 1 (learn by
// answering) and reading-layer extras. Checkpoint IDs: cN-xx; recall
// prompts: rN-xx.
import type { LessonConfusion } from '@/data/lesson-types';
import { ask, fill, learn, match, mcq, multi, order, recall, tf, type InteractiveDraft } from '@/data/topics/build';
import { ref, type ConceptId } from '@/data/topics/inborn-errors-of-metabolism/sources';

type Steps = InteractiveDraft<ConceptId>[];

export const interactive: Record<string, Steps> = {
  // ─── Lesson 1 — What inborn errors are ─────────────────────────────
  'inborn-errors-of-metabolism-1': [
    ask(
      mcq('c1-01', 'metabolic-block', 'Before you start: in the pathway A → B → C, the enzyme for B → C is missing. What happens to B?', 'It accumulates', ['It disappears', 'It turns straight into C', 'Nothing changes'], {
        explanation: 'The substrate in front of a blocked step piles up — the first consequence of a metabolic block (pages 3 and 5).',
        skill: 'prediction',
      }),
      ['That is Garrod’s model: B accumulates, C is deficient, and B is diverted to a toxic metabolite D.']
    ),
    learn('Garrod’s hypothesis', [
      'In the early 1900s Garrod studied alkaptonuria and proposed that a defective enzyme causes an “inborn error in metabolism” — summed up on the slide as one gene → one enzyme.',
    ], {
      keyPoint: 'Block B → C: substrate excess (B), product deficiency (C), toxic metabolite (D).',
      sourceRefs: ref([3]),
    }),
    ask(
      fill('c1-02', 'garrod-hypothesis', 'Garrod formed his hypothesis while studying the inherited condition ____.', ['alkaptonuria', 'alcaptonuria'], {
        explanation: 'Page 3.',
        skill: 'terminology',
      })
    ),
    learn('Early, late, or triggered', [
      'Some inborn errors appear early in life (PKU), some much later (gout), and some only when an external factor meets the defect (G6PD deficiency).',
    ], { sourceRefs: ref([4]) }),
    ask(
      match('c1-03', 'age-of-onset', 'Match each inborn error to how it shows itself.', [
        ['Phenylketonuria', 'Early in life'],
        ['Gout', 'Much later in life'],
        ['G6PD deficiency', 'Depends on external factors'],
      ], { explanation: 'Page 4.' })
    ),
    learn('Four consequences', [
      'A metabolic block causes accumulation of substrate, reduced formation of product, use of an alternate pathway, and effects on other metabolic reactions.',
    ], { sourceRefs: ref([5]) }),
    ask(
      multi('c1-04', 'metabolic-block', 'Which are biochemical consequences of a metabolic block? Select all that apply.', ['Accumulation of substrate', 'Reduced formation of product', 'Use of an alternate pathway', 'Effects on other metabolic reactions'], ['Increased activity of the blocked enzyme'], {
        explanation: 'Page 5.',
      })
    ),
    learn('Further features', [
      'A block can starve a product made several steps later — 21-hydroxylase deficiency in congenital adrenal hyperplasia lowers cortisol. It can also upset feedback control — TSH rises in hypothyroidism.',
    ], { sourceRefs: ref([6]) }),
    ask(
      mcq('c1-05', 'remote-effects', 'In congenital adrenal hyperplasia, 21-hydroxylase deficiency lowers cortisol. Which feature does this illustrate?', 'Reduced formation of a remote product', ['Interference with feedback control', 'Use of an alternate pathway', 'Accumulation of substrate'], {
        explanation: 'Page 6: ↓ cortisol due to 21-hydroxylase deficiency is the lecture’s example of a reduced remote product.',
        skill: 'application',
      })
    ),
    ask(
      tf({
        id: 'c1-06', conceptId: 'remote-effects',
        statement: 'A raised TSH in hypothyroidism is the lecture’s example of interference with feedback control.',
        answer: true,
        explanation: 'Page 6.',
      })
    ),
    recall('r1-01', 'metabolic-block', 'Using Garrod’s A → B → C model, explain the consequences of a blocked enzyme.', [
      'The substrate before the block (B) accumulates.',
      'The product (C) is formed in reduced amounts — product deficiency.',
      'B is diverted down an alternate pathway, e.g. to a toxic metabolite D.',
      'Built-up or diverted compounds affect other metabolic reactions.',
    ]),
  ],

  // ─── Lesson 2 — Detection and newborn screening ────────────────────
  'inborn-errors-of-metabolism-2': [
    ask(
      mcq('c2-01', 'detection-methods', 'Before you start: which specimens would you examine first for a suspected inborn error?', 'Urine and blood', ['Liver biopsy and CSF', 'Skin biopsy and saliva', 'Thyroid biopsy and sweat'], {
        explanation: 'Page 7: the initial specimens are usually urine and blood.',
        skill: 'prediction',
      })
    ),
    learn('Detection', [
      'Chemical investigations based on chromatography and electrophoresis are used extensively. After urine and blood, other specimens include leucocyte concentrates, red cell haemolysates, and skin, liver and thyroid biopsies.',
    ], { sourceRefs: ref([7]) }),
    ask(
      multi('c2-02', 'detection-methods', 'Which two techniques underpin most chemical detection of inborn errors? Select all that apply.', ['Chromatography', 'Electrophoresis'], ['Radiography', 'Echocardiography'], {
        explanation: 'Page 7.',
      })
    ),
    learn('Before birth', [
      'Fibroblasts cultured from amniotic fluid allow prenatal diagnosis; chorionic villus sampling is used for prenatal screening in the first trimester.',
    ], { sourceRefs: ref([8]) }),
    ask(
      mcq('c2-03', 'prenatal-diagnosis', 'Which prenatal test does the lecture place in the first trimester?', 'Chorionic villus sampling', ['Cultured amniotic-fluid fibroblasts', 'Skin biopsy', 'Red cell haemolysate'], {
        explanation: 'Page 8.',
      })
    ),
    learn('Is a disease worth screening for?', [
      'It should not yet be clinically apparent and be relatively common; it should be treatable (or early treatment should help); results must arrive before irreversible damage; and the test must be simple and reliable.',
    ], { sourceRefs: ref([9]) }),
    ask(
      multi('c2-04', 'screening-criteria', 'Which are criteria for neonatal screening? Select all that apply.', ['The disease is treatable or early treatment improves outcome', 'Results are available before irreversible damage', 'The test is simple and reliable'], ['The disease is already obvious at birth', 'The disease is extremely rare'], {
        explanation: 'Page 9: the disease should not be clinically apparent at screening and should be relatively common.',
      })
    ),
    learn('The UK screen', [
      'UK newborns are screened between the 5th and 8th day for neonatal hypothyroidism, PKU, sickle cell disease and thalassaemia, galactosaemia and congenital adrenal hyperplasia — and page 10 also lists glucose-6-phosphatase deficiency (check with your lecturer).',
    ], { sourceRefs: ref([10]) }),
    ask(
      mcq('c2-05', 'uk-screening', 'When are UK newborns screened for these conditions?', 'Between the 5th and 8th day after birth', ['Within the first hour', 'At 6 weeks', 'At 1 year'], {
        explanation: 'Page 10.',
      })
    ),
    recall('r2-01', 'screening-criteria', 'State the four criteria that make a disease suitable for neonatal screening.', [
      'Not clinically apparent at screening, and relatively common in the population.',
      'Treatable, or early treatment improves the outcome.',
      'Results available before irreversible damage occurs.',
      'The test is simple and reliable.',
    ]),
  ],

  // ─── Lesson 3 — Suspecting, investigating and managing ─────────────
  'inborn-errors-of-metabolism-3': [
    ask(
      mcq('c3-01', 'suspect-features', 'Before you start: when should an inborn error come to mind in an infant?', 'When there are bizarre, unexplained clinical or laboratory findings', ['Only when a parent is affected', 'Only after a positive DNA test', 'Only in children over five'], {
        explanation: 'Page 11.',
        skill: 'prediction',
      })
    ),
    learn('Red flags', [
      'Persistent vomiting, failure to thrive, hepatosplenomegaly, persistent jaundice, retarded mental development (fits, spasticity), peculiar smell or staining of napkins, hypoglycaemia, metabolic acidosis and renal calculi.',
    ], { sourceRefs: ref([11, 12]) }),
    ask(
      multi('c3-02', 'suspect-features', 'Which features should make you suspect an inborn error? Select all that apply.', ['Peculiar smell of the napkins', 'Hypoglycaemia', 'Metabolic acidosis', 'Renal calculi'], ['A single episode of fever with a cold', 'Normal growth and development'], {
        explanation: 'Page 12.',
      })
    ),
    learn('Later on', ['Late clinical findings: intellectual disability, neuropathy and short stature.'], { sourceRefs: ref([13]) }),
    ask(
      fill('c3-03', 'late-findings', 'Late findings: intellectual disability, ____ and short stature.', ['neuropathy'], {
        explanation: 'Page 13.',
      })
    ),
    learn('Routine, then specialised', [
      'Routine: FBC; electrolytes, bicarbonate and blood gases; renal and liver function; plasma ammonia; blood glucose; urine ketones; lipid profile; uric acid; thyroid function; porphyrins.',
      'Specialised: amino acids by chromatography, urine orotic and organic acids, plasma carnitine, mass spectroscopy of metabolites, enzyme assays, DNA analysis of leucocytes or fibroblasts, and histology.',
    ], { sourceRefs: ref([14, 15, 16, 17]) }),
    ask(
      match('c3-04', 'specialised-tests', 'Sort each test: routine or specialised?', [
        ['Plasma ammonia', 'Routine'],
        ['Blood glucose', 'Routine'],
        ['Urine orotic acid', 'Specialised'],
        ['Specific enzyme assay', 'Specialised'],
      ], { explanation: 'Pages 14–17.' })
    ),
    learn('Treating the block', [
      'Limit dietary precursors in the affected pathway; supply the missing product (cortisol in CAH); remove or reduce the accumulated product (such as ammonia).',
    ], { sourceRefs: ref([18]) }),
    ask(
      match('c3-05', 'management', 'Match each treatment principle to the consequence of a block it targets.', [
        ['Limit dietary precursors', 'Substrate accumulating before the block'],
        ['Supply the deficient product', 'Product deficiency'],
        ['Remove the accumulated product', 'Toxic build-up such as ammonia'],
      ], { explanation: 'Page 18, linked to page 5.', skill: 'cause-effect' })
    ),
    recall('r3-01', 'management', 'State the three principles of managing an inborn error, with the lecture’s examples.', [
      'Limit the dietary intake of precursors in the affected pathway.',
      'Supply the deficient product — e.g. cortisol in congenital adrenal hyperplasia (CYP21A).',
      'Remove or reduce the accumulated product — e.g. ammonia.',
    ]),
  ],

  // ─── Lesson 4 — Enzyme defects ─────────────────────────────────────
  'inborn-errors-of-metabolism-4': [
    ask(
      mcq('c4-01', 'pku', 'Before you start: PKU blocks the conversion of phenylalanine into which amino acid?', 'Tyrosine', ['Tryptophan', 'Alanine', 'Glycine'], {
        explanation: 'Page 20 figure: phenylalanine hydroxylase converts phenylalanine to tyrosine.',
        skill: 'prediction',
      })
    ),
    learn('Six enzyme defects', [
      'Amino acids: phenylalanine hydroxylase → PKU. Carbohydrate: galactose-1-phosphate uridyl transferase → galactosaemia. Organic acids: methylmalonyl-CoA mutase → methylmalonic aciduria. Complex lipids: hexosaminidase A → Tay-Sachs. Purines: adenosine deaminase → SCID. Porphyrins: porphobilinogen deaminase → acute intermittent porphyria.',
    ], { sourceRefs: ref([19]) }),
    ask(
      match('c4-02', 'enzyme-defects', 'Match each defective enzyme to its disease.', [
        ['Phenylalanine hydroxylase', 'Phenylketonuria'],
        ['Hexosaminidase A', 'Tay-Sachs disease'],
        ['Adenosine deaminase', 'Severe combined immunodeficiency'],
        ['Porphobilinogen deaminase', 'Acute intermittent porphyria'],
      ], { explanation: 'Page 19.' })
    ),
    learn('PKU and galactosaemia', [
      'PKU (autosomal recessive, ~1:10,000): mental retardation, seizures, stunted growth, mousy odour, light hair, eyes and skin.',
      'Galactosaemia (autosomal recessive, 1:30,000–60,000): GALT is defective; jaundice, lethargy, renal tubular dysfunction, cataract.',
    ], { sourceRefs: ref([20, 21]) }),
    ask(
      multi('c4-03', 'pku', 'Which are features of PKU? Select all that apply.', ['Mousy odour', 'Light hair, eyes and skin', 'Seizures'], ['Cataract', 'Kinky hair'], {
        explanation: 'Page 20. Cataract belongs to galactosaemia (page 21); kinky hair to Menkes syndrome (page 31).',
      })
    ),
    learn('MMA', [
      'Methylmalonyl-CoA mutase needs cobalamin (vitamin B12) to make succinyl-CoA. When it fails, methylmalonyl-CoA and propionyl-CoA build up and inhibit the urea cycle and citric acid cycle. Features: respiratory distress, lethargy, muscle weakness and severe ketoacidosis.',
    ], { sourceRefs: ref([22]) }),
    ask(
      mcq('c4-04', 'methylmalonic-aciduria', 'Which vitamin does methylmalonyl-CoA mutase need (page 22 figure)?', 'Cobalamin (vitamin B12)', ['Thiamine (vitamin B1)', 'Vitamin K', 'Biotin'], {
        explanation: 'Page 22 figure.',
      })
    ),
    learn('Tay-Sachs and SCID', [
      'Tay-Sachs: without hexosaminidase A, GM2 ganglioside accumulates in neurons; muscle stiffness, low tone, seizures, cognitive decline; a cherry red spot in the macula.',
      'SCID: without adenosine deaminase, deoxyadenosine becomes dATP, which is toxic to lymphocytes; severe infections, even from breast milk and vaccinations.',
    ], { sourceRefs: ref([23, 24, 25, 26]) }),
    ask(
      mcq('c4-05', 'tay-sachs', 'What accumulates in neurons in Tay-Sachs disease?', 'Ganglioside GM2', ['Glycogen', 'Cystine', 'Copper'], {
        explanation: 'Pages 23–24 figures.',
      })
    ),
    ask(
      order('c4-06', 'scid', 'Put the steps of ADA-deficient SCID in order.', [
        'Adenosine deaminase is missing',
        'Deoxyadenosine is not deaminated to deoxyinosine',
        'Deoxyadenosine is phosphorylated to dAMP, dADP and dATP',
        'dATP is toxic to lymphocytes',
      ], { explanation: 'Page 25 figure.' })
    ),
    recall('r4-01', 'enzyme-defects', 'List the six enzyme defects on page 19: the metabolic class, the enzyme and the disease for each.', [
      'Amino acids — phenylalanine hydroxylase — phenylketonuria.',
      'Carbohydrate — galactose-1-phosphate uridyl transferase — galactosaemia.',
      'Organic acids — methylmalonyl-CoA mutase — methylmalonic aciduria.',
      'Complex lipids — hexosaminidase A — Tay-Sachs disease.',
      'Purines — adenosine deaminase — severe combined immunodeficiency.',
      'Porphyrins — porphobilinogen deaminase — acute intermittent porphyria.',
    ]),
  ],

  // ─── Lesson 5 — Transport protein defects ──────────────────────────
  'inborn-errors-of-metabolism-5': [
    ask(
      mcq('c5-01', 'transport-defects', 'Before you start: haemoglobin carries oxygen between organs. Which disease does the lecture list as its transport defect?', 'Thalassaemia (and haemoglobin variants)', ['Cystinosis', 'Menkes syndrome', 'Cystic fibrosis'], {
        explanation: 'Page 27: inter-organ transport — haemoglobin — thalassaemia/haemoglobin variants.',
        skill: 'prediction',
      })
    ),
    learn('Four transport sites', [
      'Inter-organ: haemoglobin → thalassaemia. Organelle membrane: lysosomal cystine transporter → cystinosis. Intracellular: copper transport protein → Menkes syndrome. Epithelial membrane: chloride transporter in lungs, sweat glands and pancreas → cystic fibrosis.',
    ], { sourceRefs: ref([27]) }),
    ask(
      match('c5-02', 'transport-defects', 'Match each transport site to its disease.', [
        ['Inter-organ', 'Thalassaemia'],
        ['Organelle membrane', 'Cystinosis'],
        ['Intracellular transport', 'Menkes syndrome'],
        ['Epithelial membrane', 'Cystic fibrosis'],
      ], { explanation: 'Page 27.' })
    ),
    learn('Thalassaemias', [
      'Deletions and/or mutations of the β or α subunit of HbA (α₂β₂). β-thalassaemia: the genes are present but mRNA is poorly made or quickly degraded, so unpaired α-chains build up. α-thalassaemia: α genes (four in all) are deleted, so β-chain tetramers build up. Features: jaundice, hyperuricaemia, gallstones.',
    ], { sourceRefs: ref([28]) }),
    ask(
      mcq('c5-03', 'thalassaemia', 'In β-thalassaemia, which chains build up in excess?', 'Unpaired α-chains', ['Unpaired β-chains', 'γ-chains only', 'None — chain levels stay balanced'], {
        explanation: 'Page 28 figure.',
        skill: 'cause-effect',
      })
    ),
    learn('Cystic fibrosis', [
      'CFTR (cystic fibrosis transmembrane conductance regulator) moves chloride. When it fails, sodium uptake continues and the mucus dehydrates. Features: very salty skin, persistent cough, frequent lung infections, poor growth and weight gain.',
    ], { sourceRefs: ref([29]) }),
    ask(
      fill('c5-04', 'cystic-fibrosis', 'CFTR stands for cystic fibrosis transmembrane ____ regulator.', ['conductance'], {
        explanation: 'Page 29.',
        skill: 'terminology',
      })
    ),
    learn('Cystinosis and Menkes', [
      'Cystinosis (autosomal recessive): cystine is trapped in lysosomes; photophobia, Fanconi syndrome, failure to thrive.',
      'Menkes syndrome (X-linked recessive): faulty copper transport (ATP7A); brittle “kinky” hair, loss of muscle tone, mental retardation and seizures.',
    ], { sourceRefs: ref([30, 31]) }),
    ask(
      mcq('c5-05', 'menkes', 'Which inheritance pattern does Menkes syndrome have?', 'X-linked recessive', ['Autosomal recessive', 'Autosomal dominant', 'Mitochondrial'], {
        explanation: 'Page 31. The other transport defects here are autosomal recessive.',
      })
    ),
    recall('r5-01', 'thalassaemia', 'Contrast the molecular basis of α- and β-thalassaemia.', [
      'Both involve deletions/mutations of a subunit of HbA (α₂β₂).',
      'β: the β genes are present, but their mRNA is made inefficiently or rapidly degraded → fewer β-chains → excess unpaired α-chains.',
      'α: α genes are deleted (there are four) → fewer α-chains → excess β-chain tetramers; four deleted → Hb Barts hydrops fetalis (fatal).',
    ]),
  ],

  // ─── Lesson 6 — Structural, homeostatic and signalling defects ─────
  'inborn-errors-of-metabolism-6': [
    ask(
      mcq('c6-01', 'structural-defects', 'Before you start: a mutation in collagen, the main protein of bone, causes which disease in the lecture?', 'Osteogenesis imperfecta', ['Hereditary spherocytosis', 'Duchenne muscular dystrophy', 'Zellweger syndrome'], {
        explanation: 'Page 32.',
        skill: 'prediction',
      })
    ),
    learn('Structural proteins', [
      'Extracellular: collagen → osteogenesis imperfecta. Cell membrane: spectrin → hereditary spherocytosis. Cytoskeleton: dystrophin → Duchenne/Becker muscular dystrophy. Organelle: a peroxisome biogenesis protein → Zellweger syndrome.',
    ], { sourceRefs: ref([32]) }),
    ask(
      match('c6-02', 'structural-defects', 'Match each protein to its disease.', [
        ['Spectrin', 'Hereditary spherocytosis'],
        ['Dystrophin', 'Duchenne/Becker muscular dystrophy'],
        ['Peroxisome biogenesis protein', 'Zellweger syndrome'],
      ], { explanation: 'Page 32.' })
    ),
    learn('OI and Zellweger', [
      'Osteogenesis imperfecta (autosomal dominant, 1:20,000; COL1A1, glycine substitution): frequent fractures, bone deformity, bluish whites of the eyes.',
      'Zellweger (autosomal recessive): dysmorphic face, brain–liver–kidney degeneration, very-long-chain fatty acids accumulate.',
    ], { sourceRefs: ref([33, 34]) }),
    ask(
      tf({
        id: 'c6-03', conceptId: 'osteogenesis-imperfecta',
        statement: 'Osteogenesis imperfecta is autosomal recessive.',
        answer: false,
        explanation: 'Page 33: it is autosomal dominant — unlike most of the lecture’s other examples.',
        skill: 'misconception',
      })
    ),
    learn('Extracellular homeostasis', [
      'Complement proteins → complement C3 deficiency; factor VIII → haemophilia A; α1-antitrypsin → pulmonary emphysema.',
      'Haemophilia A (X-linked, 1:5,000): without factor VIII, the platelet plug is weak and the fibrin clot incomplete or delayed — spontaneous bleeding, deep tissue haemorrhage, easy bruising, haematuria.',
    ], { sourceRefs: ref([35, 36]) }),
    ask(
      mcq('c6-04', 'homeostasis-defects', 'Which disease results from a defect in α1-antitrypsin?', 'Pulmonary emphysema', ['Haemophilia A', 'Complement C3 deficiency', 'Cystic fibrosis'], {
        explanation: 'Page 35: protease inhibition — α1-antitrypsin — pulmonary emphysema.',
      })
    ),
    learn('Growth control, receptors and hormones', [
      'Rb (tumour suppressor) → retinoblastoma and osteosarcoma; bcr-abl → chronic myelogenous leukaemia.',
      'Rhodopsin → retinitis pigmentosa; red/green opsins → X-linked colour blindness; LDL receptor → familial hypercholesterolaemia; growth hormone → dwarfism; insulin → type II diabetes; vitamin D receptor → vitamin D-dependent rickets; androgen receptor → testicular feminisation.',
    ], { sourceRefs: ref([37, 38]) }),
    ask(
      match('c6-05', 'receptor-hormone-defects', 'Match each defective receptor to its disease.', [
        ['LDL receptor', 'Familial hypercholesterolaemia'],
        ['Androgen receptor', 'Testicular feminisation'],
        ['Vitamin D receptor', 'Vitamin D-dependent rickets'],
        ['Rhodopsin', 'Retinitis pigmentosa'],
      ], { explanation: 'Page 38.' })
    ),
    recall('r6-01', 'haemophilia-a', 'Explain why a lack of factor VIII causes bleeding, and list the features of haemophilia A.', [
      'After injury the vessel constricts and clotting factors are activated.',
      'Normally factor VIII helps form a strong platelet plug, then a stable fibrin clot seals the injury.',
      'Without factor VIII the plug is weak and fibrin clot formation is incomplete or delayed, so bleeding continues.',
      'X-linked, 1:5,000: spontaneous bleeding, deep tissue haemorrhage, easy bruising, haematuria.',
    ]),
  ],
};

export const readingExtras: Record<
  string,
  { highYield: string[]; confusions: LessonConfusion[]; estimatedMinutes: number; xp: number }
> = {
  'inborn-errors-of-metabolism-1': {
    estimatedMinutes: 8,
    xp: 20,
    highYield: [
      'Garrod (early 1900s, alkaptonuria): a defective enzyme → inborn error of metabolism.',
      'Block B → C: substrate excess, product deficiency, alternate pathway (toxic metabolite), effects on other reactions.',
      'Early (PKU), late (gout), external factors (G6PD deficiency).',
      'Remote product: ↓ cortisol in CAH (21-hydroxylase). Feedback: ↑ TSH in hypothyroidism.',
    ],
    confusions: [
      { confusion: 'Inborn errors always show at birth.', clarification: 'They are present from birth but may appear much later (gout) or only with an external trigger (G6PD deficiency).' },
      { confusion: 'A blocked enzyme only affects its own product.', clarification: 'Substrate builds up, is diverted to other pathways, and can disturb other reactions and remote products.' },
    ],
  },
  'inborn-errors-of-metabolism-2': {
    estimatedMinutes: 8,
    xp: 20,
    highYield: [
      'Chromatography and electrophoresis; urine and blood first.',
      'Prenatal: amniotic-fluid fibroblasts; chorionic villus sampling (first trimester).',
      'Screen if: not yet apparent but common; treatable; results before irreversible damage; simple, reliable test.',
      'UK: days 5–8 — hypothyroidism, PKU, sickle cell/thalassaemia, galactosaemia, CAH.',
    ],
    confusions: [
      { confusion: 'Screening targets diseases that are already obvious at birth.', clarification: 'Screening is for diseases NOT yet clinically apparent, so treatment can start before damage.' },
      { confusion: 'Glucose-6-phosphatase and G6PD are the same enzyme.', clarification: 'They are different enzymes; page 10 lists glucose-6-phosphatase deficiency, page 4 uses G6PD deficiency.' },
    ],
  },
  'inborn-errors-of-metabolism-3': {
    estimatedMinutes: 10,
    xp: 25,
    highYield: [
      'Suspect with bizarre, unexplained findings: vomiting, failure to thrive, hepatosplenomegaly, jaundice, odd smell, hypoglycaemia, metabolic acidosis, renal calculi.',
      'Late: intellectual disability, neuropathy, short stature.',
      'Specialised: amino acids (chromatography), orotic and organic acids, carnitine, mass spectroscopy, enzyme assays, DNA, histology.',
      'Manage: limit precursors; supply product (cortisol in CAH); remove accumulated product (ammonia).',
    ],
    confusions: [
      { confusion: 'Plasma ammonia is a specialised test.', clarification: 'It is one of the routine investigations (page 14); urine orotic acid is specialised (page 16).' },
      { confusion: 'Treatment means replacing the missing enzyme.', clarification: 'The lecture’s principles act on the pathway: limit precursors, supply the deficient product, remove the accumulated one.' },
    ],
  },
  'inborn-errors-of-metabolism-4': {
    estimatedMinutes: 12,
    xp: 30,
    highYield: [
      'PAH → PKU; GALT → galactosaemia; methylmalonyl-CoA mutase (B12) → MMA; hexosaminidase A → Tay-Sachs; ADA → SCID; PBG deaminase → AIP.',
      'PKU: mousy odour, light hair/eyes/skin, seizures, mental retardation.',
      'Galactosaemia: cataract, jaundice, renal tubular dysfunction.',
      'Tay-Sachs: GM2 in neurons, cherry red spot. SCID: dATP lymphotoxicity; “bubble boy”.',
    ],
    confusions: [
      { confusion: 'Galactosaemia is caused by galactokinase deficiency.', clarification: 'The lecture’s defect is galactose-1-phosphate uridyl transferase (GALT).' },
      { confusion: 'SCID is always X-linked.', clarification: 'The lecture lists it as autosomal recessive or X-linked; the ADA form is a purine-enzyme defect.' },
    ],
  },
  'inborn-errors-of-metabolism-5': {
    estimatedMinutes: 10,
    xp: 25,
    highYield: [
      'Haemoglobin → thalassaemia; lysosomal cystine transporter → cystinosis; copper transporter → Menkes; chloride transporter (CFTR) → cystic fibrosis.',
      'β-thal: mRNA defect → excess α-chains. α-thal: gene deletion (4 genes) → excess β tetramers.',
      'CF: salty skin, cough, lung infections, poor growth; dehydrated mucus.',
      'Menkes is X-linked recessive: kinky hair, low tone, seizures.',
    ],
    confusions: [
      { confusion: 'In β-thalassaemia the β-globin genes are deleted.', clarification: 'In β-thalassaemia the genes are present but their mRNA is poorly made or degraded; deletion is typical of α-thalassaemia (page 28).' },
      { confusion: 'Cystinosis is a defect of a plasma-membrane transporter.', clarification: 'The defective cystine transporter is in the lysosomal (organelle) membrane.' },
    ],
  },
  'inborn-errors-of-metabolism-6': {
    estimatedMinutes: 12,
    xp: 30,
    highYield: [
      'Collagen → OI (autosomal dominant; COL1A1, glycine substitution; fractures, blue sclerae); spectrin → hereditary spherocytosis; dystrophin → DMD/BMD; peroxisome biogenesis → Zellweger.',
      'Factor VIII → haemophilia A (X-linked); α1-antitrypsin → emphysema; complement → C3 deficiency.',
      'Rb → retinoblastoma/osteosarcoma; bcr-abl → CML.',
      'LDL receptor → familial hypercholesterolaemia; androgen receptor → testicular feminisation; vitamin D receptor → rickets.',
    ],
    confusions: [
      { confusion: 'Every inborn error is autosomal recessive.', clarification: 'Osteogenesis imperfecta is autosomal dominant; haemophilia A and Menkes are X-linked.' },
      { confusion: 'Zellweger syndrome is a lysosomal disease.', clarification: 'It is a defect of peroxisome biogenesis; very-long-chain fatty acids accumulate.' },
    ],
  },
};
