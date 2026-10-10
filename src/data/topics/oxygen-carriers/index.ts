// Biochemistry → Oxygen Carriers: Myoglobin and Haemoglobin, assembled from
// its parts:
//   sources.ts      — slide references, concepts, discrepancies, diagrams
//   lessons.ts      — the four lessons (reading layer)
//   interactive.ts  — each lesson's interactive layer + reading extras
//   questions.ts    — the topic question bank (quiz layer)
import { contentTopics } from '@/data/content-catalog';
import { buildTopic } from '@/data/topics/build';
import { lessons } from '@/data/topics/oxygen-carriers/lessons';
import { questions } from '@/data/topics/oxygen-carriers/questions';
import {
  concepts,
  diagrams,
  discrepancies,
  TOPIC_ID,
} from '@/data/topics/oxygen-carriers/sources';

export const oxygenCarriers = buildTopic({
  id: TOPIC_ID,
  subject: 'biochemistry',
  courseId: 'biochemistry-lectures',
  title: 'Oxygen Carriers: Myoglobin and Haemoglobin',
  description:
    'How myoglobin and haemoglobin hold haem, why the protein matters, co-operative binding, the Bohr effect, 2,3-BPG and fetal haemoglobin.',
  emoji: '💨',
  source: 'Lecture: Oxygen Carriers: Myoglobin and Haemoglobin — Edwin F. Laing',
  sourceFileIds:
    contentTopics.find((topic) => topic.id === TOPIC_ID)?.sourceFileIds ?? [],
  contentVersion: 1,
  concepts,
  lessons,
  questions,
  discrepancies,
  diagrams,
});
