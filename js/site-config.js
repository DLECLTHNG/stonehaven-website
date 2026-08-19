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
  ga4Id: "G-69X0CPMGJP",  /* GA4, set 2026-08-10 */
  metaPixelId: "4039555362846500",  /* Meta Pixel, set 2026-07-31 */

  /* Verified contact channels. phone MUST stay empty until a real,
     verified business number exists — empty hides phone UI entirely. */
  phone: "+14709704979",  /* verified business line, set 2026-08-17 */
  phoneDisplay: "(470) 970-4979",
  email: "office@stonehavencre.com",

  /* Google Calendar booking page ("DISCUSS MY DEAL", 15 min). */
  bookingUrl: "https://calendar.app.google/1pTBR6R4ho6jDvKE6",

  /* HELOC destination (pending owner decision: branded application
     link vs calendar booking). While empty, /heloc CTAs point to the
     on-page specialist form and /book. Setting a URL flips both
     buttons to "Start my application" automatically. */
  helocApplyUrl: "",

  /* HELOC landing pages (/heloc-wizard, /heloc-instant + /es mirrors).
     THE ONE SWITCH: "call" (default) = callback flow, CTA "Get My Callback",
     lead -> Netlify Forms + CRM webhook + Meta Lead event.
     "instant_quote" = CTA "Get My Instant Quote"; lead is still captured, then
     the visitor is redirected to helocInstantQuoteUrl with what they entered
     appended as URL params (goal, home_value, mortgage_balance, state,
     owner_occupied, name, phone, email + UTMs). Meta event: SubmitApplication.
     Nothing else on the pages changes between modes. */
  helocConversionMode: "call",
  helocInstantQuoteUrl: "",

  /* Network behavior for form delivery */
  submitTimeoutMs: 15000
};
