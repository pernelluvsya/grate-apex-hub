// Biochemistry → Blood Coagulation and Fibrinolysis, assembled from its parts:
//   sources.ts      — slide references, concepts, discrepancies, diagrams
//   lessons.ts      — the four lessons (reading layer)
//   interactive.ts  — each lesson's interactive layer + reading extras
//   questions.ts    — the topic question bank (quiz layer)
import { contentTopics } from '@/data/content-catalog';
import { buildTopic } from '@/data/topics/build';
import { lessons } from '@/data/topics/blood-coagulation-and-fibrinolysis/lessons';
import { questions } from '@/data/topics/blood-coagulation-and-fibrinolysis/questions';
import {
  concepts,
  diagrams,
  discrepancies,
  TOPIC_ID,
} from '@/data/topics/blood-coagulation-and-fibrinolysis/sources';

export const bloodCoagulation = buildTopic({
  id: TOPIC_ID,
  subject: 'biochemistry',
  courseId: 'biochemistry-lectures',
  title: 'Blood Coagulation and Fibrinolysis',
  description:
    'The clotting cascade, platelets and fibrin, vitamin K and calcium, haemophilia, and how clotting is controlled and clots are dissolved.',
  emoji: '🩸',
  source: 'Lecture: Blood Coagulation and Fibrinolysis — Edwin F. Laing',
  sourceFileIds:
    contentTopics.find((topic) => topic.id === TOPIC_ID)?.sourceFileIds ?? [],
  contentVersion: 1,
  concepts,
  lessons,
  questions,
  discrepancies,
  diagrams,
});
