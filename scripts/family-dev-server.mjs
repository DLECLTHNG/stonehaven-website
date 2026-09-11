#!/usr/bin/env node
// Local preview for the Family Opportunity pages: static files with clean URLs
// plus the real netlify/functions/family-inquiry.js handler mounted at its
// production path. FAMILY_DRY_RUN=1 (default here) skips storage so local
// tests never create real leads; the confirmation page shows a preview banner.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.env.FAMILY_DRY_RUN = process.env.FAMILY_DRY_RUN || "1";
const fn = require(path.join(ROOT, "netlify/functions/family-inquiry.js"));
const PORT = +(process.argv[2] || 8902);
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".txt": "text/plain", ".xml": "application/xml" };
http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/.netlify/functions/family-inquiry") {
    let body = ""; for await (const c of req) body += c;
    const out = await fn.handler({ httpMethod: req.method, headers: req.headers, body });
    res.writeHead(out.statusCode, out.headers || {}); res.end(out.body); return;
  }
  let p = url.pathname;
  if (p.endsWith(".html")) { res.writeHead(301, { Location: p.slice(0, -5) }); res.end(); return; }
  let file = path.join(ROOT, p.endsWith("/") ? p + "index.html" : p);
  if (!path.extname(file) && fs.existsSync(file + ".html")) file += ".html";
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, "127.0.0.1", () => console.log("family dev server on http://127.0.0.1:" + PORT + " (FAMILY_DRY_RUN=" + process.env.FAMILY_DRY_RUN + ")"));
