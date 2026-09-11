/* ============================================================
   Family Opportunity landing pages: runtime (form, sticky CTA, measurement).
   Settings come from js/family-config.js (window.SH_FAMILY), which is
   GENERATED from scripts/family_lp_config.py. Do not edit values here.

   Hard rules (not switches):
   - No Meta Pixel, CAPI, session replay or retargeting tag ever loads on the
     adult-child page (body[data-fo-sensitive="1"]) or on /request-received
     (body[data-fo-kind="confirm"], shared by both funnels).
   - A Meta Lead event, when the parents page is separately configured for it,
     fires only after the server confirms the inquiry was stored. Never on a
     CTA click and never on a visit to the confirmation URL.
   - Nothing personal is written to the URL, the console or analytics params.
   ============================================================ */
(function () {
  "use strict";
  var C = window.SH_FAMILY || {};
  var T = C.tracking || {};
  var body = document.body;
  var KIND = body.getAttribute("data-fo-kind") || "lp";
  var SENSITIVE = body.getAttribute("data-fo-sensitive") === "1";
  var PAGE = body.getAttribute("data-fo-page") || "";
  var AD_TAGS_ALLOWED = KIND === "lp" && !SENSITIVE;
  var ANALYTICS_ALLOWED = KIND === "lp" && (!SENSITIVE || T.ga4OnSensitivePage === true);

  /* ---------- measurement (all off until configured) ---------- */
  var ga4 = ANALYTICS_ALLOWED && T.ga4Id ? T.ga4Id : "";
  if (ga4) {
    var gs = document.createElement("script"); gs.async = true;
    gs.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ga4);
    document.head.appendChild(gs);
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", ga4, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
  }
  var pixel = AD_TAGS_ALLOWED && T.metaPixelId ? T.metaPixelId : "";
  if (pixel) {
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = true; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("set", "autoConfig", false, pixel);   /* automatic event detection off */
    window.fbq("init", pixel);                         /* no advanced matching data passed */
    window.fbq("track", "PageView");
  }
  function ev(name) {
    if (!ga4) return;
    try { window.gtag("event", name, { page_id: PAGE }); } catch (e) {}
  }

  /* ---------- attribution allowlist (stored privately, sent with the inquiry only) ---------- */
  var ATTR_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id"];
  function attribution() {
    var out = {};
    try {
      var p = new URLSearchParams(window.location.search), any = false;
      ATTR_KEYS.forEach(function (k) { var v = p.get(k); if (v) { out[k] = v.slice(0, 120); any = true; } });
      if (any) sessionStorage.setItem("sh_fo_attr", JSON.stringify(out));
      else { var s = sessionStorage.getItem("sh_fo_attr"); if (s) out = JSON.parse(s); }
    } catch (e) {}
    return out;
  }
  var ATTR = attribution();

  /* ---------- confirmation page ---------- */
  if (KIND === "confirm") {
    try {
      var r = JSON.parse(sessionStorage.getItem("sh_fo_receipt") || "null");
      var ref = document.getElementById("fo-ref");
      if (r && r.id && ref) {
        ref.querySelector("b").textContent = r.id;
        ref.classList.add("show");
        var dry = document.getElementById("fo-dry");
        if (r.dry_run && dry) dry.hidden = false;
      }
    } catch (e) {}
    return;
  }

  /* ---------- CTAs scroll to the form ---------- */
  var form = document.getElementById("inquiry-form");
  var card = document.getElementById("inquiry");
  function goToForm(e) {
    if (!card) return;
    e.preventDefault();
    card.scrollIntoView({ behavior: "smooth", block: "start" });
    if (window.innerWidth >= 900) {
      var first = form && form.querySelector("input[name=name]");
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 350);
    }
  }
  Array.prototype.forEach.call(document.querySelectorAll('a[href="#inquiry"]'), function (a) { a.addEventListener("click", goToForm); });

  /* ---------- sticky Request a Call (mobile) ---------- */
  var sticky = document.getElementById("fo-sticky");
  var heroCta = document.getElementById("hero-cta");
  var foot = document.querySelector("footer");
  if (sticky && heroCta && card && "IntersectionObserver" in window) {
    var heroSeen = true, formSeen = false, footSeen = false, typing = false;
    function paint() {
      var show = !heroSeen && !formSeen && !footSeen && !typing && window.innerWidth < 900;
      sticky.classList.toggle("show", show);
      body.classList.toggle("fo-sticky-on", show);
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.target === heroCta) heroSeen = en.isIntersecting;
        else if (en.target === card) formSeen = en.isIntersecting;
        else if (en.target === foot) footSeen = en.isIntersecting;
      });
      paint();
    }, { threshold: 0.05 });
    io.observe(heroCta); io.observe(card); if (foot) io.observe(foot);
    if (foot) {
      window.addEventListener("scroll", function () {
        var r = foot.getBoundingClientRect();
        var near = r.top < window.innerHeight;
        if (near !== footSeen) { footSeen = near; paint(); }
      }, { passive: true });
    }
    if (form) {
      form.addEventListener("focusin", function () { typing = true; paint(); });
      form.addEventListener("focusout", function () { setTimeout(function () { typing = form.contains(document.activeElement); paint(); }, 50); });
    }
    window.addEventListener("resize", paint);
  }

  /* ---------- inquiry form ---------- */
  if (!form) return;
  var STATES = C.states || [];
  var inFlight = false, started = false;
  var fields = {
    name: form.querySelector("[name=name]"),
    phone: form.querySelector("[name=phone]"),
    state: form.querySelector("[name=state]"),
    email: form.querySelector("[name=email]"),
    price: form.querySelector("[name=price]")
  };
  var btn = form.querySelector('button[type="submit"]');
  var btnLabel = btn ? btn.textContent : "";
  var alertBox = form.querySelector(".fo-alert");

  function wrap(el) { return el ? el.closest(".fo-field") : null; }
  function setErr(el, msg) {
    var w = wrap(el); if (!w) return;
    var e = w.querySelector(".fo-err");
    if (msg) { w.classList.add("invalid"); if (e) e.textContent = msg; el.setAttribute("aria-invalid", "true"); }
    else { w.classList.remove("invalid"); if (e) e.textContent = ""; el.removeAttribute("aria-invalid"); }
  }
  function digits(v) { return (v || "").replace(/\D/g, ""); }
  function phoneOk(v) { var d = digits(v); if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1); return d.length === 10 && d.charAt(0) !== "0" && d.charAt(0) !== "1"; }
  function emailOk(v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  function validate() {
    var first = null;
    var name = (fields.name.value || "").trim();
    var m = !name || name.length < 2 ? "Please enter your full name." : name.length > 120 ? "Please shorten your name." : "";
    setErr(fields.name, m); if (m && !first) first = fields.name;
    m = phoneOk(fields.phone.value) ? "" : "Please enter a valid phone number, including area code.";
    setErr(fields.phone, m); if (m && !first) first = fields.phone;
    m = STATES.indexOf(fields.state.value) === -1 ? "Please choose the property state." : "";
    setErr(fields.state, m); if (m && !first) first = fields.state;
    m = emailOk((fields.email.value || "").trim()) ? "" : "Please enter a valid email address, or leave it blank.";
    setErr(fields.email, m); if (m && !first) first = fields.email;
    if (fields.price) {
      var raw = (fields.price.value || "").trim();
      var n = parseInt(digits(raw), 10);
      m = !raw ? "" : (!n || n < 1000 || n > (C.priceMax || 100000000))
        ? "Please enter a rough purchase price, or leave it blank." : "";
      setErr(fields.price, m); if (m && !first) first = fields.price;
    }
    return first;
  }
  Object.keys(fields).forEach(function (k) {
    var el = fields[k]; if (!el) return;
    el.addEventListener("input", function () { setErr(el, ""); if (!started) { started = true; ev("form_start"); } });
    el.addEventListener("change", function () { setErr(el, ""); });
  });

  function showAlert(html) {
    if (!alertBox) return;
    alertBox.innerHTML = html;
    alertBox.className = "fo-alert error show";
    alertBox.focus && alertBox.focus({ preventScroll: true });
  }
  function hideAlert() { if (alertBox) { alertBox.className = "fo-alert"; alertBox.innerHTML = ""; } }
  function busy(on) {
    inFlight = on;
    if (!btn) return;
    btn.disabled = on;
    btn.setAttribute("aria-busy", on ? "true" : "false");
    btn.textContent = on ? "Sending your request" : btnLabel;
  }
  function eventId() { return "fo-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (inFlight) return;                       /* duplicate-submit protection */
    hideAlert();
    var bad = validate();
    if (bad) { bad.focus(); return; }
    var timing = form.querySelector("[name=timing]:checked");
    var hp = form.querySelector("[name=company_website]");
    var priceEl = form.querySelector("[name=price]");
    var creditEl = form.querySelector("[name=credit]");
    var extraEl = form.querySelector("#f-extra");
    var eid = eventId();
    var payload = {
      page: PAGE,
      name: fields.name.value.trim(),
      phone: digits(fields.phone.value),
      state: fields.state.value,
      email: (fields.email.value || "").trim(),
      price: priceEl ? digits(priceEl.value) : "",
      credit: creditEl ? creditEl.value : "",
      extra_name: extraEl ? extraEl.getAttribute("name") : "",
      extra_value: extraEl ? extraEl.value : "",
      timing: timing ? timing.value : "",
      notice_version: C.noticeVersion || "",
      attribution: ATTR,
      path: window.location.pathname,
      event_id: eid,
      company_website: hp ? hp.value : ""
    };
    busy(true);
    var ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, C.timeoutMs || 15000);
    fetch(C.endpoint || "/.netlify/functions/family-inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
      signal: ctl ? ctl.signal : undefined,
      credentials: "same-origin"
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, body: j || {} }; });
    }).then(function (res) {
      clearTimeout(timer);
      var j = res.body;
      if (res.status === 200 && j.ok && j.inquiry_id) {
        try { sessionStorage.setItem("sh_fo_receipt", JSON.stringify({ id: j.inquiry_id, at: j.received_at || "", dry_run: !!j.dry_run })); } catch (e2) {}
        ev("inquiry_submitted");
        if (pixel && !j.dry_run) { try { window.fbq("track", "Lead", {}, { eventID: eid }); } catch (e3) {} }
        window.location.assign("/request-received");
        return;
      }
      if (res.status === 400 && j.errors) {
        Object.keys(j.errors).forEach(function (k) { if (fields[k]) setErr(fields[k], j.errors[k]); });
        busy(false);
        var f = Object.keys(j.errors).map(function (k) { return fields[k]; }).filter(Boolean)[0];
        if (f) f.focus(); else showAlert(retryText());
        return;
      }
      busy(false);
      showAlert(res.status === 429 ? "We have already received several requests from this connection. Please wait a few minutes, or call " + telLink() + "." : retryText());
    }).catch(function () {
      clearTimeout(timer);
      busy(false);
      showAlert(retryText());
    });
  });
  function telLink() { return '<a href="tel:' + (C.phoneE164 || "") + '">' + (C.phoneDisplay || "us") + "</a>"; }
  function retryText() { return "We could not send your request just now. Your details are still here, so you can try again, or call " + telLink() + "."; }
})();
