import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const run = (method, args) => {
  const result = spawnSync('python3', ['-c', "import json,sys;sys.path.insert(0,'scripts');import article_quality as m;p=json.load(sys.stdin);print(json.dumps(getattr(m,p['method'])(*p['args'])))"], {encoding:'utf8', input:JSON.stringify({method,args})});
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
};
const path = '/blog/existing-guide';
const brief = {date:'2026-09-15', contentRevision:{updated:'2026-11-01',citations:['https://www.consumerfinance.gov/']}, en:{title:'A clear financing question',desc:'A <useful> explanation',terms:[['Scope','Illustrative']],body:['An answer with a <a href="/dscr">useful link</a>.',{h:'Questions'},{h:'What changes?',level:3},'The explanation.']}};
const revisions = {[path]:[brief,'en']};
const tracking = '<script src="/js/funnel.js" defer></script>';
const inquiry = '<section class="lead"><form data-sh-form><input name="name" required><input name="email" type="email" required><button>Submit</button></form></section>';
const input = '<html><head><meta name="description" content="old"/><script type="application/ld+json">'+JSON.stringify({'@type':'BlogPosting',datePublished:'2026-09-15',dateModified:'2026-09-15',author:{'@type':'Organization',name:'Stonehaven Lending'}})+'</script>'+tracking+'</head><body><main><section class="funnel-hero"><h1>Old</h1><p>Old summary</p><p style="font-size:13px;color:gray;">Stonehaven Lending · 2026-09-15</p></section><article class="blog-article">Old article</article>'+inquiry+'</main></body></html>';

test('article refresh preserves inquiry, tracking, author and publication date while updating visible content', () => {
  const output = run('transform',[input,path,revisions]);
  assert.ok(output.includes(tracking));
  assert.ok(output.includes(inquiry));
  assert.match(output, /<h3[^>]*>What changes\?<\/h3>/);
  assert.match(output, /A &lt;useful&gt; explanation/);
  assert.match(output, /Updated <time datetime="2026-11-01">2026-11-01<\/time>/);
  const schema = JSON.parse(output.match(/application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema.datePublished, '2026-09-15');
  assert.equal(schema.dateModified, '2026-11-01');
  assert.equal(schema.author.name, 'Stonehaven Lending');
  assert.equal(run('transform',[output,path,revisions]),output);
});

test('article refresh cannot alter a page that has not opted into revision', () => {
  assert.equal(run('transform',[input,'/heloc-application',revisions]),input);
  assert.equal(run('transform',[input,'/blog/family-guide',revisions]),input);
});

test('sitemap changes only materially revised article dates', () => {
  const xml='<urlset><url><loc>https://stonehavencre.com'+path+'</loc><lastmod>2026-09-15</lastmod></url><url><loc>https://stonehavencre.com/heloc</loc><lastmod>2026-10-28</lastmod></url></urlset>';
  const output=run('update_sitemap',[xml,revisions]);
  assert.ok(output.includes(path+'</loc><lastmod>2026-11-01</lastmod>'));
  assert.ok(output.includes('/heloc</loc><lastmod>2026-10-28</lastmod>'));
  assert.equal(run('update_sitemap',[output,revisions]),output);
});
