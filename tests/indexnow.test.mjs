import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalUrls, assertLivePage} from '../scripts/notify-indexnow.mjs';
const origin='https://stonehavencre.com';
const sitemap='<urlset><url><loc>'+origin+'/</loc></url><url><loc>'+origin+'/commercial/construction-loans</loc></url></urlset>';
test('IndexNow only submits distinct public canonical sitemap routes',()=>{
 assert.deepEqual(canonicalUrls(['/commercial/construction-loans','/commercial/construction-loans','/'],sitemap,origin),[origin+'/commercial/construction-loans',origin+'/']);
 for(const p of ['/thanks-quote','/contact?email=private@example.com','//elsewhere.example','/../private','https://elsewhere.example','/commercial/construction-loans#form']) {
  assert.throws(()=>canonicalUrls([p],sitemap,origin));
 }
 assert.throws(()=>canonicalUrls([],sitemap,origin));
});

const url=origin+'/commercial/construction-loans';
const local=`<html><head><link rel="canonical" href="${url}"></head><body><main id="main"><h1>Construction financing</h1><a href="/commercial">Commercial</a><form class="lead-form" data-sh-form="cre-review" method="POST" action="/thanks-quote" data-netlify="true" netlify-honeypot="company_website"><input type="hidden" name="form-name" value="lead"/><label for="project">Project value</label><input id="project" name="project_value" type="number" required/></form></main></body></html>`;
const live=local.replace(/<form[^>]*>/,"<form action='/thanks-quote' class='lead-form' data-sh-form='cre-review' method='POST'>");

test('IndexNow accepts known Netlify form transformations without relaxing content parity',()=>{
 assert.doesNotThrow(()=>assertLivePage(local,live,url));
 for(const changed of [
  live.replace('Construction financing','Construction funding'),
  live.replace('href="/commercial"','href="/contact"'),
  live.replace('name="project_value"','name="requested_amount"'),
  live.replace('type="number" required','type="number"'),
  live.replace("action='/thanks-quote'","action='/other'")
 ]) assert.throws(()=>assertLivePage(local,changed,url),/Changed content is not live/);
 assert.throws(()=>assertLivePage(local,live.replace(/<main[\s\S]*<\/main>/,''),url),/Changed content is not live/);
});

test('IndexNow requires the sole canonical link to match, regardless of unrelated matching hrefs',()=>{
 assert.doesNotThrow(()=>assertLivePage(local,live.replace(`rel="canonical" href="${url}"`,`href='${url}' rel='canonical'`),url));
 assert.throws(()=>assertLivePage(local,live.replace(`rel="canonical" href="${url}"`,`rel="canonical" href="${origin}/other"><link rel="alternate" href="${url}"`),url),/Canonical URL mismatch/);
 assert.throws(()=>assertLivePage(local,live.replace('</head>',`<link rel="canonical" href="${url}"></head>`),url),/Canonical URL mismatch/);
 assert.throws(()=>assertLivePage(local,live.replace('rel="canonical"','rel="alternate"'),url),/Canonical URL mismatch/);
});

test('IndexNow rejects noindex metadata and response headers',()=>{
 for(const meta of ["<meta content='noindex, follow' name='robots'>",'<meta name="bingbot" content="none">'])
  assert.throws(()=>assertLivePage(local,live.replace('</head>',meta+'</head>'),url),/Page is not eligible/);
 assert.throws(()=>assertLivePage(local,live,url,'HTTP/2 200\r\nX-Robots-Tag: noindex, nofollow'),/Page is not eligible/);
 assert.doesNotThrow(()=>assertLivePage(local,live,url,'HTTP/2 200\r\nContent-Type: text/html'));
});
