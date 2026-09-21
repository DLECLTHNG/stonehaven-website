import { leadErrors } from '../shared/lead-validation.mjs';

const MAX_BYTES = 64 * 1024;
const reject = (status, errors) => new Response(JSON.stringify({ ok: false, errors }), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

// Validate before Netlify Forms capture, email notifications and CRM delivery.
// Read a clone so accepted submissions continue with their original body intact.
export default async function validateLead(request) {
  if (request.method !== 'POST') return;
  const type = request.headers.get('content-type') || '';
  if (!['application/x-www-form-urlencoded', 'multipart/form-data'].includes(type.split(';')[0].trim().toLowerCase())) return;
  if (Number(request.headers.get('content-length')) > MAX_BYTES) return reject(413, { form: 'Submission too large.' });
  const clone = request.clone();
  const reader = clone.body?.getReader();
  const chunks = [];
  let size = 0;
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) { reader.cancel().catch(() => {}); return reject(413, { form: 'Submission too large.' }); }
      chunks.push(value);
    }
  }
  let form;
  try { form = await new Response(new Blob(chunks), { headers: { 'Content-Type': type } }).formData(); }
  catch { return reject(400, { form: 'Invalid form submission.' }); }
  if (!form.getAll('form-name').includes('lead')) return;
  const data = {};
  for (const [key, value] of form) {
    if (Object.hasOwn(data, key) || typeof value !== 'string') return reject(400, { form: 'Invalid form fields.' });
    Object.defineProperty(data, key, { value, enumerable: true });
  }
  const errors = leadErrors(data, new URL(request.url).pathname);
  if (Object.keys(errors).length) return reject(422, errors);
}

export const config = { path: '/*', method: 'POST', onError: 'fail' };
