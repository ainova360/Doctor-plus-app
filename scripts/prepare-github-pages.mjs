#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const client = path.join(root, "dist", "client");
const base = process.env.VITE_BASE_PATH || "/Doctor-plus-app/";

if (!base.startsWith("/") || !base.endsWith("/")) {
  throw new Error("VITE_BASE_PATH must start and end with '/'.");
}
if (!existsSync(path.join(client, "index.html"))) {
  throw new Error("Missing dist/client/index.html; build the app first.");
}

function rewriteAssets(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      rewriteAssets(file);
      continue;
    }
    if (!/\.(html|js|css)$/.test(entry.name)) continue;
    const source = readFileSync(file, "utf8");
    const rewritten = source.replaceAll('"/assets/', `"${base}assets/`)
      .replaceAll("'/assets/", `'${base}assets/`)
      .replaceAll("(/assets/", `(${base}assets/`)
      .replaceAll("url(/assets/", `url(${base}assets/`);
    if (rewritten !== source) writeFileSync(file, rewritten);
  }
}

rewriteAssets(client);
console.log(`Prepared GitHub Pages bundle for ${base}`);
