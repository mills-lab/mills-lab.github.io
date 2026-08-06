# Mills Lab website rebuild — progress

Tracks progress against `/home/remills/.claude/plans/imperative-purring-trinket.md`
(Astro + Decap CMS rebuild, staying on GitHub Pages, previewed via a companion repo).
Work happens on the `development` branch; `master` (the live site) is untouched
until the Phase 6 cutover PR.

## Phase 1 — Scaffold Astro on `development` — DONE

- Scaffolded Astro (v7) at repo root with TypeScript (`strict`), Tailwind CSS v4,
  and `@astrojs/sitemap`. `astro.config.mjs` sets `site: 'https://millslab.org'`.
- Removed the old Jekyll/Grunt build tooling from this branch only (still intact
  on `master`): `Gruntfile.js`, `Gemfile*`, `_site/`, `css/`, `js/`, `fonts/`,
  `_sass/`, `_includes/`, `_layouts/`, `_templates/`. `package.json` replaced
  with the Astro one (renamed `mills-lab-website`).
- Moved (`git mv`, history preserved) `images/` and `assets/` into `public/images`
  and `public/assets`. Copied `CNAME`, `favicon.ico`, `apple-touch-icon-precomposed.png`
  into `public/` so the custom domain and icons carry over.
- Defined content collections in `src/content.config.ts`: `posts`, `people`,
  `publications`, `software`, `pages`, `navigation`, `footer` (schemas via
  `astro/zod`, loaders via `astro/loaders`).
- Wrote `scripts/migrate-content.mjs` (uses `gray-matter` + `js-yaml`, both
  devDependencies) and ran it to migrate all legacy content into
  `src/content/*`. It's idempotent/re-runnable — safe to run again if the
  legacy source files change before final cutover.
- Verified counts match the legacy source exactly: 17 posts, 20 people
  (1 pi / 5 phd / 13 alumni / 1 research investigator), 90 publications,
  8 software entries, 6 static pages, plus `navigation`/`footer` data.
- `npx astro build` and `npx astro check` both pass clean (0 errors/warnings/hints).

**Field renames during migration** (Jekyll's hyphenated frontmatter keys →
camelCase, since collection schema keys map more naturally to JS):
`external-url`→`externalUrl`, `google-scholar`→`googleScholar`, `CV`→`cv`,
`linked-in`→`linkedIn`, `start-date`→`startDate`, `external_url`→`externalUrl`.

**Not migrated (intentionally):** `_data/messages.yml` (unused Jekyll i18n
scaffolding — the site has no non-English content).

## Legacy files still present (kept as migration source of truth)

`_posts/`, `_people/`, `_pubs/`, `_software/`, `_pages/`, `_data/`,
`_config.yml`, and `.github/workflows/jekyll.yml` are still in the repo,
untouched. Plan is to delete them at the end of Phase 5 (once the new site
has been QA'd against them) or during Phase 6 cutover — do not delete
earlier, they're what `scripts/migrate-content.mjs` reads from.

## Phase 2 — Design & build pages — DONE

- Michigan-branded Tailwind theme (`umblue`/`maize` custom colors) defined in
  `src/styles/global.css` via Tailwind v4's `@theme`. `@tailwindcss/typography`
  added (`prose` classes) for the long-form research/contact/post bodies.
- `src/layouts/Layout.astro` (head/meta/favicon/RSS link) +
  `src/components/Header.astro` (nav from the `navigation` collection,
  active-link highlighting, mobile menu) + `Footer.astro` (links from the
  `footer` collection).
- Pages built: `/` (hero + latest 3 news), `/news/` (grid) +
  `/news/[slug]/` (detail, dynamic route off the `posts` collection),
  `/people/` (Current Lab Members + Alumni sections, sorted by `startDate`),
  `/publications/` (sorted desc by pmid), `/software/` (sorted desc by date),
  `/research/` and `/contact/` (render the migrated `pages` collection
  entries), `/404`, and `/rss.xml` (via `@astrojs/rss`).
- `src/components/PersonCard.astro` and `src/components/PostGallery.astro`
  (new — see below) handle the two most complex content shapes.
- **Migration script updated**: 10 of the 17 posts used Jekyll's `media`
  layout, which embedded a Liquid loop over `site.static_files` to render an
  image gallery from a folder under `/images/`. `migrate-content.mjs` now
  detects that block, strips it, and records a `gallery: <folder>` frontmatter
  field instead; `PostGallery.astro` reads that folder from `public/images/`
  directly at build time (plain `fs.readdirSync`, no Liquid). All 10 verified
  gallery folders exist except `2017-11-30-Tony-defense` (0 images) — that
  folder was already missing/empty in the legacy repo, not something this
  migration broke; the component just renders nothing for it, same as before.
- Also stopped migrating `_pages/{news,people,publications,software}.md` into
  the `pages` collection — those were pure Liquid-loop scaffolding with no
  real prose, fully superseded by the dedicated routes above. Only `research`
  and `contact` (genuine static content) remain in `src/content/pages/`.
- Verified via `npx astro build` + `npx astro check`: 25 pages generate, 0
  type errors. Confirmed via curl against a running `astro preview`/`astro dev`
  server that rendered counts match content exactly (20 people cards, 90
  publications, 8 software entries, 15 gallery images on the holiday-party
  post, contact page's Google Maps iframe intact, all nav links present) and
  that the compiled Tailwind CSS ships real utility classes in the production
  build.

**Known limitation — no true visual/browser check.** I could not get a
headless browser rendering in this sandbox: Playwright's Chromium download
works, but launching it fails on missing system shared libraries
(`libnspr4.so` etc.), and installing them (`playwright install --with-deps`)
needs `sudo`, which isn't available here. So this phase was verified
structurally (build passes, types check, HTML output inspected via curl for
correct counts/links/images) but **not eyeballed in an actual browser**.
Before merging past Phase 2, run `npm run dev` locally and click through the
site yourself (or grant sudo in a future session so I can install Chromium's
deps and do it myself) to catch anything a structural check can't — spacing,
responsiveness, whether the maize/blue theme actually looks good, mobile menu
behavior, etc.

## Next: Phase 3 — Decap CMS integration

Not started. Needs: `public/admin/index.html` + `config.yml` defining Decap
collections matching the schemas in `src/content.config.ts`, a GitHub OAuth
App + small OAuth proxy (Cloudflare Worker recommended, e.g. the
`sveltia-cms-auth` script — GitHub Pages can't run the server-side half of
the OAuth flow itself), `publish_mode: editorial_workflow`, `branch:
development` for now.

## How to resume this work

```
git checkout development
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"   # node not on default PATH in this env
npm install
npm run dev      # local preview at http://localhost:4321
npm run build    # production build to dist/
```
