"""Makes the link-preview pictures (1200x630) in public/og/. Re-run after content changes:
   python3 scripts/make_og.py"""
import json, os, textwrap
from PIL import Image, ImageDraw, ImageFont
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = lambda w, n: ImageFont.truetype(f"{root}/node_modules/@expo-google-fonts/poppins/{w}/Poppins_{w}.ttf", n)
out = f"{root}/public/og"; os.makedirs(out, exist_ok=True)
logo = Image.open(f"{root}/assets/icon.png").convert("RGB").resize((120, 120))
NAMES = {"anatomy": "Anatomy", "behavioural": "Behavioural Science", "biochemistry": "Biochemistry", "entomology": "Entomology", "physiology": "Physiology"}
GRAD = {"anatomy": ("#3b82f6", "#1e3a8a"), "behavioural": ("#a855f7", "#4c1d95"), "biochemistry": ("#10b981", "#064e3b"), "entomology": ("#f59e0b", "#78350f"), "physiology": ("#f43f5e", "#881337")}
def hexrgb(h): return tuple(int(h[i:i+2], 16) for i in (1, 3, 5))
def card(path, kicker, title, foot, g=("#2d5bff", "#000266")):
    W, H = 1200, 630
    a, b = hexrgb(g[0]), hexrgb(g[1])
    im = Image.new("RGB", (W, H)); px = im.load()
    for y in range(H):
        for x in range(W):
            t = min(1, (x * .45 + y) / (W * .45 + H))
            px[x, y] = tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
    d = ImageDraw.Draw(im)
    im.paste(logo, (70, 60))
    d.text((210, 80), "GrAte Apex", font=F("800ExtraBold", 40), fill="white")
    d.text((210, 128), "KNUST Level 100 · Study together", font=F("400Regular", 24), fill=(255, 255, 255, 200))
    d.text((70, 240), kicker.upper(), font=F("700Bold", 28), fill="#ffd54a")
    size = 68 if len(title) < 40 else 56 if len(title) < 70 else 46
    lines = textwrap.wrap(title, width=int(1060 / (size * .56)))[:3]
    y = 290
    for ln in lines: d.text((70, y), ln, font=F("800ExtraBold", size), fill="white"); y += int(size * 1.25)
    d.text((70, 540), foot, font=F("400Regular", 28), fill=(255, 255, 255))
    im.save(path, optimize=True)
card(f"{out}/default.png", "Study app", "Lessons, quizzes & flashcards for KNUST Level 100", "Study together. Score higher.")
idx = json.load(open(f"{root}/content/index.json"))
for c, name in NAMES.items():
    n = sum(1 for l in idx if l["course"] == c)
    card(f"{out}/c-{c}.png", "Course", name, f"{n} lessons · practice · flashcards", GRAD[c])
for l in idx:
    card(f"{out}/l-{l['id']}.png", NAMES.get(l["course"], l["course"]) + f" · Lesson {l['order']}", l["title"], f"~{l['minutes']} min read · with practice questions", GRAD.get(l["course"], ("#2d5bff", "#000266")))
print("done", len(os.listdir(out)))
