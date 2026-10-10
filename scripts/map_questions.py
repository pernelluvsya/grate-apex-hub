#!/usr/bin/env python3
"""Works out which quiz questions belong to which lesson.

For each course it builds a vocabulary from every lesson (section titles and term names count most),
then gives each question to the lesson whose vocabulary matches it best, if the match is clearly
better than the runner-up. Writes the list of question ids into each lesson's JSON as meta.qids.
The ids use the same fingerprint as the app (src/learning.ts hash), so they line up.
Run from the project root: python3 scripts/map_questions.py
"""
import json, re, math, glob, html, sys
from collections import Counter

STOP = set("the a an of and or in on to for with by from is are was were be as at that this these those it its into their our your you can may not no than then also which what when how why who whom does do did has have had more most such other between within about over under per via vs eg ie only each both all any one two three following true false".split())
def toks(s):
    s = html.unescape(re.sub(r"<[^>]+>", " ", s)).lower()
    return [w for w in re.findall(r"[a-z][a-z0-9\-']{2,}", s) if w not in STOP]

def fnv(s):  # same as hash() in src/learning.ts: FNV-1a over UTF-16 code units, base36
    h = 0x811c9dc5
    b = s.encode("utf-16-le")
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 0x01000193) & 0xffffffff
    n = h; digits = "0123456789abcdefghijklmnopqrstuvwxyz"; out = ""
    while n: out = digits[n % 36] + out; n //= 36
    return out or "0"

def lesson_parts(L):
    parts = []
    def walk(bs):
        for b in bs:
            for k in ("x", "name", "def", "title"):
                if isinstance(b.get(k), str): parts.append((b[k], 3 if k in ("name", "title") else 1))
            for it in b.get("items", []):
                if isinstance(it, str): parts.append((it, 1))
                else: walk(it.get("blocks", []))
            for r in b.get("rows", []): parts.extend((c, 1) for c in r["c"])
            walk(b.get("blocks", []))
    for s in L["sections"]:
        parts.append((s["title"], 4)); walk(s["blocks"])
    parts.append((L["meta"]["title"] + " " + L["meta"].get("sub", ""), 6))
    return parts

TOP, MARGIN = 2.5, 1.3
GENERIC = ("past question", "multiple completion", "best single", "mixed", "assertion", "true or false", "quiz", "predicted", "custom")

ALL = ["anatomy", "behavioural", "biochemistry", "entomology", "physiology", "biolchem", "medgen", "compapp", "algebra", "stats", "commskills", "bmc", "cellstruct"]

def run(root, verbose=True, courses=None):
    total = 0
    for course in (courses or ALL):
        data = json.load(open(f"{root}/src/data/courses/{course}.json"))
        files = sorted(glob.glob(f"{root}/content/lessons/{course}-*.json"))
        lessons = [json.load(open(f)) for f in files]
        n = len(lessons)
        tf, df = [], Counter()
        for L in lessons:
            c = Counter()
            for txt, w in lesson_parts(L):
                for t in toks(txt): c[t] += w
            tf.append(c); df.update(set(c))
        title_toks = [set(toks(L["meta"]["title"] + " " + L["meta"].get("sub", ""))) for L in lessons]

        def scores(q):
            qt = Counter(toks(q["q"] + " " + " ".join(q["o"]) + " " + (q.get("e") or "")))
            sc = []
            for c in tf:
                v = 0.0
                for t, k in qt.items():
                    if t in c: v += math.log((n + 1) / df[t]) * min(1, c[t] / 5) * min(k, 2)
                sc.append(v)
            # the question's own topic label is a strong hint when it names the lesson
            tp = (q.get("t") or "").lower()
            if tp and not any(g in tp for g in GENERIC):
                tt = set(toks(tp))
                for i, T in enumerate(title_toks):
                    if tt and tt & T: sc[i] += 4 * len(tt & T) / len(tt)
            return sc

        allq = [(st["name"], q, scores(q)) for st in data["sets"] for q in st["questions"]]
        # a set that is clearly about one lesson (e.g. "Quiz 5" = fructose) lifts its own questions
        prior = {}
        for sname in {x[0] for x in allq}:
            votes = Counter()
            for nm, q, sc in allq:
                if nm != sname: continue
                o = sorted(range(n), key=lambda i: -sc[i])
                if sc[o[0]] >= TOP and sc[o[0]] >= MARGIN * (sc[o[1]] if n > 1 else 0): votes[o[0]] += 1
            tot = sum(votes.values())
            if tot >= 8:
                best, cnt = votes.most_common(1)[0]
                if cnt / tot >= 0.55 and not any(g in sname.lower() for g in ("past", "multiple", "mixed", "predicted", "custom", "best single")): prior[sname] = best
        assigned = [[] for _ in lessons]; none = 0
        for nm, q, sc in allq:
            if nm in prior: sc[prior[nm]] += 5
            o = sorted(range(n), key=lambda i: -sc[i])
            top = sc[o[0]]; sec = sc[o[1]] if n > 1 else 0
            if top >= TOP and top >= MARGIN * sec:
                assigned[o[0]].append((top, fnv(course + "|" + q["q"] + "|" + "|".join(q["o"]))))
            else: none += 1
        for L, f, a in zip(lessons, files, assigned):
            a.sort(reverse=True)
            L["meta"]["qids"] = [x[1] for x in a[:150]]
            L["meta"]["qcount"] = len(a)
            json.dump(L, open(f, "w"), ensure_ascii=False)
        total += len(allq) - none
        if verbose: print(course, len(allq), "questions;", none, "unmatched;", [len(a) for a in assigned], "set priors:", {k: v + 1 for k, v in prior.items()})
    return total

if __name__ == "__main__":
    run(sys.argv[1] if len(sys.argv) > 1 else ".", courses=sys.argv[2:] or None)
