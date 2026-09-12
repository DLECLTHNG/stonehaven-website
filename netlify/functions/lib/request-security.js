/* Origin checks protect browser callers, not authentication against direct clients. */
function allowedOrigin(raw) {
  if (typeof raw !== 'string') return false;
  try {
    const u = new URL(raw);
    if (u.origin !== raw || u.username || u.password) return false;
    if (process.env.NETLIFY_DEV === 'true' && ['http://localhost', 'http://127.0.0.1'].includes(u.protocol + '//' + u.hostname)) return true;
    if (u.protocol !== 'https:') return false;
    const allowed = ['https://stonehavencre.com', 'https://www.stonehavencre.com'];
    for (const value of [process.env.URL, process.env.DEPLOY_PRIME_URL]) {
      if (!value) continue;
      try { const deploy = new URL(value); if (deploy.protocol === 'https:' && !deploy.username && !deploy.password) allowed.push(deploy.origin); } catch {}
    }
    return allowed.includes(raw);
  } catch { return false; }
}
module.exports = { allowedOrigin };
