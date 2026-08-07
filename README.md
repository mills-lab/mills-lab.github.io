# Mills Lab Website

Source for [millslab.org](https://millslab.org), the website of the Mills
Lab (Ryan Mills, PI) at the University of Michigan's Gilbert S. Omenn
Department of Computational Medicine & Bioinformatics.

This is a rebuild of a previous Jekyll site, currently in progress on the
`development` branch — `master` still serves the live legacy site until
cutover. See `PROGRESS.md` for the full build history and current status,
and `CONTRIBUTING.md` for how content changes get made.

## Stack

- **[Astro](https://astro.build)** (TypeScript, static output) with
  **Tailwind CSS**
- Content lives as Markdown/YAML files under `src/content/`, typed and
  validated by [content collection](https://docs.astro.build/en/guides/content-collections/)
  schemas in `src/content.config.ts` — posts, people, publications,
  software, press coverage, and site-wide data (nav, footer) each have
  their own schema
- Deployed as a static site to **GitHub Pages** via GitHub Actions

## Local development

```
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # serve the production build locally
```

## Content workflow

Content changes (new posts, personnel updates, publications, etc.) are made
by describing the change to an AI coding assistant (Claude) with repo
access, which edits the relevant files and opens a pull request — no
separate CMS. Every change to `master` requires a PR (enforced by a GitHub
ruleset, not just convention). See `CONTRIBUTING.md` for details on the
workflow and where each content type lives.
