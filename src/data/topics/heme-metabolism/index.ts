// Biochemistry → Haem and Haem Metabolism, assembled from its parts:
//   sources.ts      — slide references, concepts, discrepancies, diagrams
//   lessons.ts      — the seven lessons (reading layer)
//   interactive.ts  — each lesson's interactive layer + reading extras
//   questions.ts    — the topic question bank (quiz layer)
import { contentTopics } from '@/data/content-catalog';
import { buildTopic } from '@/data/topics/build';
import { lessons } from '@/data/topics/heme-metabolism/lessons';
import { questions } from '@/data/topics/heme-metabolism/questions';
import {
  concepts,
  diagrams,
  discrepancies,
  TOPIC_ID,
} from '@/data/topics/heme-metabolism/sources';

export const hemeMetabolism = buildTopic({
  id: TOPIC_ID,
  subject: 'biochemistry',
  courseId: 'biochemistry-lectures',
  title: 'Haem and Haem Metabolism',
  description:
    'Porphyrins and haem, the eight steps of haem synthesis and their control, porphyrias and lead poisoning, and haem breakdown to bilirubin and jaundice.',
  emoji: '🔴',
  source: 'Lectures: The Porphyrins, Haem and Haem Synthesis; Haem Catabolism — Edwin F. Laing',
  sourceFileIds:
    contentTopics.find((topic) => topic.id === TOPIC_ID)?.sourceFileIds ?? [],
  contentVersion: 1,
  concepts,
  lessons,
  questions,
  discrepancies,
  diagrams,
});
