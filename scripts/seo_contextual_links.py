#!/usr/bin/env python3
"""Contextual reading paths and a reproducible body-link inventory.

build-search-navigation.py calls transform(text, route, pages). This module
never writes public HTML itself. The report command only writes the named
Markdown report, so it can capture both the baseline and regenerated output.
"""
from collections import defaultdict
from html import escape, unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit
import argparse
import re

ORIGIN = 'https://stonehavencre.com'
MARKER = 'CONTEXT'
EXCLUDED_DIRS = {'docs', 'scripts', 'tests', 'downloads', 'node_modules'}
REGIONS = (
    ('Northeast', 'Noreste', ('connecticut', 'maine', 'massachusetts', 'new-hampshire', 'new-jersey', 'new-york', 'pennsylvania', 'rhode-island', 'vermont')),
    ('Midwest', 'Medio Oeste', ('illinois', 'indiana', 'iowa', 'kansas', 'michigan', 'minnesota', 'missouri', 'nebraska', 'north-dakota', 'ohio', 'south-dakota', 'wisconsin')),
    ('South', 'Sur', ('alabama', 'arkansas', 'delaware', 'florida', 'georgia', 'kentucky', 'louisiana', 'maryland', 'mississippi', 'north-carolina', 'oklahoma', 'south-carolina', 'tennessee', 'texas', 'virginia', 'west-virginia')),
    ('West', 'Oeste', ('alaska', 'arizona', 'california', 'colorado', 'hawaii', 'idaho', 'montana', 'nevada', 'new-mexico', 'oregon', 'utah', 'washington', 'wyoming')),
)
RESIDENTIAL_STATES = ('alabama', 'florida', 'georgia', 'north-carolina', 'south-carolina', 'tennessee')


def plain(value):
    return ' '.join(unescape(re.sub(r'<[^>]*>', '', value)).split())


def source_text(pages, route):
    value = pages.get(route)
    if value is None:
        raise ValueError(f'Missing contextual destination: {route}')
    return value[1] if isinstance(value, tuple) else value


def link(pages, path, label):
    source_text(pages, path)
    return f'<a href="{escape(path, quote=True)}">{escape(label)}</a>'


def state_name(slug, es, pages):
    if not es:
        return slug.replace('-', ' ').title()
    article = source_text(pages, f'/es/blog/dscr-loans-{slug}-investor-guide')
    match = re.search(r'<h1[^>]*>(.*?)</h1>', article, re.S)
    title = plain(match[1]) if match else ''
    match = re.search(r'préstamos DSCR en (.*?):', title, re.I)
    if not match:
        raise ValueError(f'Missing Spanish state label: {slug}')
    return match[1]


def guide_topic(pages, slug, es):
    prefix = '/es' if es else ''
    article = source_text(pages, f'{prefix}/blog/dscr-loans-{slug}-investor-guide')
    headings = [plain(h) for h in re.findall(r'<h2[^>]*>(.*?)</h2>', article, re.S)]
    if slug == 'georgia':
        return ('registros del condado e impuestos de una propiedad de alquiler' if es
                else 'county records and taxes for a rental property')
    first_word = headings[0].split()[0]
    return headings[0] if first_word.isupper() else headings[0][0].lower() + headings[0][1:]


def section(heading, content, ident=None):
    attr = f' id="{ident}"' if ident else ''
    return f'<section class="wrap search-topics search-context"{attr}><h2>{escape(heading)}</h2>{content}</section>'


def state_directory(pages, es):
    prefix = '/es' if es else ''
    intro = ('La renta por sí sola no determina el presupuesto. Abra una región y consulte la guía del estado para revisar los registros, impuestos y costos de la propiedad antes de calcular el DSCR. Stonehaven es una correduría hipotecaria y tramita financiamiento DSCR a nivel nacional; la disponibilidad varía por estado.' if es else
             'Rent alone does not determine the budget. Open a region and choose the state guide to check property records, taxes and carrying costs before calculating DSCR. Stonehaven is a mortgage brokerage arranging DSCR financing nationwide; availability varies by state.')
    content = f'<p>{intro}</p><div class="search-state-regions">'
    for en_label, es_label, states in REGIONS:
        content += f'<details class="faq-item"><summary class="faq-q">{es_label if es else en_label}</summary><div class="faq-a"><ul>'
        for state in states:
            name = state_name(state, es, pages)
            target = f'{prefix}/blog/dscr-loans-{state}-investor-guide'
            anchor = link(pages, target, f'Guía DSCR de {name}' if es else f'{name} DSCR guide')
            topic = escape(guide_topic(pages, state, es))
            content += f'<li>{anchor}: '+(f'revise {topic}.' if es else f'review {topic}.')+'</li>'
        content += '</ul></div></details>'
    content += '</div>'
    return section('Guías DSCR por estado' if es else 'DSCR guides by state', content, 'state-guides')


def reading_paths(pages, local, es):
    """Curated sentences, not a sitewide list of loosely related links."""
    prefix = '/es' if es else ''
    def a(path, en, spanish=None):
        translated = prefix + path
        if es and translated in pages:
            return link(pages, translated, spanish or en)
        label = (spanish or en) + ' (en inglés)' if es else en
        return link(pages, path, label)
    paragraphs = []
    heading = 'Prepare la siguiente decisión' if es else 'Prepare the next decision'
    if local in ['/', '/commercial', '/resources/commercial', '/resources/residential', '/blog']:
        paragraphs.append(('¿Está preparando su primera inversión? Nuestro '+a('/resources/first-time-property-investor', 'first-time investor learning center', 'centro de guías para nuevos inversionistas')+' conecta financiamiento de alquiler, renovación y reventa con presupuestos, desembolsos y preparación del expediente. Puede empezar a aprender antes de tener una propiedad bajo contrato.') if es else
                          'Planning your first investment? Our '+a('/resources/first-time-property-investor', 'first-time investor learning center')+' connects rental, fix-and-flip and rehab financing with budgets, draws and deal preparation. You can start learning before you have a property under contract.')
    if local in ['/dscr', '/dscr-analyzer', '/dscr-program-calculator', '/resources/dscr-vs-conventional', '/blog/dscr-loans-explained']:
        paragraphs.append(('La '+a('/resources/first-dscr-loan', 'first DSCR loan guide', 'guía de su primer préstamo DSCR')+' separa la renta admitida del flujo de efectivo real y explica qué preparar como nuevo propietario de alquiler. Incluye un ejemplo de refinanciamiento con fondos menores a los previstos.') if es else
                          'Our '+a('/resources/first-dscr-loan', 'first DSCR loan guide')+' separates qualifying rent from real cash flow and explains what to prepare as a new landlord. It includes a refinance example with less cash available than expected.')
    if local in ['/commercial/fix-and-flip', '/blog/100-ltc-construction-loans-builder-cash-needed', '/blog/45-million-builder-fix-and-flip-capital']:
        paragraphs.append(('Para un primer proyecto, lea la '+a('/resources/first-fix-and-flip-financing', 'first fix-and-flip financing guide', 'guía de financiamiento para su primera renovación y reventa')+'. El ejemplo distingue anticipo de compra, fondos de obra, efectivo necesario y beneficio estimado después de vender.') if es else
                          'For a first project, read our '+a('/resources/first-fix-and-flip-financing', 'first fix-and-flip financing guide')+'. Its worked example separates the acquisition advance, rehab funds, cash requirement and estimated profit after selling.')
    if local in ['/commercial/bridge-loans', '/commercial/construction-loans', '/resources/bridge-vs-permanent-financing']:
        paragraphs.append(('Si la inversión requiere mejoras, la '+a('/resources/first-rehab-loan', 'first rehab loan guide', 'guía de su primer préstamo de rehabilitación')+' conecta el alcance, los pagos al contratista y los desembolsos con la venta o el refinanciamiento previsto. Revise también la '+a('/resources/investment-property-deal-checklist', 'investment deal checklist', 'lista para preparar el proyecto')+' antes de comparar propuestas.') if es else
                          'If the investment needs improvements, our '+a('/resources/first-rehab-loan', 'first rehab loan guide')+' connects the scope, contractor payments and draws with the planned sale or refinance. Use the '+a('/resources/investment-property-deal-checklist', 'investment deal checklist')+' before comparing proposals.')
    if local in ['/commercial', '/commercial/multifamily', '/resources/commercial']:
        paragraphs.append(('Para comprar un edificio de alquiler, nuestra '+a('/commercial/multifamily-acquisition', 'multifamily acquisition financing guide', 'guía de financiamiento para adquirir multifamiliares')+' compara una propiedad estabilizada con una compra que necesita mejoras. Para edificios pequeños, revise por separado las '+a('/commercial/5-8-unit-financing', '5–8 unit financing options', 'opciones para cinco a ocho unidades')+' y los documentos que distinguen una revisión DSCR de una evaluación comercial.') if es else
                          'For an apartment purchase, our '+a('/commercial/multifamily-acquisition', 'multifamily acquisition financing guide')+' compares a stabilized property with an acquisition that needs improvements. For a smaller building, review '+a('/commercial/5-8-unit-financing', '5–8 unit financing options')+' and the documents that distinguish a DSCR program review from commercial underwriting.')
    if local in ['/commercial', '/resources/commercial', '/commercial/georgia']:
        paragraphs.append(('Si un arquitecto coordina el diseño de un proyecto, nuestra '+a('/commercial/architect-financing-partners', 'financing partner guide for architects', 'guía de socios de financiamiento para arquitectos')+' explica cómo organizar la primera conversación entre el cliente, el equipo de diseño y la correduría. El uso previsto, la etapa del diseño y el presupuesto ayudan a definir qué revisar primero.') if es else
                          'If an architect is coordinating the design, our '+a('/commercial/architect-financing-partners', 'financing partner guide for architects')+' explains how to organize the first conversation between the client, design team and brokerage. Intended use, design stage and budget help determine what to review first.')
    if local in ['/commercial/construction-loans', '/commercial/fix-and-flip', '/blog/construction-loan-property-already-owned-mortgage-payoff']:
        paragraphs.append(('Para un proyecto en diseño o listo para construir, la '+a('/commercial/construction-financing-for-architects', 'construction financing guide for architects', 'guía de financiamiento de construcción para arquitectos')+' conecta planos, alcance, presupuesto y calendario de desembolsos. Revísela con el cliente y el constructor para preparar las preguntas sobre costos y cambios de obra antes de solicitar financiamiento.') if es else
                          'For a project in design or approaching construction, the '+a('/commercial/construction-financing-for-architects', 'construction financing guide for architects')+' connects plans, scope, budget and the draw schedule. Review it with the client and builder to prepare questions about costs and change orders before seeking financing.')
    if local in ['/commercial/mixed-use', '/commercial/multifamily', '/commercial/commercial-property', '/commercial/multifamily-acquisition']:
        paragraphs.append(('Si el plan incluye desarrollo o una transformación importante de la propiedad, la '+a('/commercial/development-financing-for-architects', 'development financing guide for architects', 'guía de financiamiento de desarrollos para arquitectos')+' organiza la revisión por etapa: viabilidad, uso del suelo, diseño, construcción y venta o refinanciamiento. Prepare estos supuestos junto con el presupuesto y el plan de ingresos.') if es else
                          'If the plan includes development or a substantial change to the property, the '+a('/commercial/development-financing-for-architects', 'development financing guide for architects')+' organizes the review by stage: feasibility, land use, design, construction and sale or refinancing. Prepare these assumptions alongside the budget and income plan.')
    if local in ['/dscr', '/dscr-program-calculator']:
        paragraphs.append(('¿La propiedad tiene cinco a ocho unidades? Nuestra '+a('/commercial/5-8-unit-financing', '5–8 unit financing guide', 'guía de financiamiento para cinco a ocho unidades')+' explica cómo revisar las rentas, los gastos operativos y la clasificación legal antes de elegir una ruta. Los supuestos de la calculadora no confirman la elegibilidad de un programa.') if es else
                          'Does the property have five to eight units? Our '+a('/commercial/5-8-unit-financing', '5–8 unit financing guide')+' explains how to review rents, operating expenses and legal unit count before choosing a route. Calculator assumptions do not confirm eligibility for a program.')
    if local in ['/commercial/5-8-unit-financing', '/blog/dscr-loans-north-carolina-investor-guide']:
        paragraphs.append(('Para una propiedad en Charlotte, la '+a('/blog/5-8-unit-dscr-financing-charlotte', 'Charlotte five-to-eight-unit DSCR guide', 'guía DSCR de cinco a ocho unidades en Charlotte')+' conecta la revisión del número legal de unidades y los registros del inmueble con dos métodos de cálculo: renta por unidad e ingreso operativo neto. Consulte los documentos de la propiedad antes de aplicar supuestos de una calculadora.') if es else
                          'For a Charlotte property, the '+a('/blog/5-8-unit-dscr-financing-charlotte', 'Charlotte five-to-eight-unit DSCR guide')+' connects legal unit count and property-record review with two calculation methods: rent by unit and net operating income. Check the property documents before applying calculator assumptions.')
    if local in ['/dscr', '/blog/rental-property-equity-heloc-dscr']:
        paragraphs.append(('Si ya posee un inmueble de alquiler sin hipoteca, el '+a('/blog/dscr-heloc-paid-off-investment-property', 'DSCR HELOC scenario for a paid-off rental property', 'escenario de HELOC DSCR sobre una propiedad de alquiler sin hipoteca')+' muestra qué datos reunir para revisar una línea destinada a futuras inversiones. Es un ejemplo educativo que distingue el flujo de renta de la relación personal entre deudas e ingresos, no un cierre ni una aprobación.') if es else
                          'If you already own a rental without a mortgage, the '+a('/blog/dscr-heloc-paid-off-investment-property', 'DSCR HELOC scenario for a paid-off rental property')+' shows what to gather for a line intended for future investments. It is an educational example that distinguishes rental cash flow from personal debt-to-income qualification, not a closing or approval.')
    if local in ['/cash-out-refinance', '/residential/georgia']:
        paragraphs.append(('El '+a('/blog/georgia-cash-out-refinance-70-ltv-15-year-conventional-auto-loan-payoff', 'Georgia cash-out refinance case study', 'caso de refinanciamiento con retiro de efectivo en Georgia')+' describe un cierre reportado por Stonehaven que reemplazó la hipoteca y liquidó un préstamo de auto. Revise los costos, el cambio de plazo y la deuda que pasa a estar garantizada por la vivienda; las condiciones publicadas corresponden a esa operación, no a una oferta actual.') if es else
                          'The '+a('/blog/georgia-cash-out-refinance-70-ltv-15-year-conventional-auto-loan-payoff', 'Georgia cash-out refinance case study')+' describes a Stonehaven-reported closing that replaced a mortgage and paid off an auto loan. Review the costs, changed repayment term and debt now secured by the home; the published terms describe that transaction, not a current offer.')
    if local in ['/dscr/short-term-rentals', '/blog/dscr-loans-florida-investor-guide']:
        paragraphs.append(('Para una inversión en alquiler de corta estancia, la '+a('/blog/short-term-rental-dscr-tampa', 'Tampa Bay short-term rental DSCR guide', 'guía DSCR para alquileres de corta estancia en Tampa Bay')+' separa las preguntas sobre la jurisdicción del inmueble de la renta que admite el programa de financiamiento. Su ejemplo numérico permite comparar proyecciones de ingresos con la renta utilizada para calificar; confirme las normas locales y del prestamista para la propiedad concreta.') if es else
                          'For a short-term rental investment, the '+a('/blog/short-term-rental-dscr-tampa', 'Tampa Bay short-term rental DSCR guide')+' separates property-jurisdiction questions from the rent a financing program accepts. Its worked example compares income projections with qualifying rent; confirm the current local and lender requirements for the specific property.')
    if local in ['/commercial', '/residential/georgia', '/blog/atlanta-teardown-rebuild-construction-financing', '/blog/brookhaven-ga-100-ltc-ground-up-construction']:
        paragraphs.append(('Para proyectos en el estado de nuestra oficina de Alpharetta, la página de '+a('/commercial/georgia', 'Georgia and metro Atlanta commercial financing', 'financiamiento comercial en Georgia y el área de Atlanta')+' conecta construcción, compra y refinanciamiento con los datos que necesitamos para revisar el proyecto. Separa los ejemplos educativos de los cierres reportados por la empresa.') if es else
                          'For projects in the home state of our Alpharetta office, the '+a('/commercial/georgia', 'Georgia and metro Atlanta commercial financing page')+' connects construction, acquisition and refinancing with the details needed for a project review. It separates educational examples from company-reported closings.')
    if local == '/dscr':
        paragraphs.append(('Si también puede documentar ingresos personales, la ' + a('/resources/dscr-vs-conventional', 'DSCR versus conventional guide', 'comparación entre DSCR y un préstamo convencional') + ' ayuda a separar los requisitos del prestatario de los ingresos de la propiedad antes de elegir una ruta.') if es else
                          'If you can also document personal income, the '+a('/resources/dscr-vs-conventional', 'DSCR versus conventional guide')+' separates borrower qualification from property cash flow before you choose a financing route.')
    if local in ['/commercial', '/commercial-loan-calculator']:
        paragraphs.append(('Antes de elegir un monto solicitado, revise cómo ' + a('/resources/how-lenders-size-commercial-loans', 'commercial loan sizing', 'los prestamistas dimensionan un préstamo comercial') + ' combina DSCR, LTV y rendimiento de la deuda. El ejemplo muestra por qué una restricción puede limitar el resultado de la calculadora.') if es else
                          'Before choosing a requested loan amount, work through '+a('/resources/how-lenders-size-commercial-loans', 'commercial loan sizing using DSCR, LTV and debt yield')+'. The example shows why one constraint can limit the result from a calculator.')
    if local == '/commercial':
        paragraphs.append(('Para una compra que necesita estabilización, compare ' + a('/resources/bridge-vs-permanent-financing', 'bridge and permanent financing', 'financiamiento puente y permanente') + '. Si vence la deuda existente, la ' + a('/resources/commercial-refinance-guide', 'commercial refinance guide', 'guía de refinanciamiento comercial') + ' ayuda a organizar el saldo, el vencimiento y los fondos disponibles.') if es else
                          'For an acquisition that needs stabilization, compare '+a('/resources/bridge-vs-permanent-financing', 'bridge and permanent financing')+'. If an existing loan is maturing, the '+a('/resources/commercial-refinance-guide', 'commercial refinance guide')+' helps organize the payoff, maturity and available proceeds.')
        paragraphs.append(('Use nuestros '+a('/resources/commercial', 'commercial financing resources', 'recursos de financiamiento comercial')+' para conectar estas decisiones con la documentación y el plan de salida de su proyecto.') if es else
                          'Use our '+a('/resources/commercial', 'commercial financing resources')+' to connect these decisions with the documents and exit plan for your project.')
    if local == '/commercial/bridge-loans':
        paragraphs.append(('El plan de salida necesita una revisión propia. Compare '+a('/resources/bridge-vs-permanent-financing', 'bridge versus permanent financing', 'financiamiento puente y permanente')+' y utilice la '+a('/resources/commercial-refinance-guide', 'commercial refinance guide', 'guía de refinanciamiento comercial')+' para revisar cómo el saldo y los costos afectan el préstamo de reemplazo.') if es else
                          'The exit needs its own review. Compare '+a('/resources/bridge-vs-permanent-financing', 'bridge versus permanent financing')+' and use the '+a('/resources/commercial-refinance-guide', 'commercial refinance guide')+' to check how payoff and costs affect replacement financing.')
    if local in ['/sba', '/sba-loan-calculator']:
        paragraphs.append(('Antes de introducir supuestos en la calculadora, use la '+a('/resources/sba-7a-vs-504', 'SBA 7(a) versus 504 comparison', 'comparación entre SBA 7(a) y 504')+' para separar el uso de los fondos y la estructura. Después revise la '+a('/resources/sba-down-payment', 'SBA down payment guide', 'guía de aportación inicial SBA')+' para organizar la aportación del prestatario y los costos que requieren confirmación.') if es else
                          'Before entering calculator assumptions, use the '+a('/resources/sba-7a-vs-504', 'SBA 7(a) versus 504 comparison')+' to separate use of funds from financing structure. Then review the '+a('/resources/sba-down-payment', 'SBA down payment guide')+' to organize borrower equity and costs that need confirmation.')
    if local == '/sba':
        paragraphs.append(('Una fecha deseada de cierre necesita un expediente completo. La '+a('/resources/sba-timeline-documents', 'SBA timeline and document checklist', 'lista de documentos y etapas SBA')+' explica qué preparar; nuestros '+a('/resources/sba', 'SBA financing resources', 'recursos de financiamiento SBA')+' reúnen estas decisiones para la conversación con el prestamista.') if es else
                          'A target closing date needs a complete file behind it. The '+a('/resources/sba-timeline-documents', 'SBA timeline and document checklist')+' explains what to prepare; our '+a('/resources/sba', 'SBA financing resources')+' bring these decisions together for the lender conversation.')
    if local in ['/residential/buy', '/mortgage-calculator']:
        paragraphs.append(('El pago calculado es una parte del presupuesto. Use la '+a('/resources/how-much-home', 'home affordability guide', 'guía de presupuesto para una vivienda')+' para revisar los gastos del hogar y la '+a('/resources/first-time-buyer-checklist', 'first-time buyer document checklist', 'lista de documentos para compradores primerizos')+' para preparar la primera revisión.') if es else
                          'The estimated payment is one part of the budget. Use the '+a('/resources/how-much-home', 'home affordability guide')+' to review household costs and the '+a('/resources/first-time-buyer-checklist', 'first-time buyer document checklist')+' to prepare for the first review.')
    if local in ['/residential/buy', '/residential/fha']:
        paragraphs.append(('Si está comparando programas, la '+a('/resources/fha-vs-conventional', 'FHA versus conventional guide', 'guía de FHA frente a convencional')+' organiza las diferencias de seguro hipotecario, aportación inicial y elegibilidad que conviene revisar con el prestamista.') if es else
                          'If you are comparing programs, the '+a('/resources/fha-vs-conventional', 'FHA versus conventional guide')+' organizes the mortgage insurance, down payment and eligibility differences to review with a lender.')
    if local in ['/residential/refinance', '/refinance-calculator']:
        paragraphs.append(('Un pago menor no muestra por sí solo cuándo se recuperan los costos. La '+a('/resources/refinance-break-even', 'refinance break-even guide', 'guía del punto de equilibrio de un refinanciamiento')+' ayuda a comparar los costos, el tiempo previsto en la vivienda y los cambios en el saldo antes de decidir.') if es else
                          'A lower payment alone does not show when closing costs are recovered. The '+a('/resources/refinance-break-even', 'refinance break-even guide')+' helps compare costs, your expected time in the home and changes in the balance before deciding.')
    state = local.removeprefix('/residential/')
    if state in RESIDENTIAL_STATES and local.startswith('/residential/'):
        name = state_name(state, es, pages)
        heading = 'Planifique según quién ocupará la propiedad' if es else 'Plan around who will occupy the property'
        paragraphs.append(('Para una inversión de alquiler, la '+a(f'/blog/dscr-loans-{state}-investor-guide', f'{name} DSCR guide', f'guía DSCR de {name}')+' ayuda a conectar los impuestos y registros de la propiedad con la revisión de renta y pagos. El financiamiento para inversión requiere una evaluación distinta de una vivienda que ocupará usted.') if es else
                          'For a rental investment, the '+a(f'/blog/dscr-loans-{state}-investor-guide', f'{name} DSCR guide')+' connects property taxes and records with the rental-income and payment review. Investment financing needs a different review from a home you will occupy yourself.')
        paragraphs.append(('Para una vivienda destinada a un padre o a un hijo adulto, lea la '+a(f'/blog/family-opportunity-mortgage-{state}', f'Family Opportunity guide for {name}', f'guía de Family Opportunity en {name}')+'. Explica las preguntas sobre prestatario, ocupación y presupuesto que deben resolverse antes de elegir la estructura. Cada situación familiar necesita su propia revisión.') if es else
                          'For a home intended for a parent or an adult child, read the '+a(f'/blog/family-opportunity-mortgage-{state}', f'Family Opportunity guide for {name}')+'. It explains borrower, occupancy and budget questions to resolve before choosing a structure. Each family situation needs its own review.')
    return section(heading, ''.join(f'<p>{p}</p>' for p in paragraphs)) if paragraphs else ''


def transform(text, path, pages):
    """Insert one replaceable block inside main. Safe to call repeatedly."""
    text = re.sub(r'<!-- SEARCH-NAV:CONTEXT:START -->.*?<!-- SEARCH-NAV:CONTEXT:END -->\n?', '', text, flags=re.S)
    if not re.search(r'<main(?:\s[^>]*)?>', text) or re.search(r'<meta[^>]+name=["\']robots["\'][^>]+content=["\'][^"\']*noindex', text):
        return text
    es = path.startswith('/es/')
    local = path[3:] if es else path
    addition = reading_paths(pages, local, es)
    if local == '/dscr':
        addition += state_directory(pages, es)
    if not addition:
        return text
    block = '<!-- SEARCH-NAV:CONTEXT:START -->'+addition+'<!-- SEARCH-NAV:CONTEXT:END -->\n'
    return text.replace('</main>', block+'</main>', 1)


class BodyLinks(HTMLParser):
    """Read anchor destinations in main, outside navigation and site chrome."""
    VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.links = set()
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        tags = {item[0] for item in self.stack}
        excluded = bool(tags & {'header', 'footer', 'nav', 'aside', 'script', 'template'})
        excluded = excluded or any('lang-toggle' in item[1].get('class', '').split() or item[1].get('role') == 'navigation' for item in self.stack)
        if tag == 'a' and 'main' in tags and not excluded and attrs.get('href'):
            self.links.add(attrs['href'])
        if tag not in self.VOID:
            self.stack.append((tag, attrs))
    def handle_endtag(self, tag):
        for index in range(len(self.stack)-1, -1, -1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                break
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID:
            self.handle_endtag(tag)


def route(file, root):
    value = file.relative_to(root).as_posix()
    return '/'+(value[:-10] if value.endswith('index.html') else value[:-5])


def read_pages(root):
    return {route(file, root): (file, file.read_text()) for file in sorted(root.rglob('*.html'))
            if not any(part.startswith('.') or part in EXCLUDED_DIRS for part in file.relative_to(root).parts)}


def normalized_route(value, source):
    parsed = urlsplit(urljoin(ORIGIN+source, value))
    if parsed.netloc != 'stonehavencre.com' or parsed.scheme not in ('http', 'https'):
        return None
    path = parsed.path
    path = path[:-10] if path.endswith('index.html') else path
    path = path[:-5] if path.endswith('.html') else path
    return path.rstrip('/') or '/'


def without_language(path):
    return path[3:] if path.startswith('/es/') else path


def inbound_inventory(pages):
    inbound = defaultdict(set)
    for source, (_, text) in pages.items():
        if source in ('/blog', '/es/blog') or re.search(r'<meta[^>]+name=["\']robots["\'][^>]+content=["\'][^"\']*noindex', text):
            continue
        parser = BodyLinks()
        parser.feed(text)
        for href in parser.links:
            target = normalized_route(href, source)
            if target in pages and without_language(source) != without_language(target):
                inbound[target].add(source)
    return inbound


def report(root, output, label):
    pages = read_pages(root)
    inbound = inbound_inventory(pages)
    groups = [
        ('DSCR state guides', sorted(path for path in pages if re.fullmatch(r'/(?:es/)?blog/dscr-loans-[a-z-]+-investor-guide', path))),
        ('Family state guides', sorted(path for path in pages if re.fullmatch(r'/(?:es/)?blog/family-opportunity-mortgage-[a-z-]+', path))),
        ('Resource articles and hubs', sorted(path for path in pages if path.startswith('/resources/'))),
    ]
    lines = [f'# Inbound body links, {label}, September 20, 2026', '',
             'Counts are distinct indexable source pages linking to a destination inside `<main>`. Repeated links from one page count once. Header, footer, nav, aside, language controls, both blog indexes, self-links and English/Spanish mirror-only links are excluded. Resource hubs count as body sources, but the source column makes hub-only coverage visible. Both language versions appear separately. Links inside native disclosure panels count because their anchors exist in the HTML and visitors can expand them.', '',
             'This is an internal-link inventory, not proof of indexing, ranking, citations or search traffic.', '']
    for name, targets in groups:
        zero = sum(not inbound[path] for path in targets)
        lines += [f'## {name}', '', f'{len(targets)} destinations; {zero} have no qualifying inbound body source.', '', '| Destination | Distinct source pages | Sources |', '| --- | ---: | --- |']
        for target in targets:
            sources = ', '.join(f'`{source}`' for source in sorted(inbound[target])) or 'None'
            lines.append(f'| `{target}` | {len(inbound[target])} | {sources} |')
        lines.append('')
    Path(output).write_text('\n'.join(lines))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--report', required=True, help='Output Markdown file')
    parser.add_argument('--label', default='after')
    args = parser.parse_args()
    report(Path(__file__).resolve().parent.parent, args.report, args.label)
