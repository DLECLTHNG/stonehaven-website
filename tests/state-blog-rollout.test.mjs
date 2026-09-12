import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const { records } = JSON.parse(read('docs/state-blog-rollout/manifest.json'));
const states = 'AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ').sort();
const count = (text, value) => text.split(value).length - 1;

test('state rollout covers 50 DSCR states and exactly six residential states', () => {
  assert.deepEqual(records.filter(x => x.program === 'dscr').map(x => x.state_code).sort(), states);
  assert.deepEqual(records.filter(x => x.program === 'family').map(x => x.state_code).sort(), ['AL', 'FL', 'GA', 'NC', 'SC', 'TN']);
  assert.equal(new Set(records.map(x => x.slug)).size, 56);
  assert.equal(records.filter(x => x.action === 'new_article').length, 55);
});

test('all bilingual state articles resolve through indexes, sitemap, redirects and language links', () => {
  const sitemap = read('sitemap.xml');
  const redirects = read('_redirects');
  for (const r of records) for (const prefix of ['', 'es/']) {
    const route = `/${prefix}blog/${r.slug}`;
    const page = read(`${prefix}blog/${r.slug}.html`);
    const index = read(`${prefix}blog.html`);
    assert.equal(count(page, '<h1>'), 1, route);
    assert.equal(count(page, `rel="canonical" href="https://stonehavencre.com${route}"`), 1, route);
    for (const lang of ['en', 'es']) {
      const alternate = `https://stonehavencre.com/${lang === 'es' ? 'es/' : ''}blog/${r.slug}`;
      assert.ok(page.includes(`hreflang="${lang}" href="${alternate}"`), route);
    }
    assert.equal(count(sitemap, `<loc>https://stonehavencre.com${route}</loc>`), 1, route);
    assert.equal(count(redirects, `${route}.html ${route} 301!`), 1, route);
    assert.ok(index.includes(`href="${route}"`), route);
    assert.ok(!/\u2014|&mdash;|&#(?:8212|x2014);/i.test(page), route);
    assert.ok(!/noindex|DRAFT FOR REVIEW|STATE-REVIEW.*STATE-REVIEW.*STATE-REVIEW/s.test(page), route);
    const schema = JSON.parse(page.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(schema['@type'], 'BlogPosting');
    assert.equal(schema.url, `https://stonehavencre.com${route}`);
    assert.equal(schema.inLanguage, prefix ? 'es' : 'en');
    assert.ok(schema.datePublished && schema.dateModified);
    if (r.action === 'expand_existing') {
      assert.equal(count(page, '<!-- STATE-REVIEW:START -->'), 1);
      assert.equal(count(page, '<!-- STATE-REVIEW:END -->'), 1);
    } else {
      const brief = JSON.parse(read(`docs/blog-briefs/${r.slug}.json`));
      const content = brief[prefix ? 'es' : 'en'];
      assert.ok(page.includes(content.body.find(x => typeof x === 'string')), route);
      assert.ok(brief.sources.length, route);
    }
    for (const match of page.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
      const href = match[1];
      if (/^(?:https?:|mailto:|tel:)/.test(href)) continue;
      const target = href.split(/[?#]/)[0];
      let file = target.startsWith('/') ? target.slice(1) : path.posix.join(prefix + 'blog', target);
      if (!path.extname(file)) file = file.endsWith('/') || !file ? file + 'index.html' : file + '.html';
      assert.ok(fs.existsSync(path.join(root, file)), `${route}: missing ${href}`);
    }
  }
});

test('Family articles have no advertising, tracking fallbacks or intake forms', () => {
  for (const r of records.filter(x => x.program === 'family')) for (const prefix of ['', 'es/']) {
    const page = read(`${prefix}blog/${r.slug}.html`);
    assert.ok(!/site-config\.js|funnel\.js|facebook|fbq\(|gtag\(|<form\b|<iframe\b/i.test(page), r.slug);
    const scripts = [...page.matchAll(/<script\b([^>]*)>/g)].map(x => x[1]);
    assert.equal(scripts.length, 2);
    assert.equal(scripts.filter(x => x.includes('application/ld+json')).length, 1);
    assert.equal(scripts.filter(x => x.includes('js/blog-ui.js')).length, 1);
    assert.ok(page.includes('<meta name="referrer" content="no-referrer"/>'));
    assert.ok(page.includes('aria-controls="links" aria-expanded="false"'));
    assert.ok(!/class="[^"]*\breveal\b/.test(page));
    const prose = page.match(/<article\b.*?<\/article>/s)[0].replace(/<[^>]+>/g, '');
    assert.ok(!/\u2013|[$%]/.test(prose));
  }
});

test('untracked article menu opens, closes on navigation and restores focus on Escape', () => {
  const handlers = {}; const classes = new Set(); const attrs = {}; let focused = false;
  const toggle = {addEventListener: (name, fn) => handlers[`toggle:${name}`] = fn, setAttribute: (name, value) => attrs[name] = value, focus: () => focused = true};
  const links = {classList: {contains: name => classes.has(name), toggle: (name, value) => value ? classes.add(name) : classes.delete(name)}, addEventListener: (name, fn) => handlers[`links:${name}`] = fn};
  const document = {getElementById: id => id === 'toggle' ? toggle : links, addEventListener: (name, fn) => handlers[`document:${name}`] = fn};
  vm.runInNewContext(read('js/blog-ui.js'), { document });
  handlers['toggle:click'](); assert.equal(attrs['aria-expanded'], 'true');
  handlers['links:click']({target: {closest: () => ({})}}); assert.equal(attrs['aria-expanded'], 'false');
  handlers['toggle:click'](); handlers['document:keydown']({key: 'Escape'});
  assert.equal(attrs['aria-expanded'], 'false'); assert.equal(focused, true);
});
