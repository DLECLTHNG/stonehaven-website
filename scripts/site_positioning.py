"""Owner-approved positioning sources, applied by the final navigation pass."""
from pathlib import Path
import re

def build(root):
    templates=root/'scripts/positioning-templates'
    names={'home':'index','residential':'residential','residential-buy':'residential/buy','residential-refinance':'residential/refinance','residential-jumbo-loans':'residential/jumbo-loans'}
    names.update({
        'residential-georgia':'residential/georgia',
        'residential-alabama':'residential/alabama',
        'residential-tennessee':'residential/tennessee',
        'residential-florida':'residential/florida',
        'residential-north-carolina':'residential/north-carolina',
        'residential-south-carolina':'residential/south-carolina',
        'resources-residential':'resources/residential',
    })
    for language in ('en','es'):
        for name,route in names.items():
            target=root/('es/' if language=='es' else '')/(route+'.html')
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_text((templates/(language+'-'+name+'.html')).read_text())

def footer(text,path):
    if 'noindex' in text or '/heloc-application' in path:
        return text
    es=path.startswith('/es/')
    tagline=('Financiamiento inmobiliario comercial, SBA y para viviendas de alto valor. Un solo equipo responsable.' if es else 'Commercial real estate, SBA and high-value home financing. One accountable team.')
    def update(match):
        foot=match[0]
        foot=re.sub(r'(<div class="foot-brand">.*?</div>\s*<p>).*?(</p>)',lambda m:m[1]+tagline+m[2],foot,count=1,flags=re.S)
        foot=re.sub(r'<a href="/(?:es/)?resources/residential"[^>]*>.*?</a>','',foot,flags=re.S)
        prefix='/es' if es else ''
        nav='<div class="foot-nav"><div class="col"><p class="footer-label">'+('Financiamiento' if es else 'Financing')+'</p>'
        for url,en,spanish in [('/commercial','Commercial','Comercial'),('/sba','SBA','SBA'),('/dscr','DSCR','DSCR'),('/residential','Residential','Residencial')]:
            nav+=f'<a href="{prefix}{url}">{spanish if es else en}</a>'
        nav+='</div><div class="col"><p class="footer-label">'+('Recursos' if es else 'Resources')+'</p>'
        for url,en,spanish in [('/resources/sba','SBA resources','Recursos SBA (en inglés)'),('/resources/commercial','CRE resources','Recursos comerciales (en inglés)')]:
            nav+=f'<a href="{url}">{spanish if es else en}</a>'
        nav+='</div><div class="col"><p class="footer-label">'+('Firma' if es else 'Firm')+'</p>'
        for url,en,spanish in [('/management','Management','Equipo (en inglés)'),('/blog','Guides and articles','Guías y artículos'),('/contact','Contact','Contacto'),('/privacy','Privacy policy','Política de privacidad')]:
            target=url if url=='/management' else prefix+url
            nav+=f'<a href="{target}">{spanish if es else en}</a>'
        nav+='</div></div>'
        foot=re.sub(r'<div class="foot-nav">.*?(?=\s*</div>\s*<div class="foot-bottom")',lambda _:nav,foot,flags=re.S)
        return foot
    return re.sub(r'<footer\b.*?</footer>',update,text,flags=re.S)
