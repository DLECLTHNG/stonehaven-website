# -*- coding: utf-8 -*-
"""Build the /dscr/<slug> subsection pages from dscr_lp_config_a/b.py.
Run from site root: python3 scripts/build-dscr-personas.py
Also injects the situation-explorer section into dscr.html (between markers)."""
import io, os, re, json, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dscr_lp_config_a import PAGES_A
from dscr_lp_config_b import PAGES_B

PAGES = PAGES_A + PAGES_B
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DISCLOSURE = ("Business-purpose investment financing. Stonehaven Lending is a mortgage brokerage. "
              "Subject to lender underwriting, documentation, valuation and program availability. "
              "Preliminary review is not approval or a commitment. NMLS #1752355.")

PROCESS = [
    ("Send the scenario", "Property numbers, rough credit picture, cash position and timing. Estimates are fine to start; no SSN is collected at this stage."),
    ("Compare the paths", "A licensed specialist reviews the scenario and compares the financing structures that actually fit it, including when a different product or waiting is the better answer."),
    ("Underwriting decides", "If you proceed, a lender underwrites the full file. A preliminary review is analysis, not approval, and no closing timeline is promised here."),
]

def footer_html():
    t = io.open(os.path.join(ROOT, 'residential.html'), encoding='utf-8').read()
    f = re.search(r'<footer>.*?</footer>', t, re.S).group(0)
    return f.replace('src="assets/', 'src="../assets/')

FOOTER = footer_html()

def head(p):
    robots = '<meta name="robots" content="noindex,follow"/>\n' if not p['index'] else ''
    url = 'https://stonehavencre.com/dscr/%s' % p['slug']
    ld1 = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://stonehavencre.com/"},
        {"@type": "ListItem", "position": 2, "name": "DSCR", "item": "https://stonehavencre.com/dscr"},
        {"@type": "ListItem", "position": 3, "name": p['label'], "item": url}]}
    ld2 = {"@context": "https://schema.org", "@type": "WebPage", "name": p['title'].replace('&amp;', '&'),
           "url": url, "inLanguage": "en", "isPartOf": {"@type": "WebSite", "name": "Stonehaven Lending", "url": "https://stonehavencre.com/"},
           "about": {"@type": "Thing", "name": "DSCR rental property financing"}}
    ld3 = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in p['faqs']]}
    lds = ''.join('<script type="application/ld+json">%s</script>\n' % json.dumps(x, ensure_ascii=False) for x in (ld1, ld2, ld3))
    return '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>%(title)s</title>
<meta name="description" content="%(desc)s"/>
%(robots)s<link rel="canonical" href="%(url)s"/>
<meta property="og:type" content="website"/><meta property="og:site_name" content="Stonehaven Lending"/>
<meta property="og:title" content="%(title)s"/><meta property="og:description" content="%(desc)s"/>
<meta property="og:url" content="%(url)s"/>
<meta property="og:image" content="https://stonehavencre.com/assets/og-logo.png"/>
<link rel="icon" type="image/png" href="../assets/favicon.png"/><link rel="apple-touch-icon" href="../assets/apple-touch-icon.png"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="../styles.css"/><link rel="stylesheet" href="../funnel.css"/>
<noscript><style>.reveal{opacity:1 !important;transform:none !important;}</style></noscript>
<script src="../js/site-config.js?v=6" defer></script>
<script src="../js/funnel.js?v=10" defer></script>
%(lds)s</head>
''' % dict(title=p['title'], desc=p['desc'], robots=robots, url=url, lds=lds)

def nav():
    return '''<body><noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=4039555362846500&ev=PageView&noscript=1" alt=""/></noscript><header class="nav" id="nav">
  <div class="wrap nav-inner">
    <a href="/" class="brand" aria-label="Stonehaven Lending home">
      <img src="../assets/mark.png" width="76" height="76" alt="Stonehaven Lending"/>
      <span class="bt"><span class="b1">Stonehaven</span><span class="b2">Lending</span></span>
    </a>
    <nav class="links" id="links" aria-label="Primary">
      <a href="/commercial" class="line">Commercial</a>
      <a href="/sba" class="line">SBA</a>
      <a href="/dscr" class="line active">DSCR</a>
      <a href="/residential" class="line">Residential</a>
      <a href="/management" class="line">About Us</a>
      <a href="/contact" class="line">Contact</a>
      <a href="tel:+14709704979" class="nav-phone">(470) 970-4979</a>
    </nav>
    <a href="tel:+14709704979" class="nav-call" aria-label="Call (470) 970-4979">Call</a>
    <button class="menu-toggle" id="toggle" aria-label="Open menu"><span></span><span></span><span></span></button>
  </div>
</header>
'''

def module_html(m):
    h = '<section><div class="wrap"><div class="prose reveal"><span class="eyebrow">The Working Tool</span><h2>%s</h2><p>%s</p>' % (m['h'], m['intro'])
    if m['type'] in ('checklist', 'timeline'):
        h += '<div class="app-rows" style="margin-top:18px;">'
        for i, (t, d) in enumerate(m['items']):
            h += '<div class="app-row"><span class="rn">%d</span><div><h3>%s</h3><p>%s</p></div></div>' % (i + 1, t, d)
        h += '</div>'
    elif m['type'] == 'table':
        c = m['cols']
        h += '<div style="overflow-x:auto;margin-top:16px;"><table style="width:100%;border-collapse:collapse;font-size:14.5px;line-height:1.6;min-width:560px;">'
        h += '<tr>' + ''.join('<td style="padding:10px 12px;border-bottom:2px solid #1A2530;"><b>%s</b></td>' % x for x in c) + '</tr>'
        for row in m['items']:
            h += '<tr>' + ''.join('<td style="padding:9px 12px;border-bottom:1px solid rgba(20,35,50,.08);%s">%s</td>' % ('color:var(--stone-400);white-space:normal;' if i == 0 else '', cell) for i, cell in enumerate(row)) + '</tr>'
        h += '</table></div>'
    return h + '</div></div></section>\n'

def body(p):
    cta = ('<div style="margin-top:26px;display:flex;flex-direction:column;align-items:center;gap:14px;">'
           '<a class="btn-primary" href="/dscr-review">Review My Deal</a>'
           '<a class="btn-quiet" href="/dscr-analyzer">Calculate My DSCR</a></div>'
           '<p style="font-size:12px;color:var(--stone-400);max-width:560px;margin:16px auto 0;line-height:1.6;">%s</p>' % DISCLOSURE)
    scen = ''.join('<p>%s</p>' % x for x in p['scen'])
    fit = ''.join('<p>%s</p>' % x for x in p['fit'])
    qual = ''.join('<li style="padding:6px 0 6px 24px;position:relative;">'
                   '<span style="position:absolute;left:0;top:14px;width:13px;height:2px;background:#B08230;"></span>%s</li>' % x for x in p['qual'])
    objs = ''.join('<details class="faq-item"><summary class="faq-q">%s</summary><div class="faq-a"><p>%s</p></div></details>' % (q, a) for q, a in p['obj'])
    faqs = ''.join('<details class="faq-item"><summary class="faq-q">%s</summary><div class="faq-a"><p>%s</p></div></details>' % (q, a) for q, a in p['faqs'])
    steps = ''.join('<div class="app-row"><span class="rn">%s</span><div><h3>%s</h3><p>%s</p></div></div>' % (["i", "ii", "iii"][i], h2, t) for i, (h2, t) in enumerate(PROCESS))
    by = {x['slug']: x for x in PAGES}
    rel = ' · '.join('<a href="/dscr/%s" class="line">%s</a>' % (s, by[s]['label']) for s in p['related'] if s in by)
    rel += ' · <a href="/dscr" class="line">DSCR overview</a> · <a href="/dscr-program-calculator" class="line">Program calculator</a>'
    return nav() + '''<main>
<section class="funnel-hero">
  <span class="eyebrow">DSCR · %(label)s</span>
  <h1>%(h1)s</h1>
  <p>%(sub)s</p>
  %(cta)s
</section>

<section class="tight" id="answer" style="padding-bottom:10px;"><div class="wrap"><div class="prose reveal">
  <span class="eyebrow">The Short Answer</span>
  <p style="color:var(--slate-700);font-size:16.5px;line-height:1.8;">%(answer)s</p>
</div></div></section>

<section><div class="wrap"><div class="prose reveal">
  <span class="eyebrow">An Illustrative Scenario</span>
  <h2>%(scen_h)s</h2>
  %(scen)s
</div></div></section>

<section><div class="wrap"><div class="prose reveal">
  <span class="eyebrow">The Comparison</span>
  <h2>%(fit_h)s</h2>
  %(fit)s
</div></div></section>

%(module)s

<section><div class="wrap"><div class="prose reveal">
  <span class="eyebrow">What Can Affect Qualification</span>
  <h2>Beyond the ratio</h2>
  <p>Rental income treatment is one input. These commonly shape eligibility and terms as well:</p>
  <ul style="list-style:none;padding:0;margin:14px 0 0;color:var(--slate-700);font-size:15px;line-height:1.6;">%(qual)s</ul>
</div></div></section>

<section class="faq" style="padding-top:10px;"><div class="wrap">
  <div class="head reveal"><span class="eyebrow">The Honest Objections</span><h2>Asked before anyone proceeds</h2></div>
  <div class="faq-list reveal">%(objs)s</div>
</div></section>

<section class="approach"><div class="wrap">
  <div class="head reveal"><span class="eyebrow">The Actual Process</span><h2>How the preliminary review works</h2></div>
  <div class="app-rows reveal">%(steps)s</div>
</div></section>

<section class="lead" id="review"><div class="wrap"><div class="lead-card reveal" style="text-align:center;">
  <span class="eyebrow">Start Here</span>
  <h2>Put the scenario in front of a specialist</h2>
  <p class="sub">Rough numbers are enough to start. The review compares the paths that actually fit, and says so when a different one wins.</p>
  <div style="margin-top:20px;display:flex;flex-direction:column;align-items:center;gap:14px;"><a class="btn-primary" href="/dscr-review">Review My Deal</a><a class="btn-quiet" href="/dscr-analyzer">Calculate My DSCR</a></div>
  <p style="font-size:12px;color:var(--stone-400);max-width:560px;margin:16px auto 0;line-height:1.6;">%(disc)s</p>
</div></div></section>

<section class="faq"><div class="wrap">
  <div class="head reveal"><span class="eyebrow">Questions</span><h2>Specific to this situation</h2></div>
  <div class="faq-list reveal">%(faqs)s</div>
</div></section>

<section class="tight" style="padding-top:0;"><div class="wrap"><div class="prose reveal">
  <span class="eyebrow">Related</span>
  <p style="font-size:14px;color:var(--stone-400);line-height:2;">%(rel)s</p>
</div></div></section>
</main>
''' % dict(label=p['label'], h1=p['h1'], sub=p['sub'], cta=cta, answer=p['answer'],
           scen_h=p['scen_h'], scen=scen, fit_h=p['fit_h'], fit=fit,
           module=module_html(p['module']), qual=qual, objs=objs, steps=steps,
           disc=DISCLOSURE, faqs=faqs, rel=rel) + FOOTER + '\n</body></html>'

HUB_START = '<!-- DSCR-SITUATIONS:START -->'
HUB_END = '<!-- DSCR-SITUATIONS:END -->'

def hub_section():
    needs = ["bridge-loan-refinance", "brrrr-refinance", "cash-out-refinance", "rate-and-term-refinance", "cash-purchase-refinance", "hold-or-sell"]
    sits = ["experienced-landlords", "first-time-investors", "self-employed-investors", "working-professionals", "out-of-state-investors", "portfolio-growth", "long-term-rentals", "short-term-rentals", "llc-investors", "2-4-unit-properties", "veteran-investors"]
    by = {x['slug']: x for x in PAGES}
    blurb = {
        "bridge-loan-refinance": "Replace maturing bridge or hard-money debt with a rental takeout", "brrrr-refinance": "Plan the refinance stage across the whole BRRRR sequence",
        "cash-out-refinance": "Weigh equity proceeds against what the refinance changes", "rate-and-term-refinance": "Decide whether replacing the current loan earns its costs",
        "cash-purchase-refinance": "Return leverage to a property bought with cash", "hold-or-sell": "Price the hold branch honestly against a sale",
        "experienced-landlords": "Compare financing for the next acquisition, sensitivity first", "first-time-investors": "The definitions, cash needs and rules a first rental brings",
        "self-employed-investors": "Property-based underwriting against personal-income paths", "working-professionals": "Organize the decision around a full-time job",
        "out-of-state-investors": "Local numbers, lender DSCR and owner cash flow, kept straight", "portfolio-growth": "When one-off loans give way to portfolio or commercial structures",
        "long-term-rentals": "Lease evidence, eligible rent and the costs outside the ratio", "short-term-rentals": "Legal use, documented income and program fit for STRs",
        "llc-investors": "Entity vesting, documents and guarantor questions", "2-4-unit-properties": "Rent rolls, unit legality and small multifamily files",
        "veteran-investors": "The accurate VA-versus-investment-financing distinction"}
    def card(s):
        return '<a class="use" href="/dscr/%s" style="text-decoration:none;color:inherit;"><h3 style="font-size:16px;">%s</h3><p>%s.</p></a>' % (s, by[s]['h1'], blurb[s])
    h = HUB_START + '\n<section class="uses" id="situations"><div class="wrap"><div class="head reveal"><span class="eyebrow">Find Your Situation</span><h2>Start where your deal actually is</h2><p style="max-width:640px;margin:10px auto 0;color:var(--slate-600);font-size:15px;">Seventeen focused guides: pick the financing event first, then the situation that shapes it.</p></div>'
    h += '<div style="max-width:960px;margin:26px auto 0;"><p class="eyebrow" style="margin-bottom:10px;">By financing need</p><div class="use-grid reveal">' + ''.join(card(s) for s in needs) + '</div>'
    h += '<p class="eyebrow" style="margin:30px 0 10px;">By investor situation</p><div class="use-grid reveal">' + ''.join(card(s) for s in sits) + '</div></div></div></section>\n' + HUB_END
    return h

def main():
    os.makedirs(os.path.join(ROOT, 'dscr'), exist_ok=True)
    for p in PAGES:
        io.open(os.path.join(ROOT, 'dscr', p['slug'] + '.html'), 'w', encoding='utf-8').write(head(p) + body(p))
        print('built dscr/%s.html %s' % (p['slug'], '' if p['index'] else '(noindex)'))
    t = io.open(os.path.join(ROOT, 'dscr.html'), encoding='utf-8').read()
    if HUB_START in t:
        t = re.sub(re.escape(HUB_START) + '.*?' + re.escape(HUB_END), hub_section(), t, flags=re.S)
    else:
        anchor = '<section class="uses" id="risks">'
        t = t.replace(anchor, hub_section() + '\n' + anchor, 1)
    io.open(os.path.join(ROOT, 'dscr.html'), 'w', encoding='utf-8').write(t)
    print('hub section injected; %d pages' % len(PAGES))

if __name__ == '__main__':
    main()
