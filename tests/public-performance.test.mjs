import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, mkdtempSync, writeFileSync, mkdirSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {optimizePublic} from '../scripts/optimize-public.mjs';
const root=process.cwd();
const directories=['blog','commercial','dscr','es','heloc','residential','resources'];
function pages(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?pages(join(dir,e.name)):e.name.endsWith('.html')?[join(dir,e.name)]:[]);}
const files=[...readdirSync('.').filter(f=>f.endsWith('.html')),...directories.flatMap(pages)];
const captures=(s,re)=>[...s.matchAll(re)].map(m=>m[0]);
test('delivery optimization preserves every public form, metadata and content body across the site',()=>{
 assert.ok(files.length>400);
 let optimized=0,marketing=0;
 for(const file of files){
  const source=readFileSync(file,'utf8'), output=optimizePublic(source,file,root);
  assert.deepEqual(captures(output,/<form\b[\s\S]*?<\/form>/g),captures(source,/<form\b[\s\S]*?<\/form>/g),file+' forms');
  assert.deepEqual(captures(output,/<meta\b[^>]*>|<title>[\s\S]*?<\/title>|<link\b[^>]*rel="(?:canonical|alternate)"[^>]*>|<script type="application\/ld\+json">[\s\S]*?<\/script>/g),captures(source,/<meta\b[^>]*>|<title>[\s\S]*?<\/title>|<link\b[^>]*rel="(?:canonical|alternate)"[^>]*>|<script type="application\/ld\+json">[\s\S]*?<\/script>/g),file+' metadata');
  const scripts=s=>captures(s,/<script\b[^>]*>[\s\S]*?<\/script>/g).filter(t=>!t.includes('/home-vendors.js')).map(t=>t.replace(/\?v=[^"']+/g,''));
  assert.deepEqual(scripts(output),scripts(source),file+' original scripts and order');
  const body=s=>s.split('</head>')[1]?.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/\s+/g,' ').trim();
  assert.equal(body(output),body(source),file+' body content');
  assert.equal(optimizePublic(output,file,root),output,file+' idempotent');
  if(output!==source){optimized++;assert.ok(!output.includes('href="https://fonts.googleapis.com'),file+' font delivery');}
  const injected=output.includes('/home-vendors.js')&&!source.includes('/home-vendors.js');
  if(injected){marketing++;assert.match(source,/site-config\.js/);assert.match(source,/funnel\.js/);assert.ok(output.indexOf('/home-vendors.js')<output.indexOf('/site-config.js'),file+' initialization order');}
  if(!source.includes('site-config.js'))assert.equal(injected,false,file+' privacy boundary');
 }
 assert.ok(optimized>400);assert.ok(marketing>300);
});
test('protected application, receipt and already optimized homepages remain byte-identical',()=>{
 for(const file of ['heloc-application.html','request-received.html','index.html','es/index.html']){
  const source=readFileSync(file,'utf8');assert.equal(optimizePublic(source,file,root),source,file);
 }
});
test('inline stylesheet position, media and relative asset semantics are retained',t=>{
 const root=mkdtempSync(join(tmpdir(),'sh-performance-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
 mkdirSync(join(root,'assets'));writeFileSync(join(root,'assets','test.css'),'.hero{background:url(./photo.webp)}');
 const source='<head><style>.a{color:red}</style><link rel="stylesheet" href="/assets/test.css" media="print"><style>.a{color:blue}</style></head><form method="POST"></form>';
 const result=optimizePublic(source,'blog/example.html',root);
 assert.match(result,/color:red.*data-site-performance="\/assets\/test.css" media="print".*url\(\/assets\/photo.webp\).*color:blue/);
 assert.ok(result.endsWith('<form method="POST"></form>'));
});
