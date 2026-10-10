// Biochemistry → Collagen and Elastin — question bank, lessons 4–6.
// (Lessons 1–3 are in questions.ts, which combines both files.)
// IDs: qN-xx, N = lesson. Options are shuffled at quiz time.
import { fill, match, mcq, multi, order, tf, type QuestionDraft } from '@/data/topics/build';
import type { ConceptId } from '@/data/topics/collagen-synthesis/sources';

type Q = QuestionDraft<ConceptId>;

// ─── Lesson 4 — Fibre assembly and cross-links ──────────────────────
const lesson4: Q[] = [
  mcq('q4-01', 'fibre-formation', 'Why can collagen molecules aggregate into fibres?', 'Their elongated triple helix leaves many side chains on the surface to bond with neighbouring molecules', ['They fold into compact globules that stick together', 'They are joined end to end by peptide bonds', 'Their sugars glue them together'], {
    explanation: 'Slide 53.',
    skill: 'cause-effect',
  }),
  tf({
    id: 'q4-02', conceptId: 'fibre-formation',
    statement: 'Like most globular proteins, collagen is folded into a compact structure.',
    answer: false,
    explanation: 'Slide 53: collagen is a fibrous protein with an elongated triple helix.',
    skill: 'misconception',
  }),
  mcq('q4-03', 'fibre-formation', 'What gap separates consecutive tropocollagen molecules along a row in a fibre (slide 60)?', 'About 400 Å', ['About 3000 Å', 'About 15 Å', 'There is no gap'], {
    explanation: 'Slide 60 figure.',
  }),
  mcq('q4-04', 'fibre-formation', 'What may the gaps between tropocollagen molecules serve as?', 'Nucleation sites in bone formation', ['Binding sites for haemoglobin', 'Sites where sugars attach', 'Disulfide bridges'], {
    explanation: 'Slide 60 figure.',
  }),
  fill('q4-05', 'fibre-formation', 'In a fibre, tropocollagen molecules form a quarter-____ array.', ['staggered'], {
    explanation: 'Slide 60.',
    skill: 'terminology',
  }),
  mcq('q4-06', 'fibre-formation', 'Where does tropocollagen assemble into fibres (slide 33)?', 'Near the cell surface', ['In the nucleus', 'In lysosomes', 'In the bloodstream'], {
    explanation: 'Slide 33: step 6, assembly near the cell surface.',
  }),
  mcq('q4-07', 'procollagen-processing', 'Which enzymes cut the extension peptides off procollagen?', 'Procollagen peptidases', ['Lysyl oxidases', 'Prolyl hydroxylases', 'Glycosyl transferases'], {
    explanation: 'Slide 54.',
  }),
  multi('q4-08', 'procollagen-processing', 'What do the extension peptides of procollagen do (slide 54)? Select all that apply.', ['Prevent premature formation of fibres', 'May guide transport of procollagen across the cell membrane'], ['Form desmosine cross-links', 'Carry the glucose–galactose sugars'], {
    explanation: 'Slide 54.',
  }),
  mcq('q4-09', 'procollagen-processing', 'Where are procollagen’s extension peptides removed?', 'In the extracellular space', ['In the nucleus', 'In the lumen of the rough ER', 'In lysosomes'], {
    explanation: 'Slide 54.',
  }),
  tf({
    id: 'q4-10', conceptId: 'procollagen-processing',
    statement: 'Procollagen’s extension peptides are cut off inside the fibroblast.',
    answer: false,
    explanation: 'Slide 54: excision takes place in the extracellular space.',
    skill: 'misconception',
  }),
  mcq('q4-11', 'procollagen-processing', 'In slide 34’s figure, where are the procollagen chains made?', 'On ribosomes on the endoplasmic reticulum', ['In the extracellular space', 'In mitochondria', 'In the nucleus'], {
    explanation: 'Slide 34 figure.',
  }),
  mcq('q4-12', 'procollagen-processing', 'Which part of the procollagen chains carries the cysteines whose disulfide bonds first hold the three chains together?', 'The C-terminal extensions', ['The N-terminal extensions', 'The middle of the triple helix', 'The hydroxylysine sugars'], {
    explanation: 'Slide 34 figure.',
  }),
  order('q4-13', 'procollagen-processing', 'Put the events from new chain to tropocollagen in order (slide 34).', [
    'Chains are made on ER ribosomes and hydroxylated',
    'C-terminal extensions form disulfide bonds',
    'The triple helix forms',
    'The N- and C-terminal extensions are cut off',
  ], { explanation: 'Slide 34 figure.' }),
  mcq('q4-14', 'procollagen-processing', 'What would happen if a procollagen peptidase were missing?', 'Propeptides would be retained and collagen bundles disorganised, as in dermatoparaxis', ['Collagen would lack hydroxyproline', 'Desmosine would build up', 'Glycine would be replaced by cysteine'], {
    explanation: 'Slides 54 and 68.',
    skill: 'application',
  }),
  mcq('q4-15', 'collagen-crosslinks', 'Which enzyme converts lysine side chains into aldehydes?', 'Lysyl oxidase', ['Lysyl hydroxylase', 'Prolyl hydroxylase', 'Procollagen peptidase'], {
    explanation: 'Slide 56.',
    skill: 'comparison',
  }),
  fill('q4-16', 'collagen-crosslinks', 'The aldehyde formed from a lysine side chain is called ____.', ['allysine'], {
    explanation: 'Slide 56.',
    skill: 'terminology',
  }),
  mcq('q4-17', 'collagen-crosslinks', 'How do two allysine aldehydes join?', 'By aldol condensation', ['By hydrolysis', 'By phosphorylation', 'By disulfide exchange'], {
    explanation: 'Slide 57.',
  }),
  mcq('q4-18', 'collagen-crosslinks', 'Which side chain can add across the aldol cross-link’s carbon–carbon double bond?', 'Histidine', ['Glycine', 'Proline', 'Alanine'], {
    explanation: 'Slides 58–59.',
  }),
  mcq('q4-19', 'collagen-crosslinks', 'The aldehyde of the histidine–aldol cross-link can form a Schiff base with which side chain?', 'Hydroxylysine', ['Hydroxyproline', 'Glycine', 'Valine'], {
    explanation: 'Slide 28.',
  }),
  mcq('q4-20', 'collagen-crosslinks', 'How many side chains can end up covalently bonded through this chain of cross-links?', 'Four', ['Two', 'Three', 'Six'], {
    explanation: 'Slide 28.',
  }),
  match('q4-21', 'collagen-crosslinks', 'Match each term to its meaning.', [
    ['Intramolecular cross-link', 'Within one tropocollagen molecule'],
    ['Intermolecular cross-link', 'Between tropocollagen molecules'],
    ['Allysine', 'An aldehyde made from a lysine side chain'],
  ], { explanation: 'Slides 28 and 56.' }),
  mcq('q4-22', 'collagen-crosslinks', 'Which rat tendon has the less cross-linked collagen?', 'The flexible tail tendon', ['The Achilles tendon of mature rats', 'Both are equally cross-linked'], {
    explanation: 'Slide 28: cross-linking varies with function and age.',
    skill: 'comparison',
  }),
  mcq('q4-23', 'collagen-crosslinks', 'From which amino acid are collagen’s cross-links built?', 'Lysine', ['Proline', 'Glycine', 'Cysteine'], {
    explanation: 'Slides 28 and 56.',
  }),
  mcq('q4-24', 'collagen-crosslinks', 'What does cross-linking give collagen fibres?', 'Mechanical strength', ['Solubility in water', 'Rubber-like elasticity', 'Their colour'], {
    explanation: 'Slide 28: the importance of cross-linking for strength is shown by lathyrism.',
  }),
  tf({
    id: 'q4-25', conceptId: 'collagen-crosslinks',
    statement: 'The extent and type of cross-linking varies with the function and age of the tissue.',
    answer: true,
    explanation: 'Slide 28.',
  }),
  tf({
    id: 'q4-26', conceptId: 'collagen-crosslinks',
    statement: 'Collagen cross-links can join side chains on different tropocollagen molecules.',
    answer: true,
    explanation: 'Slide 28.',
  }),
];

// ─── Lesson 5 — Collagen disorders ──────────────────────────────────
const lesson5: Q[] = [
  mcq('q5-01', 'scurvy', 'What causes scurvy?', 'A dietary deficiency of ascorbic acid', ['A mutation in type I collagen', 'Eating sweet pea seeds', 'Absence of procollagen peptidase'], {
    explanation: 'Slide 61.',
  }),
  mcq('q5-02', 'scurvy', 'Why is collagen defective in scurvy?', 'Prolyl hydroxylase’s iron is not kept reduced, so collagen is under-hydroxylated', ['Lysyl oxidase is inhibited', 'Procollagen peptidase is absent', 'Glycine is replaced by cysteine'], {
    explanation: 'Slide 61.',
    skill: 'cause-effect',
  }),
  tf({
    id: 'q5-03', conceptId: 'scurvy',
    statement: 'Collagen made in scurvy has a lower melting temperature than normal collagen.',
    answer: true,
    explanation: 'Slide 61.',
  }),
  multi('q5-04', 'scurvy', 'Which are features of scurvy in infants? Select all that apply.', ['Painful, tender limbs', 'Defective bone formation', 'Weak blood vessels with haemorrhages'], ['Blue sclerae', 'Hyperextensible joints'], {
    explanation: 'Slide 62.',
  }),
  multi('q5-05', 'scurvy', 'Which are features of scurvy in adults? Select all that apply.', ['Bleeding around hair follicles', 'Gingivitis', 'Halitosis', 'Bleeding into joints'], ['Hyperextensible joints', 'Kinky hair'], {
    explanation: 'Slide 63.',
  }),
  mcq('q5-06', 'scurvy', 'Which finding supports a diagnosis of scurvy?', 'Low white cell ascorbic acid', ['Raised desmosine', 'Pro-α chains on a collagen gel', 'A glycine-to-cysteine mutation'], {
    explanation: 'Slide 64.',
  }),
  tf({
    id: 'q5-07', conceptId: 'scurvy',
    statement: 'There is a completely satisfactory test for scurvy.',
    answer: false,
    explanation: 'Slide 64: no test is completely satisfactory; white cell ascorbic acid is low.',
  }),
  mcq('q5-08', 'scurvy', 'Why must humans get ascorbic acid from their diet (slide 43)?', 'Primates cannot synthesise it', ['Humans lack prolyl hydroxylase', 'Humans make no collagen', 'Ascorbate is destroyed in the liver'], {
    explanation: 'Slide 43: primates and guinea pigs cannot synthesise ascorbic acid.',
  }),
  mcq('q5-09', 'ehlers-danlos', 'What is Ehlers-Danlos syndrome?', 'A group of rare hereditary disorders in which collagen synthesis is impaired', ['A dietary vitamin deficiency', 'A disease of cattle', 'A poisoning by sweet pea seeds'], {
    explanation: 'Slide 65.',
  }),
  multi('q5-10', 'ehlers-danlos', 'Which defects can underlie Ehlers-Danlos syndrome? Select all that apply.', ['Defective type III collagen synthesis', 'Deficiency of procollagen peptidases', 'Defective hydroxylation of lysine', 'Deficiency of lysyl oxidase'], ['A glycine-to-cysteine change at residue 988', 'Lack of dietary ascorbate'], {
    explanation: 'Slide 65.',
  }),
  multi('q5-11', 'ehlers-danlos', 'Which are features of Ehlers-Danlos syndrome? Select all that apply.', ['Hyperextensible joints', 'Excessive stretching of the skin', 'Ready bruising and easy tearing of skin', 'Short stature'], ['Bleeding gums', 'Blue sclerae'], {
    explanation: 'Slide 66.',
  }),
  mcq('q5-12', 'ehlers-danlos', 'On slide 67’s gel, what does Ehlers-Danlos syndrome type VII collagen show that normal collagen does not?', 'Pro-α1 and pro-α2 chains', ['No α2 chains at all', 'Desmosine', 'Extra glycine'], {
    explanation: 'Slide 67.',
  }),
  mcq('q5-13', 'ehlers-danlos', 'What do the pro-α chains on the type VII gel tell you?', 'The propeptides are not being removed from procollagen', ['Proline is over-hydroxylated', 'There are too many cross-links', 'Ascorbate is lacking'], {
    explanation: 'Slides 65 and 67: deficiency of procollagen peptidases is one EDS defect.',
    skill: 'cause-effect',
  }),
  mcq('q5-14', 'dermatoparaxis', 'Which animals does dermatoparaxis affect?', 'Cattle', ['Guinea pigs', 'Rats', 'Fish'], {
    explanation: 'Slide 68.',
  }),
  multi('q5-15', 'dermatoparaxis', 'Which are features of dermatoparaxis? Select all that apply.', ['Very fragile skin', 'Disorganised collagen bundles', 'Retained amino-terminal propeptides'], ['Bleeding gums', 'Brittle bones'], {
    explanation: 'Slide 68.',
  }),
  tf({
    id: 'q5-16', conceptId: 'dermatoparaxis',
    statement: 'Dermatoparaxis is a genetically transmitted recessive disease.',
    answer: true,
    explanation: 'Slide 68.',
  }),
  mcq('q5-17', 'lathyrism', 'What is the toxic agent in lathyrism?', 'β-Aminopropionitrile', ['α,α′-Bipyridyl', 'Ascorbic acid', 'Desmosine'], {
    explanation: 'Slide 70.',
  }),
  mcq('q5-18', 'lathyrism', 'Animals develop lathyrism by eating the seeds of which plant?', 'The sweet pea', ['The fava bean', 'The peanut', 'The soybean'], {
    explanation: 'Slide 69.',
  }),
  mcq('q5-19', 'lathyrism', 'Why is collagen extremely fragile in lathyrism?', 'Lysyl side chains are not converted to aldehydes, so cross-links cannot form', ['Proline is not hydroxylated', 'Procollagen is not cleaved', 'Glycine is replaced by cysteine'], {
    explanation: 'Slides 28 and 70.',
    skill: 'cause-effect',
  }),
  mcq('q5-20', 'osteogenesis-imperfecta', 'Osteogenesis imperfecta is caused by defective collagen of which type?', 'Type I', ['Type II', 'Type III', 'Type IV'], {
    explanation: 'Slide 71.',
  }),
  mcq('q5-21', 'osteogenesis-imperfecta', 'In the lecture’s example of osteogenesis imperfecta, residue 988 changes from glycine to:', 'Cysteine', ['Alanine', 'Proline', 'Serine'], {
    explanation: 'Slide 72.',
  }),
  mcq('q5-22', 'osteogenesis-imperfecta', 'What does the glycine 988 change do to the collagen?', 'It disrupts the helix near its carboxyl end, so the collagen is over-hydroxylated, over-glycosylated and partly unfolded at body temperature', ['It stops hydroxylation completely', 'It adds extra cross-links', 'It prevents secretion of procollagen'], {
    explanation: 'Slide 72.',
    skill: 'cause-effect',
  }),
  tf({
    id: 'q5-23', conceptId: 'osteogenesis-imperfecta',
    statement: 'In osteogenesis imperfecta, both a normal and a mutant allele for the α1 chain of type I collagen are found.',
    answer: true,
    explanation: 'Slide 71.',
  }),
  mcq('q5-24', 'osteogenesis-imperfecta', 'If the mutant allele had made a completely unusable α1 chain, what would the collagen be like (slide 73)?', 'Normal, but reduced in amount', ['Abnormal and lethal', 'Over-hydroxylated', 'Absent altogether'], {
    explanation: 'Slide 73.',
    skill: 'prediction',
  }),
  multi('q5-25', 'osteogenesis-imperfecta', 'Which are features of osteogenesis imperfecta in the lecture? Select all that apply.', ['Brittle bones', 'Multiple fractures', 'Skeletal deformities'], ['Bleeding gums', 'Hyperextensible joints'], {
    explanation: 'Slide 71.',
  }),
  match('q5-26', 'scurvy', 'Match each disorder to the step of collagen synthesis it disturbs.', [
    ['Scurvy', 'Hydroxylation of proline'],
    ['Dermatoparaxis', 'Removal of propeptides'],
    ['Lathyrism', 'Making lysine aldehydes for cross-links'],
    ['Osteogenesis imperfecta', 'Building a sound triple helix'],
  ], { explanation: 'Slides 61, 68, 70 and 72.', skill: 'comparison' }),
];

// ─── Lesson 6 — Elastin ─────────────────────────────────────────────
const lesson6: Q[] = [
  mcq('q6-01', 'elastin-distribution', 'Elastin is the major component of:', 'Elastic fibres', ['Collagen fibrils', 'The basal lamina', 'Keratin filaments'], {
    explanation: 'Slide 74.',
  }),
  mcq('q6-02', 'elastin-distribution', 'What can elastic fibres do?', 'Stretch to several times their length, then rapidly return to their original size and shape', ['Resist all stretching', 'Mineralise into bone', 'Contract using ATP like muscle'], {
    explanation: 'Slide 74.',
  }),
  multi('q6-03', 'elastin-distribution', 'Where are large amounts of elastin found? Select all that apply.', ['Blood vessel walls, especially the arch of the aorta', 'Ligaments'], ['Tendon', 'Loose connective tissue'], {
    explanation: 'Slide 75.',
  }),
  tf({
    id: 'q6-04', conceptId: 'elastin-distribution',
    statement: 'Skin and tendon contain large amounts of elastin.',
    answer: false,
    explanation: 'Slide 75: there is relatively little elastin in skin, tendon and loose connective tissue.',
  }),
  mcq('q6-05', 'elastin-distribution', 'In most connective tissues, elastin is found together with:', 'Collagen and polysaccharides', ['Haemoglobin', 'Keratin', 'Actin and myosin'], {
    explanation: 'Slide 74.',
  }),
  mcq('q6-06', 'elastin-distribution', 'In slide 6’s elastic network, how does each elastin molecule behave?', 'It expands and contracts like a coil', ['It stays rigid', 'It breaks and re-forms', 'It dissolves'], {
    explanation: 'Slide 6 figure.',
  }),
  mcq('q6-07', 'elastin-distribution', 'The arch of the aorta is rich in elastin. What does this give the vessel wall?', 'The ability to stretch and recoil', ['Rigidity', 'Mineralisation', 'Impermeability to water'], {
    explanation: 'Slides 74–75.',
    skill: 'application',
  }),
  tf({
    id: 'q6-08', conceptId: 'elastin-distribution',
    statement: 'Elastic fibres return to their original shape slowly, over hours.',
    answer: false,
    explanation: 'Slide 74: they return rapidly once tension is released.',
  }),
  mcq('q6-09', 'elastin-composition', 'What proportion of elastin’s residues are glycine?', 'One third', ['One tenth', 'One half', 'Almost none'], {
    explanation: 'Slide 76.',
  }),
  mcq('q6-10', 'elastin-composition', 'How does elastin’s hydroxyproline content compare with collagen’s?', 'Elastin has very little', ['Elastin has much more', 'They have the same amount'], {
    explanation: 'Slide 76.',
    skill: 'comparison',
  }),
  multi('q6-11', 'elastin-composition', 'Which non-polar aliphatic residues are plentiful in elastin? Select all that apply.', ['Alanine', 'Valine', 'Leucine', 'Isoleucine'], ['Aspartate', 'Glutamate'], {
    explanation: 'Slide 77.',
  }),
  tf({
    id: 'q6-12', conceptId: 'elastin-composition',
    statement: 'Elastin contains many polar amino acids.',
    answer: false,
    explanation: 'Slide 76: elastin has few polar amino acids.',
  }),
  mcq('q6-13', 'elastin-composition', 'Why is mature elastin difficult to analyse?', 'Its many cross-links make it highly insoluble', ['It is too small to detect', 'It falls apart at room temperature', 'It is found only in fish'], {
    explanation: 'Slide 77.',
  }),
  mcq('q6-14', 'elastin-composition', 'Which statement about hydroxylysine is correct?', 'Collagen contains it; elastin contains none', ['Both contain plenty', 'Elastin contains it; collagen does not', 'Neither contains any'], {
    explanation: 'Slides 30 and 76.',
    skill: 'comparison',
  }),
  mcq('q6-15', 'elastin-composition', 'Which imino acid is elastin rich in?', 'Proline', ['Hydroxyproline', 'Tryptophan', 'Histidine'], {
    explanation: 'Slide 76: rich in proline, but very little hydroxyproline.',
  }),
  mcq('q6-16', 'elastin-crosslinks', 'Which repeating sequence is found in elastin?', 'Lys-Ala-Ala-Lys (or Lys-Ala-Ala-Ala-Lys)', ['Gly-Pro-Hyp', 'Arg-Gly-Asp', 'Gly-Gly-Gly'], {
    explanation: 'Slide 78. Gly-Pro-Hyp is collagen’s repeat; Arg-Gly-Asp is fibronectin’s cell-binding sequence.',
    skill: 'comparison',
  }),
  mcq('q6-17', 'elastin-crosslinks', 'Which cross-link is found only in elastin?', 'Desmosine', ['Aldol cross-link', 'Lysinonorleucine', 'Histidine–aldol cross-link'], {
    explanation: 'Slide 79.',
  }),
  mcq('q6-18', 'elastin-crosslinks', 'Desmosine is derived from how many lysine side chains?', 'Four', ['Two', 'Three', 'Six'], {
    explanation: 'Slide 79.',
  }),
  multi('q6-19', 'elastin-crosslinks', 'Which cross-links occur in both collagen and elastin? Select all that apply.', ['Aldol cross-link', 'Lysinonorleucine'], ['Desmosine', 'Disulfide bonds between C-terminal extensions'], {
    explanation: 'Slide 78.',
  }),
  mcq('q6-20', 'elastin-crosslinks', 'What may elastin’s cross-links help elastic fibres do?', 'Return to their original size and shape after stretching', ['Mineralise', 'Bind oxygen', 'Dissolve in water'], {
    explanation: 'Slide 79.',
  }),
  mcq('q6-21', 'elastin-crosslinks', 'The regions of elastin between cross-links are rich in:', 'Glycine, proline and valine', ['Hydroxyproline and hydroxylysine', 'Cysteine and methionine', 'Aspartate and glutamate'], {
    explanation: 'Slide 79.',
  }),
  order('q6-22', 'elastin-crosslinks', 'Put the formation of lysinonorleucine in order (slide 80).', [
    'A lysine side chain is converted to an aldehyde',
    'The aldehyde reacts with another lysine to form a Schiff base',
    'The Schiff base becomes lysinonorleucine',
  ], { explanation: 'Slide 80 figure.' }),
  match('q6-23', 'elastin-crosslinks', 'Elastin, collagen or both?', [
    ['Desmosine', 'Elastin only'],
    ['Hydroxylysine carrying sugars', 'Collagen only'],
    ['Aldol cross-links', 'Both'],
    ['About one third glycine', 'Both'],
  ], { explanation: 'Slides 30, 50 and 76–79.', skill: 'comparison' }),
  tf({
    id: 'q6-24', conceptId: 'elastin-crosslinks',
    statement: 'Lysinonorleucine is found in both collagen and elastin.',
    answer: true,
    explanation: 'Slide 78.',
  }),
  mcq('q6-25', 'elastin-crosslinks', 'In slide 81’s structure, desmosine’s four lysine-derived chains are joined around a:', 'Pyridinium ring', ['Haem ring', 'Sugar ring', 'Benzene ring from tyrosine'], {
    explanation: 'Slide 81 figure.',
    difficulty: 'advanced',
  }),
];

export const moreQuestions: Q[] = [...lesson4, ...lesson5, ...lesson6];
