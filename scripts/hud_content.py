"""Connect the HUD cluster with crawlable links, citations and existing inquiries."""
import json
import re
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POSTS = json.loads((ROOT / 'docs/hud-financing/posts.json').read_text())['posts']
SOURCES = {s['key']: s['url'] for s in json.loads((ROOT / 'docs/hud-financing/sources.json').read_text())['sources']}
SERVICES = [
 ('hud-financing', 'HUD financing overview', 'Guía de financiamiento HUD'),
 ('hud-223f-loans', 'Apartment acquisition and refinance', 'Compra y refinanciamiento de apartamentos'),
 ('hud-221d4-construction-loans', 'Apartment construction and substantial rehabilitation', 'Construcción y rehabilitación multifamiliar'),
 ('hud-build-to-rent-financing', 'Build-to-rent communities', 'Comunidades construidas para alquilar'),
 ('hud-232-healthcare-financing', 'Residential care facilities', 'Centros residenciales de cuidados'),
]


def clean(text):
    return re.sub(r'<!-- HUD-CONTENT:START -->.*?<!-- HUD-CONTENT:END -->', '', text, flags=re.S)


def transform(text, path):
    text = clean(text)
    es = path.startswith('/es/')
    prefix = '/es' if es else ''
    local = path[3:] if es else path
    article = next((p for p in POSTS if local == '/blog/' + p['slug']), None)
    hud_page = local in ['/commercial/' + item[0] for item in SERVICES]
    entry = local in ['/', '/commercial/multifamily', '/commercial/multifamily-acquisition',
                     '/commercial/construction-loans', '/commercial/bridge-loans',
                     '/commercial/development-financing-for-architects', '/resources/commercial', '/blog']
    if not (article or hud_page or entry):
        return text
    if article or hud_page:
        css = '<link rel="stylesheet" href="/hud-financing.css?v=1"/>'
        if css not in text:
            text = text.replace('</head>', css + '</head>')
        body_class = 'hud-article' if article else 'hud-page'
        def mark_body(m):
            tag = m[0]
            classes = re.search(r'class="([^"]*)"', tag)
            if classes:
                if body_class not in classes[1].split():
                    tag = tag.replace(classes[0], 'class="' + classes[1] + ' ' + body_class + '"')
                return tag
            return tag[:-1] + ' class="' + body_class + '">'
        text = re.sub(r'<body\b[^>]*>', mark_body, text, count=1)
    title = 'Explore el financiamiento HUD' if es else 'Explore HUD financing'
    if article or hud_page:
        links = [(prefix + '/commercial/' + slug, sp if es else en) for slug, en, sp in SERVICES
                 if local != '/commercial/' + slug]
        links += [(prefix + '/blog/' + post['slug'], post['esTitle'] if es else post['title'])
                  for post in POSTS if local != '/blog/' + post['slug']]
        intro = ('Compare el programa, el plan operativo y el capital necesario.' if es else
                 'Compare the program, operating plan and capital needed.')
    else:
        links = [(prefix + '/commercial/hud-financing', 'Programas HUD para inmuebles comerciales' if es else 'HUD commercial real estate programs'),
                 (prefix + '/commercial/hud-build-to-rent-financing', 'HUD para comunidades de alquiler' if es else 'HUD build-to-rent financing')]
        intro = ('¿Planea conservar apartamentos o una comunidad de alquiler? Revise adquisición, refinanciamiento y construcción con HUD.' if es else
                 'Planning a long-term apartment or rental-community hold? Explore HUD acquisition, refinance and construction routes.')
    section = '<!-- HUD-CONTENT:START --><section class="wrap search-topics"><h2>' + title + '</h2><p>' + intro + '</p><ul class="search-program-links">'
    section += ''.join('<li><a href="' + route + '">' + escape(label) + '</a></li>' for route, label in links)
    section += '</ul></section><!-- HUD-CONTENT:END -->'
    if hud_page:
        pos = text.find('<!-- INQUIRY-JOURNEY:QUICK:START -->')
        if pos < 0:
            pos = text.index('</main>')
        text = text[:pos] + section + text[pos:]
    else:
        text = text.replace('</main>', section + '</main>')
    if article:
        cta = ('Revisar mi proyecto HUD' if es else 'Discuss my HUD project')
        desc = ('Comparta ubicación, unidades, objetivo, monto solicitado y plazo. Comience con un resumen, sin documentos privados.' if es else
                'Share the location, unit count, purpose, requested amount and timing. Start with a summary, without private documents.')
        def replace_cta(m):
            block = re.sub(r'<h2>.*?</h2>', '<h2>' + cta + '</h2>', m[0], count=1, flags=re.S)
            block = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">' + desc + '</p>', block, count=1, flags=re.S)
            return re.sub(r'(<a class="btn-primary" href=")[^"]+(">).*?(</a>)',
                          lambda a: a[1] + prefix + '/commercial/hud-financing#quick-inquiry' + a[2] + cta + a[3],
                          block, count=1, flags=re.S)
        text = re.sub(r'<section class="lead">.*?</section>', replace_cta, text, flags=re.S)
        def add_citations(m):
            data = json.loads(m[1])
            if data.get('@type') == 'BlogPosting' and data.get('datePublished'):
                data['citation'] = [SOURCES[k] for k in article['source_keys']]
                data['about'] = {'@type': 'Thing', 'name': 'HUD commercial multifamily financing',
                                 'url': 'https://stonehavencre.com/commercial/hud-financing'}
            return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + '</script>'
        text = re.sub(r'<script type="application/ld\+json">(.*?)</script>', add_citations, text, flags=re.S)
    return text
