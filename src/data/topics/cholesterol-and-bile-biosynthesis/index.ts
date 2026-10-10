// Biochemistry → Cholesterol and Bile Biosynthesis, assembled from its parts:
//   sources.ts      — slide references, concepts, discrepancies, diagrams
//   lessons.ts      — the five lessons (reading layer)
//   interactive.ts  — each lesson's interactive layer + reading extras
//   questions.ts    — the topic question bank (quiz layer)
import { contentTopics } from '@/data/content-catalog';
import { buildTopic } from '@/data/topics/build';
import { lessons } from '@/data/topics/cholesterol-and-bile-biosynthesis/lessons';
import { questions } from '@/data/topics/cholesterol-and-bile-biosynthesis/questions';
import {
  concepts,
  diagrams,
  discrepancies,
  TOPIC_ID,
} from '@/data/topics/cholesterol-and-bile-biosynthesis/sources';

export const cholesterolAndBileBiosynthesis = buildTopic({
  id: TOPIC_ID,
  subject: 'biochemistry',
  courseId: 'biochemistry-lectures',
  title: 'Cholesterol and Bile Biosynthesis',
  description:
    'How cells build cholesterol from acetyl-CoA, how HMG-CoA reductase is regulated, and how the liver turns cholesterol into bile acids.',
  emoji: '🧈',
  source: 'Lecture: Cholesterol Biosynthesis — R A Ngala (slides and pathway figures)',
  sourceFileIds:
    contentTopics.find((topic) => topic.id === TOPIC_ID)?.sourceFileIds ?? [],
  contentVersion: 1,
  concepts,
  lessons,
  questions,
  discrepancies,
  diagrams,
});
