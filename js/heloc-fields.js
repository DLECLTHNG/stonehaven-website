/* Shared HELOC inquiry requirements, used by forms and step-by-step flows. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SH_HELOC_FIELDS = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var keys = ['home_value', 'mortgage_balance', 'requested_amount'];
  var minimumRequested = 50000;
  var minimumCreditScore = 640;
  var creditKeys = ['credit_band', 'credit_band_pick', 'credit_score', 'credit', 'fico'];
  function creditEligible(raw) {
    if (typeof raw !== 'string' && typeof raw !== 'number') return false;
    var value = String(raw == null ? '' : raw).trim();
    var single = /^(\d{3})(\+)?$/.exec(value);
    if (single) return Number(single[1]) >= minimumCreditScore && Number(single[1]) <= 850;
    var range = /^(\d{3})\s*[-\u2013\u2014]\s*(\d{3})$/.exec(value);
    return !!range && Math.min(Number(range[1]), Number(range[2])) >= minimumCreditScore && Math.max(Number(range[1]), Number(range[2])) <= 850;
  }
  function amount(raw, allowZero) {
    if (typeof raw !== 'string' && typeof raw !== 'number') return null;
    var value = String(raw == null ? '' : raw).trim().replace(/^\$\s*/, '');
    if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(value)) return null;
    var n = Number(value.replace(/,/g, ''));
    return Number.isFinite(n) && n <= Number.MAX_SAFE_INTEGER && (allowZero ? n >= 0 : n > 0) ? n : null;
  }
  function quoteDestination(raw, origin, page) {
    if (!raw) return null;
    try {
      var u = new URL(raw, origin);
      if (u.protocol !== 'https:' || u.username || u.password) return null;
      u.search = ''; u.hash = '';
      u.searchParams.set('src', 'stonehaven-' + page);
      return u.toString();
    } catch (e) { return null; }
  }
  function applies(form) {
    var goal = form.querySelector('[name="goal"]');
    return /^heloc-/.test(form.getAttribute('data-sh-form') || '') || !!(goal && /HELOC/i.test(goal.value));
  }
  function validate(form) {
    var es = (form.getAttribute('data-sh-lang') || document.documentElement.lang || 'en').indexOf('es') === 0;
    var error = es ? 'Ingrese el valor estimado de su casa, el saldo de la hipoteca (0 si está pagada) y el monto que desea solicitar.' : 'Enter your estimated home value, mortgage balance (0 if paid off), and the amount you want to borrow.';
    var invalid = keys.map(function (key) {
      var el = form.querySelector('[name="' + key + '"]');
      var value = el ? amount(el.value, key === 'mortgage_balance') : null;
      return value === null || (key === 'requested_amount' && value < minimumRequested) ? { key: key, el: el } : null;
    }).filter(Boolean);
    if (!invalid.length) error = '';
    if (invalid.some(function (item) { return item.key === 'requested_amount'; })) error += es ? ' El monto mínimo de una solicitud HELOC es $50,000.' : ' The minimum HELOC request is $50,000.';
    var creditFields = creditKeys.map(function (key) { return form.querySelector('[name="' + key + '"]'); }).filter(function (el) { return el && !el.disabled; });
    var invalidCredit = creditFields.filter(function (el) { return !creditEligible(el.value); });
    if (!creditFields.length || invalidCredit.length) {
      invalid.push({ key: 'credit_band', el: invalidCredit[0] || null });
      error += (error ? ' ' : '') + (es ? 'Seleccione un puntaje de crédito estimado de 640 o más para una solicitud HELOC.' : 'Select an estimated credit score of 640 or higher for a HELOC inquiry.');
    }
    var box = form.querySelector('.heloc-amount-error');
    if (!invalid.length) { if (box) box.remove(); return true; }
    if (!box) { box = document.createElement('p'); box.className = 'heloc-amount-error'; box.setAttribute('role', 'alert'); form.appendChild(box); }
    box.textContent = error;
    var first = invalid[0].el;
    if (first && first.type !== 'hidden') { first.focus(); first.setCustomValidity(error); first.reportValidity(); first.addEventListener('input', function clear() { first.setCustomValidity(''); first.removeEventListener('input', clear); }); }
    return false;
  }
  return { keys: keys, minimumRequested: minimumRequested, minimumCreditScore: minimumCreditScore, creditEligible: creditEligible, amount: amount, validate: validate, applies: applies, quoteDestination: quoteDestination };
});
