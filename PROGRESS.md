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

## Next: Phase 2 — Design & build pages

Not started. Needs: base layout (nav/footer), home page, news index/detail,
people directory (grouped by `status`), publications list, software list,
research/contact static pages, RSS feed via `@astrojs/rss`.

## How to resume this work

```
git checkout development
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"   # node not on default PATH in this env
npm install
npm run dev      # local preview at http://localhost:4321
npm run build    # production build to dist/
```
