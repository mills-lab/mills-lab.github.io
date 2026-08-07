import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    share: z.boolean().default(true),
    ads: z.boolean().default(true),
    externalUrl: z.string().optional(),
    gallery: z.string().optional(),
    image: z
      .object({
        teaser: z.string().optional(),
        feature: z.string().optional(),
      })
      .optional(),
  }),
});

// The preset external-link types a person card can show as an icon. `other`
// is the escape hatch — paired with a custom `label`, it's how Phase 3's
// CMS should let lab members add a link type beyond this initial list
// (e.g. ORCID, a lab wiki page) without a code change.
const PERSON_LINK_TYPES = ['cv', 'googleScholar', 'linkedin', 'github', 'twitter', 'website', 'email', 'other'] as const;

const people = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/people' }),
  schema: z.object({
    publish: z.boolean().default(true),
    // `phd` = current PhD student; alumni are split into their own values
    // so the People page can render them as separate sections.
    status: z.enum(['pi', 'phd', 'researchinvestigator', 'phd-alumni', 'other-alumni', 'rotation-alumni']),
    name: z.string(),
    title: z.string().optional(),
    line1: z.string().optional(),
    line2: z.string().optional(),
    line3: z.string().optional(),
    picture: z.string().optional(),
    startDate: z.coerce.date().optional(),
    // Only populated for people with a dedicated full profile page (so far
    // just the PI) - current titles/rank and educational background shown
    // there, plus the markdown body as the biography.
    titles: z.array(z.string()).optional(),
    education: z.array(z.string()).optional(),
    links: z
      .array(
        z.object({
          type: z.enum(PERSON_LINK_TYPES),
          label: z.string().optional(),
          url: z.string(),
        })
      )
      .default([]),
  }),
});

const publications = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/publications' }),
  schema: z.object({
    pmid: z.string().optional(),
    title: z.string(),
    authors: z.string(),
    pubdate: z.string().optional(),
    volume: z.string().optional(),
    issue: z.string().optional(),
    pages: z.string().optional(),
    journal: z.string().optional(),
  }),
});

const software = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/software' }),
  schema: z.object({
    title: z.string(),
    externalUrl: z.string().optional(),
    date: z.coerce.date().optional(),
    description: z.string().optional(),
    citation: z.string().optional(),
  }),
});

// "Press" coverage, shown at /press/ and mixed into the homepage's "Recent
// News" section (distinct from `posts`, which is lab news/updates): either
// third-party press coverage of a publication, or a lab-written summary of
// one. `image` is an optional thumbnail (filename under
// public/images/research/) — a representative figure from the paper, or
// the outlet's own art. When absent, the feed falls back to a text badge
// of `source`.
const research = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/research' }),
  schema: z.object({
    kind: z.enum(['media', 'publication']).default('media'),
    title: z.string(),
    source: z.string(),
    url: z.string(),
    date: z.coerce.date(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    relatedPmid: z.string().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    permalink: z.string().optional(),
    image: z
      .object({
        feature: z.string().optional(),
      })
      .optional(),
  }),
});

// `file()`'s data store doesn't guarantee it returns entries in source
// order, so each entry carries an explicit `order` field (set from its
// position in the source YAML array) that callers must sort by.
const navigation = defineCollection({
  loader: file('./src/content/data/navigation.yml'),
  schema: z.object({
    order: z.number(),
    title: z.string(),
    url: z.string(),
    excerpt: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
  }),
});

const footer = defineCollection({
  loader: file('./src/content/data/footer.yml'),
  schema: z.object({
    order: z.number(),
    title: z.string(),
    url: z.string(),
  }),
});

export const collections = { posts, people, publications, software, research, pages, navigation, footer };
