import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { aboutSchema, eventSchema } from './content/schemas';

const about = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/about' }),
  schema: aboutSchema,
});

// Files starting with "_" (the template) are never published.
const events = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/events' }),
  schema: eventSchema,
});

export const collections = { about, events };
