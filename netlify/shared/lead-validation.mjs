// Shared by Netlify's capture guard and server-side intake/relay functions.
export const HELOC_MINIMUM = 30000;

export function contactErrors(data) {
  const errors = {};
  const name = typeof data?.name === 'string' ? data.name.trim() : '';
  const email = typeof data?.email === 'string' ? data.email.trim() : '';
  if (!name || name.length > 120 || /[\r\n\x00]/.test(name)) errors.name = 'Please enter your full name.';
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email address.';
  return errors;
}

export function money(raw, allowZero = false) {
  const value = String(raw ?? '').trim().replace(/^\$\s*/, '');
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(value)) return null;
  const n = Number(value.replace(/,/g, ''));
  return Number.isFinite(n) && n <= Number.MAX_SAFE_INTEGER && (allowZero ? n >= 0 : n > 0) ? n : null;
}

export function leadErrors(data, path = '') {
  const errors = contactErrors(data);
  let extra = data.extra || {};
  if (typeof extra === 'string') {
    try { extra = JSON.parse(extra); } catch { errors.extra = 'Please reload the form and try again.'; extra = {}; }
  }
  if (!extra || typeof extra !== 'object' || Array.isArray(extra)) {
    errors.extra = 'Please reload the form and try again.'; extra = {};
  }
  const isHeloc = [path, data.page, extra.page, extra.lp_variant].some(value => /^(?:\/(?:es\/)?)?heloc(?:[-/.]|$)/i.test(String(value || ''))) ||
    [data.goal, extra.goal, data.product, extra.product_choice].some(value => /HELOC/i.test(String(value || '')));
  if (isHeloc) {
    for (const key of ['home_value', 'mortgage_balance', 'requested_amount']) {
      const values = [data[key], extra[key]].filter(v => v !== undefined);
      if (!values.length || values.some(v => money(v, key === 'mortgage_balance') === null)) {
        errors[key] = 'Please enter a valid amount.';
      } else if (key === 'requested_amount' && values.some(v => money(v) < HELOC_MINIMUM)) {
        errors[key] = 'The minimum HELOC request is $30,000.';
      }
    }
  }
  return errors;
}
