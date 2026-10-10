// Biochemistry → Collagen and Elastin — the topic question bank.
//
// Rules: only what the lessons teach (E. F. Laing's deck, including the
// textbook figures and pages pasted into it). Not asked: the type XI chain
// formula, or how the “spastic paralysis” of slide 69 relates to collagen
// (see discrepancies). Options are shuffled at quiz time. IDs: qN-xx,
// N = lesson. Lessons 4–6 are in more-questions.ts.
import { fill, match, mcq, multi, tf, type QuestionDraft } from '@/data/topics/build';
import { moreQuestions } from '@/data/topics/collagen-synthesis/more-questions';
import type { ConceptId } from '@/data/topics/collagen-synthesis/sources';

type Q = QuestionDraft<ConceptId>;

// ─── Lesson 1 — Structural proteins, the matrix and repair ──────────
const lesson1: Q[] = [
  mcq('q1-01', 'protein-functions', 'Which of these is a transport protein in the lecture’s list?', 'Albumin', ['Insulin', 'Myosin', 'Keratin'], {
    explanation: 'Slide 2: transport — albumin, caeruloplasmin, haemoglobin.',
  }),
  mcq('q1-02', 'protein-functions', 'Caeruloplasmin is listed under which protein function?', 'Transport', ['Regulation', 'Catalysis', 'Locomotion'], {
    explanation: 'Slide 2.',
  }),
  mcq('q1-03', 'protein-functions', 'Actin and myosin are the lecture’s examples of which function?', 'Locomotion', ['Structure', 'Transport', 'Catalysis'], {
    explanation: 'Slide 2.',
  }),
  mcq('q1-04', 'protein-functions', 'Insulin is the lecture’s example of which protein function?', 'Regulation', ['Catalysis', 'Transport', 'Structure'], {
    explanation: 'Slide 2: protein hormones (e.g. insulin).',
  }),
  tf({
    id: 'q1-05', conceptId: 'protein-functions',
    statement: 'Enzymes are the lecture’s example of catalysis.',
    answer: true,
    explanation: 'Slide 2.',
  }),
  mcq('q1-06', 'structural-proteins', 'How does the lecture define structural proteins?', 'Proteins that hold biological structures together or form body structures', ['Proteins that carry oxygen', 'Proteins that speed up reactions', 'Proteins that act as hormones'], {
    explanation: 'Slide 3.',
  }),
  multi('q1-07', 'structural-proteins', 'Where is keratin found? Select all that apply.', ['Hair', 'Nails', 'Skin', 'Fish and reptile scales'], ['Blood plasma', 'Tendon'], {
    explanation: 'Slide 3.',
  }),
  mcq('q1-08', 'structural-proteins', 'Which are extracellular structural proteins (slide 4)?', 'Collagen and elastin', ['Integrins and the cytoskeleton', 'Albumin and haemoglobin', 'Actin and myosin'], {
    explanation: 'Slide 4.',
  }),
  tf({
    id: 'q1-09', conceptId: 'structural-proteins',
    statement: 'Integrins are classed as cellular (transmembrane) structural proteins.',
    answer: true,
    explanation: 'Slide 4.',
  }),
  mcq('q1-10', 'matrix-adhesion', 'What does fibronectin do?', 'Helps cells attach to the extracellular matrix', ['Digests collagen', 'Stores calcium', 'Carries oxygen'], {
    explanation: 'Slide 7.',
  }),
  fill('q1-11', 'matrix-adhesion', 'Fibronectin’s cell-binding domain carries the ____ sequence (Arg-Gly-Asp).', ['RGD'], {
    explanation: 'Slide 7 figure.',
    skill: 'terminology',
  }),
  multi('q1-12', 'matrix-adhesion', 'Which binding domains does fibronectin have (slide 7)? Select all that apply.', ['Collagen binding', 'Heparin binding', 'Cell binding', 'Self-association'], ['DNA binding', 'Oxygen binding'], {
    explanation: 'Slide 7 figure.',
  }),
  mcq('q1-13', 'matrix-adhesion', 'Inside the cell, integrins connect — via α-actinin, talin or filamin and vinculin — to:', 'Actin filaments', ['Microtubules only', 'The nuclear envelope', 'Ribosomes'], {
    explanation: 'Slide 8 figure.',
  }),
  mcq('q1-14', 'matrix-adhesion', 'In the connective tissue figure (slide 5), what makes up the ground substance?', 'Hyaluronan, proteoglycans and glycoproteins', ['Keratin and actin', 'Haemoglobin and albumin', 'Myelin and lipids'], {
    explanation: 'Slide 5 figure.',
  }),
  mcq('q1-15', 'connective-tissue-cells', 'Which is the most common cell of connective tissue proper?', 'Fibroblast', ['Mast cell', 'Macrophage', 'Adipocyte'], {
    explanation: 'Slide 15.',
  }),
  multi('q1-16', 'connective-tissue-cells', 'What do fibroblasts secrete? Select all that apply.', ['Ground substance (hyaluronan + protein)', 'Collagen', 'Elastin'], ['Antibodies', 'Haemoglobin'], {
    explanation: 'Slide 15.',
  }),
  match('q1-17', 'connective-tissue-cells', 'Match each cell to its description.', [
    ['Chondrocyte', 'Specialised fibroblast of cartilage'],
    ['Osteocyte', 'Specialised fibroblast of bone'],
    ['Mesenchymal cell', 'Stem cell that replaces connective tissue cells after injury'],
  ], { explanation: 'Slide 15.' }),
  mcq('q1-18', 'connective-tissue-cells', 'During wound healing, some fibroblasts transform into:', 'Myofibroblasts', ['Osteoclasts', 'Mast cells', 'Neutrophils'], {
    explanation: 'Slide 16.',
  }),
  mcq('q1-19', 'connective-tissue-cells', 'Slide 17 shows the cells stained for actin and for which other protein?', 'α-Smooth muscle actin', ['Haemoglobin', 'Keratin', 'Type IV collagen'], {
    explanation: 'Slide 17.',
  }),
  multi('q1-20', 'scar-types', 'In which fibrotic skin conditions do myofibroblasts make collagen (slide 18)? Select all that apply.', ['Keloids', 'Scleroderma', 'Hypertrophic scars'], ['Scurvy', 'Atrophic scars'], {
    explanation: 'Slide 18.',
  }),
  multi('q1-21', 'scar-types', 'Which types of scar does slide 12 list? Select all that apply.', ['Normal', 'Atrophic', 'Hypertrophic', 'Keloid'], ['Elastic', 'Haemorrhagic'], {
    explanation: 'Slide 12.',
  }),
  mcq('q1-22', 'wound-healing', 'How long does the haemostasis phase last?', 'Seconds to hours', ['Hours to days', 'Days to a week', 'A week to months'], {
    explanation: 'Slide 11.',
  }),
  match('q1-23', 'wound-healing', 'Match each phase of wound healing to one of its events.', [
    ['Haemostasis', 'Platelet aggregation'],
    ['Inflammation', 'Phagocytosis of bacteria'],
    ['Proliferation', 'Collagen synthesis and angiogenesis'],
    ['Remodelling', 'Collagen cross-linking and scar maturation'],
  ], { explanation: 'Slides 10–11.' }),
  mcq('q1-24', 'wound-healing', 'Which cells arrive early in the inflammatory phase?', 'Neutrophils', ['Fibroblasts', 'Osteocytes', 'Chondrocytes'], {
    explanation: 'Slide 11: early neutrophils, late macrophages.',
  }),
  mcq('q1-25', 'wound-healing', 'In which phase does the wound gain tensile strength as the scar matures?', 'Remodelling (a week to months)', ['Haemostasis', 'Inflammation', 'Proliferation'], {
    explanation: 'Slides 10–11.',
  }),
  mcq('q1-26', 'wound-healing', 'In slide 9’s figure, which growth factor released from platelets coordinates the repair cells?', 'TGF-β1', ['Insulin', 'Erythropoietin', 'Thyroxine'], {
    explanation: 'Slide 9 figure.',
  }),
  mcq('q1-27', 'wound-healing', 'In slide 9’s figure, what do higher concentrations of TGF-β1 make fibroblasts do?', 'Make extracellular matrix', ['Turn into neutrophils', 'Release histamine', 'Stop dividing permanently'], {
    explanation: 'Slide 9 figure.',
  }),
];

// ─── Lesson 2 — Collagen types and the triple helix ─────────────────
const lesson2: Q[] = [
  mcq('q2-01', 'collagen-overview', 'How does the lecture describe collagen?', 'A family of fibrous proteins', ['A single globular enzyme', 'A lipid', 'A polysaccharide'], {
    explanation: 'Slide 13.',
  }),
  multi('q2-02', 'collagen-overview', 'In which tissues is collagen the major fibrous element? Select all that apply.', ['Skin', 'Bone', 'Tendon', 'Teeth'], ['Red blood cells', 'Brain grey matter'], {
    explanation: 'Slide 13.',
  }),
  tf({
    id: 'q2-03', conceptId: 'collagen-overview',
    statement: 'Collagen has a directive role in developing tissue as well as a structural role in mature tissue.',
    answer: true,
    explanation: 'Slide 13.',
  }),
  mcq('q2-04', 'collagen-overview', 'What kind of fibres does collagen form?', 'Insoluble fibres of high tensile strength', ['Soluble, elastic fibres', 'Insoluble but weak fibres', 'Soluble fibres of low strength'], {
    explanation: 'Slide 13.',
  }),
  mcq('q2-05', 'collagen-overview', 'The layered arrangement of collagen fibrils in tadpole skin is also found in:', 'Bone and the cornea', ['Liver and spleen', 'Blood and lymph', 'Brain and spinal cord'], {
    explanation: 'Slide 14.',
  }),
  mcq('q2-06', 'collagen-types', 'Which collagen type accounts for 90% of body collagen?', 'Type I', ['Type II', 'Type III', 'Type IV'], {
    explanation: 'Slide 22.',
  }),
  mcq('q2-07', 'collagen-types', 'Which collagen type is found in cartilage, intervertebral discs and the vitreous humour?', 'Type II', ['Type I', 'Type III', 'Type IV'], {
    explanation: 'Slide 22.',
  }),
  mcq('q2-08', 'collagen-types', 'What does type IV collagen polymerise into?', 'A sheetlike network in the basal lamina', ['Thick fibrils in tendon', 'Anchoring fibrils', 'Hemidesmosomes'], {
    explanation: 'Slide 22.',
  }),
  mcq('q2-09', 'collagen-types', 'Which collagen forms anchoring fibrils beneath stratified squamous epithelia?', 'Type VII', ['Type I', 'Type IV', 'Type XVII'], {
    explanation: 'Slide 22.',
  }),
  mcq('q2-10', 'collagen-types', 'Type XVII is a transmembrane collagen found in:', 'Hemidesmosomes', ['The vitreous humour', 'Tendons', 'The intervertebral disc'], {
    explanation: 'Slide 22.',
  }),
  mcq('q2-11', 'collagen-types', 'What is the chain composition of type I collagen?', 'Two α1(I) chains and one α2(I) chain', ['Three identical α1(I) chains', 'One α1(I) chain and two α2(I) chains', 'Four chains'], {
    explanation: 'Slide 22: [α1(I)]₂α2(I).',
  }),
  mcq('q2-12', 'collagen-types', 'What is type II collagen made of?', 'Three identical α1(II) chains', ['Two α1(II) and one α2(II) chain', 'Three different chains', 'Two chains'], {
    explanation: 'Slide 22: [α1(II)]₃.',
  }),
  multi('q2-13', 'collagen-types', 'Which collagen types are fibril-forming? Select all that apply.', ['Type I', 'Type II', 'Type III'], ['Type IV', 'Type VII'], {
    explanation: 'Slide 22. Types IV and VII are network-forming.',
  }),
  mcq('q2-14', 'collagen-types', 'Type V collagen forms fibrils together with which type?', 'Type I', ['Type II', 'Type IV', 'Type VII'], {
    explanation: 'Slide 22. Type XI forms fibrils with type II.',
  }),
  tf({
    id: 'q2-15', conceptId: 'collagen-types',
    statement: 'Type III collagen is found in skin, blood vessels and internal organs.',
    answer: true,
    explanation: 'Slide 22.',
  }),
  mcq('q2-16', 'tropocollagen', 'What is the mass of tropocollagen?', '285 kDa', ['64 kDa', '16 kDa', '1,000 kDa'], {
    explanation: 'Slide 24.',
  }),
  mcq('q2-17', 'tropocollagen', 'About how many residues does each tropocollagen chain have?', 'About 1000', ['About 100', 'About 10,000', 'About 141'], {
    explanation: 'Slide 24.',
  }),
  mcq('q2-18', 'tropocollagen', 'What is the diameter of tropocollagen?', '15 Å', ['3000 Å', '150 Å', '1.5 Å'], {
    explanation: 'Slide 25.',
  }),
  mcq('q2-19', 'tropocollagen', 'What kind of helix is each strand of tropocollagen?', 'A type II trans helix, like synthetic poly-L-proline', ['An α-helix', 'A β-pleated sheet', 'A DNA-like double helix'], {
    explanation: 'Slides 25–26.',
  }),
  mcq('q2-20', 'tropocollagen', 'How many residues per turn does each tropocollagen strand have?', 'Three', ['3.6', 'Ten', 'Two'], {
    explanation: 'Slide 25. (3.6 is the α-helix.)',
    skill: 'comparison',
  }),
  tf({
    id: 'q2-21', conceptId: 'tropocollagen',
    statement: 'The three polypeptide chains of tropocollagen are the same size.',
    answer: true,
    explanation: 'Slide 24.',
  }),
  mcq('q2-22', 'collagen-composition', 'Which tripeptide sequence recurs frequently in collagen?', 'Gly-Pro-Hyp', ['Lys-Ala-Ala-Lys', 'Arg-Gly-Asp', 'Gly-Gly-Gly'], {
    explanation: 'Slide 29. Lys-Ala-Ala-Lys is elastin’s repeat; Arg-Gly-Asp is fibronectin’s cell-binding sequence.',
    skill: 'comparison',
  }),
  multi('q2-23', 'collagen-composition', 'Which modified amino acids does collagen contain, though few other proteins do? Select all that apply.', ['Hydroxyproline', 'Hydroxylysine'], ['Desmosine', 'γ-Carboxyglutamate'], {
    explanation: 'Slide 30.',
  }),
  mcq('q2-24', 'collagen-composition', 'Which other proteins also have regularly repeating sequences (slide 29)?', 'Silk fibroin and elastin', ['Haemoglobin and myoglobin', 'Insulin and glucagon', 'Albumin and globulins'], {
    explanation: 'Slide 29.',
  }),
  tf({
    id: 'q2-25', conceptId: 'collagen-composition',
    statement: 'Globular proteins commonly show regular repeats in their amino acid sequence, as collagen does.',
    answer: false,
    explanation: 'Slide 29: globular proteins rarely show such regularities.',
    skill: 'misconception',
  }),
  mcq('q2-26', 'collagen-composition', 'Besides glycine, which amino acid is far more common in collagen than in most proteins?', 'Proline', ['Tryptophan', 'Cysteine', 'Histidine'], {
    explanation: 'Slide 30.',
  }),
  mcq('q2-27', 'collagen-composition', 'A protein has glycine at nearly every third position and contains hydroxyproline. What is it most likely to be?', 'Collagen', ['Haemoglobin', 'Insulin', 'Albumin'], {
    explanation: 'Slides 30–31.',
    skill: 'application',
  }),
];

// ─── Lesson 3 — Hydroxylation and glycosylation ─────────────────────
const lesson3: Q[] = [
  mcq('q3-01', 'synthesis-overview', 'Which steps of collagen synthesis happen inside the fibroblast (slide 33)?', 'Polypeptide synthesis, hydroxylation and glycosylation, triple-helix formation, then secretion', ['Cross-linking and assembly into fibres', 'Hydrolysis of procollagen only', 'All seven steps'], {
    explanation: 'Slide 33.',
  }),
  mcq('q3-02', 'synthesis-overview', 'What is formed when the extra peptide bonds of procollagen are hydrolysed?', 'Tropocollagen', ['Elastin', 'Gelatin', 'Fibronectin'], {
    explanation: 'Slide 33.',
  }),
  mcq('q3-03', 'synthesis-overview', 'What is the last step in forming a mature collagen fibre?', 'Formation of cross-links', ['Secretion', 'Hydroxylation', 'Polypeptide synthesis'], {
    explanation: 'Slide 33.',
  }),
  mcq('q3-04', 'synthesis-overview', 'In slide 34’s figure, what first holds the three procollagen chains together?', 'Disulfide bonds between their C-terminal extensions', ['Aldol cross-links', 'Desmosine', 'Sugars on hydroxylysine'], {
    explanation: 'Slide 34 figure.',
  }),
  mcq('q3-05', 'hydroxylated-residues', 'What is the precursor of hydroxyproline in collagen?', 'Proline residues already in the chain', ['Free hydroxyproline from the diet', 'Lysine', 'Glycine'], {
    explanation: 'Slide 36.',
  }),
  tf({
    id: 'q3-06', conceptId: 'hydroxylated-residues',
    statement: 'Free hydroxyproline is incorporated into nascent collagen chains.',
    answer: false,
    explanation: 'Slide 36.',
    skill: 'misconception',
  }),
  mcq('q3-07', 'prolyl-hydroxylase', 'What class of enzyme is prolyl hydroxylase?', 'A dioxygenase', ['A kinase', 'A protease', 'A ligase'], {
    explanation: 'Slide 40.',
  }),
  mcq('q3-08', 'prolyl-hydroxylase', 'Which metal ion is at prolyl hydroxylase’s active site?', 'Ferrous iron (Fe²⁺)', ['Copper', 'Zinc', 'Magnesium'], {
    explanation: 'Slide 40.',
  }),
  mcq('q3-09', 'prolyl-hydroxylase', 'What is ascorbate’s role in the prolyl hydroxylase reaction?', 'It keeps the enzyme’s iron reduced in the +2 state', ['It donates the hydroxyl group', 'It is converted to succinate', 'It cuts procollagen'], {
    explanation: 'Slide 40.',
  }),
  mcq('q3-10', 'prolyl-hydroxylase', 'What is α-ketoglutarate converted to in the reaction?', 'Succinate, with CO₂ released', ['Citrate', 'Glutamate', 'Oxaloacetate'], {
    explanation: 'Slide 42 figure.',
  }),
  mcq('q3-11', 'prolyl-hydroxylase', 'Where does the oxygen atom attached to proline come from?', 'Molecular oxygen (O₂)', ['Water', 'Ascorbate', 'α-Ketoglutarate'], {
    explanation: 'Slide 42.',
  }),
  mcq('q3-12', 'prolyl-hydroxylase', 'Which animals cannot synthesise ascorbic acid (slide 43)?', 'Primates and guinea pigs', ['Rats and mice', 'Cattle and sheep', 'All mammals'], {
    explanation: 'Slide 43.',
  }),
  mcq('q3-13', 'hydroxylation-rules', 'Proline is hydroxylated at C-4 only if it lies:', 'On the amino side of a glycine residue', ['On the carboxyl side of a glycine residue', 'Next to a lysine', 'At the C-terminus of the chain'], {
    explanation: 'Slide 44.',
  }),
  tf({
    id: 'q3-14', conceptId: 'hydroxylation-rules',
    statement: 'Prolyl residues are hydroxylated after the triple helix has formed.',
    answer: false,
    explanation: 'Slide 44: hydroxylation takes place before helix formation.',
    skill: 'misconception',
  }),
  mcq('q3-15', 'hydroxylation-rules', 'Which enzyme hydroxylates a few proline residues at C-3?', 'Prolyl-3-hydroxylase', ['Prolyl-4-hydroxylase', 'Lysyl hydroxylase', 'Lysyl oxidase'], {
    explanation: 'Slide 44.',
  }),
  mcq('q3-16', 'hydroxylation-rules', 'At which carbon are lysine residues hydroxylated?', 'C-5', ['C-4', 'C-3', 'C-2'], {
    explanation: 'Slide 46.',
  }),
  multi('q3-17', 'hydroxylation-rules', 'What does lysyl hydroxylase have or need? Select all that apply.', ['Ferrous iron at its active site', 'Molecular oxygen', 'α-Ketoglutarate', 'Ascorbate'], ['Vitamin K', 'Biotin'], {
    explanation: 'Slide 46.',
  }),
  mcq('q3-18', 'hydroxylation-rules', 'How does α,α′-bipyridyl inhibit prolyl hydroxylase?', 'It chelates (removes) the enzyme’s iron', ['It destroys ascorbate', 'It blocks the ribosome', 'It cleaves procollagen'], {
    explanation: 'Slide 45.',
  }),
  mcq('q3-19', 'hydroxylation-rules', 'Unhydroxylated collagen made with bipyridyl present becomes helical only when:', 'It is cooled below 24 °C', ['It is warmed to 37 °C', 'Ascorbate is added', 'It is cross-linked'], {
    explanation: 'Slide 45.',
  }),
  mcq('q3-20', 'helix-stability', 'What mainly holds tropocollagen together in extracted collagen?', 'Many hydrogen bonds acting co-operatively', ['Disulfide bonds', 'Ionic bonds to calcium', 'Peptide bonds between molecules'], {
    explanation: 'Slide 47.',
  }),
  mcq('q3-21', 'helix-stability', 'Heating collagen destroys its triple helix, giving:', 'Gelatin, a random coil', ['Elastin', 'Procollagen', 'Keratin'], {
    explanation: 'Slide 48.',
  }),
  mcq('q3-22', 'helix-stability', 'What is the melting temperature (Tm) of collagen?', 'The temperature at which half of the helical structure is lost', ['The body temperature of the animal', 'The temperature at which collagen is made', 'The shrinkage temperature of intact fibres'], {
    explanation: 'Slide 49.',
    skill: 'terminology',
  }),
  mcq('q3-23', 'helix-stability', 'Which collagen in slide 49’s table has the highest melting temperature?', 'Calf skin (Tm 39 °C)', ['Shark skin', 'Cod skin'], {
    explanation: 'Slide 49: calf 39 °C, shark 29 °C, cod 16 °C.',
  }),
  mcq('q3-24', 'helix-stability', 'Cod live at 10–14 °C. Compared with calf collagen, cod collagen has:', 'Less proline + hydroxyproline and a lower Tm', ['More proline + hydroxyproline and a higher Tm', 'The same Tm', 'No hydroxyproline at all'], {
    explanation: 'Slide 49: the higher the imino acid content, the more stable the helix.',
    skill: 'application',
  }),
  mcq('q3-25', 'glycosylation', 'Which sugars form the disaccharide on hydroxylysine?', 'Glucose and galactose', ['Glucose and fructose', 'Mannose and fucose', 'Galactose and sialic acid'], {
    explanation: 'Slide 50.',
  }),
  mcq('q3-26', 'glycosylation', 'When are the sugars added?', 'To hydroxylysine in nascent collagen, before it becomes helical', ['After fibres form', 'After cross-linking', 'Once collagen is outside the cell'], {
    explanation: 'Slide 50.',
  }),
  mcq('q3-27', 'glycosylation', 'Which collagen has far more carbohydrate units per molecule (slide 51)?', 'Lens capsule (type IV) — about 110', ['Tendon (type I) — 6', 'They have the same amount'], {
    explanation: 'Slide 51.',
    skill: 'comparison',
  }),
  tf({
    id: 'q3-28', conceptId: 'glycosylation',
    statement: 'The glycosylating enzymes act on hydroxyproline residues.',
    answer: false,
    explanation: 'Slide 50: they are specific for hydroxylysine residues.',
    skill: 'misconception',
  }),
];

export const questions: Q[] = [...lesson1, ...lesson2, ...lesson3, ...moreQuestions];
