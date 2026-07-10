/* ============================================================
   Stonehaven — funnel plumbing (UTM capture · form submit · events)
   Include on every funnel page: <script src="js/funnel.js" defer></script>
   (ES pages: src="../js/funnel.js")

   GOING LIVE — one place to edit:
   Set INTAKE_ENDPOINT to the CRM's public intake URL, e.g.
   "https://crm.stonehavencre.com/api/intake/website".
   While empty, submissions are captured by Netlify Forms (the
   hidden <form name="lead"> registered in index.html defines the
   fields), so no lead is lost before the CRM exists. Matches
   WEBSITE_FORM_CONTRACT.md.
   ============================================================ */
(function () {
  "use strict";

  var INTAKE_ENDPOINT = ""; // <-- set at go-live
  var GA4_ID = "";          // <-- e.g. "G-XXXXXXXXXX"  (Google Analytics 4)
  var META_PIXEL_ID = "";   // <-- e.g. "1234567890"    (Meta/Facebook Pixel)

  /* ---------- 0 · analytics tag loaders (inert until IDs above are set) ---------- */
  if (GA4_ID) {
    var gs = document.createElement("script");
    gs.async = true;
    gs.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_ID;
    document.head.appendChild(gs);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA4_ID);
  }
  if (META_PIXEL_ID) {
    /* Meta's standard base snippet, unminified */
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = true; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", META_PIXEL_ID);
    window.fbq("track", "PageView");
  }

  /* ---------- 1 · UTM capture (persists for the session) ---------- */
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"];
  function readUtms() {
    try {
      var params = new URLSearchParams(window.location.search);
      var found = {};
      var any = false;
      UTM_KEYS.forEach(function (k) {
        var v = params.get(k);
        if (v) { found[k] = v.slice(0, 200); any = true; }
      });
      if (any) sessionStorage.setItem("sh_utms", JSON.stringify(found));
      var stored = sessionStorage.getItem("sh_utms");
      return stored ? JSON.parse(stored) : {};
    } catch (e) { return {}; }
  }
  var UTMS = readUtms();

  /* ---------- 2 · analytics events (safe no-ops until tags exist) ---------- */
  function track(eventName, params) {
    params = params || {};
    try { if (typeof window.gtag === "function") window.gtag("event", eventName, params); } catch (e) {}
    try {
      if (typeof window.fbq === "function") {
        // Map our named conversions onto Meta standard events where they fit
        var metaMap = { lead: "Lead", quote_request: "Lead", booking_complete: "Schedule",
          guide_download: "Lead", sheet_download: "Lead", deal_review_request: "Lead",
          quiz_complete: "CompleteRegistration", calc_used: "ViewContent" };
        if (metaMap[eventName]) window.fbq("track", metaMap[eventName], params);
        else window.fbq("trackCustom", eventName, params);
      }
    } catch (e) {}
    try { window.dataLayer = window.dataLayer || []; window.dataLayer.push(Object.assign({ event: eventName }, params)); } catch (e) {}
  }
  window.shTrack = track;

  /* ---------- 3 · form submission per WEBSITE_FORM_CONTRACT ---------- */
  // Any <form data-sh-form> is wired automatically. Attributes:
  //   data-sh-form      : source id, e.g. "dscr-analyzer" (sent as `page`)
  //   data-sh-product   : "Commercial" | "SBA" | "DSCR" | "Not sure"
  //   data-sh-event     : analytics event fired on success, e.g. "lead"
  //   data-sh-thanks    : URL of the thank-you page to redirect to
  //   data-sh-lang      : "en" | "es" (defaults to <html lang>)
  // Fields: [name=name] [name=email] [name=phone] read directly; every other
  // visible field is folded into `about` as "Label: value" lines so the rep
  // sees full context in the CRM without any CRM schema changes.
  // Honeypot: include <input name="company_website" class="hp-field"> — bots fill it, humans can't see it.

  function buildAbout(form, extra) {
    var lines = [];
    if (extra) lines.push(extra);
    var skip = { name: 1, email: 1, phone: 1, company_website: 1 };
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || skip[el.name] || el.type === "submit" || el.type === "hidden") return;
      var v = (el.value || "").trim();
      if (!v) return;
      var label = form.querySelector('label[for="' + el.id + '"]');
      var key = label ? label.textContent.replace(/\s*\(.*?\)\s*/g, "").trim() : el.name;
      lines.push(key + ": " + v.slice(0, 300));
    });
    var utmStr = Object.keys(UTMS).map(function (k) { return k + "=" + UTMS[k]; }).join(" ");
    if (utmStr) lines.push("[attribution] " + utmStr);
    lines.push("[url] " + window.location.pathname + window.location.search);
    return lines.join(" · ").slice(0, 2000);
  }

  function wireForm(form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // honeypot — silently succeed so bots learn nothing
      var hp = form.querySelector('[name="company_website"]');
      var thanks = form.getAttribute("data-sh-thanks");
      if (hp && hp.value) { if (thanks) window.location.href = thanks; return; }

      // minimal validation: email always; name where present
      var emailEl = form.querySelector('[name="email"]');
      var nameEl = form.querySelector('[name="name"]');
      var bad = false;
      if (emailEl && !/.+@.+\..+/.test(emailEl.value.trim())) { emailEl.style.borderBottomColor = "#B0413A"; bad = true; }
      if (nameEl && nameEl.hasAttribute("required") && !nameEl.value.trim()) { nameEl.style.borderBottomColor = "#B0413A"; bad = true; }
      if (bad) return;

      // Structured extras: every non-contract field, machine-readable, plus UTMs.
      // See FORM_CONTRACT_ADDENDUM.md — the CRM stores these as queryable lead fields;
      // the same data also rides inside `about` as text, so nothing is lost if the
      // CRM ignores `extra` entirely.
      var extra = {};
      var skipX = { name: 1, email: 1, phone: 1, company_website: 1 };
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || skipX[el.name] || el.type === "submit") return;
        var v = (el.value || "").trim();
        if (v) extra[el.name] = v.slice(0, 300);
      });
      if (Object.keys(UTMS).length) extra.utm = UTMS;

      var payload = {
        name: nameEl ? nameEl.value.trim() : (emailEl ? emailEl.value.trim() : ""),
        email: emailEl ? emailEl.value.trim() : "",
        phone: (form.querySelector('[name="phone"]') || { value: "" }).value.trim(),
        product: form.getAttribute("data-sh-product") || "Not sure",
        about: buildAbout(form, form.getAttribute("data-sh-about-prefix") || ""),
        page: form.getAttribute("data-sh-form") || window.location.pathname,
        lang: form.getAttribute("data-sh-lang") || document.documentElement.lang || "en",
        token: "",
        extra: extra
      };

      var evt = form.getAttribute("data-sh-event") || "lead";
      var btn = form.querySelector('[type="submit"]');
      if (btn) { btn.disabled = true; btn.style.opacity = ".6"; }

      function done() {
        track(evt, { page: payload.page, product: payload.product });
        if (thanks) window.location.href = thanks;
        else {
          form.style.display = "none";
          var ok = form.parentElement.querySelector(".lead-success");
          if (ok) ok.classList.add("show");
        }
      }

      if (!INTAKE_ENDPOINT) {
        // Netlify Forms fallback — every submission lands in the site's
        // "lead" form (Netlify dashboard → Forms) until the CRM goes live.
        // POST to the current page's path, never the bare "/": Netlify's
        // edge 404s POSTs to the naked root (found in pre-launch testing)
        // while any real page path routes to the forms handler.
        var nf = new URLSearchParams();
        nf.append("form-name", "lead");
        ["name", "email", "phone", "product", "about", "page", "lang"].forEach(function (k) {
          nf.append(k, payload[k] || "");
        });
        var post = function (target) {
          return fetch(target, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: nf.toString()
          });
        };
        var target = window.location.pathname;
        if (target.slice(-1) === "/") target += "index.html";
        else if (!/\.html?$/.test(target)) target += ".html"; // pretty URL → real file path
        post(target).then(function (r) {
          if (r && r.ok) { done(); return; }
          post("/index.html").then(done, done); // one retry on a known-good path
        }).catch(function () {
          post("/index.html").then(done, done); // never strand the visitor on a blip
        });
        return;
      }
      fetch(INTAKE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(done).catch(done); // never strand a real lead on a network blip — thank-you either way
    });
    Array.prototype.forEach.call(form.querySelectorAll("input,select,textarea"), function (i) {
      i.addEventListener("input", function () { i.style.borderBottomColor = ""; });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.forEach.call(document.querySelectorAll("form[data-sh-form]"), wireForm);

    /* nav scroll + mobile menu + reveal (same behaviour as the rest of the site) */
    var nav = document.getElementById("nav");
    if (nav) {
      var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 24); };
      onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    }
    var toggle = document.getElementById("toggle"), links = document.getElementById("links");
    if (toggle && links) toggle.addEventListener("click", function () { links.classList.toggle("open"); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: .16, rootMargin: "0px 0px -50px 0px" });
    Array.prototype.forEach.call(document.querySelectorAll(".reveal:not(.in)"), function (el) { io.observe(el); });
  });
})();
