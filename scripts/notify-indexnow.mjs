// Notify participating search engines after verifying the changed pages are live.
// node scripts/notify-indexnow.mjs /canonical-path /another-path
// Add --submit to send. Default mode only validates and previews public URLs.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

export function canonicalUrls(paths, sitemap, origin) {
  const known = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));
  if (!paths.length || paths.length > 1000) throw new Error('Supply 1 to 1000 changed canonical paths.');
  return [...new Set(paths.map(p => {
    if (!/^\/(?:[a-z0-9-]+\/)*[a-z0-9-]*$/.test(p)) throw new Error('Only clean canonical paths are allowed: ' + p);
    const url = origin + p;
    if (!known.has(url)) throw new Error('URL is not in the public sitemap: ' + p);
    return url;
  }))];
}

// Parse only attributes on known tags. The page comparison remains exact
// outside form opening tags, so changes to text, links or inputs still fail.
function attributes(tag) {
  const attrs = {};
  const source = tag.replace(/^<[^\s>]+\s*/, '').replace(/\/?\s*>$/, '');
  for (const match of source.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attrs;
}

function tags(html, name) {
  return html.match(new RegExp('<' + name + '\\b(?:[^>"\']|"[^"]*"|\'[^\']*\')*>', 'gi')) || [];
}

function normalizedMain(html) {
  const main = html.match(/<main\b[^>]*>[\s\S]*?<\/main\s*>/i)?.[0];
  if (!main) return '';
  return main.replace(/<form\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi, tag => {
    const attrs = attributes(tag);
    // Netlify removes these deployment instructions and serializes the
    // remaining form attributes with different ordering and quote styles.
    for (const name of ['data-netlify', 'netlify', 'netlify-honeypot']) delete attrs[name];
    return '<form ' + JSON.stringify(Object.entries(attrs).sort(([a], [b]) => a.localeCompare(b))) + '>';
  });
}

export function assertLivePage(local, live, url, headers = '') {
  const main = normalizedMain(local);
  if (!main || main !== normalizedMain(live)) throw new Error('Changed content is not live: ' + url);
  const canonicals = tags(live, 'link').map(attributes).filter(a => (a.rel || '').toLowerCase().split(/\s+/).includes('canonical'));
  if (canonicals.length !== 1 || canonicals[0].href !== url) throw new Error('Canonical URL mismatch: ' + url);
  const blocked = tags(live, 'meta').map(attributes).some(a =>
    /^(?:robots|googlebot|bingbot)$/i.test(a.name || '') && /(?:^|[\s,])(?:noindex|none)(?:$|[\s,])/i.test(a.content || ''));
  if (blocked || /^x-robots-tag:[^\r\n]*\b(?:noindex|none)\b/im.test(headers)) throw new Error('Page is not eligible: ' + url);
}

function livePage(url) {
  let response = curl(['--include', url]), headers = '';
  // Accommodate interim HTTP responses while retaining only final headers.
  while (/^HTTP\//i.test(response)) {
    const end = response.match(/\r?\n\r?\n/);
    if (!end) throw new Error('Malformed public response: ' + url);
    headers = response.slice(0, end.index);
    response = response.slice(end.index + end[0].length);
  }
  if (!/^HTTP\/\S+ 200(?:\s|$)/i.test(headers)) throw new Error('Public page did not return HTTP 200: ' + url);
  return {html: response, headers};
}

function curl(args, body) {
  const result = spawnSync('curl', ['--silent', '--show-error', '--fail-with-body', '--max-time', '25', ...args], {input: body, encoding: 'utf8'});
  if (result.status !== 0) throw new Error('Public endpoint request failed: ' + (result.stderr || result.stdout).slice(0, 300));
  return result.stdout;
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const config = JSON.parse(fs.readFileSync(path.join(root, 'scripts/indexnow-config.json'), 'utf8'));
  if (config.host !== 'stonehavencre.com' || !/^[a-f0-9]{32}\.txt$/.test(config.keyFile)) throw new Error('Invalid ownership configuration.');
  const origin = 'https://' + config.host;
  const key = fs.readFileSync(path.join(root, config.keyFile), 'utf8').trim();
  if (config.keyFile !== key + '.txt') throw new Error('Ownership key mismatch.');
  const args = process.argv.slice(2);
  const submit = args.includes('--submit');
  const urls = canonicalUrls(args.filter(a => a !== '--submit'), fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8'), origin);
  console.log(JSON.stringify({mode: submit ? 'submit' : 'preview', urls}, null, 2));
  if (!submit) return;
  if (curl([origin + '/' + config.keyFile]).trim() !== key) throw new Error('Ownership file is not live.');
  for (const url of urls) {
    const route = url.slice(origin.length);
    const file = path.join(root, route.endsWith('/') ? route.slice(1) + 'index.html' : route.slice(1) + '.html');
    const local = fs.readFileSync(file, 'utf8');
    const live = livePage(url);
    assertLivePage(local, live.html, url, live.headers);
  }
  const body = JSON.stringify({host: config.host, key, keyLocation: origin + '/' + config.keyFile, urlList: urls});
  const response = curl(['--request', 'POST', '--header', 'Content-Type: application/json', '--data-binary', '@-', '--write-out', '\n%{http_code}', 'https://api.indexnow.org/indexnow'], body);
  const code = response.trim().split('\n').at(-1);
  if (!['200', '202'].includes(code)) throw new Error('Unexpected notification status: ' + code);
  console.log(`IndexNow received ${urls.length} URLs (HTTP ${code}). This is not confirmation of indexing or ranking.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
