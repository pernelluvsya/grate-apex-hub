// Biochemistry → Collagen and Elastin — layer 1 (learn by answering) and
// reading-layer extras. Checkpoint IDs: cN-xx; recall prompts: rN-xx.
import type { LessonConfusion } from '@/data/lesson-types';
import { ask, fill, learn, match, mcq, multi, order, recall, tf, type InteractiveDraft } from '@/data/topics/build';
import { ref, type ConceptId } from '@/data/topics/collagen-synthesis/sources';

type Steps = InteractiveDraft<ConceptId>[];

export const interactive: Record<string, Steps> = {
  // ─── Lesson 1 — Structural proteins, the matrix and repair ─────────
  'collagen-synthesis-1': [
    ask(
      mcq('c1-01', 'structural-proteins', 'Before you start: hair, nails, hooves and scales are all built from which structural protein?', 'Keratin', ['Collagen', 'Albumin', 'Myosin'], {
        explanation: 'Slide 3: keratin is the lecture’s example of a structural protein.',
        skill: 'prediction',
      })
    ),
    learn('What proteins do', [
      'Structure (hair, nails, matrix proteins), transport (albumin, caeruloplasmin, haemoglobin), regulation (insulin), catalysis (enzymes) and locomotion (actin, myosin).',
      'Structural proteins are cellular (cytoskeleton, cell wall, transmembrane proteins such as integrins) or extracellular (collagen, elastin).',
    ], { sourceRefs: ref([2, 3, 4]) }),
    ask(
      match('c1-02', 'protein-functions', 'Match each protein to its function.', [
        ['Haemoglobin', 'Transport'],
        ['Insulin', 'Regulation'],
        ['Myosin', 'Locomotion'],
        ['Collagen', 'Structure'],
      ], { explanation: 'Slide 2.' })
    ),
    learn('Holding on to the matrix', [
      'Fibronectin helps cells attach to the matrix; its cell-binding domain carries the RGD sequence. Integrins span the membrane and link the matrix outside to actin filaments inside.',
    ], { sourceRefs: ref([7, 8]) }),
    ask(
      mcq('c1-03', 'matrix-adhesion', 'What do integrins connect?', 'The extracellular matrix to the cell’s cytoskeleton', ['Two neighbouring nuclei', 'Collagen to elastin only', 'Ribosomes to the ER'], {
        explanation: 'Slide 8.',
      })
    ),
    learn('Cells that make the matrix', [
      'Fibroblasts are the most common connective tissue cell and secrete ground substance, collagen and elastin. Mesenchymal stem cells replace connective tissue cells after injury. During wound healing some fibroblasts become myofibroblasts.',
    ], { sourceRefs: ref([15, 16, 17, 18]) }),
    ask(
      order('c1-04', 'wound-healing', 'Put the phases of wound healing in order.', ['Haemostasis', 'Inflammation', 'Proliferation', 'Remodelling'], {
        explanation: 'Slides 10–11.',
      })
    ),
    learn('Scars', ['Slide 12: normal, atrophic and hypertrophic scars, and keloids. Myofibroblasts make the collagen in keloids, hypertrophic scars and scleroderma (slide 18).'], {
      sourceRefs: ref([12, 18]),
    }),
    ask(
      mcq('c1-05', 'wound-healing', 'In which phase are collagen synthesis and fibroblast proliferation most prominent?', 'Proliferation (days to a week)', ['Haemostasis (seconds to hours)', 'Inflammation (hours to days)', 'Remodelling (a week to months)'], {
        explanation: 'Slide 11.',
      })
    ),
    recall('r1-01', 'wound-healing', 'Describe the four phases of wound healing, with their timing and main events.', [
      'Haemostasis (seconds–hours): vasoconstriction, platelet aggregation, fibrin.',
      'Inflammation (hours–days): neutrophils, then macrophages; removal of debris and bacteria.',
      'Proliferation (days–a week): fibroblasts, collagen synthesis, angiogenesis, granulation tissue, epithelialisation.',
      'Remodelling (a week–months): collagen cross-linking, scar maturation, rising tensile strength.',
    ]),
  ],

  // ─── Lesson 2 — Collagen types and the triple helix ────────────────
  'collagen-synthesis-2': [
    ask(
      mcq('c2-01', 'collagen-overview', 'Before you start: what is the most abundant protein in mammals?', 'Collagen', ['Haemoglobin', 'Albumin', 'Keratin'], {
        explanation: 'Slide 13.',
        skill: 'prediction',
      })
    ),
    learn('Collagen', [
      'A family of fibrous proteins and the main fibrous element of skin, bone, tendon, cartilage, blood vessels and teeth. It forms insoluble fibres of high tensile strength.',
    ], { sourceRefs: ref([13]) }),
    learn('Types', [
      'Type I (90% of body collagen) — bone, skin, tendon. Type II — cartilage and vitreous humour. Type III — skin, blood vessels. Type IV — sheetlike network of the basal lamina. Type VII — anchoring fibrils.',
    ], { sourceRefs: ref([22]) }),
    ask(
      match('c2-02', 'collagen-types', 'Match each collagen type to where it is found.', [
        ['Type I', 'Bone, skin and tendon'],
        ['Type II', 'Cartilage'],
        ['Type IV', 'Basal lamina'],
        ['Type VII', 'Anchoring fibrils beneath stratified squamous epithelia'],
      ], { explanation: 'Slide 22.' })
    ),
    learn('Tropocollagen', [
      'Three chains of about 1000 residues each, 3000 Å long and 15 Å wide. Each strand is a type II trans helix with three residues per turn.',
    ], { sourceRefs: ref([24, 25]) }),
    ask(
      fill('c2-03', 'tropocollagen', 'Tropocollagen is a triple-stranded helical rod about ____ Å long.', ['3000', '3,000'], {
        explanation: 'Slide 25.',
      })
    ),
    learn('Every third residue', ['Glycine is nearly every third residue (~33%), proline is abundant, and hydroxyproline and hydroxylysine are present. Gly-Pro-Hyp repeats often.'], {
      sourceRefs: ref([29, 30, 31]),
    }),
    ask(
      mcq('c2-04', 'collagen-composition', 'About what proportion of collagen’s residues are glycine?', 'About one third', ['About 5%', 'About half', 'About two thirds'], {
        explanation: 'Slide 30: nearly 33.3% (haemoglobin has about 5%).',
      })
    ),
    recall('r2-01', 'collagen-composition', 'What is unusual about collagen’s amino acid composition and sequence?', [
      'Nearly every third residue is glycine (~33%; haemoglobin ~5%).',
      'Proline is far more common than in most proteins.',
      'It contains hydroxyproline and hydroxylysine, found in few other proteins.',
      'The sequence is remarkably regular — Gly-Pro-Hyp recurs often.',
    ]),
  ],

  // ─── Lesson 3 — Hydroxylation and glycosylation ────────────────────
  'collagen-synthesis-3': [
    ask(
      mcq('c3-01', 'hydroxylated-residues', 'Before you start: is hydroxyproline built into collagen as a free amino acid?', 'No — proline is incorporated first, then hydroxylated in the chain', ['Yes — free hydroxyproline is added by the ribosome', 'Yes — but only in type IV collagen', 'No — hydroxyproline is made by bacteria'], {
        explanation: 'Slide 36: free hydroxyproline is not incorporated into the nascent chain.',
        skill: 'prediction',
      })
    ),
    learn('Seven steps', ['Polypeptide synthesis → hydroxylation and glycosylation → triple helix → secretion → hydrolysis of peptide bonds (tropocollagen) → assembly near the cell surface → cross-links.'], {
      sourceRefs: ref([33]),
    }),
    ask(
      order('c3-02', 'synthesis-overview', 'Order these steps of collagen synthesis.', ['Polypeptide synthesis', 'Hydroxylation and glycosylation', 'Triple-helix formation', 'Secretion', 'Hydrolysis of peptide bonds', 'Formation of cross-links'], {
        explanation: 'Slide 33.',
      })
    ),
    learn('Prolyl hydroxylase', [
      'A dioxygenase with Fe²⁺ at its active site. It needs O₂, α-ketoglutarate (which becomes succinate + CO₂) and ascorbate, which keeps the iron in the ferrous state.',
    ], { sourceRefs: ref([40, 41, 42]) }),
    ask(
      multi('c3-03', 'prolyl-hydroxylase', 'What does prolyl-4-hydroxylase require? Select all that apply.', ['Molecular oxygen', 'α-Ketoglutarate', 'Ascorbate', 'Ferrous iron'], ['NADPH', 'Biotin'], {
        explanation: 'Slides 40–41.',
      })
    ),
    learn('Where hydroxylation happens', [
      'Only prolines and lysines already in the chain, before the helix forms, and only on the amino side of a glycine (C-4 of proline, C-5 of lysine). A few prolines are hydroxylated at C-3 by prolyl-3-hydroxylase.',
    ], { sourceRefs: ref([44, 46]) }),
    ask(
      mcq('c3-04', 'hydroxylation-rules', 'α,α′-Bipyridyl removes iron from prolyl hydroxylase. What happens to the collagen made?', 'It is unhydroxylated and does not form a triple helix at 37 °C', ['It is over-hydroxylated and very stable', 'It forms extra cross-links', 'It is secreted faster'], {
        explanation: 'Slide 45: it only becomes helical below 24 °C.',
        skill: 'cause-effect',
      })
    ),
    learn('Stability and sugars', [
      'The helix is held by many co-operative hydrogen bonds and melts abruptly. The more proline + hydroxyproline, the higher the melting temperature.',
      'A glucose–galactose disaccharide is added to hydroxylysine before the helix forms.',
    ], { sourceRefs: ref([47, 49, 50]) }),
    ask(
      tf({
        id: 'c3-05', conceptId: 'helix-stability',
        statement: 'Collagen with a higher proline + hydroxyproline content has a more stable helix.',
        answer: true,
        explanation: 'Slide 49: calf skin (232 per 1000) melts at 39 °C; cod skin (155) at 16 °C.',
      })
    ),
    recall('r3-01', 'prolyl-hydroxylase', 'Explain the prolyl hydroxylase reaction and why ascorbate is needed.', [
      'Prolyl-4-hydroxylase hydroxylates prolyl residues (on the amino side of glycine) in nascent chains, before the helix forms.',
      'It is a dioxygenase: one O of O₂ goes to proline, the other to succinate formed from α-ketoglutarate (CO₂ released).',
      'Its active-site iron must stay Fe²⁺; ascorbate keeps it reduced.',
      'Without ascorbate (scurvy) collagen is under-hydroxylated and less stable.',
    ]),
  ],

  // ─── Lesson 4 — Fibre assembly and cross-links ─────────────────────
  'collagen-synthesis-4': [
    ask(
      mcq('c4-01', 'procollagen-processing', 'Before you start: collagen fibres form outside the cell. What stops them forming too early inside it?', 'Extension peptides on procollagen, removed only outside the cell', ['Low temperature inside the cell', 'Cross-links that form inside the cell', 'Lack of glycine inside the cell'], {
        explanation: 'Slide 54: the extra peptides prevent premature fibre formation; procollagen peptidases cut them off in the extracellular space.',
        skill: 'prediction',
      })
    ),
    learn('Procollagen', [
      'Procollagen peptidases remove the N- and C-terminal extensions outside the cell. The extensions prevent premature fibres and may guide transport across the membrane; C-terminal disulfides help start the helix.',
    ], { sourceRefs: ref([34, 54]) }),
    ask(
      mcq('c4-02', 'procollagen-processing', 'Where are the extension peptides of procollagen removed?', 'In the extracellular space', ['In the nucleus', 'In the rough ER lumen', 'In lysosomes'], {
        explanation: 'Slide 54.',
      })
    ),
    learn('Packing into fibres', [
      'The triple helix exposes side chains, so neighbouring molecules bond and aggregate. In the fibre, 3000 Å molecules form a quarter-staggered array with ~400 Å gaps — possible nucleation sites for bone.',
    ], { sourceRefs: ref([53, 60]) }),
    ask(
      fill('c4-03', 'fibre-formation', 'Tropocollagen molecules in a fibre form a quarter-____ array.', ['staggered'], {
        explanation: 'Slide 60.',
        skill: 'terminology',
      })
    ),
    learn('Cross-links', [
      'Lysyl oxidase turns certain lysine side chains into aldehydes (allysine). Two allysines join by aldol condensation; histidine and hydroxylysine can join in, linking four side chains.',
    ], { sourceRefs: ref([28, 56, 57, 58]) }),
    ask(
      order('c4-04', 'collagen-crosslinks', 'Order the steps in forming collagen cross-links.', [
        'Lysyl oxidase converts lysine side chains to aldehydes (allysine)',
        'Two allysines join by aldol condensation',
        'A histidine side chain adds to the aldol cross-link',
        'A Schiff base forms with a hydroxylysine side chain',
      ], { explanation: 'Slides 28 and 56–59.' })
    ),
    ask(
      mcq('c4-05', 'collagen-crosslinks', 'Which rat tendon is more highly cross-linked?', 'The Achilles tendon of mature rats', ['The flexible tail tendon', 'Both are equally cross-linked', 'Neither has cross-links'], {
        explanation: 'Slide 28: cross-linking varies with function and age.',
        skill: 'comparison',
      })
    ),
    recall('r4-01', 'collagen-crosslinks', 'How are collagen cross-links formed, and why do they matter?', [
      'Lysyl oxidase converts the ε-amino group of certain lysines to aldehydes (allysine).',
      'Two allysines join by aldol condensation (aldol cross-link); histidine and hydroxylysine can join in.',
      'Cross-links are intra- and intermolecular and give fibres mechanical strength.',
      'Blocking them (β-aminopropionitrile, lathyrism) makes collagen extremely fragile.',
    ]),
  ],

  // ─── Lesson 5 — Collagen disorders ─────────────────────────────────
  'collagen-synthesis-5': [
    ask(
      mcq('c5-01', 'scurvy', 'Before you start: a sailor has had no fresh fruit for months. Which step of collagen synthesis fails?', 'Hydroxylation of proline, because prolyl hydroxylase’s iron is not kept reduced', ['Cleavage of procollagen extensions', 'Glycine incorporation', 'Desmosine formation'], {
        explanation: 'Slide 61: scurvy is a dietary deficiency of ascorbic acid.',
        skill: 'prediction',
      })
    ),
    learn('Scurvy', [
      'No ascorbate → under-hydroxylated collagen with a lower melting temperature. Infants: painful tender limbs, defective bone, haemorrhages. Adults: bleeding gums and follicles, gingivitis, loose teeth, bleeding into joints and bladder, poor wound healing. White cell ascorbic acid is low.',
    ], { sourceRefs: ref([61, 62, 63, 64]) }),
    ask(
      multi('c5-02', 'scurvy', 'Which are features of scurvy in adults? Select all that apply.', ['Bleeding from the gums', 'Loose teeth', 'Poor wound healing'], ['Blue sclerae', 'Hyperextensible joints'], {
        explanation: 'Slide 63.',
      })
    ),
    learn('Ehlers-Danlos and dermatoparaxis', [
      'Ehlers-Danlos syndrome: type III collagen, procollagen peptidase, lysine hydroxylation or lysyl oxidase defects; hyperextensible joints, stretchy, fragile skin, bruising, short stature.',
      'Dermatoparaxis (cattle): no procollagen peptidase; fragile skin; amino-terminal propeptides retained.',
    ], { sourceRefs: ref([65, 66, 68]) }),
    ask(
      mcq('c5-03', 'dermatoparaxis', 'Which enzyme is missing in dermatoparaxis?', 'A procollagen peptidase', ['Lysyl oxidase', 'Prolyl hydroxylase', 'Glucosyl transferase'], {
        explanation: 'Slide 68.',
      })
    ),
    learn('Lathyrism and OI', [
      'Lathyrism: β-aminopropionitrile from sweet pea seeds blocks the lysyl → aldehyde step, so cross-links can’t form and collagen is fragile.',
      'Osteogenesis imperfecta: a single glycine change (Gly988 → Cys) in type I collagen disrupts the helix; brittle bones and fractures.',
    ], { sourceRefs: ref([70, 71, 72]) }),
    ask(
      mcq('c5-04', 'lathyrism', 'What does β-aminopropionitrile inhibit?', 'The conversion of lysyl side chains into aldehydes', ['The hydroxylation of proline', 'The cleavage of procollagen', 'The glycosylation of hydroxylysine'], {
        explanation: 'Slide 70.',
      })
    ),
    ask(
      mcq('c5-05', 'osteogenesis-imperfecta', 'Why is the osteogenesis imperfecta mutant allele dominant?', 'Its aberrant chain is built into the triple helix and spoils the whole molecule', ['It doubles the amount of collagen made', 'It switches off the normal allele', 'It blocks ascorbate uptake'], {
        explanation: 'Slide 73.',
        skill: 'cause-effect',
      })
    ),
    recall('r5-01', 'osteogenesis-imperfecta', 'Explain how a single glycine change causes osteogenesis imperfecta, and why it is dominant.', [
      'Glycine 988 of an α1(I) chain changes to cysteine.',
      'The triple helix is disrupted near its carboxyl end and over-hydroxylated and over-glycosylated; the collagen is partly unfolded at body temperature and can’t form ordered fibrils.',
      'Brittle bones, multiple fractures and deformities follow; it can be lethal.',
      'Dominant: the aberrant chain is incorporated into the helix. A completely unusable chain would give normal collagen, just less of it.',
    ]),
  ],

  // ─── Lesson 6 — Elastin ────────────────────────────────────────────
  'collagen-synthesis-6': [
    ask(
      mcq('c6-01', 'elastin-distribution', 'Before you start: which structure would you expect to be richest in elastin?', 'The arch of the aorta', ['Tendon', 'Skin', 'Loose connective tissue'], {
        explanation: 'Slide 75: large amounts in blood vessel walls (especially the aortic arch) and ligaments; little in skin, tendon and loose CT.',
        skill: 'prediction',
      })
    ),
    learn('Elastic fibres', ['Elastin is the major component of elastic fibres, which stretch to several times their length and then snap back. Cross-linked elastin molecules expand and contract like coils.'], {
      sourceRefs: ref([6, 74]),
    }),
    learn('Elastin vs collagen', ['Both are about one third glycine and rich in proline. Elastin has very little hydroxyproline, no hydroxylysine, few polar residues and many non-polar ones (Ala, Val, Leu, Ile).'], {
      sourceRefs: ref([76, 77]),
    }),
    ask(
      mcq('c6-02', 'elastin-composition', 'Which amino acid does elastin lack completely?', 'Hydroxylysine', ['Glycine', 'Proline', 'Valine'], {
        explanation: 'Slide 76.',
        skill: 'comparison',
      })
    ),
    learn('Cross-links', ['Aldol cross-links and lysinonorleucine occur in both collagen and elastin; desmosine, made from four lysine side chains, is found only in elastin.'], {
      sourceRefs: ref([78, 79, 81]),
    }),
    ask(
      fill('c6-03', 'elastin-crosslinks', 'The cross-link found only in elastin, made from four lysine side chains, is ____.', ['desmosine'], {
        explanation: 'Slide 79.',
        skill: 'terminology',
      })
    ),
    recall('r6-01', 'elastin-composition', 'Compare elastin with collagen: composition and cross-links.', [
      'Both: about one third glycine, rich in proline; aldol and lysinonorleucine cross-links.',
      'Elastin: very little hydroxyproline, no hydroxylysine, few polar and many non-polar aliphatic residues (Ala, Val, Leu, Ile).',
      'Elastin only: desmosine, from four lysine side chains; Lys-Ala-Ala-Lys repeats.',
      'Elastin’s cross-links help elastic fibres recoil; it is highly insoluble.',
    ]),
  ],
};

export const readingExtras: Record<
  string,
  { highYield: string[]; confusions: LessonConfusion[]; estimatedMinutes: number; xp: number }
> = {
  'collagen-synthesis-1': {
    estimatedMinutes: 10,
    xp: 25,
    highYield: [
      'Structural proteins: cellular (cytoskeleton, integrins) vs extracellular (collagen, elastin).',
      'Fibronectin attaches cells to matrix (RGD); integrins link matrix to actin.',
      'Fibroblasts make ground substance, collagen and elastin; myofibroblasts make collagen in keloids and hypertrophic scars.',
      'Wound healing: haemostasis → inflammation → proliferation → remodelling.',
    ],
    confusions: [
      { confusion: 'Collagen synthesis happens mainly during haemostasis.', clarification: 'Collagen synthesis belongs to the proliferative phase; cross-linking and scar maturation come in remodelling.' },
      { confusion: 'Integrins are extracellular proteins.', clarification: 'Integrins are transmembrane (cellular) structural proteins that link the matrix to the cytoskeleton.' },
    ],
  },
  'collagen-synthesis-2': {
    estimatedMinutes: 10,
    xp: 25,
    highYield: [
      'Collagen: most abundant protein in mammals; insoluble fibres of high tensile strength.',
      'Type I = 90% (bone, skin, tendon); II = cartilage; III = skin/vessels; IV = basal lamina; VII = anchoring fibrils.',
      'Tropocollagen: 285 kDa, 3 chains × ~1000 residues, 3000 × 15 Å; 3 residues/turn.',
      'Glycine every third residue (~33%); Gly-Pro-Hyp; hydroxyproline and hydroxylysine.',
    ],
    confusions: [
      { confusion: 'Type IV collagen forms fibrils.', clarification: 'Type IV forms a sheetlike network in the basal lamina.' },
      { confusion: 'Glycine is rare in collagen, as in most proteins.', clarification: 'Nearly every third residue is glycine (~33%), against ~5% in haemoglobin.' },
    ],
  },
  'collagen-synthesis-3': {
    estimatedMinutes: 12,
    xp: 30,
    highYield: [
      'Proline/lysine hydroxylated after incorporation, before the helix forms, on the amino side of glycine.',
      'Prolyl hydroxylase: Fe²⁺, O₂, α-ketoglutarate → succinate + CO₂; ascorbate keeps Fe²⁺.',
      'Bipyridyl (iron chelator) → unhydroxylated collagen, no helix at 37 °C (helical below 24 °C).',
      'More Pro + Hyp → higher Tm. Glc–Gal on hydroxylysine before the helix.',
    ],
    confusions: [
      { confusion: 'Free hydroxyproline from the diet is built into collagen.', clarification: 'Only proline is incorporated; it is hydroxylated in the chain (slide 36).' },
      { confusion: 'Hydroxylation happens after the triple helix forms.', clarification: 'Hydroxylation and glycosylation happen in nascent chains before the helix forms.' },
    ],
  },
  'collagen-synthesis-4': {
    estimatedMinutes: 9,
    xp: 25,
    highYield: [
      'Procollagen peptidases cut the extensions outside the cell; extensions prevent premature fibres.',
      'Quarter-staggered array; ~400 Å gaps may nucleate bone.',
      'Lysyl oxidase → allysine → aldol cross-link (+ His, + Hyl).',
    ],
    confusions: [
      { confusion: 'Collagen cross-links are disulfide bonds.', clarification: 'The fibre cross-links are made from lysine side chains (allysine, aldol). Disulfides join the C-terminal extensions of procollagen.' },
      { confusion: 'Procollagen is trimmed inside the fibroblast.', clarification: 'Procollagen peptidases act in the extracellular space.' },
    ],
  },
  'collagen-synthesis-5': {
    estimatedMinutes: 12,
    xp: 30,
    highYield: [
      'Scurvy: ascorbate deficiency → under-hydroxylated, less stable collagen; bleeding gums, loose teeth, poor wound healing.',
      'Ehlers-Danlos: hyperextensible joints, stretchy fragile skin; defects in type III collagen, procollagen peptidase, lysine hydroxylation or lysyl oxidase.',
      'Lathyrism: β-aminopropionitrile → no lysyl aldehydes → no cross-links.',
      'OI: Gly988 → Cys; dominant because the bad chain joins the helix.',
    ],
    confusions: [
      { confusion: 'A mutant allele that gives no chain at all would be worse in OI.', clarification: 'Slide 73: an unusable chain would give normal collagen, just less; the harm comes from the abnormal chain joining the helix.' },
      { confusion: 'Lathyrism blocks hydroxylation.', clarification: 'β-Aminopropionitrile blocks aldehyde (allysine) formation, so cross-links fail.' },
    ],
  },
  'collagen-synthesis-6': {
    estimatedMinutes: 8,
    xp: 20,
    highYield: [
      'Elastin: elastic fibres stretch several-fold and recoil; rich in aorta (arch) and ligaments.',
      '⅓ glycine, proline-rich, very little hydroxyproline, no hydroxylysine, many non-polar residues.',
      'Desmosine (four lysines) only in elastin; aldol and lysinonorleucine in both.',
    ],
    confusions: [
      { confusion: 'Elastin is rich in hydroxyproline, like collagen.', clarification: 'Elastin has very little hydroxyproline and no hydroxylysine.' },
      { confusion: 'Desmosine is found in collagen too.', clarification: 'Desmosine is found only in elastin.' },
    ],
  },
};
