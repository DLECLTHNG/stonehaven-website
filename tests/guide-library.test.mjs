import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildGuideLibrary} from '../scripts/guide-library.mjs';

test('topic archives preserve every article exactly once per language and pair every page', t => {
  const out = mkdtempSync(join(tmpdir(), 'stonehaven-guide-library-'));
  t.after(() => rmSync(out, {recursive: true, force: true}));
  mkdirSync(join(out, 'es'));
  writeFileSync(join(out, 'sitemap.xml'), '<urlset></urlset>');
  const expected = new Map();
  for (const prefix of ['', 'es/']) {
    const file = prefix + 'blog.html';
    const source = readFileSync(file, 'utf8');
    const cards = source.split('<!-- POSTS:START -->')[1].split('<!-- POSTS:END -->')[0];
    expected.set(prefix, [...cards.matchAll(/<h2[^>]*><a href="([^"]+)"/g)].map(match => match[1]).sort());
    writeFileSync(join(out, file), source);
  }
  buildGuideLibrary(out);
  const sitemap = readFileSync(join(out, 'sitemap.xml'), 'utf8');
  for (const [prefix, originals] of expected) {
    const articles = [];
    for (const file of readdirSync(join(out, prefix, 'resources'))) {
      const route = '/' + prefix + 'resources/' + file.replace(/\.html$/, '');
      const archive = readFileSync(join(out, prefix, 'resources', file), 'utf8');
      const counterpart = (prefix ? '/' : '/es/') + 'resources/' + file.replace(/\.html$/, '');
      assert.ok(archive.includes('href="' + counterpart + '"'), 'Missing language link on ' + route);
      assert.ok(sitemap.includes('<loc>https://stonehavencre.com' + route + '</loc>'), route);
      articles.push(...[...archive.matchAll(/<article><h2><a href="([^"]+)"/g)].map(match => match[1]));
    }
    assert.deepEqual(articles.sort(), originals);
    assert.equal(new Set(articles).size, articles.length);
  }
});
