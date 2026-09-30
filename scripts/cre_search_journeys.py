"""Decision-led navigation for existing CRE pages, generated without client JS."""
import re
from html import escape, unescape

JOURNEYS = [
 ('/commercial/construction-loans', 'Build or rebuild', 'Construir o reconstruir', 'Compare acquisition, land equity, the build budget and cash between draws.', 'Compare adquisición, patrimonio del terreno, presupuesto y efectivo entre desembolsos.'),
 ('/commercial/fix-and-flip', 'Buy, renovate and sell', 'Comprar, renovar y vender', 'Separate the purchase advance, renovation funding and planned resale.', 'Separe los fondos para compra, renovación y la reventa prevista.'),
 ('/commercial/bridge-loans', 'Refinance or reposition', 'Refinanciar o reposicionar', 'Start with the current payoff, maturity, cash flow and repayment plan.', 'Empiece con la liquidación actual, vencimiento, flujo de caja y plan de pago.'),
 ('/commercial/land-development-loans', 'Develop land or lots', 'Desarrollar terrenos o lotes', 'Connect site control, approvals, infrastructure and lot-sale timing.', 'Conecte el control del terreno, permisos, infraestructura y calendario de venta de lotes.'),
 ('/commercial/multifamily-acquisition', 'Buy an apartment building', 'Comprar un edificio de alquiler', 'Compare current operations with the improvements and lease-up you plan.', 'Compare las operaciones actuales con las mejoras y el arrendamiento previstos.'),
 ('/dscr', 'Finance a rental property', 'Financiar una propiedad de alquiler', 'Review eligible rent, the full payment and cash flow before choosing a loan.', 'Revise la renta admisible, el pago completo y el flujo de caja antes de elegir un préstamo.'),
]
GUIDES = [
 ('/resources/how-lenders-size-commercial-loans', 'How much can the property support?', 'Work through NOI, DSCR, LTV and debt yield. Identify the constraint before choosing a requested amount.'),
 ('/resources/bridge-vs-permanent-financing', 'Bridge or permanent financing?', 'Compare the property’s readiness, financing costs and exit before choosing a structure.'),
 ('/resources/commercial-refinance-guide', 'What happens when the loan matures?', 'Organize the payoff, prepayment terms and refinance proceeds before the deadline.'),
 ('/blog/construction-loan-property-already-owned-mortgage-payoff', 'Can land equity support the build?', 'Separate ownership basis, value and existing debt when preparing a construction request.'),
 ('/blog/100-ltc-construction-loans-builder-cash-needed', 'Does 100% LTC mean no cash needed?', 'Check eligible costs, reserves and draw timing. Budget coverage and cash at closing are different.'),
 ('/blog/subdivision-loan-lot-release-prices', 'How do lot sales repay development debt?', 'Work through release prices and the cash retained after a lot sale.'),
]

def block(kind, body):
 return f'<!-- CRE-JOURNEY:{kind}:START -->{body}<!-- CRE-JOURNEY:{kind}:END -->'

def strip_blocks(text):
 return re.sub(r'<!-- CRE-JOURNEY:[A-Z]+:START -->.*?<!-- CRE-JOURNEY:[A-Z]+:END -->', '', text, flags=re.S)

def cards(es=False):
 prefix='/es' if es else ''
 content=''
 for path,en,spanish,description,translation in JOURNEYS:
  content+=f'<article><h3><a href="{prefix}{path}">{escape(spanish if es else en)}</a></h3><p>{escape(translation if es else description)}</p></article>'
 return '<div class="cre-journey-grid">'+content+'</div>'

def selector(es=False):
 heading='¿Qué está planeando?' if es else 'What are you planning?'
 intro='Empiece por el proyecto. Cada guía explica qué revisar y qué preparar.' if es else 'Start with the project. Each guide explains what to review and what to prepare.'
 return block('PATHS',f'<section class="wrap cre-journey" aria-labelledby="cre-paths"><h2 id="cre-paths">{heading}</h2><p>{intro}</p>'+cards(es)+'</section>')

def review(es=False):
 heading='Qué revisamos primero' if es else 'What we review first'
 intro='Comparta la ubicación, el uso previsto, el costo total, el monto solicitado y el plazo. Revisamos la estructura, identificamos datos pendientes y explicamos el siguiente paso por mensaje de texto.' if es else 'Share the location, intended use, total cost, requested financing and timing. We review the structure, flag missing information and explain the next step by text.'
 note='La revisión inicial no es una aprobación, cotización ni compromiso de financiamiento. No envíe números de cuenta ni documentos privados mediante este formulario público.' if es else 'An initial review is not an approval, rate quote or commitment to lend. Keep account numbers and private documents out of this public form.'
 return block('REVIEW',f'<div class="cre-review-expectations"><h3>{heading}</h3><p>{intro}</p><p class="cre-journey-note">{note}</p></div>')

def contents(text, es):
 # H2 content is existing, visible page text. Preserve authored IDs and supply
 # stable numbered IDs only when none exists; no structured FAQ claim is added.
 entries=[]
 def heading(m):
  attrs,label=m.groups();plain=unescape(re.sub('<[^>]+>','',label)).strip()
  if not plain:return m[0]
  found=re.search(r'\bid="([^"]+)"',attrs)
  target=found[1] if found else 'cre-section-'+str(len(entries)+1)
  entries.append((target,plain))
  return '<h2'+attrs+('' if found else f' id="{target}"')+'>'+label+'</h2>'
 # Existing late context blocks are not primary guide sections.
 split=text.find('<!-- SEARCH-NAV:CONTEXT:START -->')
 if split<0:split=text.index('</main>')
 text=re.sub(r'<h2([^>]*)>(.*?)</h2>',heading,text[:split],flags=re.S)+text[split:]
 if len(entries)<3:return text
 title='En esta guía' if es else 'In this guide'
 nav=block('TOC','<nav class="wrap cre-contents" aria-label="'+title+'"><details><summary>'+title+'</summary><ul>'+''.join(f'<li><a href="#{key}">{escape(label)}</a></li>' for key,label in entries)+'</ul></details></nav>')
 pos=text.index('</section>',text.index('<main>'))+10
 return text[:pos]+nav+text[pos:]

def transform(text,path):
 es=path.startswith('/es/');local=path[3:] if es else path
 if local!='/commercial' and local!='/resources/commercial' and not local.startswith('/commercial/'):
  return text.replace('<link rel="stylesheet" href="/cre-journeys.css?v=1"/>','')
 text=strip_blocks(text)
 if local=='/commercial':
  # Keep the plain-language answer before the decision cards.
  anchor=text.find('id="answer"')
  pos=text.index('</section>',anchor if anchor>=0 else text.index('<main>'))+10
  text=text[:pos]+selector(es)+text[pos:]
  # The same three program links now have descriptive cards near the top.
  text=re.sub(r'<!-- SEARCH-NAV:CRE:START -->.*?<!-- SEARCH-NAV:CRE:END -->\n?', '', text, flags=re.S)
  text=text.replace('<form ',review(es)+'<form ',1)
 elif local.startswith('/commercial/'):
  text=contents(text,es)
 elif local=='/resources/commercial':
  # Replace the old six generic tiles, including the obsolete 48-hour label.
  content='<section class="wrap cre-journey"><h2>Start with the decision</h2><p>Use these guides to prepare a request, compare proposals and test the exit.</p><div class="cre-journey-grid">'
  content+=''.join(f'<article><h3><a href="{path}">{escape(title)}</a></h3><p>{escape(desc)}</p></article>' for path,title,desc in GUIDES)
  content+='</div><div class="cre-journey-tools"><h3>Put the numbers to work</h3><p>Use the <a href="/commercial-loan-calculator">commercial loan calculator</a> alongside the <a href="/calculation-methodology">calculation methodology</a>. Estimates help organize a scenario; they are not a credit decision.</p><p>For five to eight units, compare the <a href="/commercial/5-8-unit-financing">small multifamily financing guide</a> before choosing a rental or commercial underwriting path.</p><p>Ready to discuss the project? <a href="/commercial#inquire">Submit a commercial scenario</a>. Prefer a scheduled conversation? <a href="/book?product=Commercial">Book a consultation</a>.</p></div></section>'
  # This static source section remains, so subsequent generation can replace it.
  text=re.sub(r'<section class="uses" style="padding-top:20px;">.*?</section>',lambda _:content,text,count=1,flags=re.S)
  # On subsequent passes replace our prior block, including generated H2 IDs if any.
  old_start=text.find('<section class="wrap cre-journey"><h2>Start with the decision')
  if old_start>=0:
   end=text.index('</section>',old_start)+10;text=text[:old_start]+content+text[end:]
 if 'href="/cre-journeys.css?v=1"' not in text:text=text.replace('</head>','<link rel="stylesheet" href="/cre-journeys.css?v=1"/></head>')
 return text
