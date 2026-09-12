#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate the Family Opportunity landing pages from scripts/family_lp_config.py.
Outputs: buy-a-home-for-parents.html, family-housing-options.html,
request-received.html, js/family-config.js, netlify/functions/family-shared.json"""
import os, sys, json, html, re
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import family_lp_config as C

def esc(s): return html.escape(s, quote=True)
def heading(s): return esc(s.rstrip(".").strip())     # owner rule: no trailing period on headings
def check_no_em(s, where):
    if "—" in s or "–" in s: raise SystemExit("em/en dash found in " + where)

VER = "2"
STATES_JS = [c for c, _ in C.SERVICE_STATES]

def head(title, desc, path, noindex):
    canon = C.SITE_URL + path
    robots = "noindex,nofollow" if noindex else "index,follow"
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}"/>
<meta name="robots" content="{robots}"/>
<link rel="canonical" href="{canon}"/>
<meta property="og:type" content="website"/><meta property="og:site_name" content="{esc(C.BRAND['name'])}"/>
<meta property="og:title" content="{esc(title)}"/><meta property="og:description" content="{esc(desc)}"/>
<meta property="og:url" content="{canon}"/><meta property="og:image" content="{C.SITE_URL}{C.BRAND['og_image']}"/>
<meta name="twitter:card" content="summary"/>
<meta name="theme-color" content="#142332"/>
<link rel="icon" type="image/png" href="/assets/favicon.png"/><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/family.css?v={VER}"/>
<script src="/js/family-config.js?v={VER}" defer></script>
<script src="/js/family-lp.js?v={VER}" defer></script>
</head>"""

def header():
    return f"""<a class="fo-skip" href="#main">Skip to content</a>
<header class="fo-head">
  <div class="fo-wrap">
    <a href="/" class="fo-brand" aria-label="{esc(C.BRAND['name'])} home">
      <img src="{C.BRAND['mark']}" width="44" height="44" alt=""/>
      <span><span class="b1">Stonehaven</span><span class="b2">Lending</span></span>
    </a>
    <a class="fo-tel" href="tel:{C.CONTACT['phone_e164']}" aria-label="Call {esc(C.CONTACT['phone_display'])}">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
      <span>{esc(C.CONTACT['phone_display'])}</span>
    </a>
  </div>
</header>"""

def footer():
    eho = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" role="img" aria-label="Equal Housing Opportunity logo"><path d="M12 3 2 10h3v11h14V10h3L12 3z" stroke="currentColor" stroke-width="1.6"/><path d="M8 13.5h8M8 17h8" stroke="currentColor" stroke-width="1.6"/></svg>'
    return f"""<footer class="fo-foot">
  <div class="fo-wrap">
    <div class="row">
      <span>{esc(C.BRAND['name'])}</span>
      <a href="tel:{C.CONTACT['phone_e164']}">{esc(C.CONTACT['phone_display'])}</a>
      <a href="mailto:{C.CONTACT['email']}">{C.CONTACT['email']}</a>
      <span>{esc(C.CONTACT['address'])}</span>
    </div>
    <div class="row">
      <span class="eho">{eho} Equal Housing Opportunity</span>
      <span>NMLS #{C.BRAND['nmls_id']}</span>
      <a href="{C.BRAND['nmls_consumer_access']}" rel="noopener">NMLS Consumer Access</a>
      <a href="{C.PRIVACY_URL}">Privacy Policy</a>
    </div>
    <p>{esc(C.LICENSING_LINE)}</p>
    <p>{esc(C.FOOTER_DISCLOSURE)}</p>
  </div>
</footer>"""

def form_card(p):
    opts = "".join(f'<option value="{c}">{esc(n)}</option>' for c, n in C.SERVICE_STATES)
    pills = "".join(f'<label><input type="radio" name="timing" value="{v}"/><span>{esc(l)}</span></label>' for v, l in C.FORM["timing_options"])
    cph, cphl = C.CREDIT_PLACEHOLDER
    credit_opts = f'<option value="{cph}" selected>{esc(cphl)}</option>' + "".join(
        f'<option value="{b}">{esc(b)}</option>' for b in C.CREDIT_BANDS)
    extra = ""
    if p.get("extra_select"):
        x = p["extra_select"]
        xopts = "".join(f'<option value="{v}">{esc(l)}</option>' for v, l in x["options"])
        extra = (f'<div class="fo-field"><label for="f-extra">{esc(x["label"])} <span class="opt">(optional)</span></label>'
                 f'<select id="f-extra" name="{x["name"]}">{xopts}</select></div>')
    return f"""<section class="fo-card" id="inquiry" aria-labelledby="inq-h">
  <h2 id="inq-h">{heading(C.FORM['heading'])}</h2>
  <p class="intro">{esc(C.FORM['intro'])}</p>
  <form id="inquiry-form" novalidate autocomplete="on" method="post" action="{C.FORM['endpoint']}">
    <div class="fo-field"><label for="f-name">Full name</label><input id="f-name" name="name" type="text" autocomplete="name" required maxlength="120" aria-describedby="e-name"/><p class="fo-err" id="e-name"></p></div>
    <div class="fo-field"><label for="f-phone">Phone number</label><input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required aria-describedby="e-phone" placeholder="(000) 000-0000"/><p class="fo-err" id="e-phone"></p></div>
    <div class="fo-field"><label for="f-state">Property state</label><select id="f-state" name="state" required aria-describedby="e-state"><option value="">Choose a state</option>{opts}</select><p class="fo-err" id="e-state"></p></div>
    <div class="fo-field"><label for="f-email">Email <span class="opt">(optional)</span></label><input id="f-email" name="email" type="email" inputmode="email" autocomplete="email" maxlength="254" aria-describedby="e-email"/><p class="fo-err" id="e-email"></p></div>
    <div class="fo-field"><label for="f-price">{esc(C.FORM['price_label'])} <span class="opt">(optional)</span></label><input id="f-price" name="price" type="text" inputmode="numeric" autocomplete="off" maxlength="12" aria-describedby="h-price e-price"/><p class="fo-hint" id="h-price">{esc(C.FORM['price_hint'])}</p><p class="fo-err" id="e-price"></p></div>
    <div class="fo-field"><label for="f-credit">{esc(C.FORM['credit_label'])} <span class="opt">(optional)</span></label><select id="f-credit" name="credit" aria-describedby="h-credit">{credit_opts}</select><p class="fo-hint" id="h-credit">{esc(C.FORM['credit_hint'])}</p></div>
    {extra}
    <fieldset class="fo-field" style="border:0;padding:0;margin:0 0 18px;"><legend>{esc(C.FORM['timing_label'])}</legend><div class="fo-pills">{pills}</div></fieldset>
    <div class="fo-hp" aria-hidden="true"><label for="f-website">Leave this field empty</label><input id="f-website" name="company_website" type="text" tabindex="-1" autocomplete="off"/></div>
    <button type="submit" class="fo-btn wide">{esc(C.FORM['button'])}</button>
    <div class="fo-alert" role="alert" tabindex="-1"></div>
    <p class="fo-notice">{esc(C.CONSENT_NOTICE)} See our <a href="{C.PRIVACY_URL}">Privacy Policy</a>.</p>
  </form>
</section>"""

def person():
    av = f'<img src="{C.CONTACT["headshot"]}" alt="{esc(C.CONTACT["person"])}" width="64" height="64" loading="lazy"/>' if C.CONTACT["headshot"] else '<span aria-hidden="true">C</span>'
    return f"""<section class="fo-sec" aria-labelledby="person-h">
  <div class="fo-wrap">
    <span class="fo-eyebrow">Who you will speak with</span>
    <h2 id="person-h">{heading(C.SHARED['person_h'])}</h2>
    <div class="fo-person" style="margin-top:22px;">
      <div class="avatar">{av}</div>
      <div>
        <h3>{esc(C.CONTACT['person'])}</h3>
        <p class="role">{esc(C.CONTACT['title'])}</p>
        <p>{esc(C.SHARED['person_p'])}</p>
        <div class="lines">
          <a href="tel:{C.CONTACT['phone_e164']}">{esc(C.CONTACT['phone_display'])}</a>
          <a href="mailto:{C.CONTACT['email']}">{C.CONTACT['email']}</a>
          <span>{esc(C.CONTACT['address'])}</span>
        </div>
      </div>
    </div>
  </div>
</section>"""

def faq_jsonld(p, path):
    d = {"@context": "https://schema.org", "@graph": [
        {"@type": "WebPage", "@id": C.SITE_URL + path, "url": C.SITE_URL + path, "name": p["title"], "description": p["description"],
         "isPartOf": {"@type": "WebSite", "name": C.BRAND["name"], "url": C.SITE_URL + "/"},
         "about": {"@type": "Thing", "name": "Family Opportunity Mortgage"}},
        {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in p["faqs"]]},
        {"@type": "MortgageBroker", "name": C.BRAND["name"], "telephone": C.CONTACT["phone_e164"], "email": C.CONTACT["email"],
         "address": {"@type": "PostalAddress", "streetAddress": "10 Roswell Street, Suite 102", "addressLocality": "Alpharetta", "addressRegion": "GA", "postalCode": "30009", "addressCountry": "US"},
         "areaServed": [n for _, n in C.SERVICE_STATES], "url": C.SITE_URL + "/"}]}
    return '<script type="application/ld+json">' + json.dumps(d, ensure_ascii=False) + '</script>'

def page(p):
    path = "/" + p["slug"]
    pts = "".join(f"<li>{esc(x)}</li>" for x in p["points"])
    steps = "".join(f"<li><h3>{heading(h)}</h3><p>{esc(t)}</p></li>" for h, t in p["steps"])
    if isinstance(p["work_items"][0], tuple):
        work = '<ul class="fo-work cols">' + "".join(f"<li><strong>{heading(h)}</strong><span>{esc(t)}</span></li>" for h, t in p["work_items"]) + "</ul>"
    else:
        work = '<ul class="fo-work">' + "".join(f"<li>{esc(x)}</li>" for x in p["work_items"]) + "</ul>"
    note = f'<p class="fo-note">{esc(p["work_note"])}</p>' if p.get("work_note") else ""
    small = f'<small>{esc(p["explainer_small"])}</small>' if p.get("explainer_small") else ""
    faqs = "".join(f"<details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>" for q, a in p["faqs"])
    photo = ""
    if p.get("photo"):
        photo = f'<figure class="fo-figure"><img src="{p["photo"]}" alt="{esc(p["photo_alt"])}" width="1200" height="800" loading="lazy" decoding="async"/><figcaption>{esc(C.SHARED["illustration_note"])}</figcaption></figure>'
    routes = ""
    if p.get("routes"):
        cards = "".join(
            f'<li><a href="{r[0]}"><strong>{heading(r[1])}</strong><span>{esc(r[2])}</span>'
            f'<em>{esc(r[3])}</em></a></li>'
            for r in p["routes"])
        routes = f"""<section class="fo-sec" aria-labelledby="routes-h">
  <div class="fo-wrap">
    <h2 id="routes-h">{heading(p['routes_h'])}</h2>
    <ul class="fo-routes">{cards}</ul>
  </div>
</section>"""
    sens = "1" if p["sensitive"] else "0"
    body = f"""{head(p["title"], p["description"], path, not C.INDEXABLE)}
<body data-fo-kind="lp" data-fo-page="{p['page_id']}" data-fo-sensitive="{sens}">
{header()}
<main id="main">
<section class="fo-hero">
  <div class="fo-wrap">
    <div>
      <span class="fo-eyebrow">{esc(C.SHARED['eyebrow'])}</span>
      <h1>{esc(p['h1'])}</h1>
      <p class="sub">{esc(p['sub'])}</p>
      <a class="fo-btn" id="hero-cta" href="#inquiry">{esc(C.SHARED['cta'])}</a>
      <p class="micro">{esc(p['micro'])}</p>
      <div class="hero-links"><a class="fo-howlink" href="#how">{esc(C.SHARED['how_link'])}</a></div>
    </div>
    {form_card(p)}
  </div>
</section>
<section class="fo-sec" aria-label="At a glance">
  <div class="fo-wrap"><ul class="fo-points">{pts}</ul></div>
</section>
{routes}
<section class="fo-sec alt" aria-labelledby="story-h">
  <div class="fo-wrap">
    <h2 id="story-h">{heading(p['story_h'])}</h2>
    <p class="lead">{esc(p['story_p'])}</p>
    {photo}
  </div>
</section>
<section class="fo-sec" id="how" aria-labelledby="how-h">
  <div class="fo-wrap">
    <h2 id="how-h">{heading(p['how_h'])}</h2>
    <ol class="fo-steps">{steps}</ol>
    <div class="fo-explain">
      <h3>{heading(p['explainer_h'])}</h3>
      <p>{esc(p['explainer_p'])}</p>
      {small}
      <a href="{C.FANNIE_OCCUPANCY_URL}" rel="noopener nofollow" target="_blank">{esc(p['explainer_link_text'])} (opens the Fannie Mae Selling Guide)</a>
    </div>
  </div>
</section>
<section class="fo-sec alt" aria-labelledby="work-h">
  <div class="fo-wrap">
    <h2 id="work-h">{heading(p['work_h'])}</h2>
    {work}
    {note}
  </div>
</section>
<section class="fo-sec" aria-labelledby="faq-h">
  <div class="fo-wrap">
    <h2 id="faq-h">Questions families ask</h2>
    <div class="fo-faq">{faqs}</div>
  </div>
</section>
{person()}
<section class="fo-sec alt fo-close" aria-labelledby="close-h">
  <div class="fo-wrap">
    <h2 id="close-h">{heading(p['closing_h'])}</h2>
    <p class="lead">{esc(p['closing_p'])}</p>
    <a class="fo-btn" href="#inquiry">{esc(C.SHARED['cta'])}</a>
    <p class="after">{esc(C.SHARED['closing_note'])}</p>
  </div>
</section>
</main>
{footer()}
<div class="fo-sticky" id="fo-sticky"><a class="fo-btn" href="#inquiry">{esc(C.SHARED['cta'])}</a></div>
{faq_jsonld(p, path)}
</body></html>
"""
    # Hero H1 keeps its sentence punctuation by design (two sentences); all other headings drop trailing periods.
    return body

def confirmation():
    c = C.CONFIRMATION
    path = "/" + c["slug"]
    body_txt = c["body"] % C.CONTACT["phone_display"]
    body_html = esc(body_txt).replace(esc(C.CONTACT["phone_display"]), f'<a href="tel:{C.CONTACT["phone_e164"]}">{esc(C.CONTACT["phone_display"])}</a>')
    return f"""{head(c["title"], "Your request to Stonehaven Lending has been received.", path, True)}
<body data-fo-kind="confirm">
{header()}
<main id="main">
<section class="fo-confirm">
  <div class="fo-wrap"><div class="box">
    <span class="ok">Received</span>
    <h1>{esc(c['h1'])}</h1>
    <p>{body_html}</p>
    <div class="ref" id="fo-ref">{esc(c['reference_label'])}: <b></b></div>
    <p id="fo-dry" hidden style="font-size:14px;color:#9a3b34;">Preview mode: this request was not stored. The live endpoint is not connected in this preview.</p>
    <p style="font-size:14px;">{esc(c['correction'])} <a href="mailto:{C.CONTACT['email']}">{C.CONTACT['email']}</a>.</p>
  </div></div>
</section>
</main>
{footer()}
</body></html>
"""

def write(rel, s):
    check_no_em(s, rel)
    with open(os.path.join(ROOT, rel), "w", encoding="utf-8") as f: f.write(s)
    print("wrote", rel)

for p in C.PAGES: write(p["slug"] + ".html", page(p))
write(C.CONFIRMATION["slug"] + ".html", confirmation())

cfg = {
    "endpoint": C.FORM["endpoint"], "states": STATES_JS, "noticeVersion": C.CONSENT_NOTICE_VERSION,
    "phoneE164": C.CONTACT["phone_e164"], "phoneDisplay": C.CONTACT["phone_display"], "timeoutMs": 15000,
    "tracking": {"ga4Id": C.TRACKING["ga4_id"], "ga4OnSensitivePage": bool(C.TRACKING["ga4_on_sensitive_page"]),
                 "metaPixelId": C.TRACKING["meta_pixel_id"], "capi": bool(C.TRACKING["capi"])}
}
write("js/family-config.js", "/* GENERATED by scripts/build-family-lps.py from scripts/family_lp_config.py. Edit the Python config, not this file. */\nwindow.SH_FAMILY = " + json.dumps(cfg, indent=2) + ";\n")
shared = {"siteUrl": C.SITE_URL, "states": STATES_JS, "noticeVersion": C.CONSENT_NOTICE_VERSION,
          "pages": {p["page_id"]: "Family Opportunity: " + p["label"] for p in C.PAGES},
          "timing": dict(C.FORM["timing_options"]),
          "credit": {"bands": list(C.CREDIT_BANDS), "placeholder": C.CREDIT_PLACEHOLDER[0]},
          "priceMax": C.FORM["price_max"],
          # Per-page extra select. Keyed by page so a value can never be accepted
          # for a page that does not ask the question.
          "extraSelect": {p["page_id"]: {"name": p["extra_select"]["name"],
                                         "label": p["extra_select"]["label"],
                                         "values": [v for v, _ in p["extra_select"]["options"]]}
                          for p in C.PAGES if p.get("extra_select")},
          "attributionAllowlist": ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id"],
          "metaPixelId": C.TRACKING["meta_pixel_id"]}
write("netlify/functions/family-shared.json", json.dumps(shared, indent=2) + "\n")
