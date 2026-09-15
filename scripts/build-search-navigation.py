#!/usr/bin/env python3
"""Maintain crawlable topic links and matching visible/structured breadcrumbs."""
from pathlib import Path
from html import escape, unescape
from urllib.parse import urlsplit
import re,json
R=Path(__file__).resolve().parent.parent
ORIGIN='https://stonehavencre.com'
skip={'docs','scripts','tests','downloads','node_modules'}
files=[p for p in R.rglob('*.html') if not any(x.startswith('.') or x in skip for x in p.relative_to(R).parts)]
def route(p):
 s=p.relative_to(R).as_posix();return '/'+(s[:-10] if s.endswith('index.html') else s[:-5])
def clean(s):
 return re.sub(r'<!-- SEARCH-NAV:[A-Z]+:START -->.*?<!-- SEARCH-NAV:[A-Z]+:END -->\n?','',s,flags=re.S).replace('<link rel="stylesheet" href="/search-navigation.css?v=1"/>','')
pages={route(p):(p,clean(p.read_text())) for p in files}
def title(s):
 m=re.search(r'<title>(.*?)</title>',s,re.S);return unescape(re.split(r'\s+[|]\s+|\s+·\s+Stonehaven',m[1])[0]) if m else ''
def marker(kind,s):return f'<!-- SEARCH-NAV:{kind}:START -->{s}<!-- SEARCH-NAV:{kind}:END -->\n'
def links(prefix,items):return ''.join(f'<li><a href="{prefix}{url}">{escape(label)}</a></li>' for url,label in items)
def group(heading,prefix,items):return '<div><h3>'+heading+'</h3><ul>'+links(prefix,items)+'</ul></div>'
counts={'breadcrumbs':0,'topic_hubs':0,'program_links':0}
for path,(file,text) in pages.items():
 if re.search(r'<meta[^>]+name="robots"[^>]+content="[^"]*noindex',text) or '<main>' not in text:
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
 if local in ['/','/resources/residential','/resources/commercial','/bank-statement-loans','/interest-only-loans']:
  if local=='/resources/commercial':
   items=[('/blog/atlanta-teardown-rebuild-construction-financing','Plan a teardown and rebuild'),('/blog/100-ltc-construction-loans-builder-cash-needed','Understand up to 100% LTC construction financing'),('/blog/construction-loan-property-already-owned-mortgage-payoff','Review existing property equity and payoff')]
   h='Construction financing for builders';intro='Plan acquisition, project equity and construction cash flow before requesting terms.'
  else:
   items=[('/bank-statement-loans','Hipotecas con estados de cuenta' if es else 'Bank statement mortgages'),('/interest-only-loans','Hipotecas de solo intereses' if es else 'Interest-only mortgages'),('/heloc','Opciones HELOC' if es else 'HELOC options')]
   items=[x for x in items if x[0]!=local];h='Compare opciones hipotecarias' if es else 'Compare mortgage options';intro='Explore documentación de ingresos, estructura de pagos y patrimonio disponible según su objetivo.' if es else 'Explore income documentation, payment structure and home equity options around your financing goal.'
  addition='<section class="wrap search-topics"><h2>'+h+'</h2><p>'+intro+'</p><ul class="search-program-links">'+links(prefix,items)+'</ul></section>'
  text=text.replace('</main>',marker('PROGRAMS',addition)+'</main>');counts['program_links']+=1
 if 'SEARCH-NAV:' in text:text=text.replace('</head>','<link rel="stylesheet" href="/search-navigation.css?v=1"/></head>')
 file.write_text(text)
print(json.dumps(counts))
