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

const navigation = defineCollection({
  loader: file('./src/content/data/navigation.yml'),
  schema: z.object({
    title: z.string(),
    url: z.string(),
    excerpt: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
  }),
});

const footer = defineCollection({
  loader: file('./src/content/data/footer.yml'),
  schema: z.object({
    title: z.string(),
    url: z.string(),
  }),
});

export const collections = { posts, people, publications, software, pages, navigation, footer };
