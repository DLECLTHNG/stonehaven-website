# Stonehaven Commercial — Website

The live marketing site for Stonehaven Commercial. Bilingual (EN/ES), five pages
plus stylesheet. Pure static HTML/CSS/JS — **no build step, no framework.**

## Files
- `index.html` — home
- `commercial.html`, `sba.html`, `dscr.html` — product pages
- `contact.html` — contact
- `styles.css` — shared styles

## Preview locally
Any static server works, e.g.:
```
npx serve .
```
Then open the URL it prints.

## Deploy (Netlify)
1. Go to https://app.netlify.com/drop and drag this whole folder in.
2. Netlify gives a temporary `*.netlify.app` URL — test every page in EN + ES.
3. Add the custom domain `stonehavencre.com` under Domain management.
4. Add the DNS records Netlify shows you at GoDaddy (DNS stays at GoDaddy so
   Google Workspace email is untouched). HTTPS auto-provisions once DNS resolves.

To **update** later (e.g. swap the phone number): edit the files and drag the
folder onto the same Netlify site again. Domain, HTTPS, and email are unaffected.

## Known placeholders / to-dos
- **Phone:** `(800) 555-0100` is a temporary placeholder (a reserved/non-working
  number). Replace across all pages when a real business line exists.
- **Contact email:** `office@stonehavencre.com` (live via Google Workspace).
- **Lead forms** currently show a graceful thank-you but do not yet send data.
  Wire them to the CRM once it's deployed (see the CRM build package's
  `WEBSITE_FORM_CONTRACT.md`) — one `fetch` POST per form.
