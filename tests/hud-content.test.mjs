import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const read=p=>readFileSync(p,'utf8');
const services=JSON.parse(read('docs/hud-financing/services.json')).pages;
const posts=JSON.parse(read('docs/hud-financing/posts.json')).posts;

test('HUD pages use the established Commercial lead contract in both languages',()=>{
 for(const slug of Object.keys(services)) for(const lang of ['en','es']){
  const prefix=lang==='es'?'es/':'';
  const html=read(prefix+'commercial/'+slug+'.html');
  const forms=[...html.matchAll(/<form\b[^>]*data-sh-form="quick-[^"]*"[^>]*>[\s\S]*?<\/form>/g)];
  assert.equal(forms.length,1,slug+' '+lang);
  const form=forms[0][0];
  assert.match(form,/data-sh-product="Commercial"/);
  assert.match(form,new RegExp(`data-sh-lang="${lang}"`));
  assert.match(form,/name="form-name" value="lead"/);
  assert.match(form,/name="loan_program" value="[^"]*HUD/);
  assert.match(form,/name="name"[^>]*required/);
  assert.match(form,/name="email"[^>]*required/);
  assert.doesNotMatch(form,/name="(?:ssn|dob|patient|diagnosis)"/);
  assert.match(html,/funnel\.js/);
  assert.match(html,/href="\/search-navigation\.css/);
 }
});

test('HUD editorial sources, caveats and structured citations survive generation',()=>{
 const apartment=read('commercial/hud-223f-loans.html');
 assert.match(apartment,/Criterion 10/);
 assert.match(apartment,/one full month/);
 assert.match(apartment,/three consecutive months/);
 const btr=read('commercial/hud-build-to-rent-financing.html');
 assert.match(btr,/2026-12hsgml\.pdf/);
 assert.match(btr,/No sale of individual parcels/);
 assert.match(btr,/less than three years/);
 const health=read('commercial/hud-232-healthcare-financing.html');
 assert.match(health,/not a universal healthcare premium/);
 const discovery=read('llms-full.txt');
 assert.match(discovery,/HUD multifamily financing uses FHA mortgage insurance/);
 assert.match(discovery,/Criterion 10/);
 for(const post of posts) for(const prefix of ['', 'es/']){
  const html=read(prefix+'blog/'+post.slug+'.html');
  const schemas=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m=>JSON.parse(m[1]));
  const article=schemas.find(x=>x['@type']==='BlogPosting'&&x.datePublished);
  assert.ok(article.citation.length>=2);
  assert.match(html,/hud-financing#quick-inquiry/);
 }
});

test('HUD navigation is idempotent and does not claim governmental lender status',()=>{
 const result=spawnSync('python3',['-c',`
import sys,json
from pathlib import Path
sys.path.insert(0,'scripts')
from hud_content import transform
paths=['/commercial/hud-financing','/blog/hud-223f-vs-221d4','/es/commercial/hud-232-healthcare-financing','/']
for path in paths:
 file=Path('index.html' if path=='/' else path.lstrip('/')+'.html')
 text=file.read_text()
 assert transform(transform(text,path),path)==transform(text,path),path
print(json.dumps(True))
`],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 const briefs=read('docs/hud-financing/services.json');
 assert.doesNotMatch(briefs,/\u2014/);
 for(const post of posts) assert.doesNotMatch(read('docs/blog-briefs/'+post.slug+'.json'),/\u2014/);
});
