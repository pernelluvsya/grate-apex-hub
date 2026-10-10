// Biochemistry → Endocrine System: Hormones, assembled from its parts:
//   sources.ts      — slide references, concepts, discrepancies, diagrams
//   lessons.ts      — the three lessons (reading layer)
//   interactive.ts  — each lesson's interactive layer + reading extras
//   questions.ts    — the topic question bank (quiz layer)
import { contentTopics } from '@/data/content-catalog';
import { buildTopic } from '@/data/topics/build';
import { lessons } from '@/data/topics/hormones-endocrine-biochemistry/lessons';
import { questions } from '@/data/topics/hormones-endocrine-biochemistry/questions';
import {
  concepts,
  diagrams,
  discrepancies,
  TOPIC_ID,
} from '@/data/topics/hormones-endocrine-biochemistry/sources';

export const hormones = buildTopic({
  id: TOPIC_ID,
  subject: 'biochemistry',
  courseId: 'biochemistry-lectures',
  title: 'Endocrine System: Hormones',
  description:
    'The endocrine glands, hormone classes, second messengers (cAMP, DAG, IP₃, Ca²⁺), steroid hormones and the HPA axis.',
  emoji: '📡',
  source: 'Lecture: Hormones — Prof. FAY',
  sourceFileIds:
    contentTopics.find((topic) => topic.id === TOPIC_ID)?.sourceFileIds ?? [],
  contentVersion: 1,
  concepts,
  lessons,
  questions,
  discrepancies,
  diagrams,
});
