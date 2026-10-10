// Biochemistry → Oxygen Carriers: layer 1 (learn by answering) and
// reading-layer extras for the four lessons.
//
// Every checkpoint asks BEFORE it explains. Facts come from the lecture
// deck and its figures (written out in ./sources.ts). Unsettled points
// (see `discrepancies`) are never asked.
// Checkpoint IDs: cN-xx; recall prompts: rN-xx.
import type { LessonConfusion } from '@/data/lesson-types';
import { ask, fill, learn, match, mcq, multi, order, recall, tf, type InteractiveDraft } from '@/data/topics/build';
import { ref, type ConceptId } from '@/data/topics/oxygen-carriers/sources';

type Steps = InteractiveDraft<ConceptId>[];

export const interactive: Record<string, Steps> = {
  // ─── Lesson 1 — Myoglobin: roles, haem iron, structure ─────────────
  'oxygen-carriers-1': [
    ask(
      mcq('c1-01', 'carrier-roles', 'Before you start: what is myoglobin’s job in red muscle?', 'A reserve supply of oxygen that also helps O₂ move within the muscle', ['Carrying oxygen in the blood', 'Carrying CO₂ to the lungs', 'Making haem for the muscle'], {
        explanation: 'Slide 2: myoglobin serves as a reserve supply of oxygen and facilitates the movement of oxygen within red muscle.',
        skill: 'prediction',
      }),
      ['Haemoglobin carries O₂ in the blood; myoglobin holds a store of it inside muscle. Both bind O₂ through their haem group.']
    ),
    learn('The haem iron', [
      'The iron binds the four central nitrogens of the ring, and can make two more bonds — the fifth and sixth coordination positions, one on each side of the haem plane.',
      'Fe²⁺: ferrohaemoglobin / ferromyoglobin — binds O₂. Fe³⁺: ferrihaemoglobin (methaemoglobin) / ferrimyoglobin — does not.',
    ], { sourceRefs: ref([4, 5, 6]) }),
    ask(
      fill('c1-02', 'haem-iron', 'Haemoglobin with its iron in the +3 state is called ferrihaemoglobin or ____.', ['methaemoglobin', 'methemoglobin'], {
        explanation: 'Slide 6: in the +3 state it is ferrihaemoglobin or methaemoglobin; only ferrohaemoglobin binds oxygen.',
        skill: 'terminology',
      })
    ),
    learn('A compact, helical protein', [
      'Myoglobin is about 75% α-helix, in eight helices labelled A–H. Residues are named by position: A1, A2… The seven non-helical segments between helices are named by both helices (e.g. CD); the ends are NA1–NA2 and HC1–HC5.',
    ], { sourceRefs: ref([7, 8]) }),
    ask(
      mcq('c1-03', 'myoglobin-shape', 'A non-helical residue lies between helices E and F. How would it be named?', 'EF (e.g. EF1)', ['E8', 'FE1', 'NA1'], {
        explanation: 'Slide 8: non-helical segments between helices are named after both helices — e.g. CD between C and D.',
        skill: 'application',
      })
    ),
    learn('What ends a helix', [
      'Proline’s bulky ring does not fit inside an α-helix unless proline is at one end. But myoglobin has only four prolines for eight helix ends — other interactions, such as a serine or threonine –OH bonding a main-chain carbonyl, also end helices.',
    ], { sourceRefs: ref([10, 11, 12]) }),
    ask(
      tf({
        id: 'c1-04',
        conceptId: 'helix-termination',
        statement: 'Every α-helix in myoglobin ends at a proline.',
        answer: false,
        explanation: 'Slide 12: there are four prolines but eight helix terminations, so other factors must also end helices.',
        skill: 'misconception',
      })
    ),
    learn('Inside vs outside', [
      'The interior is almost entirely nonpolar (Leu, Val, Met, Phe). Glu, Asp, Gln, Asn, Lys and Arg side chains are never inside. Thr, Tyr and Trp point their nonpolar parts inward. The only polar residues inside are two histidines at the active site.',
    ], { sourceRefs: ref([13, 14, 16]) }),
    ask(
      multi('c1-05', 'residue-distribution', 'Which side chains are NOT found in the interior of myoglobin? Select all that apply.', ['Glutamate', 'Lysine', 'Arginine'], ['Leucine', 'Valine'], {
        explanation: 'Slide 13: the interior is nonpolar (leucine, valine, methionine, phenylalanine); glutamate, aspartate, glutamine, asparagine, lysine and arginine are not found inside.',
      })
    ),
    recall('r1-01', 'residue-distribution', 'Describe how amino acids are distributed in myoglobin.', [
      'The interior is almost entirely nonpolar (e.g. leucine, valine, methionine, phenylalanine).',
      'Charged and amide side chains (Glu, Asp, Gln, Asn, Lys, Arg) are not inside; Thr, Tyr and Trp point their nonpolar part inward.',
      'The only polar residues inside are two histidines, which work at the active site.',
    ]),
  ],

  // ─── Lesson 2 — The active site ────────────────────────────────────
  'oxygen-carriers-2': [
    ask(
      mcq('c2-01', 'proximal-distal-histidine', 'Which histidine is directly bonded to the haem iron?', 'Histidine F8 — the proximal histidine', ['Histidine E7 — the distal histidine', 'Both histidines equally', 'Neither — the iron binds only the ring'], {
        explanation: 'Slide 17: the iron is bonded to histidine F8 at the fifth coordination position; histidine E7 is nearby but not bonded.',
        skill: 'prediction',
      }),
      ['O₂ binds on the opposite side of the haem, at the sixth coordination position, next to the distal histidine E7.']
    ),
    learn('Keeping the iron ferrous', [
      'Free haem binds O₂ only briefly: a haem–O₂–haem sandwich forms and the iron is oxidised to methaem, which cannot bind O₂.',
      'In myoglobin the distal histidine and its neighbours block that sandwich, preventing oxidation and keeping the iron ferrous — so O₂ can bind reversibly for long periods.',
    ], { sourceRefs: ref([18, 19, 20]) }),
    ask(
      order('c2-02', 'preventing-oxidation', 'Order what happens to free haem in water.', [
        'Haem binds O₂ briefly',
        'A haem–O₂–haem complex forms',
        'The iron is oxidised to methaem',
        'Methaem can no longer bind O₂',
      ], { explanation: 'Slide 18.' })
    ),
    learn('Why CO binds less tightly', [
      'Free haem binds CO 25,000 times more strongly than O₂, with Fe, C and O in a straight line. In myoglobin and haemoglobin the distal histidine forces CO to bind bent (strained), so the preference drops to about 200 times.',
    ], { sourceRefs: ref([21, 22, 23]) }),
    ask(
      mcq('c2-03', 'co-binding', 'How many times more strongly does CO bind than O₂ to haem inside myoglobin or haemoglobin?', 'About 200 times', ['About 25,000 times', 'About 2 times', 'CO cannot bind at all'], {
        explanation: 'Slide 21: free haem favours CO 25,000-fold, but with the polypeptide present only about 200-fold.',
      })
    ),
    ask(
      mcq('c2-04', 'co-binding', 'Why does the protein reduce haem’s affinity for CO?', 'The distal histidine prevents CO binding in a straight line, so it binds bent (strained)', ['The proximal histidine blocks the sixth position', 'The iron is oxidised to Fe³⁺', 'CO binds the propionate side chains instead'], {
        explanation: 'Slides 22–23: free haem binds CO linearly; in the proteins the distal histidine forces a bent, strained geometry.',
        skill: 'cause-effect',
      })
    ),
    learn('Conserved residues', ['Nine positions are the same in the haemoglobins of almost all species studied. Several sit at the oxygen site.'], {
      terms: [
        { term: 'F8 His / E7 His', meaning: 'Proximal and distal histidines.' },
        { term: 'CD1 Phe, F4 Leu', meaning: 'Haem contacts.' },
        { term: 'B6 Gly', meaning: 'Lets helices B and E come close.' },
        { term: 'C2 Pro / HC2 Tyr', meaning: 'Helix termination / cross-links helices H and F.' },
      ],
      sourceRefs: ref([26, 27, 28]),
    }),
    ask(
      match('c2-05', 'conserved-residues', 'Match each conserved residue to its role.', [
        ['F8 histidine', 'Proximal haem-linked histidine'],
        ['B6 glycine', 'Allows the B and E helices to approach closely'],
        ['C2 proline', 'Helix termination'],
        ['HC2 tyrosine', 'Cross-links the H and F helices'],
      ], { explanation: 'Slides 28–29 (Table: conserved amino acid residues in haemoglobin).' })
    ),
    recall('r2-01', 'preventing-oxidation', 'Explain why haem needs its polypeptide chain to carry oxygen.', [
      'Free haem binds O₂ only briefly: a haem–O₂–haem complex forms and the iron is oxidised to methaem, which cannot bind O₂.',
      'In the protein, the distal histidine (E7) and neighbouring residues block that sandwich, preventing oxidation and keeping the iron ferrous.',
      'The hindered pocket also makes CO bind bent, cutting its advantage over O₂ from ~25,000× to ~200×.',
    ]),
  ],

  // ─── Lesson 3 — Haemoglobin structure, allostery, cooperativity ────
  'oxygen-carriers-3': [
    ask(
      mcq('c3-01', 'haemoglobin-structure', 'What is the subunit composition of normal adult haemoglobin A?', 'α₂β₂', ['α₄', 'α₂γ₂', 'A single chain, like myoglobin'], {
        explanation: 'Slide 24: haemoglobin A (α₂β₂) — four polypeptide chains.',
        skill: 'prediction',
      })
    ),
    learn('Allostery', [
      'An allosteric interaction links two separate sites on a protein. H⁺, CO₂ and 2,3-DPG bind haemoglobin far from the haems but change their oxygen affinity.',
    ], { sourceRefs: ref([30, 31]) }),
    ask(
      multi('c3-02', 'allostery', 'Which regulate haemoglobin’s oxygen binding by binding away from the haems? Select all that apply.', ['H⁺', 'CO₂', '2,3-DPG'], ['Glucose', 'Albumin'], {
        explanation: 'Slide 30: O₂ binding is regulated by H⁺, CO₂ and organic phosphates such as 2,3-DPG.',
      })
    ),
    learn('T and R', [
      'Deoxyhaemoglobin is the taut (T) form: bonds and salt links between subunits are intact. Oxygenation breaks them, giving the relaxed (R) form. The change happens at the α₁β₂ interface — the functional contact — while α₁β₁ stays fixed.',
    ], { sourceRefs: ref([32, 33, 34]) }),
    ask(
      mcq('c3-03', 't-r-switch', 'Which subunit contact changes most when haemoglobin is oxygenated?', 'α₁β₂ — the functional contact', ['α₁β₁ — the stabilising contact', 'α₁α₂', 'None — the subunits do not move'], {
        explanation: 'Slide 32: α₁β₂ is closely connected to the haems and large structural changes take place there on oxygenation; α₁β₁ is relatively fixed.',
      })
    ),
    learn('The dissociation curve', [
      'Myoglobin: hyperbolic, left, P50 ≈ 1 torr, non-co-operative. Haemoglobin: sigmoid, right, P50 = 26 torr, co-operative. Haemoglobin’s P50 lies between muscle capillaries (~20 torr) and the alveoli (~100 torr).',
    ], { sourceRefs: ref([36, 37, 38]) }),
    ask(
      mcq('c3-04', 'dissociation-curve', 'What shape is haemoglobin’s oxygen dissociation curve?', 'Sigmoid', ['Hyperbolic', 'Linear', 'Bell-shaped'], {
        explanation: 'Slide 37: haemoglobin’s curve is sigmoid (co-operative); myoglobin’s is hyperbolic.',
      })
    ),
    ask(
      mcq('c3-05', 'dissociation-curve', 'At a pO₂ of 20 torr, which protein is more saturated with oxygen?', 'Myoglobin', ['Haemoglobin', 'Both are equally saturated', 'Neither binds any oxygen'], {
        explanation: 'Slide 37: at any pO₂ apart from 0, myoglobin is more saturated than haemoglobin.',
        skill: 'application',
      })
    ),
    recall('r3-01', 'mb-vs-hb-binding', 'List the differences between oxygen binding by myoglobin and haemoglobin.', [
      'Haemoglobin binds O₂ co-operatively (sigmoid curve); myoglobin does not (hyperbolic curve).',
      'Haemoglobin’s O₂ binding depends on pH and pCO₂ and is regulated by 2,3-DPG; myoglobin’s is not.',
      'Myoglobin has a higher affinity (P50 ≈ 1 torr vs 26 torr for haemoglobin).',
    ]),
  ],

  // ─── Lesson 4 — Bohr effect, BPG, fetal Hb ─────────────────────────
  'oxygen-carriers-4': [
    ask(
      mcq('c4-01', 'bohr-effect', 'Active muscle produces acid and CO₂. What do you expect this to do to haemoglobin’s oxygen affinity there?', 'Lower it, so more O₂ is released', ['Raise it, so less O₂ is released', 'Nothing', 'Lower myoglobin’s affinity only'], {
        explanation: 'Slides 39–40: lower pH and higher pCO₂ shift the ODC right — lower affinity, more O₂ unloaded.',
        skill: 'prediction',
      }),
      ['In the lungs the opposite happens: pH rises and pCO₂ falls, the curve shifts left, and O₂ is loaded.']
    ),
    learn('The Bohr–Haldane effect', [
      'Tissues: lower pH, higher pCO₂ → curve right → O₂ released. Lungs: higher pH, lower pCO₂ → curve left → O₂ loaded. Myoglobin is not affected by pH or pCO₂.',
      'The Bohr protons are carried by residues that bind H⁺ at the tissues and release it in the lungs.',
    ], { sourceRefs: ref([39, 40, 41, 43]) }),
    ask(
      tf({
        id: 'c4-02',
        conceptId: 'bohr-effect',
        statement: 'A rise in pCO₂ shifts haemoglobin’s oxygen dissociation curve to the left.',
        answer: false,
        explanation: 'Slide 39: an increase in pCO₂ has the same effect as lowering the pH — a shift to the RIGHT (lower affinity).',
        skill: 'misconception',
      })
    ),
    learn('2,3-BPG', [
      'One 2,3-BPG binds in the central cavity of deoxyhaemoglobin, held by three positive groups on each β chain. It cross-links the β chains and stabilises the T state — so it lowers O₂ affinity. P50 rises from 1 torr without BPG to 26 torr with it.',
    ], { sourceRefs: ref([47, 51, 52]) }),
    ask(
      mcq('c4-03', 'bpg-binding', 'Which form of haemoglobin does 2,3-BPG bind?', 'Deoxyhaemoglobin (T state)', ['Oxyhaemoglobin (R state)', 'Both equally', 'Free α chains only'], {
        explanation: 'Slides 51 and 54: BPG stabilises the deoxy quaternary structure by cross-linking the β chains; it does not bind oxyhaemoglobin.',
      })
    ),
    ask(
      mcq('c4-04', 'bpg-p50', 'Without 2,3-BPG, what would haemoglobin do in capillaries where pO₂ is about 26 torr?', 'Stay fully saturated and fail to unload O₂', ['Unload all its O₂', 'Unload half its O₂', 'Bind CO instead'], {
        explanation: 'Slides 52–54: without BPG, P50 is 1 torr, so at 26 torr SO₂ is about 1.0 — no unloading. With BPG, SO₂ is 0.5.',
        skill: 'cause-effect',
        difficulty: 'advanced',
      })
    ),
    learn('Fetal haemoglobin', [
      'HbF (α₂γ₂) has serine instead of histidine at H21. With fewer positive charges in the cavity it binds 2,3-BPG less strongly, so its O₂ affinity is higher than HbA’s — oxygen passes from mother to fetus.',
    ], { sourceRefs: ref([56, 57, 58]) }),
    ask(
      mcq('c4-05', 'fetal-haemoglobin', 'Why does fetal haemoglobin bind oxygen more tightly than adult haemoglobin?', 'It binds 2,3-BPG less strongly (Ser instead of His at H21)', ['It has no haem', 'It binds 2,3-BPG more strongly', 'It is a monomer like myoglobin'], {
        explanation: 'Slide 57.',
        skill: 'cause-effect',
      })
    ),
    recall('r4-01', 'bpg-p50', 'Explain why 2,3-BPG is essential for delivering oxygen to the tissues.', [
      'BPG binds deoxyhaemoglobin in the central cavity, cross-linking the β chains and stabilising the T state.',
      'It raises P50 from 1 torr to 26 torr (a 26-fold lower affinity).',
      'Capillary pO₂ is about 26 torr: without BPG haemoglobin would stay saturated; with BPG it is half saturated, so it unloads O₂.',
    ]),
  ],
};

export const readingExtras: Record<
  string,
  { highYield: string[]; confusions: LessonConfusion[]; estimatedMinutes: number; xp: number }
> = {
  'oxygen-carriers-1': {
    estimatedMinutes: 10,
    xp: 25,
    highYield: [
      'Myoglobin: O₂ reserve in red muscle; both carriers bind O₂ through haem.',
      'Iron: 4 ring N + 5th and 6th positions; only Fe²⁺ binds O₂ (Fe³⁺ = methaemoglobin).',
      'Myoglobin: ~75% α-helix, helices A–H; nonpolar interior; two interior histidines.',
    ],
    confusions: [
      { confusion: 'Every helix ends at a proline.', clarification: 'Four prolines, eight terminations — other interactions (e.g. Ser/Thr –OH with C=O) also end helices.' },
      { confusion: 'Charged residues line the inside of myoglobin.', clarification: 'The interior is nonpolar; the only polar residues inside are two histidines.' },
    ],
  },
  'oxygen-carriers-2': {
    estimatedMinutes: 9,
    xp: 25,
    highYield: [
      'Proximal His F8 (5th position) binds the iron; O₂ at the 6th; distal His E7 nearby.',
      'Globin blocks the haem–O₂–haem sandwich → iron stays ferrous.',
      'CO vs O₂: 25,000× for free haem, ~200× in Mb/Hb (distal His forces bent binding).',
    ],
    confusions: [
      { confusion: 'The distal histidine is bonded to the iron.', clarification: 'The proximal histidine (F8) is bonded; the distal histidine (E7) is nearby but not bonded.' },
      { confusion: 'Haemoglobin binds CO 25,000 times more strongly than O₂.', clarification: 'That is free haem. In haemoglobin and myoglobin it is about 200 times.' },
    ],
  },
  'oxygen-carriers-3': {
    estimatedMinutes: 11,
    xp: 30,
    highYield: [
      'HbA = α₂β₂ (α 141, β 146 amino acids); haems far apart near the surface.',
      'T (deoxy) ↔ R (oxy) at the α₁β₂ functional contact; T-state salt links broken on oxygenation.',
      'Mb: hyperbolic, P50 ≈ 1 torr. Hb: sigmoid, P50 = 26 torr; regulated by H⁺, CO₂, 2,3-DPG.',
    ],
    confusions: [
      { confusion: 'Haemoglobin has a higher O₂ affinity than myoglobin.', clarification: 'Myoglobin is more saturated at every pO₂ above zero (P50 ≈ 1 vs 26 torr).' },
      { confusion: 'Oxygenation forms new salt links in haemoglobin.', clarification: 'It breaks the T-state salt links and bonds, giving the R state.' },
    ],
  },
  'oxygen-carriers-4': {
    estimatedMinutes: 12,
    xp: 30,
    highYield: [
      '↓pH or ↑pCO₂ → curve right (tissues release O₂); lungs → curve left.',
      '2,3-BPG: one per Hb, central cavity, three + charges per β chain; stabilises T; P50 1 → 26 torr.',
      'HbF (α₂γ₂): Ser for His at H21 → less BPG binding → higher O₂ affinity.',
    ],
    confusions: [
      { confusion: 'BPG increases haemoglobin’s oxygen affinity.', clarification: 'It decreases it (curve right), which is what lets O₂ unload in the capillaries.' },
      { confusion: 'The Bohr effect also acts on myoglobin.', clarification: 'Myoglobin’s O₂ binding is not affected by pH or pCO₂.' },
    ],
  },
};
