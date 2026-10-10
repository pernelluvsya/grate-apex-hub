// Biochemistry → Fatty Acid Biosynthesis: layer 1 (learn by answering)
// and reading-layer extras for the eight lessons.
//
// Every checkpoint asks BEFORE it explains. Facts come from the lecture
// slides (both decks) and the lecture diagrams; where the slides
// disagree, only the version settled in lessons.ts (Lehninger-labelled)
// is used. Checkpoint IDs: cN-xx; recall prompts: rN-xx.
import type { LessonConfusion } from '@/data/lesson-types';
import { ask, fill, learn, match, mcq, multi, order, recall, tf, type InteractiveDraft } from '@/data/topics/build';
import { leh, ref, type ConceptId } from '@/data/topics/fatty-acid-biosynthesis/sources';

type Steps = InteractiveDraft<ConceptId>[];

export const interactive: Record<string, Steps> = {
  // ─── Lesson 1 — Recap and enzyme names ─────────────────────────────
  'fatty-acid-biosynthesis-1': [
    ask(
      mcq('c1-01', 'beta-oxidation-product', 'β-Oxidation breaks fatty acids down two carbons at a time. In what form does each two-carbon piece leave?', 'Acetyl-CoA', ['Malonyl-CoA', 'Pyruvate', 'Free acetate'], {
        explanation: 'The lecture recaps β-oxidation as the production of acetyl-CoA.',
        skill: 'recall',
      }),
      ['Fatty acid synthesis starts from that same molecule. Acetyl-CoA is the link: the product of one pathway and the raw material of the other.']
    ),
    learn('Two pathways, one link', [
      'β-Oxidation removes a fatty acid chain two carbons at a time, as acetyl-CoA. Fatty acid biosynthesis runs the other way: it builds a chain up from acetyl-CoA, two carbons at a time.',
      'They use similar chemistry — but, as you will see, synthesis is not simply β-oxidation run backwards.',
    ], { sourceRefs: [...ref([2]), ...leh(638)] }),
    learn('Enzyme names tell you the job', ['The lecture reminds you of four reaction words. Learn the word and you can predict an unfamiliar enzyme’s job.'], {
      terms: [
        { term: 'Kinase', meaning: 'A transferase that moves a phosphate group.' },
        { term: 'Synthase', meaning: 'Joins two or more subunits into a larger molecule.' },
        { term: 'Hydrolase', meaning: 'Catalyses hydrolysis.' },
        { term: 'Hydratase', meaning: 'A lyase. Adds water across a double bond (clarified — see the reading).' },
      ],
      sourceRefs: [...ref([2]), ...leh(613)],
    }),
    ask(
      match('c1-02', 'enzyme-nomenclature', 'Match each enzyme type to its job.', [
        ['Kinase', 'Transfers a phosphate group'],
        ['Synthase', 'Joins subunits into a larger molecule'],
        ['Hydrolase', 'Catalyses hydrolysis'],
        ['Hydratase', 'Adds water across a double bond'],
      ], { explanation: 'These four reaction words come from the lecture’s nomenclature slide (hydratase as settled in the reading).' })
    ),
    ask(
      mcq('c1-03', 'synthase-vs-synthetase', 'An enzyme cannot join two molecules unless it hydrolyses ATP. Which name fits it?', 'Synthetase', ['Synthase', 'Hydratase', 'Kinase'], {
        explanation: 'By definition, synthetases must cleave (hydrolyse) ATP to function; synthases do not.',
        skill: 'application',
      }),
      ['Both kinds form chemical bonds to build a new molecule — the ATP requirement is the whole difference. The complex in this topic is fatty acid SYNTHASE: its ATP is spent earlier, by acetyl-CoA carboxylase.']
    ),
    learn('Hydratase or dehydratase?', ['These do opposite jobs, and you will meet both in this topic.'], {
      terms: [
        { term: 'Hydratase', meaning: 'ADDS water across a C=C double bond (e.g. enoyl-CoA hydratase in β-oxidation).' },
        { term: 'Dehydratase', meaning: 'REMOVES water, creating a C=C double bond (e.g. β-hydroxyacyl-ACP dehydratase in synthesis).' },
      ],
      keyPoint: '“De-” means removal: a dehydratase removes water, a dehydrogenase removes hydrogen.',
      sourceRefs: [...ref([2, 10]), ...leh(613, 638, 791)],
    }),
    ask(
      tf({
        id: 'c1-04',
        conceptId: 'hydratase-vs-dehydratase',
        statement: 'A dehydratase removes water from its substrate, creating a C=C double bond.',
        answer: true,
        explanation: 'Removing water is a dehydratase’s job; a hydratase adds water across a double bond.',
      })
    ),
    ask(
      fill('c1-05', 'enzyme-names-in-topic', 'An enzyme that adds a carboxyl group (CO₂) to its substrate is called a ____.', ['carboxylase'], {
        explanation: 'Carboxylases add CO₂ — e.g. acetyl-CoA carboxylase makes malonyl-CoA.',
        skill: 'terminology',
      })
    ),
    recall('r1-01', 'synthase-vs-synthetase', 'In your own words: how is a synthase different from a synthetase?', [
      'Both help form chemical bonds to synthesise a new molecule.',
      'A synthetase must hydrolyse ATP to function; a synthase does not.',
      'So the fatty acid–building complex is fatty acid synthase.',
    ]),
    ask(
      mcq('c1-06', 'enzyme-names-in-topic', 'Which enzyme would you expect to break a thioester bond to release a finished fatty acid?', 'A thioesterase', ['A transacylase', 'A carboxylase', 'A dehydratase'], {
        explanation: 'A thioesterase hydrolyses a thioester bond — the synthase’s thioesterase releases palmitate.',
        skill: 'application',
      })
    ),
  ],

  // ─── Lesson 2 — The big picture ────────────────────────────────────
  'fatty-acid-biosynthesis-2': [
    ask(
      mcq('c2-01', 'synthesis-location-state', 'Before you read on: where in the cell do you expect fatty acids to be built?', 'In the cytosol', ['In the mitochondrial matrix', 'In the nucleus', 'In the lysosome'], {
        explanation: 'Slide 4: fatty acid biosynthesis is an anabolic pathway that occurs in the cytosol.',
        skill: 'prediction',
      }),
      ['It runs in the cytosol — separated from β-oxidation, which runs in the mitochondria.']
    ),
    ask(
      mcq('c2-02', 'synthesis-location-state', 'In which nutritional state is fatty acid synthesis switched on?', 'The fed state, after a meal', ['Overnight fasting', 'Prolonged starvation', 'Intense exercise'], {
        explanation: 'Slide 4: it occurs under fed conditions — extra fuel is stored as fat.',
      })
    ),
    learn('From a meal to fat', ['The lecture traces how a meal switches synthesis on:'], {
      steps: [
        { label: 'Glucose is taken up by the liver', detail: 'Fed conditions.' },
        { label: 'Flux through the TCA cycle increases', detail: 'More glucose → more acetyl-CoA → more citrate in the mitochondria.' },
        { label: 'Excess citrate is removed via the citrate shunt', detail: 'Citrate carries acetyl groups out to the cytosol (Lesson 8).' },
      ],
      sourceRefs: [...ref([4]), ...leh(794, 795)],
    }),
    ask(
      order('c2-03', 'citrate-shunt', 'Put the lecture’s fed-state sequence in order.', [
        'Glucose is taken up by the liver',
        'Flux through the TCA cycle increases',
        'Excess citrate is removed via the citrate shunt',
      ], { explanation: 'Glucose uptake raises TCA-cycle flux; the excess citrate leaves via the citrate shunt.' })
    ),
    learn('Not just β-oxidation in reverse', ['Running β-oxidation backwards would add two carbons at a time — but the lecture names two reactions that make synthesis work:'], {
      steps: [
        { label: 'Acetyl-CoA is “activated” by adding CO₂', detail: 'This makes malonyl-CoA (Lesson 3).' },
        { label: 'NADPH replaces FADH₂', detail: 'NADPH is the more powerful reducing agent, used for the reduction steps (Lesson 5).' },
      ],
      sourceRefs: [...ref([5], [2]), ...leh(787)],
    }),
    ask(
      multi('c2-04', 'not-simple-reversal', 'Which TWO changes does the lecture say enable the synthesis pathway?', [
        'Acetyl-CoA is activated by adding CO₂',
        'NADPH is used as a more powerful reducing agent than FADH₂',
      ], ['FAD replaces NAD⁺ in the reductions', 'The pathway moves into the mitochondria'], {
        explanation: 'Slide 5: CO₂ activation of acetyl-CoA, and NADPH in place of FADH₂.',
        skill: 'comparison',
      })
    ),
    learn('The repeating cycle', ['Synthesis runs as a cycle. The lecture lists its stages in this order, and each pass adds two carbons:'], {
      steps: [
        { label: 'Transfer', detail: 'Groups are loaded onto the synthase.' },
        { label: 'Elongation', detail: 'They are joined — two carbons added.' },
        { label: 'Reduction', detail: 'Keto → alcohol (NADPH).' },
        { label: 'Dehydration', detail: 'Water removed → double bond.' },
        { label: 'Reduction', detail: 'Double bond → saturated (NADPH).' },
      ],
      keyPoint: 'The cycle repeats until palmitoyl-ACP (16 carbons) is formed.',
      sourceRefs: [...ref([4]), ...leh(788)],
    }),
    ask(
      order('c2-05', 'synthesis-stages', 'Order the stages of one turn of the synthesis cycle.', ['Transfer', 'Elongation', 'Reduction', 'Dehydration', 'Reduction'], {
        explanation: 'Slide 4: transfer, elongation, reduction, dehydration and reduction — repeated until palmitoyl-ACP.',
      })
    ),
    recall('r2-01', 'not-simple-reversal', 'Is fatty acid synthesis simply β-oxidation run backwards? Explain.', [
      'Not quite — two reactions make synthesis possible.',
      'Acetyl-CoA is first activated with CO₂ (to malonyl-CoA).',
      'NADPH, a more powerful reducing agent, replaces FADH₂.',
      'It also runs in a different place: the cytosol.',
    ]),
    ask(
      mcq('c2-06', 'synthesis-stages', 'The cycle repeats until which product is formed?', 'Palmitoyl-ACP (16 carbons)', ['Stearoyl-CoA (18 carbons)', 'Butyryl-ACP (4 carbons)', 'Malonyl-ACP (3 carbons)'], {
        explanation: 'Slide 4: the cycle continues until palmitoyl-ACP.',
      })
    ),
  ],

  // ─── Lesson 3 — Malonyl-CoA ────────────────────────────────────────
  'fatty-acid-biosynthesis-3': [
    ask(
      mcq('c3-01', 'acetyl-coa-carboxylase', 'Read the name: what should “acetyl-CoA carboxylase” do?', 'Add a carboxyl group (CO₂) to acetyl-CoA', ['Remove CO₂ from acetyl-CoA', 'Move acetyl-CoA onto ACP', 'Hydrolyse acetyl-CoA'], {
        explanation: 'A carboxylase adds a carboxyl group — the first step activates acetyl-CoA this way.',
        skill: 'prediction',
      }),
      ['Exactly: the first step of synthesis activates acetyl-CoA by adding CO₂.']
    ),
    learn('The first step', ['Before any chain is built, acetyl-CoA is activated:'], {
      steps: [
        { label: 'Acetyl-CoA + CO₂', detail: 'Starting materials.' },
        { label: 'Acetyl-CoA carboxylase', detail: 'Adds the CO₂.' },
        { label: 'Malonyl-CoA', detail: '⁻OOC–CH₂–CO–S-CoA: the activated two-carbon donor.' },
      ],
      sourceRefs: [...ref([5], [2]), ...leh(787)],
    }),
    ask(
      fill('c3-02', 'malonyl-coa', 'Acetyl-CoA + CO₂ → ____ (the activated donor of two-carbon units).', ['malonyl-CoA', 'malonyl CoA', 'malonylcoa'], {
        explanation: 'Acetyl-CoA carboxylase makes malonyl-CoA.',
      })
    ),
    ask(
      mcq('c3-03', 'malonyl-coa', 'Which formula is malonyl-CoA?', '⁻OOC–CH₂–CO–S-CoA', ['CH₃–CO–S-CoA', 'CH₃CH₂CO–S-CoA', '⁻OOC–CO–S-CoA'], {
        explanation: 'Malonyl-CoA carries the added carboxyl group (deck A’s formula, confirmed by Lehninger). CH₃–CO–S-CoA is acetyl-CoA.',
        difficulty: 'intermediate',
      })
    ),
    learn('Paying for malonyl-CoA (textbook)', [
      'Lehninger explains how the carboxylase works: it carries biotin. CO₂ is first attached to biotin using the energy of ATP, then handed on to acetyl-CoA. The reaction is irreversible.',
      'This is where fatty acid synthesis spends its ATP — one ATP per malonyl-CoA.',
    ], { sourceRefs: leh(787, 793) }),
    ask(
      tf({
        id: 'c3-04',
        conceptId: 'acc-energy',
        statement: 'Making each malonyl-CoA costs one ATP, spent by acetyl-CoA carboxylase.',
        answer: true,
        explanation: 'Lehninger: the carboxylase uses ATP to attach CO₂ (via biotin) — one ATP per malonyl-CoA.',
      })
    ),
    ask(
      mcq('c3-05', 'co2-fate', 'What happens to the CO₂ that acetyl-CoA carboxylase added?', 'It leaves again at condensation, driving the new C–C bond', ['It becomes the carboxyl end of palmitate', 'It is released by the thioesterase', 'It stays in the growing chain'], {
        explanation: 'Slide 7: the CO₂ leaves the malonyl group, and the electrons from its bond attack the acyl group.',
        skill: 'cause-effect',
        difficulty: 'intermediate',
      }),
      ['So the cell carboxylates now in order to decarboxylate later — the CO₂ is a temporary handle that pays for making the carbon–carbon bond.']
    ),
    recall('r3-01', 'co2-fate', 'Why does the cell add CO₂ to acetyl-CoA only to lose it again?', [
      'Adding CO₂ makes malonyl-CoA, the activated two-carbon donor.',
      'At condensation the CO₂ leaves; the electrons from that bond attack the acyl group.',
      'Losing CO₂ drives (pays for) the new carbon–carbon bond.',
      'None of the added CO₂ ends up in the finished fatty acid.',
    ]),
    ask(
      mcq('c3-06', 'malonyl-coa', 'How many carbons are in the acyl part of malonyl-CoA?', 'Three', ['Two', 'Four', 'One'], {
        explanation: 'Acetyl (2 C) plus the added carboxyl carbon gives a three-carbon malonyl group.',
      })
    ),
  ],

  // ─── Lesson 4 — The synthase complex ───────────────────────────────
  'fatty-acid-biosynthesis-4': [
    ask(
      mcq('c4-01', 'fas-carriers', 'During synthesis, where is the growing chain?', 'Attached to the fatty acid synthase complex the whole time', ['Free in the cytosol between steps', 'Carried on coenzyme A', 'Bound to the ER membrane'], {
        explanation: 'The chain stays on the synthase’s carriers throughout chain building.',
        skill: 'prediction',
      })
    ),
    learn('One complex, two carriers', ['The lecture describes two carriers on the fatty acid synthase:'], {
      terms: [
        { term: 'ACP₁', meaning: 'A cysteinyl sulfhydryl (–SH) group. Holding station for acetyl or fatty acyl groups.' },
        { term: 'ACP₂', meaning: 'A long phosphopantetheine. Carries the growing chain during condensation and the reductions.' },
      ],
      keyPoint: 'Textbook names: ACP₁ = the cysteine –SH of β-ketoacyl-ACP synthase; ACP₂ = the acyl carrier protein.',
      sourceRefs: [...ref([6], [3]), ...leh(789, 790)],
    }),
    ask(
      match('c4-02', 'fas-carriers', 'Match each carrier to what it is and does.', [
        ['ACP₁', 'Cysteinyl –SH: holding station for acetyl/acyl groups'],
        ['ACP₂', 'Phosphopantetheine: carries the growing chain'],
      ], { explanation: 'Slide 6: ACP₁ is bound through a cysteinyl sulfhydryl; ACP₂ carries the acyl group on a long phosphopantetheine.' })
    ),
    ask(
      order('c4-03', 'carrier-loading', 'Put the loading and joining steps in order.', [
        'Acetyl moves from CoA to the cysteinyl-S of ACP₁',
        'Malonyl moves from CoA to the pantetheinyl-S of ACP₂',
        'Ketoacyl-ACP synthase joins the two groups',
      ], { explanation: 'Slide 7: acetyl-CoA:ACP transacylase, then malonyl-CoA:ACP transacylase, then the ketoacyl-ACP synthase condensation.' })
    ),
    learn('Condensation', ['With both groups loaded side by side, ketoacyl-ACP synthase makes the first carbon–carbon bond:'], {
      steps: [
        { label: 'CO₂ leaves the malonyl group', detail: 'The CO₂ added in Lesson 3 is lost.' },
        { label: 'Its bond electrons attack the acyl group on ACP₁', detail: 'A new C–C bond forms.' },
        { label: 'A β-ketoacyl group results', detail: 'First round: acetoacetyl-ACP.' },
      ],
      sourceRefs: [...ref([7, 8], [4, 6]), ...leh(791)],
    }),
    ask(
      mcq('c4-04', 'condensation', 'Acetyl (2 C) + malonyl (3 C) condense and CO₂ is lost. How many carbons does the first product have?', 'Four — acetoacetyl-ACP', ['Five', 'Three', 'Six'], {
        explanation: '2 + 3 − 1 (CO₂) = 4 carbons: acetoacetyl-ACP.',
        skill: 'application',
      })
    ),
    ask(
      fill('c4-05', 'condensation', 'The enzyme that condenses the acetyl and malonyl groups is ketoacyl-ACP ____.', ['synthase'], {
        explanation: 'Ketoacyl-ACP synthase joins the groups (slide 7).',
        skill: 'terminology',
      })
    ),
    recall('r4-01', 'carrier-loading', 'Describe how the synthase is loaded before the first condensation.', [
      'Acetyl-CoA:ACP transacylase moves an acetyl group from CoA to the cysteinyl-S on ACP₁.',
      'Malonyl-CoA:ACP transacylase moves a malonyl group from CoA to the pantetheinyl-S of ACP₂.',
      'The two groups now sit side by side, ready to condense.',
    ]),
  ],

  // ─── Lesson 5 — Reduce, dehydrate, reduce ──────────────────────────
  'fatty-acid-biosynthesis-5': [
    ask(
      mcq('c5-01', 'keto-reduction', 'Condensation leaves a keto group (C=O) on the β-carbon. What is the FIRST step that deals with it?', 'Reduction to an alcohol, using NADPH', ['Removal of water', 'Oxidation by FAD', 'Hydrolysis by a thioesterase'], {
        explanation: 'Slide 9: the keto group is reduced to an alcohol using NADPH (β-ketoacyl-ACP reductase).',
        skill: 'prediction',
      })
    ),
    learn('Reduce, dehydrate, reduce', ['Three steps turn the β-keto group into a saturated chain (first-round names from the lecture diagram):'], {
      steps: [
        { label: 'KR — β-ketoacyl-ACP reductase', detail: 'C=O → C–OH, using NADPH. Acetoacetyl-ACP → D-β-hydroxybutyryl-ACP.' },
        { label: 'DH — β-hydroxyacyl-ACP dehydratase', detail: 'Removes H₂O, forming a TRANS double bond. → Crotonyl-ACP.' },
        { label: 'ER — enoyl-ACP reductase', detail: 'C=C → saturated, using NADPH (in place of FADH₂). → Butyryl-ACP.' },
      ],
      sourceRefs: [...ref([8, 9, 12], [5, 6, 9]), ...leh(791)],
    }),
    ask(
      order('c5-02', 'synthase-activities', 'Put the three activities in the order they act on the β-carbon.', [
        'Ketoreductase (KR): C=O → C–OH',
        'Dehydratase (DH): removes water, forms C=C',
        'Enoyl reductase (ER): C=C → saturated',
      ], { explanation: 'Slide 12: KR, DH and ER act in sequence after each condensation.' })
    ),
    ask(
      mcq('c5-03', 'dehydration-step', 'What kind of double bond does the dehydration step form?', 'A trans double bond', ['A cis double bond', 'A C=O double bond', 'No double bond'], {
        explanation: 'The lecture diagram and Lehninger agree: trans (trans-Δ²-enoyl). Slide 9’s “cis” is clarified in the reading.',
        difficulty: 'intermediate',
        skill: 'misconception',
      })
    ),
    ask(
      multi('c5-04', 'cycle-accounting', 'Which steps of each cycle use NADPH?', ['Reducing the β-keto group (KR)', 'Reducing the double bond (ER)'], ['Removing water (DH)', 'Condensation (ketoacyl-ACP synthase)'], {
        explanation: 'Both reductions use NADPH — two per cycle.',
      })
    ),
    learn('Reset, repeat, release', ['After the second reduction the saturated chain sits on ACP₂. The cycle then resets:'], {
      steps: [
        { label: 'ACP-acyltransferase moves the chain to ACP₁', detail: 'From the pantetheinyl-S of ACP₂ to the cysteinyl-S on ACP₁.' },
        { label: 'ACP₂ picks up the next malonyl group', detail: 'Condense, reduce, dehydrate, reduce again: +2 carbons.' },
        { label: 'At 16 carbons, a thioesterase (TE) releases the chain', detail: 'In animal cells: palmitate + ACP-SH.' },
      ],
      sourceRefs: [...ref([8, 9, 12], [5, 6, 9]), ...leh(793)],
    }),
    ask(
      mcq('c5-05', 'acyl-transfer', 'After the second reduction, what frees ACP₂ for the next malonyl group?', 'ACP-acyltransferase moves the chain to the cysteinyl-S of ACP₁', ['The thioesterase releases the chain', 'The chain is transferred to coenzyme A', 'Malonyl-CoA displaces the chain'], {
        explanation: 'Slide 9: the acyl group moves from ACP₂ to ACP₁, leaving ACP₂ available.',
        skill: 'pathway-reasoning',
      })
    ),
    ask(
      fill('c5-06', 'palmitate-release', 'When the chain reaches 16 carbons, a ____ releases it as palmitate.', ['thioesterase', 'TE'], {
        explanation: 'Slide 12: the thioesterase (TE) releases the chain at C16.',
        skill: 'terminology',
      })
    ),
    recall('r5-01', 'cycle-accounting', 'Account for what it takes to make one palmitate.', [
      '1 acetyl-CoA (primer) + 7 malonyl-CoA (donors).',
      '7 cycles: one worked cycle plus 6 more.',
      '2 NADPH per cycle → 14 NADPH.',
      '7 CO₂ released — one per condensation.',
    ]),
    ask(
      mcq('c5-07', 'cycle-accounting', 'How many NADPH are used to make one palmitate?', '14', ['7', '8', '16'], {
        explanation: '7 cycles × 2 reductions, each using one NADPH.',
        skill: 'application',
        difficulty: 'intermediate',
      })
    ),
  ],

  // ─── Lesson 6 — Synthesis vs β-oxidation ───────────────────────────
  'fatty-acid-biosynthesis-6': [
    ask(
      order('c6-01', 'beta-oxidation-reactions', 'Recall β-oxidation: order its four reactions.', [
        'Acyl-CoA dehydrogenase (FAD)',
        'Enoyl-CoA hydratase (+H₂O)',
        'L-3-Hydroxyacyl-CoA dehydrogenase (NAD⁺)',
        'Acetyl-CoA acyltransferase (CoASH)',
      ], { explanation: 'Slide 10 lists the four reactions in this order.' })
    ),
    learn('Mirror images', ['Read synthesis from the bottom up and each step undoes a β-oxidation step — with its own enzyme and cofactor:'], {
      steps: [
        { label: 'Enoyl-ACP reductase (NADPH)', detail: 'Undoes acyl-CoA dehydrogenase (which made the C=C with FAD).' },
        { label: 'β-Hydroxyacyl-ACP dehydratase', detail: 'Undoes enoyl-CoA hydratase (which added water).' },
        { label: 'β-Ketoacyl-ACP reductase (NADPH)', detail: 'Undoes L-3-hydroxyacyl-CoA dehydrogenase (C–OH → C=O with NAD⁺).' },
      ],
      sourceRefs: [...ref([8, 9, 10], [5, 6]), ...leh(638, 791)],
    }),
    ask(
      match('c6-02', 'pathway-comparison', 'Match each synthesis enzyme to the β-oxidation step it reverses.', [
        ['Enoyl-ACP reductase', 'Acyl-CoA dehydrogenase'],
        ['β-Hydroxyacyl-ACP dehydratase', 'Enoyl-CoA hydratase'],
        ['β-Ketoacyl-ACP reductase', 'L-3-Hydroxyacyl-CoA dehydrogenase'],
      ], { explanation: 'The reduction–dehydration–reduction of synthesis is the reverse of three β-oxidation steps.', difficulty: 'intermediate' })
    ),
    ask(
      mcq('c6-03', 'electron-carriers', 'Synthesis uses NADPH for its reductions. Which electron carriers does β-oxidation use?', 'FAD and NAD⁺', ['NADPH only', 'NADH and NADPH', 'FADH₂ only'], {
        explanation: 'Slide 10: acyl-CoA dehydrogenase uses FAD; L-3-hydroxyacyl-CoA dehydrogenase uses NAD⁺.',
        skill: 'comparison',
      })
    ),
    ask(
      multi('c6-04', 'pathway-comparison', 'Which are true of fatty acid synthesis but NOT of β-oxidation?', ['It takes place in the cytosol', 'Its intermediates are carried on ACP', 'Its hydroxy intermediate is the D isomer'], ['Its intermediates are carried on coenzyme A', 'It releases acetyl-CoA each cycle'], {
        explanation: 'Synthesis: cytosol, ACP, D-hydroxy intermediate. β-Oxidation: mitochondria, CoA, L-hydroxy intermediate, releases acetyl-CoA.',
        difficulty: 'advanced',
        skill: 'comparison',
      })
    ),
    learn('Why NADPH?', [
      'The lecture’s reason: NADPH is substituted as a more powerful reducing agent than FADH₂. Synthesis pushes electrons INTO the chain twice per cycle, so it uses a strong electron donor.',
      'Lehninger adds the general rule: cells use NADPH for building (reductive) reactions and NAD⁺ for breakdown (oxidative) reactions.',
    ], { sourceRefs: [...ref([5, 9], [2, 5]), ...leh(794)] }),
    recall('r6-01', 'pathway-comparison', 'List as many differences between fatty acid synthesis and β-oxidation as you can.', [
      'Location: cytosol vs mitochondria.',
      'Carrier: ACP vs coenzyme A.',
      'Electron carriers: NADPH vs FAD and NAD⁺.',
      'Two-carbon unit: activated malonyl added vs acetyl-CoA removed.',
      'Hydroxy intermediate: D vs L.',
    ]),
    ask(
      tf({
        id: 'c6-05',
        conceptId: 'pathway-comparison',
        statement: 'Fatty acid synthesis is β-oxidation run backwards, using the same enzymes.',
        answer: false,
        explanation: 'Three steps are reversed, but by different enzymes, with NADPH, on ACP, in the cytosol — a separate pathway.',
        skill: 'misconception',
      })
    ),
  ],

  // ─── Lesson 7 — Elongation ─────────────────────────────────────────
  'fatty-acid-biosynthesis-7': [
    ask(
      mcq('c7-01', 'other-fatty-acids', 'The synthase releases its chain at 16 carbons. How does a cell get a fatty acid SHORTER than palmitate?', 'By β-oxidation of palmitate', ['The synthase stops early on demand', 'By ER elongation', 'By mitochondrial elongation'], {
        explanation: 'Slide 13: palmitate can be shortened by β-oxidation.',
        skill: 'prediction',
      })
    ),
    learn('Longer chains: the ER system', ['For fatty acids longer than palmitate, the main route is the elongation system on the endoplasmic reticulum:'], {
      steps: [
        { label: 'Activate', detail: 'Palmitate → palmitoyl-CoA.' },
        { label: 'Elongate', detail: 'The same reactions as synthesis, but by individual enzymes.' },
        { label: 'Product', detail: 'The enzymes prefer C16 or less, so the major product is stearoyl-CoA (C18).' },
      ],
      sourceRefs: [...ref([11, 13], [7, 10]), ...leh(797)],
    }),
    ask(
      order('c7-02', 'er-elongation', 'Order the ER elongation of palmitate.', [
        'Palmitate is activated to palmitoyl-CoA',
        'Synthesis-type reactions run on individual ER enzymes',
        'The major product, stearoyl-CoA, is formed',
      ], { explanation: 'Slides 11 and 13: activation, then the same reactions on individual enzymes, giving mainly stearoyl-CoA.' })
    ),
    ask(
      mcq('c7-03', 'er-elongation', 'Why is stearoyl-CoA the MAJOR product of ER elongation?', 'The ER enzymes prefer substrates of C16 or less', ['Stearate is the only fatty acid the ER can make', 'A thioesterase cuts the chain at C18', 'The mitochondria convert everything to stearate'], {
        explanation: 'Slides 11/13: the enzymes prefer C-16 or less, so one round on palmitoyl-CoA (→ C18) dominates.',
        skill: 'cause-effect',
        difficulty: 'intermediate',
      })
    ),
    ask(
      mcq('c7-04', 'unsaturated-elongation', 'Why can unsaturated chains longer than C16 still be elongated?', 'A cis double bond kinks the chain, making it effectively shorter', ['They are carried on ACP instead of CoA', 'Unsaturated chains bind NADPH more tightly', 'They are elongated in the nucleus'], {
        explanation: 'Slide 13: the kink of the cis double bond makes them effectively shorter, so they still bind.',
        skill: 'cause-effect',
        difficulty: 'intermediate',
      }),
      ['That is why unsaturated fatty acids of 20, 22 and 24 carbons are made — and most longer fatty acids are polyunsaturated.']
    ),
    learn('A second system in the mitochondria', [
      'Another elongation system exists in the mitosol, probably to provide long fatty acids for mitochondrial structure.',
      'It uses most of the same activities as β-oxidation — but an NADPH-dependent enoyl-CoA reductase replaces the FAD-dependent dehydrogenase.',
    ], { sourceRefs: [...ref([14], [11]), ...leh(797)] }),
    ask(
      mcq('c7-05', 'mitochondrial-elongation', 'In mitochondrial elongation, what replaces β-oxidation’s FAD-dependent dehydrogenase?', 'An NADPH-dependent enoyl-CoA reductase', ['Ketoacyl-ACP synthase', 'A thioesterase', 'An NAD⁺-dependent hydratase'], {
        explanation: 'Slide 14: an NADPH-dependent enoyl-CoA reductase replaces the FAD-dependent dehydrogenase.',
      })
    ),
    recall('r7-01', 'unsaturated-elongation', 'Explain why most longer fatty acids are polyunsaturated.', [
      'ER elongation enzymes prefer chains of C16 or less.',
      'A cis double bond kinks a chain, making it effectively shorter.',
      'So unsaturated chains still bind and are elongated to 20, 22 and 24 carbons.',
      'Result: most longer fatty acids are polyunsaturated.',
    ]),
  ],

  // ─── Lesson 8 — The Pyruvate–Malate cycle ──────────────────────────
  'fatty-acid-biosynthesis-8': [
    ask(
      mcq('c8-01', 'transport-problem', 'Acetyl-CoA is made in the mitochondria; synthesis happens in the cytosol. Why can’t acetyl-CoA simply leave?', 'It cannot cross the inner mitochondrial membrane', ['It is consumed instantly by the TCA cycle', 'It is too unstable outside the mitochondria', 'It is permanently bound to ACP'], {
        explanation: 'Slide 15: acetyl-CoA is made in the mitochondria and can’t cross the inner membrane.',
        skill: 'cause-effect',
      }),
      ['So the cell ships acetyl groups out indirectly — as citrate — in the Pyruvate–Malate (Citrate–Pyruvate) Cycle.']
    ),
    learn('Shipping acetyl groups as citrate', ['Following the slides and the lecture’s diagram:'], {
      steps: [
        { label: 'Citrate synthase (mitochondria)', detail: 'Acetyl-CoA + oxaloacetate → citrate.' },
        { label: 'Citrate leaves on a co-transporter', detail: 'Readily transported out of the mitochondria.' },
        { label: 'ATP-citrate lyase (cytosol)', detail: 'Citrate → acetyl-CoA + oxaloacetate; requires ATP.' },
      ],
      sourceRefs: [...ref([15, 17], [12, 14]), ...leh(795)],
    }),
    ask(
      order('c8-02', 'citrate-export', 'Order the steps that move acetyl groups out to the cytosol.', [
        'Acetyl-CoA + oxaloacetate → citrate (citrate synthase)',
        'Citrate leaves the mitochondria on a co-transporter',
        'ATP-citrate lyase splits citrate in the cytosol',
        'Acetyl-CoA is available for synthesis',
      ], { explanation: 'Slide 15: make citrate, export it, cleave it with ATP.' })
    ),
    ask(
      mcq('c8-03', 'citrate-cleavage', 'Which enzyme splits citrate in the cytosol, and what does it cost?', 'ATP-citrate lyase — it uses ATP', ['Citrate synthase — it uses NADH', 'Malic enzyme — it makes NADPH', 'Pyruvate carboxylase — it uses biotin'], {
        explanation: 'Slide 15 / diagram: citrate cleavage requires ATP to make it favourable (ATP-citrate lyase).',
      })
    ),
    learn('Recycling oxaloacetate — and making NADPH', ['Oxaloacetate must get back to the mitochondria. On the way, NADH’s electrons become NADPH:'], {
      steps: [
        { label: 'Malate dehydrogenase', detail: 'Oxaloacetate is REDUCED to malate, using NADH (→ NAD⁺).' },
        { label: 'Malic enzyme', detail: 'Malate → pyruvate + CO₂, producing NADPH for biosynthesis.' },
        { label: 'Pyruvate re-enters the mitochondria', detail: 'Pyruvate carboxylase (CO₂ + ATP) regenerates oxaloacetate.' },
      ],
      sourceRefs: [...ref([16, 17], [13, 14]), ...leh(795)],
    }),
    ask(
      mcq('c8-04', 'oaa-to-malate', 'Cytosolic oxaloacetate is converted to malate. Is it oxidised or reduced?', 'Reduced — using NADH', ['Oxidised — making NADH', 'Oxidised — making NADPH', 'Neither — water is added'], {
        explanation: 'The diagram and Lehninger: malate dehydrogenase reduces oxaloacetate using NADH. Slide 16’s “dehydrogenated” is clarified in the reading.',
        difficulty: 'intermediate',
        skill: 'misconception',
      })
    ),
    ask(
      fill('c8-05', 'malic-enzyme', 'Malic enzyme turns malate into pyruvate and produces ____ for biosynthesis.', ['NADPH', 'NADPH + H+', 'NADPH+H+'], {
        explanation: 'Slide 16: the malic enzyme reaction also provides NADPH.',
      })
    ),
    recall('r8-01', 'glycolysis-coupling', 'What three things does the Pyruvate–Malate cycle do for fatty acid synthesis?', [
      'Delivers acetyl groups (as citrate) to the cytosol.',
      'Converts NADH reducing power into NADPH, via malic enzyme.',
      'Couples fatty acid synthesis to glycolysis: glucose → pyruvate feeds the cycle.',
    ]),
    ask(
      multi('c8-06', 'cycle-return', 'Which molecules cross the mitochondrial inner membrane in the cycle, as the diagram shows?', ['Citrate (leaving)', 'Pyruvate (entering)'], ['Acetyl-CoA (leaving)', 'Oxaloacetate (leaving)'], {
        explanation: 'Citrate leaves on a co-transporter and pyruvate re-enters; acetyl-CoA and oxaloacetate cannot cross directly — that is why the cycle exists.',
        skill: 'pathway-reasoning',
        difficulty: 'intermediate',
      })
    ),
  ],
};

// Reading-layer extras: high-yield points, common confusions, timing.
export const readingExtras: Record<
  string,
  { highYield: string[]; confusions: LessonConfusion[]; estimatedMinutes: number; xp: number }
> = {
  'fatty-acid-biosynthesis-1': {
    estimatedMinutes: 8,
    xp: 20,
    highYield: [
      'Acetyl-CoA links β-oxidation (product) and synthesis (starting material).',
      'Synthetase = must hydrolyse ATP; synthase = no ATP needed.',
      'Hydratase adds water; dehydratase removes it.',
    ],
    confusions: [
      { confusion: 'A hydratase removes water.', clarification: 'A hydratase ADDS water; a dehydratase removes it. Slide 2’s wording describes a dehydratase.' },
      { confusion: 'Fatty acid synthase is a synthetase.', clarification: 'It is a synthase: the ATP is spent earlier, by acetyl-CoA carboxylase.' },
    ],
  },
  'fatty-acid-biosynthesis-2': {
    estimatedMinutes: 8,
    xp: 20,
    highYield: [
      'Synthesis: anabolic, cytosolic, fed state.',
      'Fed state: glucose uptake → TCA flux ↑ → excess citrate leaves via the citrate shunt.',
      'Enablers: CO₂ activation of acetyl-CoA, and NADPH instead of FADH₂.',
      'Cycle: transfer → elongation → reduction → dehydration → reduction, until palmitoyl-ACP.',
    ],
    confusions: [
      { confusion: 'Synthesis is simply β-oxidation in reverse.', clarification: 'Activation to malonyl-CoA, NADPH, ACP and the cytosolic location make it a separate pathway.' },
    ],
  },
  'fatty-acid-biosynthesis-3': {
    estimatedMinutes: 9,
    xp: 25,
    highYield: [
      'Acetyl-CoA + CO₂ → malonyl-CoA, by acetyl-CoA carboxylase (the first step).',
      'Malonyl-CoA = ⁻OOC–CH₂–CO–S-CoA (three-carbon acyl part).',
      'The added CO₂ leaves at condensation and drives the new C–C bond.',
    ],
    confusions: [
      { confusion: 'The CO₂ added to acetyl-CoA ends up in the fatty acid.', clarification: 'It leaves again at condensation — none of it is kept.' },
    ],
  },
  'fatty-acid-biosynthesis-4': {
    estimatedMinutes: 10,
    xp: 25,
    highYield: [
      'ACP₁: cysteinyl –SH holding station. ACP₂: phosphopantetheine arm carrying the chain.',
      'Acetyl → ACP₁; malonyl → ACP₂ (two transacylases).',
      'Ketoacyl-ACP synthase: 2 C + 3 C − CO₂ → acetoacetyl-ACP (4 C).',
    ],
    confusions: [
      { confusion: 'ACP₁ carries the growing chain through the reductions.', clarification: 'ACP₂ (phosphopantetheine) carries it; ACP₁ is the holding station.' },
    ],
  },
  'fatty-acid-biosynthesis-5': {
    estimatedMinutes: 14,
    xp: 30,
    highYield: [
      'KR (NADPH) → DH (−H₂O, trans C=C) → ER (NADPH).',
      'First round: acetoacetyl- → D-β-hydroxybutyryl- → crotonyl- → butyryl-ACP.',
      'Palmitate: 1 acetyl-CoA + 7 malonyl-CoA, 7 cycles, 14 NADPH, 7 CO₂.',
      'Thioesterase (TE) releases the chain at C16.',
    ],
    confusions: [
      { confusion: 'The dehydration step forms a cis double bond (slide 9).', clarification: 'It forms a TRANS double bond (lecture diagram + Lehninger).' },
      { confusion: 'Palmitate takes 6 cycles.', clarification: 'Seven in total: one worked cycle plus “6 cycles”.' },
    ],
  },
  'fatty-acid-biosynthesis-6': {
    estimatedMinutes: 12,
    xp: 25,
    highYield: [
      'β-Oxidation: acyl-CoA DH (FAD) → enoyl-CoA hydratase → L-3-hydroxyacyl-CoA DH (NAD⁺) → thiolase.',
      'Synthesis reverses the middle three steps with its own enzymes and NADPH.',
      'Synthesis vs β-oxidation: cytosol vs mitochondria, ACP vs CoA, NADPH vs FAD/NAD⁺, D vs L.',
    ],
    confusions: [
      { confusion: 'Both pathways use NADH/NAD⁺.', clarification: 'Synthesis uses NADPH; β-oxidation uses FAD and NAD⁺.' },
    ],
  },
  'fatty-acid-biosynthesis-7': {
    estimatedMinutes: 10,
    xp: 25,
    highYield: [
      'Shorter than C16: β-oxidation of palmitate. Longer: elongation systems.',
      'ER elongation: palmitoyl-CoA → same reactions, individual enzymes → mainly stearoyl-CoA.',
      'cis kinks let longer unsaturated chains bind → 20-, 22-, 24-C unsaturated fatty acids.',
      'Mitochondrial elongation: NADPH-dependent enoyl-CoA reductase.',
    ],
    confusions: [
      { confusion: 'The synthase makes stearate directly.', clarification: 'The synthase makes palmitate; stearoyl-CoA comes from ER elongation.' },
    ],
  },
  'fatty-acid-biosynthesis-8': {
    estimatedMinutes: 12,
    xp: 30,
    highYield: [
      'Acetyl-CoA can’t cross the inner mitochondrial membrane — it leaves as citrate.',
      'ATP-citrate lyase (cytosol, ATP) splits citrate → acetyl-CoA + oxaloacetate.',
      'Oxaloacetate → malate (NADH) → pyruvate + NADPH (malic enzyme).',
      'Pyruvate carboxylase (ATP) regenerates oxaloacetate; the cycle couples synthesis to glycolysis.',
    ],
    confusions: [
      { confusion: 'Oxaloacetate is oxidised (“dehydrogenated”) to malate.', clarification: 'It is REDUCED to malate using NADH (diagram + Lehninger).' },
    ],
  },
};
