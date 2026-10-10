// Biochemistry → Oxygen Carriers: the topic question bank.
//
// Each question names a concept; the concept decides its lesson and its
// source slides (see ./sources.ts). Lessons teach first, the quiz tests
// after.
//
// Rules for this bank:
// - Only material the lessons teach: the lecture deck and its pasted pages
//   and figures, plus labelled Lehninger points ("Lehninger" in the prompt).
// - Not asked: the number of negative charges on 2,3-BPG (sources differ)
//   and the speaker note on slide 33.
// - Options are shuffled at quiz time (correct option written first).
//
// IDs: qN-xx, N = lesson.
import { fill, match, mcq, multi, order, tf, type QuestionDraft } from '@/data/topics/build';
import type { ConceptId } from '@/data/topics/oxygen-carriers/sources';

type Q = QuestionDraft<ConceptId>;

// ─── Lesson 1 — Myoglobin: roles, haem iron, structure ──────────────
const lesson1: Q[] = [
  multi('q1-01', 'carrier-roles', 'What do myoglobin and haemoglobin both bind (slide 2)? Select all that apply.', ['Oxygen', 'Carbon dioxide', 'H⁺ ions'], ['Glucose', 'Bilirubin'], {
    explanation: 'Slide 2: both bind oxygen, carbon dioxide and H⁺ ions, though these affect the two carriers differently.',
  }),
  tf({
    id: 'q1-02', conceptId: 'carrier-roles',
    statement: 'O₂, CO₂ and H⁺ affect myoglobin and haemoglobin in exactly the same way.',
    answer: false,
    explanation: 'Slide 2: the effect of these species on the two carriers is not the same (Lesson 3 shows how).',
    skill: 'misconception',
  }),
  mcq('q1-03', 'carrier-roles', 'Why can myoglobin and haemoglobin bind oxygen?', 'They carry a non-polypeptide haem group', ['Their histidines bind O₂ directly', 'They contain copper', 'Their α-helices trap O₂'], {
    explanation: 'Slide 2: they bind oxygen because of the haem group.',
  }),
  mcq('q1-04', 'carrier-roles', 'In which tissue does myoglobin act as a reserve supply of oxygen?', 'Red muscle', ['Red blood cells', 'Lung', 'Liver'], {
    explanation: 'Slide 2.',
  }),
  mcq('q1-05', 'haem-iron', 'How many bonds does the haem iron make to the protoporphyrin ring?', 'Four — to the central nitrogens', ['Two', 'Six', 'One'], {
    explanation: 'Slide 4: the iron binds the four nitrogens in the centre of the ring; it can form two more bonds outside the plane.',
  }),
  mcq('q1-06', 'haem-iron', 'Where are the fifth and sixth coordination positions?', 'One on each side of the haem plane', ['Both in the plane of the ring', 'On the propionate side chains', 'Inside the pyrrole rings'], {
    explanation: 'Slide 4.',
  }),
  mcq('q1-07', 'haem-iron', 'What is haemoglobin called when its iron is in the +2 state?', 'Ferrohaemoglobin', ['Ferrihaemoglobin', 'Methaemoglobin', 'Carboxyhaemoglobin'], {
    explanation: 'Slide 6.',
    skill: 'terminology',
  }),
  tf({
    id: 'q1-08', conceptId: 'haem-iron',
    statement: 'Ferrihaemoglobin (methaemoglobin) binds oxygen.',
    answer: false,
    explanation: 'Slide 6: only ferrohaemoglobin (Fe²⁺) binds oxygen.',
    skill: 'misconception',
  }),
  match('q1-09', 'haem-iron', 'Match each name to its iron state.', [
    ['Ferromyoglobin', 'Fe²⁺'],
    ['Ferrimyoglobin', 'Fe³⁺'],
    ['Methaemoglobin', 'Fe³⁺'],
    ['Ferrohaemoglobin', 'Fe²⁺'],
  ], { explanation: 'Slide 6.' }),
  mcq('q1-10', 'myoglobin-shape', 'About what fraction of myoglobin’s main chain is α-helical?', 'About 75%', ['About 25%', 'About 50%', 'All of it'], {
    explanation: 'Slide 7.',
  }),
  mcq('q1-11', 'myoglobin-shape', 'How many major helical segments does myoglobin have?', 'Eight (A–H)', ['Four', 'Six', 'Twelve'], {
    explanation: 'Slide 7.',
  }),
  mcq('q1-12', 'myoglobin-shape', 'What are myoglobin’s dimensions (slide 7)?', '45 × 35 × 25 Å', ['A 55 Å sphere', '10 × 10 × 10 Å', '100 × 50 × 25 Å'], {
    explanation: 'Slide 7. (55 Å is the diameter of haemoglobin — Lesson 3.)',
    difficulty: 'intermediate',
  }),
  fill('q1-13', 'myoglobin-shape', 'The first amino acid of helix A is designated ____.', ['A1'], {
    explanation: 'Slide 8: A1, then A2, and so forth.',
    skill: 'terminology',
  }),
  mcq('q1-14', 'myoglobin-shape', 'How many non-helical segments lie between myoglobin’s helices?', 'Seven', ['Eight', 'Four', 'Two'], {
    explanation: 'Slide 8.',
    difficulty: 'intermediate',
  }),
  mcq('q1-15', 'myoglobin-shape', 'What are myoglobin’s five C-terminal residues called?', 'HC1–HC5', ['NA1–NA5', 'H1–H5', 'CD1–CD5'], {
    explanation: 'Slide 8.',
    skill: 'terminology',
  }),
  tf({
    id: 'q1-16', conceptId: 'myoglobin-shape',
    statement: 'The two N-terminal residues of myoglobin are designated NA1 and NA2.',
    answer: true,
    explanation: 'Slide 8.',
  }),
  mcq('q1-17', 'myoglobin-shape', 'Which handedness are myoglobin’s α-helices?', 'Right-handed', ['Left-handed', 'A mixture of both', 'They are not helical'], {
    explanation: 'Slide 7: right-handed α-helical segments.',
  }),
  mcq('q1-18', 'helix-termination', 'Why does proline terminate an α-helix?', 'Its bulky five-membered ring does not fit inside a helix except at an end', ['It carries a negative charge', 'It forms disulfide bonds', 'It binds the haem'], {
    explanation: 'Slide 10.',
    skill: 'cause-effect',
  }),
  mcq('q1-19', 'helix-termination', 'How many prolines and helix terminations does myoglobin have?', '4 prolines, 8 terminations', ['8 prolines, 8 terminations', '4 prolines, 4 terminations', '8 prolines, 4 terminations'], {
    explanation: 'Slide 12.',
    difficulty: 'intermediate',
  }),
  mcq('q1-20', 'helix-termination', 'Besides proline, what can end an α-helix (slide 12)?', 'The –OH of serine or threonine interacting with a main-chain carbonyl', ['A disulfide bond between cysteines', 'Binding of haem', 'Glycosylation'], {
    explanation: 'Slide 12.',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q1-21', conceptId: 'helix-termination',
    statement: 'The reasons α-helical segments terminate are fully understood.',
    answer: false,
    explanation: 'Slide 10: they are not fully understood.',
  }),
  multi('q1-22', 'residue-distribution', 'Which residues are typical of myoglobin’s interior? Select all that apply.', ['Leucine', 'Valine', 'Methionine', 'Phenylalanine'], ['Aspartate', 'Arginine'], {
    explanation: 'Slide 13.',
  }),
  mcq('q1-23', 'residue-distribution', 'How are threonine, tyrosine and tryptophan positioned in myoglobin?', 'Their nonpolar parts point inward', ['They are entirely buried', 'Their polar parts point inward', 'They are absent from myoglobin'], {
    explanation: 'Slide 14.',
  }),
  mcq('q1-24', 'residue-distribution', 'What are the only polar residues inside myoglobin?', 'Two histidines', ['Two lysines', 'Four serines', 'Two aspartates'], {
    explanation: 'Slide 16.',
  }),
  tf({
    id: 'q1-25', conceptId: 'residue-distribution',
    statement: 'Glutamine and asparagine side chains are found in the interior of myoglobin.',
    answer: false,
    explanation: 'Slide 13: glutamate, aspartate, glutamine, asparagine, lysine and arginine are not found inside.',
    skill: 'misconception',
  }),
  mcq('q1-26', 'residue-distribution', 'A mutation places a lysine in myoglobin’s interior. Why would that be unusual?', 'Charged side chains like lysine are not found inside myoglobin', ['Lysine is too small to fit', 'Lysine would bind the haem', 'Lysine always ends a helix'], {
    explanation: 'Slide 13: the interior is nonpolar.',
    skill: 'application',
    difficulty: 'intermediate',
  }),
  mcq('q1-27', 'residue-distribution', 'Why are the two interior histidines important?', 'They have a critical function at the active site', ['They anchor the C-terminus', 'They bind 2,3-BPG', 'They end helix A'], {
    explanation: 'Slide 16.',
  }),
];

// ─── Lesson 2 — The active site ─────────────────────────────────────
const lesson2: Q[] = [
  fill('q2-01', 'proximal-distal-histidine', 'The proximal histidine is residue ____.', ['F8'], {
    explanation: 'Slide 17: histidine F8, at the fifth coordination position.',
  }),
  fill('q2-02', 'proximal-distal-histidine', 'The distal histidine is residue ____.', ['E7'], {
    explanation: 'Slide 17: histidine E7, near the sixth coordination position.',
  }),
  mcq('q2-03', 'proximal-distal-histidine', 'Which coordination position does the proximal histidine occupy?', 'The fifth', ['The sixth', 'The first', 'None'], {
    explanation: 'Slide 17.',
  }),
  mcq('q2-04', 'proximal-distal-histidine', 'Where does O₂ bind?', 'At the sixth coordination position, on the side opposite F8', ['At the fifth position, next to F8', 'To the distal histidine', 'To a propionate side chain'], {
    explanation: 'Slide 17: the oxygen-binding site is on the other side of the haem plane, at the sixth coordination position.',
  }),
  tf({
    id: 'q2-05', conceptId: 'proximal-distal-histidine',
    statement: 'The distal histidine E7 is bonded to the haem.',
    answer: false,
    explanation: 'Slide 17: E7 is nearby but not bonded to the haem; F8 is bonded.',
    skill: 'misconception',
  }),
  mcq('q2-06', 'proximal-distal-histidine', 'In myoglobin without O₂, where does the iron sit relative to the haem plane (slide 17)?', 'About 0.3 Å out of the plane, on the F8 side', ['Exactly in the plane', 'About 0.3 Å out, on the E7 side', 'Outside the protein'], {
    explanation: 'Slide 17 (textbook page).',
    difficulty: 'advanced',
  }),
  mcq('q2-07', 'proximal-distal-histidine', 'Where are the haem’s propionate side chains in myoglobin (slide 17)?', 'On the surface, ionised at physiological pH', ['Buried in the interior', 'Bonded to the iron', 'Bound to the distal histidine'], {
    explanation: 'Slide 17 (textbook page).',
    difficulty: 'intermediate',
  }),
  mcq('q2-08', 'preventing-oxidation', 'What happens to free haem in water when exposed to O₂?', 'It is rapidly oxidised to methaem', ['It binds O₂ reversibly for hours', 'It releases CO', 'It becomes bilirubin'], {
    explanation: 'Slide 18.',
  }),
  mcq('q2-09', 'preventing-oxidation', 'Which complex forms before methaem?', 'Haem–O₂–haem', ['Haem–CO–haem', 'Haem–globin–haem', 'Haem–H₂O'], {
    explanation: 'Slide 18.',
  }),
  mcq('q2-10', 'preventing-oxidation', 'What blocks the formation of that complex in myoglobin?', 'The distal histidine E7 and residues around the sixth position', ['The proximal histidine F8', 'Proline C2', '2,3-BPG'], {
    explanation: 'Slide 19.',
  }),
  tf({
    id: 'q2-11', conceptId: 'preventing-oxidation',
    statement: 'By blocking the haem–O₂–haem sandwich, myoglobin stabilises the ferrous form of its iron.',
    answer: true,
    explanation: 'Slide 19.',
  }),
  mcq('q2-12', 'preventing-oxidation', 'What does the polypeptide chain create around the haem?', 'A hindered environment that lets haem bind O₂ reversibly for long periods', ['An open channel for water', 'A positively charged cavity for 2,3-BPG', 'A site for haem oxygenase'], {
    explanation: 'Slide 20.',
  }),
  mcq('q2-13', 'preventing-oxidation', 'A mutation removes the distal histidine and its neighbours. What would you predict?', 'Faster oxidation to methaem and loss of O₂ binding', ['Stronger, longer O₂ binding', 'No change at all', 'Myoglobin would start binding 2,3-BPG'], {
    explanation: 'Slides 18–20: without the hindered pocket the haem–O₂–haem sandwich can form and the iron is oxidised.',
    skill: 'prediction',
    difficulty: 'advanced',
  }),
  mcq('q2-14', 'co-binding', 'How much more strongly does free haem bind CO than O₂?', 'About 25,000 times', ['About 200 times', 'About 2 times', 'Equally'], {
    explanation: 'Slide 21. (Lehninger: “more than 20,000 times”, p. 162.)',
  }),
  mcq('q2-15', 'co-binding', 'In free haem, how are the Fe, C and O atoms of bound CO arranged?', 'In a straight line', ['Bent at an angle', 'In a ring', 'CO does not bind free haem'], {
    explanation: 'Slide 22.',
  }),
  tf({
    id: 'q2-16', conceptId: 'co-binding',
    statement: 'O₂ binds the haem iron in a bent mode, both in isolated porphyrins and in myoglobin and haemoglobin.',
    answer: true,
    explanation: 'Slide 23 (figure C).',
    difficulty: 'intermediate',
  }),
  mcq('q2-17', 'co-binding', 'Which residue forces CO to bind bent in myoglobin?', 'The distal histidine (E7)', ['The proximal histidine (F8)', 'Phenylalanine CD1', 'Glycine B6'], {
    explanation: 'Slides 22–23.',
  }),
  mcq('q2-18', 'co-binding', 'Which statement about CO and haemoglobin is correct?', 'CO still binds about 200 times more strongly than O₂', ['CO binds more weakly than O₂', 'CO binds exactly as strongly as O₂', 'CO binds 25,000 times more strongly than O₂'], {
    explanation: 'Slide 21: with the polypeptide chains present, CO affinity is only about 200 times that of O₂ — still far higher.',
    clinical: true,
  }),
  mcq('q2-19', 'conserved-residues', 'How many positions are the same in (nearly) all haemoglobins studied?', 'Nine', ['Twenty', 'Two', 'Forty'], {
    explanation: 'Slide 26.',
  }),
  mcq('q2-20', 'conserved-residues', 'Why is B6 almost always glycine?', 'There is no room for a larger side chain where helices B and E cross', ['Glycine binds the haem', 'Glycine ends helix B', 'Glycine binds 2,3-BPG'], {
    explanation: 'Slides 28–29.',
    skill: 'cause-effect',
  }),
  mcq('q2-21', 'conserved-residues', 'What is the role of tyrosine HC2?', 'It cross-links the H and F helices', ['It ends helix C', 'It binds the iron', 'It is a haem contact'], {
    explanation: 'Slides 28–29.',
    difficulty: 'intermediate',
  }),
  multi('q2-22', 'conserved-residues', 'Which conserved residues are haem contacts? Select all that apply.', ['Phenylalanine CD1', 'Leucine F4'], ['Proline C2', 'Lysine H10'], {
    explanation: 'Slides 28–29.',
    difficulty: 'intermediate',
  }),
  mcq('q2-23', 'conserved-residues', 'Which conserved residue terminates a helix?', 'Proline C2', ['Glycine B6', 'Tyrosine HC2', 'Threonine C4'], {
    explanation: 'Slides 28–29.',
  }),
  multi('q2-24', 'conserved-residues', 'For which conserved residues is the role uncertain? Select all that apply.', ['Threonine C4', 'Lysine H10'], ['Histidine F8', 'Histidine E7'], {
    explanation: 'Slides 28–29.',
    difficulty: 'advanced',
  }),
  tf({
    id: 'q2-25', conceptId: 'conserved-residues',
    statement: 'Several of the conserved residues are directly involved in the oxygen-binding site.',
    answer: true,
    explanation: 'Slide 27.',
  }),
  mcq('q2-26', 'conserved-residues', 'A haemoglobin from a new species is sequenced. At which position would you most expect histidine?', 'F8', ['B6', 'C2', 'HC2'], {
    explanation: 'F8 (the proximal histidine) is conserved in all or nearly all species (slides 26–29).',
    skill: 'application',
  }),
];

// ─── Lesson 3 — Haemoglobin structure, allostery, cooperativity ─────
const lesson3: Q[] = [
  mcq('q3-01', 'haemoglobin-structure', 'What is the approximate diameter of haemoglobin?', '55 Å', ['45 Å', '25 Å', '100 Å'], {
    explanation: 'Slide 24: a spherical molecule about 55 Å in diameter.',
    difficulty: 'intermediate',
  }),
  mcq('q3-02', 'haemoglobin-structure', 'How many amino acids are in each α chain of haemoglobin?', '141', ['146', '153', '100'], {
    explanation: 'Slide 25: α 141, β 146.',
  }),
  mcq('q3-03', 'haemoglobin-structure', 'How many amino acids are in each β chain?', '146', ['141', '153', '574'], {
    explanation: 'Slide 25.',
  }),
  mcq('q3-04', 'haemoglobin-structure', 'Where are the haems in haemoglobin?', 'In crevices near the outside, far apart from each other', ['Clustered at the centre', 'Between the α chains only', 'Outside the protein'], {
    explanation: 'Slide 24.',
  }),
  tf({
    id: 'q3-05', conceptId: 'haemoglobin-structure',
    statement: 'Each α chain of haemoglobin is in contact with both β chains.',
    answer: true,
    explanation: 'Slide 24.',
  }),
  mcq('q3-06', 'allostery', 'What is an allosteric interaction?', 'An interaction between two spatially separate sites on a protein', ['Two ligands competing for the same site', 'Covalent modification of an enzyme', 'A substrate binding at the active site'], {
    explanation: 'Slide 30.',
    skill: 'terminology',
  }),
  multi('q3-07', 'allostery', 'Besides O₂, what does haemoglobin transport (slide 30)? Select all that apply.', ['H⁺', 'CO₂'], ['Glucose', 'Albumin'], {
    explanation: 'Slide 30.',
  }),
  tf({
    id: 'q3-08', conceptId: 'allostery',
    statement: 'H⁺, CO₂ and 2,3-DPG bind haemoglobin at the haem groups.',
    answer: false,
    explanation: 'Slide 31: they bind far from the haems yet change the haems’ oxygen affinity — that is what makes the effect allosteric.',
    skill: 'misconception',
  }),
  mcq('q3-09', 't-r-switch', 'Which subunit contact is large and relatively fixed?', 'α₁β₁', ['α₁β₂', 'α₁α₂', 'β₁β₂'], {
    explanation: 'Slide 32: α₁β₁ is the stabilising contact; α₁β₂ is the functional contact.',
  }),
  match('q3-10', 't-r-switch', 'Match each state to its description.', [
    ['T (taut)', 'Deoxyhaemoglobin — inter-subunit bonds intact'],
    ['R (relaxed)', 'Oxyhaemoglobin — those bonds broken'],
  ], { explanation: 'Slide 33.' }),
  mcq('q3-11', 't-r-switch', 'In the T form, which residues hydrogen-bond across the α₁β₂ interface (slide 33)?', 'α₁ Tyr C7 and β₂ Asp G1', ['α₁ Asp G1 and β₂ Asn G4', 'α₁ His F8 and β₂ His E7', 'α₁ Lys 82 and β₂ His 143'], {
    explanation: 'Slide 33.',
    difficulty: 'advanced',
  }),
  mcq('q3-12', 't-r-switch', 'In the R form, which residues hydrogen-bond across the α₁β₂ interface?', 'α₁ Asp G1 and β₂ Asn G4', ['α₁ Tyr C7 and β₂ Asp G1', 'α₁ His F8 and β₂ His E7', 'α₁ Lys 82 and β₂ His 143'], {
    explanation: 'Slide 33.',
    difficulty: 'advanced',
  }),
  mcq('q3-13', 't-r-switch', 'What stabilises the T state of deoxyhaemoglobin (slide 34)?', 'Ion pairs (salt bridges) within and between subunits', ['Disulfide bonds', 'Bound oxygen', 'Covalent links to haem'], {
    explanation: 'Slide 34.',
  }),
  tf({
    id: 'q3-14', conceptId: 't-r-switch',
    statement: 'Oxygenation breaks hydrogen bonds, salt links and van der Waals contacts between haemoglobin subunits.',
    answer: true,
    explanation: 'Slide 33: intact in the T (deoxy) form, broken in the R (oxy) form.',
  }),
  mcq('q3-15', 'mb-vs-hb-binding', 'Which protein binds oxygen co-operatively?', 'Haemoglobin', ['Myoglobin', 'Both', 'Neither'], {
    explanation: 'Slide 35.',
  }),
  multi('q3-16', 'mb-vs-hb-binding', 'Which affect oxygen binding by haemoglobin but NOT by myoglobin? Select all that apply.', ['pH', 'pCO₂', '2,3-DPG'], ['The haem group'], {
    explanation: 'Slide 35. Both proteins need their haem group to bind O₂.',
  }),
  mcq('q3-17', 'mb-vs-hb-binding', 'What must happen for haemoglobin to bind oxygen co-operatively (slide 35)?', 'Many weak bonds are broken', ['Covalent bonds form to O₂', 'The haems move together', 'The iron is oxidised'], {
    explanation: 'Slide 35.',
    difficulty: 'intermediate',
  }),
  mcq('q3-18', 'dissociation-curve', 'What is plotted on an oxygen dissociation curve?', 'Fractional saturation (Y) against pO₂', ['pO₂ against time', 'Haemoglobin concentration against pH', 'pCO₂ against pO₂'], {
    explanation: 'Slide 36.',
  }),
  mcq('q3-19', 'dissociation-curve', 'What does P50 mean?', 'The pO₂ at which the protein is half saturated', ['The saturation at a pO₂ of 50 torr', 'The pH at half saturation', 'Half of the maximum velocity'], {
    explanation: 'Slides 37–38.',
    skill: 'terminology',
  }),
  mcq('q3-20', 'dissociation-curve', 'What is haemoglobin’s P50 under physiological conditions?', '26 torr', ['1 torr', '100 torr', '50 torr'], {
    explanation: 'Slide 38.',
  }),
  mcq('q3-21', 'dissociation-curve', 'What is myoglobin’s P50?', 'About 1 torr', ['26 torr', '100 torr', '10 torr'], {
    explanation: 'Slides 38 and 52.',
  }),
  mcq('q3-22', 'dissociation-curve', 'Where does myoglobin’s curve lie compared with haemoglobin’s?', 'To the left', ['To the right', 'On top of it', 'It crosses it twice'], {
    explanation: 'Slide 37: myoglobin left; haemoglobin right.',
  }),
  mcq('q3-23', 'dissociation-curve', 'What is the typical pO₂ in the capillaries of active muscle (slide 38)?', 'About 20 torr', ['About 100 torr', 'About 1 torr', 'About 60 torr'], {
    explanation: 'Slide 38: about 20 torr in active muscle capillaries; about 100 torr in the alveoli.',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q3-24', conceptId: 'dissociation-curve',
    statement: 'Haemoglobin’s P50 lies between the pO₂ of active muscle capillaries and that of the alveoli.',
    answer: true,
    explanation: 'Slide 38.',
  }),
  mcq('q3-25', 'dissociation-curve', 'Why is a sigmoid curve useful for an oxygen carrier in blood?', 'It loads O₂ almost fully in the lungs yet releases much of it at the lower pO₂ of tissues', ['It keeps haemoglobin saturated in every tissue', 'It prevents CO binding', 'It stores O₂ in muscle'], {
    explanation: 'Slide 38: P50 lies between tissue and alveolar pO₂.',
    skill: 'pathway-reasoning',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q3-26', conceptId: 'dissociation-curve',
    statement: 'At every pO₂ above zero, haemoglobin is more saturated than myoglobin.',
    answer: false,
    explanation: 'Slide 37: myoglobin is more saturated at every pO₂ apart from 0.',
    skill: 'misconception',
  }),
  mcq('q3-27', 'dissociation-curve', 'Which describes myoglobin’s curve?', 'Hyperbolic, non-co-operative', ['Sigmoid, co-operative', 'Linear', 'Sigmoid, non-co-operative'], {
    explanation: 'Slides 37–38.',
  }),
];

// ─── Lesson 4 — Bohr effect, BPG, fetal Hb ──────────────────────────
const lesson4: Q[] = [
  mcq('q4-01', 'bohr-effect', 'What happens to haemoglobin’s curve when the pH falls within the physiological range?', 'It shifts to the right (lower affinity)', ['It shifts to the left (higher affinity)', 'It becomes hyperbolic', 'Nothing'], {
    explanation: 'Slide 39.',
  }),
  mcq('q4-02', 'bohr-effect', 'What does the lower pCO₂ in the lungs do to the curve?', 'Shifts it to the left', ['Shifts it to the right', 'Makes it hyperbolic', 'Nothing'], {
    explanation: 'Slide 40.',
  }),
  tf({
    id: 'q4-03', conceptId: 'bohr-effect',
    statement: 'Myoglobin’s oxygen binding is not affected by pH or pCO₂.',
    answer: true,
    explanation: 'Slide 39.',
  }),
  match('q4-04', 'bohr-effect', 'Match each place to its conditions and curve shift.', [
    ['Tissues', 'Low pH, high pCO₂ — right shift'],
    ['Alveolar capillaries', 'High pH, low pCO₂ — left shift'],
  ], { explanation: 'Slides 40–41.' }),
  mcq('q4-05', 'bohr-effect', 'Lehninger: what is the blood pH in the lungs and in the tissues?', '7.6 in the lungs, 7.2 in the tissues', ['7.2 in the lungs, 7.6 in the tissues', '7.4 in both', '6.8 in the tissues'], {
    explanation: 'Lehninger (p. 171); the same figure is on slide 46.',
    difficulty: 'intermediate',
  }),
  mcq('q4-06', 'bohr-effect', 'What is the effect of raising the pCO₂ at constant pH?', 'Haemoglobin’s O₂ affinity falls', ['Its affinity rises', 'No effect', 'Haemoglobin is oxidised'], {
    explanation: 'Slides 39 and 42.',
  }),
  order('q4-07', 'bohr-effect', 'Order the events in an active muscle.', [
    'The muscle produces acid and CO₂',
    'pH falls and pCO₂ rises in its capillaries',
    'Haemoglobin’s curve shifts right',
    'More O₂ is released to the muscle',
  ], { explanation: 'Slides 40 and 42.' }),
  mcq('q4-08', 'bohr-mechanism', 'Which residues carry the Bohr effect?', 'Those that bind H⁺ at the tissues and release it in the lungs', ['Those too basic to release H⁺', 'Those too acidic to bind H⁺', 'The haem propionates only'], {
    explanation: 'Slide 43.',
  }),
  tf({
    id: 'q4-09', conceptId: 'bohr-mechanism',
    statement: 'Some residues of haemoglobin are so basic that they bind H⁺ at the tissues but cannot release it in the lungs.',
    answer: true,
    explanation: 'Slide 43.',
    difficulty: 'intermediate',
  }),
  multi('q4-10', 'bohr-mechanism', 'Which residues do NOT contribute to the Bohr effect? Select all that apply.', ['Residues too basic to release H⁺ in the lungs', 'Residues too acidic to bind H⁺ at the tissues'], ['Residues that bind H⁺ at the tissues and release it in the lungs'], {
    explanation: 'Slides 43–44: only reversible binders carry protons from tissues to lungs.',
    difficulty: 'advanced',
  }),
  mcq('q4-11', 'bpg-binding', 'How many 2,3-BPG molecules bind one haemoglobin molecule?', 'One', ['Two', 'Four', 'One per α chain'], {
    explanation: 'Slide 47. Lehninger: only one BPG per tetramer (p. 172).',
  }),
  mcq('q4-12', 'bpg-binding', 'Where does 2,3-BPG bind haemoglobin?', 'In the central cavity', ['At each haem', 'At the α₁β₁ contact', 'On the surface of the α chains'], {
    explanation: 'Slide 47.',
  }),
  mcq('q4-13', 'bpg-binding', 'How many positively charged groups on each β chain bind 2,3-BPG?', 'Three', ['One', 'Two', 'Six'], {
    explanation: 'Slide 47 (six in all — 2 × three); the slide-50 figure shows three per β chain.',
    difficulty: 'intermediate',
  }),
  multi('q4-14', 'bpg-binding', 'Which β-chain groups bind 2,3-BPG (slide 47)? Select all that apply.', ['Lys 82 (EF6)', 'His 143 (H21)', 'His NA2 (N-terminal amino group)'], ['His F8', 'Asp G1'], {
    explanation: 'Slides 47 and 50.',
    difficulty: 'advanced',
  }),
  mcq('q4-15', 'bpg-binding', 'How does 2,3-BPG lower haemoglobin’s oxygen affinity?', 'It cross-links the β chains, stabilising the deoxy (T) structure', ['It oxidises the haem iron', 'It binds the haem in place of O₂', 'It cross-links the α chains in the R state'], {
    explanation: 'Slide 51; Lehninger p. 172.',
    skill: 'cause-effect',
  }),
  tf({
    id: 'q4-16', conceptId: 'bpg-binding',
    statement: '2,3-BPG binds oxyhaemoglobin and deoxyhaemoglobin equally well.',
    answer: false,
    explanation: 'It binds deoxyhaemoglobin but not oxyhaemoglobin (textbook page, slide 54; Lehninger p. 172).',
    skill: 'misconception',
  }),
  mcq('q4-17', 'bpg-binding', 'How does red-cell 2,3-BPG concentration compare with haemoglobin’s?', 'About the same molar concentration', ['About 100 times higher', 'About 100 times lower', 'BPG is absent from red cells'], {
    explanation: 'Slide 51.',
    difficulty: 'intermediate',
  }),
  mcq('q4-18', 'bpg-p50', 'What is haemoglobin’s P50 without 2,3-BPG?', '1 torr', ['26 torr', '16 torr', '100 torr'], {
    explanation: 'Slide 52: just like myoglobin.',
  }),
  mcq('q4-19', 'bpg-p50', 'By what factor does 2,3-BPG reduce haemoglobin’s oxygen affinity?', '26', ['2', '10', '100'], {
    explanation: 'Slide 53.',
  }),
  mcq('q4-20', 'bpg-p50', 'At a pO₂ of 26 torr, what is the saturation of HbA with 2,3-BPG present?', '0.5', ['1.0', '0.1', '0'], {
    explanation: 'Slide 54: 1.0 without DPG, 0.5 with DPG.',
    difficulty: 'intermediate',
  }),
  mcq('q4-21', 'bpg-p50', 'What do rising concentrations of 2,3-BPG do to the curve (slide 55)?', 'Shift it further to the right', ['Shift it to the left', 'Make it hyperbolic', 'No effect'], {
    explanation: 'Slide 55: increasing 2,3-DPG shifts the curve right — lower affinity, more O₂ delivered.',
  }),
  mcq('q4-22', 'bpg-p50', 'Blood stored in acid-citrate-dextrose loses 2,3-BPG. What happens to its P50 (slide 54)?', 'It falls to about 16 torr — higher affinity', ['It rises to about 40 torr', 'It stays at 26 torr', 'It falls to 1 torr at once'], {
    explanation: 'Slide 54 (textbook page): stored blood has P50 16 instead of 26 torr as BPG falls.',
    clinical: true,
    difficulty: 'advanced',
  }),
  mcq('q4-23', 'bpg-p50', 'What happens to red-cell 2,3-BPG within two days of going from sea level to 4500 m (slide 58)?', 'It rises (about 4.5 → 7.0 mM)', ['It falls', 'It disappears', 'It does not change'], {
    explanation: 'Slide 58 (textbook page): high-altitude adaptation.',
    difficulty: 'intermediate',
  }),
  mcq('q4-24', 'bpg-p50', 'A patient with severe emphysema has a low arterial pO₂. What compensatory change in 2,3-BPG would you expect?', 'An increase, shifting the curve right', ['A decrease, shifting the curve left', 'No change', 'Complete loss of BPG'], {
    explanation: 'Slide 54 (textbook page): in hypoxia the curve shifts because DPG rises, so more O₂ is unloaded.',
    skill: 'application',
    clinical: true,
    difficulty: 'advanced',
  }),
  mcq('q4-25', 'fetal-haemoglobin', 'What is the subunit composition of fetal haemoglobin?', 'α₂γ₂', ['α₂β₂', 'β₄', 'α₄'], {
    explanation: 'Slide 58; Lehninger p. 172.',
  }),
  mcq('q4-26', 'fetal-haemoglobin', 'Which residue differs between HbF and HbA at position H21 (143)?', 'Serine in HbF, histidine in HbA', ['Histidine in HbF, serine in HbA', 'Glycine in HbF, proline in HbA', 'There is no difference'], {
    explanation: 'Slide 57.',
  }),
  tf({
    id: 'q4-27', conceptId: 'fetal-haemoglobin',
    statement: 'Fetal haemoglobin has a higher oxygen affinity than haemoglobin A.',
    answer: true,
    explanation: 'Slides 56 and 58.',
  }),
  mcq('q4-28', 'fetal-haemoglobin', 'Why is a higher O₂ affinity useful for the fetus?', 'Oxygen passes from maternal haemoglobin to fetal haemoglobin', ['It stores oxygen in fetal muscle', 'It prevents CO poisoning', 'It removes CO₂ from the fetus'], {
    explanation: 'Slides 56 and 58.',
    skill: 'cause-effect',
  }),
];

export const questions: Q[] = [...lesson1, ...lesson2, ...lesson3, ...lesson4];
