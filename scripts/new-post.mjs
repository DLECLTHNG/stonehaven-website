// node scripts/new-post.mjs post.json  — builds EN+ES post pages from a JSON brief
// {slug, date:"YYYY-MM-DD", en:{title,desc,eyebrow,body:[...paragraphs or {h:..}],terms:[[label,value]]}, es:{...same}}
import fs from 'node:fs';
const b=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
// Validate the entire bilingual brief before writing any output.
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(b.slug || '')) throw new Error('A safe lowercase slug is required');
if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || '')) throw new Error('date must be YYYY-MM-DD');
if (!['guide', 'closing'].includes(b.type)) throw new Error('type must be guide or closing');
for (const lang of ['en', 'es']) {
  const p = b[lang];
  if (!p || !['title', 'desc', 'eyebrow'].every(k => typeof p[k] === 'string' && p[k].trim()) ||
      !Array.isArray(p.body) || !p.body.every(x => typeof x === 'string' || (x && typeof x.h === 'string')) ||
      !Array.isArray(p.terms) || !p.terms.every(x => Array.isArray(x) && x.length === 2 && x.every(v => typeof v === 'string'))) {
    throw new Error(`Invalid ${lang} brief`);
  }
  const prefix = lang === 'es' ? 'es/' : '';
  const url = `https://stonehavencre.com/${prefix}blog/${b.slug}`;
  if (fs.existsSync(`${prefix}blog/${b.slug}.html`) ||
      fs.readFileSync(`${prefix}blog.html`, 'utf8').includes(`/blog/${b.slug}"`) ||
      fs.readFileSync('sitemap.xml', 'utf8').includes(`<loc>${url}</loc>`) ||
      fs.readFileSync('_redirects', 'utf8').split('\n').some(line => line.split(/\s+/).includes(`/${prefix}blog/${b.slug}.html`))) {
    throw new Error(`Post ${b.slug} already exists; edit both published pages instead of publishing twice`);
  }
}
const idx={en:'blog.html',es:'es/blog.html'};
const disclosures = JSON.parse(fs.readFileSync(new URL('./blog-disclosures.json', import.meta.url), 'utf8'));
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
for(const lang of ['en','es']){
  const p=b[lang], path=(lang==='es'?'/es':'')+'/blog/'+b.slug, file=(lang==='es'?'es/':'')+'blog/'+b.slug+'.html';
  let shell=fs.readFileSync(idx[lang],'utf8');
  shell=shell.replace(/<title>[^<]*<\/title>/,`<title>${esc(p.title)} | Stonehaven Lending</title>`)
   .replace(/<meta name="description" content="[^"]*"\/>/,`<meta name="description" content="${esc(p.desc)}"/>`)
   .replace(/<meta property="og:title" content="[^"]*"\/>/,`<meta property="og:title" content="${esc(p.title)}"/>`)
   .replace(/<meta property="og:description" content="[^"]*"\/>/,`<meta property="og:description" content="${esc(p.desc)}"/>`)
   .replace(/https:\/\/stonehavencre\.com\/(es\/)?blog"/g,m=>m) // hreflang handled below
   .replace(/<link rel="canonical" href="[^"]*"\/>/,`<link rel="canonical" href="https://stonehavencre.com${path}"/>`)
   .replace(/hreflang="en" href="[^"]*"/,`hreflang="en" href="https://stonehavencre.com/blog/${b.slug}"`)
   .replace(/hreflang="es" href="[^"]*"/,`hreflang="es" href="https://stonehavencre.com/es/blog/${b.slug}"`)
   .replace(/hreflang="x-default" href="[^"]*"/,`hreflang="x-default" href="https://stonehavencre.com/blog/${b.slug}"`)
   .replace(/<meta property="og:url" content="[^"]*"\/>/,`<meta property="og:url" content="https://stonehavencre.com${path}"/>`)
   .replace(/<script type="application\/ld\+json">.*?<\/script>/s,`<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"BlogPosting","headline":p.title,"description":p.desc,"datePublished":b.date,"dateModified":b.date,"inLanguage":lang,"url":"https://stonehavencre.com"+path,"author":{"@type":"Organization","name":"Stonehaven Lending"},"publisher":{"@type":"Organization","name":"Stonehaven Lending","url":"https://stonehavencre.com/","identifier":{"@type":"PropertyValue","propertyID":"NMLS","value":"1752355"}},"isPartOf":{"@type":"Blog","url":"https://stonehavencre.com"+(lang==='es'?'/es':'')+"/blog"}})}</script>`);
  // depth fix: post lives one level deeper
  shell=shell.replace(/(href|src)="(\.\.\/)?(assets\/|styles\.css|funnel\.css|js\/)/g,(m,a,_,c)=>`${a}="${lang==='es'?'../../':'../'}${c}`);
  const body=p.body.map(x=>typeof x==='string'?`<p style="margin-top:16px;">${x}</p>`:`<h2 style="margin-top:28px;font-size:22px;">${x.h}</h2>`).join('\n');
  const terms=p.terms.map(([k,v])=>`<tr><td style="padding:8px 12px;border-bottom:1px solid rgba(20,35,50,.08);color:var(--stone-400);white-space:nowrap;">${k}</td><td style="padding:8px 12px;border-bottom:1px solid rgba(20,35,50,.08);">${v}</td></tr>`).join('');
  const back=lang==='es'?'← Todos los artículos':'← All articles', tl=b.type==='guide'?(lang==='es'?'Resumen de la guía':'Guide overview'):(lang==='es'?'Términos de la operación':'Deal terms');
  shell=shell.replace(/(<section class="lead">[\s\S]*?<span class="eyebrow">)[\s\S]*?(<\/span>)/, (_, start, end) => start + disclosures[b.type][lang] + end);
  const main=`<main>
<section class="funnel-hero"><span class="eyebrow">${p.eyebrow}</span><h1>${p.title}</h1><p>${p.desc}</p><p style="font-size:13px;color:var(--stone-400);margin-top:16px;">Stonehaven Lending · ${b.date}</p></section>
<section class="tight"><div class="wrap"><div style="max-width:860px;margin:0 auto;">
<article class="blog-article" style="background:#fff;border:1px solid rgba(20,35,50,.08);color:var(--slate-700);font-size:15px;line-height:1.85;">
<span class="eyebrow">${tl}</span><table style="width:100%;border-collapse:collapse;margin:12px 0 8px;font-size:14px;">${terms}</table>
${body}
</article>
<p style="margin-top:22px;font-size:13px;color:var(--stone-400);line-height:1.7;">${shell.match(/<p style="margin-top:22px;font-size:13px;color:var\(--stone-400\);line-height:1\.7;">([\s\S]*?)<\/p>/)[1]}</p>
<p style="margin-top:14px;"><a href="${lang==='es'?'/es':''}/blog" class="line" style="font-size:13px;">${back}</a></p>
</div></div></section>
${shell.slice(shell.indexOf('<section class="lead">'),shell.indexOf('</main>'))}`;
  let out=shell.slice(0,shell.indexOf('<main>'))+main+shell.slice(shell.indexOf('</main>'));
  out=out.replace(/href="\/(es\/)?blog" style="color:var\(--stone-400\);">/,`href="${lang==='es'?'/blog/':'/es/blog/'}${b.slug}" style="color:var(--stone-400);">`);
  fs.mkdirSync(file.replace(/\/[^/]+$/,''),{recursive:true}); fs.writeFileSync(file,out);
  // index card
  let ix=fs.readFileSync(idx[lang],'utf8');
  const card=`<article style="background:#fff;border:1px solid rgba(20,35,50,.08);padding:28px 32px;margin-bottom:16px;"><span class="eyebrow">${p.eyebrow} · ${b.date}</span><h2 style="margin:8px 0 6px;font-size:22px;"><a href="${path}" style="color:inherit;text-decoration:none;">${p.title}</a></h2><p style="color:var(--slate-700);font-size:15px;line-height:1.75;">${p.desc}</p><p style="margin-top:10px;"><a href="${path}" class="line" style="font-size:13px;">${lang==='es'?'Leer el artículo':'Read the article'}</a></p></article>`;
  ix=ix.replace(/<!-- POSTS:START -->[\s\S]*?<p style="color:var\(--slate-700\)[^>]*>[^<]*<\/p>\s*<!-- POSTS:END -->/,'<!-- POSTS:START -->\n<!-- POSTS:END -->');
  ix=ix.replace('<!-- POSTS:START -->','<!-- POSTS:START -->\n'+card);
  ix=ix.replace(/"blogPost":\[/,`"blogPost":[{"@type":"BlogPosting","headline":${JSON.stringify(p.title)},"url":"https://stonehavencre.com${path}","datePublished":"${b.date}"},`).replace(/,\]}<\/script>/,']}</script>');
  fs.writeFileSync(idx[lang],ix);
  fs.appendFileSync('_redirects',`${path}.html ${path} 301!\n`);
  fs.writeFileSync('sitemap.xml',fs.readFileSync('sitemap.xml','utf8').replace('</urlset>',`<url><loc>https://stonehavencre.com${path}</loc><lastmod>${b.date}</lastmod><changefreq>yearly</changefreq><priority>0.5</priority></url>\n</urlset>`));
  console.log('wrote',file);
}

fs.mkdirSync('docs/blog-briefs', {recursive:true});
fs.writeFileSync(`docs/blog-briefs/${b.slug}.json`, JSON.stringify(b, null, 2) + '\n');
