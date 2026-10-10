"""Turns the old hub's messy question files into one clean format.
Output per course: {"id","sets":[{"id","name","questions":[{"q","o":[...],"a":int,"e":str,"t":str}]}]}
"""
import json, re, html, sys, collections
SRC = "/home/claude/hub/grate-apex-hub-main/extracted_questions/"
OUT = "/home/claude/app/grateapex/src/data/courses/"

def clean(s):
    if s is None: return ""
    s = str(s)
    s = re.sub(r"</span>\s*<span", "</span>\n<span", s)
    s = re.sub(r"<br\s*/?>", "\n", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s)
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n\s*\n+", "\n", s)
    return s.strip()

def opt_text(o):
    if isinstance(o, dict): return clean(o.get("text") or o.get("t") or o.get("label") or "")
    return clean(o)

def opt_key(o, i):
    return (o.get("key") if isinstance(o, dict) and o.get("key") else chr(65 + i)).upper()

def first(q, *names):
    for n in names:
        if n in q and q[n] not in (None, ""): return q[n]
    return None

def flag(o):
    if not isinstance(o, dict): return None
    for k in ("c", "correct", "isTrue"):
        if k in o: return bool(o[k])
    return None

def norm(q):
    if q.get("image_svg") or q.get("fig"): return None, "image"
    stem = first(q, "q", "prompt", "stem")
    opts = first(q, "options", "opts")
    if stem is None and q.get("assertion"):
        stem = "Assertion: " + clean(q["assertion"]) + "\nReason: " + clean(q.get("reason", ""))
        q = dict(q); q["reason"] = None
    if stem is None or not opts: return None, "incomplete"
    options = [opt_text(o) for o in opts]
    corr = None
    for k in ("correctIndex", "correct_idx", "correct", "ans", "correctLetter"):
        if k in q and q[k] is not None and q[k] != "": corr = q[k]; break
    flags = [flag(o) for o in opts]
    if corr is None and any(f is not None for f in flags):
        idx = [i for i, f in enumerate(flags) if f]
        if len(idx) != 1: return None, "multi-select"
        corr = idx[0]
    if corr is None and q.get("answer") is not None:
        a = clean(q["answer"]).lower()
        m = [i for i, o in enumerate(options) if o.lower() == a]
        if len(m) == 1: corr = m[0]
        elif re.fullmatch(r"[a-z]", a): corr = a.upper()
    if corr is None: return None, "incomplete"
    text = clean(stem)
    items = q.get("items")
    if items:
        rn = ["I","II","III","IV","V","VI"]
        text += "\n" + "\n".join(f"{rn[i]}. {clean(x)}" for i, x in enumerate(items))
    if q.get("reason"):
        text = "Assertion: " + text + "\nReason: " + clean(q["reason"])
    if isinstance(corr, str):
        keys = [opt_key(o, i) for i, o in enumerate(opts)]
        c = corr.strip().upper()
        if c not in keys: return None, "badkey"
        corr = keys.index(c)
    if not isinstance(corr, int) or isinstance(corr, bool) or not (0 <= corr < len(options)): return None, "badindex"
    if len(options) < 2 or any(not o for o in options): return None, "badopts"
    if not text: return None, "incomplete"
    text = re.sub(r"^\s*\d+\s*[\.\)]\s+", "", text)
    expl = clean(first(q, "explain", "explanation", "expl", "exp") or "")
    if not expl and isinstance(opts[corr], dict): expl = clean(opts[corr].get("note", ""))
    return {"q": text, "o": options, "a": corr, "e": expl, "t": clean(first(q, "topic", "section") or "")}, None

def set_name(blob, i):
    b = blob.upper().replace("_HTML", "").replace("_B64", "")
    m = re.search(r"(\d+)$", b)
    n = m.group(1).lstrip("0") if m else ""
    if "PTEST" in b or b.startswith("PT"): return f"Practice Test {n}".strip()
    if "PREDICTED" in b: return f"Predicted Paper {n}".strip()
    if "PASCO" in b or "PASTQ" in b or b.startswith("PQ") or "_PQ" in b: return f"Past Questions {n}".strip()
    if "TOPIC" in b: return f"Topic Quiz {n}".strip()
    return f"Quiz {n or i+1}"

NAMES = {"biochemistry": "Biochemistry", "physiology": "Physiology", "anatomy": "Anatomy",
         "behavioural": "Behavioural Science", "entomology": "Entomology"}
report = {}
import os
EXTRA = json.load(open(SRC + "extra_past.json")) if os.path.exists(SRC + "extra_past.json") else {}
PAST = re.compile(r"PASCO|PASTQ|^PQ|_PQ")
for cid in NAMES:
    d = json.load(open(SRC + cid + ".json"))
    banks = list(d["banks"]) + [dict(b, past=True) for b in EXTRA.get(cid, [])]  # extras = past papers in layouts the first extraction missed
    sets, skipped, seen = [], collections.Counter(), {}
    for i, b in enumerate(banks):
        qs = []
        label = b.get("name") or ("Past Questions 4 (Passco)" if "PASCO" in b["blob"].upper() else set_name(b["blob"], i))
        is_past = b.get("past") or bool(PAST.search(b["blob"].upper().replace("_HTML", "").replace("_B64", "")))
        for q in b["questions"]:
            n, why = norm(q)
            if why: skipped[why] += 1; continue
            key = (n["q"], tuple(n["o"]))
            if key in seen:  # already kept from another set: just remember which past paper(s) it is in
                if is_past and label not in seen[key].setdefault("p", []): seen[key]["p"].append(label)
                skipped["duplicate"] += 1; continue
            if is_past: n["p"] = [label]
            seen[key] = n; qs.append(n)
        if qs: sets.append({"id": f"s{i+1}", "name": b.get("name") or set_name(b["blob"], i), "questions": qs})
    # make names unique
    cnt = collections.Counter(s["name"] for s in sets); used = collections.Counter()
    for s in sets:
        if cnt[s["name"]] > 1:
            used[s["name"]] += 1; s["name"] += f" ({used[s['name']]})" if s["name"].endswith(("Quiz","Papers","Questions")) else ""
    json.dump({"id": cid, "name": NAMES[cid], "sets": sets}, open(OUT + cid + ".json", "w"), ensure_ascii=False, separators=(",", ":"))
    report[cid] = (sum(len(s["questions"]) for s in sets), len(sets), dict(skipped))
for k, v in report.items(): print(k, "kept", v[0], "in", v[1], "sets; skipped", v[2])
