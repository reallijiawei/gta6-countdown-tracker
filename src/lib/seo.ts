import faqs from '../data/faqs.json';
import game from '../data/game.json';

export const siteName = 'GTA 6 Price & Countdown Tracker';
export const baseUrl = 'https://launchdaytracker.online';
export const defaultSocialImage = '/og-image.svg';

export function canonical(pathname: string) {
  const path = pathname === '/' ? '' : pathname;
  return `${baseUrl}${path}`;
}

export function socialImageUrl(_pathname = '/') {
  return `${baseUrl}${defaultSocialImage}`;
}

export function faqSchema(items = faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function faqItems(limit?: number) {
  return limit ? faqs.slice(0, limit) : faqs;
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: baseUrl,
  };
}

export function breadcrumbSchema(items: Array<{ name: string; pathname: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonical(item.pathname),
    })),
  };
}

export function videoGameSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.title,
    url: canonical('/'),
    publisher: game.publisher,
    developer: game.developer,
    gamePlatform: game.platforms,
    datePublished: game.releaseDate,
  };
}
