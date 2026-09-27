// Pure helpers for the gallery collection — no `astro:content` import, so
// this module (and its tests) never need the content layer.
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { GalleryEntry } from '../content/schemas';

export interface GalleryItem {
  slug: string;
  data: GalleryEntry;
}

/** By `order` ascending (entries without one sort last), then `date` descending, then slug. */
export function sortGallery<T extends GalleryItem>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    const ao = a.data.order;
    const bo = b.data.order;
    if (ao !== bo) {
      if (ao === undefined) return 1;
      if (bo === undefined) return -1;
      return ao - bo;
    }
    const ad = a.data.date;
    const bd = b.data.date;
    if (ad !== bd) {
      if (ad === undefined) return 1;
      if (bd === undefined) return -1;
      return ad < bd ? 1 : -1;
    }
    return a.slug.localeCompare(b.slug);
  });
}

/** Entries whose `image` file does not exist under `publicDir`. Never guesses; a typo must be caught, not silently shipped. */
export function missingImages<T extends GalleryItem>(
  items: readonly T[],
  publicDir: string,
): T[] {
  return items.filter((item) => !existsSync(resolve(publicDir, item.data.image)));
}
