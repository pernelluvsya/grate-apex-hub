// Biochemistry → Fatty Acid Biosynthesis: additional quiz questions,
// written to give every lesson a bank of ~25 and to cover the concepts
// that had none (hydratase vs dehydratase, enzyme names in this topic,
// oxaloacetate → malate, the energy cost of malonyl-CoA).
//
// Same rules as questions.ts: lecture slides and diagrams, plus the
// Lehninger clarifications the lessons label; discrepancies only in
// their resolved form; annotations (deck B additions) never tested.
import { fill, match, mcq, tf, type QuestionDraft } from '@/data/topics/build';
import type { ConceptId } from '@/data/topics/fatty-acid-biosynthesis/sources';

type Q = QuestionDraft<ConceptId>;

export const moreQuestions: Q[] = [
  // ─── Lesson 1 ──────────────────────────────────────────────────────
  mcq('q1-14', 'hydratase-vs-dehydratase', 'Which enzyme type REMOVES water from its substrate?', 'Dehydratase', ['Hydratase', 'Hydrolase', 'Kinase'], {
    explanation: 'A dehydratase removes water, creating a C=C double bond. “De-” means removal.',
    skill: 'terminology',
  }),
  mcq('q1-15', 'hydratase-vs-dehydratase', 'In β-oxidation, enoyl-CoA hydratase acts on a C=C double bond. What does it do?', 'Adds water across the double bond', ['Removes water to form the double bond', 'Reduces the double bond with NADPH', 'Oxidises the double bond with FAD'], {
    explanation: 'Slide 10 shows enoyl-CoA hydratase ADDING H₂O (confirmed by Lehninger p. 638).',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q1-16',
    conceptId: 'hydratase-vs-dehydratase',
    statement: 'Hydratases and dehydratases both belong to the lyases.',
    answer: true,
    explanation: 'Lyases catalyse cleavages or, in reverse, additions across double bonds — adding water (hydratase) or removing it (dehydratase).',
  }),
  match('q1-17', 'hydratase-vs-dehydratase', 'Three “water” enzymes are easy to confuse. Match each to its job.', [
    ['Hydratase', 'Adds water across a C=C double bond'],
    ['Dehydratase', 'Removes water, forming a C=C double bond'],
    ['Hydrolase', 'Breaks a bond by hydrolysis'],
  ], { explanation: 'Hydratase adds water, dehydratase removes it, hydrolase uses water to break a bond.', difficulty: 'advanced', skill: 'comparison' }),
  match('q1-18', 'enzyme-names-in-topic', 'Match each reaction word to its job in this topic.', [
    ['Carboxylase', 'Adds a carboxyl group (CO₂)'],
    ['Transacylase', 'Moves an acyl group from one carrier to another'],
    ['Reductase', 'Reduces its substrate (here using NADPH)'],
    ['Thioesterase', 'Breaks a thioester bond to release the chain'],
  ], { explanation: 'Learn the reaction word and you can predict the enzyme’s job.' }),
  mcq('q1-19', 'enzyme-names-in-topic', 'Which enzyme type splits a molecule without hydrolysis or oxidation — as when citrate is split in the cytosol?', 'A lyase', ['A hydrolase', 'A dehydrogenase', 'A synthase'], {
    explanation: 'ATP-citrate lyase splits citrate; lyases cleave without hydrolysis or oxidation.',
    difficulty: 'intermediate',
  }),
  mcq('q1-20', 'enzyme-names-in-topic', 'Malate dehydrogenase and acyl-CoA dehydrogenase share the word “dehydrogenase”. What does a dehydrogenase do?', 'Moves hydrogen (electrons) between a substrate and a carrier such as NAD⁺ or FAD', ['Removes water from its substrate', 'Adds a phosphate group', 'Joins two subunits'], {
    explanation: 'Dehydrogenases transfer hydrogen/electrons between a substrate and a carrier.',
  }),
  fill('q1-21', 'enzyme-names-in-topic', 'An enzyme that moves an acyl group from coenzyme A onto a carrier on the synthase is a ____.', ['transacylase', 'trans-acylase'], {
    explanation: 'Acetyl-CoA:ACP transacylase and malonyl-CoA:ACP transacylase load the synthase.',
    skill: 'terminology',
  }),
  mcq('q1-22', 'enzyme-names-in-topic', 'From its name alone, what should β-ketoacyl-ACP reductase do?', 'Reduce a β-keto group on an ACP-bound acyl chain', ['Oxidise an alcohol to a ketone', 'Remove water from the chain', 'Join two acyl groups'], {
    explanation: '“β-Ketoacyl-ACP” is the substrate; “reductase” is the job — it reduces the keto group.',
    skill: 'application',
  }),
  tf({
    id: 'q1-23',
    conceptId: 'beta-oxidation-product',
    statement: 'β-Oxidation removes carbons from a fatty acid two at a time, as acetyl-CoA.',
    answer: true,
    explanation: 'Each turn of β-oxidation releases one acetyl-CoA.',
  }),
  mcq('q1-24', 'beta-oxidation-product', 'Which statement links β-oxidation and fatty acid synthesis correctly?', 'Acetyl-CoA is the product of one and the starting material of the other', ['Malonyl-CoA is the product of β-oxidation', 'Palmitate is the product of β-oxidation', 'Both pathways end with acetyl-CoA'], {
    explanation: 'β-Oxidation produces acetyl-CoA; synthesis starts by activating acetyl-CoA.',
    skill: 'pathway-reasoning',
  }),
  mcq('q1-25', 'enzyme-nomenclature', 'An enzyme moves a phosphate group from ATP onto another molecule. Which name fits it?', 'A kinase', ['A hydratase', 'A synthase', 'A hydrolase'], {
    explanation: 'Kinases are transferases that transfer a phosphate group.',
    skill: 'application',
  }),

  // ─── Lesson 2 ──────────────────────────────────────────────────────
  tf({
    id: 'q2-21',
    conceptId: 'synthesis-location-state',
    statement: 'Fatty acid biosynthesis is a catabolic pathway that releases energy.',
    answer: false,
    explanation: 'It is anabolic: it builds a larger molecule and costs energy and reducing power.',
    skill: 'misconception',
  }),
  mcq('q2-22', 'citrate-shunt', 'What does the citrate shunt carry out to the cytosol for fatty acid synthesis?', 'Acetyl groups, carried as citrate', ['NADPH, carried directly', 'Malonyl-CoA', 'Palmitate'], {
    explanation: 'Citrate carries acetyl groups out of the mitochondria; Lesson 8 follows the whole cycle.',
    skill: 'pathway-reasoning',
  }),
  tf({
    id: 'q2-23',
    conceptId: 'citrate-shunt',
    statement: 'Under fed conditions, excess citrate is removed from the mitochondria via the citrate shunt.',
    answer: true,
    explanation: 'Slide 4: as TCA flux increases, excess citrate is removed via the citrate shunt.',
  }),
  mcq('q2-24', 'not-simple-reversal', 'Which feature does fatty acid synthesis SHARE with β-oxidation?', 'Both change the chain length two carbons at a time', ['Both use FAD as an electron acceptor', 'Both carry intermediates on ACP', 'Both run in the mitochondria'], {
    explanation: 'Synthesis adds 2 carbons per cycle; β-oxidation removes 2. Carriers, cofactors and location differ.',
    skill: 'comparison',
    difficulty: 'intermediate',
  }),
  mcq('q2-25', 'synthesis-stages', 'In one turn of the cycle, what happens at the “elongation” stage?', 'Two carbons are added to the chain', ['Water is removed', 'The finished chain is released', 'A keto group is reduced'], {
    explanation: 'Elongation is the condensation step that adds two carbons from malonyl.',
  }),

  // ─── Lesson 3 ──────────────────────────────────────────────────────
  mcq('q3-20', 'acc-energy', 'Which cofactor of acetyl-CoA carboxylase carries the CO₂ (Lehninger)?', 'Biotin', ['Thiamine pyrophosphate', 'Lipoic acid', 'Coenzyme A'], {
    explanation: 'Lehninger: CO₂ is attached to biotin (using ATP), then transferred to acetyl-CoA.',
    difficulty: 'intermediate',
  }),
  mcq('q3-21', 'acc-energy', 'Where does fatty acid synthesis spend its ATP?', 'Making malonyl-CoA, at acetyl-CoA carboxylase', ['In each reduction step', 'When the thioesterase releases palmitate', 'When ACP₂ is loaded'], {
    explanation: 'Lehninger: one ATP per malonyl-CoA; the reductions use NADPH, not ATP.',
    skill: 'pathway-reasoning',
  }),
  mcq('q3-22', 'acc-energy', 'How many ATP are spent making the malonyl-CoA needed for one palmitate?', '7', ['8', '14', '1'], {
    explanation: 'Palmitate needs 7 malonyl-CoA, each costing one ATP at acetyl-CoA carboxylase.',
    difficulty: 'advanced',
    skill: 'application',
  }),
  tf({
    id: 'q3-23',
    conceptId: 'malonyl-coa',
    statement: 'Malonyl-CoA is the activated donor of two-carbon units for chain building.',
    answer: true,
    explanation: 'Each condensation adds two carbons from malonyl (its third carbon leaves as CO₂).',
  }),
  mcq('q3-24', 'malonyl-coa', 'Compared with acetyl-CoA, malonyl-CoA has…', 'An extra carboxyl group', ['One fewer carbon', 'An extra phosphate group', 'A carbon–carbon double bond'], {
    explanation: 'Acetyl-CoA carboxylase adds a carboxyl group: ⁻OOC–CH₂–CO–S-CoA.',
  }),
  mcq('q3-25', 'acetyl-coa-carboxylase', 'A drug blocks acetyl-CoA carboxylase. Which molecule would you expect to build up in the cytosol?', 'Acetyl-CoA', ['Malonyl-CoA', 'Palmitate', 'Butyryl-ACP'], {
    explanation: 'The enzyme’s substrate (acetyl-CoA) accumulates when it cannot be carboxylated to malonyl-CoA.',
    skill: 'prediction',
    difficulty: 'intermediate',
  }),

  // ─── Lesson 4 ──────────────────────────────────────────────────────
  tf({
    id: 'q4-22',
    conceptId: 'fas-carriers',
    statement: 'The phosphopantetheine arm of ACP swings the growing chain from one active site to the next.',
    answer: true,
    explanation: 'Lehninger: the long, flexible phosphopantetheine arm carries the chain between active sites.',
  }),
  mcq('q4-23', 'carrier-loading', 'Both loading enzymes are transacylases. Which carrier do they move the acetyl and malonyl groups OFF?', 'Coenzyme A', ['ACP₂', 'Biotin', 'The thioesterase'], {
    explanation: 'Slide 7: each group is transferred from coenzyme A to the synthase.',
  }),
  match('q4-24', 'carrier-loading', 'Match each loading enzyme to what it does.', [
    ['Acetyl-CoA:ACP transacylase', 'Acetyl → cysteinyl-S of ACP₁'],
    ['Malonyl-CoA:ACP transacylase', 'Malonyl → pantetheinyl-S of ACP₂'],
  ], { explanation: 'Slide 7: acetyl goes to ACP₁, malonyl to ACP₂.' }),
  mcq('q4-25', 'condensation', 'In the second round, butyryl (4 C) condenses with malonyl and CO₂ leaves. How long is the new β-ketoacyl chain?', '6 carbons', ['7 carbons', '5 carbons', '8 carbons'], {
    explanation: 'Each condensation adds two carbons: 4 + 3 − 1 = 6.',
    skill: 'application',
    difficulty: 'intermediate',
  }),

  // ─── Lesson 6 ──────────────────────────────────────────────────────
  mcq('q6-23', 'electron-carriers', 'Which coenzyme supplies the electrons for BOTH reductions in fatty acid synthesis?', 'NADPH', ['NADH', 'FADH₂', 'Coenzyme A'], {
    explanation: 'β-Ketoacyl-ACP reductase and enoyl-ACP reductase both use NADPH.',
  }),
  tf({
    id: 'q6-24',
    conceptId: 'electron-carriers',
    statement: 'β-Oxidation produces FADH₂ and NADH, while fatty acid synthesis consumes NADPH.',
    answer: true,
    explanation: 'Slide 10 (FAD, NAD⁺ reduced in β-oxidation) and slides 5/9 (NADPH used in synthesis).',
  }),
  mcq('q6-25', 'electron-carriers', 'Why does synthesis use NADPH rather than FADH₂ for its reductions?', 'NADPH is a more powerful reducing agent for pushing electrons into the chain', ['FADH₂ cannot cross into the cytosol', 'NADPH is cheaper to make than FADH₂', 'FADH₂ is used up by the thioesterase'], {
    explanation: 'Slide 5: NADPH is substituted as a more powerful reducing agent than FADH₂.',
    skill: 'cause-effect',
    difficulty: 'intermediate',
  }),

  // ─── Lesson 7 ──────────────────────────────────────────────────────
  tf({
    id: 'q7-20',
    conceptId: 'other-fatty-acids',
    statement: 'The fatty acid synthase complex releases chains of many different lengths.',
    answer: false,
    explanation: 'It releases its chain at 16 carbons — palmitate. Other lengths come from β-oxidation or elongation.',
    skill: 'misconception',
  }),
  mcq('q7-21', 'other-fatty-acids', 'A cell needs a 14-carbon fatty acid. Which route does the lecture give for chains shorter than palmitate?', 'Shortening palmitate by β-oxidation', ['ER elongation of palmitate', 'Mitochondrial elongation', 'Stopping the synthase at C14'], {
    explanation: 'Slide 13: palmitate can be shortened by β-oxidation.',
    skill: 'application',
  }),
  mcq('q7-22', 'unsaturated-elongation', 'Which kind of double bond produces the kink that lets longer unsaturated chains be elongated?', 'A cis double bond', ['A trans double bond', 'A C=O double bond', 'No double bond — chain length alone'], {
    explanation: 'Slide 13: the kinking of the cis double bond makes them effectively shorter.',
  }),
  tf({
    id: 'q7-23',
    conceptId: 'unsaturated-elongation',
    statement: 'Because unsaturated chains can still be elongated, most longer fatty acids are polyunsaturated.',
    answer: true,
    explanation: 'Slide 13: unsaturated fatty acids of 20, 22 and 24 carbons are made; most longer ones are polyunsaturated.',
  }),
  mcq('q7-24', 'mitochondrial-elongation', 'Where is the second fatty acid elongation system?', 'In the mitosol (mitochondrial matrix)', ['In the nucleus', 'In the Golgi apparatus', 'In lysosomes'], {
    explanation: 'Slide 14: a second elongation system exists in the mitosol.',
  }),
  match('q7-25', 'er-elongation', 'Match each system to its features.', [
    ['Fatty acid synthase', 'One complex in the cytosol; makes palmitate'],
    ['ER elongation', 'Individual enzymes; mainly stearoyl-CoA'],
    ['Mitochondrial elongation', 'β-Oxidation activities + NADPH enoyl-CoA reductase'],
  ], { explanation: 'Slides 11–14 compare the three systems.', difficulty: 'intermediate', skill: 'comparison' }),

  // ─── Lesson 8 ──────────────────────────────────────────────────────
  mcq('q8-25', 'oaa-to-malate', 'Which enzyme converts cytosolic oxaloacetate to malate?', 'Malate dehydrogenase', ['Malic enzyme', 'ATP-citrate lyase', 'Pyruvate carboxylase'], {
    explanation: 'The diagram labels malate DH for oxaloacetate → malate.',
  }),
  mcq('q8-26', 'oaa-to-malate', 'Which coenzyme change accompanies oxaloacetate → malate in the cytosol?', 'NADH is oxidised to NAD⁺', ['NADPH is oxidised to NADP⁺', 'FAD is reduced to FADH₂', 'NAD⁺ is reduced to NADH'], {
    explanation: 'Malate DH reduces oxaloacetate using NADH (→ NAD⁺) — the diagram, confirmed by Lehninger.',
    difficulty: 'advanced',
    skill: 'misconception',
  }),
  tf({
    id: 'q8-27',
    conceptId: 'oaa-to-malate',
    statement: 'Converting oxaloacetate to malate in the cytosol uses up NADH.',
    answer: true,
    explanation: 'It is a reduction: NADH + H⁺ → NAD⁺. Malic enzyme then makes NADPH from malate.',
  }),
  mcq('q8-28', 'transport-problem', 'Which membrane is impermeable to acetyl-CoA, creating the transport problem?', 'The inner mitochondrial membrane', ['The outer mitochondrial membrane', 'The plasma membrane', 'The ER membrane'], {
    explanation: 'Slide 15: acetyl-CoA can’t cross the inner membrane.',
  }),
];
