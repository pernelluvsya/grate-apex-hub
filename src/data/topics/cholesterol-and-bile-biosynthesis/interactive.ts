// Biochemistry → Cholesterol and Bile Biosynthesis: layer 1 (learn by
// answering) and reading-layer extras for the five lessons.
//
// Every checkpoint asks BEFORE it explains. Facts come from the lecture
// slides and the lecture diagrams (written out in ./sources.ts); where a
// point is unsettled (discrepancies 'liver-share', 'regulation-count') it
// is not asked. Checkpoint IDs: cN-xx; recall prompts: rN-xx.
import type { LessonConfusion } from '@/data/lesson-types';
import { ask, fill, learn, match, mcq, multi, order, recall, tf, type InteractiveDraft } from '@/data/topics/build';
import { fa, leh, ref, type ConceptId } from '@/data/topics/cholesterol-and-bile-biosynthesis/sources';

type Steps = InteractiveDraft<ConceptId>[];

export const interactive: Record<string, Steps> = {
  // ─── Lesson 1 — Structure, sites and raw materials ─────────────────
  'cholesterol-and-bile-biosynthesis-1': [
    ask(
      mcq('c1-01', 'acetate-origin', 'Cholesterol is a large, four-ring molecule. Before you read on: where do you expect ALL of its carbon atoms to come from?', 'Acetate (used as acetyl-CoA)', ['Glucose, added as whole six-carbon units', 'Dietary benzene rings', 'Amino acids only'], {
        explanation: 'Slide 5: cholesterol is synthesised from acetate precursors — every carbon comes from acetate’s methyl or carbonyl group.',
        skill: 'prediction',
      }),
      ['A few small two-carbon units build the whole molecule. In the cell, acetate is used as acetyl-CoA — the starting material of the pathway.']
    ),
    learn('The steroid nucleus', [
      'Cholesterol’s four-ring nucleus is the cyclopentanoperhydrophenanthrene ring: three six-membered rings (A, B, C) fused to one five-membered ring (D).',
      'It is NOT a benzene ring — the lecture stresses that animals cannot synthesise a benzene ring.',
    ], {
      terms: [{ term: 'Cyclopentanoperhydrophenanthrene', meaning: 'The four-ring steroid nucleus of cholesterol (rings A–D).' }],
      sourceRefs: ref([3, 4]),
    }),
    ask(
      tf({
        id: 'c1-02',
        conceptId: 'steroid-nucleus',
        statement: 'The four-ring nucleus of cholesterol is made of benzene rings.',
        answer: false,
        explanation: 'It is the cyclopentanoperhydrophenanthrene ring — not benzene. Animals cannot synthesise a benzene ring.',
        skill: 'misconception',
      })
    ),
    learn('Landmarks on the molecule', ['Slide 4 labels the parts you need to recognise:'], {
      terms: [
        { term: 'Ring A', meaning: 'Hydroxyl group (HO–) on carbon 3.' },
        { term: 'Ring B', meaning: 'Double bond between carbons 5 and 6.' },
        { term: 'Ring D', meaning: 'Five-membered; the branched side chain is on carbon 17.' },
      ],
      keyPoint: '–OH at C-3 · double bond C-5=C-6 · side chain at C-17.',
      sourceRefs: ref([4]),
    }),
    ask(
      match('c1-03', 'cholesterol-landmarks', 'Match each feature of cholesterol to where it sits.', [
        ['Hydroxyl group (–OH)', 'Carbon 3'],
        ['Double bond', 'Carbons 5 and 6'],
        ['Branched side chain', 'Carbon 17'],
        ['Five-membered ring', 'Ring D'],
      ], { explanation: 'All four landmarks are labelled on the structure on slide 4.' })
    ),
    learn('Where cholesterol is made', [
      'Cholesterol is found in all cells, and animal tissue synthesises it from acetic acid. The lecture names the liver and the intestinal mucosa as sites of synthesis.',
      'Other sites with high synthesis rates are the intestines, the adrenal glands and the reproductive organs.',
    ], { sourceRefs: ref([2, 3]) }),
    ask(
      multi('c1-04', 'synthesis-sites', 'According to the lecture, which sites have high rates of cholesterol synthesis besides the liver? Select all that apply.', ['Intestines', 'Adrenal glands', 'Reproductive organs'], ['Lungs', 'Skeletal muscle'], {
        explanation: 'Slide 2: other sites of higher synthesis rates include the intestines, adrenal glands and reproductive organs.',
      })
    ),
    learn('Getting acetyl-CoA and NADPH to the cytosol', [
      'Acetyl-CoA is made in the mitochondrial matrix, but cholesterol is built outside the mitochondria. The Pyruvate–Malate cycle (slide 6) solves this — and makes NADPH on the way.',
    ], {
      steps: [
        { label: 'Matrix: acetyl-CoA + oxaloacetate → citrate', detail: 'Citrate synthase.' },
        { label: 'Citrate crosses to the cytosol' },
        { label: 'ATP-citrate lyase: citrate → acetyl-CoA + oxaloacetate', detail: 'Costs ATP.' },
        { label: 'Malate dehydrogenase: oxaloacetate → malate', detail: 'NADH → NAD⁺.' },
        { label: 'Malic enzyme: malate → pyruvate', detail: 'NADP⁺ → NADPH; CO₂ released.' },
        { label: 'Pyruvate re-enters; pyruvate carboxylase → oxaloacetate', detail: 'CO₂ + ATP.' },
      ],
      sourceRefs: [...ref([6]), ...fa([13, 14])],
    }),
    ask(
      order('c1-05', 'pyruvate-malate-supply', 'Put the Pyruvate–Malate cycle in order, starting in the matrix.', [
        'Acetyl-CoA + oxaloacetate → citrate',
        'Citrate crosses to the cytosol',
        'ATP-citrate lyase releases acetyl-CoA + oxaloacetate',
        'Oxaloacetate → malate',
        'Malate → pyruvate + NADPH + CO₂',
        'Pyruvate re-enters and becomes oxaloacetate',
      ], { explanation: 'Slide 6: citrate carries the acetyl groups out; the oxaloacetate returns as malate → pyruvate.' })
    ),
    ask(
      mcq('c1-06', 'pyruvate-malate-supply', 'Which enzyme of the cycle produces the NADPH that cholesterol synthesis needs?', 'Malic enzyme', ['Malate dehydrogenase', 'ATP-citrate lyase', 'Citrate synthase'], {
        explanation: 'Malic enzyme converts malate to pyruvate, reducing NADP⁺ to NADPH (and releasing CO₂). Malate dehydrogenase uses NADH, not NADPH.',
      }),
      ['That NADPH is used by HMG-CoA reductase — two per HMG-CoA (Lesson 2).']
    ),
    recall('r1-01', 'pyruvate-malate-supply', 'Explain why the Pyruvate–Malate cycle matters for cholesterol synthesis.', [
      'Acetyl-CoA is made in the mitochondrial matrix; cholesterol is built outside the mitochondria.',
      'Citrate carries the acetyl groups out; ATP-citrate lyase releases acetyl-CoA in the cytosol (costing ATP).',
      'Malic enzyme turns malate into pyruvate and makes NADPH — needed by HMG-CoA reductase.',
    ]),
  ],

  // ─── Lesson 2 — Acetyl-CoA to mevalonate ───────────────────────────
  'cholesterol-and-bile-biosynthesis-2': [
    ask(
      mcq('c2-01', 'acetoacetyl-coa-step', 'The mevalonate pathway begins with a condensation. Which one?', 'Acetyl-CoA + acetyl-CoA → acetoacetyl-CoA', ['Acetyl-CoA + malonyl-CoA → acetoacetyl-CoA', 'Pyruvate + pyruvate → acetoacetate', 'Acetyl-CoA + oxaloacetate → citrate'], {
        explanation: 'Slide 2: synthesis starts with the mevalonate pathway, where two molecules of acetyl-CoA condense to form acetoacetyl-CoA.',
        skill: 'prediction',
      }),
      ['Acetoacetyl-CoA then takes up a third acetyl-CoA (and water) to become HMG-CoA.']
    ),
    learn('Five stages', ['The lecture divides the pathway into five stages (slide 7):'], {
      steps: [
        { label: '1. Acetyl-CoAs → HMG-CoA' },
        { label: '2. HMG-CoA → mevalonate' },
        { label: '3. Mevalonate → isopentenyl pyrophosphate', detail: 'CO₂ is lost.' },
        { label: '4. Isopentenyl pyrophosphate → squalene' },
        { label: '5. Squalene → cholesterol' },
      ],
      keyPoint: 'Stages 1–2 are in this lesson; stages 3–5 in the next.',
      sourceRefs: [...ref([7]), ...leh(816)],
    }),
    ask(
      order('c2-02', 'five-stages', 'Put the five stages of cholesterol synthesis in order.', [
        'Acetyl-CoAs → HMG-CoA',
        'HMG-CoA → mevalonate',
        'Mevalonate → isopentenyl pyrophosphate',
        'Isopentenyl pyrophosphate → squalene',
        'Squalene → cholesterol',
      ], { explanation: 'Slide 7 lists the five stages in this order.' })
    ),
    learn('Building HMG-CoA', [
      'Acetoacetyl-CoA + acetyl-CoA + H₂O → 3-hydroxy-3-methylglutaryl-CoA (HMG-CoA) (slide 8).',
      'So three acetyl-CoA units go into every HMG-CoA.',
    ], { sourceRefs: [...ref([8]), ...leh(817)] }),
    ask(
      fill('c2-03', 'hmg-coa-formation', 'HMG-CoA stands for 3-hydroxy-3-methyl____-CoA.', ['glutaryl'], {
        explanation: 'HMG-CoA = 3-hydroxy-3-methylglutaryl-CoA (slides 7 and 8).',
        skill: 'terminology',
      })
    ),
    ask(
      mcq('c2-04', 'hmg-coa-crossroads', 'Some HMG-CoA is made inside mitochondria. Following slide 8, what happens to it there?', 'A cleavage enzyme splits it into acetoacetate + acetyl-CoA', ['HMG-CoA reductase turns it into mevalonate', 'It is exported and becomes squalene', 'It is carboxylated to malonyl-CoA'], {
        explanation: 'Slide 8: in mitochondria, a cleavage enzyme gives acetoacetate + acetyl-CoA; the reductase that makes mevalonate works in the cytosol.',
        skill: 'prediction',
      }),
      ['Only the reductase route — outside the mitochondria — leads to cholesterol. Lehninger adds that the mitochondrial route is the one that makes ketone bodies.']
    ),
    learn('HMG-CoA reductase', [
      'HMG-CoA reductase (HMGR) reduces HMG-CoA to mevalonate, using two NADPH (slide 12).',
      'It is the key regulated step: the lecture calls HMGR the primary mechanism for regulating cholesterol (slide 14).',
    ], {
      keyPoint: 'HMG-CoA + 2 NADPH → mevalonate (HMG-CoA reductase).',
      sourceRefs: [...ref([12, 14]), ...leh(817)],
    }),
    ask(
      mcq('c2-05', 'hmg-coa-reductase-step', 'What does HMG-CoA reductase use to reduce one HMG-CoA?', '2 NADPH', ['2 NADH', '1 FADH₂', '3 ATP'], {
        explanation: 'Slide 12: “(2) NADPH” at HMG-CoA reductase. The 3 ATP are spent later, turning mevalonate into isopentenyl pyrophosphate.',
      })
    ),
    ask(
      tf({
        id: 'c2-06',
        conceptId: 'hmg-coa-reductase-step',
        statement: 'HMG-CoA reductase is the main point at which cholesterol synthesis is regulated.',
        answer: true,
        explanation: 'Slide 14: HMGR is the primary cholesterol-regulating mechanism (Lehninger: the committed, rate-limiting step).',
      })
    ),
    recall('r2-01', 'hmg-coa-crossroads', 'Describe the two fates of HMG-CoA and where each happens.', [
      'In mitochondria: a cleavage enzyme splits HMG-CoA into acetoacetate + acetyl-CoA.',
      'Outside the mitochondria (cytosol / ER): HMG-CoA reductase reduces it to mevalonate, using 2 NADPH.',
      'Only the reductase route leads on to cholesterol.',
    ]),
  ],

  // ─── Lesson 3 — Mevalonate to cholesterol ──────────────────────────
  'cholesterol-and-bile-biosynthesis-3': [
    ask(
      mcq('c3-01', 'mevalonate-to-ipp', 'Stage 3 turns mevalonate into isopentenyl pyrophosphate. What do you expect it to cost?', '3 ATP, with CO₂ released', ['2 NADPH', '1 ATP, with O₂ used', 'Nothing — it happens spontaneously'], {
        explanation: 'Slides 9 and 12: three ATP-driven steps; the last one also releases CO₂.',
        skill: 'prediction',
      }),
      ['Mevalonate → 5-phosphomevalonate → 5-pyrophosphomevalonate → IPP. Each step uses one ATP; CO₂ and Pi leave in the last.']
    ),
    learn('Stage 3 in three steps', ['Slide 9:'], {
      steps: [
        { label: 'Mevalonate → 5-phosphomevalonate', detail: 'ATP → ADP.' },
        { label: '5-Phosphomevalonate → 5-pyrophosphomevalonate', detail: 'ATP → ADP.' },
        { label: '5-Pyrophosphomevalonate → isopentenyl pyrophosphate', detail: 'ATP → ADP + Pi + CO₂.' },
      ],
      sourceRefs: [...ref([9, 12]), ...leh(817, 818)],
    }),
    ask(
      order('c3-02', 'mevalonate-to-ipp', 'Order the intermediates of stage 3.', [
        'Mevalonate',
        '5-Phosphomevalonate',
        '5-Pyrophosphomevalonate',
        'Isopentenyl pyrophosphate',
      ], { explanation: 'Slide 9: two phosphorylations, then the final step that releases CO₂.' })
    ),
    learn('Joining isoprene units', [
      'Slide 10: an allylic substrate (a pyrophosphate ester) loses its pyrophosphate (PPi), leaving a positively charged carbon. Isopentenyl pyrophosphate attacks it and joins on — a “condensation carbonium ion” — which becomes geranyl (or farnesyl) pyrophosphate.',
      'Each round adds one IPP unit and releases PPi: geranyl pyrophosphate → farnesyl pyrophosphate → on to squalene.',
    ], { sourceRefs: [...ref([10, 12]), ...leh(818)] }),
    ask(
      mcq('c3-03', 'prenyl-condensation', 'In each chain-building step (slide 10), what leaves the allylic substrate before IPP joins on?', 'Pyrophosphate (PPi)', ['CO₂', 'Water', 'Coenzyme A'], {
        explanation: 'The allylic pyrophosphate loses PPi, leaving a positively charged carbon that IPP attacks.',
      })
    ),
    learn('From squalene to cholesterol', [
      'Squalene is linear and has 30 carbons (slide 11). It folds and closes up into the four rings of the steroid nucleus.',
      'The summary (slide 12) shows the order: squalene → lanosterol → (several steps) → cholesterol.',
    ], {
      keyPoint: 'IPP → geranyl PP → farnesyl PP → squalene → lanosterol → cholesterol.',
      sourceRefs: [...ref([11, 12]), ...leh(819, 820)],
    }),
    ask(
      order('c3-04', 'squalene-to-cholesterol', 'Put these in order, from IPP to cholesterol.', [
        'Isopentenyl pyrophosphate',
        'Geranyl pyrophosphate',
        'Farnesyl pyrophosphate',
        'Squalene',
        'Lanosterol',
        'Cholesterol',
      ], { explanation: 'Slide 12 shows this sequence.' })
    ),
    ask(
      fill('c3-05', 'squalene-to-cholesterol', 'Squalene is a linear molecule with ____ carbon atoms.', ['30', 'thirty', 'C30'], {
        explanation: 'Slide 11 labels it squalene (C₃₀).',
      })
    ),
    learn('Branches off the pathway', ['Slide 12 shows that the pathway makes more than cholesterol:'], {
      terms: [
        { term: 'Geranyl and farnesyl pyrophosphate', meaning: '→ prenylated proteins.' },
        { term: 'Farnesyl pyrophosphate', meaning: '→ heme a, dolichol, ubiquinone.' },
        { term: 'Cholesterol', meaning: '→ bile salts (liver) and steroids (endocrine glands).' },
      ],
      sourceRefs: ref([12]),
    }),
    ask(
      multi('c3-06', 'pathway-branches', 'Which products branch off from farnesyl pyrophosphate on slide 12? Select all that apply.', ['Heme a', 'Dolichol', 'Ubiquinone', 'Prenylated proteins'], ['Bile salts', 'Steroids'], {
        explanation: 'Farnesyl pyrophosphate feeds heme a, dolichol, ubiquinone and prenylated proteins. Bile salts and steroids are made from cholesterol itself.',
      })
    ),
    recall('r3-01', 'squalene-to-cholesterol', 'From mevalonate to cholesterol: list the main intermediates in order.', [
      'Mevalonate → 5-phosphomevalonate → 5-pyrophosphomevalonate (one ATP each).',
      '→ isopentenyl pyrophosphate (a third ATP; CO₂ lost).',
      '→ geranyl pyrophosphate → farnesyl pyrophosphate (PPi released at each condensation).',
      '→ squalene (C₃₀) → lanosterol → cholesterol.',
    ]),
  ],

  // ─── Lesson 4 — Regulation ─────────────────────────────────────────
  'cholesterol-and-bile-biosynthesis-4': [
    ask(
      mcq('c4-01', 'hmgr-phosphorylation', 'Many enzymes are switched on or off by phosphorylation. Which form of HMGR do you expect is MORE active?', 'The dephosphorylated (unmodified) form', ['The phosphorylated form', 'Both are equally active', 'Neither — phosphorylation does not affect HMGR'], {
        explanation: 'Slides 14 and 16: HMGR is most active unmodified; phosphorylation decreases its activity.',
        skill: 'prediction',
      }),
      ['So any signal that keeps HMGR phosphorylated slows cholesterol synthesis.']
    ),
    learn('Keeping the supply steady', ['Slide 13 lists how a cell keeps its cholesterol supply steady:'], {
      steps: [
        { label: 'HMGR activity and levels' },
        { label: 'ACAT', detail: 'Handles excess intracellular free cholesterol.' },
        { label: 'LDL receptor uptake and HDL reverse transport', detail: 'Regulate plasma cholesterol.' },
        { label: 'Utilisation of cholesterol' },
        { label: 'Cellular sterol content' },
      ],
      sourceRefs: [...ref([13]), ...leh(826)],
    }),
    ask(
      mcq('c4-02', 'supply-mechanisms', 'Which enzyme deals with excess intracellular FREE cholesterol?', 'ACAT (acyl-CoA:cholesterol acyltransferase)', ['HMG-CoA reductase', '7α-Hydroxylase', 'AMP-activated protein kinase'], {
        explanation: 'Slide 13: excess intracellular free cholesterol is regulated through ACAT. (Lehninger: ACAT esterifies cholesterol for storage.)',
      })
    ),
    learn('Four controls on HMGR', ['Slide 14: HMGR is controlled in four distinct ways.'], {
      terms: [
        { term: 'Feedback inhibition', meaning: 'Cholesterol inhibits existing HMGR.' },
        { term: 'Gene expression', meaning: 'How much new HMGR is made.' },
        { term: 'Degradation', meaning: 'How fast HMGR is destroyed.' },
        { term: 'Phosphorylation–dephosphorylation', meaning: 'Switches HMGR off and on.' },
      ],
      sourceRefs: ref([14]),
    }),
    ask(
      multi('c4-03', 'hmgr-controls', 'Which are the four ways HMGR is controlled (slide 14)? Select all that apply.', ['Feedback inhibition', 'Control of gene expression', 'Rate of enzyme degradation', 'Phosphorylation–dephosphorylation'], ['Allosteric activation by citrate', 'Activation by cleavage of a zymogen'], {
        explanation: 'Slide 14 lists exactly these four. Citrate activation belongs to acetyl-CoA carboxylase (fatty acid synthesis), not HMGR.',
      })
    ),
    learn('Cholesterol and sterols destroy HMGR', [
      'Cholesterol triggers polyubiquitination of HMGR, which is then degraded in the proteasome (slide 14).',
      'High flux through the mevalonate pathway speeds HMGR degradation; low flux slows it — easy to see with a statin (slide 15). HMGR’s sterol-sensing domain (SSD) makes it degrade faster as sterols rise.',
    ], { sourceRefs: [...ref([14, 15]), ...leh(827)] }),
    ask(
      mcq('c4-04', 'flux-ssd-statins', 'A statin lowers the flux through the mevalonate pathway. Following slide 15, what happens to the rate of HMGR degradation?', 'It decreases', ['It increases', 'It stays exactly the same', 'Degradation stops and HMGR is phosphorylated instead'], {
        explanation: 'Slide 15: when flux is low, HMGR degradation decreases — easily observed with a statin.',
        skill: 'cause-effect',
      })
    ),
    learn('The phosphorylation switch', [
      'AMP-activated protein kinase (AMPK) phosphorylates HMGR, switching it off. AMPK itself is switched on when AMPK kinase (AMPKK) phosphorylates it (slide 16).',
      'Slide 17 adds two phosphatases: HMG-CoA reductase phosphatase switches HMGR back on; protein phosphatase 2C switches AMPK off.',
    ], { sourceRefs: [...ref([16, 17]), ...leh(826)] }),
    ask(
      match('c4-05', 'hmgr-phosphorylation', 'Match each enzyme to what it does (slide 17).', [
        ['AMPK kinase (AMPKK)', 'Phosphorylates and activates AMPK'],
        ['AMPK', 'Phosphorylates and inactivates HMGR'],
        ['HMG-CoA reductase phosphatase', 'Dephosphorylates and reactivates HMGR'],
        ['Protein phosphatase 2C', 'Dephosphorylates and inactivates AMPK'],
      ], { explanation: 'Slide 17 shows the two kinases and the two phosphatases.' })
    ),
    learn('Hormones', [
      'Glucagon and epinephrine reduce cholesterol synthesis; insulin increases it (slide 16).',
      'Slide 17 shows the inhibitory route: cAMP activates PKA → PKA phosphorylates PPI-1 into its active form → active PPI-1 blocks the phosphatases → HMGR stays phosphorylated (off). Insulin stimulates removal of the phosphates (on).',
    ], { sourceRefs: [...ref([16, 17]), ...leh(826)] }),
    ask(
      mcq('c4-06', 'hormonal-control', 'What does insulin do to HMGR?', 'Stimulates removal of its phosphate, activating it', ['Phosphorylates it through PKA, inactivating it', 'Triggers its polyubiquitination', 'Converts it into acetoacetyl-CoA'], {
        explanation: 'Slide 16: insulin stimulates the removal of phosphates and thereby activates HMGR.',
      })
    ),
    ask(
      mcq('c4-07', 'hormonal-control', 'Glucagon raises the activity of PPI-1. Why does that switch HMGR off?', 'Active PPI-1 blocks the phosphatase that would remove HMGR’s phosphate', ['PPI-1 phosphorylates HMGR directly', 'PPI-1 sends HMGR to the proteasome', 'PPI-1 activates protein phosphatase 2C'], {
        explanation: 'Slide 17: PKA-phosphorylated PPI-1(a) inhibits HMG-CoA reductase phosphatase (and protein phosphatase 2C), so HMGR stays phosphorylated and inactive.',
        skill: 'pathway-reasoning',
        difficulty: 'advanced',
      })
    ),
    recall('r4-01', 'hormonal-control', 'Explain how glucagon/epinephrine and insulin have opposite effects on HMGR.', [
      'HMGR is active when dephosphorylated and inactive when phosphorylated (AMPK adds the phosphate).',
      'Glucagon/epinephrine: cAMP → PKA → PPI-1 activated → phosphatases blocked → HMGR stays phosphorylated → synthesis falls.',
      'Insulin: stimulates removal of the phosphates → HMGR active → synthesis rises.',
    ]),
  ],

  // ─── Lesson 5 — Bile acids ─────────────────────────────────────────
  'cholesterol-and-bile-biosynthesis-5': [
    ask(
      mcq('c5-01', 'bile-acid-functions', 'Before you start: what does the lecture call the ONLY significant way the body eliminates excess cholesterol?', 'Making bile acids and excreting them in the faeces', ['Oxidising it to CO₂ for energy', 'Breathing it out through the lungs', 'Excreting it unchanged in the urine'], {
        explanation: 'Slide 20: bile acid synthesis and subsequent excretion in the faeces is the only significant mechanism for eliminating excess cholesterol.',
        skill: 'prediction',
      }),
      ['That is one of four functions of bile acids. The other three keep cholesterol dissolved and help digest and absorb fat.']
    ),
    learn('The first step: 7α-hydroxylase', [
      'In the liver, cholesterol becomes bile salts (slide 12). The first step (slide 18): 7α-hydroxylase converts cholesterol to 7-hydroxycholesterol, using NADPH + H⁺ and O₂.',
    ], { sourceRefs: ref([12, 18]) }),
    ask(
      mcq('c5-02', 'bile-acid-synthesis', 'Which enzyme starts bile acid synthesis from cholesterol?', '7α-Hydroxylase', ['HMG-CoA reductase', 'ACAT', 'Malic enzyme'], {
        explanation: 'Slide 18: 7α-hydroxylase converts cholesterol to 7-hydroxycholesterol, using NADPH + H⁺ and O₂.',
      })
    ),
    ask(
      multi('c5-03', 'bile-acid-synthesis', 'What does the 7α-hydroxylase step use? Select all that apply.', ['NADPH + H⁺', 'O₂'], ['ATP', 'CoA-SH', 'NAD⁺'], {
        explanation: 'Slide 18: NADPH + H⁺ and O₂ (NADP⁺ is formed). CoA-SH is used later, on the way to cholyl-CoA and chenodeoxycholyl-CoA.',
      })
    ),
    learn('Two bile acid–CoA products', [
      'From 7-hydroxycholesterol, further steps (using NADPH + H⁺, O₂ and 2 CoA-SH) give cholyl-CoA — with three –OH groups — or chenodeoxycholyl-CoA — with two (slide 18).',
      'Both routes shorten the side chain, releasing propionyl-CoA, and end as a CoA thioester.',
    ], { sourceRefs: ref([18]) }),
    ask(
      mcq('c5-04', 'bile-acid-synthesis', 'On the way from 7-hydroxycholesterol to cholyl-CoA, which molecule is RELEASED?', 'Propionyl-CoA', ['Acetyl-CoA', 'Malonyl-CoA', 'Succinyl-CoA'], {
        explanation: 'Slide 18: both routes release propionyl-CoA as the side chain is shortened.',
      })
    ),
    learn('Conjugation', ['Slide 19 shows two conjugated bile acids, each joined through a –CO–NH– link:'], {
      terms: [
        { term: 'Glycocholic acid', meaning: 'Carries glycine: the side chain ends –NH–CH₂–COOH.' },
        { term: 'Taurocholic acid', meaning: 'Carries taurine: the side chain ends –NH–(CH₂)₂–SO₃H.' },
      ],
      sourceRefs: ref([19]),
    }),
    ask(
      match('c5-05', 'bile-acid-conjugation', 'Match each bile acid to its feature (slides 18–19).', [
        ['Glycocholic acid', 'Glycine attached (–COOH end)'],
        ['Taurocholic acid', 'Taurine attached (–SO₃H end)'],
        ['Cholyl-CoA', 'Three –OH groups'],
        ['Chenodeoxycholyl-CoA', 'Two –OH groups'],
      ], { explanation: 'Slide 18 shows the two CoA products; slide 19 the glycine and taurine conjugates.' })
    ),
    learn('Four functions', ['Slide 20 — bile acids:'], {
      steps: [
        { label: 'Eliminate excess cholesterol', detail: 'Synthesis + faecal excretion: the only significant route.' },
        { label: 'Keep cholesterol dissolved in bile', detail: 'With phospholipids — preventing precipitation in the gall bladder.' },
        { label: 'Emulsify dietary triacylglycerols', detail: 'Making them accessible to pancreatic lipases.' },
        { label: 'Help absorb fat-soluble vitamins' },
      ],
      sourceRefs: ref([20]),
    }),
    ask(
      multi('c5-06', 'bile-acid-functions', 'Which are functions of bile acids listed in the lecture? Select all that apply.', ['Eliminating excess cholesterol', 'Keeping cholesterol dissolved in bile', 'Emulsifying dietary fats for pancreatic lipases', 'Helping absorb fat-soluble vitamins'], ['Digesting proteins in the stomach', 'Carrying oxygen in the blood'], {
        explanation: 'Slide 20 lists these four physiologically significant functions.',
      })
    ),
    recall('r5-01', 'bile-acid-functions', 'List the four functions of bile acids.', [
      'Their synthesis and faecal excretion is the only significant way to eliminate excess cholesterol.',
      'With phospholipids, they keep cholesterol dissolved in bile — preventing precipitation in the gall bladder.',
      'They emulsify dietary triacylglycerols, giving pancreatic lipases access.',
      'They help the intestine absorb fat-soluble vitamins.',
    ]),
  ],
};

export const readingExtras: Record<
  string,
  { highYield: string[]; confusions: LessonConfusion[]; estimatedMinutes: number; xp: number }
> = {
  'cholesterol-and-bile-biosynthesis-1': {
    estimatedMinutes: 9,
    xp: 20,
    highYield: [
      'Steroid nucleus = cyclopentanoperhydrophenanthrene (rings A–D) — not benzene.',
      'Cholesterol: –OH at C-3, double bond C-5=C-6, side chain at C-17.',
      'Every carbon comes from acetate (acetyl-CoA).',
      'Pyruvate–Malate cycle: cytosolic acetyl-CoA (ATP-citrate lyase) + NADPH (malic enzyme).',
    ],
    confusions: [
      { confusion: 'Cholesterol contains benzene rings.', clarification: 'Its nucleus is cyclopentanoperhydrophenanthrene. Animals cannot synthesise a benzene ring.' },
      { confusion: 'Acetyl-CoA leaves the mitochondrion as acetyl-CoA.', clarification: 'It leaves as citrate; ATP-citrate lyase releases acetyl-CoA in the cytosol.' },
      { confusion: 'Malate dehydrogenase makes the NADPH.', clarification: 'Malic enzyme makes NADPH; malate dehydrogenase uses NADH.' },
    ],
  },
  'cholesterol-and-bile-biosynthesis-2': {
    estimatedMinutes: 8,
    xp: 25,
    highYield: [
      'HMG-CoA = 3-hydroxy-3-methylglutaryl-CoA: acetoacetyl-CoA + acetyl-CoA + H₂O.',
      'HMG-CoA reductase (2 NADPH) → mevalonate: the key regulated step.',
      'In mitochondria, HMG-CoA is cleaved to acetoacetate + acetyl-CoA instead.',
    ],
    confusions: [
      { confusion: 'All HMG-CoA ends up as cholesterol.', clarification: 'In mitochondria it is cleaved to acetoacetate + acetyl-CoA; only the reductase route leads to mevalonate.' },
      { confusion: 'HMG-CoA reductase uses NADH or ATP.', clarification: 'It uses NADPH — two per HMG-CoA. ATP is spent in stage 3.' },
      { confusion: 'Mevalonate is made straight from acetoacetyl-CoA.', clarification: 'Acetoacetyl-CoA first gains a third acetyl-CoA to become HMG-CoA, which is then reduced.' },
    ],
  },
  'cholesterol-and-bile-biosynthesis-3': {
    estimatedMinutes: 9,
    xp: 25,
    highYield: [
      'Mevalonate → IPP: 3 ATP, CO₂ lost in the last step.',
      'IPP → geranyl PP → farnesyl PP → squalene (C₃₀) → lanosterol → cholesterol.',
      'Farnesyl PP feeds heme a, dolichol, ubiquinone and prenylated proteins.',
    ],
    confusions: [
      { confusion: 'Lanosterol comes before squalene.', clarification: 'Linear squalene (C₃₀) closes into lanosterol, which is then converted to cholesterol.' },
      { confusion: 'The pathway only makes cholesterol.', clarification: 'Farnesyl and geranyl pyrophosphate also feed heme a, dolichol, ubiquinone and protein prenylation.' },
      { confusion: 'The CO₂ is lost when HMG-CoA is reduced.', clarification: 'CO₂ leaves at 5-pyrophosphomevalonate → isopentenyl pyrophosphate (stage 3).' },
    ],
  },
  'cholesterol-and-bile-biosynthesis-4': {
    estimatedMinutes: 11,
    xp: 30,
    highYield: [
      'HMGR controls: feedback inhibition, gene expression, degradation, phosphorylation.',
      'Phosphorylated HMGR (by AMPK) is inactive; dephosphorylated HMGR is active.',
      'Insulin activates HMGR; glucagon and epinephrine inhibit it (cAMP → PKA → PPI-1).',
      'Sterols ↑ or flux ↑ → HMGR degraded faster (sterol-sensing domain; polyubiquitination → proteasome).',
    ],
    confusions: [
      { confusion: 'Phosphorylation activates HMGR.', clarification: 'It inactivates HMGR; the enzyme is most active dephosphorylated.' },
      { confusion: 'AMPK is switched on by removing its phosphate.', clarification: 'AMPKK phosphorylates AMPK to activate it; protein phosphatase 2C inactivates it.' },
      { confusion: 'PPI-1 is a phosphatase.', clarification: 'PPI-1 is an inhibitor OF phosphatases. Activated by PKA, it keeps HMGR phosphorylated (off).' },
      { confusion: 'More flux through the pathway means more HMGR.', clarification: 'High flux speeds HMGR degradation; low flux (e.g. with a statin) slows it.' },
    ],
  },
  'cholesterol-and-bile-biosynthesis-5': {
    estimatedMinutes: 8,
    xp: 25,
    highYield: [
      '7α-Hydroxylase (NADPH, O₂): cholesterol → 7-hydroxycholesterol, the first step.',
      'Cholyl-CoA (3 –OH) and chenodeoxycholyl-CoA (2 –OH); propionyl-CoA released.',
      'Glycocholic = glycine (–COOH); taurocholic = taurine (–SO₃H).',
      'Bile acid synthesis + faecal excretion = the only significant way to eliminate excess cholesterol.',
    ],
    confusions: [
      { confusion: 'Bile acids digest fat themselves.', clarification: 'They emulsify fat so pancreatic lipases can digest it.' },
      { confusion: 'Taurocholic acid carries glycine.', clarification: 'Tauro- = taurine (–SO₃H end); glyco- = glycine (–COOH end).' },
      { confusion: 'Bile acids only matter for digestion.', clarification: 'They are also the main route for eliminating excess cholesterol and keep biliary cholesterol from precipitating.' },
    ],
  },
};
