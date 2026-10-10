// Loads the lessons in ../content into Firestore.
//
//   cd scripts && npm install
//   node seed-content.mjs ../serviceAccount.json            (everything)
//   node seed-content.mjs ../serviceAccount.json anatomy    (one course)
//   node seed-content.mjs ../serviceAccount.json --dry-run  (just count, write nothing)
//
// serviceAccount.json: Firebase console > Project settings > Service accounts >
// Generate new private key. Keep it private; never put it in the app or in git.
// Running it again is safe: it overwrites the same documents. Edit a lesson's JSON
// in ../content/lessons and run it again to update that lesson for every student.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const dry = args.includes("--dry-run");
const rest = args.filter((a) => !a.startsWith("--"));
const keyPath = rest[0];
const only = rest[1];
if (!keyPath) { console.error("Usage: node seed-content.mjs <serviceAccount.json> [course] [--dry-run]"); process.exit(1); }

const content = path.join(here, "..", "content");
const key = JSON.parse(fs.readFileSync(keyPath, "utf8"));
initializeApp({ credential: cert(key), projectId: key.project_id });
const db = getFirestore();

const lessonFiles = fs.readdirSync(path.join(content, "lessons")).filter((f) => f.endsWith(".json")).filter((f) => !only || f.startsWith(only + "-"));
const wanted = new Set();
const lessons = lessonFiles.map((f) => JSON.parse(fs.readFileSync(path.join(content, "lessons", f), "utf8")));

const used = (blocks, add) => { for (const b of blocks || []) { if (b.img) add(b.img); used(b.blocks, add); for (const it of b.items || []) if (it && typeof it === "object") used(it.blocks, add); } };
lessons.forEach((l) => l.sections.forEach((s) => used(s.blocks, (n) => wanted.add(n))));

let writes = [];
for (const l of lessons) {
  const v = crypto.createHash("sha1").update(JSON.stringify(l)).digest("hex").slice(0, 10);
  writes.push([db.collection("lessons").doc(l.meta.id), { ...l.meta, v, updatedAt: FieldValue.serverTimestamp() }]);
  writes.push([db.collection("lessonContent").doc(l.meta.id), { sections: l.sections, extras: l.extras || {}, v }]);
}
for (const name of wanted) {
  const buf = fs.readFileSync(path.join(content, "images", name));
  const ext = path.extname(name).slice(1);
  const mime = ext === "jpg" ? "image/jpeg" : ext === "png" ? "image/png" : "image/" + ext;
  writes.push([db.collection("lessonImages").doc(name.replace(/\.[a-z]+$/, "")), { mime, data: buf.toString("base64") }]);
}
// Firestore refuses a list directly inside a list, and any document over 1 MB. Check before writing.
const nested = (v, where) => { if (Array.isArray(v)) v.forEach((x) => { if (Array.isArray(x)) throw new Error("list inside list at " + where); nested(x, where); }); else if (v && typeof v === "object") Object.values(v).forEach((x) => nested(x, where)); };
for (const [ref, data] of writes) {
  const size = Buffer.byteLength(JSON.stringify(data));
  if (size > 950000) throw new Error(`${ref.path} is ${Math.round(size / 1024)} KB, too big for one document`);
  nested(data, ref.path);
}
console.log(`${lessons.length} lessons, ${wanted.size} images, ${writes.length} documents${dry ? " (dry run, nothing written)" : ""}`);
if (!dry) {
  for (let i = 0; i < writes.length; i += 20) {   // small batches: images are big
    const batch = db.batch();
    writes.slice(i, i + 20).forEach(([ref, data]) => batch.set(ref, data));
    await batch.commit();
    process.stdout.write(`\r${Math.min(i + 20, writes.length)} / ${writes.length}`);
  }
  console.log("\nDone.");
}
