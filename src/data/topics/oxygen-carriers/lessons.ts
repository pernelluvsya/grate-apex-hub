// Biochemistry → Oxygen Carriers: Myoglobin and Haemoglobin — the four
// lessons (reading layer).
//
// Sources:
// - The lecture deck (Edwin F. Laing, 58 slides) defines WHAT is taught.
//   Its pasted textbook pages and figures were read and written out in
//   ./sources.ts → diagrams; lessons teach from them.
// - Lehninger (leh(...)) only explains or settles points WITHIN that scope.
// - Unsettled points are 'check' notes and are never quizzed.
import type { LessonDraft } from '@/data/topics/build';
import { interactive, readingExtras } from '@/data/topics/oxygen-carriers/interactive';
import { leh, ref, type ConceptId } from '@/data/topics/oxygen-carriers/sources';

type Draft = LessonDraft<ConceptId>;

// ─── Lesson 1 ───────────────────────────────────────────────────────

const lesson1: Draft = {
  id: 'oxygen-carriers-1',
  title: 'Myoglobin: Roles, Haem Iron and Structure',
  description: 'What the oxygen carriers do, how haem iron binds, and how myoglobin is folded.',
  xp: 25,
  sourceRefs: ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
  objectives: [
    'Describe what myoglobin and haemoglobin bind and what myoglobin is for',
    'Describe the haem iron’s coordination positions and oxidation states',
    'Describe myoglobin’s helices and how its residues are named',
    'Explain what terminates an α-helix',
    'Predict which amino acids sit inside and outside myoglobin',
  ],
  chunks: [
    {
      title: 'Two oxygen carriers',
      kind: 'overview',
      paragraphs: [
        'Myoglobin and haemoglobin both bind oxygen, carbon dioxide and H⁺ ions — but these species do not affect the two carriers in the same way (slide 2).',
        'Myoglobin serves as a reserve supply of oxygen and helps oxygen move within red muscle. Both proteins bind oxygen because they carry a non-polypeptide unit, the haem group.',
      ],
      sourceRefs: ref([2, 3]),
    },
    {
      title: 'The haem iron',
      kind: 'structure',
      paragraphs: [
        'The iron in haem binds the four nitrogens at the centre of the protoporphyrin ring. It can form two more bonds, one on each side of the haem plane — the fifth and sixth coordination positions (slides 4–5).',
        'With iron in the +2 (ferrous) state, haemoglobin is called ferrohaemoglobin; in the +3 (ferric) state it is ferrihaemoglobin or methaemoglobin. Only ferrohaemoglobin binds oxygen. Myoglobin is named the same way: ferromyoglobin and ferrimyoglobin (slide 6).',
      ],
      table: {
        columns: ['Iron', 'Haemoglobin', 'Myoglobin', 'Binds O₂?'],
        rows: [
          ['Fe²⁺ (ferrous)', 'Ferrohaemoglobin', 'Ferromyoglobin', 'Yes'],
          ['Fe³⁺ (ferric)', 'Ferrihaemoglobin (methaemoglobin)', 'Ferrimyoglobin', 'No'],
        ],
      },
      sourceRefs: ref([4, 5, 6]),
    },
    {
      title: 'A compact, helical protein',
      kind: 'structure',
      paragraphs: [
        'Myoglobin is compact (about 45 × 35 × 25 Å) with a high α-helix content: about 75% of its main chain forms right-handed α-helical segments — eight major helices, labelled A to H (slide 7).',
        'Residues are named by helix: the first residue of helix A is A1, the second A2, and so on. The seven non-helical segments between helices are named after the two helices they join (e.g. CD between C and D). The two N-terminal residues are NA1 and NA2, and the five C-terminal residues HC1–HC5 (slide 8).',
      ],
      keyPoints: ['Eight helices (A–H); residues named by position, e.g. E7, F8, CD1.'],
      sourceRefs: ref([7, 8, 9]),
    },
    {
      title: 'What ends a helix',
      kind: 'mechanism',
      paragraphs: [
        'Why α-helices end is not fully understood. Proline is known to terminate a helix: its bulky five-membered ring (slide 10 calls it a pyrrolidone ring) does not fit inside an α-helix unless proline sits at one end (slides 10–11).',
        'But myoglobin has only four prolines and eight helix terminations, so other factors must also end helices — for example, the hydroxyl group of serine or threonine interacting with a main-chain carbonyl group (slide 12).',
      ],
      sourceRefs: ref([10, 11, 12]),
    },
    {
      title: 'Inside vs outside',
      kind: 'structure',
      paragraphs: ['Slides 13–16 describe where each kind of amino acid sits:'],
      steps: [
        { label: 'Interior: almost entirely nonpolar', detail: 'e.g. leucine, valine, methionine, phenylalanine.' },
        { label: 'No charged or amide side chains inside', detail: 'Glutamate, aspartate, glutamine, asparagine, lysine and arginine are not found in the interior.' },
        { label: 'Amphipathic residues point their nonpolar part inward', detail: 'Threonine, tyrosine and tryptophan.' },
        { label: 'The only polar residues inside: two histidines', detail: 'They have a critical function at the active site (Lesson 2).' },
      ],
      sourceRefs: ref([13, 14, 15, 16, 17]),
    },
  ],
  summary: [
    'Both carriers bind O₂, CO₂ and H⁺, with different effects; myoglobin stores O₂ and helps it move in red muscle.',
    'Haem iron binds four ring nitrogens plus two more ligands (5th and 6th positions); only Fe²⁺ (ferro-) forms bind O₂.',
    'Myoglobin: compact, ~75% α-helix, eight helices A–H; residues named A1, CD1, NA1, HC5…',
    'Proline ends helices, but with 4 prolines for 8 terminations other interactions (Ser/Thr –OH with C=O) help.',
    'Nonpolar interior; no Glu, Asp, Gln, Asn, Lys, Arg inside; the only interior polar residues are two histidines.',
  ],
};

// ─── Lesson 2 ───────────────────────────────────────────────────────

const lesson2: Draft = {
  id: 'oxygen-carriers-2',
  title: 'The Active Site: Histidines, Oxidation and CO',
  description: 'The proximal and distal histidines, why bound haem is not oxidised, why CO binds less, conserved residues.',
  xp: 25,
  sourceRefs: [...ref([16, 17, 18, 19, 20, 21, 22, 23, 26, 27, 28, 29]), ...leh(162)],
  objectives: [
    'Locate the proximal and distal histidines and the oxygen-binding position',
    'Explain why free haem is quickly oxidised and how myoglobin prevents it',
    'Explain why CO binds haem far less tightly inside myoglobin and haemoglobin',
    'Name the conserved residues of haemoglobin and their roles',
  ],
  chunks: [
    {
      title: 'Two histidines',
      kind: 'structure',
      paragraphs: [
        'The two polar residues inside myoglobin are histidines (slide 16). The iron is bonded directly to histidine F8 — the proximal histidine — at the fifth coordination position; the iron sits about 0.3 Å out of the haem plane, on the F8 side (slide 17).',
        'Oxygen binds on the other side of the plane, at the sixth coordination position. Nearby sits histidine E7 — the distal histidine — which is not bonded to the haem (slide 17).',
      ],
      table: {
        columns: ['Histidine', 'Position', 'Role'],
        rows: [
          ['F8 (proximal)', 'Bonded to the iron — 5th coordination position', 'Holds the haem iron'],
          ['E7 (distal)', 'Near the 6th coordination position, not bonded', 'Shapes the O₂ site (protects the iron, hinders CO)'],
        ],
      },
      sourceRefs: ref([16, 17]),
    },
    {
      title: 'Keeping the iron ferrous',
      kind: 'mechanism',
      paragraphs: [
        'Free haem in water (with no polypeptide chain) binds oxygen reversibly only for a very short time: it is rapidly oxidised to methaem, which cannot bind oxygen. A haem–O₂–haem complex forms first (slide 18).',
        'In myoglobin, the distal histidine E7 and the other residues around the sixth coordination position block the formation of this sandwich. They therefore prevent oxidation of the iron and stabilise the ferrous form (slide 19).',
        'So the polypeptide chain creates a hindered haem environment that lets haem bind oxygen reversibly for long periods; otherwise the O₂ would become trapped in a haem–O₂–haem complex (slide 20).',
      ],
      steps: [
        { label: 'Free haem + O₂', detail: 'Binds only briefly.' },
        { label: 'Haem–O₂–haem sandwich forms' },
        { label: 'Iron oxidised → methaem', detail: 'Cannot bind O₂.' },
      ],
      keyPoints: ['The globin’s distal pocket blocks the haem–O₂–haem sandwich, keeping the iron Fe²⁺.'],
      sourceRefs: ref([18, 19, 20]),
    },
    {
      title: 'Why CO binds less tightly',
      kind: 'clinical',
      paragraphs: [
        'Haem has a high affinity for carbon monoxide: free haem in solution binds CO 25,000 times more strongly than O₂. In myoglobin and haemoglobin the preference falls to only about 200 times (slide 21).',
        'The reason is geometry. Free haem binds CO with Fe, C and O in a straight line. In the proteins the distal histidine prevents this linear binding, so the Fe–C bond is at an angle to the C–O bond — a strained, weaker binding (slides 22–23). O₂ binds in a bent mode anyway, so it is not hindered in the same way (slide 23).',
      ],
      keyPoints: ['Free haem: CO ≈ 25,000× O₂. In Mb/Hb: ≈ 200× — the distal histidine forces CO to bind bent.'],
      sourceRefs: [...ref([21, 22, 23]), ...leh(162)],
      notes: [
        {
          kind: 'textbook',
          text: 'Lehninger gives the same picture: CO binds free haem “more than 20,000 times better” than O₂ but only about 200 times better in myoglobin, partly through steric hindrance — CO binds free haem in a straight line, while O₂ binds at an angle (p. 162).',
        },
      ],
    },
    {
      title: 'Conserved residues',
      kind: 'classification',
      paragraphs: [
        'Comparing haemoglobins from more than 20 species shows variation at most positions — but nine positions hold the same amino acid in all or nearly all of them. These conserved residues are especially important for function, and several sit at the oxygen-binding site (slides 26–29).',
      ],
      table: {
        columns: ['Position', 'Amino acid', 'Role'],
        rows: [
          ['F8', 'Histidine', 'Proximal haem-linked histidine'],
          ['E7', 'Histidine', 'Distal histidine near the haem'],
          ['CD1', 'Phenylalanine', 'Haem contact'],
          ['F4', 'Leucine', 'Haem contact'],
          ['B6', 'Glycine', 'Allows the close approach of the B and E helices'],
          ['C2', 'Proline', 'Helix termination'],
          ['HC2', 'Tyrosine', 'Cross-links the H and F helices'],
          ['C4', 'Threonine', 'Uncertain'],
          ['H10', 'Lysine', 'Uncertain'],
        ],
      },
      keyPoints: ['B6 is almost always glycine: where helices B and E cross there is no room for a larger side chain.'],
      sourceRefs: ref([26, 27, 28, 29]),
    },
  ],
  summary: [
    'Proximal His F8 binds the iron (5th position); O₂ binds at the 6th position; distal His E7 sits nearby.',
    'Free haem is quickly oxidised to methaem via a haem–O₂–haem sandwich; the globin pocket blocks it and keeps iron ferrous.',
    'CO: 25,000× O₂ for free haem but ~200× in Mb/Hb, because the distal His forces CO to bind bent.',
    'Nine conserved haemoglobin residues, e.g. F8 His, E7 His, CD1 Phe, F4 Leu, B6 Gly, C2 Pro, HC2 Tyr.',
  ],
};

// ─── Lesson 3 ───────────────────────────────────────────────────────

const lesson3: Draft = {
  id: 'oxygen-carriers-3',
  title: 'Haemoglobin: Structure, Allostery and Cooperativity',
  description: 'α₂β₂ structure, allosteric regulation, the T ↔ R switch and the oxygen dissociation curve.',
  xp: 30,
  sourceRefs: ref([24, 25, 30, 31, 32, 33, 34, 35, 36, 37, 38]),
  objectives: [
    'Describe the structure of haemoglobin A',
    'Define an allosteric interaction and list haemoglobin’s regulators',
    'Describe the subunit contacts and the T ↔ R switch',
    'Contrast oxygen binding by myoglobin and haemoglobin',
    'Read an oxygen dissociation curve: shape, position and P50',
  ],
  chunks: [
    {
      title: 'Haemoglobin A',
      kind: 'structure',
      paragraphs: [
        'Normal adult haemoglobin A (α₂β₂) is a spherical molecule about 55 Å across, made of four polypeptide chains packed together. Its haems sit in crevices near the outside of the molecule, far apart from each other, and each α chain is in contact with both β chains (slide 24).',
        'The α chains have 141 amino acids and the β chains 146 (slide 25).',
      ],
      sourceRefs: ref([24, 25]),
    },
    {
      title: 'An allosteric protein',
      kind: 'regulation',
      paragraphs: [
        'An allosteric interaction is an interaction between two spatially separate sites on a protein. Haemoglobin transports H⁺ and CO₂ as well as O₂, and its O₂ binding is regulated by H⁺, CO₂ and organic phosphates such as 2,3-diphosphoglycerate (2,3-DPG, also called 2,3-BPG) (slide 30).',
        'These molecules bind far from the haems yet change the oxygen affinity of the haem groups — a classic allosteric effect (slide 31).',
      ],
      sourceRefs: ref([30, 31]),
    },
    {
      title: 'Subunit contacts and the T ↔ R switch',
      kind: 'mechanism',
      paragraphs: [
        'The α₁β₁ contact is large and relatively fixed — a stabilising contact. The α₁β₂ interface is the functional contact: it is closely connected to the haems, and large structural changes take place there on oxygenation (slide 32).',
        'In deoxyhaemoglobin (the taut, T form) hydrogen bonds, electrostatic attractions, salt links and van der Waals forces between subunits are intact; on oxygenation (the relaxed, R form) they are broken (slide 33). At the α₁β₂ interface, α₁ Tyr C7 bonds to β₂ Asp G1 in the T form; after oxygenation α₁ Asp G1 bonds to β₂ Asn G4 instead — the dove-tailed interface lets the subunits slide across each other (slide 33).',
        'Slide 34 shows ion pairs (salt bridges) within and between subunits that stabilise the T state of deoxyhaemoglobin.',
      ],
      table: {
        columns: ['', 'T (taut)', 'R (relaxed)'],
        rows: [
          ['Form', 'Deoxyhaemoglobin', 'Oxyhaemoglobin'],
          ['Inter-subunit bonds and salt links', 'Intact', 'Broken'],
          ['α₁β₂ contact', 'α₁ Tyr C7 – β₂ Asp G1', 'α₁ Asp G1 – β₂ Asn G4'],
        ],
      },
      sourceRefs: ref([32, 33, 34]),
      notes: [{ kind: 'annotation', text: 'A speaker note on slide 33 adds the residue numbers: α₁ Tyr C7 = α42 Tyr (its phenolic –OH forms the hydrogen bond) and β₂ Asp G1 = β99 Asp. Not quizzed until confirmed.' }],
    },
    {
      title: 'Myoglobin vs haemoglobin binding',
      kind: 'comparison',
      paragraphs: ['Slide 35 lists the differences:'],
      table: {
        columns: ['', 'Myoglobin', 'Haemoglobin'],
        rows: [
          ['Co-operative O₂ binding', 'No', 'Yes — many weak bonds are broken as it binds O₂'],
          ['Affected by pH and pCO₂', 'No', 'Yes'],
          ['Regulated by 2,3-DPG', 'No', 'Yes'],
        ],
      },
      sourceRefs: ref([35]),
    },
    {
      title: 'The oxygen dissociation curve',
      kind: 'pathway',
      paragraphs: [
        'Plotting percentage saturation (fractional occupancy, Y, from 0 to 1) of the oxygen-binding sites against the partial pressure of oxygen (pO₂) gives the oxygen dissociation curve (ODC) (slide 36).',
        'Myoglobin’s curve is hyperbolic and lies to the left; haemoglobin’s is sigmoid and lies to the right. At any pO₂ above zero myoglobin is more saturated than haemoglobin. Myoglobin’s binding is non-co-operative; haemoglobin’s is co-operative (slide 37).',
        'P50 — the pO₂ at half saturation — is about 1 torr for myoglobin and 26 torr for haemoglobin. Typical pO₂ is about 100 torr in the alveoli and about 20 torr in the capillaries of active muscle, so haemoglobin’s P50 lies between them: it loads in the lungs and unloads in the tissues (slide 38).',
      ],
      keyPoints: ['Mb: hyperbolic, left, P50 ≈ 1 torr. Hb: sigmoid, right, P50 = 26 torr.'],
      sourceRefs: ref([36, 37, 38]),
      notes: [{ kind: 'clarified', text: 'Slide 37 labels the myoglobin curve “rectangular parabolic”. The textbook page pasted on slide 38 shows its equation, Y = pO₂/(pO₂ + P50), “plots as a hyperbola” — the curve is hyperbolic.' }],
    },
  ],
  summary: [
    'HbA = α₂β₂: spherical (~55 Å); haems near the surface, far apart; α 141, β 146 amino acids.',
    'Allosteric: H⁺, CO₂ and 2,3-DPG bind far from the haems yet change O₂ affinity.',
    'α₁β₁ = stabilising contact; α₁β₂ = functional contact. T (deoxy): bonds intact; R (oxy): broken.',
    'Hb binds O₂ co-operatively and is affected by pH, pCO₂ and 2,3-DPG; Mb is not.',
    'ODC: Mb hyperbolic, left, P50 ≈ 1 torr; Hb sigmoid, right, P50 = 26 torr (between muscle ~20 and alveoli ~100 torr).',
  ],
};

// ─── Lesson 4 ───────────────────────────────────────────────────────

const lesson4: Draft = {
  id: 'oxygen-carriers-4',
  title: 'Oxygen Delivery: Bohr Effect, 2,3-BPG and Fetal Haemoglobin',
  description: 'How pH, CO₂ and 2,3-BPG shift haemoglobin’s affinity — and why fetal haemoglobin binds O₂ more tightly.',
  xp: 30,
  sourceRefs: [...ref([39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58]), ...leh(171, 172)],
  objectives: [
    'Explain the Bohr–Haldane effect at the tissues and in the lungs',
    'Explain which residues carry the Bohr protons',
    'Describe how 2,3-BPG binds haemoglobin and why it lowers O₂ affinity',
    'Explain why 2,3-BPG is needed to unload O₂ in the capillaries',
    'Explain why fetal haemoglobin has a higher O₂ affinity',
  ],
  chunks: [
    {
      title: 'The Bohr–Haldane effect',
      kind: 'regulation',
      paragraphs: [
        'This is the effect of pH and pCO₂ on oxygen binding by haemoglobin (myoglobin is not affected). Within the physiological range, lowering the pH shifts the ODC to the right — haemoglobin’s oxygen affinity falls. Raising the pCO₂ does the same (slide 39).',
        'At the tissues the pH is near the lower end of normal and the pCO₂ near the upper end, so the curve shifts right and O₂ is released. In the alveolar capillaries the pH rises and pCO₂ falls, so the curve shifts left and affinity rises — O₂ is loaded (slides 40–41).',
      ],
      table: {
        columns: ['', 'Tissues', 'Lungs (alveolar capillaries)'],
        rows: [
          ['pH', 'Lower (more H⁺)', 'Higher'],
          ['pCO₂', 'Higher', 'Lower'],
          ['Curve shifts', 'Right — affinity falls, O₂ released', 'Left — affinity rises, O₂ loaded'],
        ],
      },
      sourceRefs: [...ref([39, 40, 41, 42, 45, 46]), ...leh(171)],
      notes: [
        { kind: 'textbook', text: 'Slide 42 (textbook page) summarises it as O₂Hb + H⁺ + CO₂ ⇌ Hb(H⁺)(CO₂) + O₂, discovered by Bohr in 1904; Haldane described the reciprocal effect in the lungs ten years later. Lehninger, whose figure is on slide 46, gives blood pH as 7.6 in the lungs and 7.2 in the tissues (p. 171).' },
      ],
    },
    {
      title: 'Who carries the Bohr protons',
      kind: 'mechanism',
      paragraphs: ['Slides 43–44 sort haemoglobin’s ionisable residues into three groups:'],
      steps: [
        { label: 'Reversible H⁺ binders', detail: 'Buffer H⁺ at the tissues and release it in the alveolar capillaries — these carry the Bohr effect.' },
        { label: 'Too basic', detail: 'Bind H⁺ at the tissues but cannot release it in the lungs.' },
        { label: 'Too acidic', detail: 'Cannot bind H⁺ even at the tissues.' },
      ],
      sourceRefs: ref([43, 44]),
    },
    {
      title: 'How 2,3-BPG binds',
      kind: 'mechanism',
      paragraphs: [
        'One molecule of 2,3-BPG binds one molecule of haemoglobin, in its central cavity. Six positive charges — three on each β chain (the α-amino group/His NA2, Lys 82 (EF6) and His 143 (H21)) — bind the negative charges of 2,3-BPG (slides 47–50).',
        'By cross-linking the β chains, 2,3-BPG stabilises the deoxyhaemoglobin (T) quaternary structure. It binds deoxyhaemoglobin but not oxyhaemoglobin, so O₂ and BPG binding are mutually exclusive. BPG is present in red cells at about the same molar concentration as haemoglobin (slides 51, 54).',
      ],
      keyPoints: ['2,3-BPG: one per tetramer, central cavity, three + charges per β chain, stabilises T → lowers O₂ affinity.'],
      sourceRefs: [...ref([47, 48, 49, 50, 51, 54]), ...leh(172)],
      notes: [
        { kind: 'textbook', text: 'Lehninger: BPG lowers haemoglobin’s affinity for O₂ by stabilising the T state; the transition to the R state narrows the binding pocket, so BPG cannot bind (p. 172).' },
        { kind: 'check', text: 'The lecture says 2,3-BPG has five negative charges; the textbook page pasted on slide 50 says four. The number is not quizzed.' },
      ],
    },
    {
      title: 'Why 2,3-BPG matters',
      kind: 'regulation',
      paragraphs: [
        'Without 2,3-BPG, haemoglobin’s P50 is 1 torr — like myoglobin’s. With it, P50 becomes 26 torr: BPG lowers the oxygen affinity 26-fold (slides 52–53).',
        'The pO₂ in the capillaries is about 26 torr. Without BPG, haemoglobin would stay fully saturated at that pressure and could not unload oxygen; with BPG it is only half saturated, so half its oxygen is released (slides 53–54). Higher BPG concentrations shift the curve further right (slide 55).',
      ],
      table: {
        columns: ['At pO₂ = 26 torr', 'Without BPG', 'With BPG'],
        rows: [
          ['P50', '1 torr', '26 torr'],
          ['Saturation (SO₂)', '1.0 — no unloading', '0.5 — half the O₂ unloaded'],
        ],
      },
      sourceRefs: ref([52, 53, 54, 55]),
      notes: [
        { kind: 'textbook', text: 'The textbook pages on slides 54 and 58 add clinical examples: stored blood loses BPG (4.5 → under 0.5 mM in ten days) so its P50 falls to 16 torr; BPG rises in hypoxia (e.g. severe emphysema) and at high altitude (4.5 → 7.0 mM within two days at 4500 m), helping unload more O₂.' },
      ],
    },
    {
      title: 'Fetal haemoglobin',
      kind: 'clinical',
      paragraphs: [
        'Fetal haemoglobin (HbF, α₂γ₂) has a higher oxygen affinity than haemoglobin A — which helps oxygen pass from the mother’s circulation to the fetus (slides 56, 58).',
        'At position H21 fetal haemoglobin has serine instead of histidine (when HbF is replaced by adult HbA, Ser 143 is replaced by His 143). The slide describes serine as more negatively charged than histidine, so it relatively repels 2,3-BPG: BPG binds HbF less strongly, and its oxygen affinity is higher (slide 57).',
      ],
      keyPoints: ['HbF: Ser instead of His at H21 → less BPG bound → higher O₂ affinity → O₂ flows from mother to fetus.'],
      sourceRefs: [...ref([56, 57, 58]), ...leh(172)],
      notes: [
        { kind: 'clarified', text: 'His H21 (His 143) is one of the positive groups that hold BPG (slide 47). Serine lacks that positive charge, so the binding pocket is less positive — “more negatively charged” in relative terms. Lehninger confirms that α₂γ₂ fetal haemoglobin has a much lower affinity for BPG and a correspondingly higher affinity for O₂ (p. 172).' },
      ],
    },
  ],
  summary: [
    'Bohr–Haldane: ↓pH or ↑pCO₂ → curve right (O₂ released at tissues); ↑pH, ↓pCO₂ in the lungs → curve left (O₂ loaded). Myoglobin is unaffected.',
    'Bohr protons are carried by residues that bind H⁺ at the tissues and release it in the lungs.',
    '2,3-BPG: one per Hb, central cavity, binds three + groups per β chain, stabilises deoxy (T); binds deoxy not oxy.',
    'P50: 1 torr without BPG → 26 torr with it; at capillary pO₂ (~26 torr) SO₂ falls from 1.0 to 0.5, so O₂ is unloaded.',
    'HbF (α₂γ₂): Ser for His at H21 → binds less BPG → higher O₂ affinity than HbA.',
  ],
};

// Each lesson gets its interactive layer (learn by answering) and its
// reading extras (high-yield points, common confusions) from
// ./interactive.ts.
export const lessons: Draft[] = [lesson1, lesson2, lesson3, lesson4].map((lesson) => ({
  ...lesson,
  ...readingExtras[lesson.id],
  interactive: interactive[lesson.id],
}));
