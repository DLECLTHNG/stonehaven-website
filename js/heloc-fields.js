/* Shared HELOC amounts, used by forms and the step-by-step flows. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SH_HELOC_FIELDS = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var keys = ['home_value', 'mortgage_balance', 'requested_amount'];
  function amount(raw, allowZero) {
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
      return !el || amount(el.value, key === 'mortgage_balance') === null ? { key: key, el: el } : null;
    }).filter(Boolean);
    var box = form.querySelector('.heloc-amount-error');
    if (!invalid.length) { if (box) box.remove(); return true; }
    if (!box) { box = document.createElement('p'); box.className = 'heloc-amount-error'; box.setAttribute('role', 'alert'); form.appendChild(box); }
    box.textContent = error;
    var first = invalid[0].el;
    if (first && first.type !== 'hidden') { first.focus(); first.setCustomValidity(error); first.reportValidity(); first.addEventListener('input', function clear() { first.setCustomValidity(''); first.removeEventListener('input', clear); }); }
    return false;
  }
  return { keys: keys, amount: amount, validate: validate, applies: applies, quoteDestination: quoteDestination };
});
