// Renders every page type of the site, in both locales, through the Astro
// Container API. Shared by the a11y, structure and mixed-language tests.
//
// Pages backed by a content collection render empty under the Container API
// (no content-layer sync in vitest), so each of those is rendered twice: the
// real page (the empty state) and the presentational component wrapped in
// BaseLayout with fixture items — the same components the real pages use.
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import BaseLayout from '../../src/layouts/BaseLayout.astro';
import AboutView from '../../src/components/AboutView.astro';
import EventsList from '../../src/components/EventsList.astro';
import EventDetail from '../../src/components/EventDetail.astro';
import GalleryGrid from '../../src/components/GalleryGrid.astro';
import HomeView from '../../src/components/HomeView.astro';
import HomePage from '../../src/pages/[lang]/index.astro';
import ServicesPage from '../../src/pages/[lang]/services.astro';
import CalendarPage from '../../src/pages/[lang]/calendar.astro';
import GivingPage from '../../src/pages/[lang]/giving.astro';
import ContactPage from '../../src/pages/[lang]/contact.astro';
import ClergyPage from '../../src/pages/[lang]/clergy.astro';
import EventsIndexPage from '../../src/pages/[lang]/events/index.astro';
import GalleryPage from '../../src/pages/[lang]/gallery.astro';
import RootRedirect from '../../src/pages/index.astro';
import NotFoundPage from '../../src/pages/404.astro';
import FixtureBody from '../fixtures/FixtureBody.astro';
import FixtureBodyAm from '../fixtures/FixtureBodyAm.astro';
import { LOCALES, t, type Locale } from '../../src/i18n/index';
import { siteConfig } from '../../src/data/site';
import type { EventItem } from '../../src/lib/events';
import type { GalleryItem } from '../../src/lib/gallery';

type Component = Parameters<AstroContainer['renderToString']>[0];
const page = (c: unknown) => c as Component;

export interface RenderedPage {
  /** e.g. "gallery (items) — am" */
  name: string;
  lang: Locale | null;
  /** Full-document pages without the site chrome (header/nav/main/footer). */
  bare: boolean;
  html: string;
}

function eventFixtures(): EventItem[] {
  return [
    {
      slug: 'fixture-picnic',
      data: {
        type: 'event',
        title: { en: 'Fixture Picnic', am: 'የሙከራ ምሳ' },
        summary: { en: 'A fixture event summary.', am: 'የሙከራ ዝግጅት ማጠቃለያ።' },
        date: '2027-01-15',
        endDate: '2027-01-16',
        time: '1:00 PM',
        location: { en: 'Fellowship Hall', am: 'የኅብረት አዳራሽ' },
        bodyLang: 'en',
        draft: false,
      },
    },
    {
      slug: 'fixture-notice',
      data: {
        type: 'announcement',
        title: { en: 'Fixture Notice', am: 'የሙከራ ማስታወቂያ' },
        summary: { en: 'A fixture announcement.', am: 'የሙከራ ማስታወቂያ ማጠቃለያ።' },
        date: '2026-12-01',
        bodyLang: 'am',
        draft: false,
      },
    },
  ];
}

function galleryFixtures(): GalleryItem[] {
  return [
    {
      slug: 'placeholder-1',
      data: {
        image: 'images/gallery/placeholder-1.svg',
        width: 800,
        height: 600,
        alt: { en: 'Placeholder image', am: 'ጊዜያዊ ምስል' },
        caption: { en: 'A placeholder caption', am: 'የጊዜያዊ ምስል መግለጫ' },
        order: 1,
        placeholder: true,
      },
    },
    {
      slug: 'fixture-photo',
      data: {
        image: 'images/gallery/fixture-photo.jpg',
        width: 1200,
        height: 800,
        alt: { en: 'Parishioners after the liturgy', am: 'ምእመናን ከቅዳሴ በኋላ' },
        caption: { en: 'A fixture caption', am: 'የሙከራ መግለጫ' },
        date: '2026-09-27',
        placeholder: false,
      },
    },
  ];
}

async function renderAll(): Promise<RenderedPage[]> {
  const container = await AstroContainer.create();
  const out: RenderedPage[] = [];

  const render = (component: Component, lang: Locale, path: string, options: object = {}) =>
    container.renderToString(component, {
      params: { lang },
      request: new Request(`http://localhost/${lang}/${path}`),
      ...options,
    });

  const inLayout = async (lang: Locale, path: string, title: string, body: string) =>
    container.renderToString(BaseLayout, {
      props: { lang, title },
      slots: { default: body },
      request: new Request(`http://localhost/${lang}/${path}`),
    });

  for (const lang of LOCALES) {
    const add = (name: string, html: string) => out.push({ name: `${name} — ${lang}`, lang, bare: false, html });

    add('home', await render(page(HomePage), lang, ''));
    add(
      'home (announcements)',
      await inLayout(
        lang,
        '',
        t(lang, 'nav.home'),
        await container.renderToString(HomeView, {
          props: {
            lang,
            today: { year: 2027, month: 3, day: 10 },
            announcements: eventFixtures().map((e) => ({
              title: e.data.title[lang],
              date: { year: 2027, month: 1, day: 15 },
              href: `/${lang}/events/${e.slug}/`,
            })),
          },
        }),
      ),
    );
    add(
      'about',
      await container.renderToString(AboutView, {
        props: {
          lang,
          history: siteConfig.parish.history,
          sections: [
            {
              title: lang === 'am' ? 'ቤተ ክርስቲያን' : 'The Church',
              sources: [
                { title: 'Source A', url: 'https://example.org/a' },
                { title: 'Source B', url: 'https://example.org/b' },
              ],
              amReviewPending: lang === 'am',
              Content: lang === 'am' ? FixtureBodyAm : FixtureBody,
            },
          ],
        },
        request: new Request(`http://localhost/${lang}/about/`),
      }),
    );
    add('services', await render(page(ServicesPage), lang, 'services/'));
    add('calendar', await render(page(CalendarPage), lang, 'calendar/'));
    add('giving', await render(page(GivingPage), lang, 'giving/'));
    add('contact', await render(page(ContactPage), lang, 'contact/'));
    add('clergy', await render(page(ClergyPage), lang, 'clergy/'));

    add('events list (empty)', await render(page(EventsIndexPage), lang, 'events/'));
    add(
      'events list (items)',
      await inLayout(
        lang,
        'events/',
        t(lang, 'nav.events'),
        `<h1>${t(lang, 'nav.events')}</h1>` +
          (await container.renderToString(EventsList, { props: { lang, items: eventFixtures() } })),
      ),
    );
    const detail = eventFixtures()[0];
    add(
      'event detail',
      await inLayout(
        lang,
        `events/${detail.slug}/`,
        detail.data.title[lang],
        await container.renderToString(EventDetail, {
          props: {
            lang,
            type: detail.data.type,
            title: detail.data.title[lang],
            summary: detail.data.summary[lang],
            date: { year: 2027, month: 1, day: 15 },
            endDate: { year: 2027, month: 1, day: 16 },
            time: detail.data.time,
            location: detail.data.location?.[lang],
            bodyLang: detail.data.bodyLang,
          },
          slots: { default: '<p>Fixture body in English.</p>' },
        }),
      ),
    );

    add('gallery (empty)', await render(page(GalleryPage), lang, 'gallery/'));
    add(
      'gallery (items)',
      await inLayout(
        lang,
        'gallery/',
        t(lang, 'nav.gallery'),
        `<h1>${t(lang, 'nav.gallery')}</h1>` +
          (await container.renderToString(GalleryGrid, { props: { lang, items: galleryFixtures() } })),
      ),
    );
  }

  out.push({
    name: 'root redirect',
    lang: null,
    bare: true,
    html: await container.renderToString(page(RootRedirect), { request: new Request('http://localhost/') }),
  });
  out.push({
    name: '404',
    lang: 'en',
    bare: false,
    html: await container.renderToString(page(NotFoundPage), {
      request: new Request('http://localhost/no/such/page/'),
    }),
  });

  return out;
}

let cache: Promise<RenderedPage[]> | undefined;

/** Every page type in both locales, rendered once per test file. */
export function renderAllPages(): Promise<RenderedPage[]> {
  cache ??= renderAll();
  return cache;
}
