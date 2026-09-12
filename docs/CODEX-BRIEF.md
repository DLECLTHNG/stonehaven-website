# Codex kickoff brief: Stonehaven website

Paste the section below as the opening message. It is written to be handed
straight to the agent.

---

You are taking over the entire Stonehaven Lending website project. Before
changing anything, read `docs/PROJECT-HANDOFF.md` in full. It was verified
against production on 2026-09-12 and is the entry point for everything else.

**What this is.** The public marketing site for Stonehaven Lending, a mortgage
brokerage, NMLS #1752355. Static HTML, no framework, no bundler, bilingual with
English at the root and Spanish under `es/`. 175 pages, 296 tracked files.
Deployed on Netlify from the `main` branch of
`github.com/DLECLTHNG/stonehaven-website`.

**The four things that will catch you out.**

1. **Most pages are generated.** Editing a generated `.html` by hand is the most
   common way to break this project: the next build silently overwrites you.
   Section 3 of the handoff maps every generator to its config and its outputs.
   Check that table before touching any page.
2. **Pushing to `main` deploys to production.** There is no staging and no pull
   request gate. Confirm with the owner before pushing.
3. **Response headers must go in `_headers`, never `netlify.toml`.** That file
   deletes itself during the build, so headers declared there vanish silently.
   This was a real live bug, not a hypothetical.
4. **There is an enforced Content-Security-Policy.** Any new third-party script,
   font, iframe or beacon needs its origin added to `_headers` or it is blocked
   in production with no obvious error.

**This is a licensed mortgage business, so wording is a legal matter.** Standing
rules, all enforced or documented: the company is a brokerage and never a direct
lender, capital is always "arranged through" a third party, no pricing anywhere
outside `/blog`, rates inside `/blog` must carry their closing date, no
guaranteed-approval or lowest-rate language, no em dashes, and residential
lending may only be claimed in the six licensed states while DSCR is "nationwide,
availability varies by state". A grep inside the Netlify build command fails the
deploy on several of these, so a violation breaks the release rather than
shipping quietly.

**Before you push, run the gates.** Section 5 of the handoff lists them. There is
no single aggregate command. Everything passes today, so any failure you see is
something you introduced.

**Highest value work available**, detail in section 10 of the handoff:

1. Confirm four placeholder cost figures and an illustrative rate that are
   already live in ten published DSCR articles. This is the only open item
   touching content the public can already see.
2. Connect the CRM. Do not just set the environment variable: section 7 explains
   a real incompatibility that makes it fail closed in production.
3. Decide where educational guides live, because the blog is branded "Closings"
   and its disclaimer asserts the posts are closed transactions.
4. Publish or drop four finished Family Opportunity blog drafts in
   `docs/family-drafts/`.

**One open decision is not yours to clear.** The owner asked for the Meta Pixel
to be added to `/family-housing-options`, the page about financing a home for an
adult child with a disability. It was deliberately not implemented. Section 4 of
`docs/family-opportunity-handoff.md` sets out why, including Meta's own Business
Tools Terms and Fair Housing Act exposure. Treat it as a decision needing the
owner and their legal adviser, not a backlog ticket to close.

**Credentials.** None are in either repository, and the website repo is public,
so none may ever be committed. Section 2 of the handoff lists what is needed and
who supplies it. Do not paste the Meta Conversions API token yourself; have the
owner set it in Netlify.
