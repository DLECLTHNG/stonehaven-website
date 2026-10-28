#!/usr/bin/env python3
"""Build the bilingual, ungated construction sizing tool from its retained brief."""
from pathlib import Path
from html import escape as e
import json,re
R=Path(__file__).resolve().parent.parent
DATA=json.loads((R/'docs/construction-growth/calculator.json').read_text())
SOURCE='https://www.occ.treas.gov/publications-and-resources/publications/comptrollers-handbook/files/commercial-real-estate-lending/pub-ch-commercial-real-estate.pdf'
DEFAULTS={'land':400000,'payoff':0,'hard':1200000,'soft':200000,'contingency':100000,'finance':100000,'excluded':0,'value':3000000,'ltc':75,'ltv':65}
def field(k,c):
 label,help=c['fields'][k]; pct=k in ['ltc','ltv']; minimum='0.1' if pct else ('1' if k=='value' else '0'); maximum=' max="100"' if pct else ''
 return f'<div class="planner-field" id="cp-{k}-field"><label for="cp-{k}">{e(label)}</label><input id="cp-{k}" type="number" min="{minimum}"{maximum} step="any" inputmode="decimal" value="{DEFAULTS[k]}" aria-describedby="cp-{k}-help" required/><small id="cp-{k}-help">{e(help)}</small></div>'
for lang,c in DATA.items():
 es=lang=='es';prefix='/es' if es else '';route=prefix+'/construction-loan-calculator'; url='https://stonehavencre.com'+route
 shell=(R/'commercial-loan-calculator.html').read_text()
 shared=(R/('es/commercial.html' if es else 'commercial.html')).read_text()
 shell=shell.replace('<html lang="en">',f'<html lang="{lang}">')
 shell=re.sub(r'<header\b.*?</header>',lambda _:re.search(r'<header\b.*?</header>',shared,re.S)[0],shell,count=1,flags=re.S)
 if es:
  shell=re.sub(r'<footer\b.*?</footer>',lambda _:re.search(r'<footer\b.*?</footer>',shared,re.S)[0],shell,count=1,flags=re.S)
 head=shell[:shell.index('<main>')]
 head=re.sub(r'<script type="application/ld\+json">.*?</script>','',head,flags=re.S)
 head=re.sub(r'<title>.*?</title>',lambda _:f'<title>{e(c["title"])}</title>',head)
 for name,value in [('description',c['desc']),('og:title',c['title']),('og:description',c['desc']),('og:url',url),('twitter:title',c['title']),('twitter:description',c['desc'])]:
  head=re.sub(r'(<meta (?:name|property)="'+name+r'" content=")[^"]*("\s*/?>)',lambda m:m[1]+e(value)+m[2],head)
 head=re.sub(r'<link rel="canonical"[^>]+>',f'<link rel="canonical" href="{url}"/>',head)
 head=re.sub(r'<link rel="alternate"[^>]+>','',head)
 head=head.replace('js/commercial-calc.js?v=1','/js/construction-math.js?v=1')
 # Root-relative assets work on both language paths.
 head=re.sub(r'((?:href|src)=")(?:\.\./)*(styles\.css|funnel\.css|js/)',r'\1/\2',head)
 head=head.replace('src="//js/','src="/js/')
 def language_link(m):
  return re.sub(r'href="[^"]*"', 'href="'+('/es' if m[2]=='ES' else '')+'/construction-loan-calculator"',m[0])
 head=re.sub(r'<a\b([^>]*class="lang-opt[^>]*)>(EN|ES)</a>',language_link,head)
 schema={'@context':'https://schema.org','@type':'WebPage','@id':url+'#webpage','url':url,'name':c['heading'],'description':c['desc'],'inLanguage':lang,'datePublished':'2026-10-28','dateModified':'2026-10-28','author':{'@type':'Organization','name':'Stonehaven Lending','url':'https://stonehavencre.com/management'},'citation':SOURCE}
 extras=''.join(f'<link rel="alternate" hreflang="{l}" href="https://stonehavencre.com{p}/construction-loan-calculator"/>' for l,p in [('en',''),('es','/es'),('x-default','')])
 extras+='<link rel="stylesheet" href="/construction-planner.css?v=1"/><script src="/js/construction-planner.js?v=1" defer></script><script type="application/ld+json">'+json.dumps(schema,ensure_ascii=False)+'</script>'
 head=head.replace('</head>',extras+'</head>')
 footer=re.search(r'<footer\b.*?</footer>',shell,re.S)[0]
 mode=f'<div class="planner-field full"><label for="cp-mode">{e(c["mode"])}</label><select id="cp-mode"><option value="owned">{e(c["modes"][0])}</option><option value="purchase">{e(c["modes"][1])}</option></select></div>'
 inputs=''
 for i,keys in enumerate([['land','payoff'],['hard','soft','contingency','finance','excluded'],['value','ltc','ltv']]):
  inputs+=f'<fieldset><legend>{e(c["groups"][i])}</legend><div class="planner-fields">'+(mode if i==0 else '')+''.join(field(k,c) for k in keys)+'</div></fieldset>'
 rows=''.join(f'<div'+(' id="cp-land-equity-row"' if k=='landEquity' else '')+f'><dt>{e(v)}</dt><dd id="cp-{k}">-</dd></div>' for k,v in c['rows'].items())
 stress='<div class="planner-table" role="region" tabindex="0" aria-label="'+e(c['stress_title'])+'"><table><caption>'+e(c['stress_title'])+'</caption><thead><tr>'+''.join('<th scope="col">'+e(x)+'</th>' for x in c['stress_headers'])+'</tr></thead><tbody>'
 stress+=''.join(f'<tr><th scope="row">{e(label)}</th><td id="cp-stress-loan-{i}">-</td><td id="cp-stress-gap-{i}">-</td></tr>' for i,label in enumerate(c['stress_rows']))+'</tbody></table></div>'
 questions=''.join('<h3>'+e(q)+'</h3><p>'+e(a)+'</p>' for q,a in c['qa'])
 main=f'''<main class="construction-planner-page"><section class="funnel-hero"><span class="eyebrow">{'Planificación de obra nueva' if es else 'Ground-up construction planning'}</span><h1>{e(c['heading'])}</h1><p>{e(c['desc'])}</p></section>
 <div class="wrap"><div class="planner-intro"><p>{e(c['intro'])}</p><p class="planner-note">{e(c['scope'])}</p></div>
 <div id="construction-planner"><div class="planner-layout"><div class="planner-inputs">{inputs}<a class="planner-result-link" href="#cp-summary">{e("Ver mi resultado" if es else "See my result")}</a></div><aside id="cp-summary"><div id="cp-error" class="planner-error" role="status" hidden>{e(c['error'])}</div><div id="cp-results" class="planner-results" aria-live="polite" aria-atomic="true"><h2>{e(c['result'])}</h2><h3>{e(c['loan_label'])}</h3><p class="planner-result-number" id="cp-loan">-</p><p id="cp-binding"></p><h3>{e(c['gap_label'])}</h3><p class="planner-result-number" id="cp-gap">-</p><p class="planner-note">{e(c['result_note'])}</p><dl>{rows}</dl><p id="cp-actual-ratios"></p></div><div class="planner-next-step"><p><strong>{e("¿Desea revisar su proyecto?" if es else "Ready to review your project?")}</strong></p><p>{e("Empiece con su nombre y correo. Los detalles del proyecto son opcionales." if es else "Start with your name and email. Project details are optional.")}</p><a class="btn-primary" data-sh-inquiry-cta="construction-result" href="{prefix}/commercial/construction-loans#quick-inquiry">{e(c['cta'])}</a></div><p class="planner-note">{e(c['privacy'])}</p></aside></div>
 <noscript><p class="planner-error">{'Active JavaScript para cambiar los supuestos. El ejemplo y las fórmulas siguen disponibles abajo.' if es else 'Enable JavaScript to change assumptions. The worked example and formulas remain available below.'}</p></noscript>
 <section class="planner-copy" id="cp-stress"><h2>{e(c['stress_title'])}</h2><p>{e(c['stress_intro'])}</p>{stress}</section></div>
 <article class="planner-copy"><h2 id="methodology">{e(c['method_title'])}</h2>{c['method_body']}<h2>{e(c['example_title'])}</h2>{c['example_body']}<h2>{'Preguntas sobre el resultado' if es else 'Questions about your result'}</h2>{questions}
 <h2>{e(c['sources_title'])}</h2><p>{e(c['sources'])} <a href="{SOURCE}">OCC: Commercial Real Estate Lending</a>.</p><p class="planner-note">{e(c['reviewed'])} · <a href="{prefix}/editorial-policy">{'Criterios editoriales' if es else 'Editorial standards'}</a> · <a href="/management">{'Nuestro equipo' if es else 'Meet the team'}</a></p></article>
 <div class="planner-actions"><a class="btn-primary" href="{prefix}/commercial/construction-loans#quick-inquiry">{e(c['cta'])}</a><a class="btn-primary" href="{prefix}/blog/construction-loan-term-sheet-comparison">{e(c['guide'])}</a></div></div></main>'''
 (R/route.lstrip('/')).with_suffix('.html').write_text(head+main+footer+'</body></html>')
print('Built EN and ES construction planners.')
