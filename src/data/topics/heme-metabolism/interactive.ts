// Biochemistry → Haem and Haem Metabolism: layer 1 (learn by answering)
// and reading-layer extras for the seven lessons.
//
// Every checkpoint asks BEFORE it explains. Facts come from the two
// lecture decks and their figures (written out in ./sources.ts). Points
// that are unsettled (see `discrepancies`) are never asked.
// Checkpoint IDs: cN-xx; recall prompts: rN-xx.
import type { LessonConfusion } from '@/data/lesson-types';
import { ask, fill, learn, match, mcq, multi, order, recall, tf, type InteractiveDraft } from '@/data/topics/build';
import { cat, syn, type ConceptId } from '@/data/topics/heme-metabolism/sources';

type Steps = InteractiveDraft<ConceptId>[];

export const interactive: Record<string, Steps> = {
  // ─── Lesson 1 — Porphyrins and haem ────────────────────────────────
  'heme-metabolism-1': [
    ask(
      mcq('c1-01', 'haem-proteins', 'Before you start: which of these proteins does NOT contain haem, according to the lecture’s list?', 'Insulin', ['Myoglobin', 'Catalase', 'Cytochromes'], {
        explanation: 'Slide 2 lists haemoglobin, myoglobin, cytochromes, catalase, some peroxidases, tryptophan pyrrolase, prostaglandin synthase, nitric oxide synthase and others — not insulin.',
        skill: 'prediction',
      }),
      ['Haem is the shared prosthetic group of oxygen carriers (haemoglobin, myoglobin), electron carriers (cytochromes) and several enzymes.']
    ),
    learn('The porphin ring', [
      'All porphyrins come from porphin (C₂₀H₁₄N₄): a big, highly unsaturated ring of four pyrroles (five-membered rings with nitrogen at the apex) joined by four methene bridges (–CH=).',
      'The same macrocycle underlies chlorophyll, vitamin B₁₂, protoporphyrin, haem and bilirubin.',
    ], { sourceRefs: syn([4, 5, 7]) }),
    ask(
      multi('c1-02', 'porphin-structure', 'Which describe porphin? Select all that apply.', ['Macrocyclic', 'Highly unsaturated', 'Four pyrroles joined by methene bridges'], ['Contains a benzene ring', 'Has acetate side chains'], {
        explanation: 'Slide 4: macrocyclic, highly unsaturated, four pyrrole rings bonded by four methene bridges. Porphin itself has no side chains.',
      })
    ),
    learn('Side chains name the porphyrin', ['Slide 9:'], {
      terms: [
        { term: 'Uroporphyrin', meaning: 'Acetate + propionate on every pyrrole.' },
        { term: 'Coproporphyrin', meaning: 'Methyl + propionate on every pyrrole.' },
        { term: 'Protoporphyrin', meaning: 'Four methyl, two vinyl, two propionate.' },
      ],
      sourceRefs: syn([9]),
    }),
    ask(
      match('c1-03', 'porphyrin-series', 'Match each porphyrin to its side chains.', [
        ['Uroporphyrin', 'Acetate + propionate'],
        ['Coproporphyrin', 'Methyl + propionate'],
        ['Protoporphyrin', 'Methyl, vinyl and propionate'],
      ], { explanation: 'Slide 9: uro → copro → proto, the order met in haem synthesis.' })
    ),
    learn('Isomers', [
      'Four arrangements of acetate and propionate give uroporphyrins I–IV. With three kinds of side chain, protoporphyrins have fifteen isomers — the ninth, protoporphyrin IX, is in haem proteins.',
    ], { sourceRefs: syn([10, 11]) }),
    ask(
      fill('c1-04', 'porphyrin-series', 'The protoporphyrin isomer found in haem proteins is protoporphyrin ____ (Roman numeral).', ['IX', '9', 'nine'], {
        explanation: 'Slide 11: of fifteen isomeric protoporphyrins, the ninth — protoporphyrin IX — is present in haem proteins.',
      })
    ),
    learn('Protoporphyrin IX and the iron', [
      'Side chains: methyl on 1, 3, 5, 8; vinyl on 2, 4; propionate on 6, 7.',
      'Haem = ferroprotoporphyrin IX. Iron binds the four central nitrogens and can form two more bonds, one on each side of the ring. Only ferrous (Fe²⁺) haem binds oxygen; ferric haemoglobin is methaemoglobin.',
    ], { sourceRefs: syn([3, 12]) }),
    ask(
      mcq('c1-05', 'protoporphyrin-ix', 'Which form of haem iron can bind oxygen?', 'Ferrous (Fe²⁺)', ['Ferric (Fe³⁺)', 'Both equally', 'Neither — oxygen binds the propionates'], {
        explanation: 'Slide 12 (textbook page): only ferrous haem binds O₂; ferric haemoglobin is methaemoglobin.',
      })
    ),
    ask(
      mcq('c1-06', 'protoporphyrin-ix', 'On protoporphyrin IX, which side chains are the longest?', 'The propionates (positions 6 and 7)', ['The methyls (1, 3, 5, 8)', 'The vinyls (2, 4)', 'All are the same length'], {
        explanation: 'Slide 12 asks this: propionates (–CH₂–CH₂–COO⁻) are the longest; methyls are the shortest.',
        skill: 'application',
      })
    ),
    recall('r1-01', 'porphyrin-series', 'Explain how uro-, copro- and protoporphyrins differ, and which isomer is in haem.', [
      'Uroporphyrin: acetate + propionate on each pyrrole (four isomers, I–IV).',
      'Coproporphyrin: the acetates have become methyls — methyl + propionate.',
      'Protoporphyrin: four methyl, two vinyl, two propionate — fifteen isomers; protoporphyrin IX is in haem.',
    ]),
  ],

  // ─── Lesson 2 — Synthesis I ────────────────────────────────────────
  'heme-metabolism-2': [
    ask(
      mcq('c2-01', 'ala-formation', 'Haem synthesis starts by condensing two small molecules. Which two?', 'Glycine and succinyl-CoA', ['Glycine and acetyl-CoA', 'Glutamate and succinyl-CoA', 'Alanine and malonyl-CoA'], {
        explanation: 'Slide 13: haem synthesis begins with the condensation of glycine and succinyl-CoA, with decarboxylation, to form ALA.',
        skill: 'prediction',
      }),
      ['The enzyme is ALA synthase, a pyridoxal phosphate (B₆) enzyme in the mitochondria — the committed step.']
    ),
    learn('Step 1: ALA synthase', [
      'Succinyl-CoA + glycine → δ-aminolevulinic acid (ALA) + CO₂ + CoA.',
      'ALA synthase needs pyridoxal phosphate and works in the mitochondria. It catalyses the committed, regulated step.',
    ], { sourceRefs: syn([13, 14, 24]) }),
    ask(
      mcq('c2-02', 'ala-formation', 'Which coenzyme does ALA synthase need?', 'Pyridoxal phosphate (vitamin B₆)', ['Biotin', 'Thiamine pyrophosphate', 'NADPH'], {
        explanation: 'Slides 14 and 24: ALA synthase is a PLP (B₆PO₄) enzyme in the mitochondria.',
      })
    ),
    ask(
      mcq('c2-03', 'haem-atom-origins', 'All four nitrogen atoms of haem come from which molecule?', 'Glycine', ['Succinyl-CoA', 'Glutamate', 'Ammonia'], {
        explanation: 'Slides 14–15: labelling showed haem’s nitrogens come from glycine.',
      }),
      ['Glycine also gives 8 carbons (from its α-carbon); the other 26 carbons come from acetate via succinyl-CoA.']
    ),
    learn('Step 2: porphobilinogen', [
      'ALA dehydrase (also called ALA dehydratase or PBG synthase) joins two ALA, removing two waters, to make porphobilinogen (PBG) — the first pyrrole. It works in the cytosol and needs zinc.',
    ], { sourceRefs: syn([16, 24]) }),
    ask(
      fill('c2-04', 'pbg-formation', 'Two molecules of ALA condense to form ____.', ['porphobilinogen', 'PBG'], {
        explanation: 'Slide 16: ALA dehydrase (PBG synthase) condenses two ALA to porphobilinogen.',
      })
    ),
    learn('Steps 3–4: a chain, then a ring', [
      'PBG deaminase (uroporphyrinogen I synthase) uses its own dipyrromethane cofactor to string PBG units into a chain, then releases the linear tetrapyrrole hydroxymethylbilane.',
      'Uroporphyrinogen III synthase (cosynthase) closes the ring and flips one pyrrole → asymmetric uroporphyrinogen III. Without it, hydroxymethylbilane cyclises spontaneously to uroporphyrinogen I.',
    ], { sourceRefs: syn([17, 18, 19, 20, 21, 25]) }),
    ask(
      mcq('c2-05', 'urogen-iii-synthase', 'Uroporphyrinogen III synthase is missing. What does hydroxymethylbilane become?', 'Uroporphyrinogen I, by spontaneous cyclisation', ['Uroporphyrinogen III anyway', 'Protoporphyrin IX directly', 'Porphobilinogen again'], {
        explanation: 'Slide 25: PBG deaminase alone makes hydroxymethylbilane, which cyclises spontaneously to uroporphyrinogen I; the cosynthase directs it to series III.',
        skill: 'prediction',
      })
    ),
    ask(
      order('c2-06', 'pbg-deaminase', 'Order the steps from ALA to uroporphyrinogen III.', [
        '2 ALA → porphobilinogen',
        'PBG units added to the enzyme’s dipyrromethane',
        'Hydrolysis releases hydroxymethylbilane',
        'Ring closure with one pyrrole flipped → uroporphyrinogen III',
      ], { explanation: 'Slides 16–21.' })
    ),
    recall('r2-01', 'pbg-deaminase', 'How is the linear tetrapyrrole hydroxymethylbilane made, and what happens to it?', [
      'PBG deaminase carries a dipyrromethane cofactor (attached through a cysteine S), which it makes itself.',
      'PBG units are added until a linear hexapyrrole forms; hydrolysis releases hydroxymethylbilane (NH₄⁺ released per bridge).',
      'Uroporphyrinogen III synthase closes it into uroporphyrinogen III, flipping one pyrrole; without it, uroporphyrinogen I forms.',
    ]),
  ],

  // ─── Lesson 3 — Synthesis II ───────────────────────────────────────
  'heme-metabolism-3': [
    ask(
      mcq('c3-01', 'urogen-decarboxylase', 'Uroporphyrinogen has acetate side chains; coproporphyrinogen has methyls in their place. What reaction makes that change?', 'Decarboxylation (removing CO₂)', ['Reduction with NADPH', 'Hydrolysis', 'Transamination'], {
        explanation: 'Slide 24: uroporphyrinogen decarboxylase removes CO₂ from the four acetate side chains, leaving methyl groups.',
        skill: 'prediction',
      })
    ),
    learn('Steps 5–6', [
      'Uroporphyrinogen decarboxylase (cytosol): four acetates → four methyls → coproporphyrinogen III.',
      'Coproporphyrinogen oxidase (mitochondria): decarboxylates and dehydrogenates the propionates at positions 2 and 4 into vinyls → protoporphyrinogen IX.',
    ], { sourceRefs: syn([23, 24]) }),
    ask(
      mcq('c3-02', 'coprogen-oxidase', 'Which enzyme makes haem’s two vinyl groups?', 'Coproporphyrinogen oxidase', ['Uroporphyrinogen decarboxylase', 'Ferrochelatase', 'PBG deaminase'], {
        explanation: 'Slide 24 (textbook page): coproporphyrinogen oxidase converts the propionates at positions 2 and 4 into vinyl groups.',
      })
    ),
    learn('Steps 7–8', [
      'Protoporphyrinogen oxidase → protoporphyrin IX. Ferrochelatase, on the inner mitochondrial membrane, inserts Fe²⁺ → haem.',
    ], { sourceRefs: syn([24, 25]) }),
    ask(
      fill('c3-03', 'ferrochelatase-step', 'The enzyme that inserts Fe²⁺ into protoporphyrin IX is ____.', ['ferrochelatase', 'haem synthase', 'heme synthase'], {
        explanation: 'Slides 24–25: ferrochelatase (haem synthase) catalyses the chelation of ferrous iron by protoporphyrin to form haem.',
      })
    ),
    learn('Two compartments', ['Slide 24:'], {
      terms: [
        { term: 'Mitochondria', meaning: 'Step 1 (ALA synthase) and steps 6–8 (coproporphyrinogen oxidase, protoporphyrinogen oxidase, ferrochelatase).' },
        { term: 'Cytosol', meaning: 'Steps 2–5 (PBG synthase, PBG deaminase, uroporphyrinogen III synthase, uroporphyrinogen decarboxylase).' },
      ],
      keyPoint: 'Only PBG synthase needs a metal (zinc).',
      sourceRefs: syn([24]),
    }),
    ask(
      match('c3-04', 'compartments', 'Match each enzyme to where it works.', [
        ['ALA synthase', 'Mitochondria'],
        ['PBG synthase (ALA dehydrase)', 'Cytosol'],
        ['Uroporphyrinogen decarboxylase', 'Cytosol'],
        ['Ferrochelatase', 'Mitochondria'],
      ], { explanation: 'Slide 24: the first step and the last three are mitochondrial; the middle four are cytosolic.' })
    ),
    ask(
      tf({
        id: 'c3-05',
        conceptId: 'compartments',
        statement: 'Every enzyme of haem synthesis is located in the mitochondria.',
        answer: false,
        explanation: 'Steps 2–5 are in the cytosol; only step 1 and steps 6–8 are mitochondrial (slide 24).',
        skill: 'misconception',
      })
    ),
    recall('r3-01', 'compartments', 'Walk through haem synthesis naming where each step happens.', [
      'Mitochondria: glycine + succinyl-CoA → ALA (ALA synthase).',
      'Cytosol: ALA → PBG → hydroxymethylbilane → uroporphyrinogen III → coproporphyrinogen III.',
      'Mitochondria: → protoporphyrinogen IX → protoporphyrin IX → haem (ferrochelatase adds Fe²⁺).',
    ]),
  ],

  // ─── Lesson 4 — Regulation ─────────────────────────────────────────
  'heme-metabolism-4': [
    ask(
      mcq('c4-01', 'alas-regulation', 'Haem builds up in a liver cell. Which step would you expect it to slow?', 'ALA synthase — the first, committed step', ['Ferrochelatase — the last step', 'Uroporphyrinogen decarboxylase', 'PBG deaminase'], {
        explanation: 'Slide 26: ALA synthase is the committed, usually rate-limiting step; haem represses transcription of its gene.',
        skill: 'prediction',
      }),
      ['Controlling the first committed step stops material entering the pathway at all.']
    ),
    learn('Controlling ALA synthase', [
      'Haem represses transcription of the ALA synthase gene in most cells, and excess haem inhibits the enzyme already made.',
      'Developing red cells use a variant of ALA synthase regulated instead by iron (iron–sulphur clusters).',
    ], { sourceRefs: syn([24, 26, 40]) }),
    ask(
      mcq('c4-02', 'alas-regulation', 'The red-cell variant of ALA synthase is regulated mainly by what?', 'Iron availability (iron–sulphur clusters)', ['Haem repression of its gene', 'Insulin', 'Bilirubin'], {
        explanation: 'Slide 26: the variant expressed only in developing erythrocytes is regulated by iron, in the form of iron–sulphur clusters.',
      })
    ),
    learn('Liver vs red cells', [
      'Immature red cells make about 85% of the body’s haem, and stop when they mature. The liver is the main non-red-cell source, using its haem mainly for cytochrome P450 enzymes.',
    ], { sourceRefs: syn([27, 28]) }),
    ask(
      multi('c4-03', 'liver-vs-red-cells', 'Which statements about haem synthesis are true according to the lecture? Select all that apply.', ['About 85% occurs in immature red cells', 'It ceases when red cells mature', 'Liver haem is used mainly for cytochrome P450 enzymes'], ['Mature red cells make most of the body’s haem', 'The liver makes no haem'], {
        explanation: 'Slides 27–28.',
      })
    ),
    learn('Hemin and globin', [
      'Excess free haem is oxidised to hemin. Hemin represses ALA synthase and inhibits the kinase that would inactivate eIF2 — so globin synthesis continues and combines with the extra haem.',
    ], { sourceRefs: syn([29]) }),
    ask(
      mcq('c4-04', 'hemin-globin-balance', 'Hemin inhibits the kinase that phosphorylates eIF2. What is the effect?', 'eIF2 stays active, so globin synthesis continues', ['eIF2 is inactivated, so globin synthesis stops', 'ALA synthase is activated', 'Haem is exported from the cell'], {
        explanation: 'Slide 29: phosphorylation inactivates eIF2; by inhibiting the kinase, hemin lets globin be made to combine with the excess haem.',
        skill: 'cause-effect',
        difficulty: 'advanced',
      })
    ),
    ask(
      mcq('c4-05', 'hemin-drug', 'Why does intravenous hemin help in an attack of acute intermittent porphyria?', 'It gives negative feedback to the haem pathway, so precursors stop accumulating', ['It replaces the missing PBG deaminase', 'It binds and removes lead', 'It speeds up bilirubin conjugation'], {
        explanation: 'Slides 31–32 and 39: hemin is used in porphyria attacks; it provides negative feedback on the pathway, preventing precursor accumulation.',
        skill: 'application',
      })
    ),
    recall('r4-01', 'alas-regulation', 'Summarise how haem synthesis is regulated.', [
      'ALA synthase is the committed, usually rate-limiting step; haem represses its gene (and inhibits the enzyme).',
      'The red-cell ALA synthase variant is regulated by iron (iron–sulphur clusters); red cells also control ferrochelatase and PBG deaminase.',
      'Hemin represses ALA synthase and lets globin synthesis continue (eIF2 kinase inhibited), keeping haem and globin balanced.',
    ]),
  ],

  // ─── Lesson 5 — Porphyrias and lead ────────────────────────────────
  'heme-metabolism-5': [
    ask(
      mcq('c5-01', 'inborn-error-principles', 'An enzyme in the middle of a pathway is deficient. What usually happens to the substances BEFORE the block?', 'They accumulate', ['They disappear', 'They are converted straight to the final product', 'Nothing changes'], {
        explanation: 'Slide 38: upstream substrate and intermediates build up, may be diverted to an alternative pathway, and are excreted or deposited in tissues.',
        skill: 'prediction',
      }),
      ['In porphyrias, the accumulated haem precursors are toxic at high concentrations.']
    ),
    learn('Porphyrias', [
      'Rare disorders of haem-pathway enzymes. Most are autosomal dominant: people have 50% enzyme and can still make some haem. Precursors accumulate; attacks are triggered by certain drugs, chemicals, foods and sun; hemin treats them by negative feedback.',
    ], { sourceRefs: syn([39]) }),
    ask(
      multi('c5-02', 'porphyria-basics', 'Which can trigger porphyria attacks, according to the lecture? Select all that apply.', ['Certain drugs', 'Certain chemicals', 'Certain foods', 'Sun exposure'], ['Drinking water', 'Sleep'], {
        explanation: 'Slide 39: attacks are triggered by certain drugs, chemicals and foods, and by exposure to sun.',
      })
    ),
    learn('Which enzyme, which porphyria', ['Slide 40 places a porphyria at almost every step after ALA synthase.'], {
      terms: [
        { term: 'PBG deaminase', meaning: 'Acute intermittent porphyria.' },
        { term: 'Uroporphyrinogen decarboxylase', meaning: 'Porphyria cutanea tarda.' },
        { term: 'Ferrochelatase', meaning: 'Erythropoietic protoporphyria.' },
      ],
      sourceRefs: syn([40]),
    }),
    ask(
      match('c5-03', 'porphyria-map', 'Match each deficient enzyme to its porphyria.', [
        ['Porphobilinogen deaminase', 'Acute intermittent porphyria'],
        ['Uroporphyrinogen decarboxylase', 'Porphyria cutanea tarda'],
        ['Uroporphyrinogen III cosynthase', 'Congenital erythropoietic porphyria'],
        ['Ferrochelatase', 'Erythropoietic protoporphyria'],
      ], { explanation: 'Slide 40.' })
    ),
    ask(
      mcq('c5-04', 'porphyria-cutanea-tarda', 'Why are patients with porphyria cutanea tarda photosensitive?', 'Accumulated porphyrinogens become porphyrins in light, which react with O₂ to form oxygen radicals that damage skin', ['Bilirubin deposits in the skin absorb UV light', 'They cannot make melanin', 'ALA blocks GABA receptors in the skin'], {
        explanation: 'Slide 42: light converts porphyrinogens to porphyrins; porphyrins react with molecular oxygen to form oxygen radicals that can severely damage the skin.',
        skill: 'cause-effect',
      })
    ),
    learn('Lead poisoning', [
      'Lead inhibits ALA dehydrase most strongly (it binds the enzyme’s zinc sites) and ferrochelatase. ALA, protoporphyrin and coproporphyrin rise; the symptoms resemble acute intermittent porphyria.',
      'ALA may harm the brain because it resembles GABA and because its autoxidation generates reactive oxygen species.',
    ], { sourceRefs: syn([35, 36, 37]) }),
    ask(
      mcq('c5-05', 'lead-poisoning', 'Which enzyme is MOST sensitive to lead?', 'ALA dehydrase (porphobilinogen synthase)', ['Uroporphyrinogen decarboxylase', 'Coproporphyrinogen oxidase', 'Biliverdin reductase'], {
        explanation: 'Slides 35–37: lead inhibits ALA dehydrase more than other enzymes; Pb²⁺ binds its zinc sites (cysteine S ligands). Ferrochelatase is also inhibited.',
      })
    ),
    recall('r5-01', 'lead-poisoning', 'Explain how lead poisoning disturbs haem synthesis and how it shows up.', [
      'Pb²⁺ binds the zinc sites of ALA dehydrase (PBG synthase) and also inhibits ferrochelatase.',
      'ALA accumulates (and the ALA synthase gene is de-repressed); protoporphyrin (as zinc protoporphyrin) and coproporphyrin rise.',
      'Symptoms resemble acute intermittent porphyria; ALA is neurotoxic (GABA-like structure; reactive oxygen species).',
    ]),
  ],

  // ─── Lesson 6 — Haem to bilirubin ──────────────────────────────────
  'heme-metabolism-6': [
    ask(
      mcq('c6-01', 'haem-sources', 'Where does most of the haem that is broken down each day come from?', 'Haemoglobin of senescent red cells', ['Dietary meat', 'Myoglobin of muscle', 'Mitochondrial cytochromes'], {
        explanation: 'Slide 2 and the textbook page on slide 4: about 85% of bilirubin comes from haemoglobin of senescent red cells removed by the reticuloendothelial system.',
        skill: 'prediction',
      }),
      ['The reticuloendothelial system — especially the spleen — removes old red cells from the circulation.']
    ),
    learn('Haem oxygenase', [
      'Substrate inducible; cuts the methine bridge between the two vinyl-bearing pyrroles; the only reaction in the body that releases CO; works only on haem, not on free protoporphyrin IX.',
      'Products: biliverdin (green), CO (breathed out) and iron (reused).',
    ], { sourceRefs: cat([3, 4, 20]) }),
    ask(
      tf({
        id: 'c6-02',
        conceptId: 'haem-oxygenase',
        statement: 'Haem oxygenase can also break down free protoporphyrin IX.',
        answer: false,
        explanation: 'Slide 3: it only cleaves haem — free protoporphyrin IX is not a substrate.',
        skill: 'misconception',
      })
    ),
    ask(
      multi('c6-03', 'haem-oxygenase', 'What does haem oxygenase release from haem? Select all that apply.', ['Biliverdin', 'Carbon monoxide', 'Iron'], ['Bilirubin diglucuronide', 'Urobilinogen'], {
        explanation: 'Slides 4 and 20: biliverdin, CO and iron. Bilirubin comes next, from biliverdin reductase.',
      })
    ),
    learn('Biliverdin → bilirubin', [
      'Biliverdin reductase uses NADPH to reduce green biliverdin to orange-yellow bilirubin.',
    ], { sourceRefs: cat([4, 20]) }),
    ask(
      fill('c6-04', 'biliverdin-to-bilirubin', 'Biliverdin is reduced to bilirubin by biliverdin ____.', ['reductase'], {
        explanation: 'Slides 4 and 20: biliverdin reductase, an NADPH-dependent enzyme.',
        skill: 'terminology',
      })
    ),
    learn('Inside the macrophage', [
      'The red cell is broken down in the phagolysosome: globin → amino acids; iron → stored (ferritin, haemosiderin), added to proteins or released to transferrin (helped by ceruloplasmin); the porphyrin → unconjugated bilirubin, which leaves bound to albumin.',
    ], { sourceRefs: cat([12, 19]) }),
    ask(
      mcq('c6-05', 'macrophage-handling', 'In the macrophage, what is iron from haem released to?', 'Transferrin, with the aid of ceruloplasmin', ['Albumin', 'Bilirubin', 'Glucuronic acid'], {
        explanation: 'Slide 12: iron is stored (ferritin or haemosiderin), added to proteins, or released to transferrin with the aid of ceruloplasmin.',
      })
    ),
    recall('r6-01', 'haem-oxygenase', 'Describe the two steps from haem to bilirubin, with their products.', [
      'Haem oxygenase (O₂, NADPH) opens the bridge between the two vinyl-bearing pyrroles → biliverdin (green) + CO + iron.',
      'Biliverdin reductase (NADPH) → bilirubin (orange-yellow).',
      'Haem oxygenase is substrate inducible, the only source of CO in the body, and does not act on free protoporphyrin IX.',
    ]),
  ],

  // ─── Lesson 7 — Conjugation, excretion and jaundice ────────────────
  'heme-metabolism-7': [
    ask(
      mcq('c7-01', 'bilirubin-transport', 'Unconjugated bilirubin is poorly water-soluble. How does it travel in blood to the liver?', 'Bound to albumin (and α-globulins)', ['Dissolved freely in plasma', 'Inside red cells', 'Bound to transferrin'], {
        explanation: 'Slide 9: bilirubin is transported to the liver bound to albumin and α-globulins.',
        skill: 'prediction',
      })
    ),
    learn('Conjugation', [
      'UDP-glucuronyl transferase: bilirubin + 2 UDP-glucuronate → bilirubin diglucuronide + 2 UDP. Each propionic acid side chain is esterified to C-1 of glucuronic acid, making bilirubin water-soluble for excretion in bile.',
    ], { sourceRefs: cat([5, 8, 9]) }),
    ask(
      mcq('c7-02', 'bilirubin-conjugation', 'Which side chains of bilirubin are joined to glucuronic acid?', 'The two propionic acid side chains', ['The two vinyl groups', 'The four methyl groups', 'The central methene bridge'], {
        explanation: 'Slide 9: each propionic acid side chain is esterified to the hydroxyl at C-1 of glucuronic acid.',
      })
    ),
    learn('In the gut', [
      'Bilirubin diglucuronide is poorly absorbed. Its glucuronides are removed by bacterial hydrolases; the free bilirubin is reduced to colourless urobilinogens (stercobilinogens), which oxidise to coloured urobilins (stercobilins). Some urobilinogen is reabsorbed (enterohepatic recirculation).',
    ], { sourceRefs: cat([11, 20]) }),
    ask(
      order('c7-03', 'intestinal-fate', 'Order what happens to bilirubin from the liver to the stool.', [
        'Bilirubin diglucuronide secreted in bile',
        'Glucuronides removed by bacterial hydrolases',
        'Bilirubin reduced to colourless urobilinogens',
        'Urobilinogens oxidised to coloured urobilins (stercobilins)',
      ], { explanation: 'Slide 11.' })
    ),
    learn('Causes of jaundice', ['Slides 13–17 group causes by site:'], {
      terms: [
        { term: 'Prehepatic', meaning: 'Mainly haemolysis (ABO/Rh incompatibility, G6PD deficiency, sickle Hb, thalassaemias).' },
        { term: 'Hepatic', meaning: 'Hepatitis, drugs, Gilbert’s, Crigler–Najjar, Dubin–Johnson, Rotor, Wilson’s, chronic active hepatitis.' },
        { term: 'Posthepatic', meaning: 'Bile-duct obstruction: gall stones, pancreatic head cancer, cholangiocarcinoma, primary biliary cirrhosis.' },
      ],
      sourceRefs: cat([13, 14, 15, 16, 17]),
    }),
    ask(
      match('c7-04', 'jaundice-causes', 'Match each cause of jaundice to its type.', [
        ['G6PD deficiency', 'Prehepatic'],
        ['Crigler–Najjar syndrome', 'Hepatic'],
        ['Gall stones blocking the bile duct', 'Posthepatic'],
        ['Viral hepatitis', 'Hepatic'],
      ], { explanation: 'Slides 13–16.' })
    ),
    ask(
      mcq('c7-05', 'phototherapy', 'How does phototherapy clear bilirubin in neonatal jaundice?', 'Blue light converts unconjugated bilirubin in the skin into water-soluble photoisomers excreted without conjugation', ['Light activates the baby’s UDP-glucuronyl transferase', 'Light destroys red cells so less haem is made', 'Light converts bilirubin back into haem'], {
        explanation: 'Slide 18.',
      })
    ),
    recall('r7-01', 'bilirubin-conjugation', 'Trace bilirubin from the macrophage to the stool.', [
      'Unconjugated bilirubin travels to the liver bound to albumin (and α-globulins).',
      'UDP-glucuronyl transferase makes water-soluble bilirubin diglucuronide, excreted in bile.',
      'In the gut, glucuronides are removed; bacteria reduce bilirubin to colourless urobilinogens, which oxidise to coloured urobilins/stercobilins; some urobilinogen recirculates.',
    ]),
  ],
};

export const readingExtras: Record<
  string,
  { highYield: string[]; confusions: LessonConfusion[]; estimatedMinutes: number; xp: number }
> = {
  'heme-metabolism-1': {
    estimatedMinutes: 8,
    xp: 20,
    highYield: [
      'Porphin: four pyrroles + four methene (–CH=) bridges; macrocyclic, highly unsaturated.',
      'Uro (acetate + propionate) → copro (methyl + propionate) → proto (methyl, vinyl, propionate).',
      'Haem = ferroprotoporphyrin IX; only Fe²⁺ binds O₂ (Fe³⁺ = methaemoglobin).',
    ],
    confusions: [
      { confusion: 'Haem contains any protoporphyrin isomer.', clarification: 'Only protoporphyrin IX — the ninth of fifteen possible isomers.' },
      { confusion: 'Ferric (Fe³⁺) haemoglobin carries oxygen.', clarification: 'Only ferrous (Fe²⁺) haem binds O₂; ferric haemoglobin is methaemoglobin.' },
    ],
  },
  'heme-metabolism-2': {
    estimatedMinutes: 10,
    xp: 25,
    highYield: [
      'Glycine + succinyl-CoA → ALA (+ CO₂ + CoA): ALA synthase, PLP, mitochondria — committed step.',
      '2 ALA → PBG: ALA dehydrase (PBG synthase), cytosolic, zinc.',
      'PBG deaminase → hydroxymethylbilane; uroporphyrinogen III synthase → uroporphyrinogen III (one pyrrole flipped).',
    ],
    confusions: [
      { confusion: 'ALA synthase uses acetyl-CoA.', clarification: 'It condenses glycine with succinyl-CoA.' },
      { confusion: 'Uroporphyrinogen I leads to haem.', clarification: 'Only the asymmetric series III leads to haem; series I forms when the cosynthase is missing.' },
    ],
  },
  'heme-metabolism-3': {
    estimatedMinutes: 8,
    xp: 25,
    highYield: [
      'Uroporphyrinogen decarboxylase (cytosol): 4 acetates → methyls.',
      'Coproporphyrinogen oxidase (mitochondria): propionates 2, 4 → vinyls.',
      'Ferrochelatase (inner mitochondrial membrane) inserts Fe²⁺.',
      'Mitochondria: steps 1, 6–8. Cytosol: steps 2–5.',
    ],
    confusions: [
      { confusion: 'Haem synthesis happens entirely in mitochondria.', clarification: 'Steps 2–5 are cytosolic; the pathway leaves and re-enters the mitochondrion.' },
      { confusion: 'Iron is added early, to porphobilinogen.', clarification: 'Iron goes in last, into protoporphyrin IX, by ferrochelatase.' },
    ],
  },
  'heme-metabolism-4': {
    estimatedMinutes: 9,
    xp: 25,
    highYield: [
      'ALA synthase: committed, rate-limiting; haem represses its gene.',
      'Red-cell ALA synthase is regulated by iron (Fe–S clusters).',
      '~85% of haem is made in immature red cells; liver haem → cytochrome P450.',
      'Hemin: represses ALA synthase, inhibits the eIF2 kinase (globin keeps pace); treats porphyria attacks.',
    ],
    confusions: [
      { confusion: 'Ferrochelatase is the main control point in the liver.', clarification: 'ALA synthase is; red cells add control at ferrochelatase and PBG deaminase.' },
      { confusion: 'Hemin blocks globin synthesis.', clarification: 'It inhibits the kinase that inactivates eIF2, so globin synthesis continues.' },
    ],
  },
  'heme-metabolism-5': {
    estimatedMinutes: 11,
    xp: 30,
    highYield: [
      'Porphyrias: mostly autosomal dominant (50% enzyme); attacks triggered by drugs, chemicals, foods, sun; treat with hemin.',
      'AIP = PBG deaminase: neurovisceral; PBG and ALA in urine. PCT = uroporphyrinogen decarboxylase: photosensitivity.',
      'Lead: ALA dehydrase (zinc sites) and ferrochelatase → ↑ ALA, ↑ coproporphyrin, ↑ (zinc) protoporphyrin.',
    ],
    confusions: [
      { confusion: 'AIP causes photosensitivity.', clarification: 'AIP is neurovisceral (abdominal pain, neuropsychiatric symptoms); photosensitivity is the hallmark of PCT.' },
      { confusion: 'Lead mainly blocks uroporphyrinogen decarboxylase.', clarification: 'Lead mainly blocks ALA dehydrase and ferrochelatase.' },
    ],
  },
  'heme-metabolism-6': {
    estimatedMinutes: 8,
    xp: 25,
    highYield: [
      'Haem oxygenase: substrate inducible; opens the bridge between the vinyl-bearing pyrroles; the only endogenous source of CO; not active on free protoporphyrin IX.',
      'Haem → biliverdin (green) + CO + iron → bilirubin (orange-yellow, biliverdin reductase, NADPH).',
      '~85% of bilirubin comes from senescent red-cell haemoglobin.',
    ],
    confusions: [
      { confusion: 'Haem oxygenase makes bilirubin directly.', clarification: 'It makes biliverdin; biliverdin reductase then makes bilirubin.' },
      { confusion: 'The iron from haem is excreted.', clarification: 'It is stored (ferritin/haemosiderin) or released to transferrin and reused.' },
    ],
  },
  'heme-metabolism-7': {
    estimatedMinutes: 11,
    xp: 30,
    highYield: [
      'Bilirubin → liver bound to albumin; conjugated by UDP-glucuronyl transferase to the water-soluble diglucuronide.',
      'Gut: deconjugated, reduced to colourless urobilinogens, oxidised to coloured urobilins/stercobilins; enterohepatic recirculation.',
      'Jaundice: prehepatic (haemolysis), hepatic (hepatitis, drugs, Gilbert’s, Crigler–Najjar, Dubin–Johnson, Rotor), posthepatic (obstruction).',
      'Phototherapy: blue light → water-soluble photoisomers, excreted without conjugation.',
    ],
    confusions: [
      { confusion: 'Urobilinogens are coloured pigments.', clarification: 'Urobilinogens are colourless; their oxidation products, urobilins/stercobilins, are coloured.' },
      { confusion: 'Phototherapy works by boosting conjugation.', clarification: 'It makes photoisomers that are excreted without conjugation.' },
      { confusion: 'Dubin–Johnson is a defect of conjugation.', clarification: 'Dubin–Johnson and Rotor affect excretion of conjugated bilirubin; Gilbert’s and Crigler–Najjar affect uptake/conjugation.' },
    ],
  },
};
