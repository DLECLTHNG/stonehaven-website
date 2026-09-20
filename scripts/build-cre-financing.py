#!/usr/bin/env python3
"""Build bilingual CRE service pages from the retained, reviewable source brief."""
from pathlib import Path
from datetime import date
from html import escape
import json
import re

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = 'https://stonehavencre.com'
BRIEF = json.loads((ROOT / 'docs/cre-financing/service-pages.json').read_text())


def e(value):
    return escape(str(value), quote=True)


def script(data):
    return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + '</script>'


def cards(items):
    return ''.join(f'<article class="cre-card"><h3>{e(h)}</h3><p>{e(p)}</p></article>' for h, p in items)


def field(name, label, kind='text', required=True, options=None, help_text=None, full=False):
    field_id = 'cre-' + name
    attrs = ' required' if required else ''
    if help_text:
        attrs += f' aria-describedby="{field_id}-help"'
    if options is not None:
        control = f'<select id="{field_id}" name="{name}"{attrs}>'
        control += ''.join(f'<option value="{e(value)}">{e(text)}</option>' for value, text in options)
        control += '</select>'
    else:
        auto = {'name': 'name', 'email': 'email', 'phone': 'tel', 'state': 'address-level1'}.get(name)
        if auto:
            attrs += f' autocomplete="{auto}"'
        if kind == 'number':
            attrs += ' min="1" step="1" inputmode="numeric"'
        control = f'<input id="{field_id}" name="{name}" type="{kind}"{attrs}/>'
    help_html = f'<p class="cre-field-help" id="{field_id}-help">{e(help_text)}</p>' if help_text else ''
    wrapper_class = 'lf-field full' if full else 'lf-field'
    return f'<div class="{wrapper_class}"><label for="{field_id}">{e(label)}</label>{control}{help_html}</div>'


def form(slug, lang, c):
    es = lang == 'es'
    prefix = '/es' if es else ''
    choose = 'Seleccione una opción' if es else 'Choose an option'
    fields = field('name', 'Nombre' if es else 'Name')
    fields += field('email', 'Correo electrónico' if es else 'Email', 'email')
    fields += field('phone', 'Número de celular' if es else 'Mobile number', 'tel')
    fields += field('state', 'Estado del inmueble' if es else 'Property state')
    fields += field('total_project_cost', 'Costo total del proyecto ($)' if es else 'Total project cost ($)', 'number', help_text=(
        'Incluya adquisición o base de propiedad, obra, gastos indirectos, reservas y contingencia.' if es else
        'Include acquisition or ownership basis, work, soft costs, reserves and contingency.'))
    fields += field('requested_amount', 'Financiamiento solicitado ($)' if es else 'Requested financing ($)', 'number')
    fields += field('project_value', 'Valor terminado estimado ($), opcional' if es else 'Estimated completed value ($), optional', 'number', False,
                    help_text='Valor previsto después de terminar la obra o estabilizar la propiedad.' if es else 'Expected value after work is complete or the property is stabilized.')
    types = [('Ground-up construction', 'Obra nueva'), ('Teardown and rebuild', 'Demolición y reconstrucción'),
             ('Fix and flip', 'Compra, remodelación y reventa'), ('Commercial bridge', 'Puente comercial'),
             ('Value-add / lease-up', 'Mejoras / arrendamiento'), ('Commercial refinance', 'Refinanciamiento comercial'),
             ('Other CRE project', 'Otro proyecto comercial')]
    ordered = sorted(types, key=lambda item: item[0] != c['default_type'])
    fields += field('project_type', 'Tipo de proyecto' if es else 'Project type', options=[('', choose)] + [(v, text if es else v) for v, text in ordered])
    fields += field('property_owned', '¿Ya es dueño del inmueble?' if es else 'Do you own the property already?', options=[('', choose), ('Yes', 'Sí' if es else 'Yes'), ('Under contract', 'Bajo contrato' if es else 'Under contract'), ('No', 'No')])
    times = [('As soon as possible', 'Lo antes posible'), ('Within 30 days', 'Dentro de 30 días'),
             ('30-60 days', '30-60 días'), ('60-90 days', '60-90 días'), ('More than 90 days / exploring', 'Más de 90 días / explorando')]
    fields += field('timeline', '¿Cuándo desea cerrar?' if es else 'When do you want to close?', options=[('', choose)] + [(v, text if es else v) for v, text in times])
    channels = [('Google', 'Google'), ('ChatGPT', 'ChatGPT'), ('Bing / Copilot', 'Bing / Copilot'),
                ('Perplexity', 'Perplexity'), ('Other AI assistant', 'Otro asistente de IA'),
                ('Referral', 'Recomendación'), ('Other', 'Otro')]
    fields += field('discovery_source', '¿Cómo nos encontró? (opcional)' if es else 'How did you find us? (optional)', required=False,
                    options=[('', choose)] + [(v, text if es else v) for v, text in channels], full=slug != 'bridge-loans')
    fields += field('refinance_maturity', 'Vencimiento actual (opcional)' if es else 'Current loan maturity (optional)', 'date', False) if slug == 'bridge-loans' else ''
    intro = ('Comparta los datos básicos. Damos seguimiento por mensaje de texto y buscamos una respuesta inicial en menos de una hora. No es una aprobación de crédito.' if es else
             'Share the basics. We follow up by text and aim for initial deal feedback in under one hour. Initial feedback is not credit approval.')
    note = ('Al enviar, solicita que Stonehaven Lending le contacte por texto o correo sobre esta consulta. El consentimiento no es condición del servicio. Pueden aplicar tarifas de mensajes y datos; responda STOP para cancelar.' if es else
            'By submitting, you ask Stonehaven Lending to contact you by text or email about this inquiry. Consent is not a condition of service. Message and data rates may apply; reply STOP to opt out.')
    caution = ('No incluya números de cuenta, documentos fiscales ni datos privados en este formulario. Podemos coordinar un enlace seguro para documentos.' if es else
               'Keep account numbers, tax records and private documents out of this public form. We can arrange a secure next step for documents.')
    return f'''<section class="lead cre-inquiry" id="inquire"><div class="wrap"><div class="lead-card">
<span class="eyebrow">{'Revisión del proyecto' if es else 'Project review'}</span><h2>{e(c['form_title'])}</h2><p class="sub">{e(intro)}</p>
<form class="lead-form" data-sh-form="commercial-{slug}" data-sh-product="Commercial" data-sh-event="deal_review_request" data-sh-lang="{lang}" data-sh-about-prefix="{e(c['form_prefix'])}" data-sh-thanks="{prefix}/thanks-quote" method="POST" action="{prefix}/thanks-quote" data-netlify="true" netlify-honeypot="company_website">
<input type="hidden" name="form-name" value="lead"/><input type="hidden" name="loan_program" value="{e(c['form_prefix'])}"/>
<input type="text" name="company_website" class="hp-field" tabindex="-1" autocomplete="off" aria-hidden="true"/>
{fields}<div class="lead-actions"><span class="note">{e(note)} <a href="{prefix}/privacy">{'Privacidad' if es else 'Privacy policy'}</a></span><button class="lead-submit" type="submit">{'Revisar mi proyecto' if es else 'Get my project reviewed'}</button></div>
</form><p class="cre-form-fine">{e(caution)}</p></div></div></section>'''


def build(slug, lang, c):
    es = lang == 'es'
    prefix = '/es' if es else ''
    route = prefix + '/commercial/' + slug
    url = ORIGIN + route
    updated = c.get('updated', BRIEF['updated'])
    day = date.fromisoformat(updated)
    months_es = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    updated_label = f'Actualizado el {day.day} de {months_es[day.month - 1]} de {day.year}.' if es else f'Updated {day.strftime("%B")} {day.day}, {day.year}.'
    source = ROOT / ('es/' if es else '') / 'commercial/multifamily.html'
    base = source.read_text()
    base = re.sub(r'<!-- SEARCH-NAV:[A-Z]+:START -->.*?<!-- SEARCH-NAV:[A-Z]+:END -->\n?', '', base, flags=re.S)
    base = base.replace('<link rel="stylesheet" href="/search-navigation.css?v=1"/>', '')
    head, after = base.split('<main>', 1)
    # Reuse the shared site chrome without the source asset page's scoped CSS.
    head = re.sub(r'<style>\s*\.cre-asset\{.*?</style>\n?', '', head, flags=re.S)
    footer = after.split('</main>', 1)[1]
    head = re.sub(r'<title>.*?</title>', f'<title>{e(c["title"])}</title>', head, flags=re.S)
    head = re.sub(r'<meta name="description"[^>]*>', f'<meta name="description" content="{e(c["description"])}"/>', head)
    head = re.sub(r'<link rel="canonical"[^>]*>', f'<link rel="canonical" href="{url}"/>', head)
    head = re.sub(r'<link rel="alternate"[^>]*>\n?', '', head)
    head = re.sub(r'<script type="application/ld\+json">.*?</script>\n?', '', head, flags=re.S)
    head = re.sub(r'<body><noscript>.*?</noscript>', '<body class="cre-page">', head, flags=re.S)
    for name, value in [('og:title', c['title']), ('og:description', c['description']), ('og:url', url)]:
        head = re.sub(r'<meta property="' + name + r'"[^>]*>', f'<meta property="{name}" content="{e(value)}"/>', head)
    head = head.replace('href="/es/commercial/multifamily"', f'href="/es/commercial/{slug}"')
    head = head.replace('href="/commercial/multifamily"', f'href="/commercial/{slug}"')
    head = head.replace('aria-label="Primary"', 'aria-label="Navegación principal"' if es else 'aria-label="Primary"')
    alternates = ''.join(f'<link rel="alternate" hreflang="{language}" href="{ORIGIN}{path}/commercial/{slug}"/>' for language, path in [('en', ''), ('es', '/es'), ('x-default', '')])
    crumbs = [(prefix + '/', 'Inicio' if es else 'Home'), (prefix + '/commercial', 'Comercial' if es else 'Commercial'), (route, c['name'])]
    breadcrumb = {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': i + 1, 'name': label, 'item': ORIGIN + link} for i, (link, label) in enumerate(crumbs)]}
    service = {'@context': 'https://schema.org', '@type': 'Service', '@id': url + '#service', 'name': c['name'],
               'description': c['description'], 'serviceType': c['form_prefix'], 'url': url,
               'areaServed': {'@type': 'Country', 'name': 'United States'},
               'provider': {'@type': 'FinancialService', '@id': ORIGIN + '/#org', 'name': 'Stonehaven Lending', 'url': ORIGIN + '/'}}
    page = {'@context': 'https://schema.org', '@type': 'WebPage', '@id': url, 'url': url, 'name': c['title'],
            'description': c['description'], 'inLanguage': lang, 'dateModified': updated,
            'mainEntity': {'@id': url + '#service'}, 'publisher': {'@id': ORIGIN + '/#org'},
            'citation': [link for link, label in c['sources']]}
    head = head.replace('</head>', '<link rel="stylesheet" href="/cre-financing.css?v=1"/>\n' + alternates + '\n' + ''.join(script(s) for s in [breadcrumb, service, page]) + '\n</head>')
    hero = f'''<section class="page-hero cre-hero"><div class="wrap"><span class="eyebrow">{e(c['eyebrow'])}</span><h1>{c['h1']}</h1><p>{e(c['intro'])}</p><div class="cre-hero-actions"><a class="btn-primary" href="#inquire">{'Solicitar revisión por texto' if es else 'Get a project review by text'}</a><a class="btn-quiet" href="#example">{'Ver un ejemplo' if es else 'See the numbers'}</a></div></div></section>'''
    trail = '<nav class="cre-breadcrumb wrap" aria-label="' + ('Ruta de navegación' if es else 'Breadcrumb') + '"><ol>' + ''.join(
        '<li>' + ('<span aria-current="page">' + e(label) + '</span>' if link == route else '<a href="' + link + '">' + e(label) + '</a>') + '</li>' for link, label in crumbs) + '</ol></nav>'
    answer = f'<section class="cre-section cre-answer"><div class="wrap"><span class="eyebrow">{"Respuesta directa" if es else "The short answer"}</span><h2>{e(c["name"])}</h2><p class="cre-lede">{e(c["answer"])}</p><dl class="cre-facts">' + ''.join(f'<div><dt>{e(k)}</dt><dd>{e(v)}</dd></div>' for k, v in c['facts']) + '</dl></div></section>'
    fits = f'<section class="cre-section cre-tint"><div class="wrap"><h2>{e(c["fit_title"])}</h2><div class="cre-grid">{cards(c["fits"])}</div></div></section>'
    table = '<table><caption class="cre-sr-only">' + e(c['comparison_title']) + '</caption><thead><tr>' + ''.join('<th scope="col">' + e(col) + '</th>' for col in c['columns']) + '</tr></thead><tbody>'
    for row in c['rows']:
        table += '<tr><th scope="row">' + e(row[0]) + '</th>' + ''.join('<td data-label="' + e(c['columns'][i]) + '">' + e(value) + '</td>' for i, value in enumerate(row[1:], 1)) + '</tr>'
    table += '</tbody></table>'
    comparison = f'<section class="cre-section"><div class="wrap"><h2>{e(c["comparison_title"])}</h2><p class="cre-section-intro">{e(c["comparison_intro"])}</p><div class="cre-table">{table}</div></div></section>'
    scenario = f'<section class="cre-section cre-tint" id="example"><div class="wrap"><span class="eyebrow">{"Supuestos transparentes" if es else "Transparent assumptions"}</span><h2>{e(c["scenario_title"])}</h2><p class="cre-section-intro">{e(c["scenario_intro"])}</p><div class="cre-example"><dl class="cre-numbers">' + ''.join(f'<div><dt>{e(k)}</dt><dd>{e(v)}</dd></div>' for k, v in c['scenario_rows']) + '</dl><div class="cre-analysis">' + ''.join(f'<p>{e(p)}</p>' for p in c['scenario_analysis']) + '</div></div></div></section>'
    process = f'<section class="cre-section"><div class="wrap"><h2>{e(c["process_title"])}</h2><div class="cre-grid">{cards(c["process"])}</div></div></section>'
    documents = f'<section class="cre-section cre-tint"><div class="wrap cre-docs"><div><h2>{e(c["docs_title"])}</h2><ul class="cre-checklist">' + ''.join('<li>' + e(item) + '</li>' for item in c['docs']) + f'</ul></div><aside class="cre-note"><h3>{e(c["exclusions_title"])}</h3><p>{e(c["exclusions"])}</p></aside></div></section>'
    questions = f'<section class="cre-section" id="questions"><div class="wrap"><h2>{"Preguntas antes de comenzar" if es else "Questions before you start"}</h2>' + ''.join(f'<details class="cre-faq"><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in c['faqs']) + '</div></section>'
    related = f'<section class="cre-section"><div class="wrap"><h2>{"Guías y ejemplos relacionados" if es else "Related guides and examples"}</h2><div class="cre-grid">' + ''.join(f'<a class="cre-card cre-link-card" href="{e(link)}"><h3>{e(label)}</h3><p>{e(text)}</p><span>{"Leer más" if es else "Explore"} →</span></a>' for link, label, text in c['links']) + '</div></div></section>'
    sources = f'<section class="cre-section cre-sources"><div class="wrap"><h2>{"Fuentes y criterios editoriales" if es else "Sources and editorial standards"}</h2><p>{e(c["source_note"])}</p><ul>' + ''.join(f'<li><a href="{e(link)}" rel="noopener">{e(label)}</a></li>' for link, label in c['sources']) + '</ul><p>' + updated_label + f' <a href="{prefix}/editorial-policy">' + ('Criterios editoriales' if es else 'Editorial standards') + '</a> · <a href="/management">' + ('Nuestro equipo' if es else 'Meet the team') + '</a></p></div></section>'
    output = head + '<main>\n' + '\n'.join([hero, trail, answer, fits, comparison, scenario, process, documents, questions, form(slug, lang, c), related, sources]) + '\n</main>' + footer
    (ROOT / (route.lstrip('/') + '.html')).write_text(output)


for route_slug, languages in BRIEF['pages'].items():
    for language, content in languages.items():
        build(route_slug, language, content)
print('Built 6 bilingual CRE service pages.')
