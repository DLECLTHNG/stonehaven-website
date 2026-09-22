import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

function python(code) {
  const result = spawnSync('python3', ['-c', `import sys\nsys.path.insert(0,'scripts')\n${code}`], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test('delivery markup is stable and preserves the three real logo layouts', () => {
  const out = python(`from seo_brand_assets import normalize_brand_assets as f
import json
images = ['<img src="assets/stonehaven-handpainted-logo.png" width="76" height="76" alt="Stonehaven Lending"/>', '<img src="../assets/stonehaven-handpainted-logo.png" width="26" height="26" alt="" loading="lazy"/>', '<img src="/assets/stonehaven-handpainted-logo.png" width="44" height="44" alt=""/>', '<img src="assets/stonehaven-handpainted-logo.png" width="40" height="40" alt="Stonehaven Lending"/>']
print(json.dumps([{'once':f(x),'twice':f(f(x))} for x in images]))`);
  out.forEach(x => assert.equal(x.once, x.twice));
  assert.match(out[0].once, /sizes="\(max-width: 1000px\) 100px, 120px"/);
  assert.match(out[1].once, /sizes="180px"/);
  assert.match(out[1].once, /loading="lazy"/);
  for (const x of out.slice(2)) assert.match(x.once, /width="100" height="100"/);
  out.forEach(x => assert.doesNotMatch(x.once, /handpainted-logo\.png/));
});

test('pillar export retains substantive text and links but excludes forms and hidden UI', () => {
  const out = python(`from seo_discovery import MainText
import json
html = '<header>Site menu</header><main><h1>Loan guide</h1><p>Review <a href="/commercial">commercial options</a> and costs.</p><form><div><label>Private input</label><input name="email"/></div><script>tracking()</script></form><div hidden><div>Hidden result</div></div><p>Visible answer.</p><label>Calculator control</label><table><tr><th>Cost</th><td>$200</td></tr></table></main><footer>Footer links</footer>'
print(json.dumps(MainText().extract(html,'https://stonehavencre.com/guide')))`);
  assert.match(out, /Loan guide/);
  assert.match(out, /commercial options \(https:\/\/stonehavencre.com\/commercial\)/);
  assert.match(out, /Visible answer/);
  assert.match(out, /Cost \| \$200/);
  assert.doesNotMatch(out, /Site menu|Private input|tracking|Hidden result|Calculator control|Footer links/);
});

test('hidden void controls cannot erase the rest of a public AI discovery article', () => {
  const out = python(`from seo_discovery import MainText
import json
print(json.dumps(MainText().extract('<main><input hidden><p>Actual financing answer.</p><img hidden><p>Source explanation.</p></main>','https://stonehavencre.com/guide')))`);
  assert.match(out, /Actual financing answer/);
  assert.match(out, /Source explanation/);
});

test('article reading links retain manual anchors, support Spanish and survive rebuilds', () => {
  const out = python(`from site_presentation import normalize_presentation as f
import json
html = '<main><article class="blog-article"><h2 id="existing">Inicio</h2><h2>¿Cómo preparar?</h2><h2>¿Cómo preparar?</h2><h2>Salida</h2></article></main>'
once=f(html,'/es/blog/example')
print(json.dumps({'once':once,'twice':f(once,'/es/blog/example')}))`);
  assert.equal(out.once, out.twice);
  assert.match(out.once, /href="#existing"/);
  assert.match(out.once, /href="#article-como-preparar"/);
  assert.match(out.once, /href="#article-como-preparar-2"/);
  assert.match(out.once, /En esta guía/);
});
