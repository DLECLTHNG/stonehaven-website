/* Netlify verifies platform event signatures before invoking this reserved
 * event function. Keep this filename: an ordinary public HTTP handler would
 * not have that platform protection. Forms capture and email alerts remain
 * primary; this function forwards the already-saved lead to the CRM.
 */
exports.handler = async (event) => {
  if (process.env.WEBSITE_CRM_RELAY_ENABLED !== '1') return { statusCode: 204, body: '' };
  let submission;
  try { submission = JSON.parse(event.body || '{}').payload; } catch { throw new Error('Invalid form event'); }
  const data = submission && submission.data;
  if (!data || (submission.form_name || data['form-name']) !== 'lead') return { statusCode: 204, body: '' };
  if (data.company_website || data.hp || submission.spam === true) return { statusCode: 204, body: '' };
  if (typeof submission.id !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(submission.id)) throw new Error('Missing form submission identity');
  // Owner-selected rollout: Residential, HELOC and Family inquiries stay in
  // Netlify Forms and email until their separate CRM intake is ready.
  const residentialPage = /^(family-|residential(?:-|$)|heloc(?:-|$))/.test(data.page || '') ||
    ['cash-out', 'mortgage-calculator', 'refinance-calculator'].includes(data.page);
  if (data.product === 'Residential' || residentialPage) return { statusCode: 204, body: '' };
  const key = process.env.WEBSITE_RELAY_SECRET || '';
  let url;
  try { url = new URL(process.env.WEBSITE_CRM_INTAKE_URL); } catch { throw new Error('CRM relay URL missing'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/api/intake/website' || key.length < 32) {
    throw new Error('CRM relay configuration invalid');
  }
  const payload = { submission_id: submission.id };
  for (const field of ['name', 'email', 'phone', 'product', 'about', 'page', 'lang']) {
    if (typeof data[field] === 'string') payload[field] = data[field];
  }
  // Preserve captured context. Browser forms currently save structured answers
  // within about; no inference of consent or product eligibility is made here.
  payload.extra = { netlify_submission_id: submission.id };
  let failure = 'network';
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url.href, {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(2500),
        headers: { 'Content-Type': 'application/json', 'X-Stonehaven-Relay-Key': key },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      if (response.ok && ['created', 'duplicate'].includes(result?.status) && result?.lead?.id) {
        console.info('CRM relay accepted', submission.id);
        return { statusCode: 200, body: '' };
      }
      failure = 'HTTP ' + response.status;
      if (response.status >= 400 && response.status < 500 && response.status !== 429) break;
    } catch { failure = 'network'; }
  }
  // Do not log contact details, response bodies, or the shared secret. The
  // original submission remains in Forms, with its email notification intact.
  throw new Error(`CRM relay failed (${failure}); retained Netlify submission ${submission.id}`);
};
