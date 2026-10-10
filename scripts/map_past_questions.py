#!/usr/bin/env python3
"""Maps every PAST question of a course to its closest lesson, for the "Past questions only" option
in the Custom Quiz Builder. Unlike map_questions.py (which only keeps clear matches, capped at 150 per
lesson, and is stored in Firestore lesson metadata), this gives every past question its best lesson, so
choosing a topic never silently drops most of the past papers. The result is a static file shipped with
the app (src/data/pastTopics.json), so no Firestore re-seed is needed.
Run from the project root: python3 scripts/map_past_questions.py [course ...]
"""
import json, math, glob, sys
from collections import Counter
sys.path.insert(0, __import__("os").path.dirname(__file__))
from map_questions import toks, fnv, lesson_parts, GENERIC

import re
PREDICTED = re.compile(r"^predicted", re.I)  # "Predicted Paper 1" sets count as past questions (same rule as isPredictedSet in src/learning.ts)
MIN_SCORE = 1.0  # below this the question is not tied to any lesson (it still shows under "All topics")

def run(root, courses):
    out_path = f"{root}/src/data/pastTopics.json"
    try: out = json.load(open(out_path))
    except Exception: out = {}
    for course in courses:
        data = json.load(open(f"{root}/src/data/courses/{course}.json"))
        files = sorted(glob.glob(f"{root}/content/lessons/{course}-*.json"))
        lessons = [json.load(open(f)) for f in files]
        n = len(lessons)
        if not n: continue
        tf, df = [], Counter()
        for L in lessons:
            c = Counter()
            for txt, w in lesson_parts(L):
                for t in toks(txt): c[t] += w
            tf.append(c); df.update(set(c))
        title_toks = [set(toks(L["meta"]["title"] + " " + L["meta"].get("sub", ""))) for L in lessons]
        mapping, unmatched, seen = {}, 0, set()
        for st in data["sets"]:
            for q in st["questions"]:
                if not q.get("p") and not PREDICTED.match(st["name"].strip()): continue
                qid = fnv(course + "|" + q["q"] + "|" + "|".join(q["o"]))
                if qid in seen: continue
                seen.add(qid)
                qt = Counter(toks(q["q"] + " " + " ".join(q["o"]) + " " + (q.get("e") or "")))
                sc = []
                for c in tf:
                    v = 0.0
                    for t, k in qt.items():
                        if t in c: v += math.log((n + 1) / df[t]) * min(1, c[t] / 5) * min(k, 2)
                    sc.append(v)
                tp = (q.get("t") or "").lower()
                if tp and not any(g in tp for g in GENERIC):
                    tt = set(toks(tp))
                    for i, T in enumerate(title_toks):
                        if tt and tt & T: sc[i] += 4 * len(tt & T) / len(tt)
                best = max(range(n), key=lambda i: sc[i])
                if sc[best] >= MIN_SCORE: mapping[qid] = lessons[best]["meta"]["id"]
                else: unmatched += 1
        out[course] = mapping
        per = Counter(mapping.values())
        print(course, len(seen), "past questions;", unmatched, "unmatched;", dict(sorted(per.items())))
    json.dump(out, open(out_path, "w"), separators=(",", ":"))

if __name__ == "__main__":
    run(".", sys.argv[1:] or ["anatomy"])
