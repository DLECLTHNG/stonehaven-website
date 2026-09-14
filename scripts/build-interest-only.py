#!/usr/bin/env python3
"""Build bilingual interest-only pages with the established residential shell."""
from pathlib import Path
import json,re,html
R=Path(__file__).resolve().parent.parent
E=html.escape
states=["Georgia","Alabama","Tennessee","Florida","North Carolina","South Carolina"]
copy=json.loads((R/"scripts/interest-only-content.json").read_text())
for lang,c in copy.items():
 prefix='/es' if lang=='es' else '';url='https://stonehavencre.com'+prefix+'/interest-only-loans';base=(R/(prefix.lstrip('/')+'/' if prefix else '')/'residential.html').read_text()
 head=base[:base.index('<main>')];footer=base[base.index('</main>')+len('</main>'):]
 head=head.replace('href="/es/residential"','href="/es/interest-only-loans"') if lang=='en' else head.replace('href="/residential"','href="/interest-only-loans"')
 if lang=='es': head=head.replace('>Call</a>','>Llamar</a>')
 head=re.sub(r'<title>.*?</title>',f'<title>{E(c["title"])} | Stonehaven</title>',head)
 head=re.sub(r'<meta name="description"[^>]*>',f'<meta name="description" content="{E(c["desc"])}"/>',head)
 for name,value in [('og:title',c['title']),('og:description',c['desc']),('og:url',url)]:head=re.sub(r'<meta property="'+name+r'"[^>]*>',f'<meta property="{name}" content="{E(value)}"/>',head)
 head=re.sub(r'<link rel="canonical"[^>]*>',f'<link rel="canonical" href="{url}"/>',head)
 head=re.sub(r'<link rel="alternate"[^>]*>','',head)
 head=re.sub(r'<script type="application/ld\+json">.*?</script>','',head,flags=re.S)
 schema={'@context':'https://schema.org','@type':'Service','name':c['title'],'serviceType':'Interest-only mortgage brokerage','description':c['desc'],'url':url,'areaServed':[{'@type':'State','name':x} for x in states],'provider':{'@type':'Organization','name':'Stonehaven Lending','url':'https://stonehavencre.com/'}}
 head=head.replace('</head>',f'<link rel="stylesheet" href="/bank-statement.css?v=1"/><link rel="alternate" hreflang="en" href="https://stonehavencre.com/interest-only-loans"/><link rel="alternate" hreflang="es" href="https://stonehavencre.com/es/interest-only-loans"/><link rel="alternate" hreflang="x-default" href="https://stonehavencre.com/interest-only-loans"/><script type="application/ld+json">{json.dumps(schema,ensure_ascii=False)}</script></head>')
 def cards(items):return ''.join(f'<div class="bs-card"><h3>{E(h)}</h3><p>{E(p)}</p></div>' for h,p in items)
 hero=f'<section class="bs-hero wrap"><div><nav class="bs-crumb"><a href="{prefix}/">{c["home"]}</a> / <a href="{prefix}/residential">{c["links"][0]}</a></nav><span class="eyebrow">{c["eyebrow"]}</span><h1>{c["h1"]}</h1><p class="bs-intro">{c["intro"]}</p><a class="btn-primary" href="#inquire">{c["cta"]}</a><p class="bs-fine">{c["note"]}</p></div><aside class="bs-summary"><h2>{c["card"]}</h2>'+''.join(f'<div><b>{E(k)}</b><p>{E(v)}</p></div>' for k,v in c['facts'])+'</aside></section>'
 body=f'<section class="wrap bs-section"><h2>{c["fit"]}</h2><div class="bs-grid">{cards(c["people"])}</div></section><section class="bs-tint"><div class="wrap bs-section"><h2>{c["how"]}</h2><div class="bs-grid">{cards(c["steps"])}</div><div class="bs-note"><h3>{c["details"]}</h3><p>{c["detailp"]}</p></div></div></section>'
 body+=f'<section class="wrap bs-section"><h2>{c["compare"]}</h2><div class="bs-table"><table><thead><tr>'+''.join(f'<th scope="col">{E(x)}</th>' for x in c['cols'])+'</tr></thead><tbody>'+''.join('<tr><th scope="row">'+E(row[0])+'</th>'+''.join('<td>'+E(x)+'</td>' for x in row[1:])+'</tr>' for row in c['rows'])+f'</tbody></table></div><p class="bs-fine">{c["tradeoff"]}</p></section>'
 body+=f'<section class="wrap bs-section"><h2>{c["faqtitle"]}</h2>'+''.join(f'<details class="bs-faq"><summary>{E(q)}</summary><p>{E(a)}</p></details>' for q,a in c['faqs'])+'</section>'
 names=['name','email','phone','state','goal','ownership_timeline','property_value','requested_amount'];fields=''
 for i,(name,label) in enumerate(zip(names,c['labels'])):
  if i in (3,4,5):
   vals=states if i==3 else c['goals'] if i==4 else c['history'];control=f'<select name="{name}" id="bs-{name}" required><option value="">{c["choose"]}</option>'+''.join(f'<option>{E(x)}</option>' for x in vals)+'</select>'
  else:
   typ=['text','email','tel'][i] if i<3 else 'number';extra=' required' if i<3 else ' min="1" step="0.01"';auto=f' autocomplete="{["name","email","tel"][i]}"' if i<3 else '';control=f'<input id="bs-{name}" name="{name}" type="{typ}"{extra}{auto}/>'
  fields+=f'<div class="lf-field"><label for="bs-{name}">{E(label)}</label>{control}</div>'
 body+=f'<section class="wrap bs-section"><p class="bs-fine">'+('Lectura adicional: ' if lang=='es' else 'Further reading: ')+ '<a href="https://www.consumerfinance.gov/ask-cfpb/what-is-an-interest-only-loan-en-101/">Consumer Financial Protection Bureau: interest-only loans</a></p></section>'
 body+=f'<section class="lead" id="inquire"><div class="wrap"><div class="lead-card"><h2>{c["formtitle"]}</h2><p class="sub">{c["formintro"]}</p><form class="lead-form" data-sh-form="residential-interest-only" data-sh-product="Residential" data-sh-event="lead" data-sh-lang="{lang}" data-sh-about-prefix="Interest-only mortgage inquiry" method="POST" action="{prefix}/interest-only-loans" data-netlify="true" netlify-honeypot="company_website"><input type="hidden" name="form-name" value="lead"/><input type="hidden" name="loan_program" value="Interest-only mortgage"/><input name="company_website" class="hp-field" tabindex="-1" autocomplete="off" aria-hidden="true"/>{fields}<div class="lead-actions"><span class="note">{c["consent"]} <a href="{prefix}/privacy">'+('Privacidad' if lang=='es' else 'Privacy')+f'</a></span><button class="lead-submit" type="submit">{c["cta"]}</button></div></form><div class="lead-success" role="status"><div class="ok">{c["success"]}</div></div></div></div></section>'
 body+=f'<section class="wrap bs-section"><h2>{c["related"]}</h2><div class="bs-related">'+''.join(f'<a href="{prefix}/{slug}">{label}</a>' for slug,label in zip(['residential','dscr','bank-statement-loans'],c['links']))+f'</div><p class="bs-fine"><a href="{prefix}/editorial-policy">'+('Criterios editoriales' if lang=='es' else 'Editorial standards')+'</a> · <a href="/management">'+('Nuestro equipo' if lang=='es' else 'Meet the team')+'</a></p></section>'
 footer=footer.replace('href="/es/residential"','href="/es/interest-only-loans"') if lang=='en' else footer.replace('href="/residential" style="color:var(--stone-400);"','href="/interest-only-loans" style="color:var(--stone-400);"')
 (R/(prefix.lstrip('/')+'/' if prefix else '')/'interest-only-loans.html').write_text(head+'<main>'+hero+body+'</main>'+footer)
