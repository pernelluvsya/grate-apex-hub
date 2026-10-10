// Biochemistry → Collagen and Elastin — the six lessons (reading layer).
// Source: E. F. Laing's lecture deck (81 slides), including the textbook
// figures and pages pasted into it (written out in sources.ts `diagrams`).
import type { LessonDraft } from '@/data/topics/build';
import { interactive, readingExtras } from '@/data/topics/collagen-synthesis/interactive';
import { ref, type ConceptId } from '@/data/topics/collagen-synthesis/sources';

type Draft = LessonDraft<ConceptId>;

// ─── Lesson 1 ───────────────────────────────────────────────────────

const lesson1: Draft = {
  id: 'collagen-synthesis-1',
  title: 'Structural Proteins, the Matrix and Repair',
  description: 'What structural proteins are, how cells hold on to the extracellular matrix, the cells of connective tissue, and how wounds heal and scar.',
  xp: 25,
  sourceRefs: ref([2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 15, 16, 17, 18]),
  objectives: [
    'Match protein functions to examples',
    'Classify structural proteins as cellular or extracellular',
    'Explain how fibronectin and integrins connect cells to the matrix',
    'Describe fibroblasts, mesenchymal cells and myofibroblasts',
    'Order the four phases of wound healing and name the types of scar',
  ],
  chunks: [
    {
      title: 'Proteins and structural proteins',
      kind: 'overview',
      paragraphs: ['Proteins do five broad jobs (slide 2):'],
      table: {
        columns: ['Function', 'Examples'],
        rows: [
          ['Structure', 'Hair, fingernails, cell walls, extracellular matrix proteins'],
          ['Transport', 'Albumin, caeruloplasmin, haemoglobin'],
          ['Regulation', 'Protein hormones (e.g. insulin)'],
          ['Catalysis', 'Enzymes'],
          ['Locomotion', 'Actin, myosin'],
        ],
      },
      keyPoints: ['Structural proteins hold biological structures together or form body structures — e.g. keratin in hair, skin and nails (and fur, hooves, claws and scales in other animals) (slide 3).'],
      sourceRefs: ref([2, 3]),
    },
    {
      title: 'Cellular and extracellular structural proteins',
      kind: 'classification',
      paragraphs: ['Slide 4 divides structural proteins into two groups:'],
      table: {
        columns: ['Cellular proteins', 'Extracellular proteins'],
        rows: [
          ['Cytoskeleton', 'Collagen'],
          ['Cell wall proteins', 'Elastin'],
          ['Transmembrane proteins, e.g. integrins', ''],
        ],
      },
      sourceRefs: ref([4]),
    },
    {
      title: 'Cells and the extracellular matrix',
      kind: 'structure',
      paragraphs: [
        'Connective tissue under an epithelium contains many cells (fibroblasts, macrophages, mast cells) and matrix components — collagen fibres, elastic fibres and a ground substance of hyaluronan, proteoglycans and glycoproteins. Cells are connected to the matrix (slide 5).',
        'Fibronectin is an extracellular protein that helps cells attach to the matrix. It has separate binding domains for collagen, heparin, cells and itself; its cell-binding domain carries the RGD (Arg-Gly-Asp) sequence (slide 7).',
        'Integrins link the extracellular matrix to the cytoskeleton. An integrin’s α and β subunits span the plasma membrane: outside they bind a matrix protein, inside they connect — via α-actinin, talin or filamin and vinculin — to actin filaments (slide 8).',
      ],
      sourceRefs: ref([5, 7, 8]),
    },
    {
      title: 'Cells of connective tissue',
      kind: 'definitions',
      terms: [
        { term: 'Fibroblasts', meaning: 'The most common connective tissue cell. They secrete ground substance (hyaluronan + protein = GAGs) and the fibre proteins collagen and elastin. Specialised types include chondrocytes (cartilage) and osteocytes (bone).' },
        { term: 'Mesenchymal cells', meaning: 'Stem cells that differentiate to replace connective tissue cells after injury (e.g. fibroblasts, adipocytes).' },
        { term: 'Myofibroblasts', meaning: 'During wound healing some fibroblasts transform into myofibroblasts, shown by staining for α-smooth muscle actin. They make collagen in fibrotic skin diseases — keloids, scleroderma, hypertrophic scars.' },
      ],
      sourceRefs: ref([15, 16, 17, 18]),
    },
    {
      title: 'The four phases of wound healing',
      kind: 'pathway',
      paragraphs: ['Normal wound healing involves making new extracellular matrix proteins (slide 10). The phases overlap, with growth factors acting throughout (slide 11):'],
      steps: [
        { label: 'Haemostasis — seconds to hours', detail: 'Vasoconstriction, platelet aggregation, leucocyte migration; platelets and fibrin.' },
        { label: 'Inflammation — hours to days', detail: 'Neutrophils early, then macrophages (and lymphocytes); chemoattractants; phagocytosis of foreign bodies and bacteria.' },
        { label: 'Proliferation — days to a week', detail: 'Fibroblast proliferation, collagen synthesis, matrix reorganisation, angiogenesis, granulation tissue, epithelialisation.' },
        { label: 'Remodelling — a week to months', detail: 'Collagen fibril cross-linking and scar maturation; the wound gains tensile strength.' },
      ],
      sourceRefs: ref([10, 11]),
      notes: [
        { kind: 'lecturer', text: 'Slide 9 (“Activation of fibroblasts — collagen fibrillogenesis”) shows TGF-β1 directing repair: released from platelets, low concentrations attract lymphocytes, monocytes, neutrophils and fibroblasts; higher concentrations activate macrophages and make fibroblasts produce matrix.' },
      ],
    },
    {
      title: 'Types of scars',
      kind: 'clinical',
      paragraphs: ['Slide 12 lists four types: normal scars, atrophic scars, hypertrophic scars and keloids. Myofibroblasts make the excess collagen of keloids and hypertrophic scars (slide 18).'],
      sourceRefs: ref([12, 18]),
    },
  ],
  summary: [
    'Protein functions: structure, transport (albumin, caeruloplasmin, Hb), regulation (insulin), catalysis (enzymes), locomotion (actin, myosin).',
    'Structural proteins: cellular (cytoskeleton, cell wall, transmembrane/integrins) and extracellular (collagen, elastin). Keratin is the example structural protein.',
    'Fibronectin attaches cells to the matrix (RGD in its cell-binding domain); integrins link the matrix to the actin cytoskeleton.',
    'Fibroblasts secrete ground substance, collagen and elastin; mesenchymal stem cells replace CT cells; myofibroblasts arise in wound healing and make collagen in keloids and hypertrophic scars.',
    'Wound healing: haemostasis → inflammation → proliferation (collagen synthesis) → remodelling (cross-linking, scar maturation). Scars: normal, atrophic, hypertrophic, keloid.',
  ],
};

// ─── Lesson 2 ───────────────────────────────────────────────────────

const lesson2: Draft = {
  id: 'collagen-synthesis-2',
  title: 'Collagen Types and the Triple Helix',
  description: 'Collagen’s roles, its main types and where they occur, the tropocollagen triple helix, and its unusual amino acid sequence.',
  xp: 25,
  sourceRefs: ref([13, 14, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 31, 32]),
  objectives: [
    'Describe what collagen is and where it is found',
    'Match the main collagen types to their tissues and polymerised forms',
    'Describe the size and helix of tropocollagen',
    'Explain why collagen’s amino acid composition is unusual',
  ],
  chunks: [
    {
      title: 'Collagen',
      kind: 'overview',
      paragraphs: [
        'Collagen is a family of fibrous proteins — the most abundant protein in mammals. It is the major fibrous element of skin, bone, tendon, cartilage, blood vessels and teeth. It has a structural role in mature tissue and a directive role in developing tissue, and it forms insoluble fibres of high tensile strength (slide 13).',
        'In tadpole skin, collagen fibrils lie in layers at angles to each other; the same arrangement is found in bone and the cornea (slides 14, 20).',
      ],
      sourceRefs: ref([13, 14, 19, 20]),
    },
    {
      title: 'Types of collagen',
      kind: 'classification',
      paragraphs: ['Slide 22 groups collagens by the form they polymerise into:'],
      table: {
        columns: ['Type', 'Chains', 'Polymerised form', 'Where'],
        rows: [
          ['I', '[α1(I)]₂α2(I)', 'Fibril', 'Bone, skin, tendons, ligaments, cornea, internal organs — 90% of body collagen'],
          ['II', '[α1(II)]₃', 'Fibril', 'Cartilage, intervertebral disc, notochord, vitreous humour'],
          ['III', '[α1(III)]₃', 'Fibril', 'Skin, blood vessels, internal organs'],
          ['V', '[α1(V)]₂α2(V) and α1(V)α2(V)α3(V)', 'Fibril (with type I)', 'As for type I'],
          ['XI', 'α1(XI)α2(XI)α3(XI)', 'Fibril (with type II)', 'As for type II'],
          ['IX', 'α1(IX)α2(IX)α3(IX)', 'Fibril-associated: lateral association with type II fibrils', 'Cartilage'],
          ['XII', '[α1(XII)]₃', 'Fibril-associated: lateral association with some type I fibrils', 'Tendons, ligaments, some other tissues'],
          ['IV', '[α1(IV)]₂α2(IV)', 'Network-forming: sheetlike network', 'Basal lamina'],
          ['VII', '[α1(VII)]₃', 'Network-forming: anchoring fibrils', 'Beneath stratified squamous epithelia'],
          ['XVII', '[α1(XVII)]₃', 'Transmembrane', 'Hemidesmosomes'],
          ['XVIII', '[α1(XVIII)]₃', 'Other', 'Basal lamina around blood vessels'],
        ],
      },
      keyPoints: [
        'Types I, IV, V, IX and XI contain two or three kinds of α chain; types II, III, VII, XII, XVII and XVIII contain only one kind.',
        'The slide notes about 20 types of collagen and about 25 types of α chain identified so far.',
      ],
      sourceRefs: ref([21, 22, 23]),
      notes: [{ kind: 'clarified', text: 'The slide prints type XI as α1(XI)α2(IX)α3(XI); in a type XI row the middle chain is α2(XI), as written above. The type XI formula is not quizzed.' }],
    },
    {
      title: 'Tropocollagen: the triple-stranded helical rod',
      kind: 'structure',
      paragraphs: [
        'Tropocollagen is the structural unit of collagen (mass 285 kDa). It is three polypeptide chains of the same size, each of about a thousand amino acid residues; the chain composition depends on the type of collagen (slide 24).',
        'It is 3000 Å long and 15 Å in diameter — one of the longest known proteins. Each strand is a type II trans helix (like synthetic poly-L-proline) with three residues per turn and a rise of 3.12 Å per residue (slides 25–27).',
      ],
      sourceRefs: ref([24, 25, 26, 27]),
    },
    {
      title: 'An unusual amino acid composition',
      kind: 'structure',
      paragraphs: [
        'Nearly every third residue is glycine, so glycine makes up nearly 33.3% of all collagen (haemoglobin has about 5%). Proline is much more common than in most proteins, and collagen contains hydroxyproline and hydroxylysine — modified amino acids found in few other proteins (slides 30–31).',
        'The sequence glycine–proline–hydroxyproline recurs frequently. Silk fibroin and elastin also have regularly repeating sequences, whereas globular proteins rarely do (slides 29, 32).',
      ],
      sourceRefs: ref([29, 30, 31, 32]),
    },
  ],
  summary: [
    'Collagen: a family of fibrous proteins; the most abundant protein in mammals; skin, bone, tendon, cartilage, vessels, teeth; insoluble fibres of high tensile strength.',
    'Type I (90%): bone, skin, tendon; type II: cartilage, vitreous; type III: skin, vessels; type IV: basal lamina (sheet network); type VII: anchoring fibrils; type XVII: hemidesmosomes.',
    'Tropocollagen: 285 kDa; three chains of ~1000 residues; 3000 Å × 15 Å; each strand a type II trans helix, 3 residues/turn, 3.12 Å rise.',
    'Composition: glycine ~33% (every third residue), lots of proline, hydroxyproline and hydroxylysine; Gly-Pro-Hyp repeats.',
  ],
};

// ─── Lesson 3 ───────────────────────────────────────────────────────

const lesson3: Draft = {
  id: 'collagen-synthesis-3',
  title: 'Making Collagen: Hydroxylation and Glycosylation',
  description: 'The steps in collagen synthesis, how proline and lysine are hydroxylated, why ascorbate matters, what holds the helix together, and the sugars on hydroxylysine.',
  xp: 30,
  sourceRefs: ref([33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52]),
  objectives: [
    'Order the seven steps from polypeptide to mature collagen fibre',
    'Explain how hydroxyproline and hydroxylysine are formed',
    'Describe prolyl hydroxylase, its cofactors and the role of ascorbate',
    'State the rules for which residues are hydroxylated',
    'Relate imino acid content to the stability of the helix',
    'Describe the glycosylation of hydroxylysine',
  ],
  chunks: [
    {
      title: 'Overview of collagen synthesis',
      kind: 'pathway',
      paragraphs: ['Slide 33’s figure shows seven steps:'],
      steps: [
        { label: '1. Polypeptide synthesis', detail: 'Inside the fibroblast, on ribosomes on the ER.' },
        { label: '2. Hydroxylation and glycosylation' },
        { label: '3. Triple-helix formation' },
        { label: '4. Secretion', detail: 'As procollagen.' },
        { label: '5. Hydrolysis of peptide bonds', detail: 'Procollagen → tropocollagen.' },
        { label: '6. Assembly near the cell surface', detail: 'Tropocollagen → collagen fibre.' },
        { label: '7. Formation of cross-links', detail: '→ mature collagen fibre.' },
      ],
      sourceRefs: ref([33, 34, 35]),
      notes: [{ kind: 'lecturer', text: 'Slide 34’s figure: the C-terminal extensions of the three procollagen chains form disulfide bonds, which first hold the chains together and help the triple helix form.' }],
    },
    {
      title: 'Hydroxyproline and hydroxylysine',
      kind: 'mechanism',
      paragraphs: [
        'Proline and lysine are built into the nascent collagen chain first and hydroxylated afterwards by special enzymes. Proline is the precursor of hydroxyproline in collagen; free hydroxyproline is not incorporated into the chain (slide 36).',
      ],
      sourceRefs: ref([36, 37, 38, 39]),
    },
    {
      title: 'Prolyl hydroxylase',
      kind: 'mechanism',
      paragraphs: [
        'Prolyl-4-hydroxylase converts some prolyl residues to 4-hydroxyproline. It is a dioxygenase with ferrous iron (Fe²⁺) at its active site, and it needs molecular oxygen, α-ketoglutarate and ascorbate (slides 40–41).',
        'One oxygen atom of O₂ goes onto proline; the other ends up in succinate, made from α-ketoglutarate with release of CO₂. Ascorbate keeps the iron reduced in the +2 state (slides 40, 42).',
      ],
      terms: [
        { term: 'Ascorbic acid', meaning: 'Vitamin C. Primates and guinea pigs cannot synthesise it (slide 43).' },
      ],
      sourceRefs: ref([40, 41, 42, 43]),
    },
    {
      title: 'Where hydroxylation happens',
      kind: 'regulation',
      steps: [
        { label: 'Free proline is not a substrate', detail: 'Only prolyl residues in nascent chains.' },
        { label: 'Hydroxylation happens before the helix forms' },
        { label: 'C-4 hydroxylation needs a glycine next door', detail: 'The proline must be on the amino side of a glycine residue.' },
        { label: 'A few prolines are hydroxylated at C-3', detail: 'By a different enzyme, prolyl-3-hydroxylase.' },
        { label: 'A few lysines are hydroxylated at C-5', detail: 'By lysyl hydroxylase (Fe²⁺; needs O₂, α-ketoglutarate and ascorbate); all lie on the amino side of glycine.' },
      ],
      paragraphs: [
        'α,α′-Bipyridyl, an iron chelator, pulls iron out of prolyl hydroxylase and inhibits it. The unhydroxylated collagen made does not form a triple helix at 37 °C, but becomes helical if cooled below 24 °C (slide 45).',
      ],
      sourceRefs: ref([44, 45, 46]),
    },
    {
      title: 'Melting and the stability of the helix',
      kind: 'structure',
      paragraphs: [
        'Extraction hydrolyses covalent bonds and frees tropocollagen units, which are held together mainly by many hydrogen bonds acting co-operatively. Heating a tropocollagen solution melts the molecules (slide 47): the triple helix collapses abruptly into gelatin, a random coil (slide 48).',
        'The melting temperature (Tm) is the temperature at which half of the helical structure is lost; for intact fibres the comparable index is the shrinkage temperature (Ts). The higher the imino acid (proline + hydroxyproline) content, the more stable the helix — and the Tm tracks the body temperature of the species (slide 49):',
      ],
      table: {
        columns: ['Source', 'Pro + Hyp /1000 residues', 'Ts', 'Tm', 'Body temperature'],
        rows: [
          ['Calf skin', '232', '65 °C', '39 °C', '37 °C'],
          ['Shark skin', '191', '53 °C', '29 °C', '24–28 °C'],
          ['Cod skin', '155', '40 °C', '16 °C', '10–14 °C'],
        ],
      },
      sourceRefs: ref([47, 48, 49]),
    },
    {
      title: 'Sugars on hydroxylysine',
      kind: 'mechanism',
      paragraphs: [
        'A disaccharide of glucose and galactose is attached to hydroxylysine residues, added in sequence by galactosyl and glucosyl transferases. These enzymes act on hydroxylysine in nascent collagen before it becomes helical (slide 50).',
        'The amount varies by type: tendon collagen (type I, fibrillar) has 6 carbohydrate units per tropocollagen molecule, lens capsule (type IV, sheetlike network) about 110 (slide 51).',
      ],
      sourceRefs: ref([50, 51, 52]),
    },
  ],
  summary: [
    'Seven steps: synthesis → hydroxylation/glycosylation → triple helix → secretion → peptide hydrolysis (→ tropocollagen) → assembly → cross-links.',
    'Proline and lysine are hydroxylated after incorporation; free hydroxyproline is not used.',
    'Prolyl-4-hydroxylase: dioxygenase, Fe²⁺, needs O₂, α-ketoglutarate (→ succinate + CO₂) and ascorbate to keep Fe²⁺. Primates and guinea pigs can’t make ascorbate.',
    'Rules: free proline not a substrate; before helix formation; Pro (C-4) and Lys (C-5) on the amino side of Gly; a few Pro at C-3. α,α′-Bipyridyl removes iron → no helix at 37 °C.',
    'Helix held by many co-operative H-bonds; melts to gelatin. More Pro + Hyp → higher Tm (calf 39 °C, shark 29 °C, cod 16 °C).',
    'Glc–Gal disaccharide on hydroxylysine, before the helix forms; 6 units (tendon, type I) vs ~110 (lens capsule, type IV).',
  ],
};

// ─── Lesson 4 ───────────────────────────────────────────────────────

const lesson4: Draft = {
  id: 'collagen-synthesis-4',
  title: 'Fibre Assembly and Cross-Links',
  description: 'How procollagen becomes tropocollagen, how molecules pack into fibres, and how lysyl oxidase builds the cross-links that make collagen strong.',
  xp: 25,
  sourceRefs: ref([28, 34, 53, 54, 55, 56, 57, 58, 59, 60]),
  objectives: [
    'Explain why the triple helix lets molecules aggregate into fibres',
    'Describe the role of procollagen peptidases and the extension peptides',
    'Describe the quarter-staggered array',
    'Explain how lysyl oxidase and aldol condensation form cross-links',
  ],
  chunks: [
    {
      title: 'Procollagen peptidases control fibre formation',
      kind: 'mechanism',
      paragraphs: [
        'Collagen is secreted as procollagen, with extension peptides at both ends. Procollagen peptidases cut them off in the extracellular space (slide 54).',
        'The extra peptides prevent fibres from forming too early and may guide the transport of procollagen across the cell membrane (slide 54). The C-terminal extensions also carry cysteines whose disulfide bonds first hold the three chains together and help the triple helix form (slide 34 figure).',
      ],
      sourceRefs: ref([34, 54, 55]),
    },
    {
      title: 'From molecules to fibres',
      kind: 'structure',
      paragraphs: [
        'Unlike globular proteins folded into compact shapes, collagen’s elongated triple helix leaves many amino acid side chains on its surface. Bonds between exposed R groups of neighbouring molecules make them aggregate into fibres (slide 53).',
        'In a fibre, tropocollagen molecules (3000 Å) form a quarter-staggered array. Along a row they are not joined end to end: a gap of about 400 Å separates one molecule from the next, and these gaps may be nucleation sites in bone formation (slide 60).',
      ],
      sourceRefs: ref([53, 60]),
    },
    {
      title: 'Cross-links',
      kind: 'pathway',
      paragraphs: ['Collagen fibres are strengthened by covalent cross-links, both within a tropocollagen molecule (intramolecular) and between molecules (intermolecular) (slides 28, 56). They are built from lysine side chains:'],
      steps: [
        { label: 'Lysyl oxidase makes allysine', detail: 'The ε-amino group of certain lysine side chains is converted to an aldehyde.' },
        { label: 'Aldol condensation', detail: 'Two allysine aldehydes join to form an aldol cross-link.' },
        { label: 'Histidine–aldol cross-link', detail: 'A histidine side chain adds across the aldol cross-link’s C=C double bond.' },
        { label: 'Schiff base', detail: 'Its aldehyde can link to another side chain such as hydroxylysine — four side chains joined.' },
      ],
      keyPoints: ['The extent of cross-linking varies with function and age: the Achilles tendon of mature rats is highly cross-linked; the flexible tail tendon much less so (slide 28).'],
      sourceRefs: ref([28, 56, 57, 58, 59]),
      notes: [{ kind: 'lecturer', text: 'Lathyrism (Lesson 5) shows why cross-links matter: β-aminopropionitrile blocks the lysyl → aldehyde step, and the collagen becomes extremely fragile.' }],
    },
  ],
  summary: [
    'Procollagen peptidases remove the extension peptides in the extracellular space; the extensions prevent premature fibre formation and may guide transport; C-terminal disulfides help start the triple helix.',
    'The triple helix exposes side chains, so neighbouring molecules bond and aggregate into fibres.',
    'Quarter-staggered array of 3000 Å molecules with ~400 Å gaps — possible nucleation sites for bone.',
    'Cross-links: lysyl oxidase → allysine; aldol condensation → aldol cross-link; + histidine; + hydroxylysine (Schiff base). Intra- and intermolecular; more in the Achilles than the tail tendon.',
  ],
};

// ─── Lesson 5 ───────────────────────────────────────────────────────

const lesson5: Draft = {
  id: 'collagen-synthesis-5',
  title: 'Collagen Disorders',
  description: 'Scurvy, Ehlers-Danlos syndrome, dermatoparaxis, lathyrism and osteogenesis imperfecta — each traced to a step in collagen synthesis.',
  xp: 30,
  sourceRefs: ref([28, 43, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73]),
  objectives: [
    'Explain the biochemistry and clinical features of scurvy',
    'List the defects and features of Ehlers-Danlos syndrome',
    'Link dermatoparaxis and lathyrism to the steps they block',
    'Explain why a single glycine change in osteogenesis imperfecta is dominant and can be lethal',
  ],
  chunks: [
    {
      title: 'Scurvy',
      kind: 'clinical',
      paragraphs: [
        'Scurvy is caused by a dietary deficiency of ascorbic acid. The iron in prolyl hydroxylase is not kept reduced, so the collagen made is not properly hydroxylated and has a lower melting temperature (slide 61).',
        'Diagnosis: no test is completely satisfactory; white cell ascorbic acid is low (slide 64).',
      ],
      table: {
        columns: ['Infants (slide 62)', 'Adults (slide 63)'],
        rows: [
          ['Painful, tender limbs', 'Listlessness, anorexia, cachexia'],
          ['Defective bone formation', 'Bleeding from the gums and around hair follicles'],
          ['Weak blood vessels with haemorrhages', 'Gingivitis, halitosis, loose teeth'],
          ['', 'Bleeding into joints and bladder'],
          ['', 'Poor wound healing'],
        ],
      },
      sourceRefs: ref([43, 61, 62, 63, 64]),
    },
    {
      title: 'Ehlers-Danlos syndrome',
      kind: 'clinical',
      paragraphs: [
        'A group of rare hereditary disorders in which collagen synthesis is impaired; many are poorly characterised. Known defects (slide 65): defective type III collagen synthesis, deficiency of procollagen peptidases, defective hydroxylation of lysine, deficiency of lysyl oxidase, and uncharacterised lesions.',
        'Features (slide 66): hyperextensible joints, excessive stretching of skin, ready bruising and easy tearing of skin, and short stature.',
        'Slide 67’s gel of skin (type I) collagen: normal collagen shows only α1 and α2 chains, but in Ehlers-Danlos syndrome type VII pro-α1 and pro-α2 chains appear too — the propeptides have not been removed.',
      ],
      sourceRefs: ref([65, 66, 67]),
    },
    {
      title: 'Dermatoparaxis',
      kind: 'clinical',
      paragraphs: ['A genetically transmitted recessive disease of cattle caused by the absence of a procollagen peptidase. Affected animals have very fragile skin with disorganised collagen bundles, and the amino-terminal propeptides are retained (slide 68).'],
      sourceRefs: ref([68]),
    },
    {
      title: 'Lathyrism',
      kind: 'clinical',
      paragraphs: [
        'Animals that eat seeds of the sweet pea make extremely fragile collagen. The toxic agent, β-aminopropionitrile, inhibits the conversion of lysyl side chains into aldehydes — so cross-links cannot form (slides 69–70; slide 28).',
      ],
      sourceRefs: ref([28, 69, 70]),
      notes: [{ kind: 'check', text: 'Slide 69 also describes lathyrism as “acute spastic paralysis in lathyrus pea eaters with no satisfactory treatment”, but the deck doesn’t explain how this relates to the collagen defect. Ask your lecturer — not quizzed.' }],
    },
    {
      title: 'Osteogenesis imperfecta',
      kind: 'clinical',
      paragraphs: [
        'Defective type I collagen: brittle bones, multiple fractures and skeletal deformities. Mutation of a single glycine can be lethal. Both a normal and a mutant allele for the α1 chain of type I collagen are found (slide 71).',
        'In one case residue 988 changes from glycine to cysteine. This disrupts the triple helix near its carboxyl end, exposing it to excessive hydroxylation and glycosylation; the abnormal collagen is partly unfolded at body temperature and cannot form ordered fibrils (slide 72).',
        'A single nucleotide change in a genome of 3 × 10⁹ base pairs causes a fatal disorder. The mutant allele is dominant because its aberrant chain is built into the triple helix and spoils it. Had the mutant allele produced a completely unusable α1 chain, the collagen made would be normal, just less of it (slide 73).',
      ],
      sourceRefs: ref([71, 72, 73]),
    },
  ],
  summary: [
    'Scurvy: no ascorbate → prolyl hydroxylase iron not kept reduced → under-hydroxylated collagen with a lower Tm. Infants: tender limbs, poor bone, haemorrhages. Adults: bleeding gums/follicles, loose teeth, poor wound healing. White-cell ascorbate low.',
    'Ehlers-Danlos: type III collagen, procollagen peptidase, lysine hydroxylation or lysyl oxidase defects; hyperextensible joints, stretchy fragile skin, bruising, short stature. Type VII: pro-α chains persist.',
    'Dermatoparaxis (cattle): no procollagen peptidase → fragile skin, retained N-terminal propeptides.',
    'Lathyrism: β-aminopropionitrile blocks lysyl → aldehyde → no cross-links → fragile collagen.',
    'Osteogenesis imperfecta: Gly988 → Cys in α1(I) disrupts the helix → over-modified, partly unfolded collagen; dominant because the bad chain joins the helix.',
  ],
};

// ─── Lesson 6 ───────────────────────────────────────────────────────

const lesson6: Draft = {
  id: 'collagen-synthesis-6',
  title: 'Elastin',
  description: 'Where elastin is found, how its composition differs from collagen’s, and the cross-links — including desmosine — that let elastic fibres snap back.',
  xp: 20,
  sourceRefs: ref([6, 74, 75, 76, 77, 78, 79, 80, 81]),
  objectives: [
    'Describe where elastin is found and what elastic fibres do',
    'Compare the amino acid composition of elastin and collagen',
    'Name elastin’s cross-links and say which is unique to elastin',
  ],
  chunks: [
    {
      title: 'Where elastin is and what it does',
      kind: 'overview',
      paragraphs: [
        'Elastin is found in most connective tissues together with collagen and polysaccharides. It is the major component of elastic fibres, which can stretch to several times their length and then rapidly return to their original size and shape when tension is released (slide 74).',
        'There is a lot of elastin in blood vessel walls — especially the arch of the aorta near the heart — and in ligaments; there is relatively little in skin, tendon and loose connective tissue (slide 75).',
        'In the network, cross-links join single elastin molecules, and each molecule expands and contracts like a coil as the fibre stretches and relaxes (slide 6).',
      ],
      sourceRefs: ref([6, 74, 75]),
      notes: [{ kind: 'lecturer', text: 'The deck labels the elastin section “Appendix 1”.' }],
    },
    {
      title: 'Composition: elastin vs collagen',
      kind: 'comparison',
      table: {
        columns: ['', 'Elastin', 'Collagen'],
        rows: [
          ['Glycine', 'One third of residues', 'Nearly every third residue (~33%)'],
          ['Proline', 'Rich', 'Rich'],
          ['Hydroxyproline', 'Very little', 'Plenty'],
          ['Hydroxylysine', 'None', 'Present (carries sugars)'],
          ['Other residues', 'Many non-polar aliphatic residues (Ala, Val, Leu, Ile); few polar ones', '—'],
        ],
      },
      paragraphs: ['Mature elastin contains many cross-links, which make it highly insoluble and therefore difficult to analyse (slide 77).'],
      sourceRefs: ref([30, 76, 77]),
    },
    {
      title: 'Cross-links in elastin',
      kind: 'structure',
      paragraphs: [
        'A repeating sequence in elastin is Lys-Ala-Ala-Lys or Lys-Ala-Ala-Ala-Lys, which places lysines for cross-linking (slide 78).',
        'The regions between cross-links are rich in glycine, proline and valine. The cross-links may help elastic fibres return to their original size and shape after stretching (slide 79).',
      ],
      table: {
        columns: ['Cross-link', 'Found in', 'Made from'],
        rows: [
          ['Aldol cross-link', 'Collagen and elastin', 'Two lysine-derived aldehydes'],
          ['Lysinonorleucine', 'Collagen and elastin', 'A lysine + a lysine-derived aldehyde (Schiff base, then reduced)'],
          ['Desmosine', 'Elastin only', 'Four lysine side chains'],
        ],
      },
      sourceRefs: ref([78, 79, 80, 81]),
    },
  ],
  summary: [
    'Elastin: with collagen in most connective tissues; the main component of elastic fibres, which stretch several-fold and recoil.',
    'Abundant in vessel walls (aortic arch) and ligaments; little in skin, tendon, loose CT.',
    'Composition: ⅓ glycine, rich in proline, very little hydroxyproline, no hydroxylysine; many non-polar residues (Ala, Val, Leu, Ile).',
    'Cross-links: aldol and lysinonorleucine (shared with collagen); desmosine (four lysines) only in elastin. Lys-Ala-Ala-Lys repeats.',
  ],
};

export const lessons: Draft[] = [lesson1, lesson2, lesson3, lesson4, lesson5, lesson6].map((lesson) => ({
  ...lesson,
  ...readingExtras[lesson.id],
  interactive: interactive[lesson.id],
}));
