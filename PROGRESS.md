# Mills Lab website rebuild — progress

Tracks progress against `/home/remills/.claude/plans/imperative-purring-trinket.md`
(Astro + Decap CMS rebuild, staying on GitHub Pages, previewed via a companion repo).
Work happens on the `development` branch; `master` (the live site) is untouched
until the Phase 6 cutover PR.

## ⏸ Paused here (2026-08-06) — read this first

Everything below is committed on `development` (`master`/production untouched,
zero live-site risk). Working tree is clean as of commit `f6fb89a`. To resume:
read this section, then `git log --oneline` for the full blow-by-blow if needed.

**Done:** Phase 1 (Astro scaffold + content migration) and Phase 2 (all page
templates) are complete, plus a long tail of real content/design work driven
by user feedback that went well beyond Phase 2's original scope — homepage
redesign (hero, Recent News/Lab Updates sections, alignment fixes), People
page split into 4 sections with an extensible icon-links system, Publications
reformatted with year sections + real new publications added (web-researched
and verified against NCBI, not guessed), Research/Contact page content fixes.
See the dated entries below for full detail on each.

**Not started:** Phase 3 (Decap CMS integration) onward — 3/4/5/6/7 are all
still exactly as scoped in the plan file. Phase 3 is the natural next step.

**Two open items worth resolving before or during Phase 3** (both flagged to
the user when found, neither blocking):
- Three alumni have ambiguous Ph.D./rotation/other classification (Akima
  George, Nan Lin, Zhenning Zhang — see the Phase 2 alumni section below for
  the reasoning) — defaulted to "Other Lab Alumni," not confirmed correct.
- Akima George's current institution (a "Development Specialist, POBLO
  International" candidate) was found but not published — only source was a
  third-party contact aggregator, not primary.

**Known sandbox limitation, not project-related:** this environment has no
sudo, so headless-Chromium visual QA (Playwright) isn't possible here — every
change was verified structurally (build output, type-check, HTML inspection)
but never actually eyeballed in a rendered browser. Worth a `npm run dev` +
manual click-through before Phase 6 cutover, if that hasn't happened yet in
the meantime.

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
    happens, add a `research` collection to `public/admin/config.yml`
    alongside the others (see rename note below), with an image-upload
    widget for the `image` field, so lab members can add press coverage and
    publication summaries without touching files.
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
- **Further spacing fix**: user still saw excess space above "Lab News" and
  below "Recent Research". Root cause: `FeedRow.astro` had `first:pt-0` but
  no matching `last:pb-0`, so the last row in each list kept its full `py-7`
  bottom padding, which then stacked with the section's own bottom padding.
  Added `last:pb-0` and reduced both sections' padding again
  (`py-10 sm:py-12` → `py-8 sm:py-10`).
- **`media` collection renamed to `research` + extended for publication
  summaries** (schema/UI only — user explicitly deferred content population
  to Phase 3). User wants "Recent Research" to eventually show lab-written
  publication summaries with a representative figure thumbnail, not just
  third-party press coverage. Changes:
  - `src/content/media/` → `src/content/research/` (`git mv`, both existing
    entries preserved); collection key `media` → `research` in
    `src/content.config.ts`.
  - Schema gained `kind: z.enum(['media', 'publication']).default('media')`
    (both existing entries now explicitly set `kind: media`) and
    `image: z.string().optional()` — a thumbnail filename resolved against
    `public/images/research/` (that folder doesn't exist yet; nothing
    references it until real publication-summary content is added).
  - Homepage (`src/pages/index.astro`): `getCollection('research')`, slice
    bumped from 3 to 4 latest entries per user request, `FeedRow` now gets
    `imageSrc` from `item.data.image` when present — `FeedRow.astro` itself
    needed no changes, it already fell back to the `source` text badge
    when no image is given, so this was additive.
  - **Deliberately not done**: no real publication-summary entries added.
    Sourcing "a representative image from the publication" means pulling an
    actual figure out of a specific paper, which needs someone with
    rights/knowledge of the right image — that's Phase 3 CMS content work,
    not something to fabricate now.
- **Left-alignment fix**: "Recent Research" and "Lab News" weren't aligned
  with the hero's "The Mills Lab" / "Our Research" / "Lab Members" content.
  Cause: the hero's outer container was `max-w-6xl` but the two section
  containers were independently centered at `max-w-4xl` — different
  max-widths under `mx-auto` centering don't share a left edge. Fixed by
  giving both sections the same `mx-auto max-w-6xl px-4 sm:px-6` outer
  container as the hero, then nesting an un-centered `max-w-4xl` div inside
  for the narrower reading width (left-aligned by default, since it has no
  `mx-auto`). Verified in build output that all three containers now emit
  the identical `max-w-6xl px-4 ... sm:px-6` class string.
- **Right-alignment fix**: same idea, other edge. "View all publications" /
  "View all" needed to right-align with the header nav's last item
  ("Contact"). Moved the heading + "View all" row out of the `max-w-4xl`
  wrapper so it spans the section's full `max-w-6xl` width (matching the
  header's own `mx-auto max-w-6xl ... justify-between` container) — the
  `max-w-4xl` cap now applies only to the row-list div below the heading,
  which stays left-aligned/narrower per the earlier request. Verified two
  identical `max-w-6xl px-4 py-8 sm:px-6 sm:py-10` containers in build
  output, one per section.

- **People page: 4 sections + extensible icon links**. User wants "Current
  Lab Members", "Ph.D. Alumni", "Other Lab Alumni", "Past Rotation Students"
  as separate sections, plus CV/Google Scholar/LinkedIn/GitHub/email shown
  as icon links, with room for the CMS to add more link types later.
  - **Status split**: `people.status` enum went from `pi | phd | alumni |
    researchinvestigator` to `pi | phd | researchinvestigator | phd-alumni
    | other-alumni | rotation-alumni` (`phd` now unambiguously means
    *current* student, since alumni have their own values).
  - **⚠️ Needs your review**: the legacy data never distinguished *why*
    someone left `_people/alumni/` — I classified all 13 by each person's
    `title` field (`ALUMNI_SUBSTATUS` map in `scripts/migrate-content.mjs`):
    "PhD Candidate/Student" → Ph.D. Alumni (Alex Weber, Chen Sun, Marcus
    Sherman, Xuefang Zhao, Yifan Wang); "Rotation Student" → Past Rotation
    Students (Catherine Barnier, Fan Zhang); everything else → Other Lab
    Alumni (Gargi Dayama, Tony Chun — clearly postdocs — plus **Akima
    George, Nan Lin, Zhenning Zhang**, whose titles ("Bioinformatics
    Student", "Human Genetics Student") don't say PhD or Rotation
    explicitly — I defaulted these three to Other Lab Alumni but genuinely
    don't know if that's right. Worth a quick look before this ships.
  - **Extensible `links` field** (this is the actual feature ask): replaced
    the flat `cv`/`googleScholar`/`linkedIn`/`twitter`/`email` fields with
    `links: { type, label?, url }[]`, `type` a preset enum (`cv`,
    `googleScholar`, `linkedin`, `github`, `twitter`, `website`, `email`,
    `other`). `other` + a custom `label` is the escape hatch — **when Phase
    3 builds the Decap config, expose `other` as an "add a different kind
    of link" option** (e.g. a list widget with a type dropdown that
    includes "Other" + a label field) so lab members aren't stuck with only
    the 5 you named if something new comes up later (ORCID, a personal
    site, etc.).
  - New `src/components/PersonLinks.astro` renders these as icon-only
    circular buttons (hand-drawn inline SVGs — document icon for CV, cap
    for Scholar, simplified LinkedIn/GitHub/X marks, envelope for email,
    globe for website, chain-link for `other` — no icon library
    dependency), with `aria-label`/`title` for accessibility.
  - **Not migrated**: the old `linked-in` field's legacy values (e.g.
    Ryan's `pub/ryan-mills-82b5854//`) are in LinkedIn's `/pub/` URL format,
    deprecated years ago and never actually rendered on the old site either
    — skipped rather than publishing a link that's probably already dead.
    Add a current LinkedIn URL by hand, or via the CMS later, if wanted.
  - Verified via build output: 7 current / 5 Ph.D. alumni / 6 other alumni
    / 2 rotation alumni = 20 total (matches full people count exactly), 17
    icon links total across all cards, all resolving to the expected
    aria-labels (2 CV, 2 Google Scholar, 1 X/Twitter, 12 Email).
- **Wenjin Gu and Steve Ho moved to Ph.D. Alumni** (user request, both were
  previously "current" `phd`). `git mv`'d `_people/phd/{Wenjin_Gu,Steve_Ho}.md`
  → `_people/alumni/`, added both filenames to `ALUMNI_SUBSTATUS` in
  `scripts/migrate-content.mjs` as `phd-alumni`. Wenjin's current
  institution ("Tempus AI") added as `line3` in the legacy source file
  (line1/line2 were already her two degrees, so it couldn't reuse the
  line2-as-current-position pattern other alumni entries use). Steve got no
  institution line, per the request. Verified: Current Lab Members
  7 → 5, Ph.D. Alumni 5 → 7, "Tempus AI" renders on the page.
- **Web-researched current institution/Scholar/LinkedIn for all 15 alumni**
  (user request). Used 3 parallel research agents (WebSearch + WebFetch,
  cross-checking every candidate against known facts — degree, program,
  advisor/lab, dates — before treating it as a match) plus direct research
  for Alex Weber. Google Scholar matches were verified by fetching the
  profile directly (Scholar pages are fetchable); **LinkedIn matches could
  only be verified via search-snippet text, not by fetching the profile
  page itself — LinkedIn blocks WebFetch**. Treat LinkedIn URLs as
  best-effort; Scholar URLs as verified.
  - **Applied (current institution updated):** Marcus Sherman (Assistant →
    Associate Teaching Professor, Roux Institute/Northeastern — his title
    had advanced), Xuefang Zhao (Post-doctoral Fellow → Staff Scientist,
    Talkowski Lab/MGH), Yifan Wang (added Postdoctoral Research Fellow,
    Mayo Clinic), Catherine Barnier (Ph.D. Student, Freddolino Lab →
    Consultant, ClearView Healthcare Partners — she defended Oct 2024), Fan
    Zhang (Ph.D. Student, Kang Lab → Senior Bioinformatics Scientist,
    Illumina), Gargi Dayama (Post-doctoral Fellow → Senior Research
    Scientist, Lau Lab, Boston University — consolidated her two degree
    lines into one to free up a line for this, all three schema line slots
    were already full), Shaomiao Xia (added Research Assistant, University
    of Michigan), Zhenning Zhang (Engineer, Ann Arbor Algorithms → Machine
    Learning Engineer, AstraZeneca — the old employer's own alumni page
    confirmed the transition).
  - **Applied (added Scholar/LinkedIn only, institution unchanged or still
    blank):** Alex Weber, Chen Sun (Scholar only — no confident current
    employer found), Wenjin Gu (LinkedIn only — institution already set to
    Tempus AI from your earlier request), Steve Ho (Scholar + LinkedIn
    only — no institution, per your earlier explicit "no current
    institution" instruction, which I treated as still standing).
  - **⚠️ Skipped — not confident enough to publish:** Akima George (one
    candidate found — "Development Specialist, POBLO International" — but
    only via a third-party contact-aggregator site, not a primary source;
    the research agent itself recommended a manual check before
    publishing). Nan Lin and Tony Chun: nothing found either confirming or
    contradicting their existing "last known" info (Research Assistant,
    Indiana University / Senior Scientist, CJ Research Institute of
    Biotechnology) — left unchanged since it's unverified either way, not
    known-wrong.
  - **Note on Fan Zhang**: her personal site uses he/his pronouns, which
    the research agent flagged as inconsistent with an assumption it made
    from the name; the institutional match (B.S.E. South China University
    of Technology, UM Bioinformatics PhD, advisor Hyun Min Kang) is
    specific enough that I'm confident it's the same person regardless —
    flagging here in case it matters for how her entry is written.
  - **Migration script change**: `buildPersonLinks()` in
    `scripts/migrate-content.mjs` now accepts a `linked-in` value if it's a
    full URL (`^https?://`), passing it straight through — previously the
    field was ignored entirely because the only existing value (Ryan
    Mills', in LinkedIn's deprecated `/pub/` format) wasn't usable. Freshly
    researched URLs are all full `https://www.linkedin.com/in/...` links,
    so they now flow through; any future stale/malformed value is silently
    ignored rather than migrated into a broken link.
  - Verified via build output: Google Scholar icons 2 → 7, LinkedIn icons
    0 → 7, and spot-checked every updated institution string
    (Illumina, AstraZeneca, Mayo Clinic, Boston University, etc.) appears
    exactly once in the rendered People page.
- **Publications page: year sections, PubMed icon, decoded titles.**
  - `src/pages/publications/index.astro` now groups publications by year
    (parsed from the leading 4 digits of `pubdate`, which every one of the
    90 entries has) into subtle uppercase/tracking-wide/slate-400 section
    headers, sorted newest-year-first. **Caught a bug while verifying**:
    initially built the year list via `[...new Set(...)]` off the
    pmid-sorted array, which orders years by first-appearance-in-pmid-order
    rather than chronologically — pmid isn't perfectly monotonic with
    pubdate year, so headers came out jumbled (2018, 2017, ... 2008, 2003,
    2007, 2006, 2004, 2023, ...). Fixed by explicitly sorting the unique
    years numerically descending; verified all 20 year headers (2023 down
    to 2003) now in correct order and all 90 publications still accounted
    for across the groups.
  - The `pmid:12345` text link is now an icon-only PubMed link (hand-drawn
    DNA-helix SVG, not an attempt to reproduce PubMed's actual logo/brand
    mark — kept generic to avoid any trademark-reproduction question — with
    `aria-label`/`title="View on PubMed"` so it's unambiguous what it
    links to).
  - **Decoded HTML entities in publication titles/authors/journal.**
    PubMed's bibliographic export encoded colons as `&#58;` (e.g. "Mako&#58;
    A Graph-based..." instead of "Mako: A Graph-based..."), present in 14
    of the 90 legacy `_pubs/*.md` files and carried through unchanged by
    the original migration. Added a small `decodeHtmlEntities()` helper to
    `scripts/migrate-content.mjs` (handles numeric decimal/hex entities
    plus `&amp;/&lt;/&gt;/&quot;/&apos;`) applied to `title`, `authors`,
    `journal`. Verified zero `&#` sequences remain in
    `src/content/publications/*.md` after re-running the migration, and
    that e.g. "Mako: A Graph..." renders with a real colon.
- **Added recent publications from Ryan Mills' NCBI MyBibliography**
  (https://www.ncbi.nlm.nih.gov/myncbi/1-Io6fmDrHEQv/bibliography/public/,
  117 entries across 3 pages, per user request).
  - **The bibliography is contaminated with false positives** — about 20 of
    the ~26 newest candidate entries turned out to be papers by a
    different University of Michigan researcher (Ivo Dinov's biostatistics/
    ML lab: DataSifter, SOCRAT, spacekime, brain-tumor-segmentation papers)
    or Brenner-lab HNSCC papers that don't actually include Ryan Mills as
    an author — NCBI's auto-bibliography matching isn't reliable. Verified
    every candidate by fetching full author lists from NCBI's E-utilities
    esummary API (`eutils.ncbi.nlm.nih.gov/.../esummary.fcgi`, batched by
    PMID) and only added ones where "Mills RE" literally appears in the
    author list — not just topical plausibility.
  - **Added 4 new entries** (all confirmed "Mills RE" co-author):
    PMID 40689859 (Merkel Cell Carcinoma genomics, Mol Cancer Res, 2025),
    40604182 (Somatic Mosaicism across Human Tissues Network flagship
    paper, Nature, 2025 — the SMaHT consortium the lab's Research page
    already mentions), and two current bioRxiv preprints not yet published
    (39763954, 41278868).
  - **Replaced 1 bioRxiv entry with its published version**: old
    PMID 36945473 ("Mapping the Complex Genetic Landscape of Human
    Neurons," bioRxiv) removed, replaced by PMID 38760338 ("Mapping
    recurrent mosaic copy number variation in human neurons," Nature
    Communications, 2024) — confirmed same paper via near-identical
    author list (Sun C, Kathuria K, Emery SB, ... Mills RE, McConnell MJ)
    and the bibliography explicitly listing 38760338 as a current entry.
  - **Left the other existing bioRxiv entry unchanged** (PMID 36778249,
    "Somatic nuclear mitochondrial DNA insertions..."). I independently
    know (from the earlier Recent Research task) that this was published
    in PLoS Biology as PMID 39172952 — but per your explicit instruction to
    only remove bioRxiv entries "now included at this link," I checked all
    3 pages of the bibliography and 39172952 does not appear there, so I
    left 36778249 as-is rather than substitute my own outside knowledge for
    the stated rule. Worth a manual look if you want it updated anyway.
  - **Found and fixed a real pre-existing bug** while adding the two new
    bioRxiv preprints: empty YAML values (`volume: `) parse to `null`, but
    `migratePublications()` checked `!== undefined`, so `String(null)`
    produced the literal text `"null"` — visible on the *existing* bioRxiv
    entry too ("bioRxiv 2023 Apr 21, null(null), N/A"), not something this
    task introduced. Fixed by checking `!= null` instead (catches both
    `null` and `undefined`) for pmid/pubdate/volume/issue/pages in
    `scripts/migrate-content.mjs`. Also added the same `fs.rmSync` cleanup
    before regeneration that `migratePeople`/`migratePages` already had, so
    deleted `_pubs/*.md` files (like the superseded 36945473) don't leave
    an orphaned file in `src/content/publications/`.
  - Verified: 94 total publications (90 − 1 replaced + 5 new... 4 added +
    1 replacement = net +4), new 2025 year section appears on the
    Publications page, all 5 new/updated titles render, the superseded
    title is gone, and the `null(null)` artifact no longer appears
    anywhere.
- **Replaced the remaining bioRxiv entry too** (user follow-up): PMID
  36778249 ("Somatic nuclear mitochondrial DNA insertions...", bioRxiv) →
  39172952 (same title, same author list, PLoS Biol, 2024 Aug, 22(8),
  e3002723) — the published version I'd found during the earlier Recent
  Research task but held off updating since it wasn't in the NCBI
  bibliography page. User asked directly this time, so applied it. Count
  stays at 94 (1-for-1 swap); verified the citation renders correctly and
  the PubMed icon links to 39172952, not the old PMID.
- **Fixed orphaned "The" on the Research page.** The legacy content used
  `<p style="float: right; width: 650px; ...">` to float the figure beside
  the intro text, Jekyll-era-style — in the narrower `max-w-3xl` container
  this new site uses, that produced an orphaned "The" (the first word of
  the next paragraph) stranded on its own line above the image. Removed
  the float entirely and moved the figure to a plain block `<figure>`
  (with its caption as a real `<figcaption>`) positioned after both intro
  paragraphs and before "Areas of Investigation", per request. Edited both
  `_pages/research.md` (legacy source) and confirmed `scripts/migrate-
  content.mjs` regenerates `src/content/pages/research.md` identically.
  Verified in build output: no `float: right` remains, the image/caption
  render in the new position, ordered after the consortia paragraph and
  before "Areas of Investigation".
- **Hero stats (Lab Members/Publications/Software Tools) are now links**,
  shrunk down (`dt` `text-sm`→`text-xs`, `dd` `text-3xl`→`text-xl`, tighter
  `dl` spacing). Each stat's title+number is wrapped in a single `<a>` to
  `/people/`, `/publications/`, `/software/` respectively, styled to look
  like plain text (same Tailwind-preflight-inherits-color/decoration trick
  as the hero eyebrow links) with only a subtle `hover:opacity-80` as a
  usability cue, per the "shouldn't look like hyperlinks" request.
- **Contact page updated to the lab's new address** (Palmer Commons →
  Medical Science I). Email `remills@med.umich.edu` → `remills@umich.edu`,
  Office → `MS1/5B390`, shipping address → `1301 Catherine St, Room 5B390,
  Ann Arbor, MI 48109`, location blurb now says "5th floor in the B-Wing of
  the Medical Science I building." Also updated the embedded Google Map
  (was pointing at Palmer Commons — left unchanged would've shown the
  wrong building right next to the corrected text) using the simple
  `maps?q=...&output=embed` format, no API key needed. **Removed the
  "Parking Information" link** — it pointed specifically to Palmer
  Commons driving directions, which no longer applies; wasn't asked to
  address parking specifically but leaving a stale link for the old
  building right next to the new address seemed worse than dropping it.
  Left the phone number untouched (not mentioned, no reason to assume
  it changed). Edited both `_pages/contact.md` and confirmed the
  migration regenerates `src/content/pages/contact.md` identically.
- **Removed the hero stats section** (Lab Members/Publications/Software
  Tools `<dl>`) entirely, per request — the linked/shrunk version from the
  prior task didn't stick around long. Also removed the now-unused count
  computations (`currentMemberCount`, `publicationCount`, `softwareCount`,
  `CURRENT_STATUSES`) from `src/pages/index.astro` rather than leaving dead
  code. Verified no `<dl>`/"Lab Members"/"Software Tools" remain in the
  build output.
- **Added a 3rd `research` entry**: "Improving and Scaling Techniques in
  Both Molecular and Computational Labs with NIH Support" (University of
  Michigan Medical School, 2023-05-11) — verified via WebFetch that Ryan
  Mills is co-PI on the NIH Common Fund SMaHT grant this covers. `kind:
  media`, no `relatedPmid` (the article covers grant funding, not a single
  paper, so there's no one publication to point at). Verified it renders
  on the homepage in correct chronological order among the other two
  `research` entries.
- **New "Meet the PI" page + homepage button** (user request). Homepage
  hero now has 3 buttons (Our Research / Meet the Lab / Meet the PI), all
  restyled to the same yellow (`bg-maize-400`) filled style — "Meet the
  Lab" was previously an outlined style, now matches the other two.
  - **Source research**: `medschool.umich.edu` (the URL the user gave) is
    behind a Cloudflare bot challenge — both WebFetch and curl got a "Just
    a moment..." JS-challenge page (403/interstitial), not the real
    content, so nothing was scraped from it directly. Pieced together
    verified info instead from: the lab's own `public/assets/mills_cv.pdf`
    (extracted via `pypdf`, dated 2023-06-30 — has full education/training/
    appointment history), a fetchable RNA Biomedicine faculty-spotlight
    page, and WebSearch results aggregating 2024/2025-dated UM pages that
    consistently show his rank advanced from "Associate Professor" (as of
    the 2023 CV) to full **"Professor."** Current titles/rank and
    education are both real, sourced, cross-checked across ≥2 independent
    mentions each — not fabricated.
  - **Image**: also couldn't be pulled from the blocked UM page, so reused
    the lab's own existing `Ryan_Mills_pic.jpg` (already on file, already
    a real photo of him) rather than substitute a different one.
  - **Schema**: `people` collection gained two new optional fields,
    `titles: string[]` and `education: string[]` (only populated for Ryan
    so far — generically named in case another PI profile is ever added).
    The biography is the entry's markdown body, rendered via the same
    `render()` pattern already used for `research`/`contact`.
  - **Also fixed while in the file**: `_people/pi/Ryan_Mills.md` still had
    the old `remills@med.umich.edu` email in its `links`/mailto field —
    the Contact page email got corrected to `remills@umich.edu` in an
    earlier task but this separate copy of the same fact was missed.
    Updated for consistency.
  - New route: `src/pages/people/ryan-mills.astro` — image left, titles
    right, education below both, biography below that, matching the
    requested layout. Looks up the PI via `status === 'pi'` rather than a
    hardcoded slug, so it keeps working if the file gets renamed later.
  - Verified in build output: all 3 hero buttons share the identical
    yellow class string, the profile page renders titles/education/bio/
    image correctly, 26 pages now build (up from 25).
- **Department rename, new Press section, homepage merge** (user request,
  several parts):
  - "Computational Medicine & Bioinformatics" → "Gilbert S. Omenn
    Department of Computational Medicine & Bioinformatics" everywhere it's
    a *current site-chrome reference* to the department: hero eyebrow link,
    `Footer.astro` blurb, the footer nav link (`_data/footer.yml`), and
    Ryan Mills' `titles`/bio text on the new PI page. **Deliberately left
    unchanged**: mentions inside old `_posts/*.md` narrative content (e.g.
    the 2017 posts about Tony Chun's and Xuefang Zhao's thesis defenses) —
    those are dated historical records of what the department was called
    at the time, not a live label, so rewriting them would be revising
    history rather than fixing a current reference. Also left the
    abbreviated `title: Professor, DCM&B and Human Genetics` field alone
    (used only for the compact People-page card, where the short form is
    intentional for space).
  - **New "Press" nav item**, inserted between Publications and Software
    in `_data/navigation.yml` → `src/content/data/navigation.yml`
    (order field handles the positioning, per the earlier nav-ordering
    fix). New route `src/pages/press/index.astro` lists the `research`
    collection (same `FeedRow` treatment as before), i.e. this collection
    is now conceptually "Press" while `posts` is "News" — the existing
    `/news/` page already covered that half, no changes needed there.
  - **Merged the homepage's two sections into one "Recent News"**:
    `posts` and `research` entries are now normalized to a common shape
    and interleaved by actual date (not shown as two separate lists) in
    `src/pages/index.astro`, sliced to the 5 most recent across both.
    Removed the "View all publications" / "View all" links per request
    (no replacement link added, since none was asked for).
  - Verified in build output: 27 pages now (up from 26, the new `/press/`
    route), nav shows Press between Publications and Software, dept name
    updated in all 4 intended spots, only one `<h2>` remains on the
    homepage ("Recent News"), zero "View all" text anywhere on it, and the
    5 merged items are in correct chronological order spanning both
    collections (2025 press → 2023 lab post → 2023 press → 2021 lab post).

## Next: Phase 3 — Decap CMS integration

Not started. Needs: `public/admin/index.html` + `config.yml` defining Decap
collections matching the schemas in `src/content.config.ts` (note the
`people.links` list-with-type-dropdown design above), a GitHub OAuth App +
small OAuth proxy (Cloudflare Worker recommended, e.g. the
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
