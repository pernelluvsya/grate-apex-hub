// Biochemistry → Blood Coagulation and Fibrinolysis: the four lessons
// (reading layer).
//
// Sources: the lecture deck (Edwin F. Laing, 77 slides) and its pasted
// textbook pages and figures (written out in ./sources.ts → diagrams).
// Speaker notes are 'annotation' notes; unsettled points are 'check' notes
// and are never quizzed.
import type { LessonDraft } from '@/data/topics/build';
import { interactive, readingExtras } from '@/data/topics/blood-coagulation-and-fibrinolysis/interactive';
import { ref, type ConceptId } from '@/data/topics/blood-coagulation-and-fibrinolysis/sources';

type Draft = LessonDraft<ConceptId>;

// ─── Lesson 1 ───────────────────────────────────────────────────────

const lesson1: Draft = {
  id: 'blood-coagulation-and-fibrinolysis-1',
  title: 'The Clotting Cascade',
  description: 'Why clotting is a cascade, the three pathways, what triggers them, and the clotting factors.',
  xp: 25,
  sourceRefs: ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 28, 29, 53, 54, 55, 56]),
  objectives: [
    'Explain why clotting is organised as an enzyme cascade',
    'Name the three events of haemostasis',
    'Trace the intrinsic, extrinsic and common pathways',
    'List what triggers the intrinsic pathway in the body and in the test tube',
    'Name the clotting factors and say which are vitamin K-dependent',
  ],
  chunks: [
    {
      title: 'A cascade of proteases',
      kind: 'overview',
      paragraphs: [
        'The clotting factors are serine endopeptidases that attack Arg–X bonds. Each activated enzyme activates many molecules of the next, so the effect is amplified and the cascade gathers momentum: there are only trace amounts of the first factors but large amounts of the final substrate (fibrinogen, about 250 mg/100 mL) (slide 2).',
        'Cascades ensure a rapid response to the trigger, while inhibitors prevent premature triggering — a stimulus below a threshold does not start it (slide 3). Clotting is limited by blood flow carrying activated factors away and by their inactivation and excretion, mainly by the liver (slide 4).',
        'Other hydrolytic cascades in blood: lysis of clots, formation of kinins (bradykinin, kallidin — which dilate vessels) and activation of complement (slide 5).',
      ],
      keyPoints: ['Cascade = amplification + speed; inhibitors and clearance keep it in check.'],
      sourceRefs: ref([2, 3, 4, 5, 6]),
    },
    {
      title: 'Haemostasis',
      kind: 'overview',
      paragraphs: ['Bleeding stops through three events (slide 13):'],
      steps: [
        { label: 'Vasoconstriction', detail: 'Narrows the injured vessel.' },
        { label: 'Adhesion and aggregation of platelets', detail: 'A temporary plug.' },
        { label: 'Blood coagulation', detail: 'A fibrin clot.' },
      ],
      keyPoints: ['A thrombus is a clot formed within a blood vessel.'],
      sourceRefs: ref([6, 13]),
    },
    {
      title: 'Three pathways',
      kind: 'pathway',
      paragraphs: [
        'The intrinsic pathway starts when factor XII (Hageman factor) contacts an abnormal surface. XIIa — with kallikrein and kininogen — activates XI; XIa activates IX (Christmas factor); IXa, with VIIIa, phospholipid and Ca²⁺, activates X. Factor VIII enhances this step about a thousand-fold (slides 8–9, 55).',
        'The extrinsic pathway starts with trauma: tissue thromboplastin (tissue factor, factor III) and factor VII (activated to VIIa) activate X. Factor VII deficiency is rare but can cause severe bleeding (slides 8, 56).',
        'Both converge on the common pathway: Xa, with Va, converts prothrombin (II) to thrombin (IIa); thrombin converts fibrinogen (I) to fibrin; XIIIa cross-links the fibrin into a stable clot (slide 8).',
      ],
      steps: [
        { label: 'Intrinsic: XII → XI → IX → (IXa + VIIIa) → X', detail: 'Triggered by contact with an abnormal surface.' },
        { label: 'Extrinsic: tissue factor + VIIa → X', detail: 'Triggered by trauma.' },
        { label: 'Common: Xa (+ Va) → thrombin → fibrin → cross-linked fibrin', detail: 'Factor XIIIa cross-links.' },
      ],
      keyPoints: ['Factors V, VIII and tissue factor are modifier proteins, not enzymes (slide 11).'],
      sourceRefs: ref([7, 8, 9, 11, 55, 56]),
    },
    {
      title: 'What starts the intrinsic pathway',
      kind: 'classification',
      paragraphs: [
        'In the body (slide 28): collagen and other sub-endothelial vessel-wall constituents, gram-negative bacterial endotoxins, cell-wall products of gram-positive organisms, some fatty acids, and antigen–antibody complexes.',
        'In the test tube (slide 29): glass, kaolin and some acids activate it; silicon and some plastic surfaces do not.',
        'The “contact system” (appendix, slides 53–54): factor XII, prekallikrein (Fletcher factor) and HMW kininogen (Fitzgerald factor) form a self-amplifying system. It starts the intrinsic pathway, promotes plasminogen → plasmin, makes bradykinin and starts parts of complement. Remarkably, absence of factor XII, Fletcher factor or HMW kininogen does not cause a bleeding disorder.',
      ],
      table: {
        columns: ['In the body', 'In vitro activators', 'In vitro non-activators'],
        rows: [
          ['Collagen; endotoxins; gram-positive wall products; some fatty acids; antigen–antibody complexes', 'Glass, kaolin, some acids', 'Silicon, some plastics'],
        ],
      },
      sourceRefs: ref([28, 29, 53, 54]),
      notes: [{ kind: 'annotation', text: 'A speaker note on slide 28 adds “teichoic acid” (a gram-positive cell-wall product). Not quizzed until confirmed.' }],
    },
    {
      title: 'The clotting factors',
      kind: 'classification',
      paragraphs: ['Slides 10–12 tabulate the factors. Most are made in the liver; von Willebrand factor is made by the endothelium.'],
      table: {
        columns: ['Factor', 'Name', 'Notes'],
        rows: [
          ['I', 'Fibrinogen', 'Clot structural protein'],
          ['II', 'Prothrombin', 'Serine protease (thrombin); vitamin K-dependent'],
          ['III', 'Tissue factor (tissue thromboplastin)', 'Starts the extrinsic pathway'],
          ['IV', 'Calcium (Ca²⁺)', '—'],
          ['V', 'Proaccelerin', 'Cofactor'],
          ['VII', 'Proconvertin', 'Serine protease; vitamin K-dependent'],
          ['VIII', 'Antihaemophilic factor', 'Cofactor'],
          ['IX', 'Christmas factor', 'Serine protease; vitamin K-dependent'],
          ['X', 'Stuart(-Prower) factor', 'Serine protease; vitamin K-dependent'],
          ['XI', 'Plasma thromboplastin antecedent', 'Serine protease'],
          ['XII', 'Hageman factor', 'Serine protease'],
          ['XIII', 'Fibrin-stabilising factor', 'Transglutaminase (transamidase)'],
        ],
      },
      keyPoints: ['Vitamin K-dependent: II, VII, IX, X.'],
      sourceRefs: ref([10, 11, 12]),
    },
  ],
  summary: [
    'Clotting factors are serine endopeptidases (Arg–X bonds) acting in an amplifying cascade; inhibitors and clearance (liver) limit it.',
    'Haemostasis: vasoconstriction → platelet plug → fibrin clot. A thrombus is a clot inside a vessel.',
    'Intrinsic: XII → XI → IX → IXa + VIIIa → X. Extrinsic: tissue factor + VIIa → X. Common: Xa + Va → thrombin → fibrin → XIIIa cross-links.',
    'Intrinsic activators: collagen, endotoxins, gram-positive products, some fatty acids, immune complexes; in vitro: glass, kaolin.',
    'Vitamin K-dependent factors: II, VII, IX, X. Factors V, VIII and tissue factor are non-enzyme modifiers.',
  ],
};

// ─── Lesson 2 ───────────────────────────────────────────────────────

const lesson2: Draft = {
  id: 'blood-coagulation-and-fibrinolysis-2',
  title: 'Platelets, Fibrinogen and Fibrin',
  description: 'Platelet structure and granules, fibrinogen, fibrinopeptides and the cross-linked clot.',
  xp: 25,
  sourceRefs: ref([14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 43, 44, 57]),
  objectives: [
    'Describe platelets and the contents of their granules',
    'Describe fibrinogen’s structure',
    'Explain how thrombin turns fibrinogen into fibrin',
    'Explain why fibrinopeptides keep fibrinogen molecules apart',
    'Explain how factor XIII stabilises the clot',
  ],
  chunks: [
    {
      title: 'Platelets',
      kind: 'structure',
      paragraphs: [
        'Platelets (thrombocytes) are disk-shaped cells about 1 × 3 microns. They lack nuclei but contain mitochondria, other organelles and dense bodies. There is about one platelet for every 20 red cells, and platelets descend from megakaryocytes (slide 14).',
        'Platelet factor IV and β-thromboglobulin are normally present inside intact platelets (slide 14). The lecture asks you to read about platelets yourself, focusing on platelet function.',
      ],
      table: {
        columns: ['Granule', 'Contents (slide 17)'],
        rows: [
          ['Dense granules', 'ADP, ATP, Ca²⁺, serotonin'],
          ['α-Granules', 'Platelet factor IV, β-thromboglobulin, PDGF, thrombospondin, fibrinogen, von Willebrand factor'],
        ],
      },
      sourceRefs: ref([14, 15, 16, 17, 57]),
      notes: [{ kind: 'lecturer', text: 'Slide 14: “We will discuss this after you have read all the ‘platelet stuff’ for yourself: FOCUS ON PLATELET FUNCTION.”' }],
    },
    {
      title: 'Fibrinogen (factor I)',
      kind: 'structure',
      paragraphs: [
        'Fibrinogen is about 460 Å long with a mass of 340 kDa. It has six polypeptide chains — two each of Aα, Bβ and γ — appearing as three nodules joined by two rods (slides 7, 18–19).',
        'Thrombin cleaves four Arg–Gly peptide bonds in fibrinogen (slide 18).',
      ],
      keyPoints: ['Fibrinogen = 2(Aα, Bβ, γ); 340 kDa; thrombin cuts four Arg–Gly bonds.'],
      sourceRefs: ref([7, 18, 19, 20, 21]),
      notes: [{ kind: 'check', text: 'The textbook page pasted on slide 6 gives fibrinogen’s length as 45 nm (450 Å) rather than 460 Å. The exact length is not quizzed.' }],
    },
    {
      title: 'Fibrinopeptides and the fibrin monomer',
      kind: 'mechanism',
      paragraphs: [
        'Thrombin releases two A peptides (18 residues each) and two B peptides (20 residues each) — the fibrinopeptides. What remains is the fibrin monomer, (αβγ)₂, which keeps 97% of fibrinogen’s amino acid residues (slide 24).',
        'Fibrinopeptides carry large net negative charges: they are rich in aspartate and glutamate, and fibrinopeptide B also contains negatively charged tyrosine-O-sulphate. These surface negative charges repel each other and keep fibrinogen molecules apart (slides 25–27).',
        'Once the fibrinopeptides are gone, fibrin monomers assemble spontaneously into fibrin (slides 20, 22).',
      ],
      steps: [
        { label: 'Thrombin cuts four Arg–Gly bonds' },
        { label: 'Fibrinopeptides A and B leave', detail: 'Removing the negative charges that kept fibrinogen apart.' },
        { label: 'Fibrin monomers, (αβγ)₂, assemble into fibrin' },
      ],
      sourceRefs: ref([20, 22, 23, 24, 25, 26, 27]),
    },
    {
      title: 'Cross-linking the clot',
      kind: 'mechanism',
      paragraphs: [
        'The first fibrin clot is held together by weak forces. Factor XIII (fibrin-stabilising factor), once activated by thrombin to XIIIa, is a transglutaminase: it links the glutamyl side chain of a glutamine on one fibrin monomer to the side chain of a lysine on the next, releasing NH₄⁺ (slides 43–44). These covalent cross-links make the clot rigid.',
      ],
      sourceRefs: ref([43, 44]),
      notes: [{ kind: 'annotation', text: 'A speaker note on slide 43 adds that factor XIII is also called fibrin-stabilising factor (FSF), transglutaminase or transamidase. Not quizzed until confirmed.' }],
    },
  ],
  summary: [
    'Platelets: 1 × 3 µm, anucleate, from megakaryocytes, 1 per 20 red cells. Dense granules: ADP, ATP, Ca²⁺, serotonin. α-granules: PF4, β-thromboglobulin, PDGF, thrombospondin, fibrinogen, vWF.',
    'Fibrinogen: 340 kDa, six chains 2(Aα, Bβ, γ).',
    'Thrombin cuts four Arg–Gly bonds → fibrinopeptides A (2 × 18) and B (2 × 20) leave → fibrin monomer (αβγ)₂, 97% of fibrinogen.',
    'Fibrinopeptides are very negative (Asp, Glu; tyrosine-O-sulphate in B) and keep fibrinogen molecules apart.',
    'Factor XIIIa (transglutaminase) cross-links glutamine to lysine between monomers.',
  ],
};

// ─── Lesson 3 ───────────────────────────────────────────────────────

const lesson3: Draft = {
  id: 'blood-coagulation-and-fibrinolysis-3',
  title: 'Prothrombin, Vitamin K and Bleeding Disorders',
  description: 'Thrombin, platelet phospholipid and calcium, vitamin K and γ-carboxyglutamate, haemophilia and von Willebrand factor.',
  xp: 30,
  sourceRefs: ref([30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 45, 46, 47, 48, 49, 50, 51, 52]),
  objectives: [
    'Describe thrombin and how prothrombin is activated',
    'Explain why platelet phospholipid and calcium are essential',
    'Explain what vitamin K does and how its antagonists work',
    'List causes of vitamin K deficiency bleeding',
    'Describe the haemophilias and the role of von Willebrand factor',
  ],
  chunks: [
    {
      title: 'Thrombin (factor IIa)',
      kind: 'structure',
      paragraphs: [
        'Factor Xa activates prothrombin (factor II) by cleaving it at two places (slides 30–32). Thrombin has a mass of 33.7 kDa and two chains, A and B. Its B chain resembles trypsin, chymotrypsin and elastase; its active-site sequence –Gly-Asp-Ser-Gly-Gly-Pro– marks it as a serine esterase. Thrombin cleaves Arg–Gly bonds (slide 33).',
      ],
      sourceRefs: ref([30, 31, 32, 33]),
    },
    {
      title: 'Phospholipid and calcium',
      kind: 'mechanism',
      paragraphs: [
        'Disrupted platelet phospholipid surfaces draw the clotting factors together, concentrate them as much as 10⁴-fold, and make sure the accelerated reactions happen only at the site of injury (slide 34).',
        'Calcium is essential: anything that removes or sequesters Ca²⁺ — oxalate, citrate, EDTA — prevents clotting (slide 36). Prothrombin is anchored through Ca²⁺ to platelet phospholipid membranes for activation; factors II, VII, IX and X all need this anchoring (slide 37).',
      ],
      keyPoints: ['Citrate, oxalate and EDTA stop clotting by removing Ca²⁺.'],
      sourceRefs: ref([34, 36, 37]),
    },
    {
      title: 'Vitamin K and γ-carboxyglutamate',
      kind: 'mechanism',
      paragraphs: [
        'Factors II, VII, IX and X — together called the prothrombin complex — must be anchored to phospholipid surfaces, which depends on their Ca²⁺-binding. They owe this to vitamin K-dependent, post-translational formation of γ-carboxyglutamate residues near their amino termini (slide 38).',
        'Glutamate is a weak calcium chelator, but γ-carboxyglutamate is a strong one (slide 39).',
        'Vitamin K antagonists such as dicoumarol and warfarin are antithrombotic anticoagulants and effective rat poisons (slide 41).',
      ],
      steps: [
        { label: 'Glutamate residues near the N-terminus' },
        { label: 'Vitamin K-dependent γ-carboxylation', detail: 'Post-translational.' },
        { label: 'γ-Carboxyglutamate binds Ca²⁺ strongly' },
        { label: 'Factor anchored to platelet phospholipid → activated' },
      ],
      sourceRefs: ref([35, 37, 38, 39, 40, 41]),
      notes: [{ kind: 'annotation', text: 'A speaker note on slide 41 says vitamin K antagonists act post-translationally, and that heparin is used when a quick effect is needed. Not quizzed until confirmed.' }],
    },
    {
      title: 'Vitamin K deficiency bleeding',
      kind: 'clinical',
      paragraphs: ['Slide 42 lists when bleeding due to vitamin K deficiency is seen:'],
      steps: [
        { label: 'Obstructive jaundice' },
        { label: 'Malnutrition and malabsorption' },
        { label: 'Occasionally in the newborn', detail: 'Reduced placental permeability to vitamin K; inadequate maternal intake; immature liver (too little bile salt, so fat-soluble vitamins are poorly absorbed); no bacterial flora in the infant gut.' },
      ],
      sourceRefs: ref([42]),
    },
    {
      title: 'Haemophilia',
      kind: 'clinical',
      paragraphs: [
        'Haemophilias A and B are X-linked recessive. Haemophilia A (over 80% of haemophiliacs) is due to an ineffective form of factor VIII; haemophilia B (about 15%) to absence of Christmas factor (factor IX). Haemophilia C is due to absence of factor XI, and congenital parahaemophilia to absence of factor V (slide 45).',
        'Clinical features (slide 46): excessive bleeding after trauma; bleeding into joints (haemarthrosis) without apparent cause; subcutaneous and intramuscular haemorrhage; haematomas of the head and neck that can kill by asphyxiation; haematuria; intracranial haemorrhage with or without trauma.',
      ],
      table: {
        columns: ['Disorder', 'Factor', 'Share / inheritance'],
        rows: [
          ['Haemophilia A', 'VIII (ineffective)', '>80%; X-linked recessive'],
          ['Haemophilia B (Christmas disease)', 'IX (absent)', '~15%; X-linked recessive'],
          ['Haemophilia C', 'XI (absent)', '—'],
          ['Congenital parahaemophilia', 'V (absent)', '—'],
        ],
      },
      sourceRefs: ref([45, 46]),
    },
    {
      title: 'Von Willebrand factor and kallikreins',
      kind: 'overview',
      paragraphs: [
        'Von Willebrand factor (vWF) is a blood glycoprotein in haemostasis. It binds other proteins — particularly factor VIII — and is important for platelet adhesion to wound sites; it is not an enzyme. It is deficient or defective in von Willebrand disease and involved in other diseases (e.g. thrombotic thrombocytopenic purpura). Its levels rise in many cardiovascular, neoplastic and connective-tissue diseases, and high levels may predict thrombosis (slides 50–52).',
        'Kallikreins are a subgroup of serine proteases (appendix, slides 47–49). Plasma kallikrein generates bradykinin, a vasodilator that increases vascular permeability and drives acute inflammation.',
      ],
      sourceRefs: ref([47, 48, 49, 50, 51, 52]),
    },
  ],
  summary: [
    'Xa activates prothrombin; thrombin (33.7 kDa, A + B chains, trypsin-like B chain, serine esterase) cleaves Arg–Gly bonds.',
    'Platelet phospholipid concentrates factors (up to 10⁴×) at the injury; Ca²⁺ is essential — citrate, oxalate, EDTA prevent clotting.',
    'Vitamin K: γ-carboxylation of glutamates on II, VII, IX, X (prothrombin complex) → strong Ca²⁺ binding → anchoring. Antagonists: dicoumarol, warfarin.',
    'Vitamin K deficiency: obstructive jaundice, malnutrition/malabsorption, newborns.',
    'Haemophilia A (VIII, >80%) and B (IX, ~15%) are X-linked recessive; C = XI; parahaemophilia = V. vWF binds VIII and mediates platelet adhesion.',
  ],
};

// ─── Lesson 4 ───────────────────────────────────────────────────────

const lesson4: Draft = {
  id: 'blood-coagulation-and-fibrinolysis-4',
  title: 'Controlling Clotting and Fibrinolysis',
  description: 'What keeps clotting local, antithrombin III and heparin, plasmin and its activators, aspirin and thrombolytics.',
  xp: 30,
  sourceRefs: ref([4, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77]),
  objectives: [
    'Explain what keeps clotting limited to the injury',
    'Describe how antithrombin III and heparin work',
    'Describe plasmin, its activators and its targets',
    'Explain how aspirin and thrombolytic drugs act',
  ],
  chunks: [
    {
      title: 'Keeping clotting local',
      kind: 'regulation',
      paragraphs: [
        'Fibrin adsorbs thrombin: as the clot forms it removes the last active factor of the cascade, tending to limit the reaction to the site of injury (slide 59).',
        'Activated clotting factors have a short half-life. They are diluted by blood flow, inactivated by specific inhibitors, removed by the liver and the reticuloendothelial system, and degraded by proteases (slide 60).',
      ],
      sourceRefs: ref([4, 59, 60]),
    },
    {
      title: 'Antithrombin III and heparin',
      kind: 'regulation',
      paragraphs: [
        'Antithrombin III (heparin cofactor) is a plasma protein that inactivates thrombin (IIa) by forming an irreversible complex with it. It also inhibits plasmin and factors IXa, Xa and XIa (slide 61).',
        'Heparin — a negatively charged polysaccharide (glycosaminoglycan) found in mast cells near blood-vessel walls — enhances this. It increases a hundred-fold the affinity between antithrombin III and the serine proteases (IIa, IXa, Xa, XIa), speeding formation of the irreversible thrombin–antithrombin III complex and rapidly neutralising any thrombin generated (slides 61–64).',
      ],
      steps: [{ label: 'Thrombin + antithrombin III → thrombin–antithrombin III (irreversible)', detail: 'Heparin speeds this ~100-fold.' }],
      sourceRefs: ref([61, 62, 63, 64]),
    },
    {
      title: 'Fibrinolysis: plasmin',
      kind: 'pathway',
      paragraphs: [
        'Plasmin (fibrinolysin) is the proteolytic enzyme that lyses clots. It circulates as its inactive precursor, plasminogen (slide 65 says plasminogen is synthesised in the kidneys). Plasmin is a trypsin-like enzyme that breaks insoluble fibrin into small soluble peptides — fibrin degradation products (FDPs) (slides 65, 68–69). It also degrades factors VIII, V and XIII (slide 72).',
        'Activators (slide 66): tissue plasminogen activator (TPA) from vascular endothelium, released in greater amounts from damaged arteries and veins; the blood (plasma) activator, from contact between factor XII and the kallikrein system; and urokinase, secreted by the kidneys to prevent clots in the ureters and bladder (it is present in blood and urine, slide 68).',
        'TPA is released at the site of injury and has a high affinity for fibrin. Plasminogen adsorbs to fibrin as it is deposited, so TPA activates plasminogen on the fibrin mesh, and the plasmin formed also binds fibrin tightly (slides 70–71).',
        'Plasmin is held in check by antiplasmins: a rapidly acting antiplasmin and α₂-macroglobulin (slide 73).',
      ],
      steps: [
        { label: 'Activators: TPA, blood activator (XIIa + kallikrein), urokinase, streptokinase' },
        { label: 'Plasminogen → plasmin' },
        { label: 'Fibrin(ogen) → fibrin degradation products (FDPs)' },
      ],
      sourceRefs: ref([65, 66, 67, 68, 69, 70, 71, 72, 73]),
    },
    {
      title: 'Aspirin and thrombolytic drugs',
      kind: 'clinical',
      paragraphs: [
        'Activated platelets convert arachidonic acid (via PGG₂ and PGH₂, by cyclo-oxygenase) into thromboxane A₂, a potent platelet-aggregating agent. Aspirin blocks cyclo-oxygenase-1 (COX-1) (slides 74, 76). Low doses (typically 75–81 mg/day) irreversibly acetylate serine 530 of COX-1, inhibiting platelet thromboxane A₂ and giving an antithrombotic effect (slide 75).',
        'Thrombolytic agents activate plasminogen: urokinase, streptokinase, TPA, and factor XIIa + kallikrein (slide 69). Streptokinase dissolves clots in blood vessels — given soon after a heart attack to improve survival, and for pulmonary embolism, deep venous thrombosis and blocked catheters (slide 77).',
      ],
      sourceRefs: ref([69, 74, 75, 76, 77]),
    },
  ],
  summary: [
    'Fibrin adsorbs thrombin; activated factors are diluted, inhibited, cleared by liver/RES and degraded.',
    'Antithrombin III irreversibly inactivates thrombin (and IXa, Xa, XIa, plasmin); heparin boosts it ~100-fold.',
    'Plasmin (from plasminogen) cuts fibrin into FDPs and degrades V, VIII, XIII; activators: TPA (binds fibrin), blood activator, urokinase; antiplasmins limit it.',
    'Aspirin irreversibly acetylates COX-1 (Ser 530), blocking platelet thromboxane A₂.',
    'Thrombolytics (streptokinase, urokinase, TPA) activate plasminogen to dissolve clots.',
  ],
};

export const lessons: Draft[] = [lesson1, lesson2, lesson3, lesson4].map((lesson) => ({
  ...lesson,
  ...readingExtras[lesson.id],
  interactive: interactive[lesson.id],
}));
