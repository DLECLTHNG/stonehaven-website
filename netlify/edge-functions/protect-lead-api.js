// Browser-facing JSON lead endpoints only. Reserved Netlify event functions and
// the separately protected application endpoint retain their existing handling.
const PATHS = ['/.netlify/functions/lead-capi', '/.netlify/functions/family-inquiry'];
const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
};
const reject = (status, error, extra = {}) => new Response(JSON.stringify({ok:false,error}), {status,headers:{...headers,...extra}});
export default async function protectLeadApi(request, context) {
  const url = new URL(request.url);
  if (!PATHS.includes(url.pathname)) return;
  if (request.method !== 'POST') return reject(405, 'method_not_allowed', {Allow:'POST'});
  const origin = request.headers.get('origin');
  if (!origin || ![url.origin, 'https://stonehavencre.com', 'https://www.stonehavencre.com'].includes(origin) || request.headers.get('sec-fetch-site') === 'cross-site') return reject(403, 'origin_not_allowed');
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json' || request.headers.has('content-encoding')) return reject(415, 'unsupported_media_type');
  const max = url.pathname.endsWith('/lead-capi') ? 16 * 1024 : 32 * 1024;
  const stated = request.headers.get('content-length');
  if (stated && (!/^\d+$/.test(stated) || Number(stated) > max)) return reject(413, 'body_too_large');
  const reader = request.clone().body?.getReader();
  if (!reader) return reject(400, 'invalid_body');
  let size = 0;
  try {
    while (true) {
      const {done,value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > max) { reader.cancel().catch(() => {}); return reject(413, 'body_too_large'); }
    }
  } catch { return reject(400, 'invalid_body'); }
  finally { reader.releaseLock(); }
  const response = await context.next();
  for (const [name,value] of Object.entries(headers)) response.headers.set(name,value);
  return response;
}
export const config = { path: PATHS, onError: 'fail',
  rateLimit: { windowSize: 60, windowLimit: 20, aggregateBy: ['ip', 'domain'] },
};
