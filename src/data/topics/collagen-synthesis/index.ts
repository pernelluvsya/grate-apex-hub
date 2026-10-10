// Biochemistry → Collagen and Elastin, assembled from its parts:
//   sources.ts         — slide references, concepts, discrepancies, diagrams
//   lessons.ts         — the six lessons (reading layer)
//   interactive.ts     — each lesson's interactive layer + reading extras
//   questions.ts       — the topic question bank (quiz layer); lessons 4–6
//                        are in more-questions.ts
import { contentTopics } from '@/data/content-catalog';
import { buildTopic } from '@/data/topics/build';
import { lessons } from '@/data/topics/collagen-synthesis/lessons';
import { questions } from '@/data/topics/collagen-synthesis/questions';
import {
  concepts,
  diagrams,
  discrepancies,
  TOPIC_ID,
} from '@/data/topics/collagen-synthesis/sources';

export const collagenAndElastin = buildTopic({
  id: TOPIC_ID,
  subject: 'biochemistry',
  courseId: 'biochemistry-lectures',
  title: 'Collagen and Elastin',
  description:
    'Structural proteins and wound healing, collagen types and the triple helix, hydroxylation and cross-linking, collagen diseases (scurvy, Ehlers-Danlos, lathyrism, osteogenesis imperfecta) and elastin.',
  emoji: '🧵',
  source: 'Lecture: Structural Proteins — Collagen, Elastin — Edwin F. Laing',
  sourceFileIds:
    contentTopics.find((topic) => topic.id === TOPIC_ID)?.sourceFileIds ?? [],
  contentVersion: 1,
  concepts,
  lessons,
  questions,
  discrepancies,
  diagrams,
});
