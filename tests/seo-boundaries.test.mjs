import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
function fixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'stonehaven-seo-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));fs.mkdirSync(path.join(root,'scripts'));
 fs.copyFileSync(new URL('../scripts/check-seo.py',import.meta.url),path.join(root,'scripts/check-seo.py'));
 const page='<html><head><title>Home</title><meta name="description" content="Home description"><link rel="canonical" href="https://stonehavencre.com/"></head><body><h1>Home</h1><a href="#details">Details</a><div id="details">Information</div></body></html>';
 const sitemap=date=>`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://stonehavencre.com/</loc><lastmod>${date}</lastmod></url></urlset>`;
 const write=(name,value)=>fs.writeFileSync(path.join(root,name),value);write('index.html',page);write('sitemap.xml',sitemap('2026-01-01'));
 const run=()=>spawnSync('python3',['scripts/check-seo.py'],{cwd:root,encoding:'utf8'});
 return {write,run,page,sitemap};
}
test('release SEO gate accepts a valid search page and rejects a future crawl date',t=>{
 const f=fixture(t);assert.equal(f.run().status,0);f.write('sitemap.xml',f.sitemap('2999-01-01'));const r=f.run();assert.notEqual(r.status,0);assert.match(r.stderr,/Future lastmod/);
});
test('release SEO gate catches noindex leakage and missing canonical information',t=>{
 const f=fixture(t);f.write('index.html',f.page.replace('</head>','<meta name="robots" content="noindex,follow"></head>'));assert.match(f.run().stderr,/Sitemap includes noindex/);
 f.write('index.html',f.page.replace('rel="canonical"','rel="alternate"'));assert.match(f.run().stderr,/Canonical mismatch/);
});
test('release SEO gate catches broken destinations and anchors before publishing',t=>{
 const f=fixture(t);f.write('index.html',f.page.replace('href="#details"','href="/missing"'));assert.match(f.run().stderr,/Broken link/);
 f.write('index.html',f.page.replace('href="#details"','href="#missing"'));assert.match(f.run().stderr,/Broken fragment/);
});

test('release SEO gate rejects a missing language alternate destination',t=>{
 const f=fixture(t);
 f.write('index.html',f.page.replace('</head>','<link rel="alternate" hreflang="es" href="https://stonehavencre.com/es/missing"></head>'));
 const r=f.run();assert.notEqual(r.status,0);assert.match(r.stderr,/Invalid language alternate/);
});

test('release SEO gate rejects missing breadcrumb pages inside graph and item objects',t=>{
 const f=fixture(t);
 for(const item of ['/missing',{'@id':'https://stonehavencre.com/resources#guides'}]){
  const schema={'@context':'https://schema.org','@graph':[{'@type':['BreadcrumbList'],'itemListElement':[{'@type':'ListItem',position:1,name:'Missing',item}]}]};
  f.write('index.html',f.page.replace('</head>',`<script type="application/ld+json">${JSON.stringify(schema)}</script></head>`));
  const r=f.run();assert.notEqual(r.status,0);assert.match(r.stderr,/Broken breadcrumb destination/);
 }
});

test('release SEO gate checks breadcrumb paths without requiring fragments or external pages locally',t=>{
 const f=fixture(t);
 const schema={'@type':'BreadcrumbList',itemListElement:[
  {'@type':'ListItem',position:1,name:'Home',item:{'@id':'https://stonehavencre.com/#schema-entity'}},
  {'@type':'ListItem',position:2,name:'External',item:'https://example.com/resources'},
  {'@type':'ListItem',position:3,name:'Current page'}
 ]};
 f.write('index.html',f.page.replace('</head>',`<script type="application/ld+json">${JSON.stringify(schema)}</script></head>`));
 const r=f.run();assert.equal(r.status,0,r.stderr);
});
