/* ChatGPT Ads: public pixel bootstrap. Conversion callers provide only an
   opaque event ID after accepted delivery. Never pass the lead payload here. */
(function () {
  "use strict";
  var body = document.body;
  if (!body || body.getAttribute("data-fo-sensitive") === "1" ||
      body.getAttribute("data-fo-kind") === "confirm" ||
      (navigator.globalPrivacyControl === true)) return;
  if (window.shChatGPTPixelInitialized) return;
  window.shChatGPTPixelInitialized = true;
  var pixelId = "Borm2tgLusLoFUMCjgiriD";
  var ready;
  var loaded = new Promise(function (resolve) { ready = resolve; });
  var sent = new Set();
  if (!window.oaiq) {
    var q = function () { q.q.push(arguments); };
    q.q = [];
    window.oaiq = q;
    var sdk = document.createElement("script");
    sdk.async = true;
    sdk.src = "https://bzrcdn.openai.com/sdk/oaiq.min.js";
    sdk.onload = ready;
    sdk.onerror = ready;
    document.head.appendChild(sdk);
  } else { ready(); }
  window.oaiq("init", { pixelId: pixelId, debug: false });
  window.oaiq("measure", "page_viewed", { type: "contents" });
  window.shChatGPTLead = function (eventId) {
    if (!eventId || sent.has(eventId)) return Promise.resolve();
    sent.add(eventId);
    try {
      window.oaiq("measure", "lead_created", { type: "customer_action" }, { event_id: eventId });
    } catch (e) { return Promise.resolve(); }
    // Give a still-loading SDK a bounded chance to consume its queue before
    // a thank-you redirect. Its pagehide handler flushes using beacon.
    return Promise.race([loaded, new Promise(function (resolve) { setTimeout(resolve, 1000); })]);
  };
  (window.shChatGPTPending || []).forEach(function (entry) {
    window.shChatGPTLead(entry.id).then(entry.resolve);
  });
  window.shChatGPTPending = [];
})();
