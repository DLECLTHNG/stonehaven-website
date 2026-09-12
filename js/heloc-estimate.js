/* Illustrative HELOC headroom. User edits carry forward without replacing form edits. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var es = document.documentElement.lang === 'es';
  var tracked = false;
  var pairs = [['e-value', 'cb-value'], ['e-balance', 'cb-balance'], ['e-request', 'cb-amount']];
  function number(id) {
    var value = $(id).value.trim();
    return value === '' ? NaN : Number(value);
  }
  function money(n) { return '$' + Math.round(n).toLocaleString(es ? 'es-US' : 'en-US'); }
  function update(event) {
    var value = number('e-value'), balance = number('e-balance'), request = number('e-request');
    var form = document.querySelector('form[data-sh-form="heloc-callback"]');
    if (form) form.removeAttribute('data-sh-about-prefix');
    if (event) pairs.forEach(function (pair) {
      var source = $(pair[0]), target = $(pair[1]);
      if (target && !target.dataset.touched) target.value = source.value;
    });
    var valid = Number.isFinite(value) && value > 0 && Number.isFinite(balance) && balance >= 0;
    var requestValid = Number.isFinite(request) && request > 0;
    if (!valid) {
      $('e-range').textContent = '-';
      $('e-verdict').textContent = es ? 'Revise los datos' : 'Check your figures';
      $('e-note').textContent = es ? 'Indique un valor mayor que cero y un saldo de cero o más.' : 'Enter a home value above zero and a mortgage balance of zero or more.';
      $('e-request-note').textContent = '';
      if (form) form.removeAttribute('data-sh-about-prefix');
      return;
    }
    var lo = window.SH_HELOC.availableEquity(value, balance, 80);
    var hi = window.SH_HELOC.availableEquity(value, balance, 90);
    $('e-range').textContent = money(lo.available) + ' - ' + money(hi.available);
    $('e-verdict').textContent = es ? 'margen ilustrativo, no aprobación' : 'illustrative headroom, not approval';
    $('e-note').textContent = es ? 'Supuestos del 80% y 90% de préstamo-valor combinado, antes de otros gravámenes y costos. No son límites ofrecidos.' : 'Assumes 80% and 90% combined loan-to-value caps, before other liens and costs. These are not offered limits.';
    $('e-request-note').textContent = requestValid
      ? (es ? 'Saldo más solicitud: ' : 'Mortgage plus request: ') + money(balance + request) + '. ' + (es ? 'La elegibilidad requiere revisión del prestamista.' : 'Eligibility requires lender review.')
      : (es ? 'Añada el monto que desea solicitar para preparar su consulta.' : 'Add the amount you want to request to prepare your inquiry.');
    if (event) {
      if (!tracked && window.shTrack) { tracked = true; window.shTrack('calc_used', { page: es ? 'heloc-es' : 'heloc' }); }
    }
  }
  if (!$('e-request') || !window.SH_HELOC) return;
  pairs.forEach(function (pair) {
    $(pair[0]).addEventListener('input', update);
    var target = $(pair[1]);
    if (target) target.addEventListener('input', function () { target.dataset.touched = '1'; });
  });
  update();
})();
