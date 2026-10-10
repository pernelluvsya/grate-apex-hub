// Biochemistry → Fatty Acid Biosynthesis: the eight lessons.
//
// READ, THEN TEST. Each lesson teaches first:
//   objectives — "What you'll learn" (short orientation)
//   chunks     — the teaching sections, read in order
//   summary    — "Key points to remember"
// The Lesson Quiz (./questions.ts) comes afterwards and only tests what
// these lessons teach.
//
// Sources:
// - Lecture slides (both decks, merged) define WHAT is taught. Body text
//   is lecture material, explained in plain language.
// - Lehninger (leh(...)) is used only to explain or settle points WITHIN
//   that scope. It appears in 'textbook' notes, in sections marked
//   origin: 'textbook', or in 'clarified' notes where it settles a
//   contradiction in the slides (the slide wording is quoted there).
// - Material added to deck B later (speaker note, comment, pasted image)
//   is labelled 'annotation'.
//
// The old learn-by-answering steps were removed from these lessons:
// their good questions now live in the quiz bank (same IDs).
import type { LessonDraft } from '@/data/topics/build';
import { interactive, readingExtras } from '@/data/topics/fatty-acid-biosynthesis/interactive';
import { leh, ref, type ConceptId } from '@/data/topics/fatty-acid-biosynthesis/sources';

type Draft = LessonDraft<ConceptId>;

// ─── Lesson 1 ───────────────────────────────────────────────────────

const lesson1: Draft = {
  id: 'fatty-acid-biosynthesis-1',
  title: 'Recap: β-Oxidation and Enzyme Names',
  description: 'Where we start from, and how to read the enzyme names this topic relies on.',
  xp: 10,
  sourceRefs: [...ref([2, 3]), ...leh(613, 638)],
  objectives: [
    'What β-oxidation produces, and why that matters for fatty acid synthesis',
    'How an enzyme’s name tells you its job',
    'The difference between a synthase and a synthetase',
    'The difference between a hydratase and a dehydratase',
    'What each enzyme name in this topic means',
  ],
  chunks: [
    {
      title: 'Where this topic starts',
      paragraphs: [
        'β-Oxidation is the pathway that breaks fatty acids down. It removes the chain two carbons at a time, and each two-carbon piece leaves as acetyl-CoA.',
        'Fatty acid biosynthesis runs in the opposite direction: it starts from acetyl-CoA and builds a fatty acid up, two carbons at a time.',
        'So acetyl-CoA is the link between the two pathways — the product of one and the starting material of the other. The two pathways use similar chemistry, but as the next lessons show, synthesis is not simply β-oxidation run backwards.',
      ],
      sourceRefs: [...ref([2]), ...leh(638)],
    },
    {
      title: 'Enzyme names tell you the job',
      paragraphs: [
        'Most enzyme names are built from what the enzyme acts on plus the type of reaction, ending in “-ase”. If you know the reaction words, you can predict what an unfamiliar enzyme does. The lecture reminds you of these reaction types:',
      ],
      terms: [
        { term: 'Kinase', meaning: 'A type of transferase that transfers a phosphate group.' },
        { term: 'Synthase', meaning: 'Catalyses the joining of two or more subunits to form a larger molecule.' },
        { term: 'Hydrolase', meaning: 'Catalyses hydrolysis reactions — breaking a bond by adding water.' },
        { term: 'Hydratase', meaning: 'Belongs to the lyases. Adds water across a double bond (see the note below).' },
      ],
      sourceRefs: [...ref([2]), ...leh(613)],
    },
    {
      title: 'Synthase or synthetase?',
      paragraphs: [
        'These two names look almost identical, and both kinds of enzyme form chemical bonds to build a new molecule. The difference is energy.',
        'By definition, a synthetase must cleave (hydrolyse) ATP in order to work. A synthase does not need energy from ATP hydrolysis.',
      ],
      table: {
        columns: ['', 'Synthase', 'Synthetase'],
        rows: [
          ['Forms bonds to build a new molecule', 'Yes', 'Yes'],
          ['Must hydrolyse ATP to work', 'No', 'Yes'],
        ],
      },
      sourceRefs: [...ref([3]), ...leh(613)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger gives the same definitions (Box 16-1) and adds that synthetases belong to the ligases — enzymes that join molecules using ATP.',
        },
        {
          kind: 'clarified',
          text: 'The slides call the fatty acid-building complex both the “fatty acid synthase complex” (slide 6) and the “Fatty Acid Synthetase Complex” (slide 13). Lehninger calls it fatty acid synthase: the ATP of fatty acid synthesis is spent earlier, by acetyl-CoA carboxylase (Lesson 3), not by the complex itself. This course uses “fatty acid synthase”.',
        },
      ],
    },
    {
      title: 'Hydratase or dehydratase?',
      paragraphs: [
        'You will meet both in this topic, and they do opposite jobs:',
      ],
      terms: [
        { term: 'Hydratase', meaning: 'ADDS water across a C=C double bond, giving an –OH group. Example: enoyl-CoA hydratase in β-oxidation (Lesson 6).' },
        { term: 'Dehydratase', meaning: 'REMOVES water, creating a C=C double bond. Example: β-hydroxyacyl-ACP dehydratase in fatty acid synthesis (Lesson 5).' },
      ],
      keyPoints: ['“De-” means removal: dehydratase removes water, dehydrogenase removes hydrogen.'],
      sourceRefs: [...ref([2, 8, 10], [6]), ...leh(613, 638, 791)],
      notes: [
        {
          kind: 'clarified',
          text: 'Slide 2 says a hydratase “belongs to lyase. Catalyse the removal of water from a substrate”. The lecture’s own β-oxidation slide (slide 10) shows enoyl-CoA hydratase ADDING water. Lehninger confirms that a hydratase adds water (p. 638), that lyases catalyse cleavages or, in reverse, additions (p. 613), and that removing water is a dehydratase’s job (p. 791). “Belongs to the lyases” is correct; the “removal of water” wording describes a dehydratase.',
        },
      ],
    },
    {
      title: 'Reading the enzyme names in this topic',
      paragraphs: [
        'Every enzyme in this topic follows the same naming logic. Learn the reaction word and you know the job:',
      ],
      terms: [
        { term: 'Carboxylase', meaning: 'Adds a carboxyl group (CO₂). Acetyl-CoA carboxylase turns acetyl-CoA into malonyl-CoA.' },
        { term: 'Transacylase', meaning: 'Moves an acyl group from one carrier to another. The two transacylases load acetyl and malonyl groups onto the synthase.' },
        { term: 'Synthase', meaning: 'Joins two groups into a bigger one. Ketoacyl-ACP synthase makes the new carbon–carbon bond.' },
        { term: 'Reductase', meaning: 'Reduces its substrate — adds electrons (here from NADPH). β-Ketoacyl-ACP reductase and enoyl-ACP reductase.' },
        { term: 'Dehydratase', meaning: 'Removes water. β-Hydroxyacyl-ACP dehydratase.' },
        { term: 'Dehydrogenase', meaning: 'Moves hydrogen (electrons) between a substrate and a carrier such as NAD⁺ or FAD. Acyl-CoA dehydrogenase, malate dehydrogenase.' },
        { term: 'Thioesterase', meaning: 'Breaks a thioester bond by hydrolysis. It releases the finished fatty acid from the synthase.' },
        { term: 'Lyase', meaning: 'Splits a molecule without hydrolysis or oxidation. ATP-citrate lyase splits citrate.' },
      ],
      sourceRefs: [...ref([5, 7, 9, 10, 12, 16, 17], [2, 4, 5, 9, 13, 14]), ...leh(613, 790)],
    },
  ],
  summary: [
    'β-Oxidation produces acetyl-CoA; fatty acid synthesis starts from acetyl-CoA.',
    'Synthetases must hydrolyse ATP; synthases do not. The complex in this topic is fatty acid synthase.',
    'A hydratase adds water; a dehydratase removes it. Both are lyases.',
    'Kinases transfer phosphate; hydrolases catalyse hydrolysis.',
    'Read the reaction word in an enzyme’s name — carboxylase, reductase, dehydratase, thioesterase — to predict its job.',
  ],
};

// ─── Lesson 2 ───────────────────────────────────────────────────────

const lesson2: Draft = {
  id: 'fatty-acid-biosynthesis-2',
  title: 'The Big Picture: Where, When and Why',
  description: 'Where synthesis happens, when it switches on, and the two changes that make it work.',
  xp: 10,
  sourceRefs: [...ref([4, 5, 15], [2, 12]), ...leh(787, 788, 794)],
  objectives: [
    'Where in the cell fatty acids are made, and in which nutritional state',
    'How a meal leads to excess citrate and the citrate shunt',
    'The two changes that let synthesis work — it is not just β-oxidation reversed',
    'The repeating stages of the synthesis cycle',
  ],
  chunks: [
    {
      title: 'An anabolic pathway of the fed state',
      paragraphs: [
        'Fatty acid biosynthesis is an anabolic pathway: it builds a larger molecule from smaller ones, and that costs energy and reducing power.',
        'It takes place in the cytosol, and it runs under fed conditions — after a meal, when the body has more fuel than it needs right now and can store the extra as fat.',
      ],
      steps: [
        { label: 'Glucose is taken up by the liver', detail: 'After a meal (fed conditions).' },
        { label: 'Flux through the TCA cycle increases', detail: 'More glucose → more acetyl-CoA → more citrate made in the mitochondria.' },
        { label: 'Excess citrate is removed via the citrate shunt', detail: 'Citrate carries acetyl groups out to the cytosol, where fatty acids are built (Lesson 8 shows how).' },
      ],
      sourceRefs: [...ref([4]), ...leh(794, 795)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger: when a cell has more fuel than it needs, the excess is generally converted to fatty acids and stored as triacylglycerols. The synthase sits in the cytosol, separated from the fatty acid breakdown reactions in the mitochondrial matrix.',
        },
      ],
    },
    {
      title: 'Is synthesis just β-oxidation in reverse?',
      paragraphs: [
        'β-Oxidation removes two carbons at a time. Running it backwards would add two carbons at a time — so it is natural to ask whether synthesis is simply β-oxidation in reverse. The lecture’s answer is: not quite. Two reactions make the synthesis pathway possible:',
      ],
      table: {
        columns: ['Change', 'What it does'],
        rows: [
          ['Acetyl-CoA is “activated” by adding a carbon dioxide', 'Makes malonyl-CoA, which drives the chain-joining step (Lessons 3–4).'],
          ['NADPH is used as the reducing agent', 'NADPH is substituted as a more powerful reducing agent than FADH₂, for the two reduction steps (Lesson 5).'],
        ],
      },
      sourceRefs: [...ref([5], [2]), ...leh(787)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger: synthesis and breakdown use different enzymes, take place in different parts of the cell, and synthesis needs a three-carbon intermediate — malonyl-CoA — that breakdown never uses.',
        },
      ],
    },
    {
      title: 'The stages of the synthesis cycle',
      paragraphs: [
        'Synthesis runs as a repeating cycle. The lecture lists its stages in this order:',
      ],
      steps: [
        { label: 'Transfer', detail: 'Acetyl and malonyl groups are loaded onto the synthase complex (Lesson 4).' },
        { label: 'Elongation', detail: 'The two are joined, adding two carbons to the chain (Lesson 4).' },
        { label: 'Reduction', detail: 'The keto group is reduced to an alcohol, using NADPH (Lesson 5).' },
        { label: 'Dehydration', detail: 'Water is removed, forming a double bond (Lesson 5).' },
        { label: 'Reduction', detail: 'The double bond is reduced, using NADPH, giving a saturated chain (Lesson 5).' },
      ],
      keyPoints: [
        'Each pass round the cycle adds two carbons.',
        'The cycle continues until palmitoyl-ACP — a 16-carbon chain — is formed. It is then released as palmitate.',
      ],
      sourceRefs: [...ref([4]), ...leh(788)],
    },
  ],
  summary: [
    'Fatty acid biosynthesis is anabolic, happens in the cytosol, and runs in the fed state.',
    'Glucose uptake by the liver raises TCA-cycle flux; excess citrate leaves via the citrate shunt.',
    'Two changes enable synthesis: CO₂ activation of acetyl-CoA, and NADPH in place of FADH₂.',
    'Stages: transfer → elongation → reduction → dehydration → reduction, repeated until palmitoyl-ACP (C16).',
  ],
};

// ─── Lesson 3 ───────────────────────────────────────────────────────

const lesson3: Draft = {
  id: 'fatty-acid-biosynthesis-3',
  title: 'Activating Acetyl-CoA: Malonyl-CoA',
  description: 'The first step: acetyl-CoA carboxylase adds CO₂ to make malonyl-CoA.',
  xp: 10,
  sourceRefs: [...ref([5, 7, 8], [2, 4, 6]), ...leh(787, 791, 793)],
  objectives: [
    'The first reaction of fatty acid synthesis, its enzyme and its product',
    'What malonyl-CoA is, and how it differs from acetyl-CoA',
    'What happens to the CO₂ that is added',
    'Why adding CO₂ and then losing it is worth it',
  ],
  chunks: [
    {
      title: 'The first step',
      paragraphs: [
        'Before any chain can be built, acetyl-CoA must be “activated”. The first step in fatty acid biosynthesis does this by adding a carbon dioxide to acetyl-CoA. The enzyme is acetyl-CoA carboxylase — a carboxylase adds a carboxyl group.',
      ],
      steps: [
        { label: 'Acetyl-CoA + CO₂', detail: 'The starting materials: a two-carbon acetyl group on coenzyme A, plus carbon dioxide.' },
        { label: 'Acetyl-CoA carboxylase', detail: 'The enzyme that adds the carbon dioxide.' },
        { label: 'Malonyl-CoA', detail: '⁻OOC–CH₂–CO–CoA: the acetyl group now carries an extra carboxyl group. This is the activated two-carbon donor for synthesis.' },
      ],
      terms: [
        { term: 'Acetyl-CoA', meaning: 'A two-carbon acetyl group attached to coenzyme A. The raw material for synthesis.' },
        { term: 'Malonyl-CoA', meaning: 'Acetyl-CoA carrying an added carboxyl group (three carbons in the acyl part). The “activated” form.' },
      ],
      sourceRefs: [...ref([5], [2]), ...leh(787)],
      notes: [
        {
          kind: 'clarified',
          text: 'The two decks write the product differently: deck A (slide 5 and the PDF) gives ⁻OOC-CH₂-CO-CoA, labelled “Malonyl CoA”; deck B (slide 2) writes “CH3CH2COCoA”. Lehninger describes malonyl-CoA as acetyl-CoA with a transferred carboxyl group, which matches deck A. Deck B’s formula has no added carboxyl group.',
        },
      ],
    },
    {
      title: 'Behind the reaction',
      origin: 'textbook',
      paragraphs: [
        'Acetyl-CoA carboxylase carries a biotin group. In the first half of the reaction, CO₂ (from bicarbonate) is attached to biotin, using the energy of ATP. In the second half, biotin hands the CO₂ on to acetyl-CoA, giving malonyl-CoA. The reaction is irreversible.',
        'This is where fatty acid synthesis spends its ATP: one ATP for every malonyl-CoA made.',
      ],
      sourceRefs: leh(787, 793),
    },
    {
      title: 'Why add CO₂ at all?',
      paragraphs: [
        'The added carbon dioxide is not kept. When the malonyl group is later joined to the growing chain (Lesson 4), that CO₂ leaves again — and the electrons from its bond attack the acyl group, driving the joining (condensation) reaction.',
        'So the cell carboxylates now in order to decarboxylate later: the CO₂ is a temporary “handle” that pays for making the new carbon–carbon bond.',
      ],
      steps: [
        { label: 'Carboxylation', detail: 'Acetyl-CoA carboxylase adds CO₂ → malonyl-CoA.' },
        { label: 'Malonyl group is loaded onto the synthase', detail: 'Lesson 4.' },
        { label: 'Decarboxylation during condensation', detail: 'CO₂ leaves; its bond electrons attack the acyl group, forming the new C–C bond. In the first round this gives acetoacetyl-ACP.' },
      ],
      sourceRefs: [...ref([7, 8], [4, 6]), ...leh(791)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger: simply joining two acyl groups is energetically uphill. Coupling the joining step to loss of CO₂ from malonyl makes it strongly favourable. The CO₂ released is the very carbon that acetyl-CoA carboxylase added, so it is only briefly part of the molecule.',
        },
      ],
    },
  ],
  summary: [
    'Step one: acetyl-CoA + CO₂ → malonyl-CoA, by acetyl-CoA carboxylase.',
    'Malonyl-CoA is acetyl-CoA with an extra carboxyl group — the activated two-carbon donor.',
    'The added CO₂ leaves again at condensation; its bond electrons drive the chain-joining step.',
    'None of the added CO₂ ends up in the finished fatty acid.',
  ],
};

// ─── Lesson 4 ───────────────────────────────────────────────────────

const lesson4: Draft = {
  id: 'fatty-acid-biosynthesis-4',
  title: 'The Synthase Complex: Loading and Condensation',
  description: 'The complex’s two carriers, how they are loaded, and how the first carbon–carbon bond is made.',
  xp: 10,
  sourceRefs: [...ref([6, 7, 8], [3, 4, 6]), ...leh(789, 790, 791)],
  objectives: [
    'The two carriers on the fatty acid synthase complex, and what each holds',
    'How acetyl and malonyl groups are loaded',
    'How condensation makes the first carbon–carbon bond',
    'Why the first product has four carbons',
  ],
  chunks: [
    {
      title: 'One complex, two carriers',
      paragraphs: [
        'All the chain-building reactions happen on one large enzyme complex, the fatty acid synthase. The growing chain never floats free: it stays attached to the complex the whole time. The lecture describes two carriers on the complex:',
      ],
      table: {
        columns: ['', 'ACP₁', 'ACP₂'],
        rows: [
          ['Attached through', 'A cysteinyl sulfhydryl (–SH) group', 'A long phosphopantetheine'],
          ['Job', 'Holding station for acetyl or fatty acyl groups', 'Binds the growing chain during the condensation and reduction reactions'],
          ['Textbook name', 'Cysteine –SH of β-ketoacyl-ACP synthase (KS)', 'Acyl carrier protein (ACP)'],
        ],
      },
      sourceRefs: [...ref([6], [3]), ...leh(789, 790)],
      notes: [
        {
          kind: 'clarified',
          text: 'The lecture labels ACP₁ and ACP₂ are used in this course. Lehninger — and a speaker note added to deck B — name the same two sites differently: ACP₁ is the cysteine –SH of the ketoacyl synthase (KS), and ACP₂ is the acyl carrier protein itself. Same chemistry, different labels.',
        },
        {
          kind: 'textbook',
          text: 'Lehninger: the phosphopantetheine of ACP acts as a long, flexible arm. It tethers the growing chain and swings it from one active site of the complex to the next.',
        },
      ],
    },
    {
      title: 'Loading the carriers',
      paragraphs: [
        'Before chain building can start, both carriers must be “charged”. Each loading enzyme is a transacylase: it moves a group off coenzyme A and onto the synthase.',
      ],
      steps: [
        { label: 'Acetyl group loaded onto ACP₁', detail: 'Acetyl-CoA:ACP transacylase moves an acetyl group from coenzyme A to the cysteinyl-S on ACP₁.' },
        { label: 'Malonyl group loaded onto ACP₂', detail: 'Malonyl-CoA:ACP transacylase moves a malonyl group from coenzyme A to the pantetheinyl-S of ACP₂.' },
      ],
      keyPoints: [
        'Acetyl → ACP₁ (cysteinyl-S). Malonyl → ACP₂ (pantetheinyl-S).',
        'The lecture diagram shows the acetyl group passing via ACP to the KSase (the synthase), freeing ACP for malonyl.',
      ],
      sourceRefs: [...ref([7, 8], [4, 6]), ...leh(790)],
    },
    {
      title: 'Condensation: the first carbon–carbon bond',
      paragraphs: [
        'With both groups loaded side by side, ketoacyl-ACP synthase joins them. This is the “elongation” stage of the cycle.',
      ],
      steps: [
        { label: 'CO₂ leaves the malonyl group', detail: 'The carbon dioxide added by acetyl-CoA carboxylase is lost.' },
        { label: 'The electrons from that bond attack the acyl group on ACP₁', detail: 'This forms the new carbon–carbon bond.' },
        { label: 'A β-ketoacyl group is formed', detail: 'It carries a keto (C=O) group on its β-carbon. In the first round it is acetoacetyl-ACP.' },
      ],
      table: {
        columns: ['Carbon count, first round', ''],
        rows: [
          ['Acetyl group', '2 carbons'],
          ['+ malonyl group', '3 carbons'],
          ['− CO₂ released', '1 carbon'],
          ['= Acetoacetyl-ACP', '4 carbons'],
        ],
      },
      keyPoints: [
        'Enzyme: ketoacyl-ACP synthase.',
        'Each condensation adds two carbons to the chain.',
        'The β-ketoacyl group is now ready to go through the reverse of the reactions of β-oxidation (Lesson 5).',
      ],
      sourceRefs: [...ref([7, 8], [4, 6]), ...leh(791)],
    },
  ],
  summary: [
    'Fatty acid synthase has two carriers: ACP₁ (cysteinyl –SH; holding station) and ACP₂ (phosphopantetheine; carries the growing chain).',
    'Acetyl-CoA:ACP transacylase loads acetyl onto ACP₁; malonyl-CoA:ACP transacylase loads malonyl onto ACP₂.',
    'Ketoacyl-ACP synthase condenses them: CO₂ leaves, a C–C bond forms, giving a β-ketoacyl group.',
    'First round: acetyl (2C) + malonyl (3C) − CO₂ → acetoacetyl-ACP (4C).',
  ],
};

// ─── Lesson 5 ───────────────────────────────────────────────────────

const lesson5: Draft = {
  id: 'fatty-acid-biosynthesis-5',
  title: 'Reduce, Dehydrate, Reduce: Completing the Cycle',
  description: 'Turn the β-ketoacyl group into a saturated chain, repeat, and release palmitate.',
  xp: 10,
  sourceRefs: [...ref([8, 9, 12], [5, 6, 9]), ...leh(790, 791, 793)],
  objectives: [
    'The three steps that turn a β-keto group into a saturated chain',
    'The enzymes (KR, DH, ER), their cofactors and the first-round intermediates',
    'How the cycle resets and repeats, two carbons at a time',
    'How palmitate is released, and what it costs to make',
  ],
  chunks: [
    {
      title: 'Why three more steps?',
      paragraphs: [
        'Condensation leaves a keto group (C=O) on the β-carbon of the chain. A finished, saturated fatty acid has no keto group — just –CH₂– units. Three steps remove it: reduce, dehydrate, reduce.',
        'The lecture calls this a “reversal of β-oxidation”: these three steps are the reverse of three β-oxidation reactions (compared in Lesson 6).',
      ],
      sourceRefs: [...ref([7, 9], [4, 5]), ...leh(788)],
    },
    {
      title: 'The three steps (first round)',
      paragraphs: ['Named as in the lecture’s pathway diagram, following the first round:'],
      steps: [
        { label: 'Reduction — β-ketoacyl-ACP reductase (KR)', detail: 'The keto group is reduced to an alcohol, using NADPH. Acetoacetyl-ACP → D-β-hydroxybutyryl-ACP.' },
        { label: 'Dehydration — β-hydroxyacyl-ACP dehydratase (DH)', detail: 'Water is removed, forming a trans double bond (an enoyl group). D-β-Hydroxybutyryl-ACP → crotonyl-ACP (trans-Δ²-butenoyl-ACP).' },
        { label: 'Reduction — enoyl-ACP reductase (ER)', detail: 'The double bond is reduced with NADPH, which substitutes for the FADH₂ of β-oxidation. Crotonyl-ACP → butyryl-ACP (saturated, 4 carbons).' },
      ],
      table: {
        columns: ['Step', 'Cofactor', 'Change at the β-carbon'],
        rows: [
          ['KR — reduction', 'NADPH', 'C=O → C–OH'],
          ['DH — dehydration', 'none (H₂O removed)', 'C–OH → C=C (trans)'],
          ['ER — reduction', 'NADPH', 'C=C → saturated C–C'],
        ],
      },
      sourceRefs: [...ref([8, 9, 12], [5, 6, 9]), ...leh(791)],
      notes: [
        {
          kind: 'clarified',
          text: 'Slide 9 calls the dehydration enzyme “Enoyl-ACP hydrase” and says it gives the “cis-2,3-enoyl group”. The lecture’s own diagram names it β-hydroxyacyl-ACP dehydratase and the next enzyme “2,3-trans-enoyl-ACP reductase”. Lehninger confirms the diagram: β-hydroxyacyl-ACP dehydratase removes water to give trans-Δ²-butenoyl-ACP — a TRANS double bond.',
        },
      ],
    },
    {
      title: 'Reset and repeat',
      paragraphs: [
        'After the second reduction, the chain is saturated and sits on ACP₂. To grow it again, the cycle resets:',
      ],
      steps: [
        { label: 'Transfer back to ACP₁', detail: 'ACP-acyltransferase moves the acyl group from the pantetheinyl-S of ACP₂ to the cysteinyl-S on ACP₁.' },
        { label: 'ACP₂ is free again', detail: 'It picks up the next malonyl group.' },
        { label: 'Condense, reduce, dehydrate, reduce', detail: 'The chain grows by two more carbons: 4 → 6 → 8 … → 16.' },
      ],
      sourceRefs: [...ref([9], [5]), ...leh(793)],
    },
    {
      title: 'Releasing palmitate',
      paragraphs: [
        'Slide 12 summarises the cycle using the complex’s activity names: after each round of chain building, the β-keto group is fully saturated by the ketoreductase (KR), dehydratase (DH) and enoyl reductase (ER), acting in sequence. The growing chain is carried between these active sites while attached to the phosphopantetheine prosthetic group of the acyl carrier protein (ACP).',
        'When the chain reaches 16 carbons, a thioesterase (TE) releases it. In animal cells, palmitoyl-ACP is hydrolysed to free palmitate and ACP-SH. The lecture diagram adds that in E. coli, palmitoyl-ACP goes on to triacylglycerol and phospholipid synthesis.',
      ],
      terms: [
        { term: 'KR', meaning: 'Ketoreductase — reduces the β-keto group.' },
        { term: 'DH', meaning: 'Dehydratase — removes water.' },
        { term: 'ER', meaning: 'Enoyl reductase — reduces the double bond.' },
        { term: 'TE', meaning: 'Thioesterase — releases the chain at 16 carbons.' },
      ],
      sourceRefs: [...ref([8, 12], [6, 9]), ...leh(790, 793)],
      notes: [
        {
          kind: 'clarified',
          text: 'Slide 12 writes “palmitidic acid”; the rest of the lecture says palmitate / palmitoyl. Lehninger names the product palmitate (16:0). Palmitic acid is the acid form of the same molecule; “palmitidic” is not a standard name.',
        },
        {
          kind: 'annotation',
          text: 'A comment added to deck B (slide 9) adds that palmitate can be activated to palmitoyl-CoA for elongation, used in triglycerides/phospholipids, or desaturated to palmitoleate (16:1).',
        },
      ],
    },
    {
      title: 'Counting cycles and NADPH',
      paragraphs: [
        'The lecture diagram works through one full cycle (acetyl → butyryl-ACP, C4) and then shows “6 cycles” more to palmitoyl-ACP (C16). That is 7 cycles in total. Each cycle uses two NADPH — one for each reduction.',
      ],
      table: {
        columns: ['To make one palmitate', ''],
        rows: [
          ['Starting acetyl group (primer)', '1 acetyl-CoA'],
          ['Two-carbon donors', '7 malonyl-CoA'],
          ['Cycles', '7'],
          ['NADPH (2 per cycle)', '14'],
          ['CO₂ released (1 per condensation)', '7'],
        ],
      },
      sourceRefs: [...ref([8, 9], [5, 6]), ...leh(793)],
      notes: [
        {
          kind: 'clarified',
          text: 'The diagram says “6 cycles” after the first worked cycle; a comment added to deck B says the cycle is “repeated 7 times”. Lehninger: seven cycles of condensation and reduction make palmitoyl-ACP. Both slide versions agree once the first cycle is counted.',
        },
        {
          kind: 'textbook',
          text: 'Lehninger’s overall equation: 8 acetyl-CoA + 7 ATP + 14 NADPH + 14 H⁺ → palmitate + 8 CoA + 7 ADP + 7 Pi + 14 NADP⁺ + 6 H₂O. The 7 ATP are spent making the 7 malonyl-CoA (Lesson 3).',
        },
      ],
    },
  ],
  summary: [
    'After condensation: reduce (KR, NADPH) → dehydrate (DH, removes H₂O, trans double bond) → reduce (ER, NADPH).',
    'First round: acetoacetyl-ACP → D-β-hydroxybutyryl-ACP → crotonyl-ACP → butyryl-ACP.',
    'ACP-acyltransferase moves the chain back to ACP₁, freeing ACP₂ for the next malonyl group.',
    'Each cycle adds 2 carbons and uses 2 NADPH; 7 cycles make palmitoyl-ACP (C16).',
    'Thioesterase (TE) releases the chain at 16 carbons; in animal cells it is hydrolysed to palmitate.',
  ],
};

// ─── Lesson 6 ───────────────────────────────────────────────────────

const lesson6: Draft = {
  id: 'fatty-acid-biosynthesis-6',
  title: 'Synthesis vs β-Oxidation',
  description: 'Compare the two pathways reaction by reaction so the differences stick.',
  xp: 10,
  sourceRefs: [...ref([5, 8, 9, 10, 15], [2, 5, 6, 12]), ...leh(638, 791, 794)],
  objectives: [
    'The four reactions of β-oxidation, with their enzymes and cofactors',
    'Which synthesis step undoes which β-oxidation step',
    'The key differences: carrier, cofactors, direction, location and intermediates',
    'Why synthesis uses NADPH',
  ],
  chunks: [
    {
      title: 'β-Oxidation in four reactions',
      paragraphs: ['The lecture recaps β-oxidation (slide 10). Each round shortens the chain by two carbons:'],
      steps: [
        { label: 'Acyl-CoA dehydrogenase', detail: 'Fatty acyl-CoA → 2-trans-enoyl-CoA. FAD is reduced to FADH₂. A double bond is made.' },
        { label: 'Enoyl-CoA hydratase', detail: 'Water is added across the double bond → L-3-hydroxyacyl-CoA.' },
        { label: 'L-3-Hydroxyacyl-CoA dehydrogenase', detail: 'Oxidised by NAD⁺ → 3-oxoacyl-CoA (β-ketoacyl-CoA) + NADH + H⁺.' },
        { label: 'Acetyl-CoA acyltransferase', detail: 'CoASH splits off acetyl-CoA, leaving an acyl-CoA two carbons shorter.' },
      ],
      sourceRefs: [...ref([10]), ...leh(638)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger calls the last enzyme by its more common name, thiolase, and confirms that the hydroxy intermediate of β-oxidation is the L form.',
        },
      ],
    },
    {
      title: 'One pathway undoes the other',
      paragraphs: [
        'Put the reactions side by side. Reading synthesis from the bottom up, each step reverses a β-oxidation step — but with a different enzyme and a different cofactor:',
      ],
      table: {
        columns: ['β-Oxidation (breaks down)', 'Synthesis (builds up)'],
        rows: [
          ['Acyl-CoA dehydrogenase: makes the C=C double bond (FAD → FADH₂)', 'Enoyl-ACP reductase: removes the double bond (NADPH)'],
          ['Enoyl-CoA hydratase: adds H₂O', 'β-Hydroxyacyl-ACP dehydratase: removes H₂O'],
          ['L-3-Hydroxyacyl-CoA dehydrogenase: C–OH → C=O (NAD⁺)', 'β-Ketoacyl-ACP reductase: C=O → C–OH (NADPH)'],
          ['Acetyl-CoA acyltransferase: splits off acetyl-CoA', 'Ketoacyl-ACP synthase: adds two carbons from malonyl (CO₂ lost)'],
        ],
      },
      sourceRefs: [...ref([8, 9, 10], [5, 6]), ...leh(638, 791)],
    },
    {
      title: 'Side by side',
      table: {
        columns: ['Feature', 'Synthesis', 'β-Oxidation'],
        rows: [
          ['Direction', 'Adds 2 carbons per cycle, from malonyl', 'Removes 2 carbons per cycle, as acetyl-CoA'],
          ['Location', 'Cytosol', 'Mitochondria'],
          ['Carrier for intermediates', 'ACP', 'Coenzyme A'],
          ['Electron carrier', 'NADPH (for both reductions)', 'FAD and NAD⁺'],
          ['Hydroxy intermediate', 'D-β-hydroxyacyl-ACP', 'L-3-hydroxyacyl-CoA'],
          ['Two-carbon unit', 'Activated malonyl (acetyl + CO₂)', 'Acetyl-CoA'],
        ],
      },
      sourceRefs: [...ref([5, 8, 9, 10, 15], [2, 5, 6, 12]), ...leh(791, 794)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger notes that the D-β-hydroxy intermediate of synthesis is a different stereoisomer from the L-hydroxy intermediate of β-oxidation — one more sign that separate enzymes are at work.',
        },
      ],
    },
    {
      title: 'Why NADPH?',
      paragraphs: [
        'The lecture’s reason: NADPH is substituted as a more powerful reducing agent than FADH₂. Synthesis needs to push electrons INTO the chain (two reductions per cycle), so it uses a strong electron donor.',
      ],
      sourceRefs: [...ref([5, 9], [2, 5]), ...leh(794)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger: cells generally use NADPH for building (reductive) reactions and NAD⁺ for breakdown (oxidative) reactions. In liver cytosol the NADPH : NADP⁺ ratio is very high, giving a strongly reducing environment for fatty acid synthesis.',
        },
      ],
    },
    {
      title: 'So — a reversal of β-oxidation?',
      paragraphs: [
        'Partly. The reduction → dehydration → reduction steps of synthesis are the reverse of three β-oxidation steps, as the lecture diagram points out. But activation to malonyl, NADPH, ACP and the cytosolic location make synthesis a separate pathway — not β-oxidation simply run backwards.',
      ],
      sourceRefs: [...ref([5, 8], [2, 6]), ...leh(787)],
    },
  ],
  summary: [
    'β-Oxidation: acyl-CoA dehydrogenase (FAD) → enoyl-CoA hydratase (+H₂O) → L-3-hydroxyacyl-CoA dehydrogenase (NAD⁺) → acetyl-CoA acyltransferase (CoASH).',
    'Synthesis reverses the middle three steps with its own enzymes and NADPH.',
    'Synthesis: cytosol, ACP, NADPH, D-hydroxy intermediate, adds carbons from malonyl.',
    'β-Oxidation: mitochondria, CoA, FAD + NAD⁺, L-hydroxy intermediate, removes carbons as acetyl-CoA.',
    'NADPH is used as the more powerful reducing agent than FADH₂.',
  ],
};

// ─── Lesson 7 ───────────────────────────────────────────────────────

const lesson7: Draft = {
  id: 'fatty-acid-biosynthesis-7',
  title: 'Beyond Palmitate: Elongation',
  description: 'How cells make fatty acids shorter or longer than 16-carbon palmitate.',
  xp: 10,
  sourceRefs: [...ref([11, 13, 14], [7, 8, 10, 11]), ...leh(797, 798)],
  objectives: [
    'Why other fatty acids are needed if the synthase makes palmitate',
    'How the ER elongation system works, and its main product',
    'Why longer fatty acids are mostly polyunsaturated',
    'The second elongation system in the mitochondria',
  ],
  chunks: [
    {
      title: 'Palmitate is the synthase’s product',
      paragraphs: [
        'The fatty acid synthase complex releases its chain at 16 carbons, so its product is palmitate. The lecture asks: where do all the other fatty acids come from?',
      ],
      keyPoints: [
        'Shorter than palmitate: palmitate can be shortened by β-oxidation.',
        'Longer than palmitate: separate fatty acid elongation systems add more carbons.',
      ],
      sourceRefs: [...ref([13], [10]), ...leh(797)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger: palmitate is the principal product of the synthase in animal cells and the precursor of the other long-chain fatty acids.',
        },
      ],
    },
    {
      title: 'Elongation on the endoplasmic reticulum',
      paragraphs: [
        'For longer fatty acids, the main system is the fatty acid elongation system on the endoplasmic reticulum (ER).',
      ],
      steps: [
        { label: 'Activate', detail: 'Palmitate is first activated to palmitoyl-CoA.' },
        { label: 'Elongate', detail: 'The same reactions occur as in synthesis — but now carried out by individual enzymes, not one complex.' },
        { label: 'Product', detail: 'The enzymes prefer substrates of C16 or less, so the major product is stearoyl-CoA (C18).' },
      ],
      table: {
        columns: ['', 'Fatty acid synthase', 'ER elongation'],
        rows: [
          ['Where', 'Cytosol', 'Endoplasmic reticulum'],
          ['Enzymes', 'One multi-enzyme complex', 'Individual enzymes'],
          ['Chain carrier', 'ACP', 'Coenzyme A'],
          ['Main product', 'Palmitate (C16)', 'Stearoyl-CoA (C18)'],
        ],
      },
      sourceRefs: [...ref([11, 13], [7, 10]), ...leh(797)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger: in the ER, coenzyme A (not ACP) carries the chain, and each round is the same as in palmitate synthesis — two carbons donated by malonyl-CoA, then reduction, dehydration and reduction.',
        },
      ],
    },
    {
      title: 'Why longer fatty acids are mostly unsaturated',
      paragraphs: [
        'The ER enzymes prefer chains of C16 or less, so long saturated chains are poor substrates. Unsaturated chains are different: the kink of a cis double bond makes them effectively shorter, so longer unsaturated fatty acids still bind.',
        'As a result, unsaturated fatty acids of 20, 22 and 24 carbons are also made — and most longer fatty acids are polyunsaturated.',
      ],
      steps: [
        { label: 'Enzymes prefer ≤ C16', detail: 'Long saturated chains bind poorly.' },
        { label: 'A cis double bond kinks the chain', detail: 'The chain behaves as if it were shorter.' },
        { label: 'Kinked chains still bind and are elongated', detail: '20-, 22- and 24-carbon unsaturated fatty acids are made.' },
      ],
      sourceRefs: [...ref([13], [10]), ...leh(798)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger: the double bonds of natural unsaturated fatty acids such as palmitoleate and oleate are cis.',
        },
      ],
    },
    {
      title: 'A second system in the mitochondria',
      paragraphs: [
        'Another elongation system exists in the mitosol (mitochondrial matrix), probably to provide long fatty acids for mitochondrial structure.',
        'It uses most of the same activities as β-oxidation — but an NADPH-dependent enoyl-CoA reductase replaces the FAD-dependent dehydrogenase.',
      ],
      sourceRefs: [...ref([14], [11]), ...leh(797)],
    },
    {
      title: 'ER elongation chart (added to deck B)',
      paragraphs: [
        'Deck B adds a pathway chart titled “Fatty acids elongation in the endoplasmic reticulum”. It shows long-chain fatty acids activated to acyl-CoA (ATP + CoA → AMP + PPi), condensation with malonyl-CoA, and the reduction–dehydration–reduction steps.',
        'It also shows stearoyl-CoA desaturated to oleoyl-CoA by stearoyl-CoA desaturase (with cytochrome b5, cytochrome b5 reductase, O₂ and NADPH), and branches to sphingomyelin/ceramide metabolism and protein acylation.',
      ],
      sourceRefs: ref([], [8]),
      notes: [
        {
          kind: 'annotation',
          text: 'This chart is a screenshot added to deck B, not lecture text. It includes EC numbers and a reference to the apicoplast (a parasite organelle). It is not used in quizzes until your lecturer confirms it is examinable.',
        },
      ],
    },
  ],
  summary: [
    'The synthase makes palmitate (C16). Shorter fatty acids: β-oxidation of palmitate. Longer: elongation systems.',
    'ER elongation: activate to palmitoyl-CoA → same reactions, individual enzymes → major product stearoyl-CoA.',
    'ER enzymes prefer ≤ C16; cis kinks let longer unsaturated chains bind, so 20-, 22- and 24-carbon unsaturated fatty acids are made.',
    'Most longer fatty acids are polyunsaturated.',
    'Mitochondrial elongation: β-oxidation activities + an NADPH-dependent enoyl-CoA reductase; probably for mitochondrial structure.',
  ],
};

// ─── Lesson 8 ───────────────────────────────────────────────────────

const lesson8: Draft = {
  id: 'fatty-acid-biosynthesis-8',
  title: 'Supplying the Pathway: The Pyruvate–Malate Cycle',
  description: 'How acetyl groups and NADPH reach the cytosol, coupling fatty acid synthesis to glycolysis.',
  xp: 10,
  sourceRefs: [...ref([15, 16, 17], [12, 13, 14]), ...leh(794, 795)],
  objectives: [
    'Why acetyl-CoA cannot simply leave the mitochondria',
    'How citrate carries acetyl groups to the cytosol',
    'How oxaloacetate is recycled, and where NADPH is made',
    'Which steps cost ATP, and how the cycle couples synthesis to glycolysis',
  ],
  chunks: [
    {
      title: 'The problem',
      paragraphs: [
        'All the reactions of fatty acid synthesis take place in the cytosol. But acetyl-CoA is made in the mitochondria, and it can’t cross the inner mitochondrial membrane.',
        'The solution is the Pyruvate–Malate Cycle (also called the Citrate–Pyruvate Cycle). It takes acetyl groups to the cytosol while also providing a source of NADPH from NADH — and so couples fatty acid synthesis to glycolysis.',
      ],
      sourceRefs: [...ref([15], [12]), ...leh(795)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger: nearly all the acetyl-CoA used for fatty acid synthesis is made in the mitochondria (for example from pyruvate), and the inner mitochondrial membrane is impermeable to acetyl-CoA — so an indirect shuttle is needed.',
        },
      ],
    },
    {
      title: 'Around the cycle',
      paragraphs: ['Following the slides and the lecture’s pathway diagram (slide 17), starting with glucose:'],
      steps: [
        { label: 'Cytosol: glucose → pyruvate', detail: 'Glycolysis. Pyruvate enters the mitochondria.' },
        { label: 'Mitochondria: make citrate', detail: 'Pyruvate DH complex turns pyruvate into acetyl-CoA. Citrate synthase joins acetyl-CoA to oxaloacetate, making citrate.' },
        { label: 'Export citrate', detail: 'Citrate is readily transported out of the mitochondria using a co-transporter.' },
        { label: 'Cytosol: split citrate', detail: 'ATP-citrate lyase cleaves citrate to acetyl-CoA + oxaloacetate — a process requiring ATP to make it favourable. Acetyl-CoA is now available for synthesis.' },
        { label: 'Oxaloacetate → malate', detail: 'Malate dehydrogenase REDUCES oxaloacetate to malate, using NADH (→ NAD⁺).' },
        { label: 'Malate → pyruvate', detail: 'Malic enzyme oxidises malate to pyruvate, releasing CO₂ and producing NADPH for biosynthesis.' },
        { label: 'Back to the mitochondria', detail: 'Pyruvate re-enters. Pyruvate carboxylase (using CO₂ and ATP) regenerates oxaloacetate, ready to accept more acetyl-CoA.' },
      ],
      sourceRefs: [...ref([15, 16, 17], [12, 13, 14]), ...leh(795)],
      notes: [
        {
          kind: 'clarified',
          text: 'Slide 16 says the cytosolic oxaloacetate is “dehydrogenated to give malate and NAD⁺”. The lecture diagram shows malate DH using NADH + H⁺ (→ NAD⁺) to make malate. Lehninger confirms: cytosolic malate dehydrogenase reduces oxaloacetate to malate. “Dehydrogenated” describes the opposite direction; the rest of the slide (NAD⁺ produced) is right.',
        },
      ],
    },
    {
      title: 'Where each step happens',
      table: {
        columns: ['Step', 'Enzyme', 'Where', 'Cost / gain'],
        rows: [
          ['Pyruvate → acetyl-CoA', 'Pyruvate DH complex', 'Mitochondria', 'NAD⁺ → NADH; CO₂ lost'],
          ['Pyruvate → oxaloacetate', 'Pyruvate carboxylase', 'Mitochondria', 'Uses ATP (+ CO₂)'],
          ['Oxaloacetate + acetyl-CoA → citrate', 'Citrate synthase', 'Mitochondria', '—'],
          ['Citrate → acetyl-CoA + oxaloacetate', 'ATP-citrate lyase', 'Cytosol', 'Uses ATP'],
          ['Oxaloacetate → malate', 'Malate dehydrogenase', 'Cytosol', 'Uses NADH'],
          ['Malate → pyruvate', 'Malic enzyme', 'Cytosol', 'Makes NADPH; CO₂ lost'],
        ],
      },
      sourceRefs: [...ref([15, 16, 17], [12, 13, 14]), ...leh(795)],
    },
    {
      title: 'Turning NADH into NADPH',
      paragraphs: [
        'Follow the electrons in the cytosol: malate dehydrogenase uses NADH to make malate, and malic enzyme then takes electrons from malate to make NADPH. The net effect is that reducing power from NADH ends up as NADPH — exactly what the two reduction steps of synthesis need.',
        'This is what the lecture means by “providing a source of NADPH from NADH”.',
      ],
      sourceRefs: [...ref([15, 16, 17], [12, 13, 14]), ...leh(794, 795)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger: malic enzyme is one of the main sources of cytosolic NADPH in liver and fat cells; the pentose phosphate pathway is the other. Lehninger also notes that some cytosolic malate can instead return to the mitochondria and be turned back into oxaloacetate there.',
        },
      ],
    },
    {
      title: 'Why it matters',
      keyPoints: [
        'Delivers acetyl groups (as citrate) to the cytosol, where synthesis happens.',
        'Provides NADPH (via malic enzyme) for the two reduction steps.',
        'Couples fatty acid synthesis to glycolysis: glucose → pyruvate feeds the cycle.',
        'Costs ATP: citrate cleavage, and pyruvate carboxylase.',
      ],
      sourceRefs: [...ref([15, 16, 17], [12, 13, 14])],
    },
  ],
  summary: [
    'Acetyl-CoA is made in the mitochondria but can’t cross the inner membrane; synthesis is in the cytosol.',
    'Acetyl-CoA + oxaloacetate → citrate (citrate synthase), exported on a co-transporter.',
    'In the cytosol, ATP-citrate lyase splits citrate (costs ATP) → acetyl-CoA + oxaloacetate.',
    'Oxaloacetate is reduced to malate (malate DH, NADH); malic enzyme turns malate into pyruvate + NADPH + CO₂.',
    'Pyruvate returns; pyruvate carboxylase (ATP) regenerates oxaloacetate. The cycle couples synthesis to glycolysis.',
  ],
};

// Each lesson gets its interactive layer (learn by answering) and its
// reading extras (high-yield points, common confusions) from
// ./interactive.ts.
export const lessons: Draft[] = [lesson1, lesson2, lesson3, lesson4, lesson5, lesson6, lesson7, lesson8].map(
  (lesson) => ({
    ...lesson,
    ...readingExtras[lesson.id],
    interactive: interactive[lesson.id],
  })
);
