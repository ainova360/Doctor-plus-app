#!/usr/bin/env node
import { chromium } from "playwright";
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = "/Doctor-plus-app/";
const clientRoot = path.join(root, "dist", "client");
const output = path.join(root, "qa", "screenshots");
const sharedChromium = path.resolve(root, "../../tooling/media/.browsers/chromium-1248/chrome-win64/chrome.exe");

await fs.mkdir(output, { recursive: true });
if (!existsSync(path.join(clientRoot, "index.html"))) throw new Error("Build the GitHub Pages site first.");
const contentTypes = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png", ".woff": "font/woff", ".woff2": "font/woff2" };
const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
  if (!pathname.startsWith(base)) {
    response.writeHead(404).end();
    return;
  }
  const relative = pathname.slice(base.length) || "index.html";
  const file = path.resolve(clientRoot, relative);
  if (!file.startsWith(clientRoot + path.sep) && file !== path.join(clientRoot, "index.html")) {
    response.writeHead(403).end();
    return;
  }
  if (!existsSync(file)) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { "content-type": `${contentTypes[path.extname(file)] || "application/octet-stream"}; charset=utf-8` });
  response.end(readFileSync(file));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Could not determine local preview port");
const previewUrl = `http://127.0.0.1:${address.port}`;
let browser;

try {
  browser = await chromium.launch({ headless: true, ...(existsSync(sharedChromium) ? { executablePath: sharedChromium } : {}) });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });

  await page.goto(`${previewUrl}${base}`, { waitUntil: "networkidle" });
  await page.locator(".doctor-app").waitFor();
  if (!await page.getByText("مرحباً بعودتك").count()) throw new Error("Arabic login did not load from the GitHub Pages project path");
  await page.locator(".auth-brand img").evaluate((img) => img.decode());
  await page.locator(".auth-hero-card img").evaluate((img) => img.decode());
  if (await page.locator(".auth-brand img").evaluate((img) => img.naturalWidth) === 0) throw new Error("Brand image failed to load");
  await page.screenshot({ path: path.join(output, "github-pages-login-ar.png"), fullPage: true });

  await page.locator(".language-switch").click();
  if (!await page.getByText("Welcome back", { exact: true }).count() || await page.locator(".doctor-app").getAttribute("dir") !== "ltr") {
    throw new Error("English login or LTR direction failed on the GitHub Pages project path");
  }
  await page.screenshot({ path: path.join(output, "github-pages-login-en.png"), fullPage: true });

  for (const viewport of [{ width: 768, height: 900 }, { width: 1366, height: 640 }]) {
    await page.setViewportSize(viewport);
    const bounds = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
      app: document.querySelector(".doctor-app")?.getBoundingClientRect().toJSON(),
    }));
    if (bounds.width > bounds.viewport || !bounds.app) throw new Error(`Layout overflow at ${viewport.width}x${viewport.height}`);
  }
  if (errors.length) throw new Error(`Browser errors: ${errors.join("; ")}`);
  console.log("GitHub Pages path QA passed: Arabic and English login, branding assets, tablet and short desktop layouts.");
} finally {
  await browser?.close();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}
