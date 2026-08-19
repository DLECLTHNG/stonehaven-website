/* ============================================================
   Stonehaven — HELOC landing-page step engine (/heloc-wizard,
   /heloc-instant and /es mirrors). One question per screen,
   progress dots, geo-gate, and a single CONVERSION_MODE switch
   read from window.SH_CONFIG:
     helocConversionMode : "call" | "instant_quote"
     helocInstantQuoteUrl: redirect target in instant_quote mode
   Submission itself rides js/funnel.js (Netlify Forms + Pixel +
   CAPI/CRM relay): this file only drives the UI, fills the hidden
   form, and flips the final CTA/outcome by mode.
   Steps are declared in the page as <section class="lp-step" data-key=...>.
   ============================================================ */
(function () {
  "use strict";
  var CFG = window.SH_CONFIG || {};
  var MODE = (CFG.helocConversionMode === "instant_quote" && CFG.helocInstantQuoteUrl) ? "instant_quote" : "call";
  var LICENSED = ["GA", "AL", "TN", "FL", "NC", "SC"];
  var root = document.getElementById("lp");
  if (!root) return;
  var lang = (document.documentElement.lang || "en").slice(0, 2);
  var T = {
    en: { next: "Next", back: "Back", callCta: "Get My Callback", quoteCta: "Get My Instant Quote",
          geo: "Thank you — Stonehaven doesn't currently serve that state. Home loans are available in GA, AL, TN, FL, NC and SC.",
          need: "Please answer to continue.", phone: "Please enter a valid mobile number.", email: "Please enter a valid email.",
          stepOf: "Step {a} of {b}" },
    es: { next: "Siguiente", back: "Atrás", callCta: "Quiero mi llamada", quoteCta: "Quiero mi cotización al instante",
          geo: "Gracias — Stonehaven no atiende ese estado por ahora. Los préstamos de vivienda están disponibles en GA, AL, TN, FL, NC y SC.",
          need: "Responda para continuar.", phone: "Ingrese un número de celular válido.", email: "Ingrese un correo válido.",
          stepOf: "Paso {a} de {b}" }
  }[lang] || null;
  if (!T) T = { next: "Next" };

  var steps = Array.prototype.slice.call(root.querySelectorAll(".lp-step"));
  var form = root.querySelector("form[data-sh-form]");
  var dots = root.querySelector(".lp-progress");
  var i = 0;
  var answers = {};

  /* hidden inputs live inside the real form so funnel.js submits them */
  function setHidden(k, v) {
    var el = form.querySelector('input[type="hidden"][name="' + k + '"]');
    if (!el) { el = document.createElement("input"); el.type = "hidden"; el.name = k; form.appendChild(el); }
    el.value = v == null ? "" : String(v);
  }

  function renderDots() {
    if (!dots) return;
    dots.innerHTML = "";
    steps.forEach(function (_, n) {
      var d = document.createElement("span"); d.className = "lp-dot" + (n <= i ? " on" : ""); dots.appendChild(d);
    });
    dots.setAttribute("aria-label", T.stepOf.replace("{a}", i + 1).replace("{b}", steps.length));
  }

  function show(n) {
    i = Math.max(0, Math.min(steps.length - 1, n));
    steps.forEach(function (s, k) { s.hidden = k !== i; });
    renderDots();
    if (dots) dots.style.display = steps[i].getAttribute("data-type") === "phone" ? "none" : "";
    var first = steps[i].querySelector("input:not([type=hidden]),select,button.lp-card");
    if (first && window.innerWidth > 760) { try { first.focus({ preventScroll: true }); } catch (e) {} }
    window.scrollTo({ top: 0, behavior: "smooth" });
    try { window.shTrack && window.shTrack("lp_step", { page: form.getAttribute("data-sh-form"), step: steps[i].getAttribute("data-key"), n: i + 1 }); } catch (e) {}
  }

  function err(step, msg) {
    var e = step.querySelector(".lp-err"); if (!e) return;
    e.textContent = msg || ""; e.hidden = !msg;
  }

  /* validate + collect current step; returns true if ok */
  function collect(step) {
    var key = step.getAttribute("data-key");
    var type = step.getAttribute("data-type");
    err(step, "");
    if (type === "cards") {
      var sel = step.querySelector(".lp-card.on");
      if (!sel) { err(step, T.need); return false; }
      answers[key] = sel.getAttribute("data-value"); setHidden(key, answers[key]); return true;
    }
    if (type === "money") {
      var inp = step.querySelector("input"); var v = (inp.value || "").replace(/[^\d]/g, "");
      if (!v || +v < 10000) { err(step, T.need); return false; }
      answers[key] = v; setHidden(key, v); return true;
    }
    if (type === "state") {
      var s = step.querySelector("select"); var st = s.value;
      if (!st) { err(step, T.need); return false; }
      answers[key] = st; setHidden(key, st);
      if (LICENSED.indexOf(st) < 0) { err(step, T.geo); step.classList.add("geo-blocked"); return false; }
      step.classList.remove("geo-blocked"); return true;
    }
    if (type === "phone") {
      var p = step.querySelector('input[name="phone"]');
      if (p.value.replace(/\D/g, "").length < 10) { err(step, T.phone); return false; }
      answers.phone = p.value; return true;
    }
    if (type === "contact") {
      var ok = true;
      var n = step.querySelector('input[name="name"]'), e = step.querySelector('input[name="email"]'), ph = step.querySelector('input[name="phone"]');
      if (n && !n.value.trim()) ok = false;
      if (e && !/.+@.+\..+/.test(e.value.trim())) { err(step, T.email); ok = false; }
      if (ph && ph.value.replace(/\D/g, "").length < 10) { err(step, T.phone); ok = false; }
      if (!ok && !step.querySelector(".lp-err").textContent) err(step, T.need);
      return ok;
    }
    return true;
  }

  /* ---------- mode switch: final CTA + outcome ---------- */
  var finalBtn = form.querySelector('button[type="submit"]');
  var utms = {};
  try { utms = JSON.parse(sessionStorage.getItem("sh_utms") || "{}"); } catch (e) {}
  function applyMode() {
    if (!finalBtn) return;
    var label = MODE === "instant_quote" ? T.quoteCta : T.callCta;
    finalBtn.textContent = label;
    /* phone-first variant: the first-screen button carries the same CTA label */
    var firstCta = root.querySelector('.lp-step[data-type="phone"] .lp-next');
    if (firstCta) firstCta.textContent = label;
    root.setAttribute("data-mode", MODE);
    if (MODE === "instant_quote") {
      form.setAttribute("data-sh-event", "submit_application");
      /* funnel.js redirects to data-sh-thanks after an accepted submit.
         We point it at the quote flow with everything entered so far. */
      var url = CFG.helocInstantQuoteUrl;
      var u; try { u = new URL(url, window.location.origin); } catch (e) { u = null; }
      if (u) {
        var q = Object.assign({}, utms, answers);
        Array.prototype.forEach.call(form.querySelectorAll('input[type="hidden"]'), function (h) {
          if (h.name && h.value && h.name !== "form-name" && h.name !== "company_website") q[h.name] = h.value;
        });
        ["name", "email", "phone"].forEach(function (k) { var el = form.querySelector('[name="' + k + '"]'); if (el && el.value) q[k] = el.value; });
        Object.keys(q).forEach(function (k) { if (q[k]) u.searchParams.set(k, q[k]); });
        u.searchParams.set("src", "stonehaven-" + form.getAttribute("data-sh-form"));
        form.setAttribute("data-sh-thanks", u.toString());
      }
    } else {
      form.setAttribute("data-sh-event", "heloc_callback");
      form.removeAttribute("data-sh-thanks"); /* in-page confirmation */
    }
  }

  /* ---------- wiring ---------- */
  steps.forEach(function (step, n) {
    var next = step.querySelector(".lp-next");
    Array.prototype.forEach.call(step.querySelectorAll(".lp-card"), function (c) {
      c.addEventListener("click", function () {
        Array.prototype.forEach.call(step.querySelectorAll(".lp-card"), function (x) { x.classList.remove("on"); x.setAttribute("aria-pressed", "false"); });
        c.classList.add("on"); c.setAttribute("aria-pressed", "true");
        if (collect(step)) show(n + 1); /* cards advance on tap */
      });
    });
    var money = step.querySelector('input[data-money]');
    if (money) money.addEventListener("input", function () {
      var v = money.value.replace(/[^\d]/g, ""); money.value = v ? "$" + (+v).toLocaleString("en-US") : "";
    });
    var sel = step.querySelector("select");
    if (sel) sel.addEventListener("change", function () { collect(step); });
    if (next) next.addEventListener("click", function () { if (collect(step)) show(n + 1); });
    var back = step.querySelector(".lp-back");
    if (back) back.addEventListener("click", function () { show(n - 1); });
    step.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.tagName !== "BUTTON" && next) { e.preventDefault(); next.click(); } });
  });

  /* final submit: validate last step, refresh mode URL with final values,
     then hand off to funnel.js (its own submit listener does the POST,
     Pixel + CAPI event with shared event_id, and the redirect/confirmation). */
  form.addEventListener("submit", function (e) {
    var last = steps[steps.length - 1];
    if (!collect(last)) { e.preventDefault(); e.stopImmediatePropagation(); return; }
    /* geo safety: never submit an unlicensed state */
    if (answers.state && LICENSED.indexOf(answers.state) < 0) { e.preventDefault(); e.stopImmediatePropagation(); show(steps.findIndex(function (s) { return s.getAttribute("data-key") === "state"; })); return; }
    setHidden("conversion_mode", MODE);
    setHidden("lp_variant", form.getAttribute("data-sh-form"));
    applyMode();
  }, true); /* capture: runs before funnel.js's bubble listener */

  applyMode();
  show(0);
  /* phone-first variant: pre-fill the hidden phone for contact step */
  var firstPhone = root.querySelector('.lp-step[data-type="phone"] input[name="phone"]');
  var contactPhone = root.querySelector('.lp-step[data-type="contact"] input[name="phone"]');
  if (firstPhone && contactPhone) firstPhone.addEventListener("input", function () { contactPhone.value = firstPhone.value; });
})();
