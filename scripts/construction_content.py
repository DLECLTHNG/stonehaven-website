"""Connect construction guides to the existing builder inquiry journey."""
import json
import re
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / 'docs/construction-growth/posts.json').read_text())
POSTS = DATA['posts']
SOURCES = DATA['sources']
EXISTING_ARTICLES = {
    'atlanta-teardown-rebuild-construction-financing',
    '100-ltc-construction-loans-builder-cash-needed',
    'construction-loan-property-already-owned-mortgage-payoff',
    'construction-loan-interest-reserve-vs-contingency',
    'brookhaven-ga-100-ltc-ground-up-construction',
}
ENTRY_PAGES = {
    '/commercial', '/resources/commercial', '/blog', '/commercial/construction-loans',
    '/commercial/land-development-loans',
    '/commercial/construction-financing-for-architects',
    '/commercial/development-financing-for-architects',
}


def clean(text):
    return re.sub(r'<!-- CONSTRUCTION-CONTENT:START -->.*?<!-- CONSTRUCTION-CONTENT:END -->', '', text, flags=re.S).replace(
        '<link rel="stylesheet" href="/construction-guides.css?v=1"/>', '').replace(
        '<link rel="stylesheet" href="/construction-guides.css?v=2"/>', '')


def transform(text, path):
    text = clean(text)
    es = path.startswith('/es/')
    prefix = '/es' if es else ''
    local = path[3:] if es else path
    article = next((p for p in POSTS if local == '/blog/' + p['slug']), None)
    old_article = local in {'/blog/' + slug for slug in EXISTING_ARTICLES}
    if not (article or old_article or local in ENTRY_PAGES):
        return text
    links = [(prefix + '/commercial/construction-loans', 'Financiamiento de obra nueva' if es else 'Ground-up construction financing')]
    links.append((prefix + '/construction-loan-calculator', 'Calculadora: terreno, LTC y capital faltante' if es else 'Construction calculator: land equity, LTC and funding gap'))
    links += [(prefix + '/blog/' + p['slug'], p['esTitle'] if es else p['title']) for p in POSTS if local != '/blog/' + p['slug']]
    links = [(url, label) for url, label in links if url != path]
    heading = 'Planifique su próxima obra' if es else 'Plan your next ground-up build'
    intro = 'Revise terreno, desembolsos, varias obras y la salida de alquiler antes de comprometer capital.' if es else 'Work through land, draws, multiple starts and the rental exit before committing capital.'
    section = '<!-- CONSTRUCTION-CONTENT:START --><section class="wrap search-topics"><h2>' + heading + '</h2><p>' + intro + '</p><ul class="search-program-links">'
    section += ''.join('<li><a href="' + route + '">' + escape(label) + '</a></li>' for route, label in links)
    section += '</ul></section><!-- CONSTRUCTION-CONTENT:END -->'
    text = text.replace('</main>', section + '</main>')
    if article or old_article:
        # Offer a next step after the opening explanation, without interrupting
        # the answer or making readers finish the entire guide first.
        prompt = '¿Está planificando una obra?' if es else 'Planning a build?'
        copy = ('Comparta ubicación y objetivo. Empiece con su nombre y correo; los detalles del proyecto son opcionales.' if es else
                'Tell us where you are building and what you need to finance. Start with your name and email; project details are optional.')
        label = 'Hablemos de mi proyecto' if es else 'Discuss my project'
        early = '<!-- CONSTRUCTION-CONTENT:START --><aside class="construction-inline-inquiry"><p><strong>' + prompt + '</strong> ' + copy + '</p><a class="btn-primary" data-sh-inquiry-cta="construction-article" href="' + prefix + '/commercial/construction-loans#quick-inquiry">' + label + '</a></aside><!-- CONSTRUCTION-CONTENT:END -->'
        def early_cta(m):
            return re.sub(r'<h2\b', lambda _: early + '<h2', m[0], count=1)
        text = re.sub(r'<article\b[^>]*class="blog-article"[^>]*>.*?</article>', early_cta, text, flags=re.S)
        text = text.replace('</head>', '<link rel="stylesheet" href="/construction-guides.css?v=2"/></head>')
        cta = 'Revisar mi proyecto de construcción' if es else 'Discuss my construction project'
        title = 'Hablemos de su próxima obra' if es else 'Let’s look at your next build'
        desc = ('Stonehaven actúa como su intermediario hipotecario. Comparta ubicación, presupuesto, terreno, monto solicitado y plazo. Empiece con una consulta breve, sin documentos privados.' if es else
                'Stonehaven acts as your mortgage broker. Share the location, budget, land position, requested financing and timing. Start with a short inquiry, without private documents.')
        def replace_cta(m):
            block = re.sub(r'<h2>.*?</h2>', '<h2>' + title + '</h2>', m[0], count=1, flags=re.S)
            block = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">' + desc + '</p>', block, count=1, flags=re.S)
            return re.sub(r'(<a class="btn-primary" href=")[^"]+(">).*?(</a>)',
                          lambda a: a[1] + prefix + '/commercial/construction-loans#quick-inquiry' + a[2] + cta + a[3],
                          block, count=1, flags=re.S)
        text = re.sub(r'<section class="lead">.*?</section>', replace_cta, text, flags=re.S)
    if article:
        def enrich(m):
            data = json.loads(m[1])
            if data.get('@type') == 'BlogPosting':
                data['citation'] = [SOURCES[k] for k in article['source_keys']]
                data['about'] = {'@type': 'Thing', 'name': 'Ground-up construction financing',
                                 'url': 'https://stonehavencre.com' + prefix + '/commercial/construction-loans'}
            return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + '</script>'
        text = re.sub(r'<script type="application/ld\+json">(.*?)</script>', enrich, text, flags=re.S)
    return text
