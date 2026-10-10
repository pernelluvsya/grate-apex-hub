// Explore content for Explore V1.
//
// Explore is optional discovery — it is NOT graded or tracked, and it is
// deliberately independent of courses, lessons, quizzes, progress and
// friends data. Do not import those modules here.
//
// Screens must read content through the functions below, so this static
// list can later be replaced by an admin/content system without
// rewriting the screens.

export type ExploreCategory = 'concept' | 'connection' | 'research' | 'grateapex';

// Internal destinations an Explore item may link to.
// Only screens that already exist in the app belong here.
export type ExploreActionHref = '/' | '/social/friends' | '/progress' | '/learn' | '/profile';

export type ExploreAction = {
  label: string;
  href: ExploreActionHref;
};

export type ExploreProvenance = {
  // 'draft'    = demonstration content awaiting owner/expert review
  // 'reviewed' = checked and approved
  // 'feature'  = describes a real GRATEAPEX feature
  status: 'draft' | 'reviewed' | 'feature';
  note: string;
};

export type ExploreSource = {
  title: string;
  url?: string;
};

export type ExploreItem = {
  id: string; // stable ID, e.g. 'concept-heart-pacemaker'
  category: ExploreCategory;
  topic: string; // small label, e.g. 'Cardiovascular'
  title: string;
  summary: string; // one line for cards
  basicIdea: string;
  whyItMatters?: string;
  provenance: ExploreProvenance;
  sources: ExploreSource[]; // empty until real sources are added
  publishedAt: string; // YYYY-MM-DD
  featured: boolean;
  tags: string[]; // future topic mapping only — not linked to Learn yet
  action?: ExploreAction;
  connectionSteps?: { label: string; detail: string }[];
  research?: {
    evidenceType: string;
    whatWeKnow: string;
    whatRemainsUncertain: string;
  };
};

export type ExploreAnnouncement = {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  status: 'available' | 'preview' | 'coming-soon';
};

export type ExploreGuideEntry = { title: string; detail: string; status: 'available' | 'limited' | 'coming-soon' };
export type ExploreTeamMember = { name: string; role: string; icon: 'sparkle' | 'profile' };
export const EXPLORE_TEAM: readonly ExploreTeamMember[] = [
  { name: 'Gracious Annor Afriyie', role: 'Co-founder', icon: 'sparkle' },
  { name: 'Evans Agalega', role: 'Co-founder', icon: 'sparkle' },
  { name: 'OrigiNate', role: 'Technical officer', icon: 'profile' },
  { name: 'Pernellluvsya', role: 'Technical officer', icon: 'profile' },
  { name: 'Kwame Twumasi', role: 'Technical Advisor', icon: 'profile' },
];
export const EXPLORE_CONTACT = { email: 'theapexhub921@gmail.com', subject: 'GrAteApex Hub question' } as const;

const SUPPLEMENTAL_REVIEWED: ExploreProvenance = {
  status: 'reviewed',
  note: 'Supplementary discovery content checked against the linked reference. It is not authoritative course material.',
};

const FEATURE: ExploreProvenance = {
  status: 'feature',
  note: 'A feature available in GrAteApex Hub today.',
};

const exploreItems: ExploreItem[] = [
  // ---------- Supplementary medical concepts ----------
  {
    id: 'concept-heart-pacemaker',
    category: 'concept',
    topic: 'Cardiovascular',
    title: "The heart's built-in pacemaker",
    summary: 'Your heart starts each beat by itself — no signal from the brain needed.',
    basicIdea:
      'A small group of specialised cells in the right atrium, the sinoatrial (SA) node, produces electrical impulses on its own. Each impulse spreads through the heart and makes it contract. Nerves from the brain can speed the rhythm up or slow it down, but they do not start each beat.',
    whyItMatters:
      'This is why a transplanted heart, whose nerves have been cut, can still beat. It is also the basis of the ECG, which records this electrical activity, and of artificial pacemakers, which take over when the natural rhythm fails.',
    provenance: SUPPLEMENTAL_REVIEWED,
    sources: [{ title: 'Physiology, Sinoatrial Node — NCBI Bookshelf', url: 'https://www.ncbi.nlm.nih.gov/sites/books/NBK459238/' }],
    publishedAt: '2026-09-26',
    featured: false,
    tags: ['cardiovascular', 'physiology', 'electrophysiology'],
  },
  {
    id: 'concept-shivering-fever',
    category: 'concept',
    topic: 'Physiology',
    title: 'Why you shiver when you have a fever',
    summary: 'Chills during a fever come from the body raising its own thermostat.',
    basicIdea:
      'The hypothalamus in the brain works like a thermostat with a "set point" for body temperature. Shivering — rapid, involuntary muscle contractions — produces heat to bring the body up to that set point.',
    whyItMatters:
      'During an infection, signalling molecules raise the set point. The body then feels cold at its normal temperature and shivers to warm up, which explains the chills that often come at the start of a fever.',
    provenance: SUPPLEMENTAL_REVIEWED,
    sources: [{ title: 'Fever — StatPearls, NCBI Bookshelf', url: 'https://www.ncbi.nlm.nih.gov/books/NBK562334/' }],
    publishedAt: '2026-09-26',
    featured: false,
    tags: ['physiology', 'thermoregulation', 'hypothalamus'],
  },
  {
    id: 'concept-blood-groups',
    category: 'concept',
    topic: 'Haematology',
    title: 'Why blood has to be matched',
    summary: 'Tiny markers on red blood cells decide whose blood you can safely receive.',
    basicIdea:
      'Red blood cells carry markers called antigens, such as A and B in the ABO system. The plasma naturally contains antibodies against the ABO antigens a person does not have.',
    whyItMatters:
      'If blood with the wrong antigens is transfused, the recipient’s antibodies attack those red cells. This is why blood is tested and matched before a transfusion.',
    provenance: SUPPLEMENTAL_REVIEWED,
    sources: [{ title: 'Blood Transfusion — StatPearls, NCBI Bookshelf', url: 'https://www.ncbi.nlm.nih.gov/books/NBK499824/' }],
    publishedAt: '2026-09-26',
    featured: false,
    tags: ['haematology', 'immunology', 'transfusion'],
  },

  // ---------- Connections: mechanism to clinical consequence ----------
  {
    id: 'connection-fasting-to-ketones',
    category: 'connection',
    topic: 'Biochemistry → clinical medicine',
    title: 'Why fasting shifts the liver toward ketones',
    summary: 'A change in hormones links fat breakdown to an alternative fuel for the brain — and helps explain diabetic ketoacidosis.',
    basicIdea: 'When insulin falls relative to counter-regulatory hormones, adipose tissue releases more fatty acids. The liver oxidizes them to acetyl-CoA; during prolonged fasting, some acetyl-CoA is converted into acetoacetate and β-hydroxybutyrate.',
    whyItMatters: 'The pathway helps explain normal fuel adaptation during fasting and why severe insulin deficiency can drive excessive ketone production and metabolic acidosis in diabetic ketoacidosis.',
    provenance: SUPPLEMENTAL_REVIEWED,
    sources: [{ title: 'Biochemistry, Ketogenesis — StatPearls, NCBI Bookshelf', url: 'https://www.ncbi.nlm.nih.gov/books/NBK493179/' }],
    publishedAt: '2026-10-05',
    featured: false,
    tags: ['biochemistry', 'endocrinology', 'metabolism', 'clinical'],
    connectionSteps: [
      { label: 'Hormones', detail: 'Lower insulin relative to glucagon and other counter-regulatory signals.' },
      { label: 'Cellular mechanism', detail: 'Lipolysis supplies fatty acids; hepatic β-oxidation raises acetyl-CoA.' },
      { label: 'Pathway', detail: 'The liver converts some acetyl-CoA into ketone bodies for export.' },
      { label: 'Clinical link', detail: 'Physiologic fasting and diabetic ketoacidosis share ketone pathways, but differ in regulation, degree and clinical context.' },
    ],
    action: { label: 'Explore related learning', href: '/learn' },
  },
  {
    id: 'connection-baroreflex-to-shock',
    category: 'connection',
    topic: 'Physiology → clinical medicine',
    title: 'How blood pressure sensors support perfusion',
    summary: 'Stretch-sensitive receptors connect vessel pressure to rapid changes in heart rate and vascular tone.',
    basicIdea: 'Baroreceptors in the carotid sinus and aortic arch send signals to the brainstem as arterial stretch changes. Autonomic output then adjusts heart rate, contractility and vascular tone.',
    whyItMatters: 'This reflex is one part of short-term blood-pressure control. In haemorrhage or severe dehydration, it helps explain compensatory tachycardia and vasoconstriction; it is not the only mechanism determining a patient’s perfusion.',
    provenance: SUPPLEMENTAL_REVIEWED,
    sources: [{ title: 'Physiology, Baroreceptors — StatPearls, NCBI Bookshelf', url: 'https://www.ncbi.nlm.nih.gov/books/NBK538172/' }],
    publishedAt: '2026-10-05',
    featured: false,
    tags: ['physiology', 'cardiovascular', 'clinical reasoning'],
    connectionSteps: [
      { label: 'Anatomy', detail: 'Stretch receptors lie in the carotid sinus and aortic arch.' },
      { label: 'Signal', detail: 'Afferent activity reaches brainstem cardiovascular centres.' },
      { label: 'Response', detail: 'Autonomic output changes cardiac and vascular activity.' },
      { label: 'Clinical link', detail: 'The reflex contributes to compensation when circulating pressure falls.' },
    ],
  },

  // ---------- Emerging research: primary, cited, and deliberately qualified ----------
  {
    id: 'research-soul-oral-semaglutide',
    category: 'research',
    topic: 'Endocrinology · cardiology',
    title: 'Oral semaglutide and cardiovascular outcomes in high-risk type 2 diabetes',
    summary: 'In the SOUL randomized trial, oral semaglutide lowered the rate of major cardiovascular events in a specific high-risk population.',
    basicIdea: 'This double-blind, placebo-controlled outcome trial randomized 9,650 adults aged 50 or older with type 2 diabetes and established atherosclerotic cardiovascular disease, chronic kidney disease, or both. Over a median 49.5 months, the primary composite occurred in 12.0% of the semaglutide group and 13.8% of the placebo group (hazard ratio 0.86; 95% CI 0.77–0.96).',
    whyItMatters: 'The trial connects incretin pharmacology with a patient-important cardiovascular outcome and offers a useful example of how absolute event rates and a composite endpoint are reported.',
    provenance: { status: 'reviewed', note: 'Supplementary summary of a peer-reviewed randomized trial. Not a treatment recommendation and not course material.' },
    sources: [{ title: 'McGuire et al. New England Journal of Medicine (2025), DOI: 10.1056/NEJMoa2501006', url: 'https://www.nejm.org/doi/10.1056/NEJMoa2501006' }],
    publishedAt: '2025-03-29',
    featured: false,
    tags: ['clinical trial', 'randomized', 'type 2 diabetes', 'cardiovascular outcomes'],
    research: {
      evidenceType: 'Double-blind, placebo-controlled randomized outcome trial',
      whatWeKnow: 'The primary major adverse cardiovascular event composite was less frequent with oral semaglutide in the trial population. Confirmatory kidney outcomes did not differ significantly between groups.',
      whatRemainsUncertain: 'These results do not establish the same benefit for people outside the studied high-risk type 2 diabetes population, nor do they answer every question about long-term comparative effectiveness or individual treatment choice.',
    },
  },
  {
    id: 'research-ad-biomarkers-community',
    category: 'research',
    topic: 'Neurology · biomarkers',
    title: 'Blood biomarkers and progression through cognitive decline',
    summary: 'A long-running Swedish community cohort found associations between several blood biomarkers and later progression from mild cognitive impairment.',
    basicIdea: 'Researchers followed 2,148 dementia-free people from a Swedish population cohort for up to 16 years. Baseline p-tau217, p-tau181, neurofilament light and other biomarkers were associated with aspects of progression between cognitive states; the strongest reported associations for progression from mild cognitive impairment involved neurofilament light and p-tau217.',
    whyItMatters: 'It shows how a biomarker can be evaluated against longitudinal clinical outcomes, while also illustrating why an association in a cohort is not the same as a validated screening test or proof of causation.',
    provenance: { status: 'reviewed', note: 'Supplementary summary of an observational cohort study. Not a diagnostic guide and not course material.' },
    sources: [{ title: 'Valletta et al. Nature Communications (2025), article 10412', url: 'https://www.nature.com/articles/s41467-025-66728-2' }],
    publishedAt: '2025-11-23',
    featured: false,
    tags: ['observational cohort', 'biomarkers', 'Alzheimer disease'],
    research: {
      evidenceType: 'Prospective population cohort; observational associations',
      whatWeKnow: 'Several baseline blood biomarker levels were associated with faster transitions from mild cognitive impairment to dementia in this cohort.',
      whatRemainsUncertain: 'The findings do not establish causality or show that a biomarker alone can screen or diagnose an individual. Performance and usefulness may differ across populations and clinical settings.',
    },
  },

  // ---------- GRATEAPEX features (all exist in the app today) ----------
  {
    id: 'grateapex-friends',
    category: 'grateapex',
    topic: 'Social',
    title: 'Friends',
    summary: 'See your friends and friend requests in one place.',
    basicIdea:
      'Find classmates by username, manage friend requests, and follow shared learning activity from the Connect area.',
    provenance: FEATURE,
    sources: [],
    publishedAt: '2026-09-25',
    featured: false,
    tags: ['social', 'friends'],
    action: { label: 'Open Friends', href: '/social/friends' },
  },
  {
    id: 'grateapex-progress',
    category: 'grateapex',
    topic: 'Progress',
    title: 'Track your level and XP',
    summary: 'See how close you are to your next level.',
    basicIdea:
      'Completing lessons and lesson quizzes earns XP. My Progress shows your current level, how much XP you need for the next one, your streak and your progress in each subject.',
    provenance: FEATURE,
    sources: [],
    publishedAt: '2026-09-25',
    featured: false,
    tags: ['progress', 'xp', 'levels'],
    action: { label: 'Open My Progress', href: '/progress' },
  },
  {
    id: 'grateapex-practice-wrong',
    category: 'grateapex',
    topic: 'Quizzes',
    title: 'Practise your wrong answers',
    summary: 'After a quiz, focus only on the questions you missed.',
    basicIdea:
      'When you finish a lesson quiz, the Results page shows which concepts need improvement. Choose Practise Wrong Answers to retry only the questions you got wrong, or tap a weak concept to go back to its lesson.',
    provenance: FEATURE,
    sources: [],
    publishedAt: '2026-09-01',
    featured: false,
    tags: ['quizzes', 'practice'],
  },
  {
    id: 'grateapex-lesson-quizzes',
    category: 'grateapex',
    topic: 'Learn',
    title: 'Lesson quizzes',
    summary: 'Check your understanding with a short quiz after each lesson.',
    basicIdea:
      'Each lesson has a short quiz. Choose instant feedback to see answers as you go, or submit at the end. Your Results page gives your score, a learning remark and the concepts to review.',
    provenance: FEATURE,
    sources: [],
    publishedAt: '2026-09-01',
    featured: false,
    tags: ['learn', 'quizzes'],
    action: { label: 'Go to Learn', href: '/learn' },
  },
  {
    id: 'grateapex-reinforcement-calendar',
    category: 'grateapex',
    topic: 'Review',
    title: 'The reinforcement calendar',
    summary: 'See exactly when each concept comes back for review.',
    basicIdea:
      'Every concept you learn is scheduled to return just before you are likely to forget it. The calendar on Home shows what is due each day, what is overdue, which concepts need work, and the reviews you have already done. Open a day to see its concepts and how close each one is to mastery.',
    provenance: FEATURE,
    sources: [],
    publishedAt: '2026-10-03',
    featured: true,
    tags: ['review', 'spaced-repetition', 'calendar'],
    action: { label: 'Open Home', href: '/' },
  },
  {
    id: 'grateapex-avatars',
    category: 'grateapex',
    topic: 'Profile',
    title: 'Choose your avatar',
    summary: 'Pick an illustrated avatar or upload your own photo.',
    basicIdea:
      'Open your Profile and tap your avatar. Choose one of the illustrated male or female avatars, upload a photo of your own, or keep your initials. Your choice is saved to your account.',
    provenance: FEATURE,
    sources: [],
    publishedAt: '2026-10-03',
    featured: false,
    tags: ['profile', 'avatar'],
    action: { label: 'Open Profile', href: '/profile' },
  },
];

const announcements: readonly ExploreAnnouncement[] = [
  { id: 'explore-discovery-restored', title: 'Medical discovery returns to Explore', summary: 'Explore now brings concepts, mechanism-to-clinic connections and carefully qualified research summaries alongside the GrAteApex Hub feature guide.', publishedAt: '2026-10-05', status: 'preview' },
  { id: 'community-foundations', title: 'Social learning foundations', summary: 'Posts, groups and friend messaging now share the GrAteApex Hub community data model. Planning and text-first conference work is joining that foundation.', publishedAt: '2026-10-05', status: 'preview' },
];

export const EXPLORE_GUIDE: readonly ExploreGuideEntry[] = [
  { title: 'Home', detail: 'Your next learning action, progress and a social view of classmates.', status: 'available' },
  { title: 'Learn', detail: 'Follow the course structure, study lessons, answer quizzes and revisit concepts through spaced review.', status: 'available' },
  { title: 'Connect', detail: 'Find classmates, manage friend requests, use study groups, text-first conferences, messages and the friend feed. Live voice calls are a separate planned feature.', status: 'available' },
  { title: 'Profile', detail: 'Show your name and avatar alongside your learning identity and achievements.', status: 'available' },
  { title: 'Settings', detail: 'Choose your theme, text size, web zoom, navigation, notification preferences and privacy choices. These controls are available in the app.', status: 'available' },
  { title: 'XP and ranks', detail: 'Earn XP from learning tasks and follow your progress through the rank ladder.', status: 'available' },
  { title: 'Learning power-ups', detail: 'Earn XP boosts from completed lessons, quizzes, streak milestones and one successful app share per day. The strongest stored boost applies to your next lesson or quiz.', status: 'available' },
  { title: 'Install and share the app', detail: 'Install GrAteApex Hub from a mobile or desktop browser and share the app with classmates from Settings.', status: 'available' },
  { title: 'Leagues', detail: 'See weekly XP standings against learners at your lifetime-XP rank. The top and bottom zones use the current league rules.', status: 'available' },
  { title: 'Learning streak', detail: 'Track consecutive days with a meaningful learning activity.', status: 'available' },
  { title: 'Friend streaks, freezes and restores', detail: 'View friends’ streaks, earn a freeze by completing the weekly five-lesson challenge, and automatically use one to protect a single missed day. Recover a lapsed streak for 100 Apex Coins.', status: 'available' },
  { title: 'Weekly challenges', detail: 'Complete five lessons in a calendar week to earn one streak freeze. Up to two freezes can be stored.', status: 'available' },
  { title: 'Friend battles', detail: 'Invite a friend to a seven-day topic battle. Server-recorded learning XP determines the result.', status: 'available' },
  { title: 'Study groups and discussions', detail: 'Create groups, invite friends and hold text discussions with group members.', status: 'available' },
  { title: 'Messages', detail: 'Send text messages to accepted friends. Private conversation membership controls access.', status: 'available' },
  { title: 'Table Conferences', detail: 'Schedule a text-first study session, invite friends, join or leave, and discuss the session topic. Voice calls are not part of this feature.', status: 'available' },
  { title: 'Live voice calls', detail: 'Planned friend and group study calls using LiveKit. Call rooms, invitations and secure server tokens still need to be built.', status: 'coming-soon' },
  { title: 'Study Plans', detail: 'Pick published topics and follow a generated lesson path. Plans are saved with your account.', status: 'available' },
  { title: 'Timetable', detail: 'Add, edit and remove private recurring class or study blocks. Your timetable is saved with your account.', status: 'available' },
  { title: 'Goals', detail: 'Create lesson, XP or learning streak targets with progress and optional deadlines. Goal progress updates from learning activity.', status: 'available' },
  { title: 'Notifications', detail: 'Choose event preferences and allow device alerts while the installed web app is in the background.', status: 'available' },
  { title: 'Posts, reactions, comments and reshares', detail: 'Share what is on your mind, upload photos or videos, mention friends by @username, react, comment, reshare and report content.', status: 'available' },
  { title: 'Apex Challenge', detail: 'Take a timed challenge across a course and compare it with your own best score.', status: 'available' },
  { title: 'Past Question Bank', detail: 'A home for verified past-question material. No question content is published yet.', status: 'coming-soon' },
  { title: 'Widgets and personalization', detail: 'Responsive in-app cards and profile/theme choices are available; native home-screen widgets are not.', status: 'limited' },
];

// Every Explore item (read-only), for screens that list or derive from them.
export function getExploreItems(): readonly ExploreItem[] {
  return exploreItems;
}

// Items published within this many days show a "New" marker.
const NEW_FOR_DAYS = 14;

export function getFeaturedItem(): ExploreItem | undefined {
  return exploreItems.find((item) => item.featured);
}

// Items in a category, excluding the featured item (shown separately).
export function getItemsByCategory(category: ExploreCategory): ExploreItem[] {
  return exploreItems.filter(
    (item) => item.category === category && !item.featured
  );
}

export function getExploreItem(id: string | undefined): ExploreItem | undefined {
  return exploreItems.find((item) => item.id === id);
}

export function getExploreAnnouncements(): readonly ExploreAnnouncement[] {
  return announcements;
}

// "New" highlights recently added GRATEAPEX features only.
export function isNewItem(item: ExploreItem, now: Date = new Date()) {
  if (item.category !== 'grateapex') {
    return false;
  }

  const published = new Date(`${item.publishedAt}T00:00:00`);

  if (Number.isNaN(published.getTime())) {
    return false;
  }

  const ageInDays = (now.getTime() - published.getTime()) / (24 * 60 * 60 * 1000);

  return ageInDays >= 0 && ageInDays <= NEW_FOR_DAYS;
}

export function getCategoryLabel(category: ExploreCategory) {
  switch (category) {
    case 'concept':
      return 'Concepts & Connections';
    case 'research':
      return 'Research & Emerging Science';
    case 'connection':
      return 'Connections';
    default:
      return 'GrAteApex Hub';
  }
}
