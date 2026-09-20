#!/usr/bin/env python3
"""Build the factual Georgia CRE service page and its Spanish mirror."""
from datetime import date
from html import escape
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = 'https://stonehavencre.com'
SOURCE = json.loads((ROOT / 'docs/cre-financing/georgia-service.json').read_text())


def e(value):
    return escape(str(value), quote=True)


def ld(data):
    return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + '</script>'


def paragraphs(items):
    return '<div class="cre-analysis">' + ''.join('<p>' + e(text) + '</p>' for text in items) + '</div>'


def section(data, index):
    body = '<h2>' + e(data['title']) + '</h2>'
    if data.get('intro'):
        body += '<p class="cre-section-intro">' + e(data['intro']) + '</p>'
    if data.get('paragraphs'):
        body += paragraphs(data['paragraphs'])
    if data.get('items'):
        body += '<ul class="cre-checklist" style="margin-top:24px;">' + ''.join('<li>' + e(item) + '</li>' for item in data['items']) + '</ul>'
    if data.get('cards'):
        body += '<div class="cre-grid">' + ''.join(
            '<article class="cre-card"><h3>' + e(card['title']) + '</h3><p>' + e(card['text']) + '</p><p style="margin-top:18px;"><a href="' + e(card['href']) + '">' + e(card['label']) + '</a></p></article>'
            for card in data['cards']) + '</div>'
    if data.get('link'):
        link = data['link']
        body += '<p style="margin-top:24px;"><a href="' + e(link['href']) + '">' + e(link['label']) + '</a>. ' + e(link['text']) + '</p>'
    return '<section class="cre-section' + (' cre-tint' if index % 2 == 0 else '') + '"><div class="wrap">' + body + '</div></section>'


def build(language):
    es = language == 'es'
    prefix = '/es' if es else ''
    c = SOURCE[language]
    route = prefix + SOURCE['route']
    url = ORIGIN + route
    base = (ROOT / ('es/' if es else '') / 'commercial/multifamily.html').read_text()
    base = re.sub(r'<!-- SEARCH-NAV:[A-Z]+:START -->.*?<!-- SEARCH-NAV:[A-Z]+:END -->\n?', '', base, flags=re.S)
    base = re.sub(r'<link rel="stylesheet" href="/search-navigation\.css[^>]*>', '', base)
    head, remainder = base.split('<main>', 1)
    footer = remainder.split('</main>', 1)[1]
    head = re.sub(r'<style>\s*\.cre-asset\{.*?</style>\n?', '', head, flags=re.S)
    head = re.sub(r'<title>.*?</title>', '<title>' + e(c['title']) + '</title>', head, flags=re.S)
    head = re.sub(r'<meta name="description"[^>]*>', '<meta name="description" content="' + e(c['description']) + '"/>', head)
    head = re.sub(r'<link rel="canonical"[^>]*>', '<link rel="canonical" href="' + url + '"/>', head)
    head = re.sub(r'<link rel="alternate"[^>]*>\n?', '', head)
    head = re.sub(r'<script type="application/ld\+json">.*?</script>\n?', '', head, flags=re.S)
    # Site tracking remains governed by the shared funnel's existing consent rules.
    head = re.sub(r'<body><noscript>.*?</noscript>', '<body class="cre-page">', head, flags=re.S)
    head = head.replace('href="/es/commercial/multifamily"', 'href="/es/commercial/georgia"')
    head = head.replace('href="/commercial/multifamily"', 'href="/commercial/georgia"')
    head = head.replace('aria-label="Primary"', 'aria-label="Navegación principal"' if es else 'aria-label="Primary"')
    for prop, value in [('og:title', c['title']), ('og:description', c['description']), ('og:url', url)]:
        head = re.sub(r'<meta property="' + prop + r'"[^>]*>', '<meta property="' + prop + '" content="' + e(value) + '"/>', head)
    alternates = ''.join('<link rel="alternate" hreflang="' + lang + '" href="' + ORIGIN + p + SOURCE['route'] + '"/>' for lang, p in [('en', ''), ('es', '/es'), ('x-default', '')])
    crumbs = [(prefix + '/', 'Inicio' if es else 'Home'), (prefix + '/commercial', 'Comercial' if es else 'Commercial'), (route, 'Georgia')]
    org = {'@type': 'FinancialService', '@id': ORIGIN + '/#org', 'name': 'Stonehaven Lending', 'url': ORIGIN + '/', 'identifier': {'@type': 'PropertyValue', 'propertyID': 'NMLS', 'value': SOURCE['facts']['company_nmls']}}
    schemas = [
        {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': label, 'item': ORIGIN + link} for i, (link, label) in enumerate(crumbs)]},
        {'@context': 'https://schema.org', '@type': 'Service', '@id': url + '#service', 'name': c['name'], 'description': c['description'], 'serviceType': 'Commercial real estate mortgage brokerage', 'url': url, 'areaServed': {'@type': 'State', 'name': 'Georgia'}, 'provider': org},
        {'@context': 'https://schema.org', '@type': 'WebPage', '@id': url, 'url': url, 'name': c['title'], 'description': c['description'], 'inLanguage': language, 'dateModified': SOURCE['updated'], 'mainEntity': {'@id': url + '#service'}, 'publisher': {'@id': ORIGIN + '/#org'}}
    ]
    head = head.replace('</head>', '<link rel="stylesheet" href="/cre-financing.css?v=1"/>\n' + alternates + '\n' + ''.join(ld(item) for item in schemas) + '\n</head>')
    hero = '<section class="page-hero cre-hero"><div class="wrap"><span class="eyebrow">' + e(c['eyebrow']) + '</span><h1>' + c['h1'] + '</h1><p>' + e(c['intro']) + '</p><div class="cre-hero-actions"><a class="btn-primary" href="' + e(c['cta_url']) + '">' + e(c['cta']) + '</a></div></div></section>'
    trail = '<nav class="cre-breadcrumb wrap" aria-label="' + ('Ruta de navegación' if es else 'Breadcrumb') + '"><ol>' + ''.join('<li>' + ('<span aria-current="page">' + e(label) + '</span>' if link == route else '<a href="' + e(link) + '">' + e(label) + '</a>') + '</li>' for link, label in crumbs) + '</ol></nav>'
    answer = '<section class="cre-section cre-answer"><div class="wrap"><h2>' + e(c['name']) + '</h2><p class="cre-lede">' + e(c['answer']) + '</p><dl class="cre-facts">' + ''.join('<div><dt>' + e(k) + '</dt><dd>' + e(v) + '</dd></div>' for k, v in c['facts']) + '</dl></div></section>'
    body = ''.join(section(item, i) for i, item in enumerate(c['sections']))
    review = '<section class="lead cre-inquiry"><div class="wrap"><div class="lead-card"><h2>' + e(c['review_title']) + '</h2><p class="sub">' + e(c['review_text']) + '</p><p style="text-align:center;"><a class="btn-primary" style="white-space:normal;text-align:center;" href="' + e(c['cta_url']) + '">' + e(c['cta']) + '</a></p><p class="cre-form-fine">' + e(c['disclosure']) + '</p></div></div></section>'
    day = date.fromisoformat(SOURCE['updated'])
    months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    updated = f'Actualizado el {day.day} de {months[day.month - 1]} de {day.year}.' if es else f'Updated {day.strftime("%B")} {day.day}, {day.year}.'
    standards = '<section class="cre-section cre-sources"><div class="wrap"><h2>' + e(c['standards']) + '</h2><p>' + e(c['standards_text']) + '</p><p style="margin-top:18px;">' + updated + ' <a href="/management">' + e(c['team_label']) + '</a> · <a href="' + prefix + '/editorial-policy">' + e(c['editorial_label']) + '</a></p></div></section>'
    (ROOT / (route.lstrip('/') + '.html')).write_text(head + '<main>\n' + '\n'.join([hero, trail, answer, body, review, standards]) + '\n</main>' + footer)


for lang in ['en', 'es']:
    build(lang)
print('Built Georgia CRE service pages in English and Spanish.')
