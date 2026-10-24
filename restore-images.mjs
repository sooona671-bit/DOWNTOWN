// restore-images.mjs
// Downloads the ORIGINAL images that src/downtown/asset-map.json points to
// and saves them under public/, so the app shows them without Lovable.
//
// Run from the project root (the folder that contains package.json):
//     node restore-images.mjs
//
// Safe by design:
//  - downloads only the original files, never substitutes anything
//  - checks every file really is an image (not an error page)
//  - asset-map.json is changed ONLY if all files were downloaded;
//    otherwise nothing is touched and the missing ones are listed.

import fs from "node:fs";
import path from "node:path";

const BASES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      "https://downtown-polish-studio.lovable.app",
      "https://id-preview--f0cb0e86-e2d0-4cec-9706-7b477e1f9a46.lovable.app",
    ];

const root = process.cwd();
const mapPath = path.join(root, "src", "downtown", "asset-map.json");
const publicDir = path.join(root, "public");

if (!fs.existsSync(mapPath)) {
  console.error("ERROR: src/downtown/asset-map.json not found. Run this from the project root.");
  process.exit(1);
}
const assetMap = JSON.parse(fs.readFileSync(mapPath, "utf8"));
const keys = Object.keys(assetMap);
if (keys.length === 0) {
  console.error(
    "ERROR: asset-map.json is empty ({}). It is the only list of your original images.\n" +
      "Put back the original asset-map.json from your Lovable zip and run again."
  );
  process.exit(1);
}

const uniqueUrls = [...new Set(Object.values(assetMap))];
console.log(`${keys.length} image paths, ${uniqueUrls.length} unique files to download.`);
console.log(`Source(s): ${BASES.join("  |  ")}\n`);

function looksLikeImage(buf, contentType, name) {
  if (buf.length < 100) return false;
  if (!/^image\//i.test(contentType || "")) return false;
  // Judge by the real file content, not by the file name: Lovable sometimes
  // stores a JPEG under a ".png" name. The bytes are saved exactly as received.
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8;
  const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  const isGif = buf.toString("latin1", 0, 3) === "GIF";
  const isWebp = buf.toString("latin1", 0, 4) === "RIFF" && buf.toString("latin1", 8, 12) === "WEBP";
  const isSvg = buf.toString("utf8", 0, Math.min(buf.length, 2000)).includes("<svg");
  return isJpeg || isPng || isGif || isWebp || isSvg;
}

async function download(valuePath) {
  const name = path.basename(valuePath);
  let lastError = "unknown";
  for (const base of BASES) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(base.replace(/\/+$/, "") + valuePath, { redirect: "follow" });
        if (!res.ok) { lastError = `HTTP ${res.status}`; continue; }
        const buf = Buffer.from(await res.arrayBuffer());
        if (!looksLikeImage(buf, res.headers.get("content-type"), name)) {
          lastError = `not a valid image (${res.headers.get("content-type")}, ${buf.length} bytes)`;
          continue;
        }
        return { buf };
      } catch (e) {
        lastError = e.cause?.code || e.message;
      }
    }
  }
  return { error: lastError };
}

const cache = new Map();
const failed = [];
let done = 0;
const queue = [...uniqueUrls];
async function worker() {
  while (queue.length) {
    const url = queue.shift();
    const r = await download(url);
    if (r.buf) cache.set(url, r.buf);
    else failed.push({ url, error: r.error });
    done++;
    process.stdout.write(`\rdownloaded ${done}/${uniqueUrls.length}   `);
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
console.log("\n");

if (failed.length) {
  const failedUrls = new Set(failed.map((f) => f.url));
  console.error(`FAILED: ${failed.length} of ${uniqueUrls.length} files could not be downloaded.`);
  console.error("Nothing was changed (asset-map.json untouched).\n");
  console.error("Files that failed:");
  for (const k of keys) if (failedUrls.has(assetMap[k])) {
    console.error(`  ${k}   <- ${failed.find((f) => f.url === assetMap[k]).error}`);
  }
  console.error("\nIf EVERYTHING failed, open this link in your browser and see if the image shows:");
  console.error("  " + BASES[0] + uniqueUrls[0]);
  process.exit(1);
}

// all downloaded: write files, then (and only then) empty the map
const report = [];
for (const key of keys) {
  const dest = path.join(publicDir, ...key.split("/").filter(Boolean));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const buf = cache.get(assetMap[key]);
  fs.writeFileSync(dest, buf);
  report.push(`${key.padEnd(52)} ${String(buf.length).padStart(8)} bytes`);
}
fs.copyFileSync(mapPath, mapPath.replace(/\.json$/, ".backup.json"));
fs.writeFileSync(mapPath, "{}\n");

console.log(report.join("\n"));
console.log(`\nDONE: ${keys.length} images saved under public/. asset-map.json is now {} (backup: asset-map.backup.json).`);
console.log("Now restart the app (bun run dev) and hard-refresh the browser (Ctrl+Shift+R).");
