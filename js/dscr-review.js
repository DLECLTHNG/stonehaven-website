/* ============================================================
   Stonehaven — DSCR Deal Review (dscr-review.html)
   Loads AFTER js/funnel.js (which owns submission + analytics stubs).

   Owns: the two-view deal calculator (lender / investor), the
   prepayment explainer, the six-step progressive form, internal
   lead classification, and the summary handoff to the thanks page.

   Nothing here stores credit or financial details in localStorage —
   step progress persists only non-sensitive property fields, and the
   full summary rides in sessionStorage for the confirmation page only.
   ============================================================ */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var ES = (document.documentElement.lang || "en").toLowerCase().indexOf("es") === 0;
  var T = ES ? {
    strong: "El ratio suele abrir m\u00e1s opciones",
    workable: "El ratio puede encajar en algunos programas - la estructura importa",
    short: "Debajo de 1.0x con estos t\u00e9rminos - requiere revisi\u00f3n de estructura",
    io: " (solo inter\u00e9s)",
    ppAfter: "$0 - la salida cae despu\u00e9s del periodo de penalidad",
    ppYear: function (pct, yr) { return "  (" + pct + "% del saldo en el a\u00f1o " + yr + ")"; },
    ppEnter: "Ingrese un saldo y un a\u00f1o de salida estimado.",
    ppInside: function (h) { return "Su periodo de tenencia de " + h + " a\u00f1o(s) cae dentro de este periodo ilustrativo de penalidad - vale la pena evaluarlo contra la estructura antes de comprometerse."; },
    ppVaries: "Estructuras ilustrativas. Los t\u00e9rminos reales var\u00edan por prestamista y estado - algunos estados restringen ciertas penalidades. Los documentos finales del pr\u00e9stamo prevalecen."
  } : {
    strong: "Ratio typically opens broader options",
    workable: "Ratio may fit some programs - structure matters",
    short: "Below 1.0x at these terms - structure review needed",
    io: " (interest-only)",
    ppAfter: "$0 - exit falls after the penalty period",
    ppYear: function (pct, yr) { return "  (" + pct + "% of balance in year " + yr + ")"; },
    ppEnter: "Enter a balance and an expected exit year.",
    ppInside: function (h) { return "Your planned hold of " + h + " year(s) sits inside this illustrative penalty period - worth weighing against the structure before you commit."; },
    ppVaries: "Illustrative structures only. Actual prepayment terms vary by lender and state - some states restrict certain penalties. Final loan documents control."
  };
  var track = function (ev, params) { try { if (window.shTrack) window.shTrack(ev, params || {}); } catch (e) {} };
  var money = function (n) { return "$" + Math.round(n).toLocaleString("en-US"); };

  /* ---------- calculator ---------- */
  var CALC_IDS = ["k-price", "k-loan", "k-rate", "k-amort", "k-io", "k-rent", "k-tax", "k-ins", "k-hoa", "k-vac", "k-mgmt", "k-maint", "k-capex"];
  var calcStarted = false, calcCompleted = false;

  function num(id) { var el = $(id); return el ? (+el.value || 0) : 0; }

  function pAndI(loan, annualRatePct, amortYears, io) {
    var i = annualRatePct / 100 / 12;
    if (io) return loan * i;
    var n = amortYears * 12;
    if (i <= 0 || n <= 0) return 0;
    return loan * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1);
  }

  function calc() {
    var price = num("k-price"), loan = num("k-loan"), rate = num("k-rate"),
        amort = num("k-amort") || 30, io = $("k-io") && $("k-io").checked,
        rent = num("k-rent"), tax = num("k-tax"), ins = num("k-ins"), hoa = num("k-hoa"),
        vac = num("k-vac") / 100, mgmt = num("k-mgmt") / 100,
        maint = num("k-maint") / 100, capex = num("k-capex") / 100;

    if (!calcStarted && (price || rent)) { calcStarted = true; track("calc_started", { page: "dscr-review" }); }

    var out = {
      ltv: $("o-ltv"), pi: $("o-pi"), pitia: $("o-pitia"), ldscr: $("o-ldscr"), lVerdict: $("o-lverdict"),
      egi: $("o-egi"), opex: $("o-opex"), noi: $("o-noi"), ds: $("o-ds"), idscr: $("o-idscr"),
      cash: $("o-cash"), be: $("o-be"), ratio: $("o-ratio")
    };
    var ready = price > 0 && loan > 0 && rate > 0 && rent > 0 && loan < price * 1.5;
    if (!ready) {
      ["ltv","pi","pitia","ldscr","egi","opex","noi","ds","idscr","cash","be"].forEach(function (k) { if (out[k]) out[k].textContent = "-"; });
      if (out.ratio) out.ratio.innerHTML = "-<small>x</small>";
      if (out.lVerdict) { out.lVerdict.textContent = ""; out.lVerdict.className = "verdict"; }
      return null;
    }

    /* LENDER VIEW — 1–4 unit residential DSCR convention: gross rent ÷ PITIA */
    var pi = pAndI(loan, rate, amort, io);
    var tiMo = (tax + ins) / 12 + hoa;
    var pitia = pi + tiMo;
    var lenderDscr = rent / pitia;
    var ltv = loan / price * 100;

    /* INVESTOR VIEW — conservative economics: NOI ÷ annual P&I debt service */
    var egiMo = rent * (1 - vac);
    var opexMo = egiMo * mgmt + rent * (maint + capex) + tiMo; /* mgmt on collected, maint+capex on gross, plus T/I/HOA */
    var noiMo = egiMo - opexMo;
    var dsMo = pi;
    var invDscr = dsMo > 0 ? noiMo / dsMo : 0;
    var cashMo = noiMo - dsMo;
    var beOcc = rent > 0 ? Math.min(999, (opexMo + dsMo) / rent * 100) : 0;

    if (out.ratio) out.ratio.innerHTML = lenderDscr.toFixed(2) + "<small>x</small>";
    if (out.ltv) out.ltv.textContent = ltv.toFixed(1) + "% · " + money(loan);
    if (out.pi) out.pi.textContent = money(pi) + "/mo" + (io ? T.io : "");
    if (out.pitia) out.pitia.textContent = money(pitia) + "/mo";
    if (out.ldscr) out.ldscr.textContent = lenderDscr.toFixed(2) + "x";
    if (out.lVerdict) {
      out.lVerdict.className = "verdict";
      if (lenderDscr >= 1.25) { out.lVerdict.classList.add("strong"); out.lVerdict.textContent = T.strong; }
      else if (lenderDscr >= 1.0) { out.lVerdict.classList.add("workable"); out.lVerdict.textContent = T.workable; }
      else { out.lVerdict.classList.add("short"); out.lVerdict.textContent = T.short; }
    }
    if (out.egi) out.egi.textContent = money(egiMo) + "/mo";
    if (out.opex) out.opex.textContent = money(opexMo) + "/mo";
    if (out.noi) out.noi.textContent = money(noiMo) + "/mo";
    if (out.ds) out.ds.textContent = money(dsMo) + "/mo";
    if (out.idscr) out.idscr.textContent = invDscr.toFixed(2) + "x";
    if (out.cash) { out.cash.textContent = (cashMo < 0 ? "-" : "") + money(Math.abs(cashMo)) + "/mo"; out.cash.style.color = cashMo < 0 ? "#C98B85" : "#7FB394"; }
    if (out.be) out.be.textContent = beOcc.toFixed(0) + "%";

    if (!calcCompleted) { calcCompleted = true; track("calc_completed", { page: "dscr-review" }); }
    return { lenderDscr: lenderDscr, invDscr: invDscr, pitia: pitia, cashMo: cashMo, ltv: ltv, loan: loan, price: price, rent: rent };
  }

  /* ---------- prepayment explainer ---------- */
  function prepay() {
    var bal = num("pp-bal"), hold = num("pp-hold"), exitYr = num("pp-exit");
    var sel = $("pp-structure");
    var out = $("pp-out"), note = $("pp-note");
    if (!out || !sel) return;
    if (!(bal > 0) || !(exitYr > 0)) { out.textContent = "-"; if (note) note.textContent = T.ppEnter; return; }
    var structures = {
      "5-4-3-2-1": [5, 4, 3, 2, 1],
      "3-2-1": [3, 2, 1],
      "3-3-3": [3, 3, 3],
      "none": []
    };
    var steps = structures[sel.value] || [];
    var pct = exitYr <= steps.length ? steps[exitYr - 1] : 0;
    var penalty = bal * pct / 100;
    out.textContent = pct > 0 ? money(penalty) + T.ppYear(pct, exitYr) : T.ppAfter;
    if (note) note.textContent = hold && hold < steps.length && sel.value !== "none" ? T.ppInside(hold) : T.ppVaries;
  }

  /* ---------- six-step progressive form ---------- */
  var STEPS = 6, cur = 1, funnelStarted = false;
  var SAFE_SAVE = ["r-dealtype", "r-state", "r-proptype", "r-units", "r-occupancy", "r-rentmodel", "r-value", "r-rent", "r-mktrent", "r-tax", "r-ins", "r-hoa", "r-loanamt", "r-close", "r-hold", "r-goal"]; /* no credit / reserves / contact fields */

  function stepEls() { return document.querySelectorAll(".rev-step"); }
  function dots() { return document.querySelectorAll(".quiz-progress span"); }

  function show(n) {
    cur = n;
    stepEls().forEach(function (el, i) { el.classList.toggle("active", i === n - 1); });
    dots().forEach(function (d, i) { d.classList.toggle("done", i < n); });
    var back = $("rev-back"); if (back) back.style.visibility = n === 1 ? "hidden" : "visible";
    var card = $("rev-card"); if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function fieldsIn(stepEl) { return stepEl.querySelectorAll("input[name],select[name],textarea[name]"); }

  function validStep(n) {
    var el = stepEls()[n - 1]; if (!el) return true;
    var err = el.querySelector(".rev-err"); var ok = true;
    fieldsIn(el).forEach(function (f) {
      f.style.borderBottomColor = "";
      if (f.hasAttribute("required")) {
        var bad = f.type === "checkbox" ? !f.checked : !f.value.trim();
        if (!bad && f.type === "email") bad = !/.+@.+\..+/.test(f.value.trim());
        if (bad) { ok = false; f.style.borderBottomColor = "#B0413A"; }
      }
    });
    if (err) err.classList.toggle("show", !ok);
    return ok;
  }

  function saveProgress() {
    try {
      var data = {};
      SAFE_SAVE.forEach(function (id) { var el = $(id); if (el && el.value) data[id] = el.value; });
      localStorage.setItem("sh_dscr_review", JSON.stringify(data));
    } catch (e) {}
  }
  function restoreProgress() {
    try {
      var data = JSON.parse(localStorage.getItem("sh_dscr_review") || "{}");
      Object.keys(data).forEach(function (id) { var el = $(id); if (el && !el.value) el.value = data[id]; });
    } catch (e) {}
  }

  /* internal-only lead classification — travels in the payload, never shown */
  function classify() {
    var g = function (id) { var el = $(id); return el ? el.value : ""; };
    var dscrRes = calc();
    var deal = g("r-dealtype"), units = +g("r-units") || 0, close = g("r-close"),
        fico = g("r-fico"), reserves = g("r-reserves"), rentModel = g("r-rentmodel"),
        exp = g("r-exp"), credEvent = g("r-credevent"), amt = +String(g("r-loanamt")).replace(/[^0-9.]/g, "") || 0;
    if (units >= 5 || deal === "Portfolio review" || deal === "Other investor financing" || rentModel === "Short-term rental" || (dscrRes && dscrRes.lenderDscr < 1.0) || credEvent === "Yes") return "specialist-review";
    var complete = g("r-state") && g("r-value") && g("r-rent") && amt > 0;
    var urgent = close === "Under 30 days" || close === "30-60 days";
    if (complete && urgent && fico && fico !== "Below 620" && reserves !== "Under 3 months") return "priority";
    if (complete && (fico || exp)) return "standard";
    return "nurture";
  }

  function buildSummary() {
    var g = function (id) { var el = $(id); return el ? el.value : ""; };
    var res = calc();
    return {
      dealType: g("r-dealtype"), state: g("r-state"), propType: g("r-proptype"),
      units: g("r-units"), value: g("r-value"), rent: g("r-rent"),
      loanAmt: g("r-loanamt"), close: g("r-close"),
      dscr: res && isFinite(res.lenderDscr) ? res.lenderDscr.toFixed(2) : ""
    };
  }

  function init() {
    var form = $("revForm");
    if (form) {
      restoreProgress();
      show(1);

      form.addEventListener("input", function () {
        if (!funnelStarted) { funnelStarted = true; track("funnel_started", { page: "dscr-review" }); }
        saveProgress();
      });

      document.querySelectorAll(".rev-next").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (!validStep(cur)) return;
          track("funnel_step", { page: "dscr-review", step: cur });
          if (cur < STEPS) show(cur + 1);
        });
      });
      var back = $("rev-back");
      if (back) back.addEventListener("click", function () { if (cur > 1) show(cur - 1); });

      /* gate funnel.js's submit handler: document-capture runs first */
      document.addEventListener("submit", function (e) {
        if (e.target !== form) return;
        if (!validStep(STEPS)) { e.preventDefault(); e.stopImmediatePropagation(); return; }
        var cls = classify();
        form.setAttribute("data-sh-about-prefix", "[Deal Review · " + cls + "]");
        var hidden = $("r-leadclass"); if (hidden) hidden.value = cls;
        try { sessionStorage.setItem("sh_dscr_summary", JSON.stringify(buildSummary())); } catch (err) {}
        track("funnel_step", { page: "dscr-review", step: STEPS });
        try { localStorage.removeItem("sh_dscr_review"); } catch (err) {}
      }, true);
    }

    /* calculator + prepay listeners */
    CALC_IDS.forEach(function (id) { var el = $(id); if (el) el.addEventListener("input", calc); });
    var io = $("k-io"); if (io) io.addEventListener("change", calc);
    ["pp-bal", "pp-hold", "pp-exit"].forEach(function (id) { var el = $(id); if (el) el.addEventListener("input", prepay); });
    var pps = $("pp-structure"); if (pps) pps.addEventListener("change", prepay);
    calc(); prepay();

    /* lender/investor toggle */
    document.querySelectorAll(".view-toggle button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".view-toggle button").forEach(function (b) { b.setAttribute("aria-selected", b === btn ? "true" : "false"); });
        document.querySelectorAll(".view-panel").forEach(function (p) { p.classList.toggle("active", p.id === btn.getAttribute("data-view")); });
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  /* ---------- lightweight A/B (Tests 1+2: hero + CTA label) ---------- */
  window.shAb = function (test, arms) {
    try {
      var key = "sh_ab_" + test, url = new URLSearchParams(location.search).get("v");
      var arm = (url && arms.indexOf(url) > -1) ? url : localStorage.getItem(key);
      if (!arm || arms.indexOf(arm) < 0) arm = arms[Math.floor(Math.random() * arms.length)];
      localStorage.setItem(key, arm);
      track("ab_assign", { test: test, arm: arm });
      return arm;
    } catch (e) { return arms[0]; }
  };
})();
