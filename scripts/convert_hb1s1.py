#!/usr/bin/env python3
"""Turn the old hub's base64 HTML study guides into structured lesson JSON.

Usage: python3 convert_guides.py <decoded_guides_dir> <out_dir>
Input files are named <course>__<name>.html (already base64-decoded).
Output: <out>/lessons.json (meta + content per lesson) and <out>/images/<id>.<ext>
"""
import re, sys, os, json, glob, base64, hashlib, io, html
from bs4 import BeautifulSoup, NavigableString, Tag

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out + "/images", exist_ok=True)
try:
    from PIL import Image
except Exception:
    Image = None

# ---------- inline text -> mini markup: <b> <i> <sub> <sup> <term d="definition"> ----------
def esc(s): return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
def escq(s): return esc(s).replace('"', "&quot;")
def norm(s): return re.sub(r"[ \t\r\n ]+", " ", s)

def inline(node):
    parts = []
    for ch in node.children:
        if isinstance(ch, NavigableString):
            parts.append(esc(norm(str(ch))))
        elif isinstance(ch, Tag):
            n = ch.name; cl = ch.get("class", [])
            if n == "br": parts.append("\n")
            elif n in ("b", "strong"): parts.append("<b>" + inline(ch) + "</b>")
            elif n in ("i", "em"): parts.append("<i>" + inline(ch) + "</i>")
            elif n in ("sub", "sup"): parts.append(f"<{n}>" + inline(ch) + f"</{n}>")
            elif "term" in cl and ch.find(class_="tip"):
                tip = ch.find(class_="tip"); d = norm(tip.get_text()).strip()
                tip.extract()
                parts.append(f'<term d="{escq(d)}">' + inline(ch) + "</term>")
            elif n in ("script", "style", "button", "svg", "img"): pass
            else: parts.append(inline(ch))
    return "".join(parts)

def clean(s):
    s = re.sub(r" *\n *", "\n", s)
    s = re.sub(r"(<(b|i|sub|sup)></\2>)", "", s)
    return s.strip()

# ---------- images ----------
image_files = {}
def save_image(uri, alt):
    m = re.match(r"data:(image/[a-z+]+);base64,(.*)", uri, re.S)
    if not m: return None
    mime, b64 = m.group(1), m.group(2)
    raw = base64.b64decode(b64 + "=" * (-len(b64) % 4))
    h = hashlib.sha1(raw).hexdigest()[:12]
    if h in image_files: return image_files[h]
    ext = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif"}.get(mime, "png")
    data = raw
    if Image and mime in ("image/jpeg", "image/png"):
        try:
            im = Image.open(io.BytesIO(raw)); w, h2 = im.size
            if w > 1100: im = im.resize((1100, round(h2 * 1100 / w)))
            buf = io.BytesIO()
            if mime == "image/jpeg" or (im.mode in ("RGB", "L") and len(raw) > 150000):
                im.convert("RGB").save(buf, "JPEG", quality=82, optimize=True); ext = "jpg"; mime = "image/jpeg"
            else:
                im.save(buf, "PNG", optimize=True)
            if len(buf.getvalue()) < len(raw): data = buf.getvalue()
        except Exception as e: print("img warn", e)
    open(f"{out}/images/{h}.{ext}", "wb").write(data)
    image_files[h] = {"id": h, "ext": ext, "mime": "image/jpeg" if ext == "jpg" else mime, "bytes": len(data)}
    return image_files[h]

# ---------- blocks ----------
SKIP_CLASSES = {"guide-link", "print-btn", "tool-btn", "skip-label", "video-thumb"}
def has_cls(n, *c): return any(x in n.get("class", []) for x in c)

def fig_block(node):
    svg = node if node.name == "svg" else node.find("svg")
    img = node if node.name == "img" else node.find("img")
    cap = node.find("figcaption") if node.name != "svg" else None
    b = {"k": "fig"}
    if svg is not None:
        s = str(svg)
        s = re.sub(r"\s+", " ", s)
        s = s.replace("viewbox", "viewBox").replace("markerheight", "markerHeight").replace("markerwidth", "markerWidth").replace("markerunits", "markerUnits").replace("refx", "refX").replace("refy", "refY")
        b["svg"] = s
    elif img is not None and img.get("src", "").startswith("data:"):
        info = save_image(img["src"], img.get("alt", ""))
        if not info: return None
        b["img"] = info["id"] + "." + info["ext"]
        if not cap and img.get("alt"): b["alt"] = img["alt"]
    else:
        return None
    if cap is not None: b["cap"] = clean(inline(cap))
    return b

def list_items(ul, depth=0):
    items = []
    for li in ul.find_all("li", recursive=False):
        subs = [c for c in li.children if isinstance(c, Tag) and c.name in ("ul", "ol")]
        for s in subs: s.extract()
        t = clean(inline(li))
        if t: items.append(("– " if depth else "") + t)
        for s in subs: items += list_items(s, depth + 1)
    return items

INLINE = ("b", "strong", "i", "em", "span", "sub", "sup", "br", "u", "a", "small", "mark", "code")
BLOCKY = ["p", "ul", "ol", "table", "svg", "img", "h3", "h4", "figure", "div", "section", "h2", "h1"]
def is_inline(ch):
    if isinstance(ch, NavigableString): return True
    if not isinstance(ch, Tag): return False
    if ch.name not in INLINE: return False
    if ch.name == "span" and has_cls(ch, "kicker", "tag", "step-num"): return False
    if ch.name == "a" and ch.find(["h3", "h4", "p", "div"]): return False
    return not ch.find(BLOCKY)

def blocks_of(node):
    out = []
    buf = []
    def flush():
        if not buf: return
        t = clean("".join(buf)); buf.clear()
        if t: out.append({"k": "p", "x": t})
    for ch in node.children:
        if is_inline(ch):
            if isinstance(ch, NavigableString): buf.append(esc(norm(str(ch))))
            elif ch.name == "br": buf.append("\n")
            else: buf.append(inline_wrap(ch))
            continue
        flush()
        if not isinstance(ch, Tag): continue
        n = ch.name; cl = ch.get("class", [])
        if has_cls(ch, "kicker"): continue
        if n in ("script", "style", "button", "nav", "input", "textarea", "header", "footer", "noscript") or any(c in SKIP_CLASSES for c in cl): continue
        if n in ("h1", "h2"): continue  # titles handled by the section
        if n in ("h3", "h4", "h5"):
            t = clean(inline(ch))
            if t: out.append({"k": "h", "x": t, "l": 3 if n == "h3" else 4})
        elif n == "p":
            t = clean(inline(ch))
            if t:
                b = {"k": "p", "x": t}
                if has_cls(ch, "lede", "section-lead"): b["lede"] = 1
                out.append(b)
        elif n in ("ul", "ol"):
            it = list_items(ch)
            if it:
                b = {"k": "ul", "items": it}
                if n == "ol": b["ol"] = 1
                out.append(b)
        elif n == "table":
            rows = ch.find_all("tr"); head = []; body = []
            for r in rows:
                cells = r.find_all(["th", "td"])
                if r.find("th") and not head and not r.find("td"): head = [clean(inline(c)) for c in cells]
                else: body.append({"c": [clean(inline(c)) for c in cells]})
            out.append({"k": "table", "head": head, "rows": body})
        elif n in ("figure", "svg", "img") or has_cls(ch, "gapx-figure", "guide-figure"):
            f = fig_block(ch)
            if f: out.append(f)
        elif has_cls(ch, "term-box"):
            nm = ch.find(class_="term-name"); df = ch.find(class_="term-def")
            if nm and df: out.append({"k": "term", "name": clean(inline(nm)), "def": clean(inline(df))})
        elif has_cls(ch, "step-card"):
            num = ch.find(class_="step-num"); ti = ch.find(class_="step-title"); bd = ch.find(class_="step-body"); tg = ch.find(class_="step-tags")
            b = {"k": "step", "n": norm(num.get_text()).strip() if num else "", "title": clean(inline(ti)) if ti else ""}
            if bd is not None:
                inner = blocks_of(bd) if bd.find(["p", "ul", "table"]) else [{"k": "p", "x": clean(inline(bd))}]
                b["blocks"] = [x for x in inner if x.get("x", "x") != ""]
            if tg: b["tags"] = [norm(t.get_text()).strip() for t in tg.find_all("span") if norm(t.get_text()).strip()]
            tone = [c for c in cl if c != "step-card"]
            if tone: b["tone"] = tone[0]
            out.append(b)
        elif has_cls(ch, "cards"):
            items = []
            for cd in ch.find_all(class_="card", recursive=False):
                ti = cd.find(["h3", "h4"]); title = clean(inline(ti)) if ti else ""
                if ti: ti.extract()
                items.append({"title": title, "blocks": blocks_of(cd)})
            out.append({"k": "cards", "items": items})
        elif has_cls(ch, "card") and not ch.find(class_="card"):
            ti = ch.find(["h3", "h4"]); title = clean(inline(ti)) if ti else ""
            if ti: ti.extract()
            out.append({"k": "cards", "items": [{"title": title, "blocks": blocks_of(ch)}]})
        elif has_cls(ch, "video-cards"):
            for a in ch.find_all("a"):
                h = a.find(["h3", "h4"]); p = a.find("p"); tg = a.find(class_="video-tag")
                out.append({"k": "video", "url": a.get("href", ""), "title": clean(inline(h)) if h else "Video", "desc": clean(inline(p)) if p else "", "tag": norm(tg.get_text()).strip() if tg else ""})
        elif has_cls(ch, "analogy", "ga-ex", "mnem-line", "formula-line") or (n == "blockquote"):
            title = ""
            t_el = ch.find(class_="ga-ex-t") or ch.find(class_="tag")
            if t_el is not None:
                title = clean(inline(t_el)); t_el.extract()
            tone = [c for c in cl if c not in ("ga-ex", "analogy", "formula-line", "mnem-line")]
            if has_cls(ch, "formula-line"): tone.append("formula")
            if has_cls(ch, "mnem-line"): tone.append("mnemonic")
            inner = blocks_of(ch)
            if not inner:
                t = clean(inline(ch))
                if t: inner = [{"k": "p", "x": t}]
            if not inner and not title: continue
            b = {"k": "box", "title": title, "blocks": inner}
            if tone: b["tone"] = tone[0]
            out.append(b)
        elif n == "details":
            sm = ch.find("summary"); title = ""
            if sm is not None:
                for c in sm.find_all(class_="chev"): c.extract()
                title = clean(inline(sm)); sm.extract()
            inner = blocks_of(ch)
            if not inner:
                t = clean(inline(ch))
                if t: inner = [{"k": "p", "x": t}]
            if inner: out.append({"k": "box", "title": title, "blocks": inner})
        elif has_cls(ch, "section-head"):
            h = ch.find(["h2", "h3"])
            if h is not None:
                t = clean(inline(h))
                if t: out.append({"k": "h", "x": t, "l": 3})
        elif n in ("div", "section", "span", "article", "a", "main", "u", "small"):
            if ch.find(["p", "ul", "ol", "table", "svg", "img", "h3", "h4", "figure"]) or ch.find(class_=re.compile("term-box|step-card|card")):
                out += blocks_of(ch)
            else:
                t = clean(inline(ch))
                if t: out.append({"k": "p", "x": t})
    flush()
    return out

def inline_wrap(tag):
    w = BeautifulSoup("<x></x>", "lxml").find("x"); w.append(BeautifulSoup(str(tag), "lxml").body.find(tag.name) if False else __import__("copy").copy(tag))
    return inline(w)

# ---------- one guide ----------
def strip_emoji(s):
    m = re.match(r"^\s*([^\w\s(\"'“]{1,4})\s*(.*)$", s)
    return (m.group(1), m.group(2)) if m and not m.group(1).isascii() else ("", s)

def convert(path):
    t = open(path, encoding="utf8").read()
    s = BeautifulSoup(t, "lxml")
    for x in s.find_all(["script", "style", "textarea", "noscript"]): x.decompose()
    ttl = s.title.get_text() if s.title else ""
    h1 = None
    for cand in s.find_all("h1"):
        if not cand.find_parent(id=re.compile("Overlay|panel|overlay")): h1 = cand; break
    raw_title = html.unescape(norm(h1.get_text()).strip() if h1 else ttl)
    icon, title = strip_emoji(raw_title)
    title = re.sub(r"^(Grate ?Apex Hub\s*[—-]\s*)", "", title)
    title = re.sub(r"^Topic\s*\d+\s*[:—-]\s*", "", title)
    root = s.find(id="guideContentRoot") or s.find("main") or s.body
    sections = []
    secs = [x for x in root.find_all("section") if not x.find_parent("section")]
    for sec in secs:
        h2 = sec.find("h2"); kick = sec.find(class_="kicker")
        st = clean(inline(h2)) if h2 else ""
        if not st: continue
        sec_clone = BeautifulSoup(str(sec), "lxml").find("section")
        blocks = blocks_of(sec_clone)
        if kick is not None: pass
        sections.append({"id": sec.get("id") or re.sub(r"\W+", "-", st.lower())[:40], "title": st, "kicker": norm(kick.get_text()).strip() if kick else "", "blocks": blocks})
    return {"icon": icon, "title": title.strip(), "sections": sections}

# The order of the guides inside each course (the file names don't say it).
ORDER = {
    "biolchem": [f"GUIDE{i}_HTML_B64" for i in range(1, 11)],
    "medgen": [f"GUIDE{i}_HTML_B64" for i in range(1, 9)],
    "compapp": [f"GUIDE{i}_HTML_B64" for i in range(1, 11)],
    "algebra": [f"GUIDE{i}_HTML_B64" for i in range(1, 12)],
    "stats": [f"GUIDE{i}_HTML_B64" for i in range(1, 7)],
    "commskills": [f"GUIDE{i}_HTML_B64" for i in range(1, 7)],
    "bmc": [f"GUIDE{i}_HTML_B64" for i in range(1, 6)],
    "cellstruct": [f"GUIDE{i}_HTML_B64" for i in range(1, 6)],

    "biochemistry": ["GUIDE_HTML_B64", "GUIDE_E_HTML_B64", "GUIDE3_HTML_B64", "GUIDE4_HTML_B64", "GUIDE5_HTML_B64", "GUIDE6_HTML_B64", "GUIDE7_HTML_B64", "GUIDEGLY_HTML_B64", "GUIDEETC_HTML_B64", "GUIDEBO_HTML_B64"],
    "entomology": [f"GUIDE_TOPIC{i}_B64" for i in range(1, 11)],
}
FALLBACK_ICON = {"biolchem": "⚗️", "medgen": "🧬", "compapp": "💻", "algebra": "➗", "stats": "📊", "commskills": "🗣️", "bmc": "🧫", "cellstruct": "🔬", "biochemistry": "🧪", "entomology": "🦟", "anatomy": "🦴", "physiology": "🫀", "behavioural": "🧠"}

def plain(x): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", x))).strip()

def first_text(blocks):
    for b in blocks:
        if b["k"] == "p" and len(plain(b["x"])) > 40: return plain(b["x"])
        if b["k"] in ("box", "cards"):
            inner = b.get("blocks") or [z for it in b.get("items", []) for z in it["blocks"]]
            t = first_text(inner)
            if t: return t
        if b["k"] == "ul" and b["items"]: return plain(b["items"][0])
        if b["k"] == "term": return plain(b["def"])
    return ""

def words(blocks):
    n = 0
    for b in blocks:
        for k in ("x", "def", "title", "desc"):
            if isinstance(b.get(k), str): n += len(plain(b[k]).split())
        for it in b.get("items", []):
            if isinstance(it, str): n += len(plain(it).split())
            else: n += words(it.get("blocks", []))
        for r in b.get("rows", []): n += sum(len(plain(c).split()) for c in r["c"])
        n += words(b.get("blocks", []))
    return n

if __name__ == "__main__":
    res = []
    for f in sorted(glob.glob(src + "/*__*GUIDE*.html")):
        base = os.path.basename(f)[:-5]
        course, name = base.split("__")
        d = convert(f); d["course"] = course; d["file"] = name
        res.append(d)
    # image sizes
    dims = {}
    for im in image_files.values():
        fn = f"{out}/images/{im['id']}.{im['ext']}"
        if Image:
            w, h = Image.open(fn).size; dims[im["id"] + "." + im["ext"]] = (w, h)
    os.makedirs(out + "/lessons", exist_ok=True)
    for old in glob.glob(out + "/lessons/*.json"): os.remove(old)
    index = []
    by_course = {}
    for d in res: by_course.setdefault(d["course"], []).append(d)
    for course, ls in by_course.items():
        order = ORDER.get(course) or sorted(x["file"] for x in ls)
        ls.sort(key=lambda x: order.index(x["file"]))
        for i, d in enumerate(ls, 1):
            def patch(blocks):
                for b in blocks:
                    if b.get("img") in dims: b["w"], b["h"] = dims[b["img"]]
                    patch(b.get("blocks", []))
                    for it in b.get("items", []):
                        if isinstance(it, dict): patch(it.get("blocks", []))
            for sec in d["sections"]: patch(sec["blocks"])
            lid = f"{course}-{i:02d}"
            allb = [b for sec in d["sections"] for b in sec["blocks"]]
            summary = first_text([b for sec in d["sections"] for b in sec["blocks"]])
            if len(summary) > 160: summary = summary[:157].rsplit(" ", 1)[0] + "..."
            full = d["title"]; short, _, sub = full.partition(" — ")
            if not sub and ", Explained" in full: short, sub = full.split(", Explained", 1)[0], "Explained" + full.split(", Explained", 1)[1]
            meta = {"id": lid, "course": course, "order": i, "title": short.strip(), "sub": sub.strip(), "icon": d["icon"] or FALLBACK_ICON.get(course, "📘"),
                    "summary": summary, "minutes": max(2, round(words(allb) / 180)), "sections": [{"id": x["id"], "title": plain(x["title"])} for x in d["sections"]]}
            json.dump({"meta": meta, "sections": d["sections"]}, open(f"{out}/lessons/{lid}.json", "w"), ensure_ascii=False)
            index.append(meta)
            print(lid, meta["icon"], meta["title"], "|", len(d["sections"]), "sections |", meta["minutes"], "min")
    json.dump(index, open(out + "/index.json", "w"), ensure_ascii=False, indent=1)
    print(len(index), "lessons,", len(image_files), "images")
