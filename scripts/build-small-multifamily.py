#!/usr/bin/env python3
"""Build small-multifamily service pages from retained bilingual JSON briefs.

Default input includes the 5-8 unit and acquisition briefs. Pass one or more
brief paths to build only those inputs. Run before build-search-navigation.py.
"""
from datetime import date
from html import escape
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = 'https://stonehavencre.com'
DEFAULT_BRIEFS = ['docs/cre-financing/small-multifamily-service.json',
                  'docs/cre-financing/multifamily-acquisition-service.json']


def e(value):
    return escape(str(value), quote=True)


def schema(data):
    return '<script type="application/ld+json">'+json.dumps(data, ensure_ascii=False)+'</script>'


def render(slug, lang, content, updated):
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug) or lang not in ('en', 'es'):
        raise ValueError('Invalid route or language in small multifamily brief')
    es = lang == 'es'
    prefix = '/es' if es else ''
    route = prefix+'/commercial/'+slug
    url = ORIGIN+route
    base = (ROOT / (prefix.lstrip('/')+'/' if es else '') / 'commercial/multifamily.html').read_text()
    base = re.sub(r'<!-- SEARCH-NAV:[A-Z]+:START -->.*?<!-- SEARCH-NAV:[A-Z]+:END -->\n?', '', base, flags=re.S)
    base = re.sub(r'<link rel="stylesheet" href="/search-navigation\.css[^\"]*"/>', '', base)
    head, after = base.split('<main>', 1)
    footer = after.split('</main>', 1)[1]
    head = re.sub(r'<style>\s*\.cre-asset\{.*?</style>\n?', '', head, flags=re.S)
    head = re.sub(r'<title>.*?</title>', '<title>'+e(content['title'])+'</title>', head, flags=re.S)
    head = re.sub(r'<meta name="description"[^>]*>', '<meta name="description" content="'+e(content['description'])+'"/>', head)
    head = re.sub(r'<link rel="canonical"[^>]*>', f'<link rel="canonical" href="{url}"/>', head)
    head = re.sub(r'<link rel="alternate"[^>]*>\n?', '', head)
    head = re.sub(r'<script type="application/ld\+json">.*?</script>\n?', '', head, flags=re.S)
    head = re.sub(r'<body(?:\s[^>]*)?>(?:<noscript>.*?</noscript>)?', '<body class="cre-page">', head, flags=re.S)
    for name, value in [('og:title', content['title']), ('og:description', content['description']), ('og:url', url)]:
        head = re.sub(r'<meta property="'+name+r'"[^>]*>', '<meta property="'+name+'" content="'+e(value)+'"/>', head)
    head = head.replace('href="/es/commercial/multifamily"', f'href="/es/commercial/{slug}"')
    head = head.replace('href="/commercial/multifamily"', f'href="/commercial/{slug}"')
    head = head.replace('aria-label="Primary"', 'aria-label="Navegación principal"' if es else 'aria-label="Primary"')
    alternates = ''.join(f'<link rel="alternate" hreflang="{language}" href="{ORIGIN}{path}/commercial/{slug}"/>' for language, path in [('en', ''), ('es', '/es'), ('x-default', '')])
    crumbs = [(prefix+'/', 'Inicio' if es else 'Home'), (prefix+'/commercial', 'Comercial' if es else 'Commercial'), (route, content['name'])]
    breadcrumb = {'@context':'https://schema.org', '@type':'BreadcrumbList', 'itemListElement':[
        {'@type':'ListItem', 'position':i+1, 'name':label, 'item':ORIGIN+path} for i, (path,label) in enumerate(crumbs)]}
    service = {'@context':'https://schema.org', '@type':'Service', '@id':url+'#service', 'name':content['name'],
               'url':url, 'description':content['description'], 'serviceType':'Commercial mortgage brokerage',
               'areaServed':{'@type':'Country','name':'United States'}, 'provider':{'@type':'FinancialService', '@id':ORIGIN+'/#org',
               'name':'Stonehaven Lending', 'url':ORIGIN+'/', 'identifier':{'@type':'PropertyValue','propertyID':'NMLS','value':'1752355'}}}
    page = {'@context':'https://schema.org', '@type':'WebPage', '@id':url, 'url':url, 'name':content['title'],
            'description':content['description'], 'inLanguage':lang, 'dateModified':updated,
            'mainEntity':{'@id':url+'#service'}, 'publisher':{'@id':ORIGIN+'/#org'}, 'citation':[ORIGIN+item[0] if item[0].startswith('/') else item[0] for item in content['sources']]}
    local_style = '<style>.small-multifamily-content .cre-section .wrap{max-width:900px}.small-multifamily-content p{margin:0 0 18px;line-height:1.75}.small-multifamily-content ul{padding-left:22px;line-height:1.8;margin:0 0 18px}.small-multifamily-content li{margin-bottom:10px}.small-multifamily-content a{text-decoration:underline;text-underline-offset:3px}.small-multifamily-cta{text-align:center}.small-multifamily-cta p{max-width:650px;margin:0 auto 24px;line-height:1.75}.small-multifamily-cta .cre-hero-actions{justify-content:center}.small-multifamily-content .cre-note{margin-top:20px}.small-multifamily-content h3{margin-bottom:12px}</style>'
    head = head.replace('</head>', '<link rel="stylesheet" href="/cre-financing.css?v=1"/>\n'+local_style+'\n'+alternates+'\n'+''.join(schema(item) for item in [breadcrumb,service,page])+'\n</head>')
    cta = content.get('cta_href') or ('/es/commercial#enquire' if es else '/commercial#inquire')
    hero = f'<section class="page-hero cre-hero"><div class="wrap"><span class="eyebrow">{e(content["eyebrow"])}</span><h1>{content["h1"]}</h1><p>{e(content["intro"])}</p><div class="cre-hero-actions"><a class="btn-primary" href="{cta}">{e(content["cta_label"])}</a></div></div></section>'
    trail = '<nav class="cre-breadcrumb wrap" aria-label="'+('Ruta de navegación' if es else 'Breadcrumb')+'"><ol>'+''.join('<li>'+('<span aria-current="page">'+e(label)+'</span>' if path==route else '<a href="'+path+'">'+e(label)+'</a>')+'</li>' for path,label in crumbs)+'</ol></nav>'
    body = '<div class="small-multifamily-content">'+content['body_html']+'</div>'
    closing = f'<section class="cre-section cre-tint small-multifamily-cta"><div class="wrap"><h2>{e(content["cta_title"])}</h2><p>{e(content["cta_intro"])}</p><div class="cre-hero-actions"><a class="btn-primary" href="{cta}">{e(content["cta_label"])}</a></div></div></section>'
    closing = content.get('inquiry_html') or closing
    d = date.fromisoformat(updated)
    date_text = f'Actualizado el {d.day} de septiembre de {d.year}.' if es and d.month == 9 else ('Actualizado: '+updated+'.' if es else 'Updated '+d.strftime('%B %d, %Y').replace(' 0',' ')+'.')
    sources = '<section class="cre-section cre-sources"><div class="wrap"><h2>'+('Fuentes y criterios editoriales' if es else 'Sources and editorial standards')+'</h2><p>'+e(content['source_note'])+'</p><ul>'+''.join('<li><a href="'+e(link)+'" rel="noopener">'+e(label)+'</a></li>' for link,label in content['sources'])+'</ul><p>'+date_text+' <a href="'+prefix+'/editorial-policy">'+('Criterios editoriales' if es else 'Editorial standards')+'</a> · <a href="/management">'+('Nuestro equipo (en inglés)' if es else 'Meet the team')+'</a></p></div></section>'
    return head+'<main>\n'+'\n'.join([hero,trail,body,closing,sources])+'\n</main>'+footer


def build(paths):
    count = 0
    seen = set()
    for path in paths:
        source = Path(path)
        source = source if source.is_absolute() else ROOT/source
        data = json.loads(source.read_text())
        for slug,languages in data['pages'].items():
            if set(languages) != {'en','es'}:
                raise ValueError(f'{slug}: both English and Spanish are required')
            for lang,content in languages.items():
                target = ROOT/('es/' if lang=='es' else '')/'commercial'/f'{slug}.html'
                if target in seen:
                    raise ValueError(f'Duplicate output: {target}')
                seen.add(target)
                target.write_text(render(slug,lang,content,data['updated']))
                count += 1
    print(f'Built {count} bilingual small-multifamily service pages.')


if __name__ == '__main__':
    paths = sys.argv[1:] or [path for path in DEFAULT_BRIEFS if (ROOT/path).exists()]
    if not paths:
        raise SystemExit('No small-multifamily briefs found')
    build(paths)
