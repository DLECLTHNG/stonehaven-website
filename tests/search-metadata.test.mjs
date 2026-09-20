import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const origin = 'https://stonehavencre.com';
const run = (functionName, args) => {
  const script = `import json, sys\nsys.path.insert(0, 'scripts')\nimport search_metadata as m\np=json.load(sys.stdin)\nprint(json.dumps(getattr(m,p['function'])(*p['args'])))`;
  const result = spawnSync('python3', ['-c', script], {
    encoding: 'utf8', input: JSON.stringify({ function: functionName, args })
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
};
const page = (path, body = '', head = '') => `<!doctype html><html><head><title>Original descriptive title</title><meta name="description" content="A useful description"/><link rel="canonical" href="${origin}${path}"/>${head}</head><body><main>${body}</main></body></html>`;
const ld = value => `<script type="application/ld+json">${JSON.stringify(value)}</script>`;
const schema = text => JSON.parse(text.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);

test('organization identifiers reach nested providers and authors without overwriting human identity', () => {
  const input = page('/test', '', ld({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'Service', provider: { '@type': 'FinancialService', name: 'Stonehaven Lending', email: 'chris@stonehavencre.com', image: `${origin}/assets/stonehaven-handpainted-logo.png`, identifier: { '@type': 'PropertyValue', propertyID: 'other', value: 'retained' } } },
    { '@type': 'BlogPosting', headline: 'Example', url: `${origin}/test`, author: { '@type': 'Organization', name: 'Stonehaven Lending' } },
    { '@type': 'Person', name: 'Chris De Leeuw', email: 'chris@stonehavencre.com', identifier: 'individual-id' },
    { '@type': 'Organization', name: 'Another company', email: 'other@example.com' }
  ] }));
  const output = run('normalize_page_metadata', [input, '/test', {}]);
  const nodes = schema(output)['@graph'];
  for (const node of [nodes[0].provider, nodes[1].author]) {
    assert.equal(node['@id'], `${origin}/#org`);
    assert.equal(node.email, 'office@stonehavencre.com');
    assert.equal(node.logo, `${origin}/assets/stonehaven-logo-512-v1.webp`);
    const ids = Array.isArray(node.identifier) ? node.identifier : [node.identifier];
    assert.ok(ids.some(x => x.propertyID === 'NMLS' && x.value === '1752355'));
  }
  assert.ok(nodes[0].provider.identifier.some(x => x.propertyID === 'other'));
  assert.equal(nodes[0].provider.image, `${origin}/assets/stonehaven-logo-512-v1.webp`);
  assert.equal(nodes[2].email, 'chris@stonehavencre.com');
  assert.equal(nodes[2].identifier, 'individual-id');
  assert.equal(nodes[3].email, 'other@example.com');
  assert.equal(nodes[3].identifier, undefined);
  assert.equal(nodes[1].mainEntityOfPage['@id'], `${origin}/test`);
  assert.equal(run('normalize_page_metadata', [output, '/test', {}]), output);
});

test('search title changes preserve the descriptive H1 and article headline', () => {
  const original = 'A full article heading with a detailed reader question';
  const input = page('/blog/example', `<h1>${original}</h1>`, ld({ '@type': 'BlogPosting', headline: original, url: `${origin}/blog/example` }));
  const output = run('normalize_page_metadata', [input, '/blog/example', { '/blog/example': 'Short & Useful | Stonehaven Lending' }]);
  assert.match(output, /<title>Short &amp; Useful \| Stonehaven Lending<\/title>/);
  assert.ok(output.includes(`<h1>${original}</h1>`));
  assert.equal(schema(output).headline, original);
  assert.match(output, /property="og:type" content="article"/);
  assert.match(output, /property="og:image:width" content="1200"/);
  assert.match(output, /property="og:image:height" content="630"/);
});

test('sharing metadata uses the real canonical URL and does not promote noindex pages', () => {
  const input = page('/residential', '<h1>Home financing</h1>');
  const output = run('normalize_page_metadata', [input, '/residential', {}]);
  assert.ok(output.includes(`property="og:url" content="${origin}/residential"`));
  assert.match(output, /property="og:description" content="A useful description"/);
  const noindex = page('/campaign', '', '<meta content="noindex, follow" name="robots"/>');
  const preserved = run('normalize_page_metadata', [noindex, '/campaign', { '/campaign': 'Should not replace this' }]);
  assert.equal(preserved, noindex);
  const noncanonical = run('normalize_page_metadata', [input, '/different-route', {}]);
  assert.doesNotMatch(noncanonical, /property="og:url"/);
});

test('existing noindex social images get compact assets without removing exclusion', () => {
  const input = page('/campaign', '', '<meta name="robots" content="noindex"/><meta property="og:image" content="old.png"/><meta name="twitter:image" content="old.png"/>');
  const output = run('normalize_page_metadata', [input, '/campaign', {}]);
  assert.match(output, /name="robots" content="noindex"/);
  assert.equal((output.match(/stonehaven-social-v1.jpg/g) || []).length, 2);
  assert.equal(run('normalize_page_metadata', [output, '/campaign', {}]), output);
});

test('sitemap alternates are reciprocal, self-inclusive, canonical and indexable', () => {
  const en = page('/guide', '', `<link rel="alternate" hreflang="es" href="${origin}/es/guide"/>`);
  const es = page('/es/guide', '', `<link rel="alternate" hreflang="en" href="${origin}/guide"/>`);
  const input = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"><url><loc>${origin}/guide</loc><lastmod>2026-09-18</lastmod><priority>0.7</priority></url><url><loc>${origin}/es/guide</loc><lastmod>2026-09-18</lastmod></url><url><loc>${origin}/solo</loc><xhtml:link rel="alternate" hreflang="es" href="${origin}/es/missing"/></url></urlset>`;
  const pages = { '/guide': en, '/es/guide': es, '/solo': page('/solo') };
  const output = run('normalize_sitemap', [input, pages]);
  assert.equal((output.match(/<xhtml:link/g) || []).length, 6);
  for (const language of ['en', 'es', 'x-default']) assert.equal((output.match(new RegExp(`hreflang="${language}"`, 'g')) || []).length, 2);
  assert.equal((output.match(/<lastmod>2026-09-18<\/lastmod>/g) || []).length, 2);
  assert.ok(output.includes('<priority>0.7</priority>'));
  assert.doesNotMatch(output, /es\/missing/);
  assert.equal(run('normalize_sitemap', [output, pages]), output);
  for (const badSpanish of [es.replace('</head>', '<meta name="robots" content="noindex"/></head>'), es.replace(`hreflang="en" href="${origin}/guide"`, `hreflang="en" href="${origin}/wrong"`), es.replace(`rel="canonical" href="${origin}/es/guide"`, `rel="canonical" href="${origin}/wrong"`)]) {
    assert.doesNotMatch(run('normalize_sitemap', [input, { ...pages, '/es/guide': badSpanish }]), /<xhtml:link/);
  }
});

test('curated titles remain explicit and retained publisher metaTitle values take precedence', () => {
  const curated = JSON.parse(readFileSync('scripts/search-title-overrides.json', 'utf8'));
  assert.ok(Object.keys(curated).filter(path => path.startsWith('/blog/')).length >= 42);
  for (const title of Object.values(curated)) {
    assert.ok(title.length <= 70, title);
    assert.ok(title.endsWith('Stonehaven Lending'), title);
  }
  const loaded = run('load_title_overrides', ['.']);
  const retained = JSON.parse(readFileSync('docs/blog-briefs/heloc-vs-cash-out-refinance.json', 'utf8'));
  assert.equal(loaded['/blog/heloc-vs-cash-out-refinance'], retained.en.metaTitle);
  assert.equal(loaded['/'], curated['/']);
  assert.ok(loaded['/'].endsWith('Stonehaven Lending'));
});
