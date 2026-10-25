"""Short, optional first-contact paths and reported-deal context on existing pages."""
from html import escape
import re

PRIORITY = {
 '/commercial/hud-financing': ('Commercial','HUD financing review','Revisión de financiamiento HUD'),
 '/commercial/hud-223f-loans': ('Commercial','HUD 223(f) apartment financing','Financiamiento de apartamentos HUD 223(f)'),
 '/commercial/hud-221d4-construction-loans': ('Commercial','HUD 221(d)(4) construction financing','Financiamiento de construcción HUD 221(d)(4)'),
 '/commercial/hud-build-to-rent-financing': ('Commercial','HUD build-to-rent financing','Financiamiento HUD para comunidades de alquiler'),
 '/commercial/hud-232-healthcare-financing': ('Commercial','HUD 232 facility financing','Financiamiento de centros HUD 232'),
 '/commercial/construction-loans': ('Commercial','Construction financing','Financiamiento de construcción'),
 '/commercial/land-development-loans': ('Commercial','Land development financing','Financiamiento de desarrollo de terrenos'),
 '/commercial/multifamily-acquisition': ('Commercial','Multifamily acquisition','Compra de inmuebles multifamiliares'),
 '/sba': ('SBA','SBA financing','Financiamiento SBA'),
 '/residential/jumbo-loans': ('Residential','High-value home financing','Financiamiento de viviendas de alto valor'),
 '/dscr': ('DSCR','Rental property financing','Financiamiento de propiedades de alquiler'),
}
STYLE='<link rel="stylesheet" href="/inquiry-journeys.css?v=1"/>'

def block(kind, content):
 return f'<!-- INQUIRY-JOURNEY:{kind}:START -->'+content+f'<!-- INQUIRY-JOURNEY:{kind}:END -->'

def quick_form(product,purpose,es,path,full):
 prefix='/es' if es else ''
 source='quick-'+path.strip('/').replace('/','-')
 t=lambda en,sp:sp if es else en
 details=t('Add a few deal details (optional)','Añadir detalles de la operación (opcional)')
 consent=t('By submitting, you ask Stonehaven to respond by your selected method about this inquiry. Consent is not a condition of service. For texts, message and data rates may apply; reply STOP to opt out.','Al enviar, solicita que Stonehaven responda por el medio seleccionado sobre esta consulta. El consentimiento no es condición del servicio. Para mensajes de texto pueden aplicarse cargos; responda STOP para cancelar.')
 note=t('Initial inquiry only. Financing is subject to underwriting, documentation and program availability.','Consulta inicial. El financiamiento está sujeto a evaluación, documentación y disponibilidad.')
 if path.removeprefix('/es').startswith('/commercial/hud-'):
  note=t('Stonehaven acts as your mortgage broker. This is an initial inquiry; financing is subject to underwriting, documentation and program availability.','Stonehaven actúa como su intermediario hipotecario. Esta es una consulta inicial; el financiamiento está sujeto a evaluación, documentación y disponibilidad.')
 return block('QUICK',f'''<section class="lead inquiry-quick" id="quick-inquiry"><div class="wrap"><div class="lead-card">
 <span class="eyebrow">{t('Start a conversation','Inicie una conversación')}</span><h2>{t('Discuss your financing','Hablemos de su financiamiento')}</h2>
 <p class="sub">{escape(purpose)}. {t('Start with your name and email. Deal details are optional; we will review your inquiry and explain the next step.','Empiece con su nombre y correo. Los detalles son opcionales; revisaremos su consulta y explicaremos el siguiente paso.')}</p>
 <form class="lead-form" data-sh-form="{source}" data-sh-product="{product}" data-sh-event="lead" data-sh-lang="{t('en','es')}" data-sh-about-prefix="{escape(purpose,quote=True)}" method="POST" action="{prefix}/thanks-quote" data-netlify="true" netlify-honeypot="company_website" novalidate>
 <input type="hidden" name="product" value="{product}"/><input type="hidden" name="page" value="{source}"/><input type="hidden" name="lang" value="{t('en','es')}"/><input type="hidden" name="form-name" value="lead"/><input type="hidden" name="loan_program" value="{escape(purpose,quote=True)}"/><input type="hidden" name="inquiry_path" value="quick-v1"/>
 <input type="text" name="company_website" class="hp-field" tabindex="-1" autocomplete="off" aria-hidden="true"/>
 <div class="lf-field"><label for="quick-name">{t('Full name','Nombre completo')}</label><input id="quick-name" name="name" type="text" autocomplete="name" required maxlength="120"/></div>
 <div class="lf-field"><label for="quick-email">{t('Email','Correo electrónico')}</label><input id="quick-email" name="email" type="email" autocomplete="email" required maxlength="254"/></div>
 <div class="lf-field"><label for="quick-contact">{t('How should we reply?','¿Cómo prefiere la respuesta?')}</label><select id="quick-contact" name="contact_preference"><option value="Email">{t('Email','Correo electrónico')}</option><option value="Text">{t('Text message','Mensaje de texto')}</option></select></div>
 <div class="lf-field"><label for="quick-phone">{t('Mobile number (needed for text)','Celular (necesario para texto)')}</label><input id="quick-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" aria-describedby="quick-phone-help"/><small id="quick-phone-help">{t('Optional if you prefer email.','Opcional si prefiere correo.')}</small></div>
 <details class="quick-details"><summary>{details}</summary><div class="lf-field"><label for="quick-about">{t('What would you like to finance?','¿Qué desea financiar?')}</label><textarea id="quick-about" name="about" rows="3" maxlength="1000" aria-describedby="quick-privacy"></textarea><small id="quick-privacy">{t('A location, financing goal or timing is enough. No SSNs, account numbers or private documents.','Basta con ubicación, objetivo o plazo. No incluya SSN, números de cuenta ni documentos privados.')}</small></div></details>
 <div class="lead-actions"><span class="note">{consent} <a href="{prefix}/privacy">{t('Privacy policy','Privacidad')}</a>.</span><button class="lead-submit" type="submit">{t('Send my inquiry','Enviar mi consulta')}</button></div>
 </form><div class="lead-success" role="status" aria-live="polite"><div class="ok">{t('Thank you. Your inquiry was submitted.','Gracias. Su consulta fue enviada.')}</div><p>{t('Our team will review it and respond by your preferred method. This is not an approval or a rate quote.','Nuestro equipo la revisará y responderá por el medio elegido. No es una aprobación ni una cotización.')}</p></div>
 <p class="quick-alternatives"><a href="{full}">{t('Ready with the numbers? Use the detailed review','¿Tiene las cifras? Use la revisión detallada')}</a> · <a href="{prefix}/book?product={product}">{t('Book a conversation','Reserve una conversación')}</a></p>
 <p class="quick-note">{note}</p>
 </div></div></section>''')

def evidence(kind,es,cta,level=3):
 prefix='/es' if es else ''
 if kind=='dscr':
  title='Un préstamo DSCR para liquidar deuda puente' if es else 'A DSCR loan to retire bridge debt'
  copy='En agosto de 2026, Stonehaven reportó haber gestionado aproximadamente $225,000 de financiamiento sobre un alquiler unifamiliar en Florida valorado en unos $300,000, al 75% LTV, para liquidar un préstamo de dinero privado próximo a vencer.' if es else 'In August 2026, Stonehaven reported arranging approximately $225,000 against a Florida single-family rental valued at about $300,000, at 75% LTV, to pay off a maturing hard-money loan.'
  slug='florida-dscr-cash-out-refinance-75-ltv-hard-money-payoff'
  limit='El plazo y los términos fueron específicos de esa operación y su expediente preparado; no son una oferta actual ni una promesa de cierre.' if es else 'The timing and terms belonged to that transaction and its prepared file. They are not current pricing or a standard closing promise.'
 else:
  title='Construcción con capital aportado en el terreno' if es else 'Construction with equity already in the land'
  copy='En septiembre de 2026, Stonehaven reportó haber gestionado financiamiento para el 100% del presupuesto de construcción declarado de un proyecto de demolición y reconstrucción en Brookhaven, Georgia, con capital del constructor en el terreno.' if es else 'In September 2026, Stonehaven reported arranging financing for 100% of the stated construction budget on a Brookhaven, Georgia teardown and rebuild, with the builder’s equity in the land.'
  slug='brookhaven-ga-100-ltc-ground-up-construction'
  limit='No equivale al 100% de todos los costos del proyecto ni establece que otro constructor no necesite efectivo.' if es else 'This is not 100% of every project cost and does not establish that another builder needs no cash.'
 return '<article class="inquiry-evidence"><span class="eyebrow">'+('Operación reportada por Stonehaven' if es else 'Company-reported transaction')+'</span><h'+str(level)+'>'+title+'</h'+str(level)+'><p>'+copy+'</p><p class="quick-note">'+limit+'</p><p><a href="'+prefix+'/blog/'+slug+'">'+('Lea el caso completo' if es else 'Read the complete case study')+'</a> · <a href="'+cta+'">'+('Hable de su proyecto' if es else 'Discuss your project')+'</a></p></article>'

def clean(text):
 return re.sub(r'<!-- INQUIRY-JOURNEY:[A-Z]+:START -->.*?<!-- INQUIRY-JOURNEY:[A-Z]+:END -->','',text,flags=re.S).replace(STYLE,'')

def transform(text,path):
 es=path.startswith('/es/');local=path[3:] if es else path
 text=clean(text)
 if 'noindex' in text or '<main>' not in text:return text
 persona=local.startswith('/dscr/')
 home=local=='/'
 if not home and local not in PRIORITY and not persona:return text
 prefix='/es' if es else ''
 if home:
  home_anchor='#enquire' if es else '#inquire'
  # Keep a real separator even when mobile hides forced line breaks.
  text=text.replace('.<br><em>','. <br><em>')
  actions='<div class="inquiry-hero-actions"><a class="btn-primary" href="#inquire">'+('Hablemos de su financiamiento' if es else 'Discuss your financing')+'</a><a class="btn-quiet" href="tel:+14709704979">'+('Llámenos' if es else 'Call (470) 970-4979')+'</a></div><p class="inquiry-next">'+('Comparta su objetivo. Nuestro equipo revisará la consulta y explicará los siguientes pasos por correo o mensaje de texto.' if es else 'Share your financing goal. Our team will review the inquiry and explain the next steps by email or text.')+'</p>'
  actions=actions.replace('#inquire',home_anchor)
  pos=text.index('<div class="funded-volume"');text=text[:pos]+block('ACTION',actions)+text[pos:]
  proof=block('PROOF','<section class="wrap inquiry-proof"><h2>'+('De la estructura al cierre' if es else 'From financing structure to closing')+'</h2><div class="inquiry-proof-grid">'+evidence('construction',es,prefix+'/commercial/construction-loans#inquire')+evidence('dscr',es,home_anchor)+'</div></section>')
  pos=text.index('</section>',text.index('positioning-guides'))+len('</section>');text=text[:pos]+proof+text[pos:]
 else:
  if persona:
   product='DSCR';m=re.search(r'<span class="eyebrow">DSCR · (.*?)</span>',text);purpose=m[1] if m else 'Rental property financing'
  else:product,en,spanish=PRIORITY[local];purpose=spanish if es else en
  # Primary hero links jump to the short path; detailed tools remain available.
  start=text.index('<main>');end=text.index('</section>',start)
  hero=text[start:end]
  action_label=('Hablemos de su obra nueva' if es else 'Discuss my ground-up build') if local=='/commercial/construction-loans' else ('Hablemos de su financiamiento' if es else 'Discuss your financing')
  hero=re.sub(r'(<a class="btn-primary" href=")[^"]+(">).*?(</a>)',lambda m:m[1]+'#quick-inquiry'+m[2]+action_label+m[3],hero,count=1,flags=re.S)
  text=text[:start]+hero+text[end:]
  if local in ['/dscr','/dscr/cash-out-refinance','/dscr/bridge-loan-refinance','/commercial/construction-loans']:
   kind='construction' if product=='Commercial' else 'dscr'
   anchor=text.find('id="answer"');anchor=anchor if anchor>=0 else text.index('<main>')
   pos=text.index('</section>',anchor)+len('</section>')
   text=text[:pos]+block('PROOF','<section class="wrap inquiry-proof">'+evidence(kind,es,'#quick-inquiry',level=2)+'</section>')+text[pos:]
  # Insert above the existing detailed form/review, or at the end of main.
  match=re.search(r'<section\b[^>]*id="(?:inquire|enquire|review)"',text)
  pos=match.start() if match else text.index('</main>')
  full=prefix+'/dscr-review' if product=='DSCR' else ('#enquire' if 'id="enquire"' in text else '#inquire')
  if product=='Commercial' and not match:full=prefix+'/commercial'+('#enquire' if es else '#inquire')
  text=text[:pos]+quick_form(product,purpose,es,path,full)+text[pos:]
 return text.replace('</head>',STYLE+'</head>')
