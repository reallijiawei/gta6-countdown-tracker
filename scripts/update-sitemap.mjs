import { readFile, writeFile } from 'node:fs/promises';

const sitemapPath = new URL('../public/sitemap.xml', import.meta.url);
const gamePath = new URL('../src/data/game.json', import.meta.url);

function clampToIsoDate(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

const game = JSON.parse(await readFile(gamePath, 'utf8'));
const lastUpdated = clampToIsoDate(game?.lastUpdated) ?? new Date().toISOString().slice(0, 10);

const sitemapXml = await readFile(sitemapPath, 'utf8');

const updatedXml = sitemapXml.replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, `<lastmod>${lastUpdated}</lastmod>`);

if (updatedXml !== sitemapXml) {
  await writeFile(sitemapPath, updatedXml, 'utf8');
  console.log(`sitemap.xml lastmod updated to ${lastUpdated}`);
} else {
  console.log(`sitemap.xml lastmod already ${lastUpdated}`);
}

