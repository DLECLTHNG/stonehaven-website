#!/usr/bin/env python3
"""Rebuild the bilingual HELOC growth pages and owned navigation modules."""
from pathlib import Path
import re,json,html
R=Path(__file__).resolve().parent.parent
E=html.escape
DATA=[
('compare-offers','Compare HELOC offers beyond the starting rate','Compare ofertas de HELOC más allá de la tasa inicial',
 'Bring the same borrowing amount and payoff date to every comparison. A lower first payment can leave a larger balance later.',
 'Compare el mismo monto y la misma fecha de liquidación. Un primer pago menor puede dejar un saldo mayor después.',
 [('Read the complete offer','Record the index, margin, introductory period, rate cap, required initial advance and all fees. Ask whether fixed-rate conversion is available and what it costs.'),('Compare the exit as well as the entry','Check early closure charges, annual fees and the remaining balance at your expected sale or payoff date. Our worksheet keeps the terms side by side without selecting a winner.')],
 [('Revise la oferta completa','Anote el índice, margen, período introductorio, límite de tasa, adelanto inicial obligatorio y todos los cargos. Pregunte si puede convertir a tasa fija y cuánto cuesta.'),('Compare también la salida','Revise cargos por cierre anticipado, cargos anuales y el saldo pendiente cuando planea vender o liquidar. Nuestra hoja permite comparar términos sin elegir por usted.')], 'offers','compare-heloc-offers'),
('paid-off-home','Your home is paid off. Review a first-lien HELOC.','Su casa está pagada. Revise un HELOC de primer gravamen.',
 'Stonehaven offers first-lien HELOC options for paid-off homes, subject to lender underwriting. Enter zero for your mortgage balance to start a review.',
 'Stonehaven ofrece opciones de HELOC de primer gravamen para viviendas pagadas, sujetas a evaluación del prestamista. Ingrese cero como saldo hipotecario para comenzar.',
 [('Equity is the starting point','The lender still reviews income, credit, property value, title and the requested amount. Owning the home outright does not guarantee approval or a particular credit limit.'),('A new payment deserves a plan','A HELOC creates a lien on a home that may currently have none. Compare variable payments, a fixed home-equity loan, fees and your preferred payoff date before borrowing. Property taxes, insurance and maintenance remain your responsibility.')],
 [('El capital es el punto de partida','El prestamista revisa ingresos, crédito, valor, título y monto solicitado. Tener la vivienda pagada no garantiza aprobación ni un límite específico.'),('Planifique el nuevo pago','Un HELOC crea un gravamen sobre una casa que puede no tener ninguno. Compare pagos variables, un préstamo sobre el valor de la vivienda a tasa fija, cargos y fecha de liquidación.')], 'payments','heloc-paid-off-home'),
('repayment-review','Your HELOC is changing. Review the next payment.','Su HELOC está cambiando. Revise el próximo pago.',
 'Stonehaven offers refinancing reviews for existing HELOCs. Compare keeping your line, refinancing it or using a fixed home-equity loan before committing.',
 'Stonehaven ofrece revisiones de refinanciamiento de HELOC existentes. Compare conservar la línea, refinanciarla o usar un préstamo a tasa fija antes de decidir. Impuestos de la propiedad, seguro y mantenimiento siguen siendo su responsabilidad.',
 [('Start with your current agreement','Find the draw-end date, current balance, rate formula, repayment term and any balloon payment. Ask your current servicer for the actual upcoming payment and payoff requirements.'),('Resetting the clock has a cost','A new draw period may reduce the initial payment while extending debt. Compare closing costs, total interest and the balance remaining at the same future date. Approval and timing are not guaranteed.'),('This is a new financing inquiry','Stonehaven cannot change or service an existing lender account through this form. For a payment due, account access or hardship assistance, contact your current servicer directly.')],
 [('Comience con el contrato actual','Busque la fecha final de disposición, saldo, fórmula de tasa, plazo de pago y cualquier pago global. Pida a su administrador actual el próximo pago real y requisitos de liquidación.'),('Reiniciar el plazo tiene un costo','Un nuevo período de disposición puede reducir el pago inicial y prolongar la deuda. Compare cargos, intereses y saldo pendiente en la misma fecha futura. No se garantizan aprobación ni plazos.'),('Esta es una consulta de nuevo financiamiento','Stonehaven no puede modificar ni administrar una cuenta de otro prestamista mediante este formulario. Para pagos, acceso a su cuenta o dificultades, contacte directamente a su administrador actual.')], 'payments','existing-heloc-refinance-review'),
('contractor-quotes','The quote is ready. Compare the financing.','Ya tiene la cotización. Compare el financiamiento.',
 'Compare contractor financing, a HELOC and a fixed home-equity loan using the cash price, staged invoices and a contingency you choose.',
 'Compare financiamiento del contratista, un HELOC y un préstamo a tasa fija con el precio de contado, facturas por etapas y un margen elegido por usted.',
 [('Price the project before the loan','Request a written scope, cash price, payment schedule and change-order process. Check contractor credentials independently. Stonehaven does not endorse contractors.'),('Match borrowing to actual invoices','A required initial advance may exceed the first invoice and begin accruing interest. Use the project planner to see current needs, later stages and any funding gap.')],
 [('Cotice el proyecto antes del préstamo','Pida alcance escrito, precio de contado, calendario de pagos y proceso de cambios. Verifique las credenciales del contratista por separado. Stonehaven no recomienda contratistas.'),('Ajuste el préstamo a las facturas','Un adelanto inicial obligatorio puede superar la primera factura y comenzar a generar intereses. El planificador muestra necesidades actuales, etapas posteriores y faltantes.')], 'project','contractor-financing-vs-heloc'),
('one-payment','One payment is only part of the comparison.','Un solo pago es solo parte de la comparación.',
 'Compare debt consolidation using total costs, repayment time and the balance left behind. Moving unsecured debt to a HELOC puts your home at risk.',
 'Compare consolidación de deudas según costo total, plazo y saldo pendiente. Pasar deuda sin garantía a un HELOC pone su vivienda en riesgo.',
 [('Use the same payoff horizon','Compare interest, fees and remaining principal on the same date. An interest-only payment does not reduce the borrowed balance.'),('Make room for alternatives','Compare paying existing debt directly, a personal loan or a credit-counseling plan. Consolidation does not fix repeated borrowing, and a lower payment does not establish savings.')],
 [('Use la misma fecha de comparación','Compare intereses, cargos y capital pendiente en la misma fecha. Un pago de solo intereses no reduce el saldo prestado.'),('Considere alternativas','Compare pagar directamente la deuda actual, un préstamo personal o un plan de asesoría crediticia. Consolidar no resuelve el endeudamiento repetido y un pago menor no demuestra ahorro.')], 'payments','heloc-debt-consolidation-total-cost'),
('self-employed-homeowners','Self-employed? Start with the income documentation.','¿Trabaja por cuenta propia? Comience con sus documentos de ingresos.',
 'Stonehaven offers bank-statement HELOC options, subject to lender review. We help identify the documentation path before you gather records.',
 'Stonehaven ofrece opciones de HELOC con estados de cuenta bancarios, sujetas a revisión del prestamista. Le ayudamos a identificar los documentos necesarios.',
 [('Deposits and qualifying income differ','Lenders assess business activity, ownership, expenses and eligible deposits. Transfers and one-time deposits may need explanation. The required statement period depends on the program.'),('Keep documents off this form','Start with estimated property value, mortgage balance and requested amount. Do not submit account numbers, Social Security numbers or statements here. Ask the broker for a secure document process.')],
 [('Los depósitos no equivalen automáticamente a ingresos elegibles','El prestamista evalúa actividad comercial, participación, gastos y depósitos elegibles. Transferencias y depósitos únicos pueden necesitar explicación. El período de estados requerido depende del programa.'),('No envíe documentos en este formulario','Comience con valor estimado, saldo hipotecario y monto solicitado. No envíe números de cuenta, Seguro Social ni estados aquí. Pida al bróker un proceso seguro para documentos.')], 'offers','self-employed-heloc-income-documents')]

def shell(lang,slug,title,desc,body,lp=False):
 prefix='/es' if lang=='es' else ''; path=prefix+'/'+slug
 src=(R/(('es/' if lang=='es' else '')+'heloc.html')).read_text()
 head=src.split('<main>')[0]
 head=re.sub(r'(href|src)="(?:\.\./)?(assets/|js/|styles.css|funnel.css)',r'\1="/\2',head)
 head=re.sub(r'<title>.*?</title>',f'<title>{E(title)} | Stonehaven</title>',head)
 head=re.sub(r'<meta name="description"[^>]*>',f'<meta name="description" content="{E(desc,quote=True)}"/>',head)
 head=re.sub(r'<link rel="(?:canonical|alternate)"[^>]*>','',head)
 head=re.sub(r'<meta property="og:(?:title|description|url)"[^>]*>','',head)
 head=re.sub(r'<script type="application/ld\+json">.*?</script>','',head,flags=re.S)
 head=re.sub(r'<script src="/js/heloc-calc[^>]*></script>','',head)
 head=re.sub(r'<body><noscript>.*?</noscript>', '<body>',head,flags=re.S)
 head=head.replace('href="/es/heloc" hreflang',f'href="/es/{slug}" hreflang') if lang=='en' else head.replace('href="/heloc" hreflang',f'href="/{slug}" hreflang')
 if not lp: head=re.sub(r'<script src="/js/(?:site-config|heloc-fields|funnel)[^>]*></script>','',head)
 extra=f'<link rel="canonical" href="https://stonehavencre.com{path}"/><link rel="alternate" hreflang="en" href="https://stonehavencre.com/{slug}"/><link rel="alternate" hreflang="es" href="https://stonehavencre.com/es/{slug}"/><link rel="alternate" hreflang="x-default" href="https://stonehavencre.com/{slug}"/><meta property="og:title" content="{E(title,quote=True)}"/><meta property="og:description" content="{E(desc,quote=True)}"/><meta property="og:url" content="https://stonehavencre.com{path}"/><link rel="stylesheet" href="/heloc-planning.css"/>'
 if lp: extra+='<meta name="robots" content="noindex,follow"/><script src="/js/heloc-growth-intake.js" defer></script>'
 else: extra+='<script src="/js/heloc-planning-math.js" defer></script><script src="/js/heloc-planning.js" defer></script>'
 head=head.replace('</head>',extra+'</head>')
 disclosure=src[src.rfind('<section style="padding:38px'):src.index('</main>')]
 return head+'<main>'+body+disclosure+f'</main><footer class="hp-wrap hp-section"><a href="{prefix}/heloc">HELOC</a> · <a href="{prefix}/blog">Blog</a> · <a href="{prefix}/privacy">'+('Privacidad' if lang=='es' else 'Privacy')+'</a></footer></body></html>\n'

def module(lang,item):
 slug,en,es,den,des,ben,bes,tool,article=item; p='/es' if lang=='es' else ''
 bits=bes if lang=='es' else ben
 return '<section class="hp-wrap hp-section" id="growth-planning">'+''.join(f'<div class="hp-card"><h2>{E(h)}</h2><p>{E(t)}</p></div>' for h,t in bits)+f'<p><a href="{p}/heloc-planning-tools#{tool}">'+('Abrir herramienta de planificación' if lang=='es' else 'Open the planning tool')+f'</a> · <a href="{p}/blog/{article}">'+('Leer la guía completa' if lang=='es' else 'Read the full guide')+'</a> · <a href="'+('/heloc/' if lang=='es' else '/es/heloc/')+slug+'">'+('English' if lang=='es' else 'Español')+'</a></p></section>'

for item in DATA:
 slug,en,es,den,des,*_=item
 for lang,title,desc in [('en',en,den),('es',es,des)]:
  path=R/(('es/' if lang=='es' else '')+'heloc/'+slug+'.html')
  if lang=='en' and slug in ['contractor-quotes','one-payment','self-employed-homeowners']:
   text=path.read_text(); block='<!-- HELOC:GROWTH:START -->\n'+module(lang,item)+'\n<!-- HELOC:GROWTH:END -->'
   text=re.sub(r'<!-- HELOC:GROWTH:START -->.*?<!-- HELOC:GROWTH:END -->\n?','',text,flags=re.S)
   text=text.replace('<section class="lead" id="intake">',block+'\n<section class="lead" id="intake">')
   if 'name="growth_topic"' not in text:text=text.replace('<input type="hidden" name="form-name"',f'<input type="hidden" name="growth_topic" value="{slug}"/><input type="hidden" name="form-name"')
   if 'hreflang="es"' not in text:text=text.replace('</head>',f'<link rel="alternate" hreflang="en" href="https://stonehavencre.com/heloc/{slug}"/><link rel="alternate" hreflang="es" href="https://stonehavencre.com/es/heloc/{slug}"/></head>')
   if '/heloc-planning.css' not in text:text=text.replace('</head>','<link rel="stylesheet" href="/heloc-planning.css"/></head>')
  else:
   src=(R/(('es/' if lang=='es' else '')+'heloc.html')).read_text()
   form=re.search(r'<section class="lead" id="callback">.*?</section>',src,re.S).group()
   form=form.replace('<input type="hidden" name="form-name"',f'<input type="hidden" name="growth_topic" value="{slug}"/><input type="hidden" name="lp_variant" value="heloc-growth-{slug}"/><input type="hidden" name="goal" value="HELOC"/><input type="hidden" name="form-name"')
   if slug=='repayment-review':
    form=form.replace('<div class="lead-actions">','<div class="lf-field"><label for="current-heloc">'+('Saldo del HELOC actual, opcional ($)' if lang=='es' else 'Existing HELOC balance, optional ($)')+'</label><input id="current-heloc" type="number" min="0" step="0.01" name="existing_heloc_balance"/></div><div class="lf-field"><label for="draw-end">'+('Fin de disposición, opcional' if lang=='es' else 'Draw period ends, optional')+'</label><input id="draw-end" type="month" name="draw_end"/></div><div class="lead-actions">')
   form=re.sub(r'<option value="Other">.*?</option>','',form)
   form=form.replace('<select id="cb-state" name="state">','<select id="cb-state" name="state" required><option value="" selected>'+('Seleccione un estado' if lang=='es' else 'Select a state')+'</option>')
   text=shell(lang,'heloc/'+slug,title,desc,f'<section class="hp-wrap hp-hero"><span class="eyebrow">HELOC · Stonehaven Lending</span><h1>{E(title)}</h1><p>{E(desc)}</p><a class="btn-primary" href="#callback">'+('Solicitar revisión' if lang=='es' else 'Request a review')+'</a></section>'+module(lang,item)+f'<section class="hp-wrap hp-section"><p>'+('Disponible para revisión en GA, AL, TN, FL, NC y SC. El HELOC está garantizado por su vivienda. Las tasas y pagos pueden subir; el incumplimiento puede causar la pérdida de la casa. Sujeto a verificación y aprobación.' if lang=='es' else 'Available for review in GA, AL, TN, FL, NC and SC. A HELOC is secured by your home. Rates and payments may rise; failure to repay can result in loss of the home. Subject to verification and approval.')+'</p></section>'+form,True)
  path.parent.mkdir(exist_ok=True);path.write_text(text)

# Tools use blank user-entered assumptions, never a advertised rate or implied offer.
def field(key,en,es,lang,minimum=0,maximum=100000000,step='0.01'):
 return f'<label for="hp-{key}">{E(es if lang=="es" else en)}<input id="hp-{key}" data-key="{key}" type="number" inputmode="decimal" min="{minimum}" max="{maximum}" step="{step}" required autocomplete="off"/></label>'
def button(lang):return '<button type="button" data-calculate>'+('Calcular' if lang=='es' else 'Calculate')+'</button><p data-error class="hp-error" role="alert"></p><div data-result class="hp-results" aria-live="polite" hidden></div>'
for lang in ['en','es']:
 es=lang=='es';p='/es' if es else ''; title='Herramientas para planificar un HELOC' if es else 'HELOC planning tools'
 desc='Compare ofertas, pagos y etapas del proyecto con sus propios supuestos.' if es else 'Compare offers, payments and project stages using your own assumptions.'
 body=f'<div class="hp-wrap"><section class="hp-hero"><h1>{title}</h1><p>{desc}</p><p>'+('Los datos permanecen en esta página. No se guardan ni se envían. Imprima antes de salir si desea conservarlos.' if es else 'Your inputs stay on this page. They are not saved or sent. Print before leaving if you want to keep your work.')+'</p><nav class="hp-links"><a href="#offers">'+('Ofertas' if es else 'Offers')+'</a><a href="#payments">'+('Pagos' if es else 'Payments')+'</a><a href="#project">'+('Proyecto' if es else 'Project')+'</a></nav></section>'
 body+='<section class="hp-section" id="offers"><h2>'+('Hoja de comparación de ofertas' if es else 'Offer comparison worksheet')+'</h2><p>'+('Copie los términos escritos. No incluya nombres ni números de cuenta. No asumimos que una oferta sea mejor.' if es else 'Copy the written terms. Do not include names or account numbers. This worksheet does not rank offers.')+'</p><div class="hp-grid">'
 terms=[('Lender / offer label','Prestamista / etiqueta'),('Credit limit and amount needed','Límite y monto necesario'),('Index + margin; introductory end date','Índice + margen; fin de introducción'),('Rate caps and floors','Límites y mínimos de tasa'),('Minimum initial draw and holding period','Adelanto mínimo y período obligatorio'),('Draw period and repayment term','Período de disposición y plazo de pago'),('Payment calculation; balloon, if any','Cálculo del pago; pago global, si existe'),('Closing, annual and inactivity fees','Cargos de cierre, anuales e inactividad'),('Early closure / fee reimbursement','Cierre anticipado / reembolso de cargos'),('Fixed-rate conversion terms and fees','Términos y cargos de conversión a tasa fija'),('Sale / payoff process and expected timing','Proceso de venta / liquidación y plazo esperado')]
 for letter in ['A','B']:
  body+=f'<div class="hp-card"><h3>'+('Oferta ' if es else 'Offer ')+letter+'</h3>'
  for i,(a,b) in enumerate(terms):body+=f'<label for="offer-{letter}-{i}">{E(b if es else a)}<input id="offer-{letter}-{i}" type="text" maxlength="180" autocomplete="off"/></label>'
  body+='</div>'
 body+='</div><button type="button" data-print-planning>'+('Imprimir o guardar PDF' if es else 'Print or save PDF')+'</button></section>'
 body+='<section class="hp-section" id="payments"><h2>'+('Pagos, cambio de tasa y costo total' if es else 'Payments, rate change and total cost')+'</h2><p>'+('Modelo mensual ilustrativo de un solo adelanto. La deuda actual se modela como préstamo de tasa fija amortizado, no como pago mínimo real de tarjetas. La nueva línea paga solo intereses durante disposición y luego amortiza. Sin nuevos retiros, pagos adicionales ni cargos recurrentes. El interés diario y los términos reales pueden cambiar los resultados. Ingrese sus propios supuestos, no son cotizaciones.' if es else 'Illustrative monthly model of one advance. Existing debt is modeled as a fixed-rate amortizing loan, not actual credit-card minimums. The new line pays interest only during the draw period, then amortizes. No further draws, extra payments or recurring fees are modeled. Daily accrual and actual contract terms can change results. Enter your own assumptions; these are not quotes.')+'</p><div class="hp-grid">'
 for args in [('amount','Amount borrowed ($)','Monto prestado ($)',1,100000000,'0.01'),('old-rate','Existing debt annual rate (%)','Tasa anual de deuda actual (%)',0,100,'0.001'),('old-months','Existing debt remaining months','Meses restantes de deuda actual',1,360,'1'),('rate','New starting annual rate (%)','Nueva tasa anual inicial (%)',0,100,'0.001'),('draw','Interest-only draw months (0 for amortizing now)','Meses de solo intereses (0 para amortizar ahora)',0,240,'1'),('repay','Repayment months after draw period','Meses de pago tras disposición',1,360,'1'),('fees','One-time fees ($)','Cargos únicos ($)',0,10000000,'0.01'),('horizon','Comparison horizon in months','Período de comparación en meses',1,600,'1'),('change','Rate changes at start of month','Cambio de tasa al inicio del mes',1,600,'1'),('later','Annual rate after change (%)','Tasa anual después del cambio (%)',0,100,'0.001')]:
  key,a,b,mn,mx,step=args;body+=field(key,a,b,lang,mn,mx,step)
 body+='</div><label><input type="checkbox" data-key="finance"/> '+('Financiar los cargos únicos (si el prestamista lo permite)' if es else 'Finance one-time fees (if the lender permits)')+'</label>'+button(lang)+'<p class="hp-note">'+('Compare pagos más saldo pendiente más cargos iniciales en la misma fecha. Un pago menor puede dejar más deuda. Las tasas futuras son desconocidas; este cambio único es solo un escenario. Su vivienda garantiza el HELOC.' if es else 'Compare payments plus remaining balance plus upfront fees at the same date. A smaller payment can leave more debt. Future rates are unknown; the single rate change is only a scenario. Your home secures the HELOC.')+'</p></section>'
 body+='<section class="hp-section" id="project"><h2>'+('Planificador de etapas del proyecto' if es else 'Project draw planner')+'</h2><p>'+('Separe facturas por etapas. El margen es una cantidad que usted elige. El adelanto inicial no cambia el costo del proyecto. Esta herramienta no estima intereses ni aprueba una línea.' if es else 'Separate invoices by stage. The contingency is an amount you choose. The initial advance does not change project cost. This tool does not estimate interest or approve a credit line.')+'</p><div class="hp-grid">'
 for key,a,b in [('now','Invoices due now ($)','Facturas actuales ($)'),('stage2','Second stage ($)','Segunda etapa ($)'),('stage3','Remaining work ($)','Trabajo restante ($)'),('reserve','Contingency ($)','Margen para imprevistos ($)'),('initial','Required initial advance ($)','Adelanto inicial obligatorio ($)'),('limit','Assumed available credit limit ($)','Límite de crédito supuesto ($)')]:body+=field(key,a,b,lang)
 body+='</div>'+button(lang)+'</section><section class="hp-section"><h2>'+('Prepare su conversación' if es else 'Prepare your conversation')+f'</h2><p><a href="{p}/heloc#callback">'+('Solicitar revisión de un HELOC' if es else 'Request a HELOC review')+'</a></p><p>'+('Estos escenarios son educativos, no asesoría fiscal ni una aprobación. Consulte las condiciones del prestamista.' if es else 'These scenarios are educational, not tax advice or approval. Consult the lender’s actual terms.')+'</p><p><a href="https://www.consumerfinance.gov/ask-cfpb/what-is-a-home-equity-line-of-credit-heloc-en-107/">CFPB: HELOC</a> · <a href="https://www.consumerfinance.gov/ask-cfpb/what-fees-can-my-lender-charge-if-i-take-out-a-heloc-en-249/">CFPB: '+('cargos' if es else 'fees')+'</a></p><button type="button" data-print-planning>'+('Imprimir el plan' if es else 'Print the plan')+'</button></section></div>'
 (R/(('es/' if es else '')+'heloc-planning-tools.html')).write_text(shell(lang,'heloc-planning-tools',title,desc,body))
 # Discoverable on main HELOC hub, with all 24 article links organized as a library.
 hub=R/(('es/' if es else '')+'heloc.html');text=hub.read_text()
 block='<!-- HELOC:LIBRARY:START --><section class="tight seo-resources"><div class="wrap"><h2>'+('Guías y herramientas de capital' if es else 'Home equity guides and tools')+f'</h2><p><a href="{p}/heloc-planning-tools">'+('Comparar ofertas, pagos y etapas' if es else 'Compare offers, payments and project stages')+'</a></p><div class="seo-resource-grid">'
 for a in json.loads((R/'docs/heloc-growth/articles.json').read_text()):block+=f'<article><h3><a href="{p}/blog/{a["slug"]}">{E(a[lang])}</a></h3></article>'
 block+='</div></div></section><!-- HELOC:LIBRARY:END -->'
 text=re.sub(r'<!-- HELOC:LIBRARY:START -->.*?<!-- HELOC:LIBRARY:END -->\n?','',text,flags=re.S)
 hub.write_text(text.replace('<section class="lead" id="callback">',block+'\n<section class="lead" id="callback">'))
# Keep clean routes and sitemap repeatable.
red=R/'_redirects';text=red.read_text()
for lang in ['', 'es/']:
 for route in ['heloc-planning-tools']+['heloc/'+x[0] for x in DATA]:
  line=f'/{lang}{route} /{lang}{route}.html 200'
  if not re.search(r'^/'+re.escape(lang+route)+r'\s',text,re.M):text=line+'\n'+text
red.write_text(text)
sitemap=R/'sitemap.xml';text=sitemap.read_text()
for p in ['/heloc-planning-tools','/es/heloc-planning-tools']:
 if f'<loc>https://stonehavencre.com{p}</loc>' not in text:text=text.replace('</urlset>',f'  <url><loc>https://stonehavencre.com{p}</loc><lastmod>2026-09-12</lastmod></url>\n</urlset>')
sitemap.write_text(text)
print('Built HELOC landing pages, planning tools and article library')
