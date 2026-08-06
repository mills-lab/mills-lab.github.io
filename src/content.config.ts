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

const people = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/people' }),
  schema: z.object({
    publish: z.boolean().default(true),
    status: z.enum(['pi', 'phd', 'alumni', 'researchinvestigator']),
    name: z.string(),
    title: z.string().optional(),
    line1: z.string().optional(),
    line2: z.string().optional(),
    line3: z.string().optional(),
    picture: z.string().optional(),
    googleScholar: z.string().optional(),
    cv: z.string().optional(),
    linkedIn: z.string().optional(),
    twitter: z.string().optional(),
    email: z.string().optional(),
    startDate: z.coerce.date().optional(),
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

// Press/media coverage of lab publications, shown in the homepage's
// "Latest Research" section (distinct from `posts`, which is lab news).
const media = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/media' }),
  schema: z.object({
    title: z.string(),
    source: z.string(),
    url: z.string(),
    date: z.coerce.date(),
    excerpt: z.string().optional(),
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

export const collections = { posts, people, publications, software, media, pages, navigation, footer };
