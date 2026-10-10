// Biochemistry → Haem and Haem Metabolism: the topic question bank.
//
// Each question names a concept; the concept decides its lesson and its
// source slides (see ./sources.ts). This bank is the source of Lesson Quiz
// questions — lessons teach first, the quiz tests after.
//
// Rules for this bank:
// - Only material the lessons teach (./lessons.ts): the two lecture decks
//   and their figures/pasted pages, plus labelled Lehninger points (marked
//   "Lehninger" in the prompt).
// - Unresolved points are never asked: the most common porphyria, whether
//   lead inhibits ALA synthase activity, the oxidation state of the iron
//   released by haem oxygenase, where glucuronides are removed in the gut,
//   and where neonatal jaundice is classified.
// - The speaker note on the catabolism deck (slide 2) is not tested.
// - Options are shuffled at quiz time (correct option written first).
//
// IDs: qN-xx, N = lesson.
import { fill, match, mcq, multi, order, tf, type QuestionDraft } from '@/data/topics/build';
import type { ConceptId } from '@/data/topics/heme-metabolism/sources';

type Q = QuestionDraft<ConceptId>;

// ─── Lesson 1 — Porphyrins and haem ─────────────────────────────────
const lesson1: Q[] = [
  multi('q1-01', 'haem-proteins', 'Which are haem-containing proteins in the lecture’s list? Select all that apply.', ['Haemoglobin', 'Myoglobin', 'Cytochromes', 'Catalase'], ['Collagen', 'Albumin'], {
    explanation: 'Slide 2: haemoglobin, myoglobin, cytochromes, catalase, some peroxidases, tryptophan pyrrolase, prostaglandin synthase, nitric oxide synthase and others.',
  }),
  mcq('q1-02', 'haem-proteins', 'Where do the haem-containing cytochromes of slide 2 work?', 'In the respiratory chain', ['In the nucleus', 'In ribosomes', 'In lysosomes'], {
    explanation: 'Slide 2: “Cytochromes: in the respiratory chain”.',
  }),
  mcq('q1-03', 'haem-proteins', 'Where is myoglobin found (slide 2)?', 'Red muscle', ['Red blood cells', 'Liver', 'Bone'], {
    explanation: 'Slide 2: myoglobin in red muscle; haemoglobin in red blood cells.',
  }),
  mcq('q1-04', 'haem-proteins', 'Chemically, what is the haem of myoglobin (slide 3)?', 'Ferroprotoporphyrin IX', ['Ferriprotoporphyrin I', 'Uroporphyrin III', 'Coproporphyrin III'], {
    explanation: 'Slide 3: haem (ferroprotoporphyrin IX).',
    skill: 'terminology',
  }),
  multi('q1-05', 'haem-proteins', 'Which structural features does slide 3 give for myoglobin? Select all that apply.', ['Globular', 'Monomer', 'Tertiary structure'], ['Tetramer', 'Fibrous'], {
    explanation: 'Slide 3: myoglobin is a globular monomer with tertiary structure.',
  }),
  tf({
    id: 'q1-06', conceptId: 'haem-proteins',
    statement: 'Nitric oxide synthase and tryptophan pyrrolase are both haem-containing enzymes.',
    answer: true,
    explanation: 'Both are on the slide-2 list of haem-containing proteins.',
  }),
  fill('q1-07', 'porphin-structure', 'The four pyrrole rings of porphin are joined by four ____ bridges.', ['methene', 'methine'], {
    explanation: 'Slide 4: four pyrrole rings bonded by four methene bridges (–CH=).',
    skill: 'terminology',
  }),
  mcq('q1-08', 'porphin-structure', 'What is a pyrrole, as the lecture defines it?', 'A five-membered ring with a nitrogen at the apex', ['A six-membered ring with two nitrogens', 'A benzene ring carrying an –OH group', 'A four-membered ring containing oxygen'], {
    explanation: 'Slide 4: pyrrole — a five-sided ring with nitrogen at the apex.',
  }),
  mcq('q1-09', 'porphin-structure', 'How many pyrrole rings make up porphin?', 'Four', ['Two', 'Three', 'Six'], {
    explanation: 'Slide 4.',
  }),
  mcq('q1-10', 'porphin-structure', 'What is the molecular formula of porphin (slide 5)?', 'C₂₀H₁₄N₄', ['C₂₇H₄₆O', 'C₅H₅N', 'C₆H₁₂O₆'], {
    explanation: 'Slide 5: porphin (porphine) C₂₀H₁₄N₄.',
    difficulty: 'intermediate',
  }),
  multi('q1-11', 'porphin-structure', 'Slide 7 lists pyrrole derivatives built on the porphin structure. Which are they? Select all that apply.', ['Chlorophyll', 'Vitamin B₁₂', 'Protoporphyrin', 'Bilirubin'], ['Cholesterol', 'Glycogen'], {
    explanation: 'Slide 7: chlorophyll, vitamin B₁₂, protoporphyrin, haem and bilirubin — important in photosynthesis, respiration and digestion. (Bilirubin is the ring after it has been opened — Lessons 6–7.)',
  }),
  tf({
    id: 'q1-12', conceptId: 'porphin-structure',
    statement: 'Porphin carries methyl, vinyl and propionate side chains.',
    answer: false,
    explanation: 'Porphin has no side chains (slide 6). Side chains define the porphyrins derived from it.',
    skill: 'misconception',
  }),
  mcq('q1-13', 'porphin-structure', 'Why is porphin described as “highly unsaturated”?', 'It has many double bonds', ['It has no hydrogen atoms', 'It contains a metal ion', 'It dissolves easily in water'], {
    explanation: 'Slide 4: highly unsaturated — a lot of double bonds.',
  }),
  order('q1-14', 'porphyrin-series', 'Order the porphyrin families as they are met in haem synthesis.', [
    'Uroporphyrin',
    'Coproporphyrin',
    'Protoporphyrin',
  ], { explanation: 'Slide 9: uro → copro → proto.' }),
  mcq('q1-15', 'porphyrin-series', 'Which side chains does uroporphyrin carry?', 'Acetate and propionate', ['Methyl and propionate', 'Methyl and vinyl', 'Vinyl and acetate'], {
    explanation: 'Slides 9–10: each pyrrole of uroporphyrin carries an acetate (A) and a propionate (P).',
  }),
  mcq('q1-16', 'porphyrin-series', 'How does coproporphyrin differ from uroporphyrin?', 'Its acetate side chains have become methyl groups', ['Its propionates have become vinyl groups', 'It has lost one pyrrole ring', 'It contains iron'], {
    explanation: 'Slide 10: converting all the acetate side chains to methyls gives coproporphyrin.',
  }),
  mcq('q1-17', 'porphyrin-series', 'How many isomeric forms of uroporphyrin are there?', 'Four', ['Two', 'Eight', 'Fifteen'], {
    explanation: 'Slide 10: four isomeric forms (types I–IV).',
  }),
  mcq('q1-18', 'porphyrin-series', 'Slide 10 asks: if every acetate of uroporphyrin becomes a methyl, how many coproporphyrin isomers are possible?', 'Four — each pyrrole still carries two different groups', ['Fifteen', 'One', 'Eight'], {
    explanation: 'Methyl + propionate on each pyrrole gives the same four arrangements as acetate + propionate.',
    skill: 'pathway-reasoning',
    difficulty: 'advanced',
  }),
  mcq('q1-19', 'porphyrin-series', 'How many isomeric protoporphyrins are possible?', 'Fifteen', ['Four', 'Nine', 'Two'], {
    explanation: 'Slide 11: fifteen isomeric forms; the ninth, protoporphyrin IX, is in haem proteins.',
  }),
  tf({
    id: 'q1-20', conceptId: 'porphyrin-series',
    statement: 'Uroporphyrin type III has one pyrrole reversed compared with the regular alternation of type I.',
    answer: true,
    explanation: 'Slide 10 (textbook page): type I is -AP-AP-AP-AP-; type III is -AP-AP-AP-PA-.',
    difficulty: 'intermediate',
  }),
  match('q1-21', 'protoporphyrin-ix', 'Match each side chain of protoporphyrin IX to its positions (slide 12).', [
    ['Methyl', '1, 3, 5, 8'],
    ['Vinyl', '2, 4'],
    ['Propionate', '6, 7'],
  ], { explanation: 'Slide 12: “Methyl: Cs 1,3,5,8. Vinyl: Cs 2,4. Propionate: Cs 6,7.”' }),
  mcq('q1-22', 'protoporphyrin-ix', 'How many bonds can the haem iron form?', 'Six — four in the ring plane and one on each side', ['Four, all in the plane', 'Two, one on each side', 'Eight'], {
    explanation: 'Slide 12 (textbook page): the fifth and sixth coordination positions lie on either side of the haem plane.',
    difficulty: 'intermediate',
  }),
  fill('q1-23', 'protoporphyrin-ix', 'Haemoglobin containing ferric (Fe³⁺) iron is called ____.', ['methaemoglobin', 'methemoglobin'], {
    explanation: 'Slide 12 (textbook page): ferrihaemoglobin is also called methaemoglobin; only the ferrous form binds oxygen.',
  }),
  mcq('q1-24', 'protoporphyrin-ix', 'Which atoms of protoporphyrin IX does the haem iron bind?', 'The four central nitrogens', ['The propionate oxygens', 'The vinyl carbons', 'The methene carbons'], {
    explanation: 'Slide 12 (textbook page): the iron binds the four nitrogens in the centre of the ring.',
  }),
  mcq('q1-25', 'protoporphyrin-ix', 'Which side chains of protoporphyrin IX are the shortest?', 'The methyl groups', ['The propionates', 'The vinyl groups', 'The acetates'], {
    explanation: 'Slide 12 asks this. Methyls (one carbon) are shortest; propionates (three carbons) are longest. Protoporphyrin has no acetates.',
    skill: 'application',
  }),
  tf({
    id: 'q1-26', conceptId: 'protoporphyrin-ix',
    statement: 'Protoporphyrin IX has four methyl, two vinyl and two propionate side chains.',
    answer: true,
    explanation: 'Slides 9 and 12.',
  }),
];

// ─── Lesson 2 — Synthesis I ─────────────────────────────────────────
const lesson2: Q[] = [
  fill('q2-01', 'ala-formation', 'Haem synthesis begins when glycine condenses with ____.', ['succinyl-CoA', 'succinyl coenzyme A'], {
    explanation: 'Slide 13: condensation of glycine and succinyl-CoA, with decarboxylation, forms ALA.',
  }),
  mcq('q2-02', 'ala-formation', 'Where is ALA synthase located?', 'Mitochondria', ['Cytosol', 'Nucleus', 'Endoplasmic reticulum'], {
    explanation: 'Slides 14 and 24: ALA synthase is a PLP enzyme in the mitochondria.',
  }),
  multi('q2-03', 'ala-formation', 'Which are released along with ALA in the ALA synthase reaction? Select all that apply.', ['CO₂', 'Coenzyme A'], ['NH₄⁺', 'H₂O', 'ATP'], {
    explanation: 'Slide 14 (textbook page): succinyl-CoA + glycine → δ-aminolevulinate + CO₂ + CoA.',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q2-04', conceptId: 'ala-formation',
    statement: 'The ALA synthase reaction is the committed step of haem synthesis.',
    answer: true,
    explanation: 'Slide 14 (textbook page) and slide 26.',
  }),
  mcq('q2-05', 'ala-formation', 'Slide 13 names ALA chemically as a derivative of which acid?', '4-Oxo-pentanoic acid', ['Glutaric acid', 'Butyric acid', 'Succinic acid'], {
    explanation: 'Slide 13: “(4 oxo pentanoic acid)” — ALA is 5-amino-4-oxopentanoic acid.',
    skill: 'terminology',
    difficulty: 'intermediate',
  }),
  mcq('q2-06', 'ala-formation', 'Why is ALA formation described as a condensation “with decarboxylation”?', 'Glycine’s carboxyl carbon is lost as CO₂', ['Succinyl-CoA loses two CO₂', 'ALA is decarboxylated to porphobilinogen', 'A carboxyl group is added to glycine'], {
    explanation: 'Slides 14–15: CO₂ is released, and none of haem’s carbons come from glycine’s carboxyl carbon.',
    skill: 'pathway-reasoning',
    difficulty: 'advanced',
  }),
  mcq('q2-07', 'haem-atom-origins', 'How many of haem’s carbon atoms come from glycine’s α-carbon?', 'Eight', ['Four', 'Twenty-six', 'None'], {
    explanation: 'Slides 14–15 (textbook page): 8 carbons from glycine’s α-carbon; the other 26 from acetate.',
    difficulty: 'intermediate',
  }),
  mcq('q2-08', 'haem-atom-origins', 'Where do the other 26 carbons of haem come from?', 'Acetate, via succinyl-CoA', ['Glycine’s carboxyl carbon', 'Glucose, directly', 'Glutamate'], {
    explanation: 'Slides 14–15 (textbook page).',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q2-09', conceptId: 'haem-atom-origins',
    statement: 'Glycine’s carboxyl carbon becomes part of haem.',
    answer: false,
    explanation: 'Slides 14–15: none of haem’s carbons come from glycine’s carboxyl carbon — it is lost as CO₂.',
    skill: 'misconception',
  }),
  mcq('q2-10', 'haem-atom-origins', 'Which pathway supplies the succinyl-CoA for haem synthesis (slide 24)?', 'The TCA cycle', ['Glycolysis', 'The pentose phosphate pathway', 'The urea cycle'], {
    explanation: 'Slide 24: the TCA cycle in the mitochondrion provides succinyl-CoA.',
  }),
  mcq('q2-11', 'pbg-formation', 'Which enzyme converts ALA to porphobilinogen?', 'ALA dehydrase (PBG synthase)', ['ALA synthase', 'PBG deaminase', 'Ferrochelatase'], {
    explanation: 'Slide 16: δ-ALA dehydrase (PBG synthase).',
  }),
  mcq('q2-12', 'pbg-formation', 'How many ALA molecules make one porphobilinogen?', 'Two', ['One', 'Four', 'Eight'], {
    explanation: 'Slides 15–16: two molecules of ALA condense to form porphobilinogen.',
  }),
  mcq('q2-13', 'pbg-formation', 'What is removed when two ALA condense to porphobilinogen?', 'Two molecules of water', ['Two CO₂', 'Ammonia', 'Coenzyme A'], {
    explanation: 'Slide 15 (textbook page): a dehydration — 2 ALA → PBG + 2 H₂O + H⁺.',
    difficulty: 'intermediate',
  }),
  mcq('q2-14', 'pbg-formation', 'Which metal does porphobilinogen synthase need?', 'Zinc', ['Iron', 'Magnesium', 'Copper'], {
    explanation: 'Slide 24 (textbook page): PBG synthase is a cytosolic enzyme that requires zinc.',
  }),
  tf({
    id: 'q2-15', conceptId: 'pbg-formation',
    statement: 'ALA dehydrase, ALA dehydratase and porphobilinogen synthase are names for the same enzyme.',
    answer: true,
    explanation: 'Slides 16, 25, 36 and 37 use all three names.',
    skill: 'terminology',
  }),
  fill('q2-16', 'pbg-deaminase', 'PBG deaminase releases the linear tetrapyrrole ____.', ['hydroxymethylbilane', 'HMB'], {
    explanation: 'Slide 19: hydrolysis of the link to the enzyme’s dipyrromethane releases hydroxymethylbilane.',
  }),
  mcq('q2-17', 'pbg-deaminase', 'What prosthetic group does PBG deaminase carry?', 'A dipyrromethane, attached through a cysteine sulphur', ['Pyridoxal phosphate', 'Haem', 'Biotin'], {
    explanation: 'Slide 17.',
    difficulty: 'intermediate',
  }),
  mcq('q2-18', 'pbg-deaminase', 'Where does PBG deaminase’s dipyrromethane cofactor come from?', 'The enzyme makes it itself', ['It is a vitamin from the diet', 'ALA synthase makes it', 'It is released from haemoglobin'], {
    explanation: 'Slide 17: the enzyme itself catalyses formation of this prosthetic group.',
    difficulty: 'intermediate',
  }),
  mcq('q2-19', 'pbg-deaminase', 'How long does the pyrrole chain on PBG deaminase grow before the tetrapyrrole is released?', 'A linear hexapyrrole (cofactor + four PBG)', ['A linear tetrapyrrole only', 'A dipyrrole', 'A cyclic octapyrrole'], {
    explanation: 'Slide 18: PBG units are added until a linear hexapyrrole has been formed; hydrolysis then releases the tetrapyrrole.',
    difficulty: 'advanced',
  }),
  mcq('q2-20', 'pbg-deaminase', 'What is released for each methylene bridge formed as porphobilinogens join (slide 15)?', 'An ammonium ion (NH₄⁺)', ['CO₂', 'Water', 'Pyrophosphate'], {
    explanation: 'Slide 15 (textbook page): an ammonium ion is released for each methylene bridge formed.',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q2-21', conceptId: 'pbg-deaminase',
    statement: 'PBG deaminase is also called uroporphyrinogen I synthase.',
    answer: true,
    explanation: 'Slide 25: “Porphobilinogen deaminase (Uroporphyrinogen I synthase)”.',
    skill: 'terminology',
  }),
  mcq('q2-22', 'urogen-iii-synthase', 'What does uroporphyrinogen III synthase do?', 'Closes hydroxymethylbilane into a ring, flipping one pyrrole', ['Inserts iron into the ring', 'Decarboxylates the acetates', 'Condenses two ALA'], {
    explanation: 'Slides 20–21.',
  }),
  mcq('q2-23', 'urogen-iii-synthase', 'Through what kind of intermediate is the pyrrole flip thought to occur?', 'A spiro intermediate', ['A Schiff base with PLP', 'An acyl-enzyme thioester', 'A free radical on iron'], {
    explanation: 'Slide 21: the rearrangement is thought to proceed via a spiro intermediate.',
    difficulty: 'advanced',
  }),
  mcq('q2-24', 'urogen-iii-synthase', 'Which uroporphyrinogen is symmetric?', 'Uroporphyrinogen I', ['Uroporphyrinogen III', 'Both', 'Neither'], {
    explanation: 'Type I keeps a regular alternation of side chains; type III has one pyrrole flipped, making it asymmetric (slides 21–22, 25).',
  }),
  tf({
    id: 'q2-25', conceptId: 'urogen-iii-synthase',
    statement: 'Uroporphyrinogen I is the isomer that leads on to haem.',
    answer: false,
    explanation: 'Only the series III pathway leads to haem; uroporphyrinogen I goes only as far as coproporphyrinogen I (slide 25).',
    skill: 'misconception',
  }),
  order('q2-26', 'urogen-iii-synthase', 'Order these intermediates of haem synthesis.', [
    'Glycine + succinyl-CoA',
    'δ-Aminolevulinic acid',
    'Porphobilinogen',
    'Hydroxymethylbilane',
    'Uroporphyrinogen III',
  ], { explanation: 'Slide 25 and slide 40.' }),
];

// ─── Lesson 3 — Synthesis II ────────────────────────────────────────
const lesson3: Q[] = [
  mcq('q3-01', 'urogen-decarboxylase', 'What does uroporphyrinogen decarboxylase produce?', 'Coproporphyrinogen III', ['Protoporphyrinogen IX', 'Protoporphyrin IX', 'Hydroxymethylbilane'], {
    explanation: 'Slides 24–25.',
  }),
  mcq('q3-02', 'urogen-decarboxylase', 'How many CO₂ does uroporphyrinogen decarboxylase remove from one uroporphyrinogen III?', 'Four — one from each acetate', ['Two', 'One', 'Eight'], {
    explanation: 'Slide 24 (textbook page): the four acetate side chains are decarboxylated in sequence.',
    difficulty: 'intermediate',
  }),
  mcq('q3-03', 'urogen-decarboxylase', 'Where does uroporphyrinogen decarboxylase work?', 'Cytosol', ['Mitochondria', 'Nucleus', 'Golgi apparatus'], {
    explanation: 'Slide 24: it is one of the cytosolic enzymes.',
  }),
  tf({
    id: 'q3-04', conceptId: 'urogen-decarboxylase',
    statement: 'Uroporphyrinogen decarboxylase turns acetate side chains into methyl groups.',
    answer: true,
    explanation: 'Removing CO₂ from an acetate (–CH₂–COO⁻) leaves a methyl (slide 24).',
  }),
  mcq('q3-05', 'coprogen-oxidase', 'Where is coproporphyrinogen oxidase located?', 'Mitochondria', ['Cytosol', 'Lysosomes', 'Peroxisomes'], {
    explanation: 'Slide 24 (textbook page): coproporphyrinogen oxidase is a mitochondrial enzyme.',
  }),
  fill('q3-06', 'coprogen-oxidase', 'Coproporphyrinogen oxidase converts coproporphyrinogen III into ____.', ['protoporphyrinogen IX', 'protoporphyrinogen 9', 'protoporphyrinogen'], {
    explanation: 'Slides 24–25.',
  }),
  mcq('q3-07', 'coprogen-oxidase', 'Which side chains does coproporphyrinogen oxidase act on?', 'The propionates at positions 2 and 4', ['All four acetates', 'The methyls at positions 1 and 3', 'The propionates at positions 6 and 7'], {
    explanation: 'Slide 24 (textbook page): it decarboxylates and dehydrogenates the propionic acid side chains in positions 2 and 4.',
    difficulty: 'intermediate',
  }),
  multi('q3-08', 'coprogen-oxidase', 'What does coproporphyrinogen oxidase do to those side chains? Select all that apply.', ['Decarboxylates them', 'Dehydrogenates them'], ['Hydrolyses them', 'Adds iron to them'], {
    explanation: 'Slide 23 calls it an oxido-decarboxylase; slide 24 explains it decarboxylates and dehydrogenates the propionates, making vinyl groups.',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q3-09', conceptId: 'coprogen-oxidase',
    statement: 'Haem’s vinyl groups are made from propionate side chains.',
    answer: true,
    explanation: 'Coproporphyrinogen oxidase converts the propionates at positions 2 and 4 into vinyls (slide 24).',
  }),
  mcq('q3-10', 'ferrochelatase-step', 'What does protoporphyrinogen oxidase produce?', 'Protoporphyrin IX', ['Haem', 'Coproporphyrinogen III', 'Protoporphyrinogen IX'], {
    explanation: 'Slides 24–25.',
  }),
  mcq('q3-11', 'ferrochelatase-step', 'Where is ferrochelatase located?', 'The inner mitochondrial membrane', ['The cytosol', 'The plasma membrane', 'The nucleus'], {
    explanation: 'Slide 24 (textbook page).',
  }),
  mcq('q3-12', 'ferrochelatase-step', 'Which form of iron does ferrochelatase insert?', 'Ferrous iron (Fe²⁺)', ['Ferric iron (Fe³⁺)', 'Iron–sulphur clusters', 'Haemosiderin'], {
    explanation: 'Slides 24, 25 and 40: Fe²⁺ + protoporphyrin IX → haem.',
  }),
  tf({
    id: 'q3-13', conceptId: 'ferrochelatase-step',
    statement: 'Iron is inserted at the very last step of haem synthesis.',
    answer: true,
    explanation: 'Ferrochelatase adds Fe²⁺ to protoporphyrin IX as the final step (slide 25; Lehninger p. 855).',
  }),
  mcq('q3-14', 'ferrochelatase-step', 'Ferrochelatase is also called what (slide 35)?', 'Haem synthase', ['ALA synthase', 'Uroporphyrinogen synthase', 'Haem oxygenase'], {
    explanation: 'Slide 35: “ferrochelatase (haem synthase)”.',
    skill: 'terminology',
  }),
  order('q3-15', 'ferrochelatase-step', 'Order the last four steps of haem synthesis.', [
    'Uroporphyrinogen III → coproporphyrinogen III',
    'Coproporphyrinogen III → protoporphyrinogen IX',
    'Protoporphyrinogen IX → protoporphyrin IX',
    'Protoporphyrin IX + Fe²⁺ → haem',
  ], { explanation: 'Slide 25.' }),
  mcq('q3-16', 'compartments', 'How many of the eight steps of haem synthesis happen in the cytosol?', 'Four (steps 2–5)', ['None', 'Two', 'All eight'], {
    explanation: 'Slide 24: steps 2–5 are cytosolic; step 1 and steps 6–8 are mitochondrial.',
  }),
  multi('q3-17', 'compartments', 'Which enzymes work in the MITOCHONDRIA? Select all that apply.', ['ALA synthase', 'Coproporphyrinogen oxidase', 'Protoporphyrinogen oxidase', 'Ferrochelatase'], ['PBG deaminase', 'Uroporphyrinogen decarboxylase'], {
    explanation: 'Slide 24.',
    difficulty: 'intermediate',
  }),
  mcq('q3-18', 'compartments', 'Which is the ONLY haem-pathway enzyme that needs a metal activator?', 'Porphobilinogen synthase (zinc)', ['Ferrochelatase (copper)', 'ALA synthase (magnesium)', 'PBG deaminase (iron)'], {
    explanation: 'Slide 24 (textbook page): only porphobilinogen synthase requires a metal activator, namely zinc.',
    difficulty: 'intermediate',
  }),
  mcq('q3-19', 'compartments', 'Mature red cells have no mitochondria. Which haem-pathway enzymes do they keep (slide 24)?', 'The four cytosolic enzymes', ['ALA synthase only', 'Ferrochelatase only', 'None at all'], {
    explanation: 'Slide 24 (textbook page): the four extramitochondrial enzymes are retained in erythrocytes after the mitochondria are lost.',
    difficulty: 'advanced',
  }),
  mcq('q3-20', 'compartments', 'Why must the pathway return to the mitochondria at the end?', 'The last three enzymes, including ferrochelatase, are mitochondrial', ['Haem cannot exist in the cytosol', 'The cytosol contains no iron', 'Succinyl-CoA is needed again'], {
    explanation: 'Slide 24: coproporphyrinogen oxidase, protoporphyrinogen oxidase and ferrochelatase are mitochondrial.',
    skill: 'pathway-reasoning',
  }),
  tf({
    id: 'q3-21', conceptId: 'compartments',
    statement: 'Porphobilinogen synthase is a cytosolic, zinc-requiring enzyme.',
    answer: true,
    explanation: 'Slide 24.',
  }),
  match('q3-22', 'compartments', 'Match each step to where it happens.', [
    ['Glycine + succinyl-CoA → ALA', 'Mitochondria'],
    ['ALA → porphobilinogen', 'Cytosol'],
    ['Uroporphyrinogen III → coproporphyrinogen III', 'Cytosol'],
    ['Coproporphyrinogen III → protoporphyrinogen IX', 'Mitochondria'],
  ], { explanation: 'Slide 24.' }),
  mcq('q3-23', 'compartments', 'Coproporphyrinogen III cannot enter the mitochondria. Which molecule builds up?', 'Coproporphyrinogen III', ['Protoporphyrin IX', 'Haem', 'Succinyl-CoA'], {
    explanation: 'The next enzyme (coproporphyrinogen oxidase) is mitochondrial, so its substrate accumulates in the cytosol.',
    skill: 'prediction',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q3-24', conceptId: 'compartments',
    statement: 'Coproporphyrinogen oxidase works in the cytosol.',
    answer: false,
    explanation: 'It is mitochondrial (slide 24).',
    skill: 'misconception',
  }),
  mcq('q3-25', 'coprogen-oxidase', 'In which order are the side chains changed on the way to protoporphyrin IX?', 'First acetates → methyls, then two propionates → vinyls', ['First propionates → vinyls, then acetates → methyls', 'Methyls → acetates, then vinyls → propionates', 'All at once, by ferrochelatase'], {
    explanation: 'Uroporphyrinogen decarboxylase acts first (acetates), then coproporphyrinogen oxidase (propionates at 2 and 4) (slides 24–25).',
    skill: 'sequence',
    difficulty: 'intermediate',
  }),
  mcq('q3-26', 'compartments', 'Which intermediate is the first to leave the mitochondrion?', 'δ-Aminolevulinic acid (ALA)', ['Porphobilinogen', 'Succinyl-CoA', 'Coproporphyrinogen III'], {
    explanation: 'ALA is made in the mitochondria and converted to porphobilinogen in the cytosol (slide 24).',
    skill: 'pathway-reasoning',
    difficulty: 'intermediate',
  }),
];

// ─── Lesson 4 — Regulation ──────────────────────────────────────────
const lesson4: Q[] = [
  mcq('q4-01', 'alas-regulation', 'Which enzyme is usually rate-limiting for the whole haem pathway?', 'ALA synthase', ['Ferrochelatase', 'PBG deaminase', 'Uroporphyrinogen decarboxylase'], {
    explanation: 'Slide 26: ALA synthase is the committed step and usually rate-limiting.',
  }),
  mcq('q4-02', 'alas-regulation', 'In most cells, how does haem mainly regulate ALA synthase (slide 26)?', 'By repressing transcription of its gene', ['By phosphorylating the enzyme', 'By degrading the enzyme in lysosomes', 'By activating it allosterically'], {
    explanation: 'Slide 26: regulation occurs through control of gene transcription; haem represses transcription of the ALA synthase gene.',
  }),
  tf({
    id: 'q4-03', conceptId: 'alas-regulation',
    statement: 'Besides repressing the gene, excess haem can also inhibit ALA synthase that has already been made.',
    answer: true,
    explanation: 'Slide 24 (textbook page) and the feedback arrow on slide 40.',
    difficulty: 'intermediate',
  }),
  fill('q4-04', 'alas-regulation', 'The red-cell variant of ALA synthase is regulated by the availability of ____.', ['iron', 'Fe', 'iron-sulphur clusters', 'iron-sulfur clusters'], {
    explanation: 'Slide 26: in the form of iron–sulphur clusters.',
  }),
  mcq('q4-05', 'alas-regulation', 'Haem levels in a liver cell fall. What happens to transcription of the ALA synthase gene?', 'It increases (de-repression)', ['It decreases', 'It stops completely', 'It is unaffected'], {
    explanation: 'Haem represses the gene (slide 26), so less haem relieves the repression.',
    skill: 'prediction',
    difficulty: 'intermediate',
  }),
  mcq('q4-06', 'liver-vs-red-cells', 'What share of total haem synthesis occurs in immature red cells?', 'About 85%', ['About 15%', 'About 50%', 'Nearly 100%'], {
    explanation: 'Slide 28.',
  }),
  mcq('q4-07', 'liver-vs-red-cells', 'What is liver haem mainly used for?', 'Cytochrome P450 enzymes involved in detoxification', ['Haemoglobin', 'Myoglobin', 'Bilirubin'], {
    explanation: 'Slide 27.',
  }),
  tf({
    id: 'q4-08', conceptId: 'liver-vs-red-cells',
    statement: 'Haem synthesis continues in mature red blood cells.',
    answer: false,
    explanation: 'Slide 28: haem synthesis ceases when red cells mature.',
    skill: 'misconception',
  }),
  multi('q4-09', 'liver-vs-red-cells', 'Besides ALA synthase, at which enzymes is haem synthesis regulated in red cells (slide 28)? Select all that apply.', ['Ferrochelatase', 'Porphobilinogen deaminase'], ['Uroporphyrinogen decarboxylase', 'Biliverdin reductase'], {
    explanation: 'Slide 28.',
    difficulty: 'intermediate',
  }),
  mcq('q4-10', 'liver-vs-red-cells', 'What does haem stimulate in reticulocytes (slide 28)?', 'Protein synthesis', ['Cell division', 'Glycolysis', 'Haem breakdown'], {
    explanation: 'Slide 28: haem stimulates protein synthesis in reticulocytes.',
  }),
  mcq('q4-11', 'liver-vs-red-cells', 'Which organ is the main non-red-cell source of haem?', 'The liver', ['The spleen', 'The kidney', 'Skeletal muscle'], {
    explanation: 'Slide 27.',
  }),
  mcq('q4-12', 'hemin-globin-balance', 'What does free haem become when it accumulates (slide 29)?', 'Hemin, by spontaneous oxidation', ['Bilirubin, by haem oxygenase', 'Protoporphyrin IX, by losing its iron', 'Biliverdin, by reduction'], {
    explanation: 'Slide 29: if free haem accumulates, it is spontaneously oxidised to hemin.',
  }),
  mcq('q4-13', 'hemin-globin-balance', 'What does phosphorylation of eIF2 do?', 'Inactivates it, blocking protein (globin) synthesis', ['Activates it, increasing globin synthesis', 'Targets it to the mitochondria', 'Converts it into hemin'], {
    explanation: 'Slide 29: the kinase phosphorylates eIF2 to make it inactive.',
    difficulty: 'intermediate',
  }),
  order('q4-14', 'hemin-globin-balance', 'Order the events by which excess haem keeps globin synthesis going.', [
    'Free haem accumulates',
    'Haem is oxidised to hemin',
    'Hemin inhibits the eIF2 kinase',
    'eIF2 stays active and globin is made',
    'Globin combines with the excess haem',
  ], { explanation: 'Slide 29.' }),
  tf({
    id: 'q4-15', conceptId: 'hemin-globin-balance',
    statement: 'Hemin may block the transfer of ALA synthase from the cytosol into the mitochondrial matrix.',
    answer: true,
    explanation: 'Slide 29: hemin represses formation of ALA synthase “and perhaps blocks its transfer from the cytosol into the mitochondrial matrix”.',
    difficulty: 'advanced',
  }),
  mcq('q4-16', 'hemin-globin-balance', 'Why is it useful to link globin synthesis to haem levels?', 'Neither haem nor globin is made in excess of the other', ['It speeds up haem breakdown', 'It stops red cells from maturing', 'It increases iron absorption'], {
    explanation: 'Slide 29: the result is a balance of porphyrin and globin synthesis.',
    skill: 'cause-effect',
  }),
  multi('q4-17', 'hemin-globin-balance', 'Which effects does hemin have, according to slide 29? Select all that apply.', ['Represses formation of ALA synthase', 'Inhibits the kinase that inactivates eIF2'], ['Activates ferrochelatase', 'Phosphorylates globin'], {
    explanation: 'Slide 29.',
    difficulty: 'intermediate',
  }),
  mcq('q4-18', 'hemin-drug', 'What is hemin, chemically (slide 32)?', 'Protoporphyrin IX with ferric iron and a chloride ligand', ['Protoporphyrin IX with ferrous iron and oxygen', 'Uroporphyrin with zinc', 'Bilirubin bound to albumin'], {
    explanation: 'Slide 32: protoporphyrin IX containing a ferric iron ion (haem B) with a chloride ligand.',
  }),
  mcq('q4-19', 'hemin-drug', 'How is hemin given?', 'Intravenous infusion', ['By mouth', 'By inhalation', 'On the skin'], {
    explanation: 'Slides 31 and 33: route of administration — intravenous infusion.',
  }),
  mcq('q4-20', 'hemin-drug', 'For which porphyria is hemin used in particular?', 'Acute intermittent porphyria', ['Porphyria cutanea tarda', 'Congenital erythropoietic porphyria', 'Gilbert’s syndrome'], {
    explanation: 'Slide 32: used in the management of porphyria attacks, particularly in acute intermittent porphyria.',
  }),
  mcq('q4-21', 'hemin-drug', 'How does hematin differ from hemin?', 'It has a hydroxide in place of the chloride', ['It contains zinc instead of iron', 'It has no propionate side chains', 'It is a linear tetrapyrrole'], {
    explanation: 'Slide 32.',
    difficulty: 'intermediate',
  }),
  fill('q4-22', 'hemin-drug', 'Hematin is the “____ factor” needed for the growth of Haemophilus influenzae.', ['X'], {
    explanation: 'Slide 32.',
  }),
  tf({
    id: 'q4-23', conceptId: 'hemin-drug',
    statement: 'Hemin treats porphyria attacks by negative feedback on the haem pathway.',
    answer: true,
    explanation: 'Slide 39: hemin provides negative feedback for the haem biosynthetic pathway and so prevents accumulation of precursors.',
  }),
  tf({
    id: 'q4-24', conceptId: 'hemin-drug',
    statement: 'Hemin contains ferrous (Fe²⁺) iron.',
    answer: false,
    explanation: 'Slide 32: hemin contains ferric iron (Fe³⁺) with a chloride ligand.',
    skill: 'misconception',
  }),
  mcq('q4-25', 'alas-regulation', 'A developing red cell is short of iron. Which enzyme’s regulation does slide 26 tie directly to iron?', 'The red-cell variant of ALA synthase', ['Haem oxygenase', 'Biliverdin reductase', 'The liver form of ALA synthase'], {
    explanation: 'Slide 26: the variant expressed only in developing erythrocytes is regulated by iron availability.',
    skill: 'application',
    difficulty: 'intermediate',
  }),
  mcq('q4-26', 'alas-regulation', 'Why is ALA synthase a sensible control point for the pathway?', 'It catalyses the first committed step, so control there stops material entering the pathway', ['It is the only mitochondrial enzyme', 'It is the last step', 'It is the only enzyme that needs zinc'], {
    explanation: 'Slides 14 and 26: the committed, rate-limiting step.',
    skill: 'pathway-reasoning',
  }),
];

// ─── Lesson 5 — Porphyrias and lead ─────────────────────────────────
const lesson5: Q[] = [
  multi('q5-01', 'inborn-error-principles', 'An enzyme in a pathway is blocked. Which consequences does slide 38 describe? Select all that apply.', ['Upstream substrate and intermediates accumulate', 'Less of the main product is made', 'An alternative pathway may be used', 'Material is excreted or deposited in tissues'], ['The blocked enzyme’s product accumulates'], {
    explanation: 'Slide 38.',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q5-02', conceptId: 'inborn-error-principles',
    statement: 'In an inborn error, the intermediate immediately AFTER the blocked enzyme accumulates.',
    answer: false,
    explanation: 'Material BEFORE the block accumulates; products after it fall (slide 38).',
    skill: 'misconception',
  }),
  mcq('q5-03', 'porphyria-basics', 'How are most porphyrias inherited?', 'Autosomal dominant', ['Autosomal recessive', 'X-linked recessive', 'Through mitochondrial DNA'], {
    explanation: 'Slide 39.',
  }),
  mcq('q5-04', 'porphyria-basics', 'Why can people with an autosomal dominant porphyria still make some haem?', 'They have about 50% of normal enzyme levels', ['They make haem by another pathway', 'They absorb haem from food', 'The enzyme is not needed in adults'], {
    explanation: 'Slide 39.',
    skill: 'cause-effect',
  }),
  mcq('q5-05', 'porphyria-basics', 'What accumulates in porphyrias?', 'Haem precursors (porphyrins), toxic at high concentrations', ['Bilirubin', 'Globin chains', 'Iron only'], {
    explanation: 'Slide 39.',
  }),
  tf({
    id: 'q5-06', conceptId: 'porphyria-basics',
    statement: 'Porphyria attacks can be triggered by exposure to sun.',
    answer: true,
    explanation: 'Slide 39: attacks are triggered by certain drugs, chemicals and foods, and by exposure to sun.',
  }),
  mcq('q5-07', 'porphyria-map', 'Deficiency of PBG deaminase causes which porphyria?', 'Acute intermittent porphyria', ['Porphyria cutanea tarda', 'Variegate porphyria', 'Hereditary coproporphyria'], {
    explanation: 'Slides 40–41.',
  }),
  mcq('q5-08', 'porphyria-map', 'Deficiency of uroporphyrinogen decarboxylase causes which porphyria?', 'Porphyria cutanea tarda', ['Acute intermittent porphyria', 'Erythropoietic protoporphyria', 'Congenital erythropoietic porphyria'], {
    explanation: 'Slides 40 and 42.',
  }),
  mcq('q5-09', 'porphyria-map', 'Variegate porphyria results from a deficiency of which enzyme?', 'Protoporphyrinogen oxidase', ['Coproporphyrinogen oxidase', 'Ferrochelatase', 'PBG deaminase'], {
    explanation: 'Slide 40.',
    difficulty: 'intermediate',
  }),
  mcq('q5-10', 'porphyria-map', 'Hereditary coproporphyria results from a deficiency of which enzyme?', 'Coproporphyrinogen oxidase', ['Uroporphyrinogen decarboxylase', 'Protoporphyrinogen oxidase', 'ALA dehydratase'], {
    explanation: 'Slide 40.',
    difficulty: 'intermediate',
  }),
  mcq('q5-11', 'porphyria-map', 'Which porphyria results from ferrochelatase deficiency?', 'Erythropoietic protoporphyria', ['Congenital erythropoietic porphyria', 'Acute intermittent porphyria', 'Porphyria cutanea tarda'], {
    explanation: 'Slide 40.',
    difficulty: 'intermediate',
  }),
  mcq('q5-12', 'porphyria-map', 'Congenital erythropoietic porphyria results from a deficiency of which enzyme?', 'Uroporphyrinogen III cosynthase', ['Uroporphyrinogen decarboxylase', 'Ferrochelatase', 'ALA synthase'], {
    explanation: 'Slide 40.',
    difficulty: 'intermediate',
  }),
  order('q5-13', 'porphyria-map', 'Order these porphyrias by where their enzyme acts along the pathway, first to last.', [
    'δ-ALA dehydratase porphyria',
    'Acute intermittent porphyria',
    'Congenital erythropoietic porphyria',
    'Porphyria cutanea tarda',
    'Hereditary coproporphyria',
    'Variegate porphyria',
    'Erythropoietic protoporphyria',
  ], { explanation: 'Slide 40 lists them along the pathway.', difficulty: 'advanced' }),
  multi('q5-14', 'acute-intermittent-porphyria', 'In acute intermittent porphyria, which precursors accumulate in plasma and urine? Select all that apply.', ['Porphobilinogen (PBG)', '5-Aminolevulinic acid (ALA)'], ['Protoporphyrin IX', 'Bilirubin'], {
    explanation: 'Slide 41: PBG, uroporphyrin and 5-ALA accumulate. Protoporphyrin IX lies after the block.',
  }),
  mcq('q5-15', 'acute-intermittent-porphyria', 'What are the typical symptoms of acute intermittent porphyria?', 'Neuropsychiatric symptoms and abdominal pain (neurovisceral)', ['Blistering, photosensitive skin', 'Jaundice with pale stools', 'Anaemia with target cells'], {
    explanation: 'Slide 41.',
  }),
  mcq('q5-16', 'acute-intermittent-porphyria', 'Is acute intermittent porphyria hepatic or erythropoietic?', 'Hepatic', ['Erythropoietic', 'Both equally', 'Neither — it is renal'], {
    explanation: 'Slide 41: hepatic, autosomal dominant.',
  }),
  tf({
    id: 'q5-17', conceptId: 'acute-intermittent-porphyria',
    statement: 'In acute intermittent porphyria, porphobilinogen accumulates because the enzyme that uses it is deficient.',
    answer: true,
    explanation: 'PBG deaminase is deficient, so its substrate, PBG, builds up (slides 38, 41).',
    skill: 'cause-effect',
  }),
  mcq('q5-18', 'porphyria-cutanea-tarda', 'What accumulates in the urine in porphyria cutanea tarda (slide 42)?', 'Uroporphyrinogen', ['Porphobilinogen', 'ALA', 'Bilirubin diglucuronide'], {
    explanation: 'Slide 42.',
  }),
  order('q5-19', 'porphyria-cutanea-tarda', 'Order the events that cause skin damage in porphyria cutanea tarda.', [
    'Porphyrinogens accumulate',
    'Light converts them to porphyrins',
    'Porphyrins react with O₂ to form oxygen radicals',
    'The radicals damage the skin',
  ], { explanation: 'Slide 42.' }),
  tf({
    id: 'q5-20', conceptId: 'porphyria-cutanea-tarda',
    statement: 'Porphyria cutanea tarda is a hepatic, autosomal dominant porphyria.',
    answer: true,
    explanation: 'Slide 42.',
  }),
  mcq('q5-21', 'porphyria-cutanea-tarda', 'Which feature best distinguishes porphyria cutanea tarda from acute intermittent porphyria?', 'Cutaneous photosensitivity', ['Autosomal dominant inheritance', 'Hepatic origin', 'Being caused by an enzyme deficiency'], {
    explanation: 'Both are hepatic, autosomal dominant enzyme deficiencies (slides 41–42); PCT is the photosensitive one.',
    skill: 'comparison',
    difficulty: 'intermediate',
  }),
  multi('q5-22', 'lead-poisoning', 'Which enzymes does lead clearly inhibit (slides 35–36)? Select all that apply.', ['ALA dehydrase (PBG synthase)', 'Ferrochelatase'], ['Uroporphyrinogen III cosynthase', 'Biliverdin reductase'], {
    explanation: 'Slides 35–36: lead inhibits ALA dehydrase (most strongly) and ferrochelatase, so ALA and protoporphyrin IX accumulate.',
  }),
  mcq('q5-23', 'lead-poisoning', 'Why can lead bind ALA dehydrase (PBG synthase)?', 'Pb²⁺ binds its zinc sites, which include cysteine sulphur ligands', ['Pb²⁺ replaces the iron in its haem', 'Pb²⁺ binds its PLP cofactor', 'Pb²⁺ cleaves its peptide chain'], {
    explanation: 'Slide 37.',
    difficulty: 'intermediate',
  }),
  multi('q5-24', 'lead-poisoning', 'Which appear in the urine in lead poisoning (slide 35)? Select all that apply.', ['ALA', 'Coproporphyrin', 'Protoporphyrin'], ['Bilirubin diglucuronide', 'Glucose'], {
    explanation: 'Slide 35: “There is δ-ALA, protoporphyrin and coproporphyrin in the urine”.',
  }),
  mcq('q5-25', 'lead-poisoning', 'The symptoms of lead poisoning resemble which porphyria?', 'Acute intermittent porphyria', ['Porphyria cutanea tarda', 'Erythropoietic protoporphyria', 'Congenital erythropoietic porphyria'], {
    explanation: 'Slide 35.',
  }),
  multi('q5-26', 'lead-poisoning', 'Why may ALA be toxic to the brain (slide 37)? Select all that apply.', ['Its structure resembles the neurotransmitter GABA', 'Its autoxidation generates reactive oxygen species'], ['It chelates calcium in neurons', 'It is converted to bilirubin in the brain'], {
    explanation: 'Slide 37.',
    difficulty: 'intermediate',
  }),
  mcq('q5-27', 'lead-poisoning', 'In lead poisoning, in what form does the excess protoporphyrin exist?', 'As a zinc chelate (zinc protoporphyrin)', ['As haem', 'As bilirubin', 'As an iron–sulphur cluster'], {
    explanation: 'Slide 36 (textbook page).',
    difficulty: 'advanced',
  }),
  match('q5-28', 'lead-poisoning', 'Match each laboratory finding to what it reflects (slide 36).', [
    ['Decreased erythrocyte ALA dehydratase activity', 'Acute exposure to lead'],
    ['Increased erythrocyte protoporphyrin', 'Chronic exposure to lead'],
  ], { explanation: 'Slide 36 (textbook page).', difficulty: 'advanced' }),
  mcq('q5-29', 'lead-poisoning', 'Besides the direct enzyme block, why does blood ALA rise in lead poisoning (slide 37)?', 'Impaired haem synthesis de-represses the ALA synthase gene', ['ALA is released from damaged red cells', 'The kidneys stop excreting ALA', 'Lead converts PBG back into ALA'], {
    explanation: 'Slide 37: impaired haem synthesis leads to de-repression of transcription of the ALA synthase gene.',
    skill: 'cause-effect',
    difficulty: 'advanced',
  }),
];

// ─── Lesson 6 — Haem to bilirubin ───────────────────────────────────
const lesson6: Q[] = [
  multi('q6-01', 'haem-sources', 'Which are sources of haem for catabolism (slide 2)? Select all that apply.', ['Haemoglobin from senescent red cells', 'Cytochrome P450 enzymes', 'Haem from ineffective erythropoiesis'], ['Dietary bilirubin', 'Chlorophyll'], {
    explanation: 'Slide 2.',
  }),
  mcq('q6-02', 'haem-sources', 'Old red cells are removed by the reticuloendothelial system — especially in which organ?', 'Spleen', ['Kidney', 'Lung', 'Pancreas'], {
    explanation: 'Slide 2.',
  }),
  mcq('q6-03', 'haem-sources', 'Ineffective erythropoiesis contributes haem in which conditions (slide 2)?', 'Pernicious anaemia and thalassaemia', ['Gilbert’s and Rotor syndromes', 'Lead poisoning and porphyria cutanea tarda', 'Diabetes and gout'], {
    explanation: 'Slide 2.',
  }),
  mcq('q6-04', 'haem-sources', 'About how much bilirubin is produced each day (textbook page on slide 4)?', '250–300 mg', ['2.5–3 mg', '25–30 g', '1–2 g'], {
    explanation: 'Slide 4 (textbook page): daily bilirubin production averages 250–300 mg.',
    difficulty: 'intermediate',
  }),
  mcq('q6-05', 'haem-sources', 'About what share of daily bilirubin comes from the haemoglobin of senescent red cells?', 'About 85%', ['About 15%', 'About 50%', 'About 5%'], {
    explanation: 'Slide 4 (textbook page).',
    difficulty: 'intermediate',
  }),
  mcq('q6-06', 'haem-oxygenase', 'Which bridge of haem does haem oxygenase cleave?', 'The methine bridge joining the two pyrroles that carry vinyl groups', ['The bridge joining the two propionate-bearing pyrroles', 'All four methene bridges', 'Only the iron–nitrogen bonds'], {
    explanation: 'Slide 3; slide 4 shows this as the α-methene bridge.',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q6-07', conceptId: 'haem-oxygenase',
    statement: 'Haem oxygenase is substrate inducible.',
    answer: true,
    explanation: 'Slide 3.',
  }),
  mcq('q6-08', 'haem-oxygenase', 'Haem oxygenase catalyses the only reaction in the body that releases which gas?', 'Carbon monoxide', ['Carbon dioxide', 'Nitric oxide', 'Hydrogen sulphide'], {
    explanation: 'Slide 3: it catalyses the only reaction that endogenously releases CO.',
  }),
  mcq('q6-09', 'haem-oxygenase', 'What happens to the CO released by haem oxygenase (slide 4)?', 'It is excreted via the lungs', ['It becomes part of bilirubin', 'It is reused to make haem', 'It is excreted in bile'], {
    explanation: 'Slide 4 (figure): CO (excreted via lungs).',
  }),
  multi('q6-10', 'haem-oxygenase', 'What does haem oxygenase need (slides 4, 20)? Select all that apply.', ['O₂', 'NADPH (via cytochrome P450 reductase)'], ['UDP-glucuronate', 'Pyridoxal phosphate'], {
    explanation: 'Slides 4 and 20: O₂ and NADPH, delivered by the microsomal electron-transport system (cytochrome P450 reductase).',
    difficulty: 'intermediate',
  }),
  mcq('q6-11', 'haem-oxygenase', 'What is the first product made from the porphyrin ring by haem oxygenase?', 'Biliverdin', ['Bilirubin', 'Urobilinogen', 'Stercobilin'], {
    explanation: 'Slides 4 and 20.',
  }),
  mcq('q6-12', 'haem-oxygenase', 'Can haem oxygenase break down free protoporphyrin IX?', 'No — it acts only on haem', ['Yes — faster than haem', 'Only in the spleen', 'Only when iron is added afterwards'], {
    explanation: 'Slide 3: free protoporphyrin IX is not a substrate.',
  }),
  mcq('q6-13', 'haem-oxygenase', 'How does slide 4 describe haem oxygenase’s location?', 'Microsomal', ['Cytosolic', 'Nuclear', 'Lysosomal'], {
    explanation: 'Slide 4 (textbook page): microsomal haem oxygenase; biliverdin reductase is the cytosolic enzyme.',
    difficulty: 'intermediate',
  }),
  mcq('q6-14', 'biliverdin-to-bilirubin', 'What colour is biliverdin?', 'Green', ['Orange-yellow', 'Red-brown', 'Colourless'], {
    explanation: 'Slide 4 (textbook page): the green pigment biliverdin.',
  }),
  mcq('q6-15', 'biliverdin-to-bilirubin', 'What colour is bilirubin?', 'Orange-yellow', ['Green', 'Blue', 'Colourless'], {
    explanation: 'Slide 4 (textbook page): bilirubin IXα, the orange-yellow bile pigment.',
  }),
  mcq('q6-16', 'biliverdin-to-bilirubin', 'Which coenzyme does biliverdin reductase use?', 'NADPH', ['NADH', 'FAD', 'ATP'], {
    explanation: 'Slides 4 and 20.',
  }),
  tf({
    id: 'q6-17', conceptId: 'biliverdin-to-bilirubin',
    statement: 'Biliverdin reductase is a cytosolic enzyme.',
    answer: true,
    explanation: 'Slide 4 (textbook page): the cytosolic enzyme biliverdin reductase.',
  }),
  order('q6-18', 'biliverdin-to-bilirubin', 'Order the breakdown products of haem.', [
    'Haem',
    'Biliverdin',
    'Bilirubin',
    'Bilirubin diglucuronide',
  ], { explanation: 'Slide 20: haem oxygenase → biliverdin; biliverdin reductase → bilirubin; UGT → glucuronides.' }),
  mcq('q6-19', 'biliverdin-to-bilirubin', 'Lehninger uses a bruise to show this pathway. Which colour sequence follows?', 'Purple → green → yellow', ['Yellow → green → purple', 'Red → blue → black', 'Green → purple → yellow'], {
    explanation: 'Lehninger (p. 855): haemoglobin (purple-black) → biliverdin (green) → bilirubin (yellow).',
  }),
  mcq('q6-20', 'macrophage-handling', 'Where in the macrophage is the red cell degraded (slide 12)?', 'In the phagolysosome', ['In the nucleus', 'In the mitochondria', 'In the Golgi apparatus'], {
    explanation: 'Slide 12.',
  }),
  mcq('q6-21', 'macrophage-handling', 'What happens to globin?', 'It is broken down to amino acids', ['It becomes bilirubin', 'It is excreted in bile', 'It is stored as ferritin'], {
    explanation: 'Slides 12 and 19.',
  }),
  multi('q6-22', 'macrophage-handling', 'What can happen to the iron released in the macrophage (slide 12)? Select all that apply.', ['Stored as ferritin or haemosiderin', 'Added to proteins', 'Released to transferrin'], ['Excreted in bile as bilirubin', 'Breathed out'], {
    explanation: 'Slide 12.',
  }),
  mcq('q6-23', 'macrophage-handling', 'Which protein helps release iron to transferrin (slide 12)?', 'Ceruloplasmin', ['Albumin', 'Ligandin', 'Globin'], {
    explanation: 'Slide 12: released to transferrin with the aid of ceruloplasmin.',
    difficulty: 'intermediate',
  }),
  mcq('q6-24', 'macrophage-handling', 'In what form does bilirubin leave the macrophage?', 'Unconjugated bilirubin, bound to albumin', ['Bilirubin diglucuronide', 'Urobilinogen', 'Free biliverdin'], {
    explanation: 'Slides 12 and 19.',
  }),
  tf({
    id: 'q6-25', conceptId: 'macrophage-handling',
    statement: 'The iron from broken-down haem is mostly lost from the body in urine.',
    answer: false,
    explanation: 'It is stored or released to transferrin and reused (slides 4, 12).',
    skill: 'misconception',
  }),
  match('q6-26', 'macrophage-handling', 'Match each part of the red cell to its fate.', [
    ['Globin', 'Amino acids'],
    ['Iron', 'Ferritin, haemosiderin or transferrin'],
    ['Porphyrin ring', 'Bilirubin'],
  ], { explanation: 'Slides 12 and 19.' }),
];

// ─── Lesson 7 — Conjugation, excretion and jaundice ─────────────────
const lesson7: Q[] = [
  multi('q7-01', 'bilirubin-transport', 'Which proteins carry unconjugated bilirubin to the liver (slide 9)? Select all that apply.', ['Albumin', 'α-Globulins'], ['Transferrin', 'Haemoglobin'], {
    explanation: 'Slide 9: bilirubin is transported to the liver bound to albumin and α-globulins.',
  }),
  mcq('q7-02', 'bilirubin-transport', 'Which cytosolic protein binds bilirubin inside the hepatocyte (slide 5)?', 'Ligandin', ['Albumin', 'Ferritin', 'Transferrin'], {
    explanation: 'Slide 5 (textbook page).',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q7-03', conceptId: 'bilirubin-transport',
    statement: 'Unconjugated bilirubin is highly water-soluble and travels freely in plasma.',
    answer: false,
    explanation: 'It travels bound to albumin (slide 9); Lehninger notes it is largely insoluble (p. 856).',
    skill: 'misconception',
  }),
  fill('q7-04', 'bilirubin-conjugation', 'Bilirubin is conjugated by UDP-glucuronyl ____.', ['transferase'], {
    explanation: 'Slide 5: UDP glucuronyl transferase = UDP glucuronosyl transferase = the conjugating enzyme.',
    skill: 'terminology',
  }),
  mcq('q7-05', 'bilirubin-conjugation', 'How many UDP-glucuronate molecules are used to make one bilirubin diglucuronide?', 'Two', ['One', 'Three', 'Four'], {
    explanation: 'Slide 8: bilirubin + 2 UDP-glucuronate → bilirubin diglucuronide + 2 UDP.',
  }),
  mcq('q7-06', 'bilirubin-conjugation', 'Which hydroxyl group of glucuronic acid is esterified to bilirubin?', 'The one at C-1', ['The one at C-6', 'The one at C-4', 'None — an amide bond forms instead'], {
    explanation: 'Slide 9.',
    difficulty: 'intermediate',
  }),
  mcq('q7-07', 'bilirubin-conjugation', 'What is the main purpose of conjugating bilirubin?', 'To make it water-soluble for excretion in bile', ['To make it fat-soluble for storage', 'To return it to haem synthesis', 'To help it bind albumin'], {
    explanation: 'Slide 9: conjugation forms the water-soluble bilirubin diglucuronide.',
    skill: 'cause-effect',
  }),
  mcq('q7-08', 'bilirubin-conjugation', 'In which part of the hepatocyte is UDP-glucuronyl transferase (slide 5)?', 'Endoplasmic reticulum', ['Mitochondria', 'Nucleus', 'Bile canaliculus'], {
    explanation: 'Slide 5 (textbook figure).',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q7-09', conceptId: 'bilirubin-conjugation',
    statement: 'UDP-glucuronyl transferase is also called UDP-glucuronosyl transferase, “the conjugating enzyme”.',
    answer: true,
    explanation: 'Slide 5.',
    skill: 'terminology',
  }),
  multi('q7-10', 'bilirubin-conjugation', 'Which are products of the conjugation reaction (slide 8)? Select all that apply.', ['Bilirubin diglucuronide', 'UDP'], ['CO₂', 'Biliverdin'], {
    explanation: 'Slide 8.',
  }),
  mcq('q7-11', 'intestinal-fate', 'Is bilirubin diglucuronide well absorbed by the intestinal mucosa?', 'No — it is poorly absorbed', ['Yes — almost completely', 'Only in the stomach', 'Only after being reconjugated'], {
    explanation: 'Slide 11.',
  }),
  mcq('q7-12', 'intestinal-fate', 'According to slide 11, what removes the glucuronide residues in the gut?', 'Bacterial hydrolases', ['Pancreatic lipase', 'UDP-glucuronyl transferase', 'Stomach acid'], {
    explanation: 'Slide 11 (the pasted textbook page also names bacterial β-glucuronidase).',
  }),
  mcq('q7-13', 'intestinal-fate', 'What are urobilinogens?', 'Colourless linear tetrapyrroles made by reducing bilirubin', ['Coloured cyclic porphyrins', 'Conjugated bilirubins', 'Iron-containing pigments'], {
    explanation: 'Slide 11.',
  }),
  mcq('q7-14', 'intestinal-fate', 'Urobilinogens are oxidised to what?', 'Coloured urobilins (stercobilins)', ['Colourless bilirubin', 'Biliverdin', 'Haem'], {
    explanation: 'Slide 11.',
  }),
  fill('q7-15', 'intestinal-fate', 'Reabsorption of urobilinogen and its return to the liver is called ____ recirculation.', ['enterohepatic', 'entero-hepatic'], {
    explanation: 'Slide 20: enterohepatic recirculation.',
    skill: 'terminology',
  }),
  tf({
    id: 'q7-16', conceptId: 'intestinal-fate',
    statement: 'Urobilinogens are the coloured pigments of faeces.',
    answer: false,
    explanation: 'Urobilinogens are colourless; their oxidation products — urobilins/stercobilins — are coloured (slide 11).',
    skill: 'misconception',
  }),
  mcq('q7-17', 'intestinal-fate', 'Lehninger: which pigment gives urine its yellow colour?', 'Urobilin', ['Stercobilin', 'Biliverdin', 'Bilirubin diglucuronide'], {
    explanation: 'Lehninger (p. 856): reabsorbed urobilinogen is converted to urobilin in the kidney, colouring urine; stercobilin colours faeces.',
  }),
  mcq('q7-18', 'intestinal-fate', 'According to the textbook page on slide 5, how much of the urobilinogen made each day is reabsorbed?', 'Up to about 20%', ['Nearly all of it', 'None', 'About 75%'], {
    explanation: 'Slide 5 (textbook page): up to 20% is reabsorbed into the enterohepatic circulation; only 2–5% reaches the urine.',
    difficulty: 'advanced',
  }),
  mcq('q7-19', 'jaundice-causes', 'Haemolysis from ABO incompatibility causes which type of jaundice?', 'Prehepatic', ['Hepatic', 'Posthepatic', 'It causes no jaundice'], {
    explanation: 'Slide 13: prehepatic (mainly haemolytic).',
  }),
  multi('q7-20', 'jaundice-causes', 'Which are HEPATIC causes of jaundice in the lecture? Select all that apply.', ['Viral hepatitis', 'Gilbert’s syndrome', 'Wilson’s disease', 'Acetaminophen'], ['Gall stones', 'G6PD deficiency'], {
    explanation: 'Slide 14. Gall stones are posthepatic; G6PD deficiency is prehepatic.',
    difficulty: 'intermediate',
  }),
  multi('q7-21', 'jaundice-causes', 'Which are POSTHEPATIC causes? Select all that apply.', ['Gall stones', 'Cancer of the head of the pancreas', 'Cholangiocarcinoma', 'Primary biliary cirrhosis'], ['Thalassaemia', 'Crigler–Najjar syndrome'], {
    explanation: 'Slide 16.',
    difficulty: 'intermediate',
  }),
  mcq('q7-22', 'jaundice-causes', 'Which syndromes are genetic errors of bilirubin UPTAKE and CONJUGATION (slide 14)?', 'Gilbert’s and Crigler–Najjar', ['Dubin–Johnson and Rotor', 'Wilson’s and α₁-antitrypsin deficiency', 'Sickle cell and thalassaemia'], {
    explanation: 'Slide 14. Dubin–Johnson and Rotor affect excretion of conjugated bilirubin (slide 15).',
  }),
  mcq('q7-23', 'jaundice-causes', 'Dubin–Johnson and Rotor syndromes affect which step?', 'Excretion of conjugated bilirubin', ['Conjugation of bilirubin', 'Haem oxygenase activity', 'Red-cell survival'], {
    explanation: 'Slide 15: difficulty with excretion of conjugated bilirubin.',
  }),
  mcq('q7-24', 'jaundice-causes', 'In viral hepatitis, what happens to conjugated bilirubin (slide 14)?', 'It regurgitates into the serum (intrahepatic cholestasis)', ['It is not formed at all', 'It is excreted only as urobilin', 'It is turned back into haem'], {
    explanation: 'Slide 14.',
    difficulty: 'intermediate',
  }),
  multi('q7-25', 'jaundice-causes', 'Which drugs or chemicals does the lecture list as hepatic causes of jaundice? Select all that apply.', ['Methyltestosterone', 'Phenothiazines', 'Acetaminophen', 'Alcohol'], ['Insulin', 'Vitamin C'], {
    explanation: 'Slide 14.',
  }),
  match('q7-26', 'jaundice-causes', 'Match each condition to its type of jaundice.', [
    ['Thalassaemia', 'Prehepatic'],
    ['Dubin–Johnson syndrome', 'Hepatic'],
    ['Cholangiocarcinoma', 'Posthepatic'],
    ['Sickle haemoglobin', 'Prehepatic'],
  ], { explanation: 'Slides 13–16.' }),
  mcq('q7-27', 'jaundice-causes', 'Oral contraceptives can cause jaundice through which structures (slide 16)?', 'Intrahepatic bile ducts (posthepatic)', ['Red cells (prehepatic)', 'Haem oxygenase', 'Albumin binding'], {
    explanation: 'Slide 16: posthepatic — intrahepatic bile ducts: drugs (oral contraceptives).',
    difficulty: 'intermediate',
  }),
  mcq('q7-28', 'phototherapy', 'Which light is used in phototherapy for neonatal jaundice?', 'Blue', ['Red', 'Ultraviolet C', 'Infrared'], {
    explanation: 'Slide 18: blue wavelengths of light.',
  }),
  tf({
    id: 'q7-29', conceptId: 'phototherapy',
    statement: 'In phototherapy, bilirubin photoisomers are excreted in bile and urine without being conjugated.',
    answer: true,
    explanation: 'Slide 18.',
  }),
  mcq('q7-30', 'phototherapy', 'Why are newborns prone to physiological jaundice (slide 13)?', 'Their conjugating system is immature', ['They have too much albumin', 'They lack haem oxygenase', 'Their bile ducts are blocked'], {
    explanation: 'Slide 13: physiological neonatal jaundice — immature conjugating system. Lehninger: not yet enough glucuronyl bilirubin transferase (p. 856).',
    clinical: true,
  }),
];

export const questions: Q[] = [...lesson1, ...lesson2, ...lesson3, ...lesson4, ...lesson5, ...lesson6, ...lesson7];
