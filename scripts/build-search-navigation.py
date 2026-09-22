#!/usr/bin/env python3
"""Maintain crawlable topic links and matching visible/structured breadcrumbs."""
from pathlib import Path
from html import escape, unescape
from urllib.parse import urlsplit
import re,json
from search_metadata import load_title_overrides, normalize_page_metadata, normalize_sitemap
from seo_brand_assets import normalize_brand_assets
from seo_discovery import build_discovery_files
from seo_contextual_links import transform as contextual_links
from site_presentation import normalize_presentation
R=Path(__file__).resolve().parent.parent
ORIGIN='https://stonehavencre.com'
skip={'docs','scripts','tests','downloads','node_modules'}
files=[p for p in R.rglob('*.html') if not any(x.startswith('.') or x in skip for x in p.relative_to(R).parts)]
def route(p):
 s=p.relative_to(R).as_posix();return '/'+(s[:-10] if s.endswith('index.html') else s[:-5])
def clean(s):
 return re.sub(r'<!-- SEARCH-NAV:[A-Z]+:START -->.*?<!-- SEARCH-NAV:[A-Z]+:END -->\n?','',s,flags=re.S).replace('<link rel="stylesheet" href="/search-navigation.css?v=1"/>','')
pages={route(p):(p,clean(p.read_text())) for p in files}
title_overrides=load_title_overrides(R)
def title(s):
 m=re.search(r'<title>(.*?)</title>',s,re.S);return unescape(re.split(r'\s+[|]\s+|\s+·\s+Stonehaven',m[1])[0]) if m else ''
def marker(kind,s):return f'<!-- SEARCH-NAV:{kind}:START -->{s}<!-- SEARCH-NAV:{kind}:END -->\n'
def links(prefix,items):return ''.join(f'<li><a href="{prefix}{url}">{escape(label)}</a></li>' for url,label in items)
def group(heading,prefix,items):return '<div><h3>'+heading+'</h3><ul>'+links(prefix,items)+'</ul></div>'
def cre_links(prefix,es):
 return [('/commercial/construction-loans','Financiamiento para construcción' if es else 'Construction financing'),('/commercial/fix-and-flip','Capital para renovación y reventa' if es else 'Fix-and-flip financing'),('/commercial/bridge-loans','Préstamos puente comerciales' if es else 'Commercial bridge loans')]
counts={'breadcrumbs':0,'topic_hubs':0,'program_links':0}
for path,(file,text) in pages.items():
 text=normalize_presentation(text,path)
 text=normalize_page_metadata(text,path,title_overrides)
 text=text.replace('<b>Christiaan De Leeuw</b>','<a href="/management#chris-de-leeuw"><b>Chris De Leeuw</b></a>')
 if re.search(r'<meta[^>]+name="robots"[^>]+content="[^"]*noindex',text) or '<main>' not in text:
  text=normalize_brand_assets(text)
  if text!=file.read_text():file.write_text(text)
  continue
 es=path.startswith('/es/');prefix='/es' if es else '';local=path[len(prefix):];addition=''
 if local not in ['/','/index'] and 'BreadcrumbList' not in text:
  ancestors=[(prefix+'/', 'Inicio' if es else 'Home')]
  parent=None
  if local.startswith('/blog/'):parent=('/blog','Guías y artículos' if es else 'Guides and articles')
  elif local.startswith('/dscr/'):parent=('/dscr','Préstamos DSCR' if es else 'DSCR loans')
  elif local.startswith('/heloc/'):parent=('/heloc','Opciones HELOC' if es else 'HELOC options')
  elif local.startswith('/commercial/'):parent=('/commercial','Financiamiento comercial' if es else 'Commercial financing')
  elif local.startswith('/resources/') and local not in ['/resources/residential','/resources/sba','/resources/commercial']:
   if '/sba-' in local:parent=('/resources/sba','Recursos SBA' if es else 'SBA resources')
   elif any(k in local for k in ['commercial','lenders-size','bridge-vs']):parent=('/resources/commercial','Recursos comerciales' if es else 'Commercial resources')
   else:parent=('/resources/residential','Recursos de vivienda' if es else 'Home loan resources')
  elif local in ['/bank-statement-loans','/interest-only-loans']:parent=('/residential','Préstamos de vivienda' if es else 'Home loans')
  if parent and prefix+parent[0] in pages:ancestors.append((prefix+parent[0],parent[1]))
  crumbs=ancestors+[(path,title(text))]
  visible='<nav class="search-breadcrumb wrap" aria-label="'+('Ruta de navegación' if es else 'Breadcrumb')+'"><ol>'+''.join('<li>'+('<span aria-current="page">'+escape(label)+'</span>' if url==path else '<a href="'+url+'">'+escape(label)+'</a>')+'</li>' for url,label in crumbs)+'</ol></nav>'
  # Place below the hero, so the fixed header cannot obscure navigation.
  start=text.index('<main>');end=text.find('</section>',start)
  if end!=-1:text=text[:end+10]+marker('TRAIL',visible)+text[end+10:]
  schema={'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':i+1,'name':label,'item':ORIGIN+url} for i,(url,label) in enumerate(crumbs)]}
  text=text.replace('</head>',marker('SCHEMA','<script type="application/ld+json">'+json.dumps(schema,ensure_ascii=False)+'</script>')+'</head>');counts['breadcrumbs']+=1
 if local=='/blog':
  groups=[('HELOC', [('/heloc','Comparar opciones HELOC' if es else 'Compare HELOC options'),('/blog/heloc-vs-cash-out-refinance','HELOC o refinanciamiento' if es else 'HELOC vs cash-out refinance'),('/blog/how-much-home-equity-can-i-borrow','Calcular patrimonio disponible' if es else 'Estimate available equity')]),('DSCR',[('/dscr','Financiamiento para alquileres' if es else 'Rental property financing'),('/dscr-analyzer','Calculadora DSCR' if es else 'DSCR calculator'),('/blog/dscr-loans-georgia-investor-guide','Guía DSCR de Georgia' if es else 'Georgia DSCR guide')]),('Construcción' if es else 'Builder financing',[('/blog/atlanta-teardown-rebuild-construction-financing','Demoler y reconstruir' if es else 'Teardown and rebuild loans'),('/blog/100-ltc-construction-loans-builder-cash-needed','Hasta 100% LTC' if es else 'Up to 100% LTC'),('/blog/construction-loan-property-already-owned-mortgage-payoff','Construir en propiedad propia' if es else 'Building on property you own')]),('Vivienda familiar' if es else 'Family housing',[('/blog/buy-house-for-parents-keep-own-home','Comprar para sus padres' if es else 'Buy a home for parents'),('/blog/siblings-help-buy-home-for-parents','Ayuda entre hermanos' if es else 'Helping parents with siblings')]),('Hipotecas y SBA' if es else 'Home loans and SBA',[('/bank-statement-loans','Estados de cuenta' if es else 'Bank statement loans'),('/interest-only-loans','Solo intereses' if es else 'Interest-only mortgages'),('/sba','Financiamiento SBA' if es else 'SBA financing')])]
  addition='<section class="wrap search-topics" aria-labelledby="search-topics-heading"><h2 id="search-topics-heading">'+('Encuentre una guía por tema' if es else 'Find a guide by financing goal')+'</h2><div class="search-topic-grid">'+''.join(group(h,prefix,items) for h,items in groups)+'</div></section>'
  start=text.index('<main>');end=text.find('</section>',start);text=text[:end+10]+marker('TOPICS',addition)+text[end+10:];counts['topic_hubs']+=1
 if local in ['/','/resources/residential','/resources/commercial','/bank-statement-loans','/interest-only-loans','/dscr']:
  if local=='/dscr':
   items=[('/dscr-program-calculator','Calcular la renta y el préstamo DSCR' if es else 'Calculate DSCR rent and loan scenarios'),('/blog/dscr-loans-explained','Cómo funcionan los préstamos DSCR' if es else 'How DSCR loans work'),('/blog/dscr-program-calculator-qualifying-rent','Qué renta cuenta para calificar' if es else 'Which rental income counts for qualification'),('/blog/florida-dscr-cash-out-refinance-75-ltv-hard-money-payoff','Caso de Florida: refinanciar una propiedad de alquiler para liquidar un préstamo puente' if es else 'Florida case study: refinancing a rental to pay off a bridge loan')]
   h='Guías y ejemplos de financiamiento DSCR' if es else 'DSCR financing guides and examples';intro='Explore cómo se evalúa la renta, pruebe un escenario y revise un cierre anterior. Cada préstamo está sujeto a evaluación y condiciones del prestamista.' if es else 'Explore how rental income is evaluated, model a scenario and review a past closing. Each loan remains subject to underwriting and lender requirements.'
  elif local=='/resources/commercial':
   items=cre_links(prefix,es)+[('/resources/how-lenders-size-commercial-loans','Work through DSCR, LTV and debt yield'),('/resources/commercial-refinance-guide','Plan a commercial maturity or refinance'),('/blog/45-million-builder-fix-and-flip-capital','Explore the dated $45 million builder capital announcement')]
   h='Commercial financing: programs and decisions';intro='Compare project financing, work through the numbers and prepare a complete scenario.'
  else:
   items=[('/bank-statement-loans','Hipotecas con estados de cuenta' if es else 'Bank statement mortgages'),('/interest-only-loans','Hipotecas de solo intereses' if es else 'Interest-only mortgages'),('/heloc','Opciones HELOC' if es else 'HELOC options')]
   items=[x for x in items if x[0]!=local];h='Compare opciones hipotecarias' if es else 'Compare mortgage options';intro='Explore documentación de ingresos, estructura de pagos y patrimonio disponible según su objetivo.' if es else 'Explore income documentation, payment structure and home equity options around your financing goal.'
  addition='<section class="wrap search-topics"><h2>'+h+'</h2><p>'+intro+'</p><ul class="search-program-links">'+links(prefix,items)+'</ul></section>'
  text=text.replace('</main>',marker('PROGRAMS',addition)+'</main>');counts['program_links']+=1
 cre_articles=['45-million-builder-fix-and-flip-capital','atlanta-teardown-rebuild-construction-financing','100-ltc-construction-loans-builder-cash-needed','construction-loan-property-already-owned-mortgage-payoff','brookhaven-ga-100-ltc-ground-up-construction','residential-development-financing-georgia-florida-texas-case-study','commercial-mortgage-referrals-cpas-attorneys','mortgage-broker-dscr-commercial-referral-partner']
 if local in ['/','/commercial','/blog'] or local in ['/blog/'+slug for slug in cre_articles]:
  items=cre_links(prefix,es)
  if local in ['/blog/atlanta-teardown-rebuild-construction-financing','/blog/100-ltc-construction-loans-builder-cash-needed','/blog/construction-loan-property-already-owned-mortgage-payoff']:
   items.append(('/blog/45-million-builder-fix-and-flip-capital','Anuncio de capital para constructores del 18 de septiembre' if es else 'September 18 builder capital announcement'))
  heading='Encuentre financiamiento para su proyecto' if es else 'Find financing for your project'
  intro='Compare construcción, renovación para reventa y financiamiento puente. Presente costo total, préstamo solicitado y plan de salida para una revisión por mensaje de texto.' if es else 'Compare construction, fix-and-flip and bridge options. Share total project cost, requested financing and your exit plan for a review by text.'
  addition='<section class="wrap search-topics"><h2>'+heading+'</h2><p>'+intro+'</p><ul class="search-program-links">'+links(prefix,items)+'</ul></section>'
  text=text.replace('</main>',marker('CRE',addition)+'</main>')
 text=contextual_links(text,path,pages)
 if 'SEARCH-NAV:' in text:text=text.replace('</head>','<link rel="stylesheet" href="/search-navigation.css?v=1"/></head>')
 text=normalize_brand_assets(text)
 file.write_text(text)
sitemap=R/'sitemap.xml'
sitemap.write_text(normalize_sitemap(sitemap.read_text(),{path:file.read_text() for path,(file,_) in pages.items()}))
build_discovery_files(R)
print(json.dumps(counts))
