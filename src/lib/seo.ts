import faqs from '../data/faqs.json';

export const siteName = 'GTA 6 Price & Countdown Tracker';
export const baseUrl = 'https://launchdaytracker.online';

export function canonical(pathname: string) {
  const path = pathname === '/' ? '' : pathname;
  return `${baseUrl}${path}`;
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

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: baseUrl,
  };
}
