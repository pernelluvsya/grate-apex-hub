#!/usr/bin/env python3
"""Adds the guides' extras (mnemonics, key facts, step-by-step) to each lesson JSON.

Usage: python3 scripts/extract_extras.py <decoded_guides_dir> <content_dir>

Flashcards, the glossary and the quick-recall check were never stored data in the old guides:
the page built them from the term boxes. The app does the same from the lesson's own term blocks.

The old guides were made from a template, so some extras were copied into guides they don't belong to
(anatomy guides carry psychology mnemonics, entomology guides repeat each other's fact sheets).
Those copies are left out here.
"""
import re, sys, os, json, glob, html, hashlib
from bs4 import BeautifulSoup, NavigableString, Tag

src, content = sys.argv[1], sys.argv[2]

def esc(s): return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
def escq(s): return esc(s).replace('"', "&quot;")
def norm(s): return re.sub(r"[ \t\r\n ]+", " ", s)
def inline(node):
    out = []
    for ch in node.children:
        if isinstance(ch, NavigableString): out.append(esc(norm(str(ch))))
        elif isinstance(ch, Tag):
            n, cl = ch.name, ch.get("class", [])
            if n in ("b", "strong"): out.append("<b>" + inline(ch) + "</b>")
            elif n in ("i", "em"): out.append("<i>" + inline(ch) + "</i>")
            elif n in ("sub", "sup"): out.append(f"<{n}>" + inline(ch) + f"</{n}>")
            elif "term" in cl and ch.find(class_="tip"):
                tip = ch.find(class_="tip"); d = norm(tip.get_text()).strip(); tip.extract()
                out.append(f'<term d="{escq(d)}">' + inline(ch) + "</term>")
            elif n == "br": out.append("\n")
            else: out.append(inline(ch))
    return re.sub(r" *\n *", "\n", "".join(out)).strip()

def groups(box, line_cls):
    """<h4>Title</h4><div class=line_cls>..</div>... -> [{h, lines}]"""
    out, cur = [], None
    for el in box.find_all(["h4", "div", "p"], recursive=False):
        if el.name == "h4": cur = {"h": inline(el), "lines": []}; out.append(cur)
        elif line_cls in el.get("class", []):
            if cur is None: cur = {"h": "", "lines": []}; out.append(cur)
            t = inline(el)
            if t: cur["lines"].append(t)
    return [g for g in out if g["lines"]]

def sig(box): return hashlib.md5(re.sub(r"\s+", "", box.get_text()).encode()).hexdigest()

by_course = {}
for f in sorted(glob.glob(content + "/lessons/*.json")):
    L = json.load(open(f)); by_course.setdefault(L["meta"]["course"], []).append((f, L))

# guide file for each lesson: the converter did not keep it, so match by the order it used
sys.path.insert(0, os.path.dirname(__file__))
ORDER = {
    "biochemistry": ["GUIDE_HTML_B64", "GUIDE_E_HTML_B64", "GUIDE3_HTML_B64", "GUIDE4_HTML_B64", "GUIDE5_HTML_B64", "GUIDE6_HTML_B64", "GUIDE7_HTML_B64", "GUIDEGLY_HTML_B64", "GUIDEETC_HTML_B64", "GUIDEBO_HTML_B64"],
    "entomology": [f"GUIDE_TOPIC{i}_B64" for i in range(1, 11)],
}
count = {"mnemonics": 0, "facts": 0, "steps": 0}
for course, items in by_course.items():
    items.sort(key=lambda x: x[1]["meta"]["order"])
    names = ORDER.get(course) or sorted(os.path.basename(p).split("__")[1][:-5] for p in glob.glob(f"{src}/{course}__*GUIDE*.html"))
    seen_facts = set()
    for (f, L), name in zip(items, names):
        s = BeautifulSoup(open(f"{src}/{course}__{name}.html", encoding="utf8").read(), "lxml")
        ex = {}
        # Mnemonics: real content for physiology, behavioural, biochemistry. Anatomy's are a psychology leftover.
        if course in ("physiology", "behavioural", "biochemistry"):
            box = s.find(id="mnemonicsList")
            g = groups(box, "mnem-line") if box else []
            if g: ex["mnemonics"] = g
        # Key facts: biochemistry and entomology. Skip a sheet already used by an earlier guide of the same course.
        if course in ("biochemistry", "entomology"):
            box = s.find(id="formulaList")
            if box is not None and box.get_text().strip():
                h = sig(box)
                if h not in seen_facts:
                    seen_facts.add(h)
                    g = groups(box, "formula-line")
                    if g: ex["facts"] = g
        # Step-by-step: biochemistry has its own per-pathway steps.
        if course == "biochemistry":
            t = open(f"{src}/{course}__{name}.html", encoding="utf8").read()
            m = re.search(r"PATHWAY_STEPS = (\[.*?\]);", t, re.S)
            ttl = s.select_one("#pathwayOverlay .fc-title")
            if m:
                steps = json.loads(m.group(1))
                title = re.sub(r"^[^\w]+", "", norm(ttl.get_text()).strip()) if ttl else "Step by step"
                ex["steps"] = {"title": title, "items": [{"t": esc(html.unescape(x["t"])), "d": esc(html.unescape(x["d"]))} for x in steps]}
        # Behavioural: the scientific-method walkthrough, once.
        if course == "behavioural" and L["meta"]["order"] == 1:
            t = open(f"{src}/{course}__{name}.html", encoding="utf8").read()
            m = re.search(r"METHOD_STEPS = (\[.*?\]);", t, re.S)
            if m:
                ex["steps"] = {"title": "The Scientific Method", "items": [{"t": f"{i}. " + esc(x["t"]), "d": esc(x["d"])} for i, x in enumerate(json.loads(m.group(1)), 1)]}
        L["extras"] = ex
        L["meta"]["extras"] = sorted(ex.keys())
        for k in ex: count[k] += 1
        json.dump(L, open(f, "w"), ensure_ascii=False)
        print(L["meta"]["id"], sorted(ex.keys()))
print(count)
