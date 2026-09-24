// Shared by Netlify's capture guard and server-side intake/relay functions.
export const HELOC_MINIMUM = 50000;
export const HELOC_MINIMUM_CREDIT = 640;

export function validName(raw) {
  if (typeof raw !== 'string') return false;
  const value = raw.trim();
  // A zero-width or punctuation-only value can look empty in email and CRM.
  // Keep international names and mononyms, but require an actual letter.
  return value.length <= 120 && /\p{L}/u.test(value) && !/[\p{Cc}\u202a-\u202e\u2066-\u2069]/u.test(raw);
}

export function validEmail(raw) {
  if (typeof raw !== 'string' || /[\p{Cc}\p{Cf}]/u.test(raw)) return false;
  const value = raw.trim(), parts = value.split('@');
  if (value.length > 254 || parts.length !== 2 || parts[0].length > 64 ||
      !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(parts[0]) || /^\.|\.$|\.\./.test(parts[0])) return false;
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(parts[1]);
}

export function contactErrors(data) {
  const errors = {};
  if (!validName(data?.name)) errors.name = 'Please enter your full name.';
  if (!validEmail(data?.email)) errors.email = 'Please enter a valid email address.';
  return errors;
}

export function money(raw, allowZero = false) {
  if (typeof raw !== 'string' && typeof raw !== 'number') return null;
  const value = String(raw ?? '').trim().replace(/^\$\s*/, '');
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(value)) return null;
  const n = Number(value.replace(/,/g, ''));
  return Number.isFinite(n) && n <= Number.MAX_SAFE_INTEGER && (allowZero ? n >= 0 : n > 0) ? n : null;
}

// Accept an exact estimate or a range only when its entire range qualifies.
// Unknown selections and ranges crossing below the floor cannot opt in.
export function helocCreditEligible(raw) {
  if (typeof raw !== 'string' && typeof raw !== 'number') return false;
  const match = String(raw).trim().match(/^(\d{3})(?:\s*[-\u2013\u2014]\s*(\d{3})|(\+))?$/);
  if (!match) return false;
  const first = Number(match[1]), second = match[2] ? Number(match[2]) : first;
  return Math.min(first, second) >= HELOC_MINIMUM_CREDIT && Math.max(first, second) <= 850;
}

export function leadErrors(data, path = '') {
  if (!data || typeof data !== 'object' || Array.isArray(data)) data = {};
  const errors = contactErrors(data);
  let extra = data.extra || {};
  if (typeof extra === 'string') {
    try { extra = JSON.parse(extra); } catch { errors.extra = 'Please reload the form and try again.'; extra = {}; }
  }
  if (!extra || typeof extra !== 'object' || Array.isArray(extra)) {
    errors.extra = 'Please reload the form and try again.'; extra = {};
  }
  const isHeloc = [path, data.page, data.lp_variant, extra.page, extra.lp_variant].some(value => /^\/?(?:es\/)?heloc(?:[-/.]|$)/i.test(String(value || ''))) ||
    [data, extra].some(source => ['goal', 'product', 'product_choice', 'loan_type'].some(key => /HELOC/i.test(String(source[key] || ''))));
  if (isHeloc) {
    for (const key of ['home_value', 'mortgage_balance', 'requested_amount']) {
      const values = [data[key], extra[key]].filter(v => v !== undefined);
      if (!values.length || values.some(v => money(v, key === 'mortgage_balance') === null)) {
        errors[key] = 'Please enter a valid amount.';
      } else if (key === 'requested_amount' && values.some(v => money(v) < HELOC_MINIMUM)) {
        errors[key] = 'The minimum HELOC request is $50,000.';
      }
    }
    const creditValues = [data, extra].flatMap(source => ['credit_band', 'credit_band_pick', 'credit_score', 'credit', 'fico']
      .filter(key => Object.hasOwn(source, key)).map(key => source[key]));
    if (!creditValues.length || creditValues.some(value => !helocCreditEligible(value))) {
      errors.credit_band = 'Please select an estimated credit score of 640 or higher.';
    }
  }
  return errors;
}
