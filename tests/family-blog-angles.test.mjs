import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const posts=JSON.parse(read('docs/family-growth/published-batch.json'));
test('Family guides preserve privacy, bilingual metadata, and correct inquiry routes',()=>{
 for(const p of posts)for(const prefix of ['', 'es/']){
  const html=read(prefix+'blog/'+p.slug+'.html');
  assert.doesNotMatch(html,/site-config\.js|funnel\.js|facebook\.com|googletagmanager|google-analytics|fbq\(/i);
  const scripts=[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(scripts,['/js/blog-ui.js']);
  assert.equal((html.match(/<h1>/g)||[]).length,1);assert.ok(html.includes('https://stonehavencre.com/'+prefix+'blog/'+p.slug));
  const destination=p.audience==='adult-child'?'/family-housing-options':'/buy-a-home-for-parents';
  assert.ok(html.includes('href="'+destination+'"'));assert.doesNotMatch(html,/<form\b/);
  assert.doesNotMatch(html.replace(/<[^>]*>/g,''),/\u2014|&mdash;|\$\d|\d+(?:\.\d+)?\s*%/);
  assert.ok(html.includes(prefix?'hipotétic':'hypothetical'));
  for(const state of ['georgia','alabama','florida','tennessee','north-carolina','south-carolina'])assert.ok(read(prefix+'blog/family-opportunity-mortgage-'+state+'.html').includes('/blog/'+p.slug+'"'));
 }
});
