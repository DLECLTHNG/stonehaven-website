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

  /* All IDs/endpoints live in js/site-config.js (window.SH_CONFIG) —
     the fallbacks here only cover a page that forgot the config tag. */
  var CFG = window.SH_CONFIG || {};
  var INTAKE_ENDPOINT = CFG.intakeEndpoint || "";
  var GA4_ID = CFG.ga4Id || "";
  var META_PIXEL_ID = CFG.metaPixelId || "";
  var CONTACT_EMAIL = CFG.email || "office@stonehavencre.com";
  var SUBMIT_TIMEOUT = CFG.submitTimeoutMs || 15000;

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
    // Any form with a product_choice select keeps data-sh-product in sync,
    // so the CRM payload always reflects the visitor's actual selection.
    var productSel = form.querySelector('select[name="product_choice"]');
    if (productSel) {
      var syncProduct = function () { form.setAttribute("data-sh-product", productSel.value); };
      productSel.addEventListener("change", syncProduct);
      syncProduct();
    }
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
      track("form_submit_attempted", { page: payload.page });
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

      // Truthful failure handling: success UI renders ONLY after an
      // accepted response. On failure (primary + one fallback), the
      // visitor sees an accessible error with a retry and a verified
      // alternate channel — values are preserved, button re-enabled.
      function showError() {
        if (btn) { btn.disabled = false; btn.style.opacity = ""; }
        var es = (form.getAttribute("data-sh-lang") || document.documentElement.lang || "en").indexOf("es") === 0;
        var box = form.querySelector(".lead-error");
        if (!box) {
          box = document.createElement("p");
          box.className = "lead-error";
          box.setAttribute("role", "alert");
          box.style.cssText = "color:#B0413A;font-size:13px;margin-top:14px;line-height:1.5;";
          form.appendChild(box);
        }
        box.textContent = es
          ? "No pudimos enviar su consulta. Por favor intente de nuevo, o escríbanos a " + CONTACT_EMAIL + "."
          : "We couldn't send your enquiry. Please try again, or email us at " + CONTACT_EMAIL + ".";
        track("form_submit_failed", { page: payload.page });
      }
      function timedFetch(url, opts) {
        if (typeof AbortController === "undefined") return fetch(url, opts);
        var ctl = new AbortController();
        var t = setTimeout(function () { ctl.abort(); }, SUBMIT_TIMEOUT);
        opts.signal = ctl.signal;
        return fetch(url, opts).finally(function () { clearTimeout(t); });
      }

      if (!INTAKE_ENDPOINT) {
        // Netlify Forms capture — every submission lands in the site's
        // "lead" form until the CRM goes live. POST to the current
        // page's path, never the bare "/" (edge 404s naked-root POSTs).
        var nf = new URLSearchParams();
        nf.append("form-name", "lead");
        ["name", "email", "phone", "product", "about", "page", "lang"].forEach(function (k) {
          nf.append(k, payload[k] || "");
        });
        var post = function (target) {
          return timedFetch(target, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: nf.toString()
          });
        };
        // Clean-URL era: .html paths force-301 (method-breaking for POST),
        // so submit to the page's own clean path; directory paths map to
        // the contact page, a known-registered POST target.
        var target = window.location.pathname.replace(/\.html?$/, "");
        if (target.slice(-1) === "/") target = (target.indexOf("/es/") === 0 ? "/es" : "") + "/contact";
        post(target).then(function (r) {
          if (r && r.ok) { track("form_submit_succeeded", { page: payload.page }); done(); return; }
          return post("/contact").then(function (r2) {
            if (r2 && r2.ok) { track("form_submit_succeeded", { page: payload.page }); done(); } else showError();
          }, showError);
        }).catch(function () {
          post("/contact").then(function (r2) {
            if (r2 && r2.ok) { track("form_submit_succeeded", { page: payload.page }); done(); } else showError();
          }, showError);
        });
        return;
      }
      timedFetch(INTAKE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (r) {
        if (r && r.ok) { track("form_submit_succeeded", { page: payload.page }); done(); }
        else showError();
      }).catch(showError);
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
    if (toggle && links) {
      var esNav = (document.documentElement.lang || "en").indexOf("es") === 0;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", "links");
      toggle.addEventListener("click", function () {
        var open = links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? (esNav ? "Cerrar men\u00fa" : "Close menu") : (esNav ? "Abrir men\u00fa" : "Open menu"));
      });
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: .16, rootMargin: "0px 0px -50px 0px" });
    Array.prototype.forEach.call(document.querySelectorAll(".reveal:not(.in)"), function (el) { io.observe(el); });
  });
})();
