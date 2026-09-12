import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');
function fixture(t, type = 'guide') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stonehaven-post-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, 'es'));
  for (const file of ['blog.html', 'es/blog.html', 'sitemap.xml', '_redirects']) fs.copyFileSync(path.join(root, file), path.join(dir, file));
  const content = { title: 'A "sample" guide', desc: 'A "quoted" description', eyebrow: 'Guide', body: ['Example text'], terms: [['Purpose', 'Education']] };
  const brief = { slug: 'publishing-test', date: '2026-09-12', type, en: content, es: content };
  function publish(value = brief) {
    fs.writeFileSync(path.join(dir, 'brief.json'), JSON.stringify(value));
    return spawnSync(process.execPath, [path.join(root, 'scripts/new-post.mjs'), 'brief.json'], { cwd: dir, encoding: 'utf8' });
  }
  return {dir, brief, publish, read: file => fs.readFileSync(path.join(dir, file), 'utf8')};
}
test('publishes a bilingual guide, links, metadata and retained brief', t => {
  const f = fixture(t);
  const result = f.publish();
  assert.equal(result.status, 0, result.stderr);
  for (const prefix of ['', 'es/']) {
    const page = f.read(`${prefix}blog/publishing-test.html`);
    assert.ok(!page.includes('Write-ups are illustrative of transactions already closed.'));
    assert.ok(!page.includes('Las reseñas ilustran operaciones ya cerradas.'));
    assert.ok(page.includes(prefix ? 'ejemplos hipotéticos' : 'hypothetical examples'));
    assert.ok(page.includes('content="A &quot;quoted&quot; description"'));
    assert.equal(f.read('sitemap.xml').split(`<loc>https://stonehavencre.com/${prefix}blog/publishing-test</loc>`).length - 1, 1);
    assert.equal(f.read('_redirects').split(`/${prefix}blog/publishing-test.html /${prefix}blog/publishing-test 301!`).length - 1, 1);
    const index = f.read(`${prefix}blog.html`);
    assert.ok(index.includes(`href="/${prefix}blog/publishing-test"`));
  }
  assert.deepEqual(JSON.parse(f.read('docs/blog-briefs/publishing-test.json')), f.brief);
});
test('repeat publication refuses before changing either index or routing file', t => {
  const f = fixture(t);
  assert.equal(f.publish().status, 0);
  const files = ['blog.html', 'es/blog.html', '_redirects', 'sitemap.xml', 'blog/publishing-test.html', 'es/blog/publishing-test.html'];
  const before = files.map(f.read);
  assert.notEqual(f.publish().status, 0);
  assert.deepEqual(files.map(f.read), before);
});
test('invalid Spanish content and unsafe slugs fail before English output', t => {
  const f = fixture(t);
  const before = f.read('blog.html');
  assert.notEqual(f.publish({...f.brief, es: {title: 'Incomplete'}}).status, 0);
  assert.notEqual(f.publish({...f.brief, slug: '../outside'}).status, 0);
  assert.equal(f.read('blog.html'), before);
  assert.ok(!fs.existsSync(path.join(f.dir, 'blog/publishing-test.html')));
});
test('requires deliberate content classification and retains closing disclosure', t => {
  const f = fixture(t, 'closing');
  assert.notEqual(f.publish({...f.brief, type: undefined}).status, 0);
  assert.equal(f.publish().status, 0);
  assert.ok(f.read('blog/publishing-test.html').includes('Write-ups are illustrative of transactions already closed.'));
  assert.ok(f.read('es/blog/publishing-test.html').includes('Las reseñas ilustran operaciones ya cerradas.'));
});
test('long published articles and blog indexes never depend on reveal thresholds', () => {
  for (const prefix of ['', 'es/']) {
    const index = fs.readFileSync(path.join(root, prefix, 'blog.html'), 'utf8');
    assert.ok(!/id="posts"[^>]*class="reveal"/.test(index));
    for (const name of fs.readdirSync(path.join(root, prefix, 'blog'))) {
      if (!name.endsWith('.html')) continue;
      const html = fs.readFileSync(path.join(root, prefix, 'blog', name), 'utf8');
      assert.ok(!/<article[^>]*class="reveal"/.test(html), `${prefix}${name}`);
    }
  }
});
test('Family publishing requires an audience and never inherits advertising tags', t => {
  for (const audience of ['parents','adult-child']) {
    const f=fixture(t);
    assert.notEqual(f.publish({...f.brief,product:'Family'}).status,0);
    const result=f.publish({...f.brief,product:'Family',familyAudience:audience});
    assert.equal(result.status,0,result.stderr);
    for(const prefix of ['', 'es/']) {
      const page=f.read(prefix+'blog/publishing-test.html');
      assert.doesNotMatch(page,/site-config\.js|funnel\.js|facebook\.com|googletagmanager|fbq\(/i);
      assert.equal((page.match(/src="\/js\/blog-ui.js"/g)||[]).length,1);
      assert.ok(page.includes('href="'+(audience==='parents'?'/buy-a-home-for-parents':'/family-housing-options')+'"'));
      assert.doesNotMatch(page,/class="[^"]*\breveal\b/);
    }
  }
});
