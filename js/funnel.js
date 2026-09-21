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
  /* ---------- 1b · Cloudflare Turnstile (invisible) — only when a site key is set ---------- */
  var TS_KEY = CFG.turnstileSiteKey || "";
  var tsWidgets = {}; // form -> widgetId
  if (TS_KEY && INTAKE_ENDPOINT) {
    var tss = document.createElement("script");
    tss.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    tss.async = true; tss.defer = true;
    document.head.appendChild(tss);
  }
  function tsToken(form) {
    // Resolves a fresh Turnstile token for this form (invisible challenge),
    // or "" if Turnstile isn't configured/loaded. Never blocks submission on
    // a Turnstile outage: the CRM decides what to do with an empty token.
    return new Promise(function (resolve) {
      if (!TS_KEY || !INTAKE_ENDPOINT || !window.turnstile) return resolve("");
      try {
        var host = form.querySelector(".sh-ts");
        if (!host) { host = document.createElement("div"); host.className = "sh-ts"; form.appendChild(host); }
        var settled = false, t = setTimeout(function () { if (!settled) { settled = true; resolve(""); } }, 8000);
        var id = tsWidgets[form.id || (form.id = "f" + Math.random().toString(36).slice(2))];
        if (id) window.turnstile.reset(id);
        else id = tsWidgets[form.id] = window.turnstile.render(host, { sitekey: TS_KEY, size: "invisible", execution: "execute",
          callback: function (tok) { if (!settled) { settled = true; clearTimeout(t); resolve(tok || ""); } },
          "error-callback": function () { if (!settled) { settled = true; clearTimeout(t); resolve(""); } } });
        window.turnstile.execute(id);
      } catch (e) { resolve(""); }
    });
  }

  // Source context stays in this tab's session and in the submitted inquiry.
  // It is never an analytics parameter, a user identity, or a browsing history.
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id", "gclid", "fbclid"];
  var ATTR_KEY = "sh_source_context_v1";
  var CHANNELS = ["organic_search", "ai_referral", "paid_campaign", "referral", "direct_or_unknown"];
  var CRE_CONTENT = [
    "/blog/45-million-builder-fix-and-flip-capital",
    "/blog/atlanta-teardown-rebuild-construction-financing",
    "/blog/100-ltc-construction-loans-builder-cash-needed",
    "/blog/construction-loan-property-already-owned-mortgage-payoff",
    "/blog/brookhaven-ga-100-ltc-ground-up-construction",
    "/blog/commercial-mortgage-referrals-cpas-attorneys",
    "/blog/mortgage-broker-dscr-commercial-referral-partner",
    "/resources/how-lenders-size-commercial-loans",
    "/resources/commercial-refinance-guide",
    "/resources/bridge-vs-permanent-financing"
  ];
  function legalPolicyPath(raw) {
    // Match legal documents, not financing destinations such as /terms-sheet.
    return /^\/(?:es\/)?(?:privacy|terms)(?:\.html?)?\/?$/.test(raw || "");
  }
  function safePublicPath(raw) {
    // Accept public marketing route shapes only. No encoded data, private
    // endpoints, confirmation routes, query strings or fragments survive.
    var path = typeof raw === "string" ? raw.split(/[?#]/)[0].replace(/\.html?$/, "").replace(/\/$/, "") : "";
    if (path === "" || path === "/es") return raw && raw.charAt(0) === "/" ? (path || "/") : "";
    if (path.length > 160 || !/^\/(?:es\/)?[a-z0-9-]+(?:\/[a-z0-9-]+)?$/.test(path)) return "";
    if (/(?:family|parents|adult-child|disabil|thanks|request-received)/.test(path) || legalPolicyPath(path)) return "";
    var plain = path.replace(/^\/es(?=\/)/, "");
    return /^\/(?:blog|resources|commercial|residential|dscr|heloc|sba)(?:\/[a-z0-9-]+)?$/.test(plain) ||
      /^\/(?:contact|book|management|cash-out-refinance|bank-statement-loans|interest-only-loans|mortgage-calculator|commercial-loan-calculator|dscr-analyzer|dscr-review|dscr-program-calculator|sba-loan-calculator|sba-guide|refinance-calculator|terms-sheet|heloc-instant|heloc-wizard|heloc-planning-tools|calculation-methodology|editorial-policy)$/.test(plain) ? path : "";
  }
  function privateContext() {
    var body = document.body;
    return (typeof navigator !== "undefined" && navigator.globalPrivacyControl === true) ||
      (body && (body.getAttribute("data-fo-sensitive") === "1" || body.getAttribute("data-fo-kind") === "confirm")) ||
      /(?:family|parents|adult-child|disabil|thanks|request-received)/.test(window.location.pathname) ||
      /^\/(?:es\/)?(?:admin|account|api|private|login|portal|dashboard|secure|auth)(?:[\/-]|$)|^\/\./.test(window.location.pathname);
  }
  function removeStoredSources() {
    try { sessionStorage.removeItem(ATTR_KEY); sessionStorage.removeItem("sh_utms"); } catch (e) {}
  }
  function cleanCampaign(input) {
    var out = {};
    if (!input || typeof input !== "object" || Array.isArray(input)) return out;
    UTM_KEYS.forEach(function (key) {
      if (typeof input[key] === "string") {
        var value = input[key].replace(/[<>"'\x00-\x1f\x7f]/g, "").slice(0, 200);
        if (value) out[key] = value;
      }
    });
    return out;
  }
  function readUtms() {
    if (privateContext()) { removeStoredSources(); return {}; }
    // Reading a legal policy does not start attribution or erase the valid
    // source context from the inquiry path that brought a visitor here.
    if (legalPolicyPath(window.location.pathname)) return {};
    var found = {};
    try {
      var params = new URLSearchParams(window.location.search);
      UTM_KEYS.forEach(function (key) { if (params.get(key)) found[key] = params.get(key); });
    } catch (e) {}
    found = cleanCampaign(found);
    // Storage failures must not discard the current campaign or stop a lead.
    if (Object.keys(found).length) {
      try { sessionStorage.setItem("sh_utms", JSON.stringify(found)); } catch (e) {}
      return found;
    }
    try { return cleanCampaign(JSON.parse(sessionStorage.getItem("sh_utms") || "{}")); } catch (e) { return {}; }
  }
  var UTMS = readUtms();
  function externalOrigin(raw) {
    try {
      var url = new URL(raw);
      if (!/^https?:$/.test(url.protocol) || url.username || url.password) return "";
      var host = url.hostname.toLowerCase();
      // Do not retain local/intranet destinations or credentials. Referrer
      // paths often contain searches or conversation IDs, so retain origin only.
      if (!/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/.test(host) || host.length > 190 ||
          /(?:^|\.)(?:localhost|local|internal|test|invalid|example)$/.test(host) ||
          /^(?:www\.)?stonehavencre\.com$/.test(host)) return "";
      var own = window.location.hostname;
      if (own && host === own.toLowerCase()) return "";
      return url.protocol + "//" + host;
    } catch (e) { return ""; }
  }
  function classifySource(origin, campaign) {
    var medium = (campaign.utm_medium || "").toLowerCase();
    if (/^(?:cpc|ppc|paid|paid_search|paid_social|display|cpm)$/.test(medium)) return "paid_campaign";
    var host = origin.replace(/^https?:\/\//, "");
    if (/^(?:(?:www\.)?(?:chatgpt\.com|perplexity\.ai|claude\.ai)|chat\.openai\.com|copilot\.microsoft\.com|gemini\.google\.com)$/.test(host)) return "ai_referral";
    if (/^(?:(?:www\.)?google\.(?:com|co\.uk|com\.au|ca|de|fr|es|co\.in)|(?:www\.)?(?:bing\.com|duckduckgo\.com)|search\.(?:yahoo\.com|brave\.com))$/.test(host) || medium === "organic") return "organic_search";
    return origin ? "referral" : "direct_or_unknown";
  }
  function creContentPath(path) {
    return CRE_CONTENT.indexOf(path.replace(/^\/es(?=\/)/, "")) !== -1 ? path : "";
  }
  function readSourceContext() {
    if (privateContext() || legalPolicyPath(window.location.pathname)) return null;
    var path = safePublicPath(window.location.pathname), saved;
    if (!path) return null;
    try { saved = JSON.parse(sessionStorage.getItem(ATTR_KEY) || "null"); } catch (e) {}
    var context;
    if (saved && saved.version === 1 && CHANNELS.indexOf(saved.first_channel) !== -1 && safePublicPath(saved.first_landing_path)) {
      context = { version: 1, first_landing_path: safePublicPath(saved.first_landing_path),
        first_referrer_origin: externalOrigin(saved.first_referrer_origin), first_channel: saved.first_channel,
        last_cre_content_path: creContentPath(safePublicPath(saved.last_cre_content_path)) };
    } else {
      var origin = externalOrigin(document.referrer || "");
      context = { version: 1, first_landing_path: path, first_referrer_origin: origin,
        first_channel: classifySource(origin, UTMS), last_cre_content_path: "" };
    }
    if (creContentPath(path)) context.last_cre_content_path = path;
    try { sessionStorage.setItem(ATTR_KEY, JSON.stringify(context)); } catch (e) {}
    return context;
  }
  var SOURCE_CONTEXT = readSourceContext();
  function submissionAttribution() {
    if (privateContext()) { removeStoredSources(); return null; }
    if (legalPolicyPath(window.location.pathname)) return null;
    return SOURCE_CONTEXT ? Object.assign({}, SOURCE_CONTEXT, { submission_path: safePublicPath(window.location.pathname) }) : null;
  }
  function submissionId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return "sh-" + window.crypto.randomUUID();
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      var bytes = new Uint8Array(16); window.crypto.getRandomValues(bytes);
      return "sh-" + Array.prototype.map.call(bytes, function (n) { return ("0" + n.toString(16)).slice(-2); }).join("");
    }
    // Opaque correlation only, never a security token or a persistent user ID.
    return "sh-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  /* ---------- 2 · analytics events (safe no-ops until tags exist) ---------- */
  function track(eventName, params, opts) {
    params = params || {};
    opts = opts || {};
    try { if (typeof window.gtag === "function") window.gtag("event", eventName, params); } catch (e) {}
    try {
      if (typeof window.fbq === "function") {
        // Map our named conversions onto Meta standard events where they fit
        var metaMap = { lead: "Lead", quote_request: "Lead", booking_complete: "Schedule",
          guide_download: "Lead", sheet_download: "Lead", deal_review_request: "Lead",
          quiz_complete: "CompleteRegistration", calc_used: "ViewContent", heloc_callback: "Lead",
          submit_application: "SubmitApplication" };
        var fbqOpts = opts.eventID ? { eventID: opts.eventID } : undefined;
        if (metaMap[eventName]) window.fbq("track", metaMap[eventName], params, fbqOpts);
        else window.fbq("trackCustom", eventName, params, fbqOpts);
      }
    } catch (e) {}
    try { window.dataLayer = window.dataLayer || []; window.dataLayer.push(Object.assign({ event: eventName }, params)); } catch (e) {}
  }
  window.shTrack = track;

  // One GA4 conversion across product-specific success events. Keep this out
  // of Meta's event mapper so existing Lead events are not counted twice.
  function analyticsOnly(name, params) {
    try { if (typeof window.gtag === "function") window.gtag("event", name, params); } catch (e) {}
  }

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

  function buildAbout(form, extra, id, attribution) {
    var lines = [];
    // Keep the requested HELOC figures ahead of long notes and attribution.
    var heloc = window.SH_HELOC_FIELDS && window.SH_HELOC_FIELDS.applies(form);
    var moneyLabels = { home_value: "Estimated home value ($)", mortgage_balance: "Mortgage balance ($)", requested_amount: "Requested amount ($)" };
    if (heloc) Object.keys(moneyLabels).forEach(function (key) {
      var el = form.querySelector('[name="' + key + '"]');
      if (el) lines.push(moneyLabels[key] + ": " + el.value);
    });
    var priority = {};
    if (form.getAttribute("data-sh-product") === "Commercial") {
      var projectLabels = { total_project_cost: "Total project cost ($)", requested_amount: "Requested financing ($)",
        project_value: "Estimated completed value ($)", project_type: "Project type", property_owned: "Property already owned",
        timeline: "Target closing", state: "Property state" };
      Object.keys(projectLabels).forEach(function (key) {
        var el = form.querySelector('[name="' + key + '"]');
        if (el && !el.disabled && el.value && !(heloc && moneyLabels[key])) {
          lines.push(projectLabels[key] + ": " + el.value.trim().slice(0, 100)); priority[key] = 1;
        }
      });
    }
    // Place the concise source summary after project facts and ahead of free text so the CRM's
    // 2,000-character fallback keeps it even when a prospect adds long notes.
    if (id) lines.push("[submission] " + id);
    if (attribution) lines.push("[source] " + attribution.first_channel + "; first=" + attribution.first_landing_path +
      (attribution.first_referrer_origin ? "; ref=" + attribution.first_referrer_origin : "") +
      "; submit=" + attribution.submission_path + (attribution.last_cre_content_path ? "; CRE=" + attribution.last_cre_content_path : ""));
    if (extra) lines.push(extra);
    var skip = { name: 1, email: 1, phone: 1, company_website: 1, "form-name": 1 };
    Array.prototype.forEach.call(form.elements, function (el) {
      // hidden inputs carry the step-engine answers (wizard/instant/persona
      // context) - include them; only the plumbing fields above are skipped
      if (!el.name || skip[el.name] || priority[el.name] || el.type === "submit" || el.disabled || ((el.type === "checkbox" || el.type === "radio") && !el.checked) || (heloc && moneyLabels[el.name])) return;
      var v = (el.value || "").trim();
      if (!v) return;
      var label = form.querySelector('label[for="' + el.id + '"]');
      var key = label ? label.textContent.replace(/\s*\(.*?\)\s*/g, "").trim() : el.name;
      lines.push(key + ": " + v.slice(0, 300));
    });
    var campaign = privateContext() || legalPolicyPath(window.location.pathname) ? {} : UTMS;
    var utmStr = Object.keys(campaign).map(function (k) { return k + "=" + campaign[k]; }).join(" ");
    if (utmStr) lines.push("[attribution] " + utmStr);
    // Arbitrary URL parameters can contain private data. Only the campaign
    // allowlist above is retained; the fallback URL is a public path only.
    var path = safePublicPath(window.location.pathname);
    if (path && !privateContext()) lines.push("[url] " + path);
    return lines.join(" · ").slice(0, 2000);
  }

  function wireForm(form) {
    // Both current and legacy product selectors control the selected lane.
    // Forms without a selector keep their fixed product classification.
    var productSel = form.querySelector('select[name="product_choice"]') || form.querySelector('select[name="product"]');
    if (productSel) {
      var syncProduct = function () {
        if (["Commercial", "SBA", "DSCR", "Residential", "Not sure"].indexOf(productSel.value) !== -1) {
          form.setAttribute("data-sh-product", productSel.value);
        }
      };
      productSel.addEventListener("change", syncProduct);
      syncProduct();
    }
    var equityGoal = form.querySelector('[name="goal"]');
    if (equityGoal && form.querySelector('[data-heloc-detail]')) {
      var syncEquity = function () {
        var on = /HELOC/i.test(equityGoal.value);
        Array.prototype.forEach.call(form.querySelectorAll('[data-heloc-detail]'), function (field) {
          field.hidden = !on; field.querySelector('input').disabled = !on;
        });
      };
      equityGoal.addEventListener('change', syncEquity); syncEquity();
    }
    var inFlight = false;
    var inquiryId = "";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (inFlight) return;
      if (productSel) syncProduct();

      // honeypot — silently succeed so bots learn nothing
      var hp = form.querySelector('[name="company_website"]');
      var thanks = form.getAttribute("data-sh-thanks");
      if (hp && hp.value) { if (thanks) window.location.href = thanks; return; }

      // Every lead needs its own name and email, including calculator and popup forms.
      var emailEl = form.querySelector('[name="email"]');
      var nameEl = form.querySelector('[name="name"]');
      var es = (form.getAttribute("data-sh-lang") || document.documentElement.lang || "en").indexOf("es") === 0;
      var invalid = [];
      if (!nameEl || !nameEl.value.trim() || nameEl.value.trim().length > 120 || /[\r\n\x00]/.test(nameEl.value)) invalid.push({ el: nameEl, message: es ? "Ingrese su nombre completo." : "Please enter your full name." });
      if (!emailEl || emailEl.value.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) invalid.push({ el: emailEl, message: es ? "Ingrese un correo electrónico válido." : "Please enter a valid email address." });
      var phoneEl = form.querySelector('[name="phone"]');
      if (phoneEl && phoneEl.hasAttribute("required") && phoneEl.value.replace(/\D/g, "").length < 10) invalid.push({ el: phoneEl, message: es ? "Ingrese un número de teléfono válido." : "Please enter a valid phone number." });
      var validationBox = form.querySelector('.lead-validation-error');
      if (validationBox) validationBox.hidden = true;
      if (invalid.length) {
        if (!validationBox) {
          validationBox = document.createElement('p');
          validationBox.className = 'lead-validation-error';
          validationBox.setAttribute('role', 'alert');
          validationBox.style.cssText = 'color:var(--lead-error-color,#B0413A);font-size:14px;line-height:1.5;width:100%;grid-column:1/-1;text-align:center;';
          form.appendChild(validationBox);
        }
        validationBox.textContent = invalid.map(function (item) { return item.message; }).join(' ');
        validationBox.hidden = false;
        invalid.forEach(function (item) { if (item.el) { item.el.style.borderBottomColor = '#B0413A'; item.el.setAttribute('aria-invalid', 'true'); } });
        if (invalid[0].el) invalid[0].el.focus();
        return;
      }
      if (/^heloc-/.test(form.getAttribute("data-sh-form") || "") || (window.SH_HELOC_FIELDS && window.SH_HELOC_FIELDS.applies(form))) {
        if (!window.SH_HELOC_FIELDS || !window.SH_HELOC_FIELDS.validate(form)) return;
      }

      // Structured extras: every non-contract field, machine-readable, plus UTMs.
      // See FORM_CONTRACT_ADDENDUM.md — the CRM stores these as queryable lead fields;
      // the same data also rides inside `about` as text, so nothing is lost if the
      // CRM ignores `extra` entirely.
      var extra = {};
      var skipX = { name: 1, email: 1, phone: 1, company_website: 1 };
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || skipX[el.name] || el.type === "submit" || el.disabled || ((el.type === "checkbox" || el.type === "radio") && !el.checked)) return;
        var v = (el.value || "").trim();
        if (v) extra[el.name] = v.slice(0, 300);
      });
      if (!privateContext() && Object.keys(UTMS).length) extra.utm = UTMS;
      inquiryId = inquiryId || submissionId();
      var attribution = submissionAttribution();
      extra.submission_id = inquiryId;
      if (attribution) extra.attribution = attribution;

      var payload = {
        name: nameEl.value.trim(),
        email: emailEl.value.trim(),
        phone: (form.querySelector('[name="phone"]') || { value: "" }).value.trim(),
        product: form.getAttribute("data-sh-product") || "Not sure",
        about: buildAbout(form, form.getAttribute("data-sh-about-prefix") || "", inquiryId, attribution),
        page: form.getAttribute("data-sh-form") || window.location.pathname,
        lang: form.getAttribute("data-sh-lang") || document.documentElement.lang || "en",
        token: "",
        extra: extra
      };

      inFlight = true;
      var evt = form.getAttribute("data-sh-event") || "lead";
      track("form_submit_attempted", { page: payload.page });
      var btn = form.querySelector('[type="submit"]');
      if (btn) { btn.disabled = true; btn.style.opacity = ".6"; }

      function done() {
        analyticsOnly("generate_lead", { form_id: payload.page, product: payload.product, language: payload.lang });
        // Created before delivery, preserved across fallback/manual retries,
        // and shared only as the opaque conversion ID after accepted delivery.
        var eventId = inquiryId;
        var chatGPTConversion;
        try { if (window.shChatGPTLead) chatGPTConversion = window.shChatGPTLead(eventId); } catch (e) {}
        track(evt, { page: payload.page, product: payload.product }, { eventID: eventId });
        if (form.hasAttribute("data-sh-capi")) {
          try {
            // The optional legacy relay already supports contact matching and
            // a CRM webhook. Keep new source context out of this ad integration;
            // the saved Netlify submission and its CRM relay hold the full record.
            var relayExtra = Object.assign({}, payload.extra);
            delete relayExtra.attribution;
            delete relayExtra.submission_id;
            var relayPayload = Object.assign({}, payload, { extra: relayExtra,
              about: buildAbout(form, form.getAttribute("data-sh-about-prefix") || "", "", null) });
            fetch("/.netlify/functions/lead-capi", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ event_name: evt, event_id: eventId,
                source_url: window.location.href.split(/[?#]/)[0], payload: relayPayload })
            }).catch(function () {});
          } catch (e) {}
        }
        if (thanks) Promise.resolve(chatGPTConversion).then(function () { window.location.href = thanks; });
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
        inFlight = false;
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
          : "We couldn't send your inquiry. Please try again, or email us at " + CONTACT_EMAIL + ".";
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
        nf.append("extra", JSON.stringify(payload.extra));
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
      tsToken(form).then(function (tok) {
        payload.token = tok;
        return timedFetch(INTAKE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }).then(function (r) {
        if (r && r.ok) { track("form_submit_succeeded", { page: payload.page }); done(); }
        else showError();
      }).catch(showError);
    });
    Array.prototype.forEach.call(form.querySelectorAll("input,select,textarea"), function (i) {
      i.addEventListener("input", function () { i.style.borderBottomColor = ""; i.removeAttribute('aria-invalid'); });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.forEach.call(document.querySelectorAll("form[data-sh-form]"), wireForm);

    document.addEventListener("click", function (event) {
      var a = event.target.closest && event.target.closest('a[href^="tel:"]');
      if (a) analyticsOnly("phone_click", { page_path: window.location.pathname, language: document.documentElement.lang || "en" });
    });

    /* nav scroll + mobile menu + reveal (same behavior as the rest of the site) */
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
      function setMenu(open) {
        links.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? (esNav ? "Cerrar men\u00fa" : "Close menu") : (esNav ? "Abrir men\u00fa" : "Open menu"));
      }
      toggle.addEventListener("click", function () { setMenu(!links.classList.contains("open")); });
      links.addEventListener("click", function (event) { if (event.target.closest("a")) setMenu(false); });
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && links.classList.contains("open")) { setMenu(false); toggle.focus(); }
      });
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
    Array.prototype.forEach.call(document.querySelectorAll(".reveal:not(.in)"), function (el) { io.observe(el); });
  });
})();
