// Biochemistry → Fatty Acid Biosynthesis, assembled from its parts:
//   sources.ts   — slide references, concepts, discrepancies, diagrams
//   lessons.ts       — the eight lessons (reading layer)
//   interactive.ts   — each lesson's interactive layer + reading extras
//   questions.ts, more-questions.ts — the topic question bank (quiz layer)
import { contentTopics } from '@/data/content-catalog';
import { buildTopic } from '@/data/topics/build';
import { lessons } from '@/data/topics/fatty-acid-biosynthesis/lessons';
import { moreQuestions } from '@/data/topics/fatty-acid-biosynthesis/more-questions';
import { questions } from '@/data/topics/fatty-acid-biosynthesis/questions';
import {
  concepts,
  diagrams,
  discrepancies,
  TOPIC_ID,
} from '@/data/topics/fatty-acid-biosynthesis/sources';

export const fattyAcidBiosynthesis = buildTopic({
  id: TOPIC_ID,
  subject: 'biochemistry',
  courseId: 'biochemistry-lectures',
  title: 'Fatty Acid Biosynthesis',
  description:
    'How the cell builds fatty acids from acetyl-CoA — from malonyl-CoA to palmitate, elongation, and the Pyruvate–Malate cycle.',
  emoji: '🔗',
  source: 'Lecture: Fatty Acid Metabolism — R A Ngala (both slide decks and the PDF)',
  sourceFileIds:
    contentTopics.find((topic) => topic.id === TOPIC_ID)?.sourceFileIds ?? [],
  contentVersion: 2,
  concepts,
  lessons,
  questions: [...questions, ...moreQuestions],
  discrepancies,
  diagrams,
});
