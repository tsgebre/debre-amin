import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { aboutSchema, eventSchema, gallerySchema } from './content/schemas';

const about = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/about' }),
  schema: aboutSchema,
});

// Files starting with "_" (the template) are never published.
const events = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/events' }),
  schema: eventSchema,
});

// Files starting with "_" (the template) are never published.
const gallery = defineCollection({
  loader: glob({ pattern: ['**/*.yaml', '!**/_*.yaml'], base: './src/content/gallery' }),
  schema: gallerySchema,
});

export const collections = { about, events, gallery };
