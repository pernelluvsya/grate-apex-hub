// Biochemistry → Cholesterol and Bile Biosynthesis: the topic question bank.
//
// Each question names a concept; the concept decides its lesson and its
// source slides (see ./sources.ts). This bank is the source of Lesson Quiz
// questions — lessons teach first, the quiz tests after.
//
// Rules for this bank:
// - Only material the lessons teach (./lessons.ts): the lecture slides and
//   their diagrams, plus a few labelled Lehninger clarifications (marked
//   "Lehninger" in the prompt).
// - Unresolved points (the liver's 20% share; the "three vs five"
//   mechanisms on slide 13) are never asked.
// - No trivial rewordings of a checkpoint in ./interactive.ts.
// - Options are shuffled at quiz time, so the correct option is written
//   first (mcq/multi helpers).
//
// IDs: qN-xx, N = lesson.
import { fill, match, mcq, multi, order, tf, type QuestionDraft } from '@/data/topics/build';
import type { ConceptId } from '@/data/topics/cholesterol-and-bile-biosynthesis/sources';

type Q = QuestionDraft<ConceptId>;

// ─── Lesson 1 — Structure, sites and raw materials ──────────────────
const lesson1: Q[] = [
  fill('q1-01', 'steroid-nucleus', 'The four-ring nucleus of cholesterol is the ____ ring.', ['cyclopentanoperhydrophenanthrene', 'cyclopentano-perhydrophenanthrene'], {
    explanation: 'Slide 3: the four-ring nucleus of cholesterol is the cyclopentanoperhydrophenanthrene ring.',
    skill: 'terminology',
    difficulty: 'intermediate',
  }),
  mcq('q1-02', 'steroid-nucleus', 'The lecture stresses that cholesterol’s nucleus is not a benzene ring. What reason does it give?', 'Animals cannot synthesise a benzene ring', ['Benzene rings cannot be fused together', 'Benzene rings cannot carry an –OH group', 'Benzene is too unstable to exist in cells'], {
    explanation: 'Slide 3: “Note not benzene ring; animals cannot synthesise benzene ring.”',
  }),
  mcq('q1-03', 'steroid-nucleus', 'How many rings make up the steroid nucleus of cholesterol?', 'Four', ['Three', 'Five', 'Six'], {
    explanation: 'Slide 4: four fused rings, labelled A, B, C and D.',
  }),
  mcq('q1-04', 'steroid-nucleus', 'How many of the steroid nucleus rings are five-membered?', 'One — ring D', ['None', 'Two — rings C and D', 'All four'], {
    explanation: 'Slide 4: rings A, B and C are six-membered; ring D is five-membered.',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q1-05', conceptId: 'steroid-nucleus',
    statement: 'Animals cannot synthesise a benzene ring.',
    answer: true,
    explanation: 'Slide 3 — which is why cholesterol’s nucleus is not a benzene ring system.',
  }),
  mcq('q1-06', 'cholesterol-landmarks', 'On which carbon is cholesterol’s hydroxyl group?', 'Carbon 3', ['Carbon 5', 'Carbon 6', 'Carbon 17'], {
    explanation: 'Slide 4: HO– on carbon 3 of ring A.',
  }),
  mcq('q1-07', 'cholesterol-landmarks', 'Where is the double bond in cholesterol’s ring system?', 'Between carbons 5 and 6', ['Between carbons 3 and 4', 'Between carbons 16 and 17', 'There is no double bond'], {
    explanation: 'Slide 4: the double bond links carbons 5 and 6 (ring B).',
  }),
  fill('q1-08', 'cholesterol-landmarks', 'Cholesterol’s branched side chain is attached at carbon ____.', ['17', 'C17', 'seventeen'], {
    explanation: 'Slide 4: the side chain sits on carbon 17 of ring D.',
  }),
  mcq('q1-09', 'cholesterol-landmarks', 'Which ring carries cholesterol’s hydroxyl group?', 'Ring A', ['Ring B', 'Ring C', 'Ring D'], {
    explanation: 'Slide 4: the –OH is on carbon 3, in ring A.',
  }),
  match('q1-10', 'cholesterol-landmarks', 'Match each ring of cholesterol to its feature (slide 4).', [
    ['Ring A', 'Carries the –OH at C-3'],
    ['Ring B', 'Holds the C-5=C-6 double bond'],
    ['Ring D', 'Five-membered; side chain at C-17'],
  ], { explanation: 'All three features are labelled on the structure on slide 4.' }),
  tf({
    id: 'q1-11', conceptId: 'cholesterol-landmarks',
    statement: 'Cholesterol’s side chain is attached to ring A.',
    answer: false,
    explanation: 'The side chain is on carbon 17 of ring D. Ring A carries the –OH at carbon 3.',
    skill: 'misconception',
  }),
  mcq('q1-12', 'synthesis-sites', 'Which two sites of cholesterol synthesis does slide 3 name?', 'Liver and intestinal mucosa', ['Lungs and kidneys', 'Brain and skeletal muscle', 'Spleen and bone marrow'], {
    explanation: 'Slide 3: distribution — all cells; synthesised from acetic acid in animal tissue; liver and intestinal mucosa.',
  }),
  multi('q1-13', 'synthesis-sites', 'Besides the liver, which sites does the lecture name for high rates of cholesterol synthesis? Select all that apply.', ['Intestines', 'Adrenal glands', 'Reproductive organs'], ['Lungs', 'Kidneys'], {
    explanation: 'Slide 2: other sites of higher synthesis rates include the intestines, adrenal glands and reproductive organs.',
  }),
  tf({
    id: 'q1-14', conceptId: 'synthesis-sites',
    statement: 'According to the lecture, cholesterol is found in all cells and is synthesised from acetic acid in animal tissue.',
    answer: true,
    explanation: 'Slide 3: “Distribution: All cells — and synthesized from acetic acid in animal tissue.”',
  }),
  mcq('q1-15', 'acetate-origin', 'All of cholesterol’s carbon atoms come from which precursor?', 'Acetate (as acetyl-CoA)', ['Glycerol', 'Malonyl-CoA', 'Propionyl-CoA'], {
    explanation: 'Slide 5: cholesterol is synthesised from acetate precursors.',
  }),
  multi('q1-16', 'acetate-origin', 'Slide 5 colours cholesterol’s carbons by origin. Which parts of acetate supply them? Select all that apply.', ['The methyl carbon', 'The carbonyl carbon'], ['The oxygen atoms', 'CO₂ from the air'], {
    explanation: 'Slide 5: green carbons come from acetate’s methyl group, red carbons from its carbonyl group.',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q1-17', conceptId: 'acetate-origin',
    statement: 'Every carbon atom of cholesterol can be traced back to acetate.',
    answer: true,
    explanation: 'Slide 5 colours every carbon as coming from acetate’s methyl or carbonyl group.',
  }),
  fill('q1-18', 'acetate-origin', 'In the cell, the acetate used to build cholesterol is in the form of ____.', ['acetyl-CoA', 'acetyl coenzyme A'], {
    explanation: 'The pathway starts from acetyl-CoA: two acetyl-CoA condense to acetoacetyl-CoA (slide 2).',
  }),
  mcq('q1-19', 'pyruvate-malate-supply', 'In the Pyruvate–Malate cycle, in what form do acetyl groups leave the mitochondrion?', 'Citrate', ['Acetyl-CoA', 'Malate', 'Pyruvate'], {
    explanation: 'Slide 6: citrate crosses both mitochondrial membranes; ATP-citrate lyase then releases acetyl-CoA in the cytosol.',
  }),
  mcq('q1-20', 'pyruvate-malate-supply', 'Which cytosolic enzyme releases acetyl-CoA from citrate?', 'ATP-citrate lyase', ['Citrate synthase', 'Malic enzyme', 'Pyruvate carboxylase'], {
    explanation: 'Slide 6: citrate + CoA + ATP → acetyl-CoA + oxaloacetate + ADP + Pi (ATP-citrate lyase).',
  }),
  mcq('q1-21', 'pyruvate-malate-supply', 'What does ATP-citrate lyase spend for each citrate it splits?', 'One ATP (→ ADP + Pi)', ['One NADPH', 'One GTP', 'Nothing'], {
    explanation: 'Slide 6: ATP → ADP + Pi at ATP-citrate lyase.',
  }),
  fill('q1-22', 'pyruvate-malate-supply', 'Malic enzyme converts malate to pyruvate, producing CO₂ and ____.', ['NADPH', 'NADPH + H+'], {
    explanation: 'Slide 6: malic enzyme reduces NADP⁺ to NADPH and releases CO₂.',
  }),
  mcq('q1-23', 'pyruvate-malate-supply', 'Which step of the cycle uses NADH?', 'Oxaloacetate → malate (malate dehydrogenase)', ['Malate → pyruvate (malic enzyme)', 'Citrate → acetyl-CoA (ATP-citrate lyase)', 'Pyruvate → oxaloacetate (pyruvate carboxylase)'], {
    explanation: 'Slide 6: malate dehydrogenase reduces oxaloacetate to malate, turning NADH into NAD⁺.',
    difficulty: 'intermediate',
  }),
  match('q1-24', 'pyruvate-malate-supply', 'Match each enzyme to where it works (slide 6).', [
    ['Citrate synthase', 'Mitochondrial matrix'],
    ['Pyruvate carboxylase', 'Mitochondrial matrix'],
    ['ATP-citrate lyase', 'Cytosol'],
    ['Malic enzyme', 'Cytosol'],
  ], { explanation: 'Citrate is made in the matrix and split in the cytosol; malate → pyruvate happens in the cytosol; pyruvate is carboxylated in the matrix.' }),
  mcq('q1-25', 'pyruvate-malate-supply', 'Why does cholesterol synthesis depend on the Pyruvate–Malate cycle?', 'It supplies the cytosol with acetyl-CoA and NADPH', ['It supplies the mitochondria with ATP', 'It removes excess cholesterol from cells', 'It makes HMG-CoA inside the mitochondria'], {
    explanation: 'ATP-citrate lyase frees acetyl-CoA in the cytosol and malic enzyme makes NADPH — the carbon source and the reductant (HMG-CoA reductase uses 2 NADPH).',
    skill: 'pathway-reasoning',
    difficulty: 'intermediate',
  }),
  mcq('q1-26', 'pyruvate-malate-supply', 'Which enzyme turns pyruvate back into oxaloacetate in the matrix, using CO₂ and ATP?', 'Pyruvate carboxylase', ['Malate dehydrogenase', 'Citrate synthase', 'ATP-citrate lyase'], {
    explanation: 'Slide 6: pyruvate carboxylase — CO₂ + ATP → ADP + Pi.',
  }),
  tf({
    id: 'q1-27', conceptId: 'pyruvate-malate-supply',
    statement: 'In the Pyruvate–Malate cycle, malate dehydrogenase makes the NADPH used in cholesterol synthesis.',
    answer: false,
    explanation: 'Malic enzyme makes NADPH. Malate dehydrogenase uses NADH to reduce oxaloacetate to malate.',
    skill: 'misconception',
  }),
];

// ─── Lesson 2 — Acetyl-CoA to mevalonate ────────────────────────────
const lesson2: Q[] = [
  order('q2-01', 'five-stages', 'Put these molecules in the order they appear in cholesterol synthesis.', [
    'Acetoacetyl-CoA',
    'HMG-CoA',
    'Mevalonate',
    'Isopentenyl pyrophosphate',
    'Squalene',
    'Cholesterol',
  ], { explanation: 'Slides 7 and 12: acetyl-CoA → acetoacetyl-CoA → HMG-CoA → mevalonate → IPP → squalene → cholesterol.' }),
  mcq('q2-02', 'five-stages', 'In which stage is CO₂ lost?', 'Mevalonate → isopentenyl pyrophosphate', ['Acetyl-CoA → HMG-CoA', 'HMG-CoA → mevalonate', 'Squalene → cholesterol'], {
    explanation: 'Slide 7: stage 3 converts mevalonate to IPP “with the concomitant loss of CO₂”.',
  }),
  mcq('q2-03', 'five-stages', 'Which stage comes immediately after HMG-CoA → mevalonate?', 'Mevalonate → isopentenyl pyrophosphate', ['Isopentenyl pyrophosphate → squalene', 'Acetyl-CoA → HMG-CoA', 'Squalene → cholesterol'], {
    explanation: 'Slide 7: stage 2 makes mevalonate; stage 3 turns it into isopentenyl pyrophosphate.',
  }),
  fill('q2-04', 'five-stages', 'Stage 3 converts mevalonate into the isoprene-based molecule isopentenyl ____.', ['pyrophosphate', 'diphosphate'], {
    explanation: 'Slide 7: mevalonate is converted to the isoprene-based molecule isopentenyl pyrophosphate (IPP).',
    skill: 'terminology',
  }),
  tf({
    id: 'q2-05', conceptId: 'five-stages',
    statement: 'In the lecture’s five stages, the last stage is squalene → cholesterol.',
    answer: true,
    explanation: 'Slide 7: 4. IPP → squalene; 5. squalene → cholesterol.',
  }),
  fill('q2-06', 'acetoacetyl-coa-step', 'Two molecules of acetyl-CoA condense to form ____.', ['acetoacetyl-CoA', 'acetoacetyl coenzyme A'], {
    explanation: 'Slide 2: the mevalonate pathway starts when two acetyl-CoA condense to form acetoacetyl-CoA.',
  }),
  mcq('q2-07', 'acetoacetyl-coa-step', 'How many acetyl-CoA units go into one HMG-CoA in total?', 'Three', ['Two', 'Four', 'Six'], {
    explanation: 'Two acetyl-CoA make acetoacetyl-CoA (slide 2); a third joins it to make HMG-CoA (slide 8).',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q2-08', conceptId: 'acetoacetyl-coa-step',
    statement: 'The mevalonate pathway starts with the condensation of acetyl-CoA with malonyl-CoA.',
    answer: false,
    explanation: 'It starts with two acetyl-CoA condensing to acetoacetyl-CoA (slide 2). Malonyl-CoA belongs to fatty acid synthesis.',
    skill: 'misconception',
  }),
  mcq('q2-09', 'hmg-coa-formation', 'Which reactants form HMG-CoA (slide 8)?', 'Acetoacetyl-CoA + acetyl-CoA + H₂O', ['Acetyl-CoA + malonyl-CoA', 'Acetoacetate + CoA', 'Two acetyl-CoA + CO₂'], {
    explanation: 'Slide 8: acetoacetyl-CoA + acetyl-CoA + H₂O → 3-hydroxy-3-methylglutaryl-CoA.',
  }),
  mcq('q2-10', 'hmg-coa-formation', 'What does “HMG” in HMG-CoA stand for?', '3-Hydroxy-3-methylglutaryl', ['Hydroxymethylglycine', '3-Hydroxy-3-malonylglutamate', 'Hexamethylglucose'], {
    explanation: 'Slides 7–8: HMG-CoA is 3-hydroxy-3-methylglutaryl-CoA.',
    skill: 'terminology',
  }),
  tf({
    id: 'q2-11', conceptId: 'hmg-coa-formation',
    statement: 'Water is one of the reactants when HMG-CoA is formed.',
    answer: true,
    explanation: 'Slide 8: acetoacetyl-CoA + acetyl-CoA + H₂O → HMG-CoA.',
    difficulty: 'intermediate',
  }),
  mcq('q2-12', 'hmg-coa-formation', 'Lehninger: which enzyme forms HMG-CoA from acetoacetyl-CoA and acetyl-CoA?', 'HMG-CoA synthase', ['HMG-CoA reductase', 'Thiolase', 'ATP-citrate lyase'], {
    explanation: 'Lehninger (p. 817): thiolase makes acetoacetyl-CoA; HMG-CoA synthase makes HMG-CoA; HMG-CoA reductase then makes mevalonate.',
    difficulty: 'intermediate',
  }),
  mcq('q2-13', 'hmg-coa-crossroads', 'In the mitochondria, a cleavage enzyme splits HMG-CoA. What are the products?', 'Acetoacetate + acetyl-CoA', ['Mevalonate + CoA', 'Two acetyl-CoA + CO₂', 'Acetoacetyl-CoA + water'], {
    explanation: 'Slide 8: “cleavage enzyme in mitochondria” → acetoacetate + acetyl-CoA.',
  }),
  mcq('q2-14', 'hmg-coa-crossroads', 'Where does slide 8 place the reductase that turns HMG-CoA into mevalonate?', 'In the cytosol', ['In the mitochondrial matrix', 'In the nucleus', 'In lysosomes'], {
    explanation: 'Slide 8: “reductase in cytosol” — outside the mitochondria (slide 15 adds that HMGR sits in the ER).',
  }),
  match('q2-15', 'hmg-coa-crossroads', 'Match each fate of HMG-CoA to where it happens and what it gives.', [
    ['Cleavage enzyme', 'Mitochondria → acetoacetate + acetyl-CoA'],
    ['Reductase', 'Cytosol → mevalonate'],
  ], { explanation: 'Slide 8 shows both fates.' }),
  tf({
    id: 'q2-16', conceptId: 'hmg-coa-crossroads',
    statement: 'HMG-CoA in the mitochondria is reduced to mevalonate for cholesterol synthesis.',
    answer: false,
    explanation: 'In mitochondria a cleavage enzyme splits it into acetoacetate + acetyl-CoA. Mevalonate is made by the reductase outside the mitochondria.',
    skill: 'misconception',
  }),
  mcq('q2-17', 'hmg-coa-crossroads', 'Slide 15 says HMGR is localised in which organelle?', 'Endoplasmic reticulum', ['Mitochondria', 'Golgi apparatus', 'Nucleus'], {
    explanation: 'Slide 15: “HMGR is localized in the ER”. Lehninger: an integral membrane protein of the smooth ER.',
  }),
  mcq('q2-18', 'hmg-coa-crossroads', 'Lehninger links the mitochondrial HMG-CoA route (giving acetoacetate) to which process?', 'Ketone body formation', ['Fatty acid synthesis', 'Bile acid synthesis', 'Glycogen synthesis'], {
    explanation: 'Lehninger (p. 817): the mitochondrial HMG-CoA synthase isozyme serves ketone body formation; the cytosolic one serves cholesterol synthesis.',
    difficulty: 'intermediate',
  }),
  fill('q2-19', 'hmg-coa-reductase-step', 'HMG-CoA reductase converts HMG-CoA into ____.', ['mevalonate', 'mevalonic acid'], {
    explanation: 'Slides 8 and 12: HMG-CoA → mevalonate.',
  }),
  mcq('q2-20', 'hmg-coa-reductase-step', 'Which coenzyme supplies the reducing power for HMG-CoA reductase?', 'NADPH', ['NADH', 'FADH₂', 'ATP'], {
    explanation: 'Slide 12: “(2) NADPH” at HMG-CoA reductase.',
  }),
  mcq('q2-21', 'hmg-coa-reductase-step', 'Which step is the main control point of cholesterol synthesis?', 'HMG-CoA → mevalonate (HMG-CoA reductase)', ['Acetyl-CoA + acetyl-CoA → acetoacetyl-CoA', 'Squalene → lanosterol', 'Mevalonate → 5-phosphomevalonate'], {
    explanation: 'Slide 14: HMGR is the primary cholesterol-regulating mechanism.',
  }),
  tf({
    id: 'q2-22', conceptId: 'hmg-coa-reductase-step',
    statement: 'HMG-CoA reductase uses ATP to reduce HMG-CoA.',
    answer: false,
    explanation: 'It uses 2 NADPH. ATP is spent in stage 3 (mevalonate → IPP).',
    skill: 'misconception',
  }),
  mcq('q2-23', 'hmg-coa-reductase-step', 'A drug blocks HMG-CoA reductase. Which molecule would you expect to build up?', 'HMG-CoA', ['Mevalonate', 'Squalene', 'Isopentenyl pyrophosphate'], {
    explanation: 'Blocking an enzyme lets its substrate accumulate and starves everything after it. HMG-CoA is the substrate; mevalonate and later intermediates fall.',
    skill: 'prediction',
    difficulty: 'intermediate',
  }),
  mcq('q2-24', 'hmg-coa-reductase-step', 'If the cytosol ran short of NADPH, which of these steps would be affected directly?', 'HMG-CoA → mevalonate', ['Acetyl-CoA + acetyl-CoA → acetoacetyl-CoA', 'Acetoacetyl-CoA → HMG-CoA', 'None of them'], {
    explanation: 'Only the HMG-CoA reductase step uses NADPH (2 per HMG-CoA, slide 12).',
    skill: 'application',
    difficulty: 'intermediate',
  }),
  order('q2-25', 'hmg-coa-reductase-step', 'Order the reactions from acetyl-CoA to mevalonate.', [
    'Acetyl-CoA + acetyl-CoA → acetoacetyl-CoA',
    'Acetoacetyl-CoA + acetyl-CoA + H₂O → HMG-CoA',
    'HMG-CoA + 2 NADPH → mevalonate',
  ], { explanation: 'Slides 2, 8 and 12.' }),
  tf({
    id: 'q2-26', conceptId: 'hmg-coa-reductase-step',
    statement: 'Lehninger describes the reduction of HMG-CoA to mevalonate as the committed, rate-limiting step of cholesterol synthesis.',
    answer: true,
    explanation: 'Lehninger (p. 817). The lecture makes the same point by calling HMGR the primary regulation mechanism (slide 14).',
  }),
];

// ─── Lesson 3 — Mevalonate to cholesterol ───────────────────────────
const lesson3: Q[] = [
  mcq('q3-01', 'mevalonate-to-ipp', 'How many ATP are used to turn one mevalonate into isopentenyl pyrophosphate?', 'Three', ['One', 'Two', 'Four'], {
    explanation: 'Slides 9 and 12: one ATP for each of the three steps — “(3) ATP”.',
  }),
  mcq('q3-02', 'mevalonate-to-ipp', 'Which step of stage 3 releases CO₂?', '5-Pyrophosphomevalonate → isopentenyl pyrophosphate', ['Mevalonate → 5-phosphomevalonate', '5-Phosphomevalonate → 5-pyrophosphomevalonate', 'HMG-CoA → mevalonate'], {
    explanation: 'Slide 9: the last step uses ATP and releases ADP + Pi + CO₂.',
  }),
  fill('q3-03', 'mevalonate-to-ipp', 'The first product of stage 3, made from mevalonate with one ATP, is ____.', ['5-phosphomevalonate', 'phosphomevalonate'], {
    explanation: 'Slide 9: mevalonate → 5-phosphomevalonate (ATP → ADP).',
  }),
  multi('q3-04', 'mevalonate-to-ipp', 'Which are released in the final step, 5-pyrophosphomevalonate → isopentenyl pyrophosphate? Select all that apply.', ['CO₂', 'ADP', 'Pi'], ['NADPH', 'PPi'], {
    explanation: 'Slide 9: ATP → ADP + Pi + CO₂.',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q3-05', conceptId: 'mevalonate-to-ipp',
    statement: 'Isopentenyl pyrophosphate is an isoprene-based molecule.',
    answer: true,
    explanation: 'Slide 7: mevalonate is converted to the isoprene-based molecule isopentenyl pyrophosphate.',
  }),
  mcq('q3-06', 'mevalonate-to-ipp', 'What is the immediate precursor of isopentenyl pyrophosphate?', '5-Pyrophosphomevalonate', ['5-Phosphomevalonate', 'Mevalonate', 'Geranyl pyrophosphate'], {
    explanation: 'Slide 9: 5-pyrophosphomevalonate → isopentenyl pyrophosphate.',
  }),
  mcq('q3-07', 'prenyl-condensation', 'In the chain-building step (slide 10), what kind of carbon does isopentenyl pyrophosphate attack?', 'A positively charged carbon, left when PPi departs', ['A carbon carrying a CoA thioester', 'The carbonyl carbon of acetyl-CoA', 'A negatively charged carboxylate'], {
    explanation: 'Slide 10: the allylic substrate loses PPi, leaving a carbonium ion (C⁺) that IPP attacks.',
    skill: 'pathway-reasoning',
    difficulty: 'advanced',
  }),
  fill('q3-08', 'prenyl-condensation', 'Each condensation releases ____ from the allylic substrate.', ['PPi', 'pyrophosphate', 'inorganic pyrophosphate'], {
    explanation: 'Slide 10: the allylic substrate loses PPi before IPP joins on.',
  }),
  mcq('q3-09', 'prenyl-condensation', 'Which molecule is added in each chain-lengthening condensation?', 'Isopentenyl pyrophosphate', ['Acetyl-CoA', 'Malonyl-CoA', 'Mevalonate'], {
    explanation: 'Slide 10: IPP joins the allylic substrate each round.',
  }),
  mcq('q3-10', 'prenyl-condensation', 'What forms when geranyl pyrophosphate condenses with one more IPP?', 'Farnesyl pyrophosphate', ['Squalene', 'Lanosterol', 'Dolichol'], {
    explanation: 'Slides 10 and 12: geranyl pyrophosphate → farnesyl pyrophosphate.',
  }),
  tf({
    id: 'q3-11', conceptId: 'prenyl-condensation',
    statement: 'The intermediate formed when IPP joins the allylic substrate is called the condensation carbonium ion.',
    answer: true,
    explanation: 'Slide 10 labels it the “condensation carbonium ion”.',
    skill: 'terminology',
  }),
  mcq('q3-12', 'prenyl-condensation', 'Lehninger: how many carbons do geranyl and farnesyl pyrophosphate have?', '10 and 15', ['5 and 10', '15 and 30', '10 and 20'], {
    explanation: 'Lehninger (pp. 818–819): each IPP adds five carbons — geranyl pyrophosphate has 10, farnesyl pyrophosphate 15; two farnesyl units give squalene (30).',
    difficulty: 'intermediate',
  }),
  mcq('q3-13', 'squalene-to-cholesterol', 'Which molecule is the immediate precursor of lanosterol?', 'Squalene', ['Farnesyl pyrophosphate', 'Cholesterol', 'Mevalonate'], {
    explanation: 'Slide 12: squalene → lanosterol → cholesterol.',
  }),
  mcq('q3-14', 'squalene-to-cholesterol', 'Which comes directly AFTER farnesyl pyrophosphate on the way to cholesterol?', 'Squalene', ['Lanosterol', 'Geranyl pyrophosphate', 'Mevalonate'], {
    explanation: 'Slide 12: farnesyl pyrophosphate → squalene.',
  }),
  tf({
    id: 'q3-15', conceptId: 'squalene-to-cholesterol',
    statement: 'Squalene already has the four rings of the steroid nucleus.',
    answer: false,
    explanation: 'Squalene (C₃₀) is linear; it closes up into the ring system on the way to cholesterol (slide 11).',
    skill: 'misconception',
  }),
  mcq('q3-16', 'squalene-to-cholesterol', 'Which sequence is correct?', 'Squalene → lanosterol → cholesterol', ['Lanosterol → squalene → cholesterol', 'Cholesterol → lanosterol → squalene', 'Squalene → cholesterol → lanosterol'], {
    explanation: 'Slide 12 shows squalene → lanosterol → (several steps) → cholesterol.',
  }),
  mcq('q3-17', 'squalene-to-cholesterol', 'Lehninger: what is the first step in turning squalene into the steroid ring system?', 'Squalene monooxygenase forms squalene 2,3-epoxide', ['HMG-CoA reductase reduces squalene', '7α-Hydroxylase adds an –OH at C-7', 'A kinase phosphorylates squalene'], {
    explanation: 'Lehninger (pp. 819–820): squalene monooxygenase (O₂, NADPH) makes squalene 2,3-epoxide, which a cyclase closes into lanosterol.',
    difficulty: 'advanced',
  }),
  mcq('q3-18', 'squalene-to-cholesterol', 'How does slide 12 show the conversion of lanosterol to cholesterol?', 'As a dotted arrow — several steps', ['As a single enzyme step', 'As a reversible equilibrium', 'It is not shown'], {
    explanation: 'Slide 12: lanosterol ⋯→ cholesterol. Lehninger: about 20 reactions.',
  }),
  mcq('q3-19', 'pathway-branches', 'Besides squalene, which molecules does slide 12 show branching off from farnesyl pyrophosphate?', 'Heme a, dolichol and ubiquinone (and prenylated proteins)', ['Bile salts and steroids', 'Acetoacetate and acetyl-CoA', 'Glycocholic and taurocholic acid'], {
    explanation: 'Slide 12: farnesyl pyrophosphate → heme a, dolichol, ubiquinone, and prenylated proteins.',
  }),
  mcq('q3-20', 'pathway-branches', 'Prenylated proteins are made from which intermediates (slide 12)?', 'Geranyl and farnesyl pyrophosphate', ['Squalene and lanosterol', 'Mevalonate and HMG-CoA', 'Cholesterol only'], {
    explanation: 'Slide 12: arrows run from both geranyl and farnesyl pyrophosphate to prenylated proteins.',
    difficulty: 'intermediate',
  }),
  match('q3-21', 'pathway-branches', 'Match each product to what it is made from (slide 12).', [
    ['Bile salts', 'Cholesterol, in the liver'],
    ['Steroids', 'Cholesterol, in endocrine glands'],
    ['Ubiquinone', 'Farnesyl pyrophosphate'],
    ['Dolichol', 'Farnesyl pyrophosphate'],
  ], { explanation: 'Slide 12 shows these branches.' }),
  mcq('q3-22', 'pathway-branches', 'The adrenal glands and reproductive organs have high rates of cholesterol synthesis (slide 2). Which use of cholesterol on slide 12 fits these organs?', 'Making steroids in endocrine glands', ['Making bile salts', 'Making dolichol', 'Making heme a'], {
    explanation: 'Slide 12: cholesterol → steroids in endocrine glands. Bile salts are made in the liver; dolichol and heme a come from farnesyl pyrophosphate.',
    skill: 'application',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q3-23', conceptId: 'pathway-branches',
    statement: 'Blocking HMG-CoA reductase would reduce not only cholesterol but also the farnesyl pyrophosphate available for its branch products.',
    answer: true,
    explanation: 'Farnesyl pyrophosphate lies downstream of mevalonate (slide 12), so heme a, dolichol, ubiquinone and prenylated proteins also depend on the HMG-CoA reductase step.',
    skill: 'pathway-reasoning',
    difficulty: 'advanced',
  }),
  multi('q3-24', 'pathway-branches', 'Which of these are made from CHOLESTEROL itself rather than from earlier intermediates? Select all that apply.', ['Bile salts', 'Steroids'], ['Dolichol', 'Ubiquinone', 'Prenylated proteins'], {
    explanation: 'Slide 12: bile salts (liver) and steroids (endocrine glands) come from cholesterol; the others branch off at farnesyl/geranyl pyrophosphate.',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q3-25', conceptId: 'pathway-branches',
    statement: 'Dolichol and ubiquinone are made from cholesterol after it has been formed.',
    answer: false,
    explanation: 'Slide 12: dolichol and ubiquinone branch off at farnesyl pyrophosphate, before squalene.',
    skill: 'misconception',
  }),
  mcq('q3-26', 'pathway-branches', 'On slide 12, which intermediate before squalene feeds the most branch products?', 'Farnesyl pyrophosphate', ['Lanosterol', 'Mevalonate', '5-Pyrophosphomevalonate'], {
    explanation: 'Farnesyl pyrophosphate feeds heme a, dolichol, ubiquinone and prenylated proteins, as well as squalene.',
  }),
];

// ─── Lesson 4 — Regulation ──────────────────────────────────────────
const lesson4: Q[] = [
  fill('q4-01', 'supply-mechanisms', 'ACAT stands for acyl-CoA:cholesterol ____.', ['acyltransferase', 'acyl transferase'], {
    explanation: 'Slide 13: acyl-CoA:cholesterol acyltransferase (ACAT) handles excess intracellular free cholesterol.',
    skill: 'terminology',
  }),
  multi('q4-02', 'supply-mechanisms', 'How is PLASMA cholesterol regulated, according to slide 13? Select all that apply.', ['LDL receptor-mediated uptake', 'HDL-mediated reverse transport'], ['7α-Hydroxylase in the blood', 'Phosphorylation of AMPK'], {
    explanation: 'Slide 13: plasma cholesterol is regulated via LDL receptor-mediated uptake and HDL-mediated reverse transport.',
  }),
  multi('q4-03', 'supply-mechanisms', 'Which of these does slide 13 list among the ways the cellular cholesterol supply is kept steady? Select all that apply.', ['Regulation of HMGR activity and levels', 'ACAT handling excess free cholesterol', 'Utilisation of cholesterol', 'Regulation of cellular sterol content'], ['Excretion of cholesterol in urine', 'Storage of cholesterol in red cells'], {
    explanation: 'Slide 13 lists HMGR, ACAT, LDL receptor / HDL transport, utilisation and cellular sterol content.',
    difficulty: 'intermediate',
  }),
  mcq('q4-04', 'supply-mechanisms', 'Lehninger: what does ACAT do to cholesterol?', 'Esterifies it with a fatty acid for storage', ['Hydroxylates it at C-7', 'Phosphorylates it', 'Removes its side chain'], {
    explanation: 'Lehninger (pp. 820, 826): ACAT transfers a fatty acid from CoA to cholesterol, making cholesteryl esters for storage; high cholesterol activates it.',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q4-05', conceptId: 'supply-mechanisms',
    statement: 'Lehninger: a high cellular cholesterol level reduces transcription of the LDL-receptor gene, so less cholesterol is taken up from the blood.',
    answer: true,
    explanation: 'Lehninger (p. 826) — one way plasma cholesterol uptake is matched to the cell’s needs.',
    difficulty: 'intermediate',
  }),
  mcq('q4-06', 'hmgr-controls', 'According to slide 14, what is the PRIMARY cholesterol-regulating mechanism?', 'HMGR (HMG-CoA reductase)', ['ACAT', '7α-Hydroxylase', 'The LDL receptor'], {
    explanation: 'Slide 14: “HMGR is the primary chol. reg mechanism.”',
  }),
  mcq('q4-07', 'hmgr-controls', 'Which is NOT one of the four ways HMGR is controlled?', 'Allosteric activation by citrate', ['Feedback inhibition', 'Control of gene expression', 'Phosphorylation–dephosphorylation'], {
    explanation: 'Slide 14: feedback inhibition, gene expression, degradation rate and phosphorylation–dephosphorylation. Citrate activation is a feature of acetyl-CoA carboxylase.',
    skill: 'misconception',
  }),
  match('q4-08', 'hmgr-controls', 'Match each HMGR control to what it does.', [
    ['Feedback inhibition', 'Cholesterol inhibits existing HMGR'],
    ['Gene expression', 'Sets how much new HMGR is made'],
    ['Degradation', 'Sets how fast HMGR is destroyed'],
    ['Phosphorylation', 'Switches HMGR off'],
  ], { explanation: 'Slide 14 lists the four controls; slides 14–16 describe each.' }),
  mcq('q4-09', 'feedback-degradation', 'How does cholesterol cause HMGR to be degraded (slide 14)?', 'It induces polyubiquitination of HMGR, which is then degraded in the proteasome', ['It phosphorylates HMGR through AMPK', 'It converts HMGR into mevalonate', 'It exports HMGR to lysosomes'], {
    explanation: 'Slide 14: cholesterol-induced polyubiquitination of HMGR and its degradation in the proteasome.',
  }),
  fill('q4-10', 'feedback-degradation', 'Polyubiquitinated HMGR is degraded in the ____.', ['proteasome', 'proteosome'], {
    explanation: 'Slide 14: degradation in the proteasome.',
  }),
  tf({
    id: 'q4-11', conceptId: 'feedback-degradation',
    statement: 'Cholesterol acts as a feedback inhibitor of HMGR that is already present in the cell.',
    answer: true,
    explanation: 'Slide 14: cholesterol is a feedback inhibitor of pre-existing HMGR.',
  }),
  multi('q4-12', 'feedback-degradation', 'A rise in intracellular cholesterol does which of the following to HMGR? Select all that apply.', ['Inhibits its activity', 'Inhibits its synthesis', 'Speeds up its degradation'], ['Activates it by dephosphorylation', 'Moves it into the mitochondria'], {
    explanation: 'Slides 14 and 16: cholesterol inhibits HMGR activity and synthesis, and induces its rapid degradation.',
    difficulty: 'intermediate',
  }),
  mcq('q4-13', 'flux-ssd-statins', 'When flux through the mevalonate pathway is HIGH, what happens to HMGR degradation?', 'It increases', ['It decreases', 'It stops', 'It is unaffected'], {
    explanation: 'Slide 15: when the flux is high, the rate of HMGR degradation is also high.',
  }),
  fill('q4-14', 'flux-ssd-statins', 'HMGR contains a ____-sensing domain (SSD).', ['sterol'], {
    explanation: 'Slide 15: HMGR contains a sterol-sensing domain, SSD.',
    skill: 'terminology',
  }),
  mcq('q4-15', 'flux-ssd-statins', 'What happens to HMGR when sterol levels in the cell rise (slide 15)?', 'Its rate of degradation increases', ['Its rate of degradation decreases', 'It is dephosphorylated and activated', 'It moves from the ER into the nucleus'], {
    explanation: 'Slide 15: when sterol levels increase there is a corresponding increase in the rate of HMGR degradation.',
  }),
  mcq('q4-16', 'flux-ssd-statins', 'Lehninger: how do statins inhibit HMG-CoA reductase?', 'They resemble mevalonate and inhibit the enzyme competitively', ['They phosphorylate it through AMPK', 'They trigger its polyubiquitination', 'They block NADPH production by malic enzyme'], {
    explanation: 'Lehninger (p. 827): statins such as lovastatin resemble mevalonate and are competitive inhibitors of HMG-CoA reductase.',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q4-17', conceptId: 'flux-ssd-statins',
    statement: 'With a statin present, flux through the mevalonate pathway falls and HMGR is degraded more slowly.',
    answer: true,
    explanation: 'Slide 15: low flux → less HMGR degradation, “easily observed in the presence of the statin drug”.',
    skill: 'cause-effect',
    difficulty: 'intermediate',
  }),
  multi('q4-18', 'flux-ssd-statins', 'Cells are loaded with sterols. Which effects on HMGR would you predict from slides 14–16? Select all that apply.', ['Faster degradation (via the sterol-sensing domain)', 'Feedback inhibition of existing enzyme'], ['More HMGR made from its gene', 'Activation by dephosphorylation'], {
    explanation: 'Rising sterols speed HMGR degradation (slide 15) and cholesterol inhibits both HMGR activity and its synthesis (slides 14, 16).',
    skill: 'prediction',
    difficulty: 'advanced',
  }),
  mcq('q4-19', 'hmgr-phosphorylation', 'Which enzyme phosphorylates HMGR?', 'AMP-activated protein kinase (AMPK)', ['Protein kinase A (PKA)', 'AMPK kinase (AMPKK)', 'HMG-CoA reductase phosphatase'], {
    explanation: 'Slides 14, 16, 17: AMPK phosphorylates HMGR. PKA phosphorylates PPI-1; AMPKK phosphorylates AMPK.',
    difficulty: 'intermediate',
  }),
  fill('q4-20', 'hmgr-phosphorylation', 'AMPK used to be called HMGR ____.', ['kinase'], {
    explanation: 'Slide 16: AMPK “used to be termed HMGR kinase”.',
  }),
  mcq('q4-21', 'hmgr-phosphorylation', 'What activates AMPK?', 'Phosphorylation by AMPK kinase (AMPKK)', ['Dephosphorylation by protein phosphatase 2C', 'Binding of cholesterol', 'Degradation in the proteasome'], {
    explanation: 'Slide 16: phosphorylation of AMPK is catalysed by AMPKK; slide 17 shows the phosphorylated AMPK as the active form.',
  }),
  tf({
    id: 'q4-22', conceptId: 'hmgr-phosphorylation',
    statement: 'Phosphorylated HMGR is the more active form of the enzyme.',
    answer: false,
    explanation: 'HMGR is most active dephosphorylated; phosphorylation decreases its activity (slides 14, 16).',
    skill: 'misconception',
  }),
  mcq('q4-23', 'hmgr-phosphorylation', 'Which enzyme removes the phosphate from HMGR, reactivating it?', 'HMG-CoA reductase phosphatase', ['Protein phosphatase 2C', 'AMPK kinase', 'Protein kinase A'], {
    explanation: 'Slide 17: HMG-CoA reductase phosphatase converts the phosphorylated (inactive) HMGR back to the active form.',
  }),
  mcq('q4-24', 'hmgr-phosphorylation', 'Protein phosphatase 2C dephosphorylates AMPK. What is the net effect on HMGR?', 'Less HMGR is phosphorylated, so more is active', ['More HMGR is phosphorylated, so less is active', 'HMGR is degraded faster', 'There is no effect on HMGR'], {
    explanation: 'Dephosphorylated AMPK is inactive (slide 17), so it stops phosphorylating HMGR — HMGR stays active.',
    skill: 'pathway-reasoning',
    difficulty: 'advanced',
  }),
  mcq('q4-25', 'hormonal-control', 'Which hormones negatively affect cholesterol biosynthesis (slide 16)?', 'Glucagon and epinephrine', ['Insulin and glucagon', 'Insulin only', 'Cortisol and aldosterone'], {
    explanation: 'Slide 16: glucagon and epinephrine negatively affect cholesterol biosynthesis; insulin activates HMGR.',
  }),
  mcq('q4-26', 'hormonal-control', 'On the slide-17 diagram, what activates PKA?', 'cAMP', ['Cholesterol', 'Insulin', 'AMP-activated protein kinase'], {
    explanation: 'Slide 17: cAMP (+ve) → PKA.',
  }),
  fill('q4-27', 'hormonal-control', 'PPI-1 stands for phosphoprotein phosphatase ____-1.', ['inhibitor'], {
    explanation: 'Slide 16: phosphoprotein phosphatase inhibitor-1 (PPI-1) — an inhibitor of phosphatases.',
    skill: 'terminology',
  }),
  tf({
    id: 'q4-28', conceptId: 'hormonal-control',
    statement: 'Insulin stimulates removal of phosphates from HMGR, activating it.',
    answer: true,
    explanation: 'Slide 16: insulin stimulates the removal of phosphates and thereby activates HMGR.',
  }),
  order('q4-29', 'hormonal-control', 'Order the steps by which the cAMP signal switches HMGR off (slide 17).', [
    'cAMP activates PKA',
    'PKA phosphorylates PPI-1 into its active form',
    'Active PPI-1 inhibits HMG-CoA reductase phosphatase',
    'HMGR stays phosphorylated — inactive',
  ], { explanation: 'Slide 17: cAMP → PKA → PPI-1(a) ⊣ HMG-CoA reductase phosphatase, so HMGR is not reactivated.' }),
  multi('q4-30', 'hormonal-control', 'Which enzymes does active PPI-1(a) inhibit (slide 17)? Select all that apply.', ['HMG-CoA reductase phosphatase', 'Protein phosphatase 2C', 'Phosphoprotein phosphatase'], ['AMPK kinase', 'Protein kinase A'], {
    explanation: 'Slide 17: PPI-1(a) has –ve arrows to all three phosphatases.',
    difficulty: 'advanced',
  }),
];

// ─── Lesson 5 — Bile acids ──────────────────────────────────────────
const lesson5: Q[] = [
  fill('q5-01', 'bile-acid-synthesis', '7α-Hydroxylase converts cholesterol into ____.', ['7-hydroxycholesterol', '7α-hydroxycholesterol', '7-alpha-hydroxycholesterol'], {
    explanation: 'Slide 18: cholesterol → 7-hydroxycholesterol.',
  }),
  tf({
    id: 'q5-02', conceptId: 'bile-acid-synthesis',
    statement: 'Bile salts are made from cholesterol in the liver.',
    answer: true,
    explanation: 'Slide 12: cholesterol → bile salts, labelled “liver”.',
  }),
  mcq('q5-03', 'bile-acid-synthesis', 'Which coenzyme is oxidised in the 7α-hydroxylase reaction?', 'NADPH (→ NADP⁺)', ['NADH (→ NAD⁺)', 'FADH₂ (→ FAD)', 'CoA-SH'], {
    explanation: 'Slide 18: NADPH + H⁺ and O₂ are used; NADP⁺ is formed.',
  }),
  mcq('q5-04', 'bile-acid-synthesis', 'Which two bile acid–CoA products are formed from 7-hydroxycholesterol (slide 18)?', 'Cholyl-CoA and chenodeoxycholyl-CoA', ['Glycocholic acid and taurocholic acid', 'Acetyl-CoA and propionyl-CoA', 'Lanosterol and squalene'], {
    explanation: 'Slide 18: 7-hydroxycholesterol → cholyl-CoA or chenodeoxycholyl-CoA.',
  }),
  mcq('q5-05', 'bile-acid-synthesis', 'How many hydroxyl groups does cholyl-CoA carry (slide 18)?', 'Three', ['One', 'Two', 'Four'], {
    explanation: 'Slide 18: cholyl-CoA has three –OH groups; chenodeoxycholyl-CoA has two.',
    difficulty: 'intermediate',
  }),
  mcq('q5-06', 'bile-acid-synthesis', 'How does chenodeoxycholyl-CoA differ from cholyl-CoA on slide 18?', 'It has one fewer –OH group (two instead of three)', ['It has one more –OH group', 'It keeps the full cholesterol side chain', 'It carries glycine instead of CoA'], {
    explanation: 'Slide 18: chenodeoxycholyl-CoA carries two –OH groups; cholyl-CoA carries three.',
    skill: 'comparison',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q5-07', conceptId: 'bile-acid-synthesis',
    statement: 'Converting 7-hydroxycholesterol to cholyl-CoA uses coenzyme A (CoA-SH).',
    answer: true,
    explanation: 'Slide 18: NADPH + H⁺, O₂ and 2 CoA-SH are used; propionyl-CoA is released.',
  }),
  mcq('q5-08', 'bile-acid-synthesis', 'What happens to the cholesterol side chain on the way to cholyl-CoA?', 'It is shortened (propionyl-CoA is released) and ends as a CoA thioester', ['It is lengthened by two carbons', 'It is removed completely', 'It is phosphorylated'], {
    explanation: 'Slide 18: propionyl-CoA leaves and the shortened side chain ends –CO–S-CoA.',
    difficulty: 'intermediate',
  }),
  order('q5-09', 'bile-acid-synthesis', 'Order the molecules of bile acid synthesis (slide 18).', [
    'Cholesterol',
    '7-Hydroxycholesterol',
    'Cholyl-CoA',
  ], { explanation: '7α-Hydroxylase makes 7-hydroxycholesterol; several more steps give cholyl-CoA.' }),
  mcq('q5-10', 'bile-acid-synthesis', 'If 7α-hydroxylase were blocked, what would you expect?', 'Less bile acid made from cholesterol', ['More bile acid made from cholesterol', 'More 7-hydroxycholesterol', 'Faster conjugation with taurine'], {
    explanation: '7α-Hydroxylase catalyses the first step (slide 18), so blocking it cuts bile acid synthesis.',
    skill: 'prediction',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q5-11', conceptId: 'bile-acid-synthesis',
    statement: '7α-Hydroxylase uses molecular oxygen (O₂).',
    answer: true,
    explanation: 'Slide 18: NADPH + H⁺ and O₂.',
  }),
  mcq('q5-12', 'bile-acid-conjugation', 'Glycocholic acid is a bile acid conjugated with which molecule?', 'Glycine', ['Taurine', 'Glucose', 'Glycerol'], {
    explanation: 'Slide 19: glycocholic acid ends –CO–NH–CH₂–COOH — glycine attached.',
  }),
  mcq('q5-13', 'bile-acid-conjugation', 'Which group ends the side chain of taurocholic acid (slide 19)?', '–SO₃H', ['–COOH', '–OH', '–CO–S-CoA'], {
    explanation: 'Slide 19: taurocholic acid ends –CO–NH–(CH₂)₂–SO₃H (taurine).',
  }),
  fill('q5-14', 'bile-acid-conjugation', 'Taurocholic acid is cholic acid conjugated with ____.', ['taurine'], {
    explanation: 'Tauro- = taurine: the –NH–(CH₂)₂–SO₃H group on slide 19.',
    skill: 'terminology',
  }),
  match('q5-15', 'bile-acid-conjugation', 'Match each conjugated bile acid to the end of its side chain (slide 19).', [
    ['Glycocholic acid', '–CO–NH–CH₂–COOH'],
    ['Taurocholic acid', '–CO–NH–(CH₂)₂–SO₃H'],
  ], { explanation: 'Glycine ends in –COOH; taurine ends in –SO₃H.' }),
  tf({
    id: 'q5-16', conceptId: 'bile-acid-conjugation',
    statement: 'In both glycocholic and taurocholic acid, the attached molecule is joined through a –CO–NH– link.',
    answer: true,
    explanation: 'Slide 19: both structures show –C(=O)–NH– joining the side chain to glycine or taurine.',
    difficulty: 'intermediate',
  }),
  mcq('q5-17', 'bile-acid-conjugation', 'Which feature shows that a conjugated bile acid carries glycine rather than taurine?', 'Its side chain ends in –COOH, not –SO₃H', ['It has four –OH groups', 'It contains a phosphate', 'It lacks the steroid nucleus'], {
    explanation: 'Slide 19: glycocholic acid ends –CH₂–COOH; taurocholic acid ends –(CH₂)₂–SO₃H.',
    skill: 'comparison',
  }),
  tf({
    id: 'q5-18', conceptId: 'bile-acid-functions',
    statement: 'Bile acid synthesis followed by excretion in the faeces is the only significant way the body eliminates excess cholesterol.',
    answer: true,
    explanation: 'Slide 20, function 1.',
  }),
  mcq('q5-19', 'bile-acid-functions', 'How do bile acids help digest dietary triacylglycerols?', 'They emulsify fats, making them accessible to pancreatic lipases', ['They hydrolyse triacylglycerols themselves', 'They phosphorylate fatty acids', 'They carry fats in the blood as lipoproteins'], {
    explanation: 'Slide 20: bile acids act as emulsifying agents that render fats accessible to pancreatic lipases.',
  }),
  mcq('q5-20', 'bile-acid-functions', 'What prevents cholesterol from precipitating in the gall bladder?', 'Bile acids and phospholipids keeping it dissolved in bile', ['ACAT esterifying it in the gall bladder', 'HMGR breaking it down', 'Pancreatic lipase digesting it'], {
    explanation: 'Slide 20: bile acids and phospholipids solubilise cholesterol in the bile.',
  }),
  fill('q5-21', 'bile-acid-functions', 'Bile acids help the intestine absorb ____-soluble vitamins.', ['fat', 'lipid'], {
    explanation: 'Slide 20, function 4: they facilitate the intestinal absorption of fat-soluble vitamins.',
  }),
  multi('q5-22', 'bile-acid-functions', 'Which molecules keep cholesterol dissolved in bile? Select all that apply.', ['Bile acids', 'Phospholipids'], ['Pancreatic lipase', 'Propionyl-CoA'], {
    explanation: 'Slide 20: bile acids and phospholipids solubilise cholesterol in the bile.',
  }),
  mcq('q5-23', 'bile-acid-functions', 'If too little bile acid reached the gut, which absorption would suffer, according to the lecture’s list of functions?', 'Fat-soluble vitamins (and dietary fat)', ['Water-soluble vitamins', 'Glucose', 'Amino acids'], {
    explanation: 'Slide 20: bile acids emulsify dietary fat and help absorb fat-soluble vitamins.',
    skill: 'application',
    clinical: true,
    difficulty: 'intermediate',
  }),
  mcq('q5-24', 'bile-acid-functions', 'Bile with too little bile acid for its cholesterol is a risk. Which problem does the lecture’s function 2 point to?', 'Cholesterol precipitating in the gall bladder', ['Cholesterol being oxidised to CO₂', 'Too much fat-soluble vitamin absorption', 'Faster HMGR degradation'], {
    explanation: 'Slide 20: bile acids and phospholipids keep cholesterol in solution, preventing precipitation in the gall bladder.',
    skill: 'application',
    clinical: true,
    difficulty: 'intermediate',
  }),
  match('q5-25', 'bile-acid-functions', 'Match each function of bile acids to its benefit (slide 20).', [
    ['Synthesis + faecal excretion', 'Eliminates excess cholesterol'],
    ['Solubilising cholesterol with phospholipids', 'Prevents precipitation in the gall bladder'],
    ['Emulsifying triacylglycerols', 'Gives pancreatic lipases access to fat'],
    ['Aiding intestinal absorption', 'Fat-soluble vitamins taken up'],
  ], { explanation: 'Slide 20 lists these four functions.' }),
  tf({
    id: 'q5-26', conceptId: 'bile-acid-functions',
    statement: 'Lehninger: a resin that binds bile acids in the intestine makes statin treatment more effective.',
    answer: true,
    explanation: 'Lehninger (p. 827). Bile acids that are not reabsorbed leave in the faeces, taking cholesterol out of the body — function 1 on slide 20.',
    difficulty: 'advanced',
  }),
];

export const questions: Q[] = [...lesson1, ...lesson2, ...lesson3, ...lesson4, ...lesson5];
