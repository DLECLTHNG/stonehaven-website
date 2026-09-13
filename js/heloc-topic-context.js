/* Carry only an allowlisted public article slug. No storage or network calls. */
(function () {
  'use strict';
  var root = document.documentElement;
  var allowed = (root.getAttribute('data-heloc-topics') || '').split(',').filter(Boolean);
  var topic = root.getAttribute('data-heloc-article') || new URLSearchParams(window.location.search).get('article_topic');
  if (!topic || !allowed.includes(topic)) return;
  document.querySelectorAll('a[href]').forEach(function (link) {
    var url = new URL(link.getAttribute('href'), window.location.href);
    if (url.origin !== window.location.origin || !/^\/(?:es\/)?(?:heloc(?:\/[^/]+)?|heloc-planning-tools)$/.test(url.pathname)) return;
    url.searchParams.set('article_topic', topic);
    link.setAttribute('href', url.pathname + url.search + url.hash);
  });
  document.querySelectorAll('form[data-sh-form]').forEach(function (form) {
    var input = form.querySelector('[name="article_topic"]');
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'article_topic';
      form.appendChild(input);
    }
    input.value = topic;
  });
})();
