/* Let homepage content finish its initial load before fetching marketing SDKs.
   Vendor queues are initialized normally, so early events retain their order.
   User interaction or a conversion can flush the queue immediately. */
(function () {
  'use strict';
  var pending = [];
  var started = false;
  function flush() {
    if (started) return;
    started = true;
    pending.splice(0).forEach(function (script) { document.head.appendChild(script); });
    window.removeEventListener('pointerdown', flush);
    window.removeEventListener('keydown', flush);
    window.removeEventListener('pagehide', flush);
  }
  window.shLoadMarketingScript = function (script) {
    script.fetchPriority = 'low';
    if (started) document.head.appendChild(script);
    else pending.push(script);
  };
  window.shFlushMarketingScripts = flush;
  function afterLoad() {
    if (document.hidden || typeof window.requestAnimationFrame !== 'function') flush();
    else window.requestAnimationFrame(function () { window.requestAnimationFrame(flush); });
  }
  if (document.readyState === 'complete') afterLoad();
  else window.addEventListener('load', afterLoad, { once: true });
  window.addEventListener('pointerdown', flush, { once: true, passive: true });
  window.addEventListener('keydown', flush, { once: true });
  window.addEventListener('pagehide', flush, { once: true });
})();
