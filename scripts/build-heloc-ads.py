# -*- coding: utf-8 -*-
"""Build the ad-matched HELOC landing pages (/heloc/<slug>) from heloc_ads_config.py.
Reuses the persona shell: minimal header, persona runtime (tracking, geo gate,
hidden marketing context), intake with credit band, licensed footer.
Run from site root: python3 scripts/build-heloc-ads.py"""
import io, os, re, json, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from credit_bands import options as _credit_options
CREDIT_OPTIONS = _credit_options('en')
from heloc_ads_config import ADS, DISCLOSURE
import importlib
P = importlib.import_module('build-heloc-personas')  # footer, diagram, scene, states, palette

ROOT = P.ROOT
NAVY, BRASS, LINE, PAPER, SLATE = P.NAVY, P.BRASS, P.LINE, P.PAPER, P.SLATE

CSS = '''<style>
.pp-hero{padding:150px 0 40px;}
.pp-hero .wrap{max-width:760px;text-align:center;}
.pp-hero h1{font-family:Cormorant,serif;font-weight:500;font-size:clamp(34px,4.8vw,54px);line-height:1.1;margin:14px 0 14px;}
.pp-hero .sub{font-size:16.5px;line-height:1.65;color:var(--slate-600);max-width:620px;margin:0 auto;}
.pp-note{font-size:12.5px;color:var(--stone-400);margin-top:12px;}
.ad-mod{max-width:760px;margin:0 auto;}
.ad-checks{list-style:none;padding:0;margin:14px 0 0;}
.ad-checks li{display:flex;gap:12px;padding:9px 0;font-size:15.5px;line-height:1.55;color:var(--slate-700);}
.ad-checks li::before{content:"";flex:0 0 22px;height:22px;border-radius:50%;background:%(navy)s;-webkit-mask:url("data:image/svg+xml,%%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%%3E%%3Cpath fill='none' stroke='white' stroke-width='3' d='M5 13l4 4L19 7'/%%3E%%3C/svg%%3E") center/16px no-repeat;mask:url("data:image/svg+xml,%%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%%3E%%3Cpath fill='none' stroke='white' stroke-width='3' d='M5 13l4 4L19 7'/%%3E%%3C/svg%%3E") center/16px no-repeat;margin-top:1px;}
.ad-ladder{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:16px 0 6px;}
.ad-ladder button{font:inherit;font-family:Cormorant,serif;font-size:26px;font-weight:500;padding:18px 10px;border:2px solid %(line)s;border-radius:12px;background:#fff;color:%(navy)s;cursor:pointer;}
.ad-ladder button.on{border-color:%(navy)s;background:#f7f6f2;}
.ad-ladder small{display:block;font-family:Inter,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:%(brass)s;margin-top:6px;}
.est-box{background:#fff;border:1px solid rgba(20,35,50,.08);padding:26px 24px;margin-top:16px;}
.est-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.est-grid label span{display:block;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--stone-400);margin-bottom:6px;}
.est-grid input{width:100%%;font:inherit;font-size:19px;padding:12px;border:1px solid rgba(20,35,50,.18);}
.est-range{font-family:Cormorant,serif;font-size:clamp(36px,6vw,54px);color:%(navy)s;line-height:1.1;margin-top:18px;}
.est-verdict{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:%(brass)s;margin-top:4px;}
.est-note{font-size:12.5px;color:var(--stone-400);line-height:1.55;margin-top:10px;}
.pp-geo{color:#B0413A;font-size:13.5px;line-height:1.55;margin-top:10px;}
.pi-review{font-size:12px;color:var(--stone-400);margin-top:6px;font-style:italic;}
@media(max-width:600px){.est-grid{grid-template-columns:1fr;}.pp-hero{padding:130px 0 26px;}}
</style>'''.replace('%(navy)s', NAVY).replace('%(brass)s', BRASS).replace('%(line)s', LINE).replace('%%', '%')

def head(a):
    url = 'https://stonehavencre.com/heloc/%s' % a['slug']
    desc = (a['sub'][:157].rsplit(' ', 1)[0].rstrip('.,;') + '.')
    cfg = {"persona": a['slug'], "reviewNote": "", "intents": {
        "renovation": {"purpose": a['purpose'], "docTitle": a['title'].replace('&amp;', '&')},
        "consolidation": {"purpose": a['purpose'], "docTitle": a['title'].replace('&amp;', '&')}}}
    ld = [{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
            {"@type":"ListItem","position":1,"name":"Home","item":"https://stonehavencre.com/"},
            {"@type":"ListItem","position":2,"name":"HELOC","item":"https://stonehavencre.com/heloc"},
            {"@type":"ListItem","position":3,"name":a['h1'],"item":url}]},
          {"@context":"https://schema.org","@type":"WebPage","name":a['title'].replace('&amp;','&'),"url":url,"inLanguage":"en",
           "isPartOf":{"@type":"WebSite","name":"Stonehaven Lending","url":"https://stonehavencre.com/"},
           "about":{"@type":"Thing","name":"Home equity line of credit"}},
          {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":ans}} for q,ans in a['faqs']]}]
    lds = ''.join('<script type="application/ld+json">%s</script>\n' % json.dumps(x, ensure_ascii=False) for x in ld)
    return '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>%(title)s</title>
<meta name="description" content="%(desc)s"/>
<meta name="robots" content="noindex,follow"/>
<link rel="canonical" href="%(url)s"/>
<meta property="og:type" content="website"/><meta property="og:site_name" content="Stonehaven Lending"/>
<meta property="og:title" content="%(title)s"/><meta property="og:description" content="%(desc)s"/>
<meta property="og:url" content="%(url)s"/><meta property="og:image" content="https://stonehavencre.com/assets/og-logo.png"/>
<link rel="icon" type="image/png" href="../assets/favicon.png"/><link rel="apple-touch-icon" href="../assets/apple-touch-icon.png"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="../styles.css"/><link rel="stylesheet" href="../funnel.css"/>
<noscript><style>.reveal{opacity:1 !important;transform:none !important;}</style></noscript>
<script src="../js/site-config.js?v=6" defer></script>
<script src="../js/funnel.js?v=8" defer></script>
<script src="../js/heloc-calc.js?v=2" defer></script>
<script src="../js/heloc-persona.js?v=1" defer></script>
%(css)s
%(lds)s<script type="application/json" id="sh-persona-content">%(cfg)s</script>
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
''' % dict(title=a['title'], desc=desc, url=url, css=CSS, cfg=json.dumps(cfg, ensure_ascii=False).replace('</', '<\\/'), lds=lds)

def module(m):
    t = m['type']
    if t == 'checks':
        return '<section class="tight" style="padding-top:26px;"><div class="wrap"><div class="ad-mod reveal"><span class="eyebrow">In Plain Terms</span><h2>%s</h2><ul class="ad-checks">%s</ul></div></div></section>' % (m['h'], ''.join('<li>%s</li>' % x for x in m['items']))
    if t == 'timeline':
        rows = ''.join('<div class="app-row"><span class="rn">%d</span><div><h3>%s</h3><p>%s</p></div></div>' % (i + 1, h, d) for i, (h, d) in enumerate(m['items']))
        return '<section class="tight" style="padding-top:26px;"><div class="wrap"><div class="ad-mod reveal"><span class="eyebrow">Step by Step</span><h2>%s</h2><div class="app-rows" style="margin-top:14px;">%s</div></div></div></section>' % (m['h'], rows)
    if t == 'ladder':
        btns = ''.join('<button type="button" data-amt="%d" data-cta="ladder-%d">$%s<small>See estimate</small></button>' % (v, v, format(v, ',')) for v in m['amounts'])
        return '<section class="tight" style="padding-top:26px;"><div class="wrap"><div class="ad-mod reveal"><span class="eyebrow">Estimated Available Amounts</span><h2>%s</h2><div class="ad-ladder" id="ad-ladder">%s</div><p class="pp-note">Picking an amount records what you are exploring; the estimate below shows what your equity may support.</p></div></div></section>' % (m['h'], btns)
    if t == 'estimator':
        return '''<section class="tight" id="estimate" style="padding-top:26px;"><div class="wrap"><div class="ad-mod reveal"><span class="eyebrow">Your Estimate</span><h2>What your equity may support</h2>
<div class="est-box"><div class="est-grid">
<label><span>Home value, roughly ($)</span><input id="e-value" type="number" inputmode="numeric" min="0" step="10000" value="400000"/></label>
<label><span>Mortgage balance, roughly ($)</span><input id="e-balance" type="number" inputmode="numeric" min="0" step="10000" value="250000"/></label></div>
<div class="est-range" id="e-range">-</div><div class="est-verdict" id="e-verdict"></div><p class="est-note" id="e-note">Headroom at common 80 to 90 percent combined loan-to-value caps. A specialist confirms the real number on a callback.</p></div>
</div></div></section>'''
    if t == 'table':
        c = m['cols']
        h = '<div style="overflow-x:auto;margin-top:14px;"><table style="width:100%;border-collapse:collapse;font-size:14.5px;line-height:1.6;min-width:520px;"><tr>' + ''.join('<td style="padding:10px 12px;border-bottom:2px solid #1A2530;"><b>%s</b></td>' % x for x in c) + '</tr>'
        for r in m['rows']:
            h += '<tr>' + ''.join('<td style="padding:9px 12px;border-bottom:1px solid rgba(20,35,50,.08);%s">%s</td>' % ('color:var(--stone-400);' if i == 0 else '', x) for i, x in enumerate(r)) + '</tr>'
        return '<section class="tight" style="padding-top:26px;"><div class="wrap"><div class="ad-mod reveal"><span class="eyebrow">Side by Side</span><h2>%s</h2>%s</table></div></div></div></section>' % (m['h'], h)
    if t == 'diagram':
        return '<section class="tight" style="padding-top:26px;"><div class="wrap"><div class="ad-mod reveal"><span class="eyebrow">How It Fits</span><h2>The first mortgage stays. The HELOC is separate</h2><p>Opening a second-position line leaves your existing first mortgage and its rate in place. The HELOC has its own payment, costs and repayment obligations, so total monthly outgo changes even though the first mortgage does not.</p><div style="max-width:420px;margin:18px 0 0;">%s</div></div></div></section>' % P.DIAGRAM
    if t == 'consolidation':
        return '<section class="tight" style="padding-top:26px;"><div class="wrap"><div class="ad-mod reveal"><span class="eyebrow">One Plan</span><h2>%s</h2><div style="max-width:420px;margin:14px 0;">%s</div><p>%s</p></div></div></section>' % (m['h'], P.CONSOLIDATION_SCENE, m['note'])
    return ''

def body(a):
    mods = ''.join(module(m) for m in a['modules'])
    faqs = ''.join('<details class="faq-item"><summary class="faq-q">%s</summary><div class="faq-a"><p>%s</p></div></details>' % (q, ans) for q, ans in a['faqs'])
    states = ''.join('<option value="%s">%s</option>' % (x, y) for x, y in P.STATES)
    has_ladder = any(m['type'] == 'ladder' for m in a['modules'])
    has_est = any(m['type'] == 'estimator' for m in a['modules'])
    return '''<main id="lp">
<section class="pp-hero"><div class="wrap">
  <span class="eyebrow">%(eyebrow)s</span>
  <h1>%(h1)s</h1>
  <p class="sub">%(sub)s</p>
  <div style="margin-top:22px;"><a class="btn-primary" href="#%(target)s" data-cta="hero">%(cta)s</a></div>
  <p class="pp-note">No SSN and no hard credit pull to compare initial options. Credit scores 600+ considered. Home loans in GA, AL, TN, FL, NC and SC.</p>
</div></section>
%(mods)s
<section class="lead" id="intake"><div class="wrap"><div class="lead-card reveal">
  <span class="eyebrow">Get Your Numbers Confirmed</span>
  <h2>A specialist calls you back</h2>
  <p class="sub">Send the basics and a licensed specialist confirms the real figure, usually within one business day.</p>
  <form class="lead-form" data-sh-form="heloc-ad" data-sh-product="Residential" data-sh-event="heloc_callback" data-sh-capi data-sh-thanks="/thanks-callback" novalidate method="POST" action="/thanks-callback" data-netlify="true" netlify-honeypot="company_website"><input type="hidden" name="form-name" value="lead"/>
    <input type="text" name="company_website" class="hp-field" tabindex="-1" autocomplete="off" aria-hidden="true"/>
    <div class="lf-field"><label for="pi-state">Property state</label><select id="pi-state" name="state" required><option value="">Choose a state</option>%(states)s</select></div>
    <div class="lf-field"><label for="f-occ">How is it used?</label><select id="f-occ" name="occupancy"><option>I live there</option><option>Second home</option><option>Rental / investment</option></select></div>
    <div class="lf-field"><label for="f-value">Estimated home value ($)</label><input id="f-value" type="number" inputmode="numeric" min="0" name="home_value" placeholder="400,000"/></div>
    <div class="lf-field"><label for="f-balance">Approx. mortgage balance ($)</label><input id="f-balance" type="number" inputmode="numeric" min="0" name="mortgage_balance" placeholder="250,000"/></div>
    <div class="lf-field"><label for="f-amount">Amount you are exploring ($)</label><input id="f-amount" type="number" inputmode="numeric" min="0" name="requested_amount" placeholder="60,000"/></div>
    <div class="lf-field"><label for="pi-purpose">Borrowing purpose</label><select id="pi-purpose" name="purpose"><option>Home improvement</option><option>Debt consolidation</option><option>Other</option></select></div>
    <div class="lf-field"><label for="f-credit">Estimated credit score <span style="text-transform:none;letter-spacing:0;color:#AAB8C7;">(best guess is fine)</span></label><select id="f-credit" name="credit_band">%(credit_opts)s</select></div>
    <div class="lf-field"><label for="f-timing">Timing</label><select id="f-timing" name="timeline"><option>As soon as practical</option><option>1-3 months</option><option>3-6 months</option><option>Exploring</option></select></div>
    <div class="lf-field"><label for="f-name">Name</label><input id="f-name" type="text" name="name" autocomplete="name" required/></div>
    <div class="lf-field"><label for="f-phone">Mobile number</label><input id="f-phone" type="tel" name="phone" inputmode="tel" autocomplete="tel" required/></div>
    <div class="lf-field full"><label for="f-email">Email</label><input id="f-email" type="email" name="email" autocomplete="email" required/></div>
    <p class="pp-geo" id="pi-geo" hidden>Thank you for your interest. Stonehaven does not currently arrange home loans in that state; we serve GA, AL, TN, FL, NC and SC.</p>
    <div class="lead-actions">
      <span class="note">We treat every inquiry in confidence. No hard credit pull at this stage. By submitting, you agree Stonehaven may contact you about your inquiry by phone, email or text. Consent is not a condition of service.</span>
      <button type="submit" class="lead-submit">%(cta)s</button>
    </div>
  </form>
  <div class="lead-success" id="leadSuccess"><div class="ok">Thank you, received.</div><p>A licensed specialist will call you back, usually within one business day.</p></div>
</div></div></section>
<section class="faq"><div class="wrap">
  <div class="head reveal"><span class="eyebrow">Questions</span><h2>Asked before starting</h2></div>
  <div class="faq-list reveal">%(faqs)s</div>
</div></section>
<section class="tight" style="padding-top:0;"><div class="wrap"><div class="ad-mod reveal"><p style="font-size:13.5px;color:var(--stone-400);line-height:2;text-align:center;">Read more: <a href="/heloc" class="line">HELOC guide and comparison</a> · <a href="/cash-out-refinance" class="line">Cash-out refinance, compared</a> · <a href="/residential" class="line">Home loans in GA, AL, TN, FL, NC and SC</a></p></div></div></section>
</main>
<footer class="lp-foot" style="max-width:760px;margin:0 auto;padding:18px 20px 34px;border-top:1px solid %(line)s;font-size:12px;line-height:1.6;color:%(slate)s;">%(eho)s %(disc)s <a href="/privacy" style="color:inherit;">Privacy policy</a></footer>
<script>
(function(){
  var $=function(id){return document.getElementById(id);};
  var fired=false;
  function moneyK(n){ if(n<=0)return "$0"; return "$"+Math.round(n/1000).toLocaleString("en-US")+"k"; }
  function est(){
    var H=window.SH_HELOC; if(!H||!$("e-value")) return;
    var v=+$("e-value").value||0, b=+$("e-balance").value||0;
    if(v<=0){$("e-range").textContent="-";return;}
    var lo=H.availableEquity(v,b,80), hi=H.availableEquity(v,b,90);
    if(!lo||!hi)return;
    if(hi.available<=0){$("e-range").textContent="$0";$("e-verdict").textContent="no headroom at common caps";$("e-note").textContent="At common lender caps there is no room above the balance today. A specialist can still walk through options and timing.";}
    else{$("e-range").textContent=moneyK(lo.available)+" \\u2013 "+moneyK(hi.available);$("e-verdict").textContent="potentially accessible";$("e-note").textContent="Headroom at common 80 to 90 percent combined loan-to-value caps. A specialist confirms the real number on a callback.";}
    if($("f-value")&&!$("f-value").dataset.touched)$("f-value").value=v;
    if($("f-balance")&&!$("f-balance").dataset.touched)$("f-balance").value=b;
    var form=document.querySelector("form[data-sh-form]");
    if(form)form.setAttribute("data-sh-about-prefix","[HELOC ad: %(slug)s] est "+$("e-range").textContent+" on value "+moneyK(v)+" / balance "+moneyK(b));
    if(!fired&&window.shTrack){fired=true;window.shTrack("calc_used",{page:"heloc-ad-%(slug)s"});}
  }
  function boot(){
    ["e-value","e-balance"].forEach(function(id){var el=$(id);if(el)el.addEventListener("input",est);});
    ["f-value","f-balance"].forEach(function(id){var el=$(id);if(el)el.addEventListener("input",function(){el.dataset.touched="1";});});
    var lad=$("ad-ladder");
    if(lad)Array.prototype.forEach.call(lad.querySelectorAll("button"),function(b){b.addEventListener("click",function(){
      Array.prototype.forEach.call(lad.querySelectorAll("button"),function(x){x.classList.remove("on");});b.classList.add("on");
      if($("f-amount"))$("f-amount").value=b.getAttribute("data-amt");
      var tgt=$("estimate")||$("intake");if(tgt)tgt.scrollIntoView({behavior:"smooth",block:"start"});});});
    est();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
</script>
</body></html>''' % dict(credit_opts=CREDIT_OPTIONS, eyebrow=a['eyebrow'], h1=a['h1'], sub=a['sub'], cta=a['cta'], mods=mods, faqs=faqs, states=states,
           target='estimate' if has_est else 'intake', slug=a['slug'], line=LINE, slate=SLATE, disc=DISCLOSURE,
           eho='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" role="img" aria-label="Equal Housing Opportunity" style="vertical-align:-3px;margin-right:4px;"><path d="M12 3 2 10h3v11h14V10h3L12 3z" stroke="#5b6876" stroke-width="1.6"/><path d="M8 13.5h8M8 17h8" stroke="#5b6876" stroke-width="1.6"/></svg>')

def main():
    for a in ADS:
        io.open(os.path.join(ROOT, 'heloc', a['slug'] + '.html'), 'w', encoding='utf-8').write(head(a) + body(a))
        print('built heloc/%s.html  <- %s' % (a['slug'], a['ad']))
    print('done: %d ad pages' % len(ADS))

if __name__ == '__main__':
    main()
