/* ============================================================
   Stonehaven - HELOC persona landing pages (/heloc/<slug>).
   One engine for all 16 pages. Each page embeds its two intent
   content variants as JSON in #sh-persona-content; this file:
     - resolves ?intent=renovation|consolidation (default renovation)
     - renders the selected variant into [data-pi] slots
     - powers the visible intent switch WITHOUT touching form input
     - syncs the intake "purpose" select and hidden marketing context
     - geo message for states outside GA/AL/TN/FL/NC/SC
     - analytics via window.shTrack (funnel.js): persona_view,
       intent_change, cta_click, form_start. The submission event
       itself stays with funnel.js (fires only on accepted submits).
   Pure helpers are exported for tests (UMD).
   ============================================================ */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SH_PERSONA = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var INTENTS = ["renovation", "consolidation"];
  var LICENSED = ["GA", "AL", "TN", "FL", "NC", "SC"];

  /* ?intent= parsing: unknown/missing values fall back to renovation. */
  function parseIntent(search) {
    try {
      var m = /[?&]intent=([^&#]*)/.exec(search || "");
      var v = m ? decodeURIComponent(m[1]).toLowerCase() : "";
      return INTENTS.indexOf(v) >= 0 ? v : "renovation";
    } catch (e) { return "renovation"; }
  }

  /* Replace ?intent= in a search string without disturbing other params. */
  function withIntent(search, intent) {
    var s = (search || "").replace(/^\?/, "");
    var parts = s ? s.split("&").filter(function (p) { return p && p.indexOf("intent=") !== 0; }) : [];
    parts.push("intent=" + intent);
    return "?" + parts.join("&");
  }

  function isLicensed(st) { return LICENSED.indexOf(st) >= 0; }

  /* ---------------- DOM wiring (no-op under tests) ---------------- */
  function boot() {
    if (typeof document === "undefined") return;
    var cfgEl = document.getElementById("sh-persona-content");
    if (!cfgEl) return;
    var CFG;
    try { CFG = JSON.parse(cfgEl.textContent); } catch (e) { return; }
    var persona = CFG.persona;
    var intent = parseIntent(window.location.search);

    function track(ev, extra) {
      try {
        var p = { page: "heloc-" + persona, persona: persona, intent: intent };
        if (extra) for (var k in extra) p[k] = extra[k];
        window.shTrack && window.shTrack(ev, p);
      } catch (e) {}
    }

    function setHidden(name, value) {
      var form = document.querySelector("form[data-sh-form]");
      if (!form) return;
      var el = form.querySelector('input[type="hidden"][name="' + name + '"]');
      if (!el) { el = document.createElement("input"); el.type = "hidden"; el.name = name; form.appendChild(el); }
      el.value = value;
    }

    function apply() {
      var c = CFG.intents[intent];
      if (!c) return;
      /* text slots: <el data-pi="key"> gets c[key] (HTML allowed from our
         own build config only - never from user input) */
      var nodes = document.querySelectorAll("[data-pi]");
      Array.prototype.forEach.call(nodes, function (el) {
        var key = el.getAttribute("data-pi");
        if (c[key] != null) el.innerHTML = c[key];
      });
      /* visuals: show the block matching the intent */
      Array.prototype.forEach.call(document.querySelectorAll("[data-pi-visual]"), function (el) {
        el.hidden = el.getAttribute("data-pi-visual") !== intent;
      });
      /* FAQ list */
      var faqHost = document.getElementById("pi-faqs");
      if (faqHost && c.faqs) {
        faqHost.innerHTML = c.faqs.map(function (f) {
          var tag = f.review ? '<p class="pi-review">' + CFG.reviewNote + "</p>" : "";
          return '<details class="faq-item"><summary class="faq-q">' + f.q + '</summary><div class="faq-a"><p>' + f.a + "</p>" + tag + "</div></details>";
        }).join("");
      }
      /* intake purpose select follows the intent, but a purpose the
         visitor picked by hand is left alone */
      var purpose = document.getElementById("pi-purpose");
      if (purpose && !purpose.getAttribute("data-user-set")) purpose.value = c.purpose;
      /* switch buttons */
      Array.prototype.forEach.call(document.querySelectorAll("[data-intent-btn]"), function (b) {
        var on = b.getAttribute("data-intent-btn") === intent;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      /* marketing context rides as hidden fields (never in the URL of
         analytics payloads, never PII) */
      setHidden("persona", persona);
      setHidden("intent", intent);
      setHidden("lp_variant", "heloc-persona");
      document.title = c.docTitle || document.title;
    }

    function setIntent(next, viaControl) {
      if (INTENTS.indexOf(next) < 0 || next === intent) return;
      intent = next;
      apply();
      try { history.replaceState(null, "", withIntent(window.location.search, intent) + window.location.hash); } catch (e) {}
      if (viaControl) track("intent_change", { to: next });
    }

    Array.prototype.forEach.call(document.querySelectorAll("[data-intent-btn]"), function (b) {
      b.addEventListener("click", function () { setIntent(b.getAttribute("data-intent-btn"), true); });
    });

    /* purpose select: remember a manual choice */
    var purposeSel = document.getElementById("pi-purpose");
    if (purposeSel) purposeSel.addEventListener("change", function () { purposeSel.setAttribute("data-user-set", "1"); });

    /* geo message: outside the six licensed states we say so plainly
       and hold the submit */
    var stateSel = document.getElementById("pi-state");
    var geoMsg = document.getElementById("pi-geo");
    var submitBtn = document.querySelector("form[data-sh-form] [type=submit]");
    if (stateSel && geoMsg) {
      stateSel.addEventListener("change", function () {
        var bad = stateSel.value && !isLicensed(stateSel.value);
        geoMsg.hidden = !bad;
        if (submitBtn) submitBtn.disabled = !!bad;
      });
    }

    /* analytics: view, first interaction, CTA clicks */
    track("persona_view");
    var fired = false;
    Array.prototype.forEach.call(document.querySelectorAll("form[data-sh-form] input, form[data-sh-form] select"), function (el) {
      el.addEventListener("input", function () { if (!fired) { fired = true; track("form_start"); } });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-cta]"), function (a) {
      a.addEventListener("click", function () { track("cta_click", { cta: a.getAttribute("data-cta") }); });
    });

    apply();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }

  return { parseIntent: parseIntent, withIntent: withIntent, isLicensed: isLicensed, INTENTS: INTENTS, LICENSED: LICENSED };
});
