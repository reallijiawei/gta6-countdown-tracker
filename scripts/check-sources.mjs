import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { applyCheckResults, checkSource, createCheckSummary } from './source-checker.mjs';

const root = process.cwd();
const dataDir = join(root, 'src', 'data');
const checkedAt = new Date().toISOString();
const checkedDate = checkedAt.slice(0, 10);

const sources = [
  {
    id: 'rockstar-gta-vi',
    label: 'Rockstar GTA VI official page',
    url: 'https://www.rockstargames.com/VI',
    signals: ['PlayStation 5', 'Xbox Series X|S'],
  },
  {
    id: 'rockstar-gta-vi-release-date',
    label: 'Rockstar Newswire release date article',
    url: 'https://www.rockstargames.com/newswire/article/ak3ak31a49a221/grand-theft-auto-vi-is-now-set-to-launch-november-19-2026',
    signals: ['November 19, 2026'],
  },
  {
    id: 'playstation-store-gta-vi',
    label: 'PlayStation Store GTA VI page',
    url: 'https://store.playstation.com/concept/10000730',
    signals: [],
  },
];

async function readJson(file) {
  return JSON.parse(await readFile(join(dataDir, file), 'utf8'));
}

async function writeJson(file, value) {
  await writeFile(join(dataDir, file), `${JSON.stringify(value, null, 2)}\n`);
}

const [game, prices, preorders, updates] = await Promise.all([
  readJson('game.json'),
  readJson('prices.json'),
  readJson('preorders.json'),
  readJson('updates.json'),
]);

const sourceResults = [];
for (const source of sources) {
  sourceResults.push(await checkSource(source, checkedAt));
}

const summary = createCheckSummary(sourceResults, checkedDate);
const next = applyCheckResults({ game, prices, preorders, checkedDate });

const updateTitle =
  summary.overallStatus === 'ok'
    ? 'Daily source check completed'
    : 'Daily source check needs review';
const updateSummary =
  summary.overallStatus === 'ok'
    ? 'Tracked official sources were reachable and expected public signals remained present.'
    : 'At least one tracked source was unreachable or missing an expected signal. Keep public statuses conservative until manual review.';

const nextUpdates = [
  {
    date: checkedDate,
    title: updateTitle,
    type: 'source_check',
    summary: updateSummary,
    sourceName: 'Daily source checker',
    sourceUrl: '',
  },
  ...updates.filter((item) => item.date !== checkedDate || item.type !== 'source_check'),
];

await Promise.all([
  writeJson('game.json', next.game),
  writeJson('prices.json', next.prices),
  writeJson('preorders.json', next.preorders),
  writeJson('updates.json', nextUpdates),
  writeJson('source-checks.json', summary),
]);

console.log(`${summary.overallStatus}: checked ${sourceResults.length} sources on ${checkedDate}`);
for (const source of sourceResults) {
  console.log(
    `${source.ok ? 'OK' : 'FAIL'} ${source.id} status=${source.status ?? 'n/a'} matched=${source.matchedSignals.length} missing=${source.missingSignals.length}`,
  );
}
