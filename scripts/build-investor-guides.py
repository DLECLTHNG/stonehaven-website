#!/usr/bin/env python3
"""Build the bilingual beginner investor resource library from retained briefs."""
from pathlib import Path
from html import escape
from datetime import date
import json, re
ROOT = Path(__file__).resolve().parent.parent
ORIGIN = 'https://stonehavencre.com'
DATA = json.loads((ROOT/'docs/investor-guides/guides.json').read_text())
HUB = 'first-time-property-investor'
def e(value): return escape(str(value), quote=True)
def route(slug,lang): return ('/es' if lang=='es' else '')+'/resources/'+slug
def render(slug,lang,c):
    es=lang=='es';prefix='/es' if es else '';url=ORIGIN+route(slug,lang)
    base=(ROOT/(prefix.lstrip('/')+'/' if es else '')/'commercial/multifamily.html').read_text()
    base=re.sub(r'<!-- SEARCH-NAV:[A-Z]+:START -->.*?<!-- SEARCH-NAV:[A-Z]+:END -->\n?','',base,flags=re.S)
    head,rest=base.split('<main>',1);footer=rest.split('</main>',1)[1]
    head=re.sub(r'<style>.*?</style>\n?','',head,flags=re.S)
    head=re.sub(r'<script type="application/ld\+json">.*?</script>\n?','',head,flags=re.S)
    head=re.sub(r'<link rel="alternate"[^>]*>\n?','',head)
    head=re.sub(r'<link rel="stylesheet" href="/(?:cre-financing|search-navigation)\.css[^"]*"/>','',head)
    head=re.sub(r'<title>.*?</title>','<title>'+e(c['title'])+'</title>',head,flags=re.S)
    for attr,key,value in [('name','description',c['description']),('property','og:title',c['title']),('property','og:description',c['description']),('property','og:url',url),('property','og:type','website' if slug==HUB else 'article')]:
        head=re.sub(r'<meta '+attr+'="'+key+r'"[^>]*>','<meta '+attr+'="'+key+'" content="'+e(value)+'"/>',head)
    head=re.sub(r'<link rel="canonical"[^>]*>',f'<link rel="canonical" href="{url}"/>',head)
    head=re.sub(r'<body(?:\s[^>]*)?>(?:<noscript>.*?</noscript>)?','<body class="investor-page">',head,flags=re.S)
    head=head.replace('href="/es/commercial/multifamily"','href="'+route(slug,'es')+'"').replace('href="/commercial/multifamily"','href="'+route(slug,'en')+'"')
    head=head.replace('class="line active"','class="line"')
    alternates=''.join(f'<link rel="alternate" hreflang="{language}" href="{ORIGIN}{route(slug,target)}"/>' for language,target in [('en','en'),('es','es'),('x-default','en')])
    crumbs=[(prefix+'/', 'Inicio' if es else 'Home')]
    if slug!=HUB:crumbs.append((route(HUB,lang),'Primeros pasos como inversionista' if es else 'First-time investor guides'))
    crumbs.append((route(slug,lang),c['name']))
    schema=[{'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':i+1,'name':label,'item':ORIGIN+path} for i,(path,label) in enumerate(crumbs)]}]
    item={'@context':'https://schema.org','@type':'CollectionPage' if slug==HUB else 'Article','@id':url,'url':url,'name':c['title'],'headline':c['h1'],'description':c['description'],'inLanguage':lang,'datePublished':DATA['published'],'dateModified':DATA['updated'],'mainEntityOfPage':url,'author':{'@type':'Organization','name':'Stonehaven Lending','@id':ORIGIN+'/#org'},'publisher':{'@type':'Organization','name':'Stonehaven Lending','@id':ORIGIN+'/#org'},'citation':[DATA['sources'][key]['url'] for key in c['sources']]}
    if slug==HUB:item['mainEntity']={'@type':'ItemList','itemListElement':[{'@type':'ListItem','position':i+1,'url':ORIGIN+route(key,lang),'name':value[lang]['name']} for i,(key,value) in enumerate((item for item in DATA['pages'].items() if item[0]!=HUB))]}
    schema.append(item)
    head=head.replace('</head>','<link rel="stylesheet" href="/investor-guides.css?v=2"/>'+alternates+''.join('<script type="application/ld+json">'+json.dumps(x,ensure_ascii=False)+'</script>' for x in schema)+'</head>')
    trail='<nav class="ig-breadcrumb wrap" aria-label="'+('Ruta de navegación' if es else 'Breadcrumb')+'"><ol>'+''.join('<li>'+('<span aria-current="page">'+e(label)+'</span>' if path==route(slug,lang) else '<a href="'+path+'">'+e(label)+'</a>')+'</li>' for path,label in crumbs)+'</ol></nav>'
    d=date.fromisoformat(DATA['updated'])
    months_es=('enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre')
    date_label=f'{d.day} de {months_es[d.month-1]} de {d.year}' if es else d.strftime('%B %d, %Y').replace(' 0',' ')
    hero='<section class="ig-hero"><div class="wrap"><span class="eyebrow">'+('Aprenda. Prepare. Invierta.' if es else 'Learn. Prepare. Invest.')+'</span><h1>'+e(c['h1'])+'</h1><p class="ig-intro">'+e(c['description'])+'</p><p class="ig-byline">Stonehaven Lending · '+('Actualizado el ' if es else 'Updated ')+date_label+'</p></div></section>'
    toc='<nav class="ig-toc" aria-label="'+('En esta guía' if es else 'In this guide')+'"><strong>'+('En esta guía' if es else 'In this guide')+'</strong><ol>'+''.join('<li><a href="#'+e(s['id'])+'">'+e(s['heading'])+'</a></li>' for s in c['sections'])+'</ol></nav>'
    answer='<div class="ig-answer"><p>'+c['answer']+'</p></div>'
    body=''.join('<section id="'+e(s['id'])+'"><h2>'+e(s['heading'])+'</h2>'+s['html']+'</section>' for s in c['sections'])
    if slug==HUB:
        cards='<div class="ig-cards">'+''.join('<a class="ig-card" href="'+route(key,lang)+'"><span class="ig-step">'+('Guía ' if es else 'Guide ')+str(i)+'</span><h3>'+e(value[lang]['name'])+'</h3><p>'+e(value[lang]['card'])+'</p><span class="ig-card-link">'+('Leer la guía' if es else 'Read the guide')+' →</span></a>' for i,(key,value) in enumerate(DATA['pages'].items()) if key!=HUB)+'</div>'
        body=body.replace('<!-- GUIDE-CARDS -->',cards)
    related='<section class="ig-related"><h2>'+('Continúe aprendiendo' if es else 'Keep learning')+'</h2><ul>'+''.join('<li><a href="'+route(other,lang)+'">'+e(DATA['pages'][other][lang]['name'])+'</a></li>' for other in c['related'])+'</ul></section>'
    cta_href=prefix+c['cta'];cta_href=cta_href.replace('/es/contact#inquire','/es/contact#enquire')
    cta='<section class="ig-cta"><span class="eyebrow">'+('Hablemos de su próximo paso' if es else 'Let’s work through your next step')+'</span><h2>'+e(c['cta_title'])+'</h2><p>'+e(c['cta_text'])+'</p><div class="ig-actions"><a class="btn-primary" href="'+cta_href+'">'+e(c['cta_label'])+'</a></div><p class="ig-small">'+('Diga que es su primera inversión. Le damos seguimiento por texto o correo. No incluya números de cuenta ni documentos privados en formularios públicos.' if es else 'Tell us this is your first investment. We follow up by text or email. Keep account numbers and private documents out of public forms.')+'</p></section>'
    sources='<section class="ig-sources"><h2>'+('Fuentes y alcance' if es else 'Sources and scope')+'</h2><p>'+('Las fuentes respaldan los conceptos indicados. Los criterios de un prestamista no son universales ni confirman términos disponibles a través de Stonehaven. Los ejemplos son hipotéticos, no operaciones cerradas ni ofertas.' if es else 'Sources support the concepts identified in the guide. One lender’s criteria are not universal and do not establish terms available through Stonehaven. Examples are hypothetical, not closed transactions or offers.')+'</p><ul>'+''.join('<li><a href="'+e(DATA['sources'][key]['url'])+'" rel="noopener">'+e(DATA['sources'][key][lang])+'</a></li>' for key in c['sources'])+'</ul><p><a href="'+prefix+'/editorial-policy">'+('Criterios editoriales' if es else 'Editorial standards')+'</a></p></section>'
    return head+'<main>'+hero+trail+'<div class="wrap ig-layout">'+toc+'<article class="ig-article">'+answer+body+related+cta+sources+'</article></div></main>'+footer

def build():
    for slug,languages in DATA['pages'].items():
        if set(languages)!={'en','es'}:raise ValueError('Both languages required')
        for lang,c in languages.items():
            path=ROOT/(route(slug,lang).lstrip('/')+'.html');path.parent.mkdir(exist_ok=True);path.write_text(render(slug,lang,c))
    sitemap=ROOT/'sitemap.xml';text=sitemap.read_text()
    redirects=ROOT/'_redirects';rules=redirects.read_text();new_rules=[]
    for slug in DATA['pages']:
        for lang in ('en','es'):
            path=route(slug,lang);url=ORIGIN+path
            if '<loc>'+url+'</loc>' not in text:
                text=text.replace('</urlset>',f'<url><loc>{url}</loc><lastmod>{DATA["updated"]}</lastmod></url>\n</urlset>')
            rule=f'{path}.html {path} 301!'
            if rule not in rules.splitlines():new_rules.append(rule)
    sitemap.write_text(text)
    if new_rules:redirects.write_text('\n'.join(new_rules)+'\n'+rules)
    print('Built',len(DATA['pages'])*2,'investor resource pages.')
if __name__=='__main__':build()
