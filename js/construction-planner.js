(function () {
  'use strict';
  var panel = document.getElementById('construction-planner');
  if (!panel || !window.SH_CONSTRUCTION) return;
  var es = document.documentElement.lang === 'es', used = false;
  var fields = ['land', 'payoff', 'hard', 'soft', 'contingency', 'finance', 'excluded', 'value', 'ltc', 'ltv'];
  var money = new Intl.NumberFormat(es ? 'es-US' : 'en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0});
  function node(id) { return document.getElementById('cp-' + id); }
  function show(id, value) { node(id).textContent = value; }
  var include = document.getElementById('include-estimate');
  var summary = document.getElementById('estimate-summary');
  var preview = document.getElementById('estimate-preview');
  function updateShare(result, inputs) {
    if (!include) return;
    if (!result) include.checked = false;
    document.getElementById('estimate-choice').hidden = !result;
    preview.hidden = !include.checked;
    summary.disabled = !include.checked;
    summary.value = '';
    if (!include.checked) return;
    var figures = [
      [es ? 'Terreno' : 'Land', node('mode').selectedOptions[0].textContent],
      [es ? 'Base del terreno' : 'Land basis', money.format(inputs.land)],
      [es ? 'Deuda existente' : 'Payoff', money.format(inputs.payoff)],
      [es ? 'Costo elegible modelado' : 'Modeled eligible cost', money.format(result.cost)],
      [es ? 'Valor terminado' : 'Completed value', money.format(inputs.value)],
      [es ? 'Préstamo estimado' : 'Modeled loan', money.format(result.loan)],
      [es ? 'Capital faltante' : 'Funding gap', money.format(result.gap)]
    ];
    summary.value = figures.map(function (item) { return item.join(': '); }).join(' · ');
  }
  function calc(event) {
    var p = {mode: node('mode').value};
    fields.forEach(function (key) {
      var input = node(key); p[key] = input.value.trim() === '' ? NaN : Number(input.value);
    });
    node('payoff-field').hidden = p.mode !== 'owned';
    node('payoff').disabled = p.mode !== 'owned';
    if (p.mode !== 'owned') p.payoff = 0;
    var result = window.SH_CONSTRUCTION.size(p);
    node('results').hidden = !result;
    node('stress').hidden = !result;
    node('error').hidden = !!result;
    updateShare(result, p);
    if (!result) return;
    ['cost', 'remaining', 'need', 'byCost', 'byValue', 'loan', 'gap', 'landEquity'].forEach(function (key) { show(key, money.format(result[key])); });
    node('land-equity-row').hidden = p.mode !== 'owned';
    show('actual-ratios', result.ltc.toFixed(1) + '% LTC / ' + result.ltv.toFixed(1) + '% LTV');
    var labels = es ? {cost:'El límite sobre costo determina el resultado.', value:'El límite sobre valor terminado determina el resultado.', need:'El resultado se limita a los usos pendientes. No se calcula retiro de efectivo.'} : {cost:'The cost limit sets this result.', value:'The completed-value limit sets this result.', need:'The result is capped at remaining uses. Cash-out is not modeled.'};
    show('binding', labels[result.binding]);
    [[0,0], [0.1,0], [0,0.1], [0.1,0.1]].forEach(function (change, i) {
      var row = window.SH_CONSTRUCTION.stress(p, change[0], change[1]);
      show('stress-loan-' + i, money.format(row.loan)); show('stress-gap-' + i, money.format(row.gap));
    });
    // Only a generic, consent-aware engagement event. No entered amounts,
    // contact data, query strings, storage or automatic lead transmission.
    if (event && event.isTrusted && !used && typeof window.shTrack === 'function') {
      used = true; window.shTrack('calc_used', {page:'construction-loan-calculator'});
    }
  }
  panel.querySelectorAll('input,select').forEach(function (input) { input.addEventListener('input', calc); input.addEventListener('change', calc); });
  if (include) include.addEventListener('change', function () { calc(); });
  var example = new URLSearchParams(window.location.search).get('example');
  if (example === 'owned-land') {
    var owned = {land:600000, payoff:200000, hard:1050000, soft:200000, contingency:100000,
      finance:50000, excluded:0, value:3000000, ltc:80, ltv:65};
    fields.forEach(function (key) { node(key).value = owned[key]; });
    node('mode').value = 'owned';
    node('preset').hidden = false;
    node('defaults').addEventListener('click', function () {
      fields.forEach(function (key) { node(key).value = node(key).defaultValue; });
      node('mode').value = 'owned';
      node('preset').hidden = true;
      node('mode').focus();
      var url = new URL(window.location.href);
      url.searchParams.delete('example');
      url.searchParams.set('guide', 'owned-land');
      window.history.replaceState(null, '', url);
      document.querySelectorAll('a.lang-opt').forEach(function (link) {
        var destination = new URL(link.href);
        destination.searchParams.delete('example');
        if (navigator.globalPrivacyControl !== true) destination.searchParams.set('guide', 'owned-land');
        link.href = destination.pathname + destination.search + destination.hash;
      });
      calc();
    });
  }
  calc();
})();
