/* ============================================================
   Stonehaven — central site configuration (single place to edit).
   Loaded BEFORE js/funnel.js on every page. Nothing here is secret:
   these are public identifiers only. Leave a value empty ("") and the
   dependent feature stays safely disabled — analytics fail silent,
   phone CTAs stay hidden, submissions fall back to Netlify Forms.
   ============================================================ */
window.SH_CONFIG = {
  /* CRM intake endpoint (POST, JSON per WEBSITE_FORM_CONTRACT.md).
     Empty = capture via Netlify Forms. */
  intakeEndpoint: "",

  /* Analytics — public measurement IDs. Empty = tag never loads. */
  ga4Id: "",           /* e.g. "G-XXXXXXXXXX" */
  metaPixelId: "",     /* e.g. "1234567890" */

  /* Verified contact channels. phone MUST stay empty until a real,
     verified business number exists — empty hides phone UI entirely. */
  phone: "",           /* e.g. "+15551234567" (E.164, verified only) */
  phoneDisplay: "",    /* e.g. "+1 (555) 123-4567" */
  email: "office@stonehavencre.com",

  /* Network behavior for form delivery */
  submitTimeoutMs: 15000
};
