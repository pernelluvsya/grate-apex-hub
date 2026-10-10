// Biochemistry → Blood Coagulation and Fibrinolysis: the topic question bank.
//
// Rules: only what the lessons teach (the lecture deck and its pasted pages
// and figures). Not asked: fibrinogen’s exact length (sources differ), the
// site of plasminogen synthesis (lecture-only claim), and the speaker notes.
// Options are shuffled at quiz time (correct option written first).
// IDs: qN-xx, N = lesson.
import { fill, match, mcq, multi, order, tf, type QuestionDraft } from '@/data/topics/build';
import { ref, type ConceptId } from '@/data/topics/blood-coagulation-and-fibrinolysis/sources';

type Q = QuestionDraft<ConceptId>;

// ─── Lesson 1 — The cascade ─────────────────────────────────────────
const lesson1: Q[] = [
  mcq('q1-01', 'cascade-principles', 'What kind of enzymes are the clotting factors of the cascade?', 'Serine endopeptidases attacking Arg–X bonds', ['Kinases that phosphorylate fibrinogen', 'Lipases', 'Oxidoreductases'], {
    explanation: 'Slide 2.',
  }),
  mcq('q1-02', 'cascade-principles', 'Why are only trace amounts of the first factors needed?', 'Each step amplifies the preceding one', ['The first factors are never used up', 'Fibrinogen activates itself', 'The liver adds more as needed'], {
    explanation: 'Slide 2: amplification makes the cascade gather momentum; there are large amounts of the final substrate (fibrinogen).',
    skill: 'cause-effect',
  }),
  mcq('q1-03', 'cascade-principles', 'What stops the cascade being triggered prematurely?', 'Inhibitors — a stimulus below a threshold does not trigger it', ['Vitamin K', 'Platelets', 'Fibrin'], {
    explanation: 'Slide 3.',
  }),
  tf({
    id: 'q1-04', conceptId: 'cascade-principles',
    statement: 'Activated clotting factors are removed by blood flow and inactivated and excreted mainly by the liver.',
    answer: true,
    explanation: 'Slide 4.',
  }),
  multi('q1-05', 'cascade-principles', 'Which are hydrolytic cascades in blood (slide 5)? Select all that apply.', ['Clotting of blood', 'Lysis of clots', 'Formation of kinins', 'Activation of complement'], ['Glycolysis'], {
    explanation: 'Slide 5.',
  }),
  mcq('q1-06', 'cascade-principles', 'About how much fibrinogen is in plasma (slide 2)?', '250 mg/100 mL', ['2.5 mg/100 mL', '25 g/100 mL', '1 µg/100 mL'], {
    explanation: 'Slide 2.',
    difficulty: 'intermediate',
  }),
  order('q1-07', 'haemostasis-events', 'Put the three events of haemostasis in order.', [
    'Vasoconstriction',
    'Platelet adhesion and aggregation',
    'Blood coagulation',
  ], { explanation: 'Slide 13.' }),
  fill('q1-08', 'haemostasis-events', 'A clot formed within a blood vessel is called a ____.', ['thrombus'], {
    explanation: 'Slide 13.',
    skill: 'terminology',
  }),
  mcq('q1-09', 'intrinsic-extrinsic', 'What triggers the intrinsic pathway?', 'Contact of factor XII with an abnormal surface', ['Tissue factor released by trauma', 'Thrombin', 'Plasmin'], {
    explanation: 'Slides 8–9.',
  }),
  order('q1-10', 'intrinsic-extrinsic', 'Order the intrinsic pathway.', [
    'XII → XIIa',
    'XI → XIa',
    'IX → IXa',
    'IXa + VIIIa activate X',
  ], { explanation: 'Slides 8–9.' }),
  mcq('q1-11', 'intrinsic-extrinsic', 'Which factor joins tissue factor in the extrinsic pathway?', 'Factor VII', ['Factor VIII', 'Factor XII', 'Factor XIII'], {
    explanation: 'Slides 8 and 56.',
  }),
  mcq('q1-12', 'intrinsic-extrinsic', 'Which enzyme converts prothrombin to thrombin?', 'Factor Xa (with Va)', ['Factor XIIIa', 'Plasmin', 'Kallikrein'], {
    explanation: 'Slides 8 and 32.',
  }),
  mcq('q1-13', 'intrinsic-extrinsic', 'By how much does factor VIII enhance the activation of X (slide 55)?', 'About a thousand-fold', ['About two-fold', 'About ten-fold', 'It has no effect'], {
    explanation: 'Slide 55.',
    difficulty: 'intermediate',
  }),
  multi('q1-14', 'intrinsic-extrinsic', 'Which are modifier (non-enzyme) proteins of the cascade (slide 11)? Select all that apply.', ['Factor V', 'Factor VIII', 'Tissue factor'], ['Factor X', 'Thrombin'], {
    explanation: 'Slide 11 (textbook page).',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q1-15', conceptId: 'intrinsic-extrinsic',
    statement: 'Factor VII deficiency is common and usually mild.',
    answer: false,
    explanation: 'Slide 56: factor VII deficiency is rare but can lead to severe bleeding.',
    skill: 'misconception',
  }),
  multi('q1-16', 'pathway-activators', 'Which activate the intrinsic pathway in the body (slide 28)? Select all that apply.', ['Collagen', 'Gram-negative endotoxins', 'Antigen–antibody complexes'], ['Silicon', 'Heparin'], {
    explanation: 'Slide 28.',
  }),
  match('q1-17', 'pathway-activators', 'Match each surface to its effect in the test tube (slide 29).', [
    ['Glass', 'Activates'],
    ['Kaolin', 'Activates'],
    ['Silicon', 'Does not activate'],
    ['Some plastics', 'Does not activate'],
  ], { explanation: 'Slide 29.' }),
  tf({
    id: 'q1-18', conceptId: 'pathway-activators',
    statement: 'Absence of factor XII, Fletcher factor or HMW kininogen causes a severe bleeding disorder.',
    answer: false,
    explanation: 'Slide 54: their absence does not lead to any bleeding disorder.',
    skill: 'misconception',
    difficulty: 'intermediate',
  }),
  match('q1-19', 'pathway-activators', 'Match each contact-system protein to its other name.', [
    ['Prekallikrein', 'Fletcher factor'],
    ['HMW kininogen', 'Fitzgerald factor'],
    ['Factor XII', 'Hageman factor'],
  ], { explanation: 'Slides 12 and 54.' }),
  match('q1-20', 'clotting-factors', 'Match each factor number to its name.', [
    ['Factor I', 'Fibrinogen'],
    ['Factor II', 'Prothrombin'],
    ['Factor IX', 'Christmas factor'],
    ['Factor XIII', 'Fibrin-stabilising factor'],
  ], { explanation: 'Slides 10–12.' }),
  mcq('q1-21', 'clotting-factors', 'What is factor IV?', 'Calcium (Ca²⁺)', ['Proaccelerin', 'Tissue factor', 'Fibrinogen'], {
    explanation: 'Slide 44 (textbook table) lists factor IV as Ca²⁺.',
    sourceRefs: ref([44]),
  }),
  mcq('q1-22', 'clotting-factors', 'Where are most clotting factors made (slide 12)?', 'The liver', ['The kidney', 'The spleen', 'Bone marrow'], {
    explanation: 'Slide 12: liver for most; von Willebrand factor in the endothelium.',
  }),
  mcq('q1-23', 'clotting-factors', 'Which factor is made by the endothelium rather than the liver (slide 12)?', 'Von Willebrand factor', ['Fibrinogen', 'Factor IX', 'Prothrombin'], {
    explanation: 'Slide 12.',
    difficulty: 'intermediate',
  }),
  mcq('q1-24', 'clotting-factors', 'Which factor is Stuart(-Prower) factor?', 'Factor X', ['Factor VII', 'Factor XI', 'Factor V'], {
    explanation: 'Slides 11–12.',
    skill: 'terminology',
  }),
  mcq('q1-25', 'clotting-factors', 'What is the function of active factor XIII?', 'Transamidase — cross-links fibrin', ['Serine protease that activates X', 'Cofactor for IX', 'Structural clot protein'], {
    explanation: 'Slides 11–12.',
  }),
  tf({
    id: 'q1-26', conceptId: 'clotting-factors',
    statement: 'Factor VIII is vitamin K-dependent.',
    answer: false,
    explanation: 'The vitamin K-dependent factors are II, VII, IX and X (slides 12, 38).',
    skill: 'misconception',
  }),
];

// ─── Lesson 2 — Platelets, fibrinogen, fibrin ───────────────────────
const lesson2: Q[] = [
  mcq('q2-01', 'platelets', 'What size are platelets?', 'About 1 × 3 microns', ['About 7 microns across', 'About 0.1 micron', 'About 20 microns'], {
    explanation: 'Slide 14.',
  }),
  mcq('q2-02', 'platelets', 'What is the approximate ratio of erythrocytes to platelets?', '20 : 1', ['1 : 20', '1 : 1', '500 : 1'], {
    explanation: 'Slide 14.',
    difficulty: 'intermediate',
  }),
  fill('q2-03', 'platelets', 'Platelets are descendants of ____.', ['megakaryocytes', 'megakaryocyte'], {
    explanation: 'Slide 14.',
  }),
  multi('q2-04', 'platelets', 'Which are contents of platelet dense granules? Select all that apply.', ['ADP', 'ATP', 'Ca²⁺', 'Serotonin'], ['Fibrinogen', 'PDGF'], {
    explanation: 'Slide 17. Fibrinogen and PDGF are in α-granules.',
  }),
  multi('q2-05', 'platelets', 'Which are contents of α-granules? Select all that apply.', ['Platelet factor IV', 'β-Thromboglobulin', 'PDGF', 'Von Willebrand factor'], ['Serotonin', 'ADP'], {
    explanation: 'Slide 17.',
  }),
  tf({
    id: 'q2-06', conceptId: 'platelets',
    statement: 'Platelets contain mitochondria but no nuclei.',
    answer: true,
    explanation: 'Slide 14.',
  }),
  mcq('q2-07', 'fibrinogen-structure', 'What is the mass of fibrinogen?', '340 kDa', ['33.7 kDa', '72 kDa', '3400 kDa'], {
    explanation: 'Slide 18. (33.7 kDa is thrombin.)',
  }),
  mcq('q2-08', 'fibrinogen-structure', 'How many polypeptide chains does fibrinogen have?', 'Six — two each of Aα, Bβ and γ', ['Four — α₂β₂', 'Two', 'Twelve'], {
    explanation: 'Slide 18.',
  }),
  mcq('q2-09', 'fibrinogen-structure', 'How many peptide bonds does thrombin cleave in fibrinogen?', 'Four Arg–Gly bonds', ['One Arg–Ile bond', 'Two Lys–Gly bonds', 'Eight Arg–Thr bonds'], {
    explanation: 'Slide 18.',
  }),
  tf({
    id: 'q2-10', conceptId: 'fibrinogen-structure',
    statement: 'Electron micrographs show fibrinogen as three nodules joined by two rods.',
    answer: true,
    explanation: 'Slide 7 (textbook page).',
    difficulty: 'intermediate',
  }),
  mcq('q2-11', 'fibrinopeptides', 'How many residues are in each fibrinopeptide A and B?', 'A: 18; B: 20', ['A: 20; B: 18', 'Both 10', 'A: 4; B: 4'], {
    explanation: 'Slide 24.',
    difficulty: 'intermediate',
  }),
  mcq('q2-12', 'fibrinopeptides', 'What is the subunit structure of the fibrin monomer?', '(αβγ)₂', ['α₂β₂', '(AαBβγ)₂', 'γ₄'], {
    explanation: 'Slide 24.',
  }),
  mcq('q2-13', 'fibrinopeptides', 'What fraction of fibrinogen’s residues does the fibrin monomer keep?', 'About 97%', ['About 50%', 'About 3%', 'All of them'], {
    explanation: 'Slide 24.',
    difficulty: 'intermediate',
  }),
  multi('q2-14', 'fibrinopeptides', 'What gives fibrinopeptides their negative charge? Select all that apply.', ['Aspartate residues', 'Glutamate residues', 'Tyrosine-O-sulphate (in B)'], ['Lysine residues', 'Arginine residues'], {
    explanation: 'Slides 25–26.',
  }),
  mcq('q2-15', 'fibrinopeptides', 'Which fibrinopeptide contains tyrosine-O-sulphate?', 'Fibrinopeptide B', ['Fibrinopeptide A', 'Both', 'Neither'], {
    explanation: 'Slide 26.',
    difficulty: 'intermediate',
  }),
  mcq('q2-16', 'fibrinopeptides', 'What is the role of the fibrinopeptides’ negative charges?', 'They repel each other and keep fibrinogen molecules apart', ['They bind calcium for clotting', 'They activate platelets', 'They bind thrombin'], {
    explanation: 'Slide 26.',
    skill: 'cause-effect',
  }),
  order('q2-17', 'fibrinopeptides', 'Order the formation of a fibrin clot.', [
    'Thrombin cleaves four Arg–Gly bonds',
    'Fibrinopeptides A and B are released',
    'Fibrin monomers assemble into fibrin',
    'Factor XIIIa cross-links the fibrin',
  ], { explanation: 'Slides 18–24, 43.' }),
  mcq('q2-18', 'fibrin-cross-linking', 'What kind of enzyme is factor XIIIa?', 'A transglutaminase', ['A serine protease that cleaves fibrinogen', 'A kinase', 'A plasminogen activator'], {
    explanation: 'Slides 43–44.',
  }),
  mcq('q2-19', 'fibrin-cross-linking', 'Which small molecule is released when factor XIIIa forms a cross-link?', 'NH₄⁺', ['CO₂', 'H₂O', 'Phosphate'], {
    explanation: 'Slide 44 (figure).',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q2-20', conceptId: 'fibrin-cross-linking',
    statement: 'The cross-links made by factor XIIIa make the clot more rigid.',
    answer: true,
    explanation: 'Slide 44 (textbook page).',
  }),
  mcq('q2-21', 'fibrin-cross-linking', 'Which enzyme activates factor XIII?', 'Thrombin', ['Plasmin', 'Factor VIIa', 'Kallikrein'], {
    explanation: 'Slide 44 (textbook page): thrombin also hydrolyses protransglutaminase (XIII) to the active transglutaminase.',
    difficulty: 'intermediate',
  }),
  mcq('q2-22', 'platelets', 'Which two substances does slide 14 say are normally present inside intact platelets?', 'Platelet factor IV and β-thromboglobulin', ['Thrombin and plasmin', 'Vitamin K and calcium', 'Heparin and antithrombin III'], {
    explanation: 'Slide 14.',
  }),
  tf({
    id: 'q2-23', conceptId: 'fibrinogen-structure',
    statement: 'Fibrinogen is converted into fibrin by plasmin.',
    answer: false,
    explanation: 'Thrombin converts fibrinogen to fibrin; plasmin breaks fibrin down (Lesson 4).',
    skill: 'misconception',
  }),
  mcq('q2-24', 'fibrin-cross-linking', 'Which side chains are joined in a fibrin cross-link?', 'Glutamine (glutamyl) and lysine', ['Cysteine and cysteine', 'Serine and aspartate', 'Tyrosine and arginine'], {
    explanation: 'Slides 43–44.',
  }),
  mcq('q2-25', 'fibrinopeptides', 'Removing the fibrinopeptides allows what?', 'Fibrin monomers to assemble into fibrin', ['Fibrinogen to be secreted', 'Platelets to divide', 'Plasmin to form'], {
    explanation: 'Slides 20, 22 and 26.',
    skill: 'cause-effect',
  }),
  fill('q2-26', 'fibrin-cross-linking', 'Factor XIII is also called fibrin-____ factor.', ['stabilising', 'stabilizing'], {
    explanation: 'Slides 10–12 and 43.',
    skill: 'terminology',
  }),
];

// ─── Lesson 3 — Prothrombin, vitamin K, bleeding disorders ──────────
const lesson3: Q[] = [
  mcq('q3-01', 'prothrombin-thrombin', 'What is the mass of thrombin (slide 33)?', '33.7 kDa', ['340 kDa', '72 kDa', '3.4 kDa'], {
    explanation: 'Slide 33.',
    difficulty: 'intermediate',
  }),
  mcq('q3-02', 'prothrombin-thrombin', 'Thrombin’s B chain resembles which enzymes?', 'Trypsin, chymotrypsin and elastase', ['Pepsin and renin', 'Lipase and amylase', 'Kinases'], {
    explanation: 'Slide 33.',
  }),
  mcq('q3-03', 'prothrombin-thrombin', 'What does thrombin’s active-site sequence –Gly-Asp-Ser-Gly-Gly-Pro– identify it as?', 'A serine esterase/protease', ['A metalloprotease', 'A cysteine protease', 'A kinase'], {
    explanation: 'Slide 33.',
  }),
  tf({
    id: 'q3-04', conceptId: 'prothrombin-thrombin',
    statement: 'Thrombin has two chains, A and B.',
    answer: true,
    explanation: 'Slide 33.',
  }),
  mcq('q3-05', 'prothrombin-thrombin', 'Which factor cleaves prothrombin to form thrombin?', 'Factor Xa', ['Factor XIIIa', 'Factor VIIa', 'Plasmin'], {
    explanation: 'Slide 32.',
  }),
  multi('q3-06', 'phospholipid-calcium', 'What do platelet phospholipid surfaces do (slide 34)? Select all that apply.', ['Draw the clotting factors together', 'Concentrate them up to 10⁴-fold', 'Confine the fast reactions to the injury'], ['Synthesise the clotting factors', 'Dissolve the clot'], {
    explanation: 'Slide 34.',
  }),
  multi('q3-07', 'phospholipid-calcium', 'Which prevent blood from clotting by removing Ca²⁺? Select all that apply.', ['Citrate', 'Oxalate', 'EDTA'], ['Vitamin K', 'Fibrinogen'], {
    explanation: 'Slide 36.',
  }),
  mcq('q3-08', 'phospholipid-calcium', 'How is prothrombin held on the platelet membrane for activation?', 'Through Ca²⁺ bound to its γ-carboxyglutamates', ['By a disulfide bond', 'By fibrin', 'By von Willebrand factor'], {
    explanation: 'Slide 37.',
  }),
  multi('q3-09', 'vitamin-k-gla', 'Which factors make up the “prothrombin complex”? Select all that apply.', ['II', 'VII', 'IX', 'X'], ['VIII', 'XII'], {
    explanation: 'Slide 38.',
  }),
  mcq('q3-10', 'vitamin-k-gla', 'Where are the γ-carboxyglutamate residues of these factors?', 'Near their amino termini', ['At their carboxyl termini', 'In the active site', 'On attached carbohydrates'], {
    explanation: 'Slide 38.',
    difficulty: 'intermediate',
  }),
  tf({
    id: 'q3-11', conceptId: 'vitamin-k-gla',
    statement: 'γ-Carboxyglutamate is a stronger chelator of calcium than glutamate.',
    answer: true,
    explanation: 'Slide 39.',
  }),
  mcq('q3-12', 'vitamin-k-gla', 'When does γ-carboxylation of these factors happen?', 'After translation (post-translational)', ['During transcription', 'After the clot forms', 'In the platelet'], {
    explanation: 'Slide 38.',
  }),
  multi('q3-13', 'vitamin-k-gla', 'What are dicoumarol and warfarin used as (slide 41)? Select all that apply.', ['Anticoagulants', 'Rat poisons'], ['Thrombolytics', 'Vitamin K supplements'], {
    explanation: 'Slide 41.',
  }),
  mcq('q3-14', 'vitamin-k-gla', 'A patient takes warfarin. Which factors will be poorly functional?', 'II, VII, IX and X', ['V and VIII', 'XI and XII', 'Fibrinogen and XIII'], {
    explanation: 'Warfarin antagonises vitamin K, which the γ-carboxylation of II, VII, IX and X depends on (slides 38, 41).',
    skill: 'application',
  }),
  multi('q3-15', 'vitamin-k-gla', 'In which conditions is vitamin K deficiency bleeding seen (slide 42)? Select all that apply.', ['Obstructive jaundice', 'Malabsorption', 'Malnutrition', 'Occasionally in newborns'], ['Hypertension'], {
    explanation: 'Slide 42.',
  }),
  multi('q3-16', 'vitamin-k-gla', 'Why can newborns lack vitamin K (slide 42)? Select all that apply.', ['Reduced placental permeability to vitamin K', 'No bacterial flora in the gut yet', 'Immature liver, so fat-soluble vitamins are poorly absorbed'], ['Too much fibrinogen'], {
    explanation: 'Slide 42.',
    difficulty: 'intermediate',
  }),
  mcq('q3-17', 'vitamin-k-gla', 'Why does obstructive jaundice cause vitamin K deficiency?', 'Bile cannot reach the gut, so fat-soluble vitamin K is poorly absorbed', ['Bilirubin destroys vitamin K', 'The liver stores too much vitamin K', 'Jaundice increases vitamin K excretion in urine'], {
    explanation: 'Slide 42 links vitamin K deficiency to obstructive jaundice and to poor bile-salt-dependent absorption of fat-soluble vitamins.',
    skill: 'cause-effect',
    difficulty: 'intermediate',
  }),
  mcq('q3-18', 'haemophilia', 'How are haemophilias A and B inherited?', 'X-linked recessive', ['Autosomal dominant', 'Autosomal recessive', 'Mitochondrial'], {
    explanation: 'Slide 45.',
  }),
  mcq('q3-19', 'haemophilia', 'What causes haemophilia A?', 'Synthesis of an ineffective factor VIII', ['Absence of factor IX', 'Absence of factor XI', 'Absence of factor V'], {
    explanation: 'Slide 45.',
  }),
  mcq('q3-20', 'haemophilia', 'What share of haemophiliacs have haemophilia A?', 'Over 80%', ['About 15%', 'About 50%', 'Under 5%'], {
    explanation: 'Slide 45.',
  }),
  fill('q3-21', 'haemophilia', 'Haemophilia B is due to absence of ____ factor (factor IX).', ['Christmas'], {
    explanation: 'Slide 45.',
  }),
  multi('q3-22', 'haemophilia', 'Which are clinical features of haemophilia (slide 46)? Select all that apply.', ['Haemarthrosis (bleeding into joints)', 'Haematuria', 'Intracranial haemorrhage', 'Excessive bleeding after trauma'], ['Thrombosis'], {
    explanation: 'Slide 46.',
  }),
  mcq('q3-23', 'haemophilia', 'How can haematomas of the head and neck kill a haemophiliac?', 'By asphyxiation', ['By kidney failure', 'By infection', 'By jaundice'], {
    explanation: 'Slide 46.',
    clinical: true,
  }),
  tf({
    id: 'q3-24', conceptId: 'vwf-kallikrein',
    statement: 'Von Willebrand factor is an enzyme with catalytic activity.',
    answer: false,
    explanation: 'Slide 51: it is not an enzyme and has no catalytic activity.',
    skill: 'misconception',
  }),
  mcq('q3-25', 'vwf-kallikrein', 'What may increased von Willebrand factor levels predict (slide 52)?', 'An increased risk of thrombosis', ['Haemophilia A', 'Vitamin K deficiency', 'Lower blood pressure'], {
    explanation: 'Slide 52.',
  }),
  mcq('q3-26', 'vwf-kallikrein', 'What does plasma kallikrein generate (slide 48)?', 'Bradykinin — a vasodilator that increases vascular permeability', ['Thrombin', 'Fibrin', 'Thromboxane A₂'], {
    explanation: 'Slide 48.',
  }),
];

// ─── Lesson 4 — Control and fibrinolysis ────────────────────────────
const lesson4: Q[] = [
  multi('q4-01', 'clot-limitation', 'How are activated clotting factors removed (slide 60)? Select all that apply.', ['Diluted by blood flow', 'Inactivated by specific inhibitors', 'Removed by the liver and reticuloendothelial system', 'Degraded by proteases'], ['Excreted unchanged in urine'], {
    explanation: 'Slide 60.',
  }),
  tf({
    id: 'q4-02', conceptId: 'clot-limitation',
    statement: 'Activated clotting factors have a long half-life in blood.',
    answer: false,
    explanation: 'Slide 60: they have a short half-life.',
    skill: 'misconception',
  }),
  mcq('q4-03', 'clot-limitation', 'Which protein adsorbs thrombin as the clot forms, limiting clotting to the injury?', 'Fibrin', ['Albumin', 'Plasminogen', 'Antithrombin III'], {
    explanation: 'Slide 59.',
  }),
  fill('q4-04', 'antithrombin-heparin', 'Antithrombin III is also called heparin ____.', ['cofactor', 'co-factor'], {
    explanation: 'Slide 61.',
    skill: 'terminology',
  }),
  mcq('q4-05', 'antithrombin-heparin', 'How does antithrombin III inactivate thrombin?', 'By forming an irreversible complex with it', ['By phosphorylating it', 'By cleaving fibrinogen first', 'By removing its calcium'], {
    explanation: 'Slide 61.',
  }),
  multi('q4-06', 'antithrombin-heparin', 'Besides thrombin, what does antithrombin III inhibit? Select all that apply.', ['Factor IXa', 'Factor Xa', 'Factor XIa', 'Plasmin'], ['Vitamin K'], {
    explanation: 'Slide 61.',
  }),
  mcq('q4-07', 'antithrombin-heparin', 'By how much does heparin increase antithrombin III’s affinity for the serine proteases?', 'About a hundred-fold', ['About two-fold', 'About ten-thousand-fold', 'It decreases it'], {
    explanation: 'Slide 63.',
    difficulty: 'intermediate',
  }),
  mcq('q4-08', 'antithrombin-heparin', 'What kind of molecule is heparin?', 'A negatively charged polysaccharide (glycosaminoglycan)', ['A vitamin', 'A serine protease', 'A positively charged peptide'], {
    explanation: 'Slides 61 and 64.',
  }),
  mcq('q4-09', 'antithrombin-heparin', 'Where is heparin found (slide 61)?', 'In mast cells near blood-vessel walls', ['In platelet dense granules', 'In red cells', 'In bile'], {
    explanation: 'Slide 61.',
  }),
  mcq('q4-10', 'plasmin-activators', 'What is the inactive precursor of plasmin?', 'Plasminogen', ['Prothrombin', 'Fibrinogen', 'Prekallikrein'], {
    explanation: 'Slide 65.',
  }),
  mcq('q4-11', 'plasmin-activators', 'What does plasmin do to fibrin?', 'Breaks it into small soluble peptides (fibrin degradation products)', ['Cross-links it', 'Converts it back to fibrinogen', 'Adds calcium to it'], {
    explanation: 'Slides 68–69.',
  }),
  multi('q4-12', 'plasmin-activators', 'Which are plasminogen activators (slides 66, 69)? Select all that apply.', ['Tissue plasminogen activator (TPA)', 'Urokinase', 'Streptokinase', 'Factor XIIa + kallikrein'], ['Heparin', 'Warfarin'], {
    explanation: 'Slides 66 and 69.',
  }),
  mcq('q4-13', 'plasmin-activators', 'Why does urokinase matter in the urinary tract (slide 66)?', 'It prevents clot formation in the ureters and bladder', ['It concentrates urine', 'It activates vitamin K', 'It makes fibrinogen'], {
    explanation: 'Slide 66.',
  }),
  mcq('q4-14', 'plasmin-activators', 'Why does TPA act mainly on clots?', 'It and plasminogen both have high affinity for fibrin, so plasmin forms on the fibrin mesh', ['It only exists inside platelets', 'It is activated by heparin', 'It cannot enter the bloodstream'], {
    explanation: 'Slides 70–71.',
    skill: 'cause-effect',
    difficulty: 'intermediate',
  }),
  multi('q4-15', 'plasmin-activators', 'Which clotting factors does plasmin also degrade (slide 72)? Select all that apply.', ['Factor V', 'Factor VIII', 'Factor XIII'], ['Factor X', 'Factor IX'], {
    explanation: 'Slide 72.',
    difficulty: 'intermediate',
  }),
  multi('q4-16', 'plasmin-activators', 'Which are antiplasmins (slide 73)? Select all that apply.', ['Rapidly acting antiplasmin', 'α₂-Macroglobulin'], ['Antithrombin III only', 'Urokinase'], {
    explanation: 'Slide 73.',
  }),
  mcq('q4-17', 'plasmin-activators', 'Where is TPA released in greater amounts (slide 66)?', 'From damaged blood vessels — arteries and veins', ['From platelets', 'From the liver', 'From the kidney'], {
    explanation: 'Slide 66.',
  }),
  mcq('q4-18', 'plasmin-activators', 'Plasmin is described as what kind of enzyme (slide 68)?', 'Trypsin-like', ['Kinase-like', 'Lipase-like', 'Transglutaminase-like'], {
    explanation: 'Slide 68.',
  }),
  order('q4-19', 'plasmin-activators', 'Order the fibrinolysis pathway.', [
    'Activator (e.g. TPA, urokinase, streptokinase)',
    'Plasminogen → plasmin',
    'Fibrin clot → fibrin degradation products',
  ], { explanation: 'Slide 69.' }),
  mcq('q4-20', 'antiplatelet-thrombolytics', 'Which enzyme does aspirin block?', 'Cyclo-oxygenase-1 (COX-1)', ['Thrombin', 'Plasmin', 'Factor Xa'], {
    explanation: 'Slide 74.',
  }),
  mcq('q4-21', 'antiplatelet-thrombolytics', 'What does thromboxane A₂ do?', 'Promotes platelet activation and aggregation', ['Dissolves clots', 'Inhibits thrombin', 'Blocks vitamin K'], {
    explanation: 'Slides 74 and 76.',
  }),
  mcq('q4-22', 'antiplatelet-thrombolytics', 'Which residue of COX-1 does low-dose aspirin acetylate?', 'Serine 530', ['Histidine 57', 'Cysteine 25', 'Lysine 82'], {
    explanation: 'Slide 75.',
    difficulty: 'advanced',
  }),
  mcq('q4-23', 'antiplatelet-thrombolytics', 'What is a typical low antithrombotic aspirin dose (slide 75)?', '75–81 mg/day', ['1–2 g/day', '5 mg/week', '500 mg four times daily'], {
    explanation: 'Slide 75.',
    difficulty: 'intermediate',
  }),
  order('q4-24', 'antiplatelet-thrombolytics', 'Order the pathway that aspirin blocks.', [
    'Arachidonic acid',
    'PGG₂',
    'PGH₂',
    'Thromboxane A₂',
  ], { explanation: 'Slide 74: COX converts arachidonic acid to PGG₂ and PGH₂; then TXA₂.' }),
  mcq('q4-25', 'antiplatelet-thrombolytics', 'When is streptokinase given (slide 77)?', 'Soon after a heart attack, and for pulmonary embolism or deep venous thrombosis', ['To reverse warfarin', 'To treat haemophilia', 'To prevent vitamin K deficiency'], {
    explanation: 'Slide 77.',
    clinical: true,
  }),
  tf({
    id: 'q4-26', conceptId: 'antiplatelet-thrombolytics',
    statement: 'Thrombolytic agents work by activating plasminogen to plasmin.',
    answer: true,
    explanation: 'Slide 69.',
  }),
];

export const questions: Q[] = [...lesson1, ...lesson2, ...lesson3, ...lesson4];
