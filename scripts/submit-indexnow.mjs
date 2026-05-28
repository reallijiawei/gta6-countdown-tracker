import { readFile } from 'node:fs/promises';

const host = 'launchdaytracker.online';
const key = 'b2d94a4c5ca04a5893ea8470ef0b0ce2';
const keyLocation = `https://${host}/${key}.txt`;
const endpoint = 'https://api.indexnow.org/indexnow';

function extractUrls(sitemapXml) {
  return Array.from(sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1])
    .filter((url) => url.startsWith(`https://${host}/`) || url === `https://${host}`);
}

const sitemapXml = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const urlList = extractUrls(sitemapXml);

if (urlList.length === 0) {
  throw new Error(`No ${host} URLs found in public/sitemap.xml`);
}

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'content-type': 'application/json; charset=utf-8',
  },
  body: JSON.stringify({
    host,
    key,
    keyLocation,
    urlList,
  }),
});

const responseText = await response.text();

console.log(`IndexNow submitted ${urlList.length} URLs for ${host}`);
console.log(`HTTP ${response.status} ${response.statusText}`);

if (!response.ok && response.status !== 202) {
  throw new Error(responseText || 'IndexNow submission failed');
}

if (responseText) {
  console.log(responseText);
}
