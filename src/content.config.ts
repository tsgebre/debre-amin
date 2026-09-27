import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { aboutSchema } from './content/schemas';

const about = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/about' }),
  schema: aboutSchema,
});

export const collections = { about };
