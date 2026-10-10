// Registry of every PUBLISHED topic (lessons + question bank).
//
// To publish a topic (any subject): build it in data/topics/<topic>/ with
// data/topics/build.ts, add it below, and set its status to 'published'
// in data/content-catalog.ts. Topics that only have source material stay
// listed in the catalog until then.
import { bloodCoagulation } from '@/data/topics/blood-coagulation-and-fibrinolysis';
import type { BuiltTopic } from '@/data/topics/build';
import { cholesterolAndBileBiosynthesis } from '@/data/topics/cholesterol-and-bile-biosynthesis';
import { collagenAndElastin } from '@/data/topics/collagen-synthesis';
import { fattyAcidBiosynthesis } from '@/data/topics/fatty-acid-biosynthesis';
import { hemeMetabolism } from '@/data/topics/heme-metabolism';
import { hormones } from '@/data/topics/hormones-endocrine-biochemistry';
import { inbornErrors } from '@/data/topics/inborn-errors-of-metabolism';
import { oxygenCarriers } from '@/data/topics/oxygen-carriers';

export const builtTopics: BuiltTopic[] = [fattyAcidBiosynthesis, cholesterolAndBileBiosynthesis, hemeMetabolism, oxygenCarriers, bloodCoagulation, hormones, inbornErrors, collagenAndElastin];
