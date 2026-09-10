# -*- coding: utf-8 -*-
"""Build the /heloc/<slug> persona pages from heloc_personas_config.py.
Run from site root:  python3 scripts/build-heloc-personas.py
Idempotent: regenerates heloc/<slug>.html for every persona."""
import io, os, re, json, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from credit_bands import options as _credit_options
CREDIT_OPTIONS = _credit_options('en')
from heloc_personas_config import PERSONAS, BASE_FAQS, PROCESS, REVIEW_NOTE

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAVY, BRASS, LINE, PAPER, SLATE = "#142332", "#B08230", "#E2DFD8", "#F8F7F4", "#5b6876"

# ---------------- SVG scene library (brand-palette illustrations) ----------------
def _wrap(inner, label):
    return ('<svg viewBox="0 0 320 190" role="img" aria-label="%s" '
            'style="width:100%%;height:auto;display:block;background:%s;border:1px solid %s;border-radius:12px;">%s</svg>' % (label, PAPER, LINE, inner))

def _house(x, y, s=1.0, fill=NAVY):
    return ('<g transform="translate(%d,%d) scale(%.2f)"><path d="M0 34 30 10l30 24" fill="none" stroke="%s" stroke-width="3"/>'
            '<rect x="6" y="34" width="48" height="34" fill="none" stroke="%s" stroke-width="3"/>'
            '<rect x="24" y="48" width="12" height="20" fill="%s"/></g>' % (x, y, s, fill, fill, BRASS))

def _board(x, y, w, h, rows=3):
    r = ''.join('<rect x="%d" y="%d" width="%d" height="4" rx="2" fill="%s"/>' % (x+10, y+14+i*12, w-20-(i*14), LINE) for i in range(rows))
    return '<rect x="%d" y="%d" width="%d" height="%d" rx="6" fill="#fff" stroke="%s" stroke-width="2"/>%s' % (x, y, w, h, NAVY, r)

def _cal(x, y, w=88, h=64):
    cells = ''.join('<rect x="%d" y="%d" width="14" height="10" rx="2" fill="%s" opacity="%s"/>' %
                    (x+8+(i % 5)*16, y+18+(i // 5)*14, LINE, '1' if i % 3 else '.45') for i in range(15))
    dot = '<circle cx="%d" cy="%d" r="4" fill="%s"/>' % (x+8+2*16+7, y+18+14+5, BRASS)
    return ('<rect x="%d" y="%d" width="%d" height="%d" rx="6" fill="#fff" stroke="%s" stroke-width="2"/>'
            '<rect x="%d" y="%d" width="%d" height="10" rx="4" fill="%s"/>%s%s' % (x, y, w, h, NAVY, x, y, w, NAVY, cells, dot))

def _swatch(x, y):
    return ''.join('<rect x="%d" y="%d" width="16" height="16" rx="3" fill="%s"/>' % (x+i*20, y, c)
                   for i, c in enumerate([BRASS, NAVY, LINE, '#C9BFA8']))

SCENES = {
 "home_plans": lambda: _wrap(_house(28, 66, 1.5) + _board(150, 40, 130, 110, 5) + _swatch(160, 160), "Home with project plans"),
 "home_flagless": lambda: _wrap(_house(40, 50, 1.7) + '<path d="M30 160h240" stroke="%s" stroke-width="3"/>' % LINE + _board(190, 58, 96, 84, 4), "Everyday home and a plan"),
 "calendar_kitchen": lambda: _wrap(_cal(24, 36) + _board(140, 30, 150, 96, 4) + _swatch(150, 146) + '<rect x="24" y="120" width="88" height="34" rx="6" fill="#fff" stroke="%s" stroke-width="2"/><rect x="32" y="130" width="60" height="5" rx="2" fill="%s"/><rect x="32" y="141" width="40" height="5" rx="2" fill="%s"/>' % (NAVY, LINE, LINE), "Work calendar beside renovation samples"),
 "room_convert": lambda: _wrap('<rect x="26" y="40" width="120" height="110" rx="6" fill="#fff" stroke="%s" stroke-width="2" opacity=".55"/><rect x="44" y="66" width="42" height="30" rx="3" fill="%s" opacity=".5"/>' % (NAVY, LINE) + '<path d="M156 95h26" stroke="%s" stroke-width="3" marker-end="none"/><path d="M176 87l10 8-10 8" fill="none" stroke="%s" stroke-width="3"/>' % (BRASS, BRASS) + '<rect x="192" y="40" width="102" height="110" rx="6" fill="#fff" stroke="%s" stroke-width="2"/><rect x="204" y="58" width="52" height="8" rx="3" fill="%s"/><rect x="204" y="76" width="78" height="26" rx="3" fill="%s"/><rect x="204" y="112" width="34" height="26" rx="3" fill="%s"/>' % (NAVY, BRASS, LINE, LINE), "A spare room becoming a new space"),
 "exterior_interior": lambda: _wrap(_house(30, 44, 1.9) + _board(180, 46, 112, 96, 4) + _swatch(186, 152), "Established exterior and a practical interior update"),
 "comfortable_home": lambda: _wrap(_house(120, 44, 1.8) + '<path d="M40 162h240" stroke="%s" stroke-width="3"/>' % LINE + '<circle cx="60" cy="120" r="16" fill="none" stroke="%s" stroke-width="3"/><path d="M60 112v8l6 4" stroke="%s" stroke-width="3" fill="none"/>' % (NAVY, BRASS), "A comfortable home planned for the years ahead"),
 "floorplan": lambda: _wrap('<rect x="40" y="30" width="240" height="130" rx="6" fill="#fff" stroke="%s" stroke-width="2"/><path d="M150 30v130M150 95h130M40 95h60" stroke="%s" stroke-width="2"/><rect x="60" y="50" width="34" height="22" rx="3" fill="%s"/><rect x="180" y="46" width="34" height="22" rx="3" fill="%s"/><rect x="180" y="114" width="34" height="22" rx="3" fill="%s" opacity=".6"/><circle cx="120" cy="120" r="7" fill="%s"/>' % (NAVY, NAVY, LINE, LINE, LINE, BRASS), "Flexible floor plan with shared and private space"),
 "household_calendar": lambda: _wrap(_cal(28, 34, 120, 88) + _board(176, 40, 116, 100, 5), "Household calendar with flexible space plans"),
 "office": lambda: _wrap('<rect x="30" y="110" width="120" height="8" rx="3" fill="%s"/><rect x="52" y="70" width="60" height="38" rx="4" fill="#fff" stroke="%s" stroke-width="2"/><rect x="60" y="80" width="30" height="5" rx="2" fill="%s"/>' % (NAVY, NAVY, LINE) + '<path d="M166 95h26" stroke="%s" stroke-width="3"/><path d="M186 87l10 8-10 8" fill="none" stroke="%s" stroke-width="3"/>' % (BRASS, BRASS) + '<rect x="204" y="46" width="90" height="104" rx="6" fill="#fff" stroke="%s" stroke-width="2"/><rect x="214" y="60" width="70" height="34" rx="3" fill="%s"/><rect x="214" y="104" width="44" height="8" rx="3" fill="%s"/><rect x="214" y="120" width="58" height="8" rx="3" fill="%s"/>' % (NAVY, LINE, BRASS, LINE), "A dining-table workspace becoming a dedicated office"),
 "shift_calendar": lambda: _wrap(_cal(36, 46, 110, 96) + _house(200, 66, 1.3) + '<circle cx="256" cy="56" r="14" fill="none" stroke="%s" stroke-width="3"/><path d="M256 48v8l5 4" stroke="%s" stroke-width="3" fill="none"/>' % (NAVY, BRASS), "A calm home beside a realistic work calendar"),
 "project_board": lambda: _wrap(_board(30, 36, 128, 108, 5) + _cal(176, 52, 110, 78), "A home project board beside an ordinary calendar"),
 "quotes": lambda: _wrap(''.join('<g transform="translate(%d,%d) rotate(%d)"><rect width="96" height="120" rx="5" fill="#fff" stroke="%s" stroke-width="2"/><rect x="10" y="14" width="56" height="6" rx="2" fill="%s"/><rect x="10" y="30" width="76" height="4" rx="2" fill="%s"/><rect x="10" y="40" width="64" height="4" rx="2" fill="%s"/><rect x="10" y="96" width="40" height="8" rx="2" fill="%s"/></g>' % (x, y, r, NAVY, NAVY, LINE, LINE, BRASS) for x, y, r in [(36, 40, -4), (120, 34, 0), (204, 42, 4)]) + _swatch(120, 166), "Contractor estimates and material samples"),
 "unfinished": lambda: _wrap('<rect x="26" y="36" width="150" height="118" rx="6" fill="#fff" stroke="%s" stroke-width="2"/><path d="M26 90h150" stroke="%s" stroke-width="2" stroke-dasharray="6 5"/><rect x="42" y="104" width="40" height="34" rx="3" fill="%s" opacity=".55"/><path d="M100 118l16 16m0-16l-16 16" stroke="%s" stroke-width="3"/>' % (NAVY, LINE, LINE, BRASS) + _board(196, 44, 96, 102, 5), "An unfinished room beside a professional plan"),
 "inspiration": lambda: _wrap(''.join('<rect x="%d" y="%d" width="52" height="40" rx="4" fill="#fff" stroke="%s" stroke-width="2"/>' % (x, y, NAVY) for x, y in [(30, 38), (90, 38), (30, 88), (90, 88)]) + '<rect x="40" y="50" width="32" height="5" rx="2" fill="%s"/><rect x="100" y="50" width="32" height="16" rx="2" fill="%s"/><rect x="40" y="100" width="32" height="16" rx="2" fill="%s" opacity=".6"/><rect x="100" y="100" width="32" height="5" rx="2" fill="%s"/>' % (BRASS, LINE, LINE, LINE) + _board(170, 44, 120, 100, 5), "Saved inspiration becoming a real plan"),
 "workspace": lambda: _wrap('<rect x="28" y="104" width="130" height="8" rx="3" fill="%s"/><rect x="48" y="64" width="66" height="38" rx="4" fill="#fff" stroke="%s" stroke-width="2"/><rect x="56" y="74" width="34" height="5" rx="2" fill="%s"/><rect x="56" y="86" width="24" height="5" rx="2" fill="%s"/>' % (NAVY, NAVY, BRASS, LINE) + _board(186, 44, 106, 102, 5), "A home workspace beside personal renovation plans"),
 "boxes": lambda: _wrap(''.join('<g transform="translate(%d,%d)"><rect width="56" height="44" rx="4" fill="#fff" stroke="%s" stroke-width="2"/><path d="M0 14h56M28 0v14" stroke="%s" stroke-width="2"/></g>' % (x, y, NAVY, LINE) for x, y in [(34, 104), (72, 66), (110, 104)]) + _board(196, 40, 96, 106, 5) + _swatch(200, 154), "Moving boxes and a kitchen project board"),
}

CONSOLIDATION_SCENE = _wrap(
    '<text x="36" y="46" font-family="Inter,sans-serif" font-size="12" fill="%s">Several card balances</text>' % SLATE
    + ''.join('<rect x="%d" y="56" width="54" height="34" rx="5" fill="#fff" stroke="%s" stroke-width="2"/><rect x="%d" y="64" width="34" height="5" rx="2" fill="%s"/><rect x="%d" y="76" width="22" height="5" rx="2" fill="%s"/>' % (x, NAVY, x+8, LINE, x+8, LINE) for x in [36, 100, 164])
    + '<path d="M160 108v18" stroke="%s" stroke-width="3"/><path d="M152 118l8 10 8-10" fill="none" stroke="%s" stroke-width="3"/>' % (BRASS, BRASS)
    + '<text x="36" y="150" font-family="Inter,sans-serif" font-size="12" fill="%s">One home-secured plan to compare</text>' % SLATE
    + '<rect x="36" y="158" width="182" height="22" rx="5" fill="%s"/><rect x="228" y="158" width="56" height="22" rx="5" fill="#fff" stroke="%s" stroke-width="2"/>' % (NAVY, NAVY),
    "Several card balances compared with one home-secured plan")

DIAGRAM = ('<svg viewBox="0 0 340 224" role="img" aria-label="Diagram: the existing first mortgage and a separate HELOC are both secured by the same home" '
    'style="width:100%%;height:auto;display:block;background:%s;border:1px solid %s;border-radius:12px;">' % (PAPER, LINE)
    + _house(140, 26, 1.0)
    + '<path d="M100 118V102h68M240 118V102h-68" stroke="#C9C3B6" stroke-width="2" fill="none"/>'
    + '<rect x="18" y="118" width="152" height="58" rx="8" fill="%s"/>' % NAVY
    + '<text x="94" y="142" text-anchor="middle" font-family="Inter,-apple-system,sans-serif" font-size="11.5" font-weight="600" fill="#fff">Existing first mortgage</text>'
    + '<text x="94" y="160" text-anchor="middle" font-family="Inter,-apple-system,sans-serif" font-size="10" fill="#C9D2DC">stays in place, unchanged</text>'
    + '<rect x="182" y="118" width="140" height="58" rx="8" fill="#fff" stroke="%s" stroke-width="2"/>' % BRASS
    + '<text x="252" y="142" text-anchor="middle" font-family="Inter,-apple-system,sans-serif" font-size="11.5" font-weight="600" fill="%s">Separate HELOC</text>' % NAVY
    + '<text x="252" y="160" text-anchor="middle" font-family="Inter,-apple-system,sans-serif" font-size="10" fill="%s">its own loan and payment</text>' % SLATE
    + '<text x="170" y="204" text-anchor="middle" font-family="Inter,-apple-system,sans-serif" font-size="10" fill="%s">Both are secured by the same home</text>' % SLATE
    + '</svg>')

STATES = [("GA", "Georgia"), ("AL", "Alabama"), ("TN", "Tennessee"), ("FL", "Florida"), ("NC", "North Carolina"), ("SC", "South Carolina"), ("OTHER", "Another state")]

# ---------------- shared blocks ----------------
def footer_html():
    t = io.open(os.path.join(ROOT, 'residential.html'), encoding='utf-8').read()
    f = re.search(r'<footer>.*?</footer>', t, re.S).group(0)
    return f.replace('src="assets/', 'src="../assets/')

FOOTER = None

def head(p, intents_json):
    ren = p['ren']
    return '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>%(title)s</title>
<meta name="description" content="%(desc)s"/>
<meta name="robots" content="noindex,follow"/>
<link rel="canonical" href="https://stonehavencre.com/heloc/%(slug)s"/>
<meta property="og:type" content="website"/><meta property="og:site_name" content="Stonehaven Lending"/>
<meta property="og:title" content="%(title)s"/><meta property="og:description" content="%(desc)s"/>
<meta property="og:url" content="https://stonehavencre.com/heloc/%(slug)s"/>
<meta property="og:image" content="https://stonehavencre.com/assets/og-logo.png"/>
<link rel="icon" type="image/png" href="../assets/favicon.png"/><link rel="apple-touch-icon" href="../assets/apple-touch-icon.png"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="../styles.css"/><link rel="stylesheet" href="../funnel.css"/>
<noscript><style>.reveal{opacity:1 !important;transform:none !important;}</style></noscript>
<script src="../js/site-config.js?v=6" defer></script>
<script src="../js/funnel.js?v=6" defer></script>
<script src="../js/heloc-persona.js?v=1" defer></script>
<style>
.pp-hero{padding:150px 0 44px;}
.pp-hero .wrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,420px);gap:44px;align-items:center;max-width:1060px;}
.pp-switch{display:inline-flex;border:1px solid %(line)s;border-radius:999px;padding:3px;background:#fff;margin-bottom:20px;}
.pp-switch button{font:inherit;font-size:13px;padding:8px 16px;border:0;background:none;border-radius:999px;cursor:pointer;color:%(slate)s;}
.pp-switch button.on{background:%(navy)s;color:#fff;}
.pp-hero h1{font-family:Cormorant,serif;font-weight:500;font-size:clamp(34px,4.6vw,52px);line-height:1.1;margin:0 0 14px;}
.pp-hero .sub{font-size:16.5px;line-height:1.65;color:var(--slate-600);max-width:520px;}
.pp-cta{display:inline-block;margin-top:22px;}
.pp-note{font-size:12.5px;color:var(--stone-400);margin-top:12px;}
.pp-visual{min-width:0;}
.pi-review{font-size:12px;color:var(--stone-400);margin-top:6px;font-style:italic;}
.pp-bens{list-style:none;padding:0;margin:14px 0 0;}
.pp-bens li{padding:7px 0 7px 26px;position:relative;font-size:15px;line-height:1.55;color:var(--slate-700);}
.pp-bens li::before{content:"";position:absolute;left:0;top:14px;width:14px;height:2px;background:%(brass)s;}
.pp-geo{color:#B0413A;font-size:13.5px;line-height:1.55;margin-top:10px;}
@media(max-width:860px){.pp-hero{padding:130px 0 30px;}.pp-hero .wrap{grid-template-columns:1fr;gap:26px;}}
</style>
<script type="application/json" id="sh-persona-content">%(json)s</script>
</head>
<body><noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=4039555362846500&ev=PageView&noscript=1" alt=""/></noscript>
<header class="nav solid" id="nav">
  <div class="wrap nav-inner">
    <a href="/" class="brand" aria-label="Stonehaven Lending home">
      <img src="../assets/mark.png" width="76" height="76" alt="Stonehaven Lending"/>
      <span class="bt"><span class="b1">Stonehaven</span><span class="b2">Lending</span></span>
    </a>
    <a href="tel:+14709704979" class="nav-phone" style="margin-left:auto;">(470) 970-4979</a>
  </div>
</header>
''' % dict(title=ren['title'], desc=ren['sub'][:158].rsplit(' ', 1)[0].rstrip('.,') + '.', slug=p['slug'],
           json=intents_json, navy=NAVY, brass=BRASS, line=LINE, slate=SLATE)

def body(p):
    scene = SCENES[p['visual']]()
    steps = ''.join('<div class="app-row"><span class="rn">%s</span><div><h3>%s</h3><p>%s</p></div></div>' % (["i", "ii", "iii"][i], h, t) for i, (h, t) in enumerate(PROCESS))
    states = ''.join('<option value="%s">%s</option>' % (a, b) for a, b in STATES)
    return '''<main>
<section class="pp-hero">
  <div class="wrap">
    <div>
      <span class="eyebrow">HELOC · %(label)s</span>
      <div style="margin-top:14px;"><div class="pp-switch" role="group" aria-label="Financing purpose">
        <button type="button" data-intent-btn="renovation">Renovation</button>
        <button type="button" data-intent-btn="consolidation">Card consolidation</button>
      </div></div>
      <h1 data-pi="h1"></h1>
      <p class="sub" data-pi="sub"></p>
      <a class="btn-primary pp-cta" href="#intake" data-cta="hero">Compare my options</a>
      <p class="pp-note">No SSN and no hard credit pull to compare initial options. Home loans in GA, AL, TN, FL, NC and SC.</p>
    </div>
    <div class="pp-visual">
      <div data-pi-visual="renovation">%(scene)s</div>
      <div data-pi-visual="consolidation" hidden>%(con_scene)s</div>
    </div>
  </div>
</section>

<section class="tight" style="padding-top:26px;"><div class="wrap"><div class="prose reveal">
  <span class="eyebrow">The Situation</span>
  <h2 data-pi="sit_h"></h2>
  <p data-pi="sit_p1"></p>
  <p data-pi="sit_p2"></p>
</div></div></section>

<section><div class="wrap"><div class="prose reveal">
  <span class="eyebrow">Why Consider a HELOC</span>
  <h2>The first mortgage stays. The HELOC is separate</h2>
  <p>A home equity line of credit is a second loan secured by your home. Opening one leaves your existing first mortgage and its terms in place. The HELOC has its own payment, its own costs and its own repayment obligations, so your total monthly outgo changes even though the first mortgage does not.</p>
  <div style="max-width:420px;margin:22px 0 6px;">%(diagram)s</div>
  <ul class="pp-bens" data-pi="bens"></ul>
</div></div></section>

<section><div class="wrap"><div class="prose reveal">
  <span class="eyebrow">For This Decision</span>
  <h2 data-pi="dist_h"></h2>
  <p data-pi="dist_p1"></p>
  <p data-pi="dist_p2"></p>
</div></div></section>

<section class="approach"><div class="wrap">
  <div class="head reveal"><span class="eyebrow">How Exploring Works</span><h2>Three steps, no surprises</h2></div>
  <div class="app-rows reveal">%(steps)s</div>
</div></section>

<section class="lead" id="intake"><div class="wrap"><div class="lead-card reveal">
  <span class="eyebrow">Start Here</span>
  <h2>Compare your options</h2>
  <p class="sub" data-pi="intake"></p>
  <form class="lead-form" data-sh-form="heloc-persona" data-sh-product="Residential" data-sh-event="heloc_callback" data-sh-capi data-sh-thanks="/thanks-callback" novalidate method="POST" action="/thanks-callback" data-netlify="true" netlify-honeypot="company_website"><input type="hidden" name="form-name" value="lead"/>
    <input type="text" name="company_website" class="hp-field" tabindex="-1" autocomplete="off" aria-hidden="true"/>
    <div class="lf-field"><label for="pi-state">Property state</label><select id="pi-state" name="state" required><option value="">Choose a state</option>%(states)s</select></div>
    <div class="lf-field"><label for="f-ptype">Property type</label><select id="f-ptype" name="property_type"><option>Single family</option><option>Townhome</option><option>Condo</option><option>2-4 units</option></select></div>
    <div class="lf-field"><label for="f-occ">How is it used?</label><select id="f-occ" name="occupancy"><option>I live there</option><option>Second home</option><option>Rental / investment</option></select></div>
    <div class="lf-field"><label for="pi-purpose">Borrowing purpose</label><select id="pi-purpose" name="purpose"><option>Home improvement</option><option>Debt consolidation</option><option>Other</option></select></div>
    <div class="lf-field"><label for="f-value">Estimated home value ($)</label><input id="f-value" type="number" inputmode="numeric" min="0" name="home_value" placeholder="400,000"/></div>
    <div class="lf-field"><label for="f-balance">Approx. mortgage balance ($)</label><input id="f-balance" type="number" inputmode="numeric" min="0" name="mortgage_balance" placeholder="250,000"/></div>
    <div class="lf-field"><label for="f-amount">Amount you are exploring ($)</label><input id="f-amount" type="number" inputmode="numeric" min="0" name="requested_amount" placeholder="60,000"/></div>
    <div class="lf-field"><label for="f-credit">Estimated credit score <span style="text-transform:none;letter-spacing:0;color:#AAB8C7;">(best guess is fine)</span></label><select id="f-credit" name="credit_band">%(credit_opts)s</select></div>
    <div class="lf-field"><label for="f-timing">Timing</label><select id="f-timing" name="timeline"><option>As soon as practical</option><option>1-3 months</option><option>3-6 months</option><option>Exploring</option></select></div>
    <div class="lf-field"><label for="f-name">Name</label><input id="f-name" type="text" name="name" autocomplete="name" required/></div>
    <div class="lf-field"><label for="f-phone">Mobile number</label><input id="f-phone" type="tel" name="phone" inputmode="tel" autocomplete="tel" required/></div>
    <div class="lf-field full"><label for="f-email">Email</label><input id="f-email" type="email" name="email" autocomplete="email" required/></div>
    <p class="pp-geo" id="pi-geo" hidden>Thank you for your interest. Stonehaven does not currently arrange home loans in that state; we serve GA, AL, TN, FL, NC and SC.</p>
    <div class="lead-actions">
      <span class="note">We treat every inquiry in confidence. No hard credit pull at this stage. By submitting, you agree Stonehaven may contact you about your inquiry by phone, email or text. Consent is not a condition of service.</span>
      <button type="submit" class="lead-submit">Compare my options</button>
    </div>
  </form>
  <div class="lead-success" id="leadSuccess"><div class="ok">Thank you, received.</div><p>A licensed specialist will call you back, usually within one business day.</p></div>
</div></div></section>

<section class="faq"><div class="wrap">
  <div class="head reveal"><span class="eyebrow">Questions</span><h2>Asked before starting</h2></div>
  <div class="faq-list reveal" id="pi-faqs"></div>
</div></section>

<section class="lead"><div class="wrap"><div class="lead-card reveal" style="text-align:center;">
  <span class="eyebrow">When You Are Ready</span>
  <h2>One comparison, one callback</h2>
  <p class="sub">Start above, or call <a href="tel:+14709704979">(470) 970-4979</a>. A licensed specialist handles it personally.</p>
  <div style="margin-top:20px;"><a class="btn-primary" href="#intake" data-cta="final">Compare my options</a></div>
</div></div></section>
</main>
%(footer)s
</body></html>''' % dict(credit_opts=CREDIT_OPTIONS, label=p['label'], scene=scene, con_scene=CONSOLIDATION_SCENE, diagram=DIAGRAM, steps=steps, states=states, footer=FOOTER)

def build_intents(p):
    out = {"persona": p['slug'], "reviewNote": REVIEW_NOTE, "intents": {}}
    for intent, key in [("renovation", "ren"), ("consolidation", "con")]:
        c = p[key]
        out["intents"][intent] = {
            "docTitle": c['title'].replace('&amp;', '&'),
            "h1": c['h1'].rstrip('.'), "sub": c['sub'],
            "sit_h": c['sit_h'].rstrip('.'), "sit_p1": c['sit_p1'], "sit_p2": c['sit_p2'],
            "dist_h": c['dist_h'].rstrip('.'), "dist_p1": c['dist_p1'], "dist_p2": c['dist_p2'],
            "bens": ''.join('<li>%s</li>' % b for b in c['bens']),
            "intake": c['intake'], "purpose": c['purpose'],
            "faqs": c['faqs'] + BASE_FAQS[intent],
        }
    return json.dumps(out, ensure_ascii=False).replace('</', '<\\/')

def main():
    global FOOTER
    FOOTER = footer_html()
    os.makedirs(os.path.join(ROOT, 'heloc'), exist_ok=True)
    for p in PERSONAS:
        html = head(p, build_intents(p)) + body(p)
        path = os.path.join(ROOT, 'heloc', p['slug'] + '.html')
        io.open(path, 'w', encoding='utf-8').write(html)
        print('built heloc/%s.html' % p['slug'])
    print('done: %d pages' % len(PERSONAS))

if __name__ == '__main__':
    main()
