import { describe, expect, it } from 'vitest';
import siteConfig from '../src/data/site';

describe('site config', () => {
  it('exports both English and Amharic site names', () => {
    expect(siteConfig.siteName.en).toBe(
      'Debre Amin Abune Teklehaymanot Ethiopian Orthodox Tewahedo Church'
    );
    expect(siteConfig.siteName.am).toBe('ደብረ አሚን አቡነ ተክለ ሃይማኖት');
  });
});
