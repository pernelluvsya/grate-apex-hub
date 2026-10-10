// Biochemistry → Inborn Errors of Metabolism, assembled from its parts:
//   sources.ts      — page references, concepts, discrepancies, diagrams
//   lessons.ts      — the six lessons (reading layer)
//   interactive.ts  — each lesson's interactive layer + reading extras
//   questions.ts    — the topic question bank (quiz layer)
import { contentTopics } from '@/data/content-catalog';
import { buildTopic } from '@/data/topics/build';
import { lessons } from '@/data/topics/inborn-errors-of-metabolism/lessons';
import { questions } from '@/data/topics/inborn-errors-of-metabolism/questions';
import {
  concepts,
  diagrams,
  discrepancies,
  TOPIC_ID,
} from '@/data/topics/inborn-errors-of-metabolism/sources';

export const inbornErrors = buildTopic({
  id: TOPIC_ID,
  subject: 'biochemistry',
  courseId: 'biochemistry-lectures',
  title: 'Inborn Errors of Metabolism',
  description:
    'Garrod’s idea of a metabolic block, detection and newborn screening, investigation and management, and inborn errors of enzymes, transporters, structural proteins and receptors.',
  emoji: '🧫',
  source: 'Lecture: Inborn Errors of Metabolism — Samuel Nkansah Darko',
  sourceFileIds:
    contentTopics.find((topic) => topic.id === TOPIC_ID)?.sourceFileIds ?? [],
  contentVersion: 1,
  concepts,
  lessons,
  questions,
  discrepancies,
  diagrams,
});
