// Run after `expo export --platform web`. Adds the install tags and service worker to the
// page, and writes a small share page for every lesson and course so links show a preview
// card (title, picture) when posted in WhatsApp, Telegram, X and so on.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const read = (p) => fs.readFileSync(p, "utf8");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const host = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL && "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL) || (process.env.VERCEL_URL && "https://" + process.env.VERCEL_URL) || "";
const abs = (p) => host.replace(/\/$/, "") + p;

// 0. Vercel does not publish any folder called node_modules, and Expo puts the Poppins fonts and
// the navigation icons in dist/assets/node_modules. Move them to dist/assets/vendor and fix every reference.
const nm = path.join(dist, "assets", "node_modules");
if (fs.existsSync(nm)) {
  fs.renameSync(nm, path.join(dist, "assets", "vendor"));
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  let n = 0;
  for (const f of walk(dist)) {
    if (!/\.(js|html|css|json|map)$/.test(f)) continue;
    const t = read(f);
    if (t.includes("assets/node_modules")) { fs.writeFileSync(f, t.split("assets/node_modules").join("assets/vendor")); n++; }
  }
  console.log(`postbuild: moved assets/node_modules to assets/vendor (${n} files updated)`);
}

let html = read(path.join(dist, "index.html"));

// 1. installable app tags + service worker
// One id for this deploy, written into the page and into sw.js so the app can tell whether a waiting service worker is newer than the page.
const STAMP = String(Date.now());
const head = `
<script>window.__GA_BUILD__="${STAMP}"</script>
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Grate Apex Hub">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="application-name" content="Grate Apex Hub">
<meta property="og:site_name" content="Grate Apex Hub">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">`;
html = html.replace("</head>", head + "\n</head>");
const reg = `<script>if("serviceWorker"in navigator&&location.protocol==="https:"||location.hostname==="localhost"){window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").catch(function(){})})}</script>`;
html = html.replace("</body>", reg + "\n</body>");
fs.writeFileSync(path.join(dist, "index.html"), html);

// 2. stamp the service worker so each deploy gets a fresh cache
const swPath = path.join(dist, "sw.js");
// replace EVERY occurrence (a plain .replace() only changes the first one, which used to be the comment, so BUILD was never stamped and sw.js never changed between deploys)
fs.writeFileSync(swPath, read(swPath).split("__BUILD__").join(STAMP));

// 3. default preview image on the home page
const withMeta = (base, { title, desc, image, url }) => {
  let h = base
    .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}">`);
  const tags = `<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(abs(image))}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
${host ? `<meta property="og:url" content="${esc(abs(url))}">` : ""}
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(abs(image))}">`;
  return h.replace("</head>", tags + "\n</head>");
};
const base = read(path.join(dist, "index.html"));
const DEFAULT_DESC = "Study smarter with KNUST Level 100 Medical Sciences lessons, quizzes, flashcards and friends.";
fs.writeFileSync(path.join(dist, "index.html"), withMeta(base, { title: "Grate Apex Hub", desc: DEFAULT_DESC, image: "/og/default.png", url: "/" }));

// 4. share pages
const idx = JSON.parse(read(path.join(root, "content", "index.json")));
const write = (rel, h) => { const d = path.join(dist, rel); fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, "index.html"), h); };
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
const courses = new Map();
for (const l of idx) {
  const cname = { anatomy: "Anatomy", behavioural: "Behavioural Science", biochemistry: "Biochemistry", entomology: "Entomology", physiology: "Physiology", biolchem: "Biological Chemistry", medgen: "Basic Medical Genetics", compapp: "Computer Appreciation", algebra: "Algebra", stats: "Statistical Methods", commskills: "Communication Skills", bmc: "Basic Medical Chemistry", cellstruct: "Cell Structure" }[l.course] || l.course;
  courses.set(l.course, cname);
  const title = `${l.title} · ${cname} | Grate Apex Hub`;
  const desc = clip((l.summary || "").replace(/\s+/g, " ") || DEFAULT_DESC, 180);
  write(`l/${l.id}`, withMeta(base, { title, desc, image: fs.existsSync(path.join(dist, `og/l-${l.id}.png`)) ? `/og/l-${l.id}.png` : "/og/default.png", url: `/l/${l.id}` }));
}
for (const [id, name] of courses) {
  const n = idx.filter((l) => l.course === id).length;
  write(`c/${id}`, withMeta(base, { title: `${name} · Grate Apex Hub`, desc: `${n} lessons with practice questions, flashcards and key facts for ${name}.`, image: fs.existsSync(path.join(dist, `og/c-${id}.png`)) ? `/og/c-${id}.png` : "/og/default.png", url: `/c/${id}` }));
}
console.log(`postbuild: ${idx.length} lesson pages, ${courses.size} course pages, host=${host || "(relative)"}`);
