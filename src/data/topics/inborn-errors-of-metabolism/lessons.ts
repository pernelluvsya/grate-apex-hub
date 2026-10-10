// Biochemistry → Inborn Errors of Metabolism — the six lessons (reading
// layer). Source: S. N. Darko's lecture (38-page PDF) and its figures;
// Lehninger (leh(...)) only explains or settles points within that scope.
import type { LessonDraft } from '@/data/topics/build';
import { interactive, readingExtras } from '@/data/topics/inborn-errors-of-metabolism/interactive';
import { leh, ref, type ConceptId } from '@/data/topics/inborn-errors-of-metabolism/sources';

type Draft = LessonDraft<ConceptId>;

// ─── Lesson 1 ───────────────────────────────────────────────────────

const lesson1: Draft = {
  id: 'inborn-errors-of-metabolism-1',
  title: 'What Inborn Errors Are',
  description: 'Garrod’s idea, when inborn errors appear, and what a blocked enzyme does to a pathway.',
  xp: 20,
  sourceRefs: ref([2, 3, 4, 5, 6]),
  objectives: [
    'Explain Garrod’s hypothesis using the A → B → C model',
    'Give examples of inborn errors that appear early, late, or only with an external trigger',
    'List the four biochemical consequences of a metabolic block',
    'Explain reduced remote products and disturbed feedback, with the lecture’s examples',
  ],
  chunks: [
    {
      title: 'Garrod’s hypothesis',
      kind: 'overview',
      paragraphs: [
        'In the early 1900s, Garrod studied alkaptonuria and hypothesised that a defective enzyme leads to an “inborn error in metabolism”. The slide sums the idea up as one gene → one enzyme (page 3).',
        'The page 3 figure shows the model: in a pathway A → B → C, the enzyme for B → C is blocked. B piles up (substrate excess), C is lacking (product deficiency), and B is pushed down a side route to D, a toxic metabolite.',
      ],
      sourceRefs: [...ref([3]), ...leh(681, 924)],
      notes: [
        { kind: 'textbook', text: 'Lehninger: Garrod discovered in the early 1900s that alkaptonuria is inherited and traced it to the absence of a single enzyme — the first link between an inherited trait and an enzyme (p. 681). The phrase “one gene–one enzyme” comes from Beadle and Tatum’s 1940 hypothesis, later broadened to one gene–one polypeptide (p. 924).' },
      ],
    },
    {
      title: 'When inborn errors show themselves',
      kind: 'overview',
      paragraphs: ['An inborn error is present from birth, but its effects can appear at very different times (page 4):'],
      table: {
        columns: ['Pattern', 'Lecture example'],
        rows: [
          ['Early in life', 'Phenylketonuria (PKU)'],
          ['Much later in life', 'Gout'],
          ['Depends on external factors', 'Glucose-6-phosphate dehydrogenase (G6PD) deficiency'],
        ],
      },
      sourceRefs: [...ref([4]), ...leh(551)],
      notes: [
        { kind: 'textbook', text: 'Lehninger: most people with G6PD deficiency have no symptoms; red cells break down only when the deficiency meets an environmental trigger, such as fava beans, the antimalarial primaquine, sulfa antibiotics or certain herbicides (p. 551).' },
      ],
    },
    {
      title: 'Consequences of a metabolic block',
      kind: 'mechanism',
      paragraphs: ['When an enzyme step is blocked, four biochemical consequences follow (page 5) — the same ones Garrod’s figure shows:'],
      steps: [
        { label: 'Accumulation of substrate', detail: 'B piles up behind the block.' },
        { label: 'Reduced formation of product', detail: 'C is deficient.' },
        { label: 'Use of an alternate pathway', detail: 'B is diverted, e.g. to D.' },
        { label: 'Effects on other metabolic reactions', detail: 'Built-up or diverted compounds disturb other pathways.' },
      ],
      sourceRefs: ref([3, 5]),
    },
    {
      title: 'Remote products and feedback',
      kind: 'regulation',
      paragraphs: ['Some inborn errors show two further features (page 6):'],
      table: {
        columns: ['Feature', 'Lecture example'],
        rows: [
          ['Reduced formation of remote products', '↓ cortisol due to 21-hydroxylase deficiency in congenital adrenal hyperplasia (CAH)'],
          ['Interference with feedback control', '↑ TSH in hypothyroidism'],
        ],
      },
      keyPoints: ['A remote product is made several steps beyond the block, so it is lacking even though its own enzyme works.'],
      sourceRefs: ref([6]),
    },
  ],
  summary: [
    'Garrod (early 1900s) studied alkaptonuria: a defective enzyme causes an “inborn error in metabolism” — summed up on the slide as one gene → one enzyme.',
    'Garrod’s model: block B → C → B accumulates, C is deficient, B is diverted to a toxic metabolite D.',
    'Onset can be early (PKU), late (gout) or depend on external factors (G6PD deficiency).',
    'Consequences of a block: substrate accumulates, product falls, an alternate pathway is used, other reactions are affected.',
    'Extra features: reduced remote products (↓ cortisol in CAH, 21-hydroxylase) and disturbed feedback (↑ TSH in hypothyroidism).',
  ],
};

// ─── Lesson 2 ───────────────────────────────────────────────────────

const lesson2: Draft = {
  id: 'inborn-errors-of-metabolism-2',
  title: 'Detection and Newborn Screening',
  description: 'How inborn errors are detected before and after birth, what makes a disease worth screening for, and the UK newborn screen.',
  xp: 20,
  sourceRefs: ref([7, 8, 9, 10]),
  objectives: [
    'Name the two techniques behind most chemical detection of inborn errors',
    'List the first and the further specimens examined',
    'Describe two ways of diagnosing an inborn error before birth',
    'State the four criteria for neonatal screening',
    'Recall when, and for what, UK newborns are screened',
  ],
  chunks: [
    {
      title: 'Detecting inborn errors',
      kind: 'overview',
      paragraphs: [
        'Detection relies heavily on chemical investigations based on chromatography and electrophoresis (page 7).',
        'The first specimens examined are usually urine and blood. Others include leucocyte concentrates, red cell haemolysates, and biopsies of the skin, liver and thyroid (page 7).',
      ],
      sourceRefs: ref([7]),
    },
    {
      title: 'Diagnosis before birth',
      kind: 'overview',
      paragraphs: ['Two approaches are named on page 8:'],
      steps: [
        { label: 'Fibroblasts cultured from the amniotic fluid', detail: 'Used for prenatal diagnosis.' },
        { label: 'Chorionic villus sampling', detail: 'Used during the first trimester for prenatal screening.' },
      ],
      sourceRefs: ref([8]),
    },
    {
      title: 'Criteria for neonatal screening',
      kind: 'classification',
      paragraphs: ['A disease is worth screening for in newborns when (page 9):'],
      steps: [
        { label: 'It is not clinically apparent at the time of screening, and is relatively common in the population' },
        { label: 'It is treatable, or early treatment improves the outcome' },
        { label: 'Results are available before irreversible damage occurs' },
        { label: 'The test is simple and reliable' },
      ],
      sourceRefs: ref([9]),
      notes: [
        { kind: 'textbook', text: 'Lehninger uses PKU as the example: newborn screening tests are inexpensive, and early detection and treatment prevent much of the damage (p. 681).' },
      ],
    },
    {
      title: 'The UK newborn screen',
      kind: 'clinical',
      paragraphs: ['In the United Kingdom, babies are screened between the 5th and 8th day after birth for (page 10):'],
      steps: [
        { label: 'Neonatal hypothyroidism' },
        { label: 'Phenylketonuria' },
        { label: 'Sickle cell disease and thalassaemia' },
        { label: 'Glucose-6-phosphatase deficiency' },
        { label: 'Galactosaemia' },
        { label: 'Congenital adrenal hyperplasia' },
      ],
      sourceRefs: ref([10]),
      notes: [
        { kind: 'check', text: 'Page 10 lists glucose-6-phosphatase deficiency; page 4’s example of an external-factor disease is glucose-6-phosphate dehydrogenase (G6PD) deficiency — a different enzyme. Confirm with your lecturer which one page 10 means; this item is not quizzed.' },
      ],
    },
  ],
  summary: [
    'Detection: chemical tests based on chromatography and electrophoresis; urine and blood first.',
    'Other specimens: leucocyte concentrates, red cell haemolysates, skin/liver/thyroid biopsies.',
    'Prenatal: cultured amniotic-fluid fibroblasts; chorionic villus sampling in the first trimester.',
    'Screening criteria: not yet apparent but relatively common; treatable; results before irreversible damage; simple, reliable test.',
    'UK: screening on days 5–8 for neonatal hypothyroidism, PKU, sickle cell/thalassaemia, galactosaemia, CAH (and the page 10 G6Pase item — check).',
  ],
};

// ─── Lesson 3 ───────────────────────────────────────────────────────

const lesson3: Draft = {
  id: 'inborn-errors-of-metabolism-3',
  title: 'Suspecting, Investigating and Managing an IEM',
  description: 'The warning signs in an infant, late findings, the routine and specialised tests, and the three principles of treatment.',
  xp: 25,
  sourceRefs: ref([11, 12, 13, 14, 15, 16, 17, 18]),
  objectives: [
    'Recognise the features that should make you suspect an inborn error in an infant',
    'Name the three late clinical findings',
    'List the routine laboratory investigations for a suspected IEM',
    'Distinguish specialised tests from routine ones',
    'State the three principles of management, with examples',
  ],
  chunks: [
    {
      title: 'When to suspect an inborn error',
      kind: 'clinical',
      paragraphs: ['Suspect an inborn error when an infant has bizarre and unexplained clinical or laboratory findings. Suggestive features (pages 11–12):'],
      steps: [
        { label: 'Persistent vomiting' },
        { label: 'Failure to thrive' },
        { label: 'Hepatosplenomegaly' },
        { label: 'Persistent jaundice' },
        { label: 'Retarded mental development, fits or spasticity' },
        { label: 'Peculiar smell or staining of the napkins' },
        { label: 'Hypoglycaemia' },
        { label: 'Metabolic acidosis' },
        { label: 'Renal calculi' },
      ],
      sourceRefs: ref([11, 12]),
    },
    {
      title: 'Late clinical findings',
      kind: 'clinical',
      paragraphs: ['Findings that appear later (page 13): intellectual disability, neuropathy and short stature.'],
      sourceRefs: ref([13]),
    },
    {
      title: 'Routine laboratory investigations',
      kind: 'overview',
      paragraphs: ['For a suspected IEM, routine tests are (pages 14–15):'],
      steps: [
        { label: 'Full blood count' },
        { label: 'Serum electrolytes, bicarbonate and blood gases', detail: 'In cases of acid–base disturbance.' },
        { label: 'Renal function tests' },
        { label: 'Liver function tests' },
        { label: 'Plasma ammonia' },
        { label: 'Blood glucose' },
        { label: 'Urine ketones' },
        { label: 'Lipid profile' },
        { label: 'Serum uric acid' },
        { label: 'Thyroid function tests' },
        { label: 'Porphyrins' },
      ],
      sourceRefs: ref([14, 15]),
    },
    {
      title: 'Specialised tests',
      kind: 'overview',
      paragraphs: ['Specialised tests target particular pathways or confirm the defect (pages 16–17):'],
      steps: [
        { label: 'Plasma and urine amino acids', detail: 'By chromatography.' },
        { label: 'Urine orotic acid' },
        { label: 'Urine organic acids' },
        { label: 'Plasma carnitine' },
        { label: 'Metabolites in urine and plasma', detail: 'By mass spectroscopy.' },
        { label: 'Specific enzyme assays' },
        { label: 'DNA analysis of leucocytes or fibroblasts' },
        { label: 'Histological studies of affected tissue' },
      ],
      sourceRefs: ref([16, 17]),
    },
    {
      title: 'Principles of management',
      kind: 'clinical',
      paragraphs: ['Treatment follows directly from the consequences of a metabolic block (page 18):'],
      table: {
        columns: ['Principle', 'Aim / example'],
        rows: [
          ['Limit dietary intake of precursors in the affected pathway', 'Less substrate reaches the block'],
          ['Supply the deficient metabolic product', 'Cortisol in CAH (CYP21A)'],
          ['Remove or reduce the accumulated product', 'Ammonia'],
        ],
      },
      sourceRefs: [...ref([18]), ...leh(680)],
      notes: [
        { kind: 'textbook', text: 'Lehninger’s example of the first principle: in PKU recognised early in infancy, rigid dietary control — supplying only enough phenylalanine and tyrosine for protein synthesis — largely prevents mental retardation (p. 680).' },
      ],
    },
  ],
  summary: [
    'Suspect an IEM with bizarre, unexplained findings in an infant: vomiting, failure to thrive, hepatosplenomegaly, jaundice, developmental delay/fits/spasticity, odd smell or napkin staining, hypoglycaemia, metabolic acidosis, renal calculi.',
    'Late findings: intellectual disability, neuropathy, short stature.',
    'Routine tests: FBC, electrolytes/bicarbonate/blood gases, renal and liver function, ammonia, glucose, urine ketones, lipids, uric acid, thyroid function, porphyrins.',
    'Specialised: amino acids (chromatography), orotic acid, organic acids, carnitine, mass spectroscopy, enzyme assays, DNA analysis, histology.',
    'Management: limit precursors; supply the missing product (cortisol in CAH); remove the accumulated product (ammonia).',
  ],
};

// ─── Lesson 4 ───────────────────────────────────────────────────────

const lesson4: Draft = {
  id: 'inborn-errors-of-metabolism-4',
  title: 'Enzyme Defects',
  description: 'Six enzyme defects across metabolism — PKU, galactosaemia, methylmalonic aciduria, Tay-Sachs, SCID and acute intermittent porphyria.',
  xp: 30,
  sourceRefs: ref([19, 20, 21, 22, 23, 24, 25, 26]),
  objectives: [
    'Match each metabolic class to its defective enzyme and disease',
    'Describe the inheritance, incidence and features of PKU, galactosaemia, MMA, Tay-Sachs and SCID',
    'Explain each defect using the lecture’s pathway figures',
  ],
  chunks: [
    {
      title: 'Mutations in different classes of enzymes',
      kind: 'classification',
      paragraphs: ['Page 19 sorts enzyme defects by the area of metabolism affected:'],
      table: {
        columns: ['Function affected', 'Defective enzyme', 'Disease'],
        rows: [
          ['Amino acids', 'Phenylalanine hydroxylase', 'Phenylketonuria (PKU)'],
          ['Carbohydrate', 'Galactose-1-phosphate uridyl transferase', 'Galactosaemia'],
          ['Organic acids', 'Methylmalonyl-CoA mutase', 'Methylmalonic aciduria'],
          ['Complex lipids', 'Hexosaminidase A', 'Tay-Sachs disease'],
          ['Purines', 'Adenosine deaminase', 'Severe combined immunodeficiency (SCID)'],
          ['Porphyrins', 'Porphobilinogen deaminase', 'Acute intermittent porphyria'],
        ],
      },
      sourceRefs: ref([19]),
    },
    {
      title: 'Phenylketonuria (PKU)',
      kind: 'clinical',
      paragraphs: [
        'Phenylalanine hydroxylase (PAH) converts phenylalanine to tyrosine; in PKU this step fails. The PAH gene is on chromosome 12 (page 20 figure).',
        'PKU is autosomal recessive, with an incidence of about 1 in 10,000. Features: mental retardation, seizures, stunted growth, a mousy odour, and light hair, eyes and skin (page 20).',
        'The figure’s inheritance diagram: when both parents are unaffected carriers, each child has a 25% chance of being affected, 50% of being an unaffected carrier and 25% of being unaffected.',
      ],
      sourceRefs: [...ref([20]), ...leh(679, 680)],
      notes: [
        { kind: 'textbook', text: 'Lehninger: excess phenylalanine is diverted to phenylpyruvate (a phenylketone, hence the name); phenylacetate gives the urine its characteristic odour (pp. 679–680).' },
      ],
    },
    {
      title: 'Galactosaemia',
      kind: 'clinical',
      paragraphs: [
        'Lactase splits lactose into glucose and galactose. Galactokinase makes galactose-1-phosphate, and galactose-1-phosphate uridyl transferase (GALT) converts it, with UDP-glucose, into glucose-1-phosphate and UDP-galactose (page 21 figure). In galactosaemia GALT is defective (page 19).',
        'Autosomal recessive; incidence 1 in 30,000–60,000. Features: jaundice, lethargy, renal tubular dysfunction and cataract (page 21).',
      ],
      sourceRefs: ref([19, 21]),
    },
    {
      title: 'Methylmalonic aciduria (MMA)',
      kind: 'clinical',
      paragraphs: [
        'Isoleucine, valine, methionine and threonine, odd-chain fatty acids and gut flora all feed into methylmalonyl-CoA. Methylmalonyl-CoA mutase, which needs cobalamin (vitamin B12), converts it to succinyl-CoA for energy. When the mutase is defective, methylmalonyl-CoA rises and backs up to propionyl-CoA, which inhibits the urea cycle, the citric acid cycle and other pathways (page 22 figure).',
        'Autosomal recessive; incidence 1 in 50,000–100,000. Features: respiratory distress, lethargy, muscle weakness and severe ketoacidosis (page 22).',
      ],
      sourceRefs: ref([19, 22]),
      notes: [{ kind: 'lecturer', text: 'The table calls it methylmalonic aciduria; the figure is titled methylmalonic acidaemia (MMA) — the same block seen in urine and in blood.' }],
    },
    {
      title: 'Tay-Sachs disease',
      kind: 'clinical',
      paragraphs: [
        'Lysosomes normally digest ganglioside GM2 using hexosaminidase A. In Tay-Sachs, a HEXA gene mutation leaves lysosomes with every digestive enzyme except hexosaminidase A, so GM2 cannot be digested and residual vacuoles accumulate in neurons. The neurons swell with lamellar inclusions and degenerate, and a “cherry red spot” appears in the macula (pages 23–24 figures).',
        'Autosomal recessive; incidence about 1 in 320,000. Features: muscle stiffness and restricted movement, diminished muscle tone, seizures, and deterioration of cognitive processes (pages 23–24).',
      ],
      sourceRefs: ref([19, 23, 24]),
    },
    {
      title: 'Severe combined immunodeficiency (SCID)',
      kind: 'clinical',
      paragraphs: [
        'Adenosine deaminase (ADA) deaminates deoxyadenosine to deoxyinosine. Without ADA, deoxyadenosine is phosphorylated to dAMP, dADP and then dATP, which is toxic to lymphocytes (lymphotoxicity) (page 25 figure).',
        'Autosomal recessive or X-linked; incidence about 1 in 100,000. Features: severe yeast and bacterial infections, and viral infection from breast milk and vaccinations. The “bubble boy” image (page 26) shows why: affected children had to be protected from all infection.',
      ],
      sourceRefs: ref([19, 25, 26]),
    },
  ],
  summary: [
    'Amino acids → phenylalanine hydroxylase → PKU; carbohydrate → GALT → galactosaemia; organic acids → methylmalonyl-CoA mutase → MMA; complex lipids → hexosaminidase A → Tay-Sachs; purines → ADA → SCID; porphyrins → PBG deaminase → acute intermittent porphyria.',
    'PKU (AR, 1:10,000): mental retardation, seizures, stunted growth, mousy odour, light hair/eyes/skin.',
    'Galactosaemia (AR, 1:30,000–60,000): jaundice, lethargy, renal tubular dysfunction, cataract.',
    'MMA (AR, 1:50,000–100,000): respiratory distress, lethargy, muscle weakness, severe ketoacidosis; mutase needs vitamin B12.',
    'Tay-Sachs (AR, 1:320,000): GM2 accumulates in neurons; stiffness, low tone, seizures, cognitive decline; cherry red spot.',
    'SCID (AR or X-linked, 1:100,000): dATP is lymphotoxic; severe infections, even from breast milk and vaccines.',
  ],
};

// ─── Lesson 5 ───────────────────────────────────────────────────────

const lesson5: Draft = {
  id: 'inborn-errors-of-metabolism-5',
  title: 'Transport Protein Defects',
  description: 'When a carrier or channel fails: thalassaemias, cystinosis, Menkes syndrome and cystic fibrosis.',
  xp: 25,
  sourceRefs: ref([27, 28, 29, 30, 31]),
  objectives: [
    'Match each transport site to its defective protein and disease',
    'Explain the molecular basis of α- and β-thalassaemia',
    'Describe how CFTR failure dehydrates airway mucus',
    'Recall the inheritance, incidence and features of each disease',
  ],
  chunks: [
    {
      title: 'Mutations in transport proteins',
      kind: 'classification',
      paragraphs: ['Page 27 (printed slide 28):'],
      table: {
        columns: ['Site', 'Defective protein', 'Disease'],
        rows: [
          ['Inter-organ', 'Haemoglobin', 'Thalassaemia / haemoglobin variants'],
          ['Organelle membrane', 'Lysosomal cystine transport protein', 'Cystinosis'],
          ['Intracellular transport', 'Copper transport protein', 'Menkes syndrome'],
          ['Epithelial membrane', 'Chloride transport protein in lungs, sweat glands and pancreas', 'Cystic fibrosis'],
        ],
      },
      sourceRefs: ref([27]),
    },
    {
      title: 'Thalassaemias',
      kind: 'clinical',
      paragraphs: [
        'Thalassaemias are caused by deletions and/or mutations of either the β or the α subunit of normal adult haemoglobin (HbA, α₂β₂) (page 28 figure).',
        'Autosomal recessive; incidence 4.4 per 10,000 live births. Features: jaundice, hyperuricaemia and gallstones (page 28).',
      ],
      table: {
        columns: ['', 'β-thalassaemia', 'α-thalassaemia'],
        rows: [
          ['Genetic defect', 'β genes present, but mRNA made inefficiently or rapidly degraded', 'α genes deleted (4 α genes in total)'],
          ['Result', '↓ β-chains → excess unpaired α-chains', '↓ α-chains → excess β-chain tetramers'],
          ['Forms', 'Minor trait, intermedia (relatively mild), major (severe)', '1–2 genes lost: carrier traits; 3: HbH disease; 4: Hb Barts hydrops fetalis (fatal)'],
        ],
      },
      sourceRefs: ref([28]),
    },
    {
      title: 'Cystic fibrosis',
      kind: 'clinical',
      paragraphs: [
        'The defective protein is CFTR, the cystic fibrosis transmembrane conductance regulator — a chloride transporter in the lungs, sweat glands and pancreas (pages 27, 29). Normally CFTR moves Cl⁻ onto the airway surface while ENaC absorbs Na⁺. In cystic fibrosis Cl⁻ movement fails while Na⁺ absorption continues, leaving dehydrated mucus (page 29 figure).',
        'Autosomal recessive; incidence 1 in 3,000–6,000. Features: very salty-tasting skin, persistent cough, frequent lung infections, and poor growth and weight gain (page 29).',
      ],
      sourceRefs: ref([27, 29]),
    },
    {
      title: 'Cystinosis',
      kind: 'clinical',
      paragraphs: [
        'The CTNS gene encodes cystinosin, an H⁺-driven cystine transporter in the lysosomal membrane. When it fails, cystine is trapped and accumulates inside lysosomes, causing multisystemic disease (page 30 figure).',
        'Autosomal recessive; incidence 1 in 100,000–200,000. Features: photophobia, Fanconi syndrome and failure to thrive (page 30).',
      ],
      sourceRefs: ref([27, 30]),
    },
    {
      title: 'Menkes syndrome',
      kind: 'clinical',
      paragraphs: [
        'The defective protein moves copper inside cells. The figure shows ATP7A, a copper-transporting ATPase that shuttles between the trans-Golgi and the plasma membrane to export copper (page 31 figure).',
        'X-linked recessive; incidence about 1 in 300,000. Features: brittle, “kinky” hair; loss of muscle tone; mental retardation and seizures (page 31).',
      ],
      sourceRefs: ref([27, 31]),
    },
  ],
  summary: [
    'Inter-organ: haemoglobin → thalassaemia; organelle membrane: lysosomal cystine transporter → cystinosis; intracellular: copper transporter → Menkes; epithelial: chloride transporter (CFTR) → cystic fibrosis.',
    'Thalassaemia (AR, 4.4/10,000): jaundice, hyperuricaemia, gallstones. β: mRNA problem → excess α; α: gene deletion (4 genes) → excess β tetramers.',
    'Cystic fibrosis (AR, 1:3,000–6,000): salty skin, persistent cough, lung infections, poor growth; failed Cl⁻ transport → dehydrated mucus.',
    'Cystinosis (AR, 1:100,000–200,000): photophobia, Fanconi syndrome, failure to thrive; cystine trapped in lysosomes.',
    'Menkes (X-linked recessive, 1:300,000): kinky brittle hair, low muscle tone, mental retardation, seizures; ATP7A copper transport.',
  ],
};

// ─── Lesson 6 ───────────────────────────────────────────────────────

const lesson6: Draft = {
  id: 'inborn-errors-of-metabolism-6',
  title: 'Structural, Homeostatic and Signalling Defects',
  description: 'Defects in structural proteins, extracellular homeostasis, growth control, receptors and hormones — including osteogenesis imperfecta, Zellweger syndrome and haemophilia A.',
  xp: 30,
  sourceRefs: ref([32, 33, 34, 35, 36, 37, 38]),
  objectives: [
    'Match structural protein defects to their diseases',
    'Describe osteogenesis imperfecta and Zellweger syndrome',
    'Explain why a lack of factor VIII causes bleeding',
    'Link tumour suppressors, oncogenes, receptors and hormones to their diseases',
  ],
  chunks: [
    {
      title: 'Mutations affecting the structure of cells and organs',
      kind: 'classification',
      paragraphs: ['Page 32 (printed slide 33):'],
      table: {
        columns: ['Site', 'Affected protein', 'Disease'],
        rows: [
          ['Extracellular', 'Type I and II collagen', 'Osteogenesis imperfecta'],
          ['Cell membrane', 'Red cell membrane protein spectrin', 'Hereditary spherocytosis'],
          ['Cytoskeleton', 'Dystrophin', 'Duchenne/Becker muscular dystrophy'],
          ['Organelle', 'A protein involved in peroxisome biogenesis', 'Zellweger syndrome'],
        ],
      },
      sourceRefs: ref([32]),
    },
    {
      title: 'Osteogenesis imperfecta',
      kind: 'clinical',
      paragraphs: [
        'Osteogenesis imperfecta involves the COL1A1 gene, with glycine substitution in collagen. The page 33 figure compares normal collagen production with osteogenesis imperfecta, where a defect in one chain disturbs the triple helix and the fibrils built from it.',
        'Autosomal dominant; incidence 1 in 20,000. Features: frequent bone fractures, bone deformity, and bluish discolouration of the white of the eye (page 33).',
      ],
      sourceRefs: ref([32, 33]),
    },
    {
      title: 'Zellweger syndrome',
      kind: 'clinical',
      paragraphs: [
        'Zellweger syndrome is caused by a defect in a protein needed for peroxisome biogenesis (page 32). Peroxisomes form from pre-peroxisomes budding from the ER, import their matrix proteins, grow and divide (page 34 figure).',
        'Autosomal recessive; incidence 1 in 50,000–100,000. Features: dysmorphic facial features, degeneration of the brain, liver and kidney (cerebro-hepato-renal), and accumulation of very-long-chain fatty acids (page 34).',
      ],
      sourceRefs: ref([32, 34]),
    },
    {
      title: 'Mutations in proteins of extracellular homeostasis',
      kind: 'classification',
      paragraphs: ['Page 35 (printed slide 39):'],
      table: {
        columns: ['Function', 'Defective protein', 'Disease'],
        rows: [
          ['Immune protection', 'Proteins of the complement system', 'Complement C3 deficiency'],
          ['Haemostasis', 'Factor VIII', 'Haemophilia A'],
          ['Protease inhibition', 'α1-antitrypsin', 'Pulmonary emphysema'],
        ],
      },
      sourceRefs: ref([35]),
    },
    {
      title: 'Haemophilia A',
      kind: 'clinical',
      paragraphs: [
        'After injury the vessel constricts and clotting factors are activated. Normally factor VIII, with other substances, helps form a strong platelet plug, and a stable fibrin clot then seals the injury. Without factor VIII the platelet plug is weak and the fibrin clot is incomplete or delayed, so bleeding continues (page 36 figure).',
        'X-linked; incidence 1 in 5,000. Features: spontaneous bleeding, deep tissue haemorrhage, easy bruising and haematuria (page 36).',
      ],
      sourceRefs: ref([35, 36]),
    },
    {
      title: 'Growth control, receptors and hormones',
      kind: 'classification',
      paragraphs: ['Growth control and differentiation (page 37):'],
      table: {
        columns: ['Function / class', 'Defective protein', 'Disease'],
        rows: [
          ['Tumour suppressor', 'Rb protein', 'Retinoblastoma and osteosarcoma'],
          ['Oncogenes', 'bcr-abl proto-oncogenes', 'Chronic myelogenous leukaemia'],
          ['Light receptors', 'Rhodopsin', 'Retinitis pigmentosa'],
          ['Light receptors', 'Green and red light opsins', 'X-linked colour blindness'],
          ['Metabolite receptor', 'LDL receptor', 'Familial hypercholesterolaemia'],
          ['Hormones', 'Growth hormone', 'Dwarfism'],
          ['Hormones', 'Insulin', 'Type II diabetes mellitus'],
          ['Hormone receptors', 'Vitamin D receptor', 'Vitamin D-dependent rickets'],
          ['Hormone receptors', 'Androgen receptor', 'Testicular feminisation'],
        ],
      },
      keyPoints: ['The first two rows are growth control and differentiation (page 37); the rest are page 38’s “proteins involved in intercellular metabolism”.'],
      sourceRefs: ref([37, 38]),
    },
  ],
  summary: [
    'Structure: collagen → osteogenesis imperfecta; spectrin → hereditary spherocytosis; dystrophin → Duchenne/Becker MD; peroxisome biogenesis protein → Zellweger.',
    'OI (AD, 1:20,000): fractures, bone deformity, bluish sclerae; COL1A1, glycine substitution.',
    'Zellweger (AR, 1:50,000–100,000): dysmorphic face, cerebro-hepato-renal degeneration, very-long-chain fatty acids accumulate.',
    'Homeostasis: complement proteins → C3 deficiency; factor VIII → haemophilia A; α1-antitrypsin → emphysema.',
    'Haemophilia A (X-linked, 1:5,000): spontaneous bleeding, deep tissue haemorrhage, easy bruising, haematuria — weak plug, delayed clot.',
    'Rb → retinoblastoma and osteosarcoma; bcr-abl → CML; rhodopsin → retinitis pigmentosa; red/green opsins → X-linked colour blindness; LDL receptor → familial hypercholesterolaemia; GH → dwarfism; insulin → type II DM; vitamin D receptor → vitamin D-dependent rickets; androgen receptor → testicular feminisation.',
  ],
};

export const lessons: Draft[] = [lesson1, lesson2, lesson3, lesson4, lesson5, lesson6].map((lesson) => ({
  ...lesson,
  ...readingExtras[lesson.id],
  interactive: interactive[lesson.id],
}));
