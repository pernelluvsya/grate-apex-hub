// Biochemistry → Haem and Haem Metabolism: the seven lessons (reading layer).
//
// Sources:
// - Two lecture decks by Edwin F. Laing define WHAT is taught: haem
//   synthesis (SYN, 42 slides) and haem catabolism (CAT, 20 slides). Their
//   pasted figures and textbook pages were read and written out in
//   ./sources.ts → diagrams; lessons teach from them.
// - Lehninger (leh(...)) only explains or settles points WITHIN that scope,
//   in 'textbook' or 'clarified' notes.
// - Unsettled points are 'check' notes and are never quizzed. The speaker
//   note on CAT slide 2 is an 'annotation'.
import type { LessonDraft } from '@/data/topics/build';
import { interactive, readingExtras } from '@/data/topics/heme-metabolism/interactive';
import { cat, leh, syn, type ConceptId } from '@/data/topics/heme-metabolism/sources';

type Draft = LessonDraft<ConceptId>;

// ─── Lesson 1 ───────────────────────────────────────────────────────

const lesson1: Draft = {
  id: 'heme-metabolism-1',
  title: 'Porphyrins and Haem',
  description: 'Where haem is found, the porphin ring, the porphyrin families and protoporphyrin IX.',
  xp: 20,
  sourceRefs: syn([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
  objectives: [
    'Name the main haem-containing proteins',
    'Describe the porphin ring: pyrroles, methene bridges, unsaturation',
    'Tell uro-, copro- and protoporphyrins apart by their side chains',
    'Explain why there are four uroporphyrins and fifteen protoporphyrins — and which one is in haem',
    'Describe how iron sits in haem, and which form of iron binds oxygen',
  ],
  chunks: [
    {
      title: 'Where haem is found',
      kind: 'overview',
      paragraphs: ['Haem is the prosthetic group of a whole family of proteins (slide 2):'],
      terms: [
        { term: 'Haemoglobin', meaning: 'In red blood cells.' },
        { term: 'Myoglobin', meaning: 'In red muscle. A globular monomer with tertiary structure; its haem is ferroprotoporphyrin IX (slide 3).' },
        { term: 'Cytochromes', meaning: 'In the respiratory chain.' },
        { term: 'Enzymes', meaning: 'Catalase, some peroxidases, tryptophan pyrrolase, prostaglandin synthase, the guanylate enzyme (see note) and nitric oxide synthase.' },
      ],
      sourceRefs: [...syn([2, 3]), ...leh(434)],
      notes: [
        {
          kind: 'clarified',
          text: 'Slide 2 lists “guanylate synthase”. The haem enzyme meant is most likely guanylyl (guanylate) cyclase: Lehninger describes a cytosolic guanylyl cyclase with a tightly bound haem group, activated by nitric oxide (p. 434).',
        },
      ],
    },
    {
      title: 'The porphin ring',
      kind: 'structure',
      paragraphs: [
        'All porphyrins are derived from porphin (C₂₀H₁₄N₄), which has no side chains (slides 4–6). Porphin is:',
      ],
      steps: [
        { label: 'Macrocyclic', detail: 'A big ring.' },
        { label: 'Highly unsaturated', detail: 'Many double bonds.' },
        { label: 'Built from four pyrrole rings', detail: 'Five-membered rings with a nitrogen at the apex.' },
        { label: 'Joined by four methene bridges', detail: '–CH= links between the pyrroles.' },
      ],
      keyPoints: [
        'The same macrocycle underlies chlorophyll, vitamin B₁₂, protoporphyrin, haem and bilirubin — molecules important in photosynthesis, respiration and digestion (slide 7).',
      ],
      sourceRefs: syn([4, 5, 6, 7, 8]),
    },
    {
      title: 'Side chains name the porphyrin',
      kind: 'classification',
      paragraphs: [
        'Porphyrins differ in the side chains on their four pyrroles. Haem synthesis passes through them in the order uro → copro → proto (slide 9):',
      ],
      table: {
        columns: ['Porphyrin', 'Side chains'],
        rows: [
          ['Uroporphyrin', 'Each pyrrole: one acetate (A) + one propionate (P)'],
          ['Coproporphyrin', 'Each pyrrole: one methyl + one propionate (the acetates have become methyls)'],
          ['Protoporphyrin', 'Four methyl, two vinyl, two propionate'],
        ],
      },
      keyPoints: ['Uro → copro: acetates → methyls. Copro → proto: two propionates → vinyls.'],
      sourceRefs: syn([9]),
    },
    {
      title: 'Isomers: why protoporphyrin IX',
      kind: 'structure',
      paragraphs: [
        'There are four ways to arrange an acetate and a propionate on each pyrrole around the ring, giving uroporphyrins I–IV. Type I has a regular alternation (-AP-AP-AP-AP-); type III has one pyrrole reversed (-AP-AP-AP-PA-). Natural porphyrins come from types I and III (slide 10).',
        'Slide 10 asks how many coproporphyrins there are. Each pyrrole still carries two different groups (methyl and propionate), so the same four arrangements exist — four coproporphyrins.',
        'Protoporphyrins carry three kinds of side chain, which allows fifteen isomers. The ninth, protoporphyrin IX, is the one present in haem proteins (slide 11).',
      ],
      keyPoints: ['4 uroporphyrins · 4 coproporphyrins · 15 protoporphyrins → protoporphyrin IX is in haem.'],
      sourceRefs: syn([10, 11]),
    },
    {
      title: 'Protoporphyrin IX and the iron',
      kind: 'structure',
      paragraphs: [
        'Slide 12 asks you to recognise protoporphyrin IX by its side chains: methyl groups on carbons 1, 3, 5 and 8; vinyl groups on 2 and 4; propionate groups on 6 and 7. The propionates (–CH₂–CH₂–COO⁻) are the longest side chains and the methyls the shortest.',
        'Haem is Fe-protoporphyrin IX (ferroprotoporphyrin IX): the iron binds the four nitrogens at the centre of the ring. The iron can form six bonds — four in the plane of the haem and one on each side of it (the fifth and sixth coordination positions).',
        'The iron can be ferrous (Fe²⁺) or ferric (Fe³⁺). Ferric haemoglobin is called methaemoglobin; only the ferrous form binds oxygen.',
      ],
      keyPoints: [
        'Methyl 1, 3, 5, 8 · vinyl 2, 4 · propionate 6, 7.',
        'Haem = ferroprotoporphyrin IX. Only Fe²⁺ haem binds O₂.',
      ],
      sourceRefs: syn([3, 11, 12]),
    },
  ],
  summary: [
    'Haem proteins: haemoglobin, myoglobin, cytochromes, catalase, peroxidases, tryptophan pyrrolase, prostaglandin synthase, NO synthase and others.',
    'Porphin: macrocyclic, highly unsaturated; four pyrroles joined by four methene (–CH=) bridges; C₂₀H₁₄N₄.',
    'Uroporphyrin (acetate + propionate) → coproporphyrin (methyl + propionate) → protoporphyrin (methyl, vinyl, propionate).',
    'Four uroporphyrin isomers (I–IV); fifteen protoporphyrins, of which IX is in haem.',
    'Haem = ferroprotoporphyrin IX; iron has six coordination positions; only ferrous (Fe²⁺) haem binds oxygen.',
  ],
};

// ─── Lesson 2 ───────────────────────────────────────────────────────

const lesson2: Draft = {
  id: 'heme-metabolism-2',
  title: 'Haem Synthesis I: ALA to Uroporphyrinogen III',
  description: 'The committed step, porphobilinogen, and how four pyrroles become an asymmetric ring.',
  xp: 25,
  sourceRefs: [...syn([13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 25]), ...leh(855)],
  objectives: [
    'Describe the first, committed step: glycine + succinyl-CoA → ALA',
    'Name where haem’s nitrogen and carbon atoms come from',
    'Describe how two ALA molecules make porphobilinogen',
    'Explain how PBG deaminase builds hydroxymethylbilane',
    'Explain why uroporphyrinogen III — not I — is made',
  ],
  chunks: [
    {
      title: 'Step 1: ALA synthase',
      kind: 'pathway',
      paragraphs: [
        'Haem synthesis begins with the condensation of glycine and succinyl-CoA, with decarboxylation, to form δ-aminolevulinic acid (ALA) — chemically a 4-oxo-pentanoic acid (5-amino-4-oxopentanoic acid) (slide 13).',
        'The enzyme is δ-aminolevulinate (ALA) synthase — a pyridoxal phosphate (PLP, vitamin B₆) enzyme in the mitochondria. This is the committed step of the pathway, and it is regulated (slides 14, 24).',
      ],
      steps: [{ label: 'Succinyl-CoA + glycine → ALA + CO₂ + CoA', detail: 'ALA synthase (PLP), in the mitochondria.' }],
      sourceRefs: [...syn([13, 14, 24]), ...leh(855)],
      notes: [
        {
          kind: 'clarified',
          text: 'The slide-25 figure writes “Glycine + Succinate”. The lecture’s text (slide 13) and its other figures (slides 14, 24, 29, 40) give succinyl-CoA, as does Lehninger (p. 855): the succinyl group comes from succinyl-CoA.',
        },
      ],
    },
    {
      title: 'Where haem’s atoms come from',
      kind: 'overview',
      paragraphs: [
        'The labelling studies on slides 14–15 trace every atom: haem’s nitrogens come from glycine; 8 of its carbons come from glycine’s α-carbon (none from glycine’s carboxyl carbon, which is lost as CO₂); the other 26 carbons come from acetate, by way of succinyl-CoA.',
        'Succinyl-CoA is supplied by the TCA cycle in the mitochondria (slide 24).',
      ],
      keyPoints: ['All four nitrogens of haem come from glycine.'],
      sourceRefs: syn([14, 15, 24]),
    },
    {
      title: 'Step 2: two ALA → porphobilinogen',
      kind: 'pathway',
      paragraphs: [
        'ALA dehydrase (also called ALA dehydratase or porphobilinogen synthase) condenses two molecules of ALA, removing two molecules of water, to form porphobilinogen (PBG) — the first pyrrole of the pathway (slides 15–16).',
        'This enzyme works in the cytosol and needs zinc (slide 24). Its zinc sites matter in lead poisoning (Lesson 5).',
      ],
      steps: [{ label: '2 ALA → porphobilinogen + 2 H₂O', detail: 'ALA dehydrase (PBG synthase); cytosol; zinc.' }],
      sourceRefs: syn([15, 16, 24]),
    },
    {
      title: 'Step 3: PBG deaminase builds a chain',
      kind: 'mechanism',
      paragraphs: [
        'Porphobilinogen deaminase (also called uroporphyrinogen I synthase) carries a dipyrromethane prosthetic group, linked at its active site through a cysteine sulphur. The enzyme makes this prosthetic group itself (slide 17).',
        'PBG units are added to the dipyrromethane until a linear hexapyrrole has formed (slide 18). Hydrolysis of the link to the enzyme’s own dipyrromethane then releases the linear tetrapyrrole hydroxymethylbilane (slide 19). An ammonium ion (NH₄⁺) is released for each bridge formed between pyrroles (slide 15).',
      ],
      steps: [
        { label: 'Dipyrromethane cofactor on the enzyme', detail: 'Attached through a cysteine S; made by the enzyme itself.' },
        { label: 'Four PBG units added', detail: 'Giving a linear hexapyrrole on the enzyme.' },
        { label: 'Hydrolysis releases hydroxymethylbilane', detail: 'A linear tetrapyrrole; the cofactor stays on the enzyme.' },
      ],
      sourceRefs: syn([15, 17, 18, 19]),
    },
    {
      title: 'Step 4: closing the ring — III, not I',
      kind: 'comparison',
      paragraphs: [
        'Uroporphyrinogen III synthase (cosynthase) closes hydroxymethylbilane into the macrocyclic uroporphyrinogen III. While closing the ring it flips one pyrrole over — thought to happen via a spiro intermediate — so the product is asymmetric (slides 20–22).',
        'Without the cosynthase, hydroxymethylbilane cyclises spontaneously to uroporphyrinogen I. With it, the reaction goes mainly down the series III pathway, which leads to haem (slide 25).',
      ],
      table: {
        columns: ['', 'Uroporphyrinogen I', 'Uroporphyrinogen III'],
        rows: [
          ['Formed by', 'Spontaneous cyclisation (PBG deaminase alone)', 'Uroporphyrinogen III synthase (cosynthase)'],
          ['Side-chain order', 'Regular: -AP-AP-AP-AP- (symmetric)', 'One pyrrole flipped: -AP-AP-AP-PA- (asymmetric)'],
          ['Leads to haem?', 'No (→ coproporphyrinogen I)', 'Yes'],
        ],
      },
      keyPoints: ['Same enzyme, different names: ALA dehydrase = PBG synthase; PBG deaminase = uroporphyrinogen I synthase; uroporphyrinogen III synthase = cosynthase.'],
      sourceRefs: syn([10, 20, 21, 22, 25]),
    },
  ],
  summary: [
    'Glycine + succinyl-CoA → ALA (+ CO₂ + CoA): ALA synthase, a PLP enzyme in mitochondria — the committed step.',
    'Haem’s nitrogens come from glycine; 8 carbons from glycine’s α-carbon, 26 from acetate (via succinyl-CoA).',
    '2 ALA → porphobilinogen + 2 H₂O: ALA dehydrase (PBG synthase), cytosolic, zinc-dependent.',
    'PBG deaminase (dipyrromethane cofactor) joins four PBG → hydroxymethylbilane (linear), releasing NH₄⁺.',
    'Uroporphyrinogen III synthase closes the ring and flips one pyrrole → uroporphyrinogen III; alone, HMB gives uroporphyrinogen I.',
  ],
};

// ─── Lesson 3 ───────────────────────────────────────────────────────

const lesson3: Draft = {
  id: 'heme-metabolism-3',
  title: 'Haem Synthesis II: From Uroporphyrinogen to Haem',
  description: 'The last four steps, the vinyl groups, inserting iron, and the two compartments.',
  xp: 25,
  sourceRefs: [...syn([23, 24, 25, 40]), ...leh(855)],
  objectives: [
    'Describe the decarboxylation of uroporphyrinogen III',
    'Explain how coproporphyrinogen oxidase makes the two vinyl groups',
    'Describe the last two steps: protoporphyrinogen oxidase and ferrochelatase',
    'Say which steps happen in the mitochondria and which in the cytosol',
  ],
  chunks: [
    {
      title: 'Step 5: uroporphyrinogen decarboxylase',
      kind: 'pathway',
      paragraphs: [
        'Uroporphyrinogen decarboxylase removes CO₂ from the four acetate side chains of uroporphyrinogen III, turning them into methyl groups. The product is coproporphyrinogen III. This step is in the cytosol (slides 23–24).',
      ],
      steps: [{ label: 'Uroporphyrinogen III → coproporphyrinogen III', detail: 'Four acetates → four methyls (4 CO₂); cytosol.' }],
      sourceRefs: syn([23, 24, 25]),
    },
    {
      title: 'Step 6: coproporphyrinogen oxidase',
      kind: 'mechanism',
      paragraphs: [
        'Coproporphyrinogen oxidase is a mitochondrial enzyme. It decarboxylates and dehydrogenates (an “oxido-decarboxylation”) the propionate side chains at positions 2 and 4, converting them into vinyl groups. The product is protoporphyrinogen IX (slides 23–24).',
      ],
      steps: [{ label: 'Coproporphyrinogen III → protoporphyrinogen IX', detail: 'Propionates at 2 and 4 → vinyls; mitochondria.' }],
      keyPoints: ['The two vinyl groups of haem are made here.'],
      sourceRefs: syn([23, 24, 25]),
    },
    {
      title: 'Steps 7–8: protoporphyrin IX, then iron',
      kind: 'pathway',
      paragraphs: [
        'Protoporphyrinogen oxidase oxidises protoporphyrinogen IX to protoporphyrin IX. Finally ferrochelatase (haem synthase), located on the inner mitochondrial membrane, inserts ferrous iron (Fe²⁺) into protoporphyrin IX to form haem (slides 24, 25, 40).',
      ],
      steps: [
        { label: 'Protoporphyrinogen IX → protoporphyrin IX', detail: 'Protoporphyrinogen oxidase.' },
        { label: 'Protoporphyrin IX + Fe²⁺ → haem', detail: 'Ferrochelatase, inner mitochondrial membrane.' },
      ],
      sourceRefs: [...syn([24, 25, 40]), ...leh(855)],
      notes: [{ kind: 'textbook', text: 'Lehninger: the iron atom is incorporated after the protoporphyrin has been assembled, in the step catalysed by ferrochelatase (p. 855).' }],
    },
    {
      title: 'Two compartments',
      kind: 'overview',
      paragraphs: ['Slide 24 (“Compartmentalization”) shows the pathway leaving the mitochondrion and coming back:'],
      table: {
        columns: ['Step', 'Enzyme', 'Where'],
        rows: [
          ['1', 'ALA synthase', 'Mitochondria'],
          ['2', 'ALA dehydrase (PBG synthase)', 'Cytosol'],
          ['3', 'PBG deaminase', 'Cytosol'],
          ['4', 'Uroporphyrinogen III synthase', 'Cytosol'],
          ['5', 'Uroporphyrinogen decarboxylase', 'Cytosol'],
          ['6', 'Coproporphyrinogen oxidase', 'Mitochondria'],
          ['7', 'Protoporphyrinogen oxidase', 'Mitochondria'],
          ['8', 'Ferrochelatase', 'Mitochondria (inner membrane)'],
        ],
      },
      keyPoints: [
        'First step and last three: mitochondria. Middle four: cytosol.',
        'Only PBG synthase needs a metal activator — zinc.',
        'The four cytosolic enzymes are kept in red cells after they lose their mitochondria.',
      ],
      sourceRefs: syn([24]),
    },
  ],
  summary: [
    'Uroporphyrinogen decarboxylase (cytosol): four acetates → methyls → coproporphyrinogen III.',
    'Coproporphyrinogen oxidase (mitochondria): propionates at 2 and 4 → vinyls → protoporphyrinogen IX.',
    'Protoporphyrinogen oxidase → protoporphyrin IX; ferrochelatase (inner mitochondrial membrane) adds Fe²⁺ → haem.',
    'Mitochondria: steps 1, 6, 7, 8. Cytosol: steps 2–5. Only PBG synthase needs zinc.',
  ],
};

// ─── Lesson 4 ───────────────────────────────────────────────────────

const lesson4: Draft = {
  id: 'heme-metabolism-4',
  title: 'Regulating Haem Synthesis',
  description: 'ALA synthase as the control point, liver vs red cells, hemin and globin, and hemin as a drug.',
  xp: 25,
  sourceRefs: [...syn([24, 26, 27, 28, 29, 30, 31, 32, 39, 40]), ...leh(855)],
  objectives: [
    'Explain why ALA synthase is the control point and how haem regulates it',
    'Contrast haem synthesis in the liver and in developing red cells',
    'Explain how hemin keeps haem and globin synthesis in balance',
    'Describe hemin as a drug and why it helps in porphyria attacks',
  ],
  chunks: [
    {
      title: 'ALA synthase: the control point',
      kind: 'regulation',
      paragraphs: [
        'ALA synthase catalyses the committed step of haem synthesis and is usually rate-limiting for the whole pathway (slide 26).',
        'It is regulated mainly through control of gene transcription: haem acts as a feedback inhibitor, repressing transcription of the ALA synthase gene in most cells. Excess haem also inhibits the enzyme already made (slides 24, 40).',
        'Developing red cells express their own variant of ALA synthase, which is regulated instead by the availability of iron, in the form of iron–sulphur clusters (slide 26).',
      ],
      keyPoints: ['Haem ↑ → ALA synthase gene repressed (and existing enzyme inhibited) → less haem made.'],
      sourceRefs: [...syn([24, 26, 40]), ...leh(855)],
      notes: [{ kind: 'textbook', text: 'Lehninger: porphyrin synthesis in higher eukaryotes is regulated by the concentration of haem, which serves as a feedback inhibitor of early steps of the pathway (p. 855).' }],
    },
    {
      title: 'Liver vs red cells',
      kind: 'comparison',
      paragraphs: ['Two tissues make most of the body’s haem (slides 27–28):'],
      table: {
        columns: ['', 'Liver', 'Immature red cells'],
        rows: [
          ['Share', 'The main non-red-cell source', 'About 85% of all haem synthesis'],
          ['Haem used for', 'Mainly cytochrome P450 enzymes (detoxification)', 'Haemoglobin; haem also stimulates protein synthesis in reticulocytes'],
          ['Control', 'ALA synthase — forming 5-ALA is rate-limiting', 'Also at ferrochelatase and PBG deaminase; the red-cell ALA synthase responds to iron'],
          ['Stops?', 'No', 'Yes — synthesis ceases when red cells mature'],
        ],
      },
      sourceRefs: syn([26, 27, 28]),
    },
    {
      title: 'Hemin keeps haem and globin in step',
      kind: 'regulation',
      paragraphs: ['Slide 29 shows how a red-cell precursor avoids making too much haem or too much globin:'],
      steps: [
        { label: 'Free haem accumulates', detail: 'It is spontaneously oxidised to hemin.' },
        { label: 'Hemin represses ALA synthase', detail: 'Less is made, and its transfer from the cytosol into the mitochondria may be blocked.' },
        { label: 'Hemin inhibits the eIF2 kinase', detail: 'That kinase phosphorylates eIF2 (a translation initiation factor), inactivating it.' },
        { label: 'eIF2 stays active → globin is made', detail: 'More globin combines with the excess haem.' },
      ],
      keyPoints: ['Neither haem nor globin is allowed to get ahead of the other.'],
      sourceRefs: syn([29]),
    },
    {
      title: 'Hemin as a drug',
      kind: 'clinical',
      paragraphs: [
        'Hemin (trade name Panhematin) is protoporphyrin IX containing ferric iron (haem B) with a chloride ligand. It is given by intravenous infusion and used to manage porphyria attacks, particularly in acute intermittent porphyria (slides 30–32).',
        'It works by providing negative feedback to the haem pathway — just as haem represses ALA synthase — so the toxic precursors stop accumulating (slide 39).',
        'Hematin is similar but has a hydroxide in place of the chloride (the names are sometimes used interchangeably). Hematin is the “X factor” that Haemophilus influenzae needs to grow (slide 32).',
      ],
      keyPoints: ['Hemin = ferric protoporphyrin IX + chloride; IV; treats porphyria attacks by feedback repression.'],
      sourceRefs: syn([30, 31, 32, 39]),
    },
  ],
  summary: [
    'ALA synthase: committed and usually rate-limiting; haem represses its gene (and inhibits the enzyme).',
    'The red-cell ALA synthase variant is regulated by iron (iron–sulphur clusters).',
    'Liver: main non-red-cell source; haem for cytochrome P450. Immature red cells: ~85% of haem; stops at maturity; also controlled at ferrochelatase and PBG deaminase.',
    'Hemin represses ALA synthase and inhibits the eIF2 kinase, so globin synthesis keeps pace with haem.',
    'Hemin (IV) treats porphyria attacks by negative feedback; hematin is the X factor for H. influenzae.',
  ],
};

// ─── Lesson 5 ───────────────────────────────────────────────────────

const lesson5: Draft = {
  id: 'heme-metabolism-5',
  title: 'Porphyrias and Lead Poisoning',
  description: 'What an enzyme block does, the porphyrias, and how lead disrupts haem synthesis.',
  xp: 30,
  sourceRefs: [...syn([35, 36, 37, 38, 39, 40, 41, 42]), ...leh(857)],
  objectives: [
    'Predict what an enzyme block does to a pathway',
    'Describe what porphyrias are, how they are inherited, triggered and treated',
    'Match each haem-pathway enzyme to its porphyria',
    'Describe acute intermittent porphyria and porphyria cutanea tarda',
    'Explain how lead disrupts haem synthesis and how it is detected',
  ],
  chunks: [
    {
      title: 'What an enzyme block does',
      kind: 'overview',
      paragraphs: [
        'Slide 38 sets out the principle behind inborn errors of metabolism. In a pathway S → I₁ → I₂ → I₃ → P₁, a block at one enzyme has predictable effects:',
      ],
      steps: [
        { label: 'Material before the block accumulates', detail: 'The substrate and intermediates upstream build up.' },
        { label: 'The main product falls', detail: 'Less P₁ is made.' },
        { label: 'An alternative pathway may take over', detail: 'Upstream intermediates are diverted to another product (P₂).' },
        { label: 'Excretion or deposition in tissues', detail: 'Accumulated material is excreted or deposited.' },
      ],
      sourceRefs: syn([38]),
    },
    {
      title: 'Porphyrias',
      kind: 'clinical',
      paragraphs: ['Slide 39:'],
      steps: [
        { label: 'Rare disorders', detail: 'Caused by deficiencies of enzymes of the haem biosynthetic pathway.' },
        { label: 'Mostly autosomal dominant', detail: 'Affected people have 50% of normal enzyme levels and can still make some haem.' },
        { label: 'Precursors accumulate', detail: 'Haem precursors (porphyrins) are toxic at high concentrations.' },
        { label: 'Attacks are triggered', detail: 'By certain drugs, chemicals and foods, and by exposure to sun.' },
        { label: 'Treatment: hemin', detail: 'Negative feedback on the pathway prevents precursors accumulating.' },
      ],
      sourceRefs: [...syn([39]), ...leh(857)],
      notes: [{ kind: 'textbook', text: 'Lehninger (Box 22-1): most affected people are heterozygotes and usually have no symptoms, because one normal gene copy gives enough enzyme; nutritional or environmental factors can then cause ALA and porphobilinogen to build up, leading to attacks of acute abdominal pain and neurological dysfunction (p. 857).' }],
    },
    {
      title: 'Which enzyme, which porphyria',
      kind: 'classification',
      paragraphs: ['Slide 40 places each porphyria at its enzyme:'],
      table: {
        columns: ['Deficient enzyme', 'Porphyria'],
        rows: [
          ['δ-ALA dehydratase', 'δ-ALA dehydratase porphyria'],
          ['Porphobilinogen deaminase', 'Acute intermittent porphyria'],
          ['Uroporphyrinogen III cosynthase', 'Congenital erythropoietic porphyria'],
          ['Uroporphyrinogen decarboxylase', 'Porphyria cutanea tarda'],
          ['Coproporphyrinogen oxidase', 'Hereditary coproporphyria'],
          ['Protoporphyrinogen oxidase', 'Variegate porphyria'],
          ['Ferrochelatase', 'Erythropoietic protoporphyria'],
        ],
      },
      sourceRefs: syn([40]),
    },
    {
      title: 'Acute intermittent porphyria',
      kind: 'clinical',
      paragraphs: ['Slide 41:'],
      terms: [
        { term: 'Type', meaning: 'Hepatic; autosomal dominant.' },
        { term: 'Deficient enzyme', meaning: 'Porphobilinogen deaminase (PBG → … → uroporphyrinogen III).' },
        { term: 'What accumulates', meaning: 'PBG, uroporphyrin and 5-ALA — in plasma and urine.' },
        { term: 'Symptoms', meaning: 'Neuropsychiatric symptoms and abdominal pain (“neurovisceral”).' },
      ],
      sourceRefs: [...syn([41]), ...leh(857)],
    },
    {
      title: 'Porphyria cutanea tarda',
      kind: 'clinical',
      paragraphs: ['Slide 42:'],
      terms: [
        { term: 'Type', meaning: 'Hepatic; autosomal dominant.' },
        { term: 'Deficient enzyme', meaning: 'Uroporphyrinogen decarboxylase (uroporphyrinogen III → coproporphyrinogen III).' },
        { term: 'What accumulates', meaning: 'Uroporphyrinogen, found in urine.' },
        { term: 'Symptoms', meaning: 'Cutaneous photosensitivity.' },
      ],
      steps: [
        { label: 'Porphyrinogens accumulate' },
        { label: 'Light converts them to porphyrins' },
        { label: 'Porphyrins react with O₂ → oxygen radicals' },
        { label: 'Radicals severely damage the skin' },
      ],
      sourceRefs: syn([42]),
      notes: [
        {
          kind: 'check',
          text: 'The lecture calls porphyria cutanea tarda the “most common porphyria”. Lehninger (Box 22-1, p. 857) says the most common form is acute intermittent porphyria. Confirm with your lecturer — this point is not quizzed.',
        },
      ],
    },
    {
      title: 'Lead poisoning',
      kind: 'clinical',
      paragraphs: [
        'Lead inhibits ALA dehydrase (porphobilinogen synthase) most strongly, and ferrochelatase (haem synthase) (slides 35–36). PBG synthase’s zinc-binding sites, which include cysteine sulphur ligands, can bind Pb²⁺ instead (slide 37).',
        'ALA, protoporphyrin and coproporphyrin appear in the urine, and the symptoms are like those of acute intermittent porphyria (slide 35). Blood ALA rises not only because its enzyme is blocked: impaired haem synthesis also de-represses transcription of the ALA synthase gene (slide 37).',
        'High ALA is thought to cause some of the neurological effects (lead may also act on the nervous system directly). ALA may be toxic to the brain because its structure resembles the neurotransmitter GABA, and because ALA autoxidation generates reactive oxygen species (slide 37).',
      ],
      table: {
        columns: ['Laboratory sign (slide 36)', 'Why'],
        rows: [
          ['↑ Urinary ALA', 'ALA dehydrase is blocked'],
          ['↑ Urinary coproporphyrin', 'A secondary effect of blocked haem synthesis'],
          ['↓ Erythrocyte ALA dehydratase activity', 'Reflects acute exposure'],
          ['↑ Erythrocyte protoporphyrin (as zinc protoporphyrin)', 'Ferrochelatase is blocked; reflects chronic exposure'],
        ],
      },
      sourceRefs: syn([35, 36, 37]),
      notes: [
        {
          kind: 'check',
          text: 'Slide 35 lists ALA synthase among the enzymes lead inhibits (less than ALA dehydrase), while slide 37 explains that the ALA synthase gene is de-repressed in lead poisoning. Both agree that ALA dehydrase and ferrochelatase are the key targets; whether ALA synthase activity is itself inhibited is not quizzed.',
        },
      ],
    },
  ],
  summary: [
    'An enzyme block: upstream material accumulates, product falls, alternative pathways open, material is excreted or deposited.',
    'Porphyrias: rare, mostly autosomal dominant (50% enzyme), toxic precursor build-up, attacks triggered by drugs, chemicals, foods and sun; treated with hemin.',
    'PBG deaminase → AIP (neurovisceral; PBG and ALA accumulate). Uroporphyrinogen decarboxylase → PCT (photosensitivity).',
    'Other pairs: ALA dehydratase porphyria, congenital erythropoietic porphyria (cosynthase), hereditary coproporphyria, variegate porphyria, erythropoietic protoporphyria (ferrochelatase).',
    'Lead blocks ALA dehydrase (zinc sites) and ferrochelatase: ALA, coproporphyrin and (zinc) protoporphyrin rise; symptoms mimic AIP.',
  ],
};

// ─── Lesson 6 ───────────────────────────────────────────────────────

const lesson6: Draft = {
  id: 'heme-metabolism-6',
  title: 'Haem Catabolism: Haem to Bilirubin',
  description: 'Where the haem comes from, haem oxygenase, biliverdin reductase and the macrophage.',
  xp: 25,
  sourceRefs: [...cat([1, 2, 3, 4, 12, 19, 20]), ...leh(855)],
  objectives: [
    'List the sources of the haem that is broken down',
    'Describe haem oxygenase: what it cuts, what it releases and what it will not act on',
    'Describe the conversion of biliverdin to bilirubin',
    'Follow a red cell through the macrophage: globin, iron and bilirubin',
  ],
  chunks: [
    {
      title: 'Where the haem comes from',
      kind: 'overview',
      paragraphs: ['Haem for breakdown comes from (slide 2):'],
      steps: [
        { label: 'Haemoglobin of senescent red cells', detail: 'Removed from the circulation by the reticuloendothelial system, especially in the spleen.' },
        { label: 'Cytochrome P450 enzymes' },
        { label: 'Other haem proteins' },
        { label: 'Ineffective erythropoiesis', detail: 'e.g. pernicious anaemia and thalassaemia.' },
      ],
      keyPoints: ['Daily bilirubin production is about 250–300 mg: ~85% from the haemoglobin of senescent red cells, ~15% from ineffective erythropoiesis and other haem proteins (textbook page, slide 4).'],
      sourceRefs: cat([2, 4]),
      notes: [{ kind: 'annotation', text: 'A speaker note added to slide 2 says other haem proteins are a minor source (<5–10%): myoglobin (muscle), catalase, peroxidase, other (mitochondrial) cytochromes, tryptophan pyrrolase. Not quizzed until confirmed.' }],
    },
    {
      title: 'Haem oxygenase',
      kind: 'mechanism',
      paragraphs: ['The first enzyme of haem breakdown is unusual in several ways (slide 3):'],
      steps: [
        { label: 'Substrate inducible', detail: 'More haem → more enzyme.' },
        { label: 'Cleaves one specific methine bridge', detail: 'The bridge joining the two pyrroles that carry the vinyl groups (the α-methene bridge, slide 4).' },
        { label: 'The only reaction that releases CO in the body', detail: 'Endogenous carbon monoxide comes from here.' },
        { label: 'Acts only on haem', detail: 'Free protoporphyrin IX is not a substrate.' },
      ],
      keyPoints: ['Haem + O₂ + NADPH → biliverdin + CO + iron (slides 4, 20).'],
      sourceRefs: [...cat([3, 4, 20]), ...leh(855)],
      notes: [
        {
          kind: 'textbook',
          text: 'The figures on slides 4 and 20 show the enzyme working with O₂ and NADPH, supplied through the microsomal electron-transport system (cytochrome P450 reductase). The CO is excreted via the lungs and the iron is reused. Lehninger adds that the CO made this way keeps about 1% of a person’s haem complexed with CO (p. 855).',
        },
        {
          kind: 'check',
          text: 'Sources differ on the iron’s oxidation state: the textbook page on slide 4 says ferric iron is produced; the slide-20 figure (and Lehninger) show Fe²⁺. Not quizzed.',
        },
      ],
    },
    {
      title: 'Biliverdin → bilirubin',
      kind: 'pathway',
      paragraphs: [
        'Haem oxygenase leaves the green pigment biliverdin IXα, a linear tetrapyrrole. Biliverdin reductase — a cytosolic, NADPH-dependent enzyme — reduces it to the orange-yellow bilirubin IXα (slides 4, 20).',
      ],
      steps: [
        { label: 'Haem → biliverdin (green)', detail: 'Haem oxygenase; CO and iron released.' },
        { label: 'Biliverdin → bilirubin (orange-yellow)', detail: 'Biliverdin reductase; NADPH.' },
      ],
      sourceRefs: [...cat([4, 20]), ...leh(855)],
      notes: [{ kind: 'textbook', text: 'Lehninger: a bruise shows this pathway — purple-black (haemoglobin) turns green (biliverdin), then yellow (bilirubin) (p. 855).' }],
    },
    {
      title: 'Inside the macrophage',
      kind: 'pathway',
      paragraphs: ['Slides 12 and 19 follow a worn-out red cell:'],
      steps: [
        { label: 'Effete red cell phagocytosed by a macrophage', detail: 'Degraded in the phagolysosome → haem + globin.' },
        { label: 'Globin → amino acids' },
        { label: 'Iron', detail: 'Stored (ferritin or haemosiderin), added to proteins, or released to transferrin with the aid of ceruloplasmin.' },
        { label: 'Porphyrin → unconjugated bilirubin', detail: 'Leaves the macrophage bound to albumin (Lesson 7).' },
      ],
      sourceRefs: cat([12, 19]),
    },
  ],
  summary: [
    'Haem comes mainly from senescent red cells (reticuloendothelial system, especially spleen), plus P450 and other haem proteins and ineffective erythropoiesis.',
    'Haem oxygenase: substrate inducible; opens the bridge between the two vinyl-bearing pyrroles; the body’s only source of CO; does not act on free protoporphyrin IX.',
    'Haem → biliverdin (green) + CO + iron; biliverdin reductase (NADPH) → bilirubin (orange-yellow).',
    'In the macrophage: globin → amino acids; iron → ferritin/haemosiderin or transferrin; bilirubin leaves bound to albumin.',
  ],
};

// ─── Lesson 7 ───────────────────────────────────────────────────────

const lesson7: Draft = {
  id: 'heme-metabolism-7',
  title: 'Bilirubin: Conjugation, Excretion and Jaundice',
  description: 'Albumin transport, glucuronide conjugation, urobilinogens, the causes of jaundice, phototherapy.',
  xp: 30,
  sourceRefs: [...cat([5, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 20]), ...leh(856)],
  objectives: [
    'Describe how bilirubin travels to the liver',
    'Describe the conjugation reaction and why it matters',
    'Follow conjugated bilirubin through the gut: urobilinogens, urobilins and recirculation',
    'Classify causes of jaundice as prehepatic, hepatic or posthepatic',
    'Explain how phototherapy treats neonatal jaundice',
  ],
  chunks: [
    {
      title: 'To the liver',
      kind: 'pathway',
      paragraphs: [
        'Unconjugated bilirubin is transported to the liver bound to albumin and α-globulins (slide 9). It is taken up across the hepatocyte’s sinusoidal membrane and, inside, bound by cytosolic proteins such as ligandin (textbook page, slide 5).',
      ],
      sourceRefs: [...cat([5, 9, 12]), ...leh(856)],
      notes: [{ kind: 'textbook', text: 'Lehninger: bilirubin is largely insoluble, so it travels in the bloodstream as a complex with serum albumin (p. 856).' }],
    },
    {
      title: 'Conjugation',
      kind: 'mechanism',
      paragraphs: [
        'In the liver, each of bilirubin’s two propionic acid side chains is esterified to the hydroxyl group at C-1 of glucuronic acid, forming water-soluble bilirubin diglucuronide (slide 9).',
        'The enzyme is UDP-glucuronyl transferase — also called UDP-glucuronosyl transferase (UGT), “the conjugating enzyme” (slide 5). It sits in the endoplasmic reticulum, and the conjugated bilirubin is then excreted into bile (textbook page, slide 5).',
      ],
      steps: [{ label: 'Bilirubin + 2 UDP-glucuronate → bilirubin diglucuronide + 2 UDP', detail: 'UDP-glucuronyl transferase (slide 8).' }],
      keyPoints: ['Conjugation makes bilirubin water-soluble so it can leave in bile.'],
      sourceRefs: [...cat([5, 8, 9, 10]), ...leh(856)],
    },
    {
      title: 'In the gut',
      kind: 'pathway',
      paragraphs: ['Slide 11 follows bilirubin diglucuronide after it reaches the intestine:'],
      steps: [
        { label: 'Poorly absorbed', detail: 'The intestinal mucosa absorbs little of it.' },
        { label: 'Glucuronides removed', detail: 'By bacterial hydrolases (slide 11: terminal ileum and large intestine).' },
        { label: 'Reduced to urobilinogens', detail: 'Colourless linear tetrapyrroles (stercobilinogens).' },
        { label: 'Oxidised to urobilins', detail: 'Coloured products (stercobilins).' },
      ],
      keyPoints: [
        'Some urobilinogen is reabsorbed and returns to the liver — enterohepatic recirculation (slide 20); the textbook page on slide 5 puts this at up to ~20%, with 2–5% reaching the urine.',
      ],
      sourceRefs: [...cat([5, 11, 20]), ...leh(856)],
      notes: [
        { kind: 'textbook', text: 'Lehninger: urobilin formed from reabsorbed urobilinogen gives urine its yellow colour; stercobilin gives faeces their red-brown colour (p. 856).' },
        { kind: 'check', text: 'Slide 11 says the glucuronides are removed in the terminal ileum and large intestine by bacterial hydrolases; the textbook page on slide 5 says β-glucuronidase from liver, intestinal cells and bacteria acts in the upper small intestine. The site is not quizzed.' },
      ],
    },
    {
      title: 'Causes of jaundice',
      kind: 'clinical',
      paragraphs: [
        'Jaundice is the yellowing of the skin and eyes when bilirubin builds up in the blood. The lecture groups its causes by where the problem lies (slides 13–17):',
      ],
      table: {
        columns: ['Type', 'Causes and examples'],
        rows: [
          ['Prehepatic (mainly haemolytic)', 'Haemolysis: ABO and Rh incompatibility, G6PD deficiency, sickle haemoglobin, thalassaemias; ineffective erythropoiesis; autoimmune causes'],
          ['Hepatic — infection', 'Viral hepatitis A, B, C (intrahepatic cholestasis; conjugated bilirubin regurgitates into the serum)'],
          ['Hepatic — chemicals/drugs', 'Methyltestosterone, phenothiazines, acetaminophen, alcohol'],
          ['Hepatic — genetic errors of uptake and conjugation', 'Gilbert’s and Crigler–Najjar syndromes'],
          ['Hepatic — genetic errors of excretion', 'Dubin–Johnson and Rotor syndromes (excreting conjugated bilirubin)'],
          ['Hepatic — specific proteins; autoimmune', 'Wilson’s disease, α₁-antitrypsin; chronic active hepatitis'],
          ['Posthepatic — intrahepatic bile ducts', 'Drugs (e.g. oral contraceptives), primary biliary cirrhosis, cholangitis'],
          ['Posthepatic — extrahepatic bile ducts', 'Gall stones; tumours (cancer of the head of the pancreas, cholangiocarcinoma)'],
        ],
      },
      sourceRefs: [...cat([13, 14, 15, 16, 17]), ...leh(856)],
      notes: [
        { kind: 'check', text: 'Physiological neonatal jaundice (an immature conjugating system) is listed under prehepatic on slide 13 but sits in the intrahepatic block of the slide-17 table. Its category is not quizzed.' },
        { kind: 'lecturer', text: 'Slide 13 assigns reading: “READ ABOUT KERNICTERUS”. It is not covered in the slides.' },
      ],
    },
    {
      title: 'Phototherapy for neonatal jaundice',
      kind: 'clinical',
      paragraphs: [
        'Newborns can become jaundiced because their conjugating system is immature (slide 13). Phototherapy uses blue wavelengths of light to alter the unconjugated bilirubin in the skin: it is converted to less toxic, water-soluble photoisomers, which are excreted in bile and urine without needing conjugation (slide 18).',
      ],
      sourceRefs: [...cat([13, 18]), ...leh(856)],
      notes: [{ kind: 'textbook', text: 'Lehninger: newborns may develop jaundice because they have not yet produced enough glucuronyl bilirubin transferase; light converts bilirubin to more soluble compounds that are easily excreted (p. 856).' }],
    },
  ],
  summary: [
    'Unconjugated bilirubin travels bound to albumin (and α-globulins); hepatocytes take it up and bind it to ligandin.',
    'UDP-glucuronyl transferase: bilirubin + 2 UDP-glucuronate → bilirubin diglucuronide + 2 UDP (each propionate esterified to C-1 of glucuronic acid) — water-soluble, excreted in bile.',
    'In the gut: little absorbed; glucuronides removed; bacteria reduce bilirubin to colourless urobilinogens, which oxidise to coloured urobilins/stercobilins; some urobilinogen recirculates.',
    'Jaundice: prehepatic (haemolysis), hepatic (hepatitis, drugs, Gilbert’s, Crigler–Najjar, Dubin–Johnson, Rotor…), posthepatic (bile-duct obstruction).',
    'Phototherapy: blue light turns unconjugated bilirubin into water-soluble photoisomers excreted without conjugation.',
  ],
};

// Each lesson gets its interactive layer (learn by answering) and its
// reading extras (high-yield points, common confusions) from
// ./interactive.ts.
export const lessons: Draft[] = [lesson1, lesson2, lesson3, lesson4, lesson5, lesson6, lesson7].map((lesson) => ({
  ...lesson,
  ...readingExtras[lesson.id],
  interactive: interactive[lesson.id],
}));
