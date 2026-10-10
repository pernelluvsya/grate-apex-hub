// Biochemistry → Cholesterol and Bile Biosynthesis: the five lessons
// (reading layer).
//
// Sources:
// - The lecture deck (R A Ngala, 20 slides) defines WHAT is taught. Its
//   pathway figures (slides 4–6, 8–12, 17–19) were read and written out in
//   ./sources.ts → diagrams; lessons teach from them.
// - Lehninger (leh(...)) only explains or settles points WITHIN that scope,
//   in 'textbook' or 'clarified' notes.
// - Unsettled points are 'check' notes and are never quizzed.
import type { LessonDraft } from '@/data/topics/build';
import { interactive, readingExtras } from '@/data/topics/cholesterol-and-bile-biosynthesis/interactive';
import { fa, leh, ref, type ConceptId } from '@/data/topics/cholesterol-and-bile-biosynthesis/sources';

type Draft = LessonDraft<ConceptId>;

// ─── Lesson 1 ───────────────────────────────────────────────────────

const lesson1: Draft = {
  id: 'cholesterol-and-bile-biosynthesis-1',
  title: 'Cholesterol: Structure, Sites and Raw Materials',
  description: 'The steroid nucleus, where cholesterol is made, and how acetyl-CoA and NADPH reach the cytosol.',
  xp: 20,
  sourceRefs: [...ref([1, 2, 3, 4, 5, 6]), ...fa([13, 14])],
  objectives: [
    'Describe the four-ring steroid nucleus — and why it is not a benzene ring',
    'Find the landmarks on cholesterol: rings A–D, the C-3 hydroxyl, the C-5=C-6 double bond, the C-17 side chain',
    'Name where in the body cholesterol is made',
    'Explain that every carbon of cholesterol comes from acetate',
    'Trace how the Pyruvate–Malate cycle supplies acetyl-CoA and NADPH to the cytosol',
  ],
  chunks: [
    {
      title: 'Where this topic goes',
      kind: 'overview',
      paragraphs: [
        'The lecture groups bile salts, lipoproteins and cholesterol together. Cholesterol is made in the body from acetyl-CoA: synthesis starts with the mevalonate pathway, where two molecules of acetyl-CoA condense to form acetoacetyl-CoA.',
        'This topic follows that pathway all the way to cholesterol (Lessons 2–3), then how cells regulate it (Lesson 4), and finally how the liver turns cholesterol into bile acids (Lesson 5). First: the molecule itself, and its raw materials.',
      ],
      sourceRefs: ref([2, 3]),
    },
    {
      title: 'The steroid nucleus',
      kind: 'structure',
      paragraphs: [
        'The four-ring nucleus of cholesterol is the cyclopentanoperhydrophenanthrene ring. The structure on slide 4 shows three six-membered rings (A, B and C) fused to one five-membered ring (D).',
        'The lecture stresses that this is NOT a benzene ring — animals cannot synthesise a benzene ring.',
      ],
      terms: [
        { term: 'Cyclopentanoperhydrophenanthrene', meaning: 'The four-ring steroid nucleus of cholesterol: three six-membered rings and one five-membered ring, fused together.' },
        { term: 'Benzene ring', meaning: 'Not part of cholesterol — animals cannot make one.' },
      ],
      keyPoints: ['Cholesterol’s nucleus = cyclopentanoperhydrophenanthrene (rings A–D), not benzene.'],
      sourceRefs: [...ref([3, 4]), ...leh(820)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger: sterols all have the four fused rings of the steroid nucleus and are alcohols, with a hydroxyl group at C-3 — hence the name “sterol” (p. 820).',
        },
      ],
    },
    {
      title: 'Landmarks on the molecule',
      kind: 'structure',
      paragraphs: ['Slide 4 labels the parts you need to recognise on any cholesterol structure:'],
      terms: [
        { term: 'Ring A', meaning: 'Carries the hydroxyl group (HO–) on carbon 3.' },
        { term: 'Ring B', meaning: 'Has the double bond between carbons 5 and 6.' },
        { term: 'Ring C', meaning: 'A six-membered ring between B and D.' },
        { term: 'Ring D', meaning: 'The five-membered ring; the branched hydrocarbon side chain is attached at carbon 17.' },
      ],
      keyPoints: ['–OH at C-3 · double bond C-5=C-6 · side chain at C-17.'],
      sourceRefs: [...ref([4]), ...leh(816)],
      notes: [{ kind: 'textbook', text: 'Lehninger describes cholesterol as a 27-carbon compound (p. 816).' }],
    },
    {
      title: 'Where cholesterol is made',
      kind: 'overview',
      paragraphs: [
        'Cholesterol is found in all cells, and in animal tissue it is synthesised from acetic acid. The lecture names the liver and the intestinal mucosa as sites of synthesis.',
        'About 20% of total daily cholesterol production occurs in the liver. Other sites with high synthesis rates are the intestines, the adrenal glands and the reproductive organs.',
      ],
      sourceRefs: [...ref([2, 3]), ...leh(820)],
      notes: [
        {
          kind: 'check',
          text: 'The lecture gives “about 20%” as the liver’s share. Lehninger says only that “much of the cholesterol synthesis in vertebrates takes place in the liver” (p. 820), with no figure. Confirm the expected figure with your lecturer — it is not quizzed here.',
        },
      ],
    },
    {
      title: 'Every carbon comes from acetate',
      kind: 'pathway',
      paragraphs: [
        'Slide 5 colours every carbon of cholesterol by where it came from: cholesterol is synthesised from acetate precursors, with some carbons originating from acetate’s methyl group and the rest from its carbonyl group.',
        'Inside the cell, acetate is used as acetyl-CoA — which is why the pathway begins with acetyl-CoA (Lesson 2).',
      ],
      keyPoints: ['All of cholesterol’s carbons come from acetate (acetyl-CoA).'],
      sourceRefs: [...ref([3, 5]), ...leh(816)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger: tracer experiments with acetate labelled in the methyl or in the carboxyl carbon showed that all of cholesterol’s carbon atoms come from acetate (p. 816). Lehninger’s “carboxyl carbon” is the same carbon as the slide’s “carbonyl group” — acetate’s C=O carbon.',
        },
      ],
    },
    {
      title: 'Supplying the cytosol: the Pyruvate–Malate cycle',
      kind: 'pathway',
      paragraphs: [
        'Acetyl-CoA is made in the mitochondrial matrix, but cholesterol is built outside the mitochondria. Slide 6 shows the Pyruvate–Malate cycle — the same cycle you meet in Fatty Acid Biosynthesis (that deck is included in this topic’s ZIP for this reason).',
      ],
      steps: [
        { label: 'Matrix: acetyl-CoA + oxaloacetate → citrate', detail: 'Citrate synthase (CoA-SH released).' },
        { label: 'Citrate crosses both mitochondrial membranes to the cytosol' },
        { label: 'Cytosol: citrate + CoA + ATP → acetyl-CoA + oxaloacetate', detail: 'ATP-citrate lyase (ATP → ADP + Pi).' },
        { label: 'Oxaloacetate → malate', detail: 'Malate dehydrogenase (NADH → NAD⁺).' },
        { label: 'Malate → pyruvate', detail: 'Malic enzyme (NADP⁺ → NADPH; CO₂ released).' },
        { label: 'Pyruvate returns to the matrix → oxaloacetate', detail: 'Pyruvate carboxylase (CO₂ + ATP → ADP + Pi).' },
      ],
      keyPoints: [
        'The cycle delivers acetyl-CoA to the cytosol (ATP-citrate lyase) AND makes NADPH (malic enzyme).',
        'Cholesterol synthesis needs both: acetyl-CoA as its carbon source, NADPH for HMG-CoA reductase (slide 12).',
      ],
      sourceRefs: [...ref([6, 12]), ...fa([13, 14])],
    },
  ],
  summary: [
    'Nucleus: cyclopentanoperhydrophenanthrene — rings A, B, C (six-membered) and D (five-membered); not a benzene ring.',
    'Landmarks: –OH at C-3, double bond C-5=C-6, side chain at C-17.',
    'Made in all cells from acetate; liver and intestinal mucosa; high rates also in intestines, adrenal glands and reproductive organs.',
    'Every carbon comes from acetate — from its methyl or its carbonyl carbon.',
    'Pyruvate–Malate cycle: citrate carries acetyl groups out; ATP-citrate lyase frees acetyl-CoA in the cytosol; malic enzyme makes NADPH.',
  ],
};

// ─── Lesson 2 ───────────────────────────────────────────────────────

const lesson2: Draft = {
  id: 'cholesterol-and-bile-biosynthesis-2',
  title: 'Acetyl-CoA to Mevalonate',
  description: 'The five stages, building HMG-CoA, its two fates, and the HMG-CoA reductase step.',
  xp: 25,
  sourceRefs: [...ref([2, 7, 8, 12, 14, 15]), ...leh(816, 817)],
  objectives: [
    'List the lecture’s five stages of cholesterol synthesis in order',
    'Describe how acetoacetyl-CoA and then HMG-CoA are formed',
    'Explain why HMG-CoA is a crossroads between mitochondria and cytosol',
    'Describe the HMG-CoA reductase step and its NADPH requirement',
  ],
  chunks: [
    {
      title: 'The pathway in five stages',
      kind: 'overview',
      paragraphs: ['The lecture divides cholesterol synthesis into five stages (slide 7):'],
      steps: [
        { label: '1. Acetyl-CoAs → HMG-CoA', detail: '3-hydroxy-3-methylglutaryl-CoA.' },
        { label: '2. HMG-CoA → mevalonate' },
        { label: '3. Mevalonate → isopentenyl pyrophosphate (IPP)', detail: 'An isoprene-based molecule; CO₂ is lost at the same time.' },
        { label: '4. IPP → squalene' },
        { label: '5. Squalene → cholesterol' },
      ],
      keyPoints: ['This lesson covers stages 1–2. Lesson 3 covers stages 3–5.'],
      sourceRefs: [...ref([7]), ...leh(816)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger describes the same pathway in FOUR stages, because it counts acetyl-CoA → mevalonate (the lecture’s stages 1 and 2) as one stage (p. 816). Same reactions, different grouping — learn the lecture’s five for this course.',
        },
      ],
    },
    {
      title: 'Stage 1: building HMG-CoA',
      kind: 'pathway',
      paragraphs: [
        'The mevalonate pathway starts when two molecules of acetyl-CoA condense to form acetoacetyl-CoA (slide 2).',
        'Acetoacetyl-CoA then combines with another acetyl-CoA and water to give 3-hydroxy-3-methylglutaryl-CoA — HMG-CoA (slide 8). So HMG-CoA is built from three acetyl-CoA units in total.',
      ],
      steps: [
        { label: 'Acetyl-CoA + acetyl-CoA → acetoacetyl-CoA' },
        { label: 'Acetoacetyl-CoA + acetyl-CoA + H₂O → HMG-CoA' },
      ],
      sourceRefs: [...ref([2, 7, 8]), ...leh(817)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger names the two enzymes: thiolase (two acetyl-CoA → acetoacetyl-CoA) and HMG-CoA synthase (→ HMG-CoA, a six-carbon compound) (p. 817).',
        },
      ],
    },
    {
      title: 'HMG-CoA at a crossroads',
      kind: 'comparison',
      paragraphs: ['Slide 8 shows that HMG-CoA has two possible fates, depending on where it is:'],
      table: {
        columns: ['', 'In the mitochondria', 'In the cytosol'],
        rows: [
          ['Enzyme (slide 8)', 'Cleavage enzyme', 'Reductase (HMG-CoA reductase)'],
          ['Product(s)', 'Acetoacetate + acetyl-CoA', 'Mevalonate'],
          ['Leads to', 'Not cholesterol', 'Cholesterol (stage 2 onward)'],
        ],
      },
      keyPoints: ['Only the reductase route — outside the mitochondria — leads on to cholesterol.'],
      sourceRefs: [...ref([8, 15]), ...leh(817)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger: the cytosolic HMG-CoA synthase of cholesterol synthesis is a different enzyme (isozyme) from the mitochondrial one used to make ketone bodies (p. 817) — the mitochondrial branch on slide 8, giving acetoacetate, is the ketone-body route.',
        },
        {
          kind: 'clarified',
          text: 'Slide 8 labels the reductase “in cytosol”; slide 15 says HMGR “is localized in the ER”. Both fit: Lehninger describes HMG-CoA reductase as an integral membrane protein of the smooth ER (p. 817) — outside the mitochondria, anchored in the ER membrane.',
        },
      ],
    },
    {
      title: 'Stage 2: HMG-CoA reductase',
      kind: 'mechanism',
      paragraphs: [
        'HMG-CoA reductase (HMGR) reduces HMG-CoA to mevalonate, using two NADPH (slide 12). Mevalonate gives the pathway its name — the mevalonate pathway.',
        'The lecture calls HMGR the primary mechanism for regulating cholesterol (slide 14). Lesson 4 shows how it is controlled.',
      ],
      terms: [
        { term: 'HMG-CoA reductase (HMGR)', meaning: 'HMG-CoA + 2 NADPH → mevalonate. The main control point of cholesterol synthesis.' },
        { term: 'Mevalonate', meaning: 'The product of stage 2, and the start of stage 3.' },
      ],
      keyPoints: ['HMG-CoA → mevalonate: HMG-CoA reductase, 2 NADPH — the key regulated step.'],
      sourceRefs: [...ref([8, 12, 14]), ...leh(817)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger: this reduction is the committed and rate-limiting step of cholesterol synthesis; each of the two NADPH donates two electrons (p. 817).',
        },
      ],
    },
  ],
  summary: [
    'Five stages: acetyl-CoA → HMG-CoA → mevalonate → IPP (CO₂ lost) → squalene → cholesterol.',
    'Two acetyl-CoA → acetoacetyl-CoA; + a third acetyl-CoA + H₂O → HMG-CoA.',
    'HMG-CoA in mitochondria: cleavage enzyme → acetoacetate + acetyl-CoA. In the cytosol: reductase → mevalonate.',
    'HMG-CoA reductase uses 2 NADPH and is the main control point (Lesson 4).',
  ],
};

// ─── Lesson 3 ───────────────────────────────────────────────────────

const lesson3: Draft = {
  id: 'cholesterol-and-bile-biosynthesis-3',
  title: 'Mevalonate to Cholesterol',
  description: 'From mevalonate to isoprene units, squalene and cholesterol — and what branches off on the way.',
  xp: 25,
  sourceRefs: [...ref([7, 9, 10, 11, 12]), ...leh(817, 818, 819, 820)],
  objectives: [
    'Trace mevalonate to isopentenyl pyrophosphate, with its ATP cost and CO₂ loss',
    'Explain how isopentenyl pyrophosphate units are joined into longer chains',
    'Put the intermediates from IPP to cholesterol in order',
    'Name the other products that branch off the pathway',
  ],
  chunks: [
    {
      title: 'Stage 3: mevalonate → isopentenyl pyrophosphate',
      kind: 'pathway',
      paragraphs: ['Slide 9 shows three ATP-driven steps:'],
      steps: [
        { label: 'Mevalonate → 5-phosphomevalonate', detail: 'ATP → ADP.' },
        { label: '5-Phosphomevalonate → 5-pyrophosphomevalonate', detail: 'ATP → ADP.' },
        { label: '5-Pyrophosphomevalonate → isopentenyl pyrophosphate (IPP)', detail: 'ATP → ADP + Pi + CO₂.' },
      ],
      keyPoints: [
        'Three ATP per mevalonate (slide 12: “(3) ATP”).',
        'CO₂ leaves in the last step — the “loss of CO₂” of stage 3.',
        'IPP is the isoprene-based building block.',
      ],
      sourceRefs: [...ref([7, 9, 12]), ...leh(817, 818)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger names the enzymes — mevalonate 5-phosphotransferase, phosphomevalonate kinase and pyrophosphomevalonate decarboxylase — and adds that IPP is isomerised to dimethylallyl pyrophosphate, the second “activated isoprene” (pp. 817–818).',
        },
      ],
    },
    {
      title: 'Stage 4: joining isoprene units',
      kind: 'mechanism',
      paragraphs: [
        'Slide 10 shows how the chain grows. An allylic substrate (a pyrophosphate ester) loses its pyrophosphate (PPi), leaving a positively charged carbon. Isopentenyl pyrophosphate attacks that carbon and joins on, forming a “condensation carbonium ion”, which becomes geranyl (or farnesyl) pyrophosphate.',
        'Each round adds one IPP unit and releases PPi. Repeated, it builds geranyl pyrophosphate, then farnesyl pyrophosphate, and on to squalene (slide 12).',
      ],
      terms: [
        { term: 'Isopentenyl pyrophosphate (IPP)', meaning: 'The isoprene unit added in each condensation.' },
        { term: 'Geranyl pyrophosphate', meaning: 'The first product of chain building.' },
        { term: 'Farnesyl pyrophosphate', meaning: 'One IPP longer than geranyl pyrophosphate; leads to squalene and to several branch products.' },
      ],
      sourceRefs: [...ref([10, 12]), ...leh(818, 819)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger: the first allylic substrate is dimethylallyl pyrophosphate. Head-to-tail condensation with IPP gives geranyl pyrophosphate (10 carbons); another IPP gives farnesyl pyrophosphate (15 carbons); two farnesyl pyrophosphates then join head to head to form squalene (30 carbons) (pp. 818–819).',
        },
      ],
    },
    {
      title: 'Stage 5: squalene → cholesterol',
      kind: 'pathway',
      paragraphs: [
        'Squalene is a long, linear C₃₀ molecule. Slide 11 draws it folded so you can see how it closes up into the four rings of cholesterol.',
        'The summary (slide 12) shows the order: squalene → lanosterol → (several steps) → cholesterol.',
      ],
      steps: [
        { label: 'Squalene (C₃₀, linear)' },
        { label: 'Lanosterol', detail: 'The ring system is formed.' },
        { label: 'Cholesterol', detail: 'Reached from lanosterol in several steps (dotted arrow on slide 12).' },
      ],
      keyPoints: ['IPP → geranyl PP → farnesyl PP → squalene → lanosterol → cholesterol.'],
      sourceRefs: [...ref([7, 11, 12]), ...leh(819, 820)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger: squalene monooxygenase first adds an oxygen (using O₂ and NADPH) to form squalene 2,3-epoxide; a cyclase then closes it into lanosterol, which already has the four rings of the steroid nucleus. About 20 further reactions — moving and removing methyl groups — turn lanosterol into cholesterol (pp. 819–820).',
        },
      ],
    },
    {
      title: 'What branches off the pathway',
      kind: 'overview',
      paragraphs: ['The pathway does not only make cholesterol. Slide 12 shows several branches:'],
      table: {
        columns: ['Starting from', 'Products (slide 12)'],
        rows: [
          ['Geranyl and farnesyl pyrophosphate', 'Prenylated proteins'],
          ['Farnesyl pyrophosphate', 'Heme a, dolichol, ubiquinone'],
          ['Cholesterol, in the liver', 'Bile salts (Lesson 5)'],
          ['Cholesterol, in endocrine glands', 'Steroids'],
        ],
      },
      keyPoints: ['Farnesyl pyrophosphate is the main branch point before squalene.'],
      sourceRefs: ref([12]),
    },
  ],
  summary: [
    'Mevalonate → 5-phosphomevalonate → 5-pyrophosphomevalonate → IPP: 3 ATP, CO₂ released.',
    'An allylic pyrophosphate loses PPi; IPP joins the positive carbon → geranyl, then farnesyl pyrophosphate.',
    'IPP → geranyl PP → farnesyl PP → squalene (C₃₀) → lanosterol → cholesterol.',
    'Branches: prenylated proteins (GPP, FPP); heme a, dolichol, ubiquinone (FPP); bile salts (liver); steroids (endocrine glands).',
  ],
};

// ─── Lesson 4 ───────────────────────────────────────────────────────

const lesson4: Draft = {
  id: 'cholesterol-and-bile-biosynthesis-4',
  title: 'Regulating Cholesterol Synthesis',
  description: 'How cells keep cholesterol steady, and the four ways HMG-CoA reductase is controlled.',
  xp: 30,
  sourceRefs: [...ref([13, 14, 15, 16, 17]), ...leh(826, 827)],
  objectives: [
    'List the mechanisms that keep a cell’s cholesterol supply steady',
    'Name the four ways HMG-CoA reductase is controlled',
    'Explain how cholesterol and sterols speed up HMGR degradation',
    'Explain how phosphorylation switches HMGR off, and which kinases and phosphatases act',
    'Predict the effect of glucagon, epinephrine and insulin on HMGR',
  ],
  chunks: [
    {
      title: 'Keeping the supply steady',
      kind: 'regulation',
      paragraphs: ['Slide 13 lists how the cellular supply of cholesterol is kept at a steady level:'],
      steps: [
        { label: 'Regulation of HMGR activity and levels' },
        { label: 'Handling excess intracellular free cholesterol', detail: 'Through acyl-CoA:cholesterol acyltransferase (ACAT).' },
        { label: 'Regulation of plasma cholesterol', detail: 'LDL receptor-mediated uptake and HDL-mediated reverse transport.' },
        { label: 'Utilisation of cholesterol' },
        { label: 'Regulation of cellular sterol content' },
      ],
      sourceRefs: [...ref([13]), ...leh(826)],
      notes: [
        {
          kind: 'check',
          text: 'Slide 13 introduces “three distinct mechanisms” and then lists five points. All five are taught here; how many your lecturer expects you to name is not quizzed — confirm with the lecturer.',
        },
        {
          kind: 'textbook',
          text: 'Lehninger: high intracellular cholesterol activates ACAT, which esterifies cholesterol for storage, and reduces transcription of the LDL-receptor gene, so less cholesterol is taken up from the blood (p. 826).',
        },
      ],
    },
    {
      title: 'HMGR: four controls',
      kind: 'regulation',
      paragraphs: ['HMGR is the primary cholesterol-regulating mechanism. The enzyme is controlled in four distinct ways (slide 14):'],
      terms: [
        { term: 'Feedback inhibition', meaning: 'Cholesterol inhibits HMGR that is already there.' },
        { term: 'Control of gene expression', meaning: 'How much new HMGR is made.' },
        { term: 'Rate of enzyme degradation', meaning: 'How fast existing HMGR is destroyed.' },
        { term: 'Phosphorylation–dephosphorylation', meaning: 'Covalent modification that switches HMGR off and on.' },
      ],
      sourceRefs: ref([14]),
    },
    {
      title: 'Cholesterol turns HMGR down — and destroys it',
      kind: 'regulation',
      paragraphs: [
        'Cholesterol acts as a feedback inhibitor of pre-existing HMGR, and it also induces rapid degradation of the enzyme: cholesterol triggers polyubiquitination of HMGR, which is then degraded in the proteasome (slide 14). A rise in intracellular cholesterol also inhibits the synthesis of HMGR (slide 16).',
        'The amount of HMGR also follows the flux through the mevalonate pathway (slide 15). When flux is high, HMGR is degraded faster; when flux is low, degradation slows. The lecture notes that this is easy to see with a statin drug: the statin lowers flux, so less HMGR is degraded.',
        'HMGR sits in the ER and contains a sterol-sensing domain (SSD). When sterol levels in the cell rise, the rate of HMGR degradation rises with them (slide 15).',
      ],
      terms: [
        { term: 'Polyubiquitination', meaning: 'Tagging HMGR with ubiquitin chains — the signal for its destruction in the proteasome.' },
        { term: 'Sterol-sensing domain (SSD)', meaning: 'Part of HMGR that responds to sterol levels: more sterols → faster HMGR degradation.' },
      ],
      keyPoints: ['High flux or high sterols → HMGR destroyed faster. Low flux (e.g. with a statin) → slower.'],
      sourceRefs: [...ref([14, 15, 16]), ...leh(826, 827)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger: statins (e.g. lovastatin) resemble mevalonate and are competitive inhibitors of HMG-CoA reductase, so they inhibit cholesterol synthesis; lovastatin lowers serum cholesterol by as much as 30% in people with one defective copy of the LDL-receptor gene (p. 827).',
        },
      ],
    },
    {
      title: 'Phosphorylation switches HMGR off',
      kind: 'mechanism',
      paragraphs: [
        'HMGR is most active in its unmodified, dephosphorylated form; phosphorylation decreases its activity (slides 14, 16).',
        'The phosphate is added by AMP-activated protein kinase (AMPK) — formerly called HMGR kinase. AMPK is itself controlled by phosphorylation: AMPK kinase (AMPKK) phosphorylates it, which activates it (slide 16). The diagram on slide 17 completes the cycle with two phosphatases:',
      ],
      table: {
        columns: ['Enzyme', 'What it does', 'Net effect on HMGR'],
        rows: [
          ['AMPK kinase (AMPKK)', 'Phosphorylates AMPK → active AMPK', 'Off (indirectly)'],
          ['AMP-activated protein kinase (AMPK)', 'Phosphorylates HMGR', 'Off'],
          ['HMG-CoA reductase phosphatase', 'Removes the phosphate from HMGR', 'On'],
          ['Protein phosphatase 2C', 'Removes the phosphate from AMPK → inactive AMPK', 'On (indirectly)'],
        ],
      },
      keyPoints: ['Phosphorylated HMGR = inactive. Dephosphorylated HMGR = active.'],
      sourceRefs: [...ref([14, 16, 17]), ...leh(826)],
    },
    {
      title: 'Hormones',
      kind: 'regulation',
      paragraphs: [
        'Glucagon and epinephrine reduce cholesterol synthesis; insulin increases it (slide 16). The slide-17 diagram shows the route for the inhibitory signal:',
      ],
      steps: [
        { label: 'Glucagon / epinephrine', detail: 'Increase the activity of PPI-1 (phosphoprotein phosphatase inhibitor-1).' },
        { label: 'cAMP activates PKA', detail: 'The signal on the diagram (+ve).' },
        { label: 'PKA phosphorylates PPI-1 → active PPI-1(a)' },
        { label: 'PPI-1(a) blocks the phosphatases', detail: 'HMG-CoA reductase phosphatase, protein phosphatase 2C and phosphoprotein phosphatase.' },
        { label: 'HMGR stays phosphorylated → inactive', detail: 'Less cholesterol is made.' },
      ],
      keyPoints: [
        'Glucagon and epinephrine → HMGR off.',
        'Insulin stimulates removal of the phosphates → HMGR on.',
        'High intracellular cholesterol inhibits both HMGR activity and its synthesis.',
      ],
      sourceRefs: [...ref([16, 17]), ...leh(826)],
      notes: [
        {
          kind: 'clarified',
          text: 'Slide 16 words this as “increasing the activity of the inhibitor of phosphoprotein phosphatase inhibitor-1, PPI-1”. The slide-17 diagram makes the meaning clear: PPI-1 is itself the inhibitor. Once PKA activates it, it blocks the phosphatases that would switch HMGR back on. Lehninger agrees on the outcome: glucagon promotes phosphorylation (inactivation) of HMG-CoA reductase; insulin promotes dephosphorylation (activation) (p. 826).',
        },
      ],
    },
  ],
  summary: [
    'Cholesterol supply is kept steady through HMGR, ACAT (excess free cholesterol), LDL-receptor uptake and HDL reverse transport, utilisation, and cellular sterol content.',
    'HMGR is controlled by feedback inhibition, gene expression, degradation and phosphorylation.',
    'Cholesterol inhibits HMGR and triggers its polyubiquitination and proteasomal degradation; rising sterols act through the sterol-sensing domain.',
    'High pathway flux → faster HMGR degradation; low flux (e.g. with a statin) → slower.',
    'AMPK phosphorylates HMGR (off); AMPKK activates AMPK; HMG-CoA reductase phosphatase switches HMGR back on.',
    'Glucagon and epinephrine (via PKA and PPI-1) keep HMGR phosphorylated; insulin dephosphorylates and activates it.',
  ],
};

// ─── Lesson 5 ───────────────────────────────────────────────────────

const lesson5: Draft = {
  id: 'cholesterol-and-bile-biosynthesis-5',
  title: 'Bile Acids: Synthesis and Functions',
  description: 'How the liver turns cholesterol into bile acids, how they are conjugated, and why they matter.',
  xp: 25,
  sourceRefs: [...ref([12, 18, 19, 20]), ...leh(820)],
  objectives: [
    'Describe the first step of bile acid synthesis and what it needs',
    'Name the two bile acid–CoA products formed from 7-hydroxycholesterol',
    'Recognise glycine and taurine conjugates',
    'List the four physiological functions of bile acids',
  ],
  chunks: [
    {
      title: 'From cholesterol to bile acids',
      kind: 'pathway',
      paragraphs: [
        'In the liver, cholesterol is turned into bile salts (slide 12). Slide 18 shows how:',
      ],
      steps: [
        { label: 'Cholesterol → 7-hydroxycholesterol', detail: '7α-hydroxylase; uses NADPH + H⁺ and O₂ (NADP⁺ formed). An –OH is added to the ring system.' },
        { label: '7-Hydroxycholesterol → cholyl-CoA', detail: 'Several steps; uses NADPH + H⁺, O₂ and 2 CoA-SH; propionyl-CoA is released.' },
        { label: '7-Hydroxycholesterol → chenodeoxycholyl-CoA', detail: 'Uses NADPH + H⁺, O₂ and 2 CoA-SH; propionyl-CoA is released.' },
      ],
      terms: [
        { term: '7α-Hydroxylase', meaning: 'The first enzyme: cholesterol → 7-hydroxycholesterol (needs NADPH + H⁺ and O₂).' },
        { term: 'Cholyl-CoA', meaning: 'A bile acid–CoA carrying three –OH groups.' },
        { term: 'Chenodeoxycholyl-CoA', meaning: 'A bile acid–CoA carrying two –OH groups.' },
        { term: 'Propionyl-CoA', meaning: 'Released as the side chain is shortened on the way to either product.' },
      ],
      keyPoints: ['Both products end as CoA thioesters (–CO–S-CoA) on a shortened side chain.'],
      sourceRefs: [...ref([12, 18]), ...leh(820)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger: bile acids and their salts are relatively hydrophilic cholesterol derivatives, synthesised in the liver, that aid lipid digestion (p. 820).',
        },
      ],
    },
    {
      title: 'Conjugation: glycine and taurine',
      kind: 'structure',
      paragraphs: [
        'Slide 19 shows two conjugated bile acids. In each, the bile acid’s side chain is joined through a –CO–NH– link to a small molecule:',
      ],
      table: {
        columns: ['Conjugated bile acid', 'Attached molecule', 'End of the side chain'],
        rows: [
          ['Glycocholic acid', 'Glycine', '–CO–NH–CH₂–COOH'],
          ['Taurocholic acid', 'Taurine', '–CO–NH–(CH₂)₂–SO₃H'],
        ],
      },
      keyPoints: ['Glyco- = glycine (ends in –COOH). Tauro- = taurine (ends in –SO₃H).'],
      sourceRefs: ref([19]),
    },
    {
      title: 'Why bile acids matter: four functions',
      kind: 'clinical',
      paragraphs: ['The lecture lists four physiologically significant functions (slide 20):'],
      steps: [
        { label: 'Eliminating excess cholesterol', detail: 'Bile acid synthesis and excretion in the faeces is the ONLY significant mechanism for eliminating excess cholesterol.' },
        { label: 'Keeping cholesterol dissolved in bile', detail: 'With phospholipids, bile acids solubilise cholesterol in the bile, preventing it from precipitating in the gall bladder.' },
        { label: 'Digesting fats', detail: 'As emulsifying agents, they make dietary triacylglycerols accessible to pancreatic lipases.' },
        { label: 'Absorbing fat-soluble vitamins', detail: 'They help the intestine absorb fat-soluble vitamins.' },
      ],
      sourceRefs: [...ref([20]), ...leh(827)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger: combining a statin with an edible resin that binds bile acids and stops their reabsorption from the intestine makes the treatment even more effective (p. 827) — bile acids lost in the faeces take cholesterol out of the body, as function 1 describes.',
        },
      ],
    },
  ],
  summary: [
    'Bile salts are made from cholesterol in the liver.',
    'First step: 7α-hydroxylase (NADPH + H⁺, O₂) → 7-hydroxycholesterol.',
    'Then several steps (NADPH, O₂, 2 CoA-SH; propionyl-CoA released) → cholyl-CoA (3 –OH) or chenodeoxycholyl-CoA (2 –OH).',
    'Conjugation: glycine → glycocholic acid; taurine → taurocholic acid.',
    'Functions: the only significant route for eliminating excess cholesterol; keep cholesterol dissolved in bile; emulsify fats for pancreatic lipases; help absorb fat-soluble vitamins.',
  ],
};

// Each lesson gets its interactive layer (learn by answering) and its
// reading extras (high-yield points, common confusions) from
// ./interactive.ts.
export const lessons: Draft[] = [lesson1, lesson2, lesson3, lesson4, lesson5].map((lesson) => ({
  ...lesson,
  ...readingExtras[lesson.id],
  interactive: interactive[lesson.id],
}));
