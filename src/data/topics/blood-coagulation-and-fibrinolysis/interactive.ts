// Biochemistry → Blood Coagulation and Fibrinolysis: layer 1 (learn by
// answering) and reading-layer extras for the four lessons.
// Checkpoint IDs: cN-xx; recall prompts: rN-xx.
import type { LessonConfusion } from '@/data/lesson-types';
import { ask, fill, learn, match, mcq, multi, order, recall, type InteractiveDraft } from '@/data/topics/build';
import { ref, type ConceptId } from '@/data/topics/blood-coagulation-and-fibrinolysis/sources';

type Steps = InteractiveDraft<ConceptId>[];

export const interactive: Record<string, Steps> = {
  // ─── Lesson 1 — The cascade ────────────────────────────────────────
  'blood-coagulation-and-fibrinolysis-1': [
    ask(
      mcq('c1-01', 'cascade-principles', 'Before you start: why might the body use a chain of enzymes, each activating the next, to make a clot?', 'Each step amplifies the last, giving a rapid, large response from a tiny trigger', ['It makes clotting slower and safer', 'Each enzyme can only act once', 'It avoids needing any inhibitors'], {
        explanation: 'Slides 2–3: each step amplifies the preceding one, so trace amounts of initial factors convert large amounts of fibrinogen — and the response is rapid.',
        skill: 'prediction',
      }),
      ['Inhibitors stop the cascade starting by accident, and activated factors are cleared — mainly by the liver — so the response stays local.']
    ),
    learn('Three events of haemostasis', [
      'Vasoconstriction, then adhesion and aggregation of platelets, then blood coagulation (a fibrin clot). A clot formed inside a vessel is a thrombus.',
    ], { sourceRefs: ref([13]) }),
    ask(
      order('c1-02', 'haemostasis-events', 'Put the events of haemostasis in order.', [
        'Vasoconstriction',
        'Adhesion and aggregation of platelets',
        'Blood coagulation (fibrin clot)',
      ], { explanation: 'Slide 13.' })
    ),
    learn('Three pathways', [
      'Intrinsic: contact with an abnormal surface → XII → XI → IX → IXa + VIIIa → X.',
      'Extrinsic: trauma releases tissue factor → tissue factor + VIIa → X.',
      'Common: Xa + Va → prothrombin to thrombin → fibrinogen to fibrin → XIIIa cross-links it.',
    ], { sourceRefs: ref([7, 8, 9]) }),
    ask(
      mcq('c1-03', 'intrinsic-extrinsic', 'Where do the intrinsic and extrinsic pathways converge?', 'On the activation of factor X', ['On the activation of factor XII', 'On fibrinogen directly', 'They never converge'], {
        explanation: 'Slides 8 and 11: both pathways end by activating X, which starts the common pathway.',
      })
    ),
    ask(
      mcq('c1-04', 'intrinsic-extrinsic', 'What starts the extrinsic pathway?', 'Tissue factor released by trauma, acting with factor VII', ['Contact of factor XII with glass', 'Thrombin cleaving fibrinogen', 'Vitamin K'], {
        explanation: 'Slides 8 and 56.',
      })
    ),
    learn('The factors', ['Most clotting factors are made in the liver. Four — II, VII, IX and X — depend on vitamin K.'], {
      terms: [
        { term: 'I / II', meaning: 'Fibrinogen / prothrombin.' },
        { term: 'VIII / IX', meaning: 'Antihaemophilic factor / Christmas factor.' },
        { term: 'XII / XIII', meaning: 'Hageman factor / fibrin-stabilising factor.' },
      ],
      sourceRefs: ref([10, 11, 12]),
    }),
    ask(
      multi('c1-05', 'clotting-factors', 'Which clotting factors are vitamin K-dependent? Select all that apply.', ['II (prothrombin)', 'VII', 'IX', 'X'], ['VIII', 'XIII'], {
        explanation: 'Slides 12 and 38: factors II, VII, IX and X.',
      })
    ),
    recall('r1-01', 'intrinsic-extrinsic', 'Sketch the clotting cascade from both triggers to the cross-linked clot.', [
      'Intrinsic: abnormal surface → XII → XI → IX → IXa + VIIIa (+ phospholipid, Ca²⁺) → X.',
      'Extrinsic: trauma → tissue factor + VIIa → X.',
      'Common: Xa + Va → prothrombin → thrombin → fibrinogen → fibrin → XIIIa cross-links the clot.',
    ]),
  ],

  // ─── Lesson 2 — Platelets, fibrinogen, fibrin ──────────────────────
  'blood-coagulation-and-fibrinolysis-2': [
    ask(
      mcq('c2-01', 'platelets', 'Platelets lack one organelle that most cells have. Which?', 'The nucleus', ['Mitochondria', 'Granules', 'A plasma membrane'], {
        explanation: 'Slide 14: platelets lack nuclei but contain mitochondria, other organelles and dense bodies.',
        skill: 'prediction',
      })
    ),
    learn('Platelet granules', ['Slide 17:'], {
      terms: [
        { term: 'Dense granules', meaning: 'ADP, ATP, Ca²⁺, serotonin.' },
        { term: 'α-Granules', meaning: 'Platelet factor IV, β-thromboglobulin, PDGF, thrombospondin, fibrinogen, von Willebrand factor.' },
      ],
      sourceRefs: ref([17]),
    }),
    ask(
      match('c2-02', 'platelets', 'Match each substance to the granule it is stored in.', [
        ['Serotonin', 'Dense granules'],
        ['ADP', 'Dense granules'],
        ['Von Willebrand factor', 'α-Granules'],
        ['Platelet factor IV', 'α-Granules'],
      ], { explanation: 'Slide 17.' })
    ),
    learn('Fibrinogen to fibrin', [
      'Fibrinogen (340 kDa) has six chains: 2(Aα, Bβ, γ). Thrombin cuts four Arg–Gly bonds, releasing fibrinopeptides A and B. The fibrin monomer (αβγ)₂ then assembles into fibrin.',
    ], { sourceRefs: ref([18, 24]) }),
    ask(
      mcq('c2-03', 'fibrinopeptides', 'Why do fibrinogen molecules not stick together before thrombin acts?', 'Their negatively charged fibrinopeptides repel each other', ['They are bound to albumin', 'They lack polypeptide chains', 'Calcium holds them apart'], {
        explanation: 'Slides 25–26: fibrinopeptides are rich in Asp and Glu (and B has tyrosine-O-sulphate); these negative charges keep fibrinogen molecules apart.',
        skill: 'cause-effect',
      })
    ),
    ask(
      fill('c2-04', 'fibrinogen-structure', 'Thrombin cleaves four ____–Gly bonds in fibrinogen.', ['Arg', 'arginine'], {
        explanation: 'Slide 18: thrombin cleaves four Arg–Gly peptide bonds.',
      })
    ),
    learn('Cross-linking', [
      'Factor XIIIa, a transglutaminase, joins the glutamine of one fibrin monomer to the lysine of the next (releasing NH₄⁺), making the clot rigid.',
    ], { sourceRefs: ref([43, 44]) }),
    ask(
      mcq('c2-05', 'fibrin-cross-linking', 'Which side chains does factor XIIIa link between fibrin monomers?', 'Glutamine and lysine', ['Cysteine and cysteine', 'Serine and aspartate', 'Tyrosine and arginine'], {
        explanation: 'Slides 43–44: a transglutaminase links a glutamine side chain to a lysine side chain, releasing NH₄⁺.',
      })
    ),
    recall('r2-01', 'fibrinopeptides', 'Explain how fibrinogen becomes a stable clot.', [
      'Thrombin cleaves four Arg–Gly bonds, releasing the negatively charged fibrinopeptides A and B.',
      'Without them, fibrin monomers (αβγ)₂ no longer repel and assemble into fibrin.',
      'Factor XIIIa (transglutaminase) cross-links glutamine to lysine between monomers, making the clot rigid.',
    ]),
  ],

  // ─── Lesson 3 — Prothrombin, vitamin K, bleeding disorders ─────────
  'blood-coagulation-and-fibrinolysis-3': [
    ask(
      mcq('c3-01', 'phospholipid-calcium', 'Blood is collected into a tube containing citrate. Why does it not clot?', 'Citrate removes the Ca²⁺ that clotting needs', ['Citrate destroys platelets', 'Citrate inhibits vitamin K', 'Citrate digests fibrinogen'], {
        explanation: 'Slide 36: anything that removes or sequesters Ca²⁺ — oxalate, citrate, EDTA — prevents clotting.',
        skill: 'prediction',
      })
    ),
    learn('Why calcium matters', [
      'Factors II, VII, IX and X must be anchored through Ca²⁺ to platelet phospholipid to be activated. Their Ca²⁺-binding comes from γ-carboxyglutamate residues made by a vitamin K-dependent enzyme system after translation.',
    ], { sourceRefs: ref([37, 38, 39]) }),
    ask(
      mcq('c3-02', 'vitamin-k-gla', 'What does vitamin K do for factors II, VII, IX and X?', 'Enables γ-carboxylation of glutamate residues so they bind Ca²⁺ strongly', ['Activates them by cleavage', 'Makes them in the liver', 'Cross-links them to fibrin'], {
        explanation: 'Slides 38–39.',
      })
    ),
    ask(
      multi('c3-03', 'vitamin-k-gla', 'Which are vitamin K antagonists named in the lecture? Select all that apply.', ['Dicoumarol', 'Warfarin'], ['Heparin', 'Aspirin'], {
        explanation: 'Slide 41: dicoumarol and warfarin are antithrombotic anticoagulants (and rat poisons). Heparin acts through antithrombin III; aspirin through COX-1.',
      })
    ),
    learn('Haemophilia', [
      'Haemophilia A (factor VIII, >80%) and B (factor IX, ~15%) are X-linked recessive. Haemophilia C lacks factor XI; parahaemophilia lacks factor V. Bleeding into joints (haemarthrosis) is typical.',
    ], { sourceRefs: ref([45, 46]) }),
    ask(
      match('c3-04', 'haemophilia', 'Match each disorder to the deficient factor.', [
        ['Haemophilia A', 'Factor VIII'],
        ['Haemophilia B', 'Factor IX'],
        ['Haemophilia C', 'Factor XI'],
        ['Congenital parahaemophilia', 'Factor V'],
      ], { explanation: 'Slide 45.' })
    ),
    ask(
      mcq('c3-05', 'vwf-kallikrein', 'Which protein does von Willebrand factor bind, besides helping platelets adhere?', 'Factor VIII', ['Factor XIII', 'Plasminogen', 'Antithrombin III'], {
        explanation: 'Slide 51: vWF binds other proteins, in particular factor VIII, and is important in platelet adhesion to wound sites.',
      })
    ),
    recall('r3-01', 'vitamin-k-gla', 'Explain why vitamin K deficiency or warfarin causes bleeding.', [
      'Factors II, VII, IX and X need γ-carboxyglutamate residues (made by a vitamin K-dependent system) to bind Ca²⁺ strongly.',
      'Without them they cannot anchor to platelet phospholipid, so they are not activated properly.',
      'Warfarin and dicoumarol antagonise vitamin K; deficiency occurs in obstructive jaundice, malabsorption, malnutrition and newborns.',
    ]),
  ],

  // ─── Lesson 4 — Control and fibrinolysis ───────────────────────────
  'blood-coagulation-and-fibrinolysis-4': [
    ask(
      mcq('c4-01', 'clot-limitation', 'As a clot forms, fibrin adsorbs thrombin. What is the effect?', 'It removes the last active factor, helping limit clotting to the injury', ['It activates more thrombin', 'It dissolves the clot', 'It releases vitamin K'], {
        explanation: 'Slide 59.',
        skill: 'prediction',
      })
    ),
    learn('Antithrombin III and heparin', [
      'Antithrombin III irreversibly inactivates thrombin and also IXa, Xa, XIa and plasmin. Heparin, a negatively charged glycosaminoglycan from mast cells, increases this affinity about a hundred-fold.',
    ], { sourceRefs: ref([61, 62, 63]) }),
    ask(
      mcq('c4-02', 'antithrombin-heparin', 'How does heparin act as an anticoagulant?', 'It speeds the formation of the irreversible thrombin–antithrombin III complex', ['It blocks vitamin K', 'It digests fibrin', 'It removes calcium'], {
        explanation: 'Slides 62–63.',
      })
    ),
    learn('Fibrinolysis', [
      'Plasmin, formed from plasminogen, breaks fibrin into soluble fibrin degradation products. TPA (from damaged endothelium) binds fibrin and activates plasminogen on the clot; urokinase and the blood activator (XII + kallikrein) also activate it. Antiplasmins limit plasmin.',
    ], { sourceRefs: ref([65, 66, 69, 70, 73]) }),
    ask(
      order('c4-03', 'plasmin-activators', 'Order the steps of clot lysis.', [
        'TPA is released at the injury and binds fibrin',
        'Plasminogen adsorbs to the fibrin',
        'TPA converts plasminogen to plasmin',
        'Plasmin breaks fibrin into soluble degradation products',
      ], { explanation: 'Slides 69–71.' })
    ),
    ask(
      mcq('c4-04', 'antiplatelet-thrombolytics', 'How does low-dose aspirin prevent clots?', 'It irreversibly acetylates COX-1, stopping platelet thromboxane A₂ production', ['It activates plasminogen', 'It blocks vitamin K', 'It inhibits antithrombin III'], {
        explanation: 'Slides 74–75.',
      })
    ),
    recall('r4-01', 'plasmin-activators', 'Describe fibrinolysis: the enzyme, its activators, its products and its inhibitors.', [
      'Plasmin (from plasminogen) breaks fibrin into soluble fibrin degradation products; it also degrades factors V, VIII and XIII.',
      'Activators: TPA (from endothelium; binds fibrin), the blood activator (XIIa + kallikrein), urokinase; drugs such as streptokinase.',
      'Inhibitors: a rapidly acting antiplasmin and α₂-macroglobulin.',
    ]),
  ],
};

export const readingExtras: Record<
  string,
  { highYield: string[]; confusions: LessonConfusion[]; estimatedMinutes: number; xp: number }
> = {
  'blood-coagulation-and-fibrinolysis-1': {
    estimatedMinutes: 11,
    xp: 25,
    highYield: [
      'Clotting factors are serine proteases in an amplifying cascade; trace initial factors, abundant fibrinogen.',
      'Intrinsic: XII → XI → IX (+VIII) → X. Extrinsic: tissue factor + VII → X. Common: X → thrombin → fibrin → XIII.',
      'Vitamin K-dependent factors: II, VII, IX, X.',
    ],
    confusions: [
      { confusion: 'The intrinsic and extrinsic pathways produce two different clots.', clarification: 'Both activate factor X and share one common pathway to fibrin.' },
      { confusion: 'Lacking factor XII causes a bleeding disorder.', clarification: 'Absence of XII, Fletcher factor or HMW kininogen does not cause bleeding (slide 54).' },
    ],
  },
  'blood-coagulation-and-fibrinolysis-2': {
    estimatedMinutes: 9,
    xp: 25,
    highYield: [
      'Dense granules: ADP, ATP, Ca²⁺, serotonin. α-granules: PF4, β-thromboglobulin, PDGF, thrombospondin, fibrinogen, vWF.',
      'Fibrinogen 2(Aα, Bβ, γ); thrombin cuts four Arg–Gly bonds → fibrinopeptides A and B leave → fibrin monomer (αβγ)₂.',
      'Factor XIIIa (transglutaminase) cross-links Gln–Lys.',
    ],
    confusions: [
      { confusion: 'Thrombin cross-links fibrin.', clarification: 'Thrombin cleaves fibrinogen; factor XIIIa cross-links the fibrin.' },
      { confusion: 'Fibrinopeptides are positively charged.', clarification: 'They are strongly negative (Asp, Glu, tyrosine-O-sulphate), which keeps fibrinogen apart.' },
    ],
  },
  'blood-coagulation-and-fibrinolysis-3': {
    estimatedMinutes: 11,
    xp: 30,
    highYield: [
      'Ca²⁺ is essential — citrate, oxalate, EDTA prevent clotting.',
      'Vitamin K → γ-carboxyglutamate on II, VII, IX, X → Ca²⁺ binding → phospholipid anchoring. Antagonists: warfarin, dicoumarol.',
      'Haemophilia A (VIII, >80%), B (IX, ~15%): X-linked recessive.',
    ],
    confusions: [
      { confusion: 'Heparin is a vitamin K antagonist.', clarification: 'Heparin works through antithrombin III; warfarin and dicoumarol antagonise vitamin K.' },
      { confusion: 'Haemophilia B is a factor VIII deficiency.', clarification: 'Haemophilia A is factor VIII; haemophilia B (Christmas disease) is factor IX.' },
    ],
  },
  'blood-coagulation-and-fibrinolysis-4': {
    estimatedMinutes: 10,
    xp: 30,
    highYield: [
      'Antithrombin III irreversibly binds thrombin (and IXa, Xa, XIa, plasmin); heparin ×100.',
      'Plasmin (from plasminogen) → fibrin degradation products; TPA binds fibrin and activates plasminogen there.',
      'Aspirin acetylates COX-1 (Ser 530) → no platelet thromboxane A₂.',
    ],
    confusions: [
      { confusion: 'Heparin dissolves existing clots.', clarification: 'Heparin prevents clotting via antithrombin III; plasmin activators (TPA, streptokinase, urokinase) dissolve clots.' },
      { confusion: 'Aspirin blocks COX-1 by reversible competition.', clarification: 'Low-dose aspirin irreversibly acetylates serine 530 of COX-1 (slide 75).' },
    ],
  },
};
