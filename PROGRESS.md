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

## Post-Phase-2 fixes (from user review)

- **Nav order bug**: the header rendered alphabetically (Contact, News,
  People...) instead of the live site's News, Research, People, Publications,
  Software, Contact — even though `_data/navigation.yml`'s source array was
  already in the right order. Root cause: Astro's `file()` loader doesn't
  guarantee it returns collection entries in source order. Fixed root-cause
  style rather than patched: `navigation`/`footer` schemas now require an
  explicit `order: number` field (stamped from array index during
  migration), and `Header.astro`/`Footer.astro` sort by it explicitly rather
  than trusting collection iteration order. Verified fixed via build output.
- **New Phase 7 added to the plan** (`/home/remills/.claude/plans/imperative-purring-trinket.md`):
  PubMed sync for Ryan Mills' publications — a scheduled/manually-triggered
  GitHub Action that queries NCBI E-utilities, diffs against
  `src/content/publications/*.md` by pmid, and opens a PR with new entries
  (same review-before-publish model as everything else on this site). User
  explicitly scoped this as post-cutover, not a launch blocker — not started.
- **Homepage redesign** (flashier hero + new "Latest Research" section):
  - New `media` content collection (`src/content/media/*.md`, schema in
    `src/content.config.ts`) for press coverage of lab publications — fields:
    `title`, `source`, `url`, `date`, `excerpt`, `relatedPmid`. Seeded with
    two real, verified entries (checked via WebFetch, not invented): the
    Scientific American numts piece the user linked, and a Columbia
    University Irving Medical Center article covering the same PLOS Biology
    study. Deliberately did not fabricate additional press coverage —
    add more `media/*.md` entries as real coverage appears.
  - Homepage hero: added a stats row (lab member count, publication count,
    software count) pulled live from the collections — all real counts,
    nothing hardcoded. (Originally also had `DNA_Cloud.png`, a legacy
    word-cloud graphic, as a low-opacity background layer — removed per
    user feedback below, it read as hard-to-see and squished to one side.)
  - "Latest News" renamed to "Latest Lab News"; new "Latest Research" section
    above it shows the latest `media` entries.
  - Both sections now use `src/components/FeedRow.astro`, a shared full-width
    horizontal row layout (image or source-badge on the left, content filling
    the rest) replacing the old 3-column card grid, per user request that
    each item "fill the space" in its own row.
  - **Not yet wired into Decap CMS** (Phase 3 hasn't started) — when Phase 3
    happens, add a `media` collection to `public/admin/config.yml` alongside
    the others so lab members can add press coverage without touching files.
- **People page photos were over-cropped** — `PersonCard.astro` forced a
  fixed 240px height with `w-full`, so `object-cover` cropped away most of
  each photo's width in wide grid columns. The source photos in
  `public/assets/people/` are already pre-cropped to a consistent 190x240
  ratio (hardcoded in the legacy `_includes/people-grid.html`), so the fix
  was sizing by that same ratio (`aspect-[19/24]`) instead of a fixed
  height — verified the compiled CSS (`aspect-ratio:19/24`).
- **Lightbox for news post images**: new `src/components/Lightbox.astro`
  (native `<dialog>`, no external library) — any element with
  `data-lightbox-src` opens the full-resolution image in a modal on click
  (Escape/backdrop-click/×-button to close). Wired into
  `PostGallery.astro` (each gallery photo) and the feature image on
  `src/pages/news/[slug].astro`. The gallery/feature images were already
  the full-resolution source files (just displayed cropped/small), so this
  is a display-only change — no new image assets needed. Verified via build
  output that every post's images carry `data-lightbox-src` and the
  dialog/script appear exactly once per page (shared between the two
  components' triggers, not duplicated).
- **Hero simplified**: removed the `DNA_Cloud.png` background graphic
  entirely (user found it hard to see and awkwardly squished to one side)
  and tightened the hero's vertical padding (`py-24 sm:py-28` down to
  `py-14 sm:py-16`, similar reductions on the stats-row spacing) so there's
  less empty space while still leaving reasonable breathing room. Hero is
  now a plain `umblue-950` panel with no background imagery.
- **Hero eyebrow labels are now links**: "University of Michigan" →
  `https://umich.edu`, "Computational Medicine & Bioinformatics" → the same
  department URL already used in the footer
  (`https://medicine.umich.edu/dept/computational-medicine-bioinformatics`).
  No extra styling needed — Tailwind's preflight resets `<a>` to
  `color: inherit; text-decoration: inherit`, confirmed in the compiled CSS,
  so the links are visually identical to the old plain text.
- **Homepage sections renamed and tightened**: "Latest Research" → "Recent
  Research", "Latest Lab News" → "Lab News". Both sections narrowed
  (`max-w-6xl` → `max-w-4xl`, matching their single-column row layout) and
  given less padding (`py-16` → `py-10 sm:py-12`) so there's less empty
  space between the hero, Recent Research, and Lab News sections.

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
