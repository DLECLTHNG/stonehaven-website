(function () {
  'use strict';
  var panel = document.getElementById('lot-release-example');
  if (!panel) return;
  var es = document.documentElement.lang === 'es';
  var format = new Intl.NumberFormat(es ? 'es-US' : 'en-US', {style:'currency', currency:'USD',
    minimumFractionDigits:0, maximumFractionDigits:2});
  var inputs = Array.from(panel.querySelectorAll('input'));
  function output(key, text) { document.getElementById('lr-' + key).textContent = text; }
  function update() {
    var amounts = inputs.map(function (input) {
      var cents = Math.round(input.valueAsNumber * 100);
      return input.validity.valid && Number.isSafeInteger(cents) && cents >= 0 ? cents : NaN;
    });
    var net = amounts[0] - amounts[1] - amounts[2];
    var balance = net - amounts[3];
    var valid = Number.isSafeInteger(net) && Number.isSafeInteger(balance);
    document.getElementById('lr-results').hidden = !valid;
    document.getElementById('lr-error').hidden = valid;
    if (!valid) {
      output('error', es ? 'Ingrese cuatro importes válidos, de cero o más, con hasta dos decimales.' :
        'Enter all four amounts as zero or more, with up to two decimal places.');
      return;
    }
    output('net-label', net < 0 ? (es ? 'Efectivo necesario para cerrar la venta' : 'Cash needed to close the sale') :
      (es ? 'Efectivo después de la venta' : 'Cash left after the sale'));
    output('net', format.format(Math.abs(net) / 100));
    output('gap-label', balance < 0 ? (es ? 'Efectivo adicional para cerrar e iniciar la obra' : 'Additional cash needed to close and start') :
      (es ? 'Saldo después de financiar la próxima obra' : 'Cash left after funding the next start'));
    output('gap', format.format(Math.abs(balance) / 100));
  }
  panel.addEventListener('input', update);
  document.getElementById('lr-reset').addEventListener('click', function () {
    inputs.forEach(function (input) { input.value = input.defaultValue; });
    update();
  });
  update();
  panel.hidden = false;
  document.getElementById('lot-release-table').hidden = true;
})();
