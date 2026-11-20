// Build crawlable, bilingual topic archives from the publisher's existing article cards.
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';

const topics = [
  ['building', 'Building or developing', 'Construcción y desarrollo', /construction|builder|teardown|lot-|spec-home|development-financing|land-development|change-order|fix-and-flip|build-to-rent|rehab/],
  ['apartments', 'Commercial and multifamily', 'Inmuebles comerciales y multifamiliares', /hud|multifamily|commercial|apartment|cre-/],
  ['rental', 'Rental property and DSCR', 'Propiedades de alquiler y DSCR', /dscr|rental|brrrr|investment-property/],
  ['equity', 'HELOC and refinancing', 'HELOC y refinanciamiento', /heloc|cash-out|home-equity/],
  ['business', 'Business and SBA', 'Empresas y SBA', /sba|business/],
  ['homes', 'Buying a home', 'Compra de vivienda', /.*/],
];
const resources = {
  building: [
    ['/construction-loan-calculator', 'Calculate a project funding gap', 'Estimar el efectivo necesario para la obra'],
    ['/commercial/construction-loans#quick-inquiry', 'Request a construction project review', 'Solicitar una revisión del proyecto'],
  ],
  apartments: [
    ['/commercial/apartment-construction-loan-takeout', 'Refinancing after construction', 'Refinanciamiento después de la construcción'],
    ['/commercial/affordable-housing-preservation', 'Financing rent-restricted apartments', 'Financiar apartamentos con restricciones de renta'],
    ['/commercial/multifamily-supplemental-loan', 'Supplemental apartment financing', 'Financiamiento complementario para apartamentos'],
  ],
  rental: [['/dscr-analyzer', 'Model rental coverage', 'Calcular la cobertura de la renta']],
  equity: [['/heloc', 'Compare HELOC options', 'Comparar opciones HELOC']],
  homes: [
    ['/bank-statement-loans', 'Bank statement mortgages', 'Hipotecas con estados de cuenta'],
    ['/interest-only-loans', 'Interest-only mortgages', 'Hipotecas con pagos de solo intereses'],
  ],
};
const pageSize = 12;
const directory = 'https://stonehavencre.com';
const pathFor = (prefix, key, n) => prefix + '/resources/guides-' + key + (n > 1 ? '-' + n : '');
const escape = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const anchor = (href,label) => '<a href="'+href+'">'+label+'</a>';

export function buildGuideLibrary(out) {
  if (!existsSync(join(out,'blog.html'))) return;
  const sitemap = join(out,'sitemap.xml');
  const entries = [];
  for (const lang of ['en','es']) {
    const es = lang === 'es', prefix = es ? '/es' : '';
    const file = join(out,es ? 'es/blog.html' : 'blog.html');
    const source = readFileSync(file,'utf8');
    const posts = source.match(/<!-- POSTS:START -->([\s\S]*?)<!-- POSTS:END -->/);
    if (!posts) throw new Error('Missing blog index markers in '+file);
    const groups = new Map(topics.map(([key]) => [key,[]]));
    for (const match of posts[1].matchAll(/<article\b[\s\S]*?<\/article>/g)) {
      const item = match[0].match(/<h2\b[^>]*><a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
      if (!item) throw new Error('Missing article link in '+file);
      const key = topics.find(topic=>topic[3].test(item[1].split('/').pop()))[0];
      groups.get(key).push({href:item[1],title:item[2],description:match[0].match(/<p\b[^>]*>(.*?)<\/p>/s)?.[1] || ''});
    }
    const sections = [];
    for (const [key,en,spanish] of topics) {
      const items = groups.get(key);
      if (!items.length) continue;
      const name = es ? spanish : en;
      const count = Math.ceil(items.length/pageSize);
      sections.push('<section class="library-topic"><h2>'+anchor(pathFor(prefix,key,1),name)+'</h2><ul>'+items.slice(0,3).map(i=>'<li>'+anchor(i.href,i.title)+'</li>').join('')+'</ul>'+anchor(pathFor(prefix,key,1),es?'Ver las '+items.length+' guías':'Browse all '+items.length+' guides')+'</section>');
      for (let n=1;n<=count;n++) {
        const route = pathFor(prefix,key,n), suffix = n===1?'':(es?' · Página ':' · Page ')+n;
        const heading = name+suffix;
        const title = heading+' | Stonehaven Lending';
        const desc = (es?'Guías de Stonehaven sobre ':'Stonehaven financing guides on ')+name.toLowerCase()+'. '+(es?'Página ':'Page ')+n+(es?' de ':' of ')+count+'.';
        const next = Array.from({length:count},(_,i)=>i+1).map(i=>i===n?'<span aria-current="page">'+i+'</span>':anchor(pathFor(prefix,key,i),String(i))).join(' ');
        const related = (resources[key] || []).map(([href, english, spanish]) =>
          '<li>' + anchor(prefix + href, es ? spanish : english) + '</li>').join('');
        const tools = related ? '<aside><h2>' + (es ? 'Para su proyecto' : 'For your project') +
          '</h2><ul>' + related + '</ul></aside>' : '';
        const articles = items.slice((n-1)*pageSize,n*pageSize).map(i=>'<article><h2>'+anchor(i.href,i.title)+'</h2><p>'+i.description+'</p></article>').join('');
        const main = '<main><section class="funnel-hero"><a href="'+prefix+'/blog">'+(es?'Todas las guías':'All financing guides')+'</a><h1>'+heading+'</h1></section><div class="wrap library-archive">'+articles+(count>1?'<nav aria-label="'+(es?'Páginas de guías':'Guide pages')+'">'+next+'</nav>':'')+tools+'</div></main>';
        // Reuse the public document shell, shared scripts and local visual assets.
        let html = source.replace(/<main\b[\s\S]*?<\/main>/,()=>main)
          .replace(/((?:href|src)=")(?:\.\.\/)*(js\/|assets\/)/g,'$1/$2')
          .replace(/(<title>).*?(<\/title>)/,'$1'+escape(title)+'$2')
          .replace(/(<meta (?:property|name)="(?:og:title|twitter:title)" content=")[^"]*/g,'$1'+escape(title))
          .replace(/(<meta (?:property|name)="(?:description|og:description|twitter:description)" content=")[^"]*/g,'$1'+escape(desc))
          .replace(/https:\/\/stonehavencre\.com(\/es)?\/blog(?=["<])/g,(_,esPrefix)=>directory+pathFor(esPrefix||'',key,n))
          .replace(/<a (href=")(\/es)?\/blog(" hreflang=)/g,(_,a,esPrefix,b)=>'<a '+a+pathFor(esPrefix||'',key,n)+b)
          .replace('href="' + (es ? '' : '/es') + '/blog" style="color:var(--stone-400);"',
            'href="' + pathFor(es ? '' : '/es', key, n) + '" style="color:var(--stone-400);"')
          .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,'')
          .replace('</head>','<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@type':'CollectionPage',name:heading,url:directory+route,inLanguage:lang})+'</script></head>');
        const dest = join(out,route.slice(1)+'.html');
        mkdirSync(dirname(dest),{recursive:true}); writeFileSync(dest,html);
        entries.push('<url><loc>'+directory+route+'</loc></url>');
      }
    }
    const selected = ['construction-loan-property-already-owned-mortgage-payoff','construction-loan-interest-reserve-draw-schedule','subdivision-loan-lot-release-prices'];
    const builders = groups.get('building');
    const picks = selected.map(slug=>builders.find(i=>i.href.endsWith('/'+slug))).filter(Boolean);
    const library = '<section id="posts" class="wrap library-index"><h2>'+(es?'Planifique su próxima obra':'Plan your next build')+'</h2><ul class="library-featured">'+picks.map(i=>'<li>'+anchor(i.href,i.title)+'</li>').join('')+'</ul><div class="library-grid">'+sections.join('')+'</div></section>';
    // The state directory and existing product resources stay available below the topic choices.
    const compact = source.replace(/<!-- SEARCH-NAV:TOPICS:START -->[\s\S]*?<!-- SEARCH-NAV:TOPICS:END -->/,()=>library)
      .replace(/<section class="tight">\s*<div class="wrap">\s*<div style="max-width:860px;margin:0 auto;">[\s\S]*?<!-- POSTS:END -->[\s\S]*?<\/section>/,'');
    if (compact.includes('<!-- POSTS:START -->') || !compact.includes('class="library-grid"')) throw new Error('Library layout did not match '+file);
    writeFileSync(file,compact);
  }
  writeFileSync(sitemap,readFileSync(sitemap,'utf8').replace('</urlset>',entries.join('\n')+'\n</urlset>'));
}
