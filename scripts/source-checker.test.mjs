import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCheckResults, createCheckSummary } from './source-checker.mjs';

test('createCheckSummary marks the run as checked and preserves conservative statuses', () => {
  const now = '2026-05-27';
  const summary = createCheckSummary(
    [
      {
        id: 'rockstar-gta-vi',
        label: 'Rockstar GTA VI',
        url: 'https://www.rockstargames.com/VI',
        ok: true,
        status: 200,
        matchedSignals: ['PlayStation 5', 'Xbox Series X|S'],
        missingSignals: [],
        checkedAt: `${now}T01:00:00.000Z`,
      },
    ],
    now,
  );

  assert.equal(summary.lastChecked, now);
  assert.equal(summary.overallStatus, 'ok');
  assert.equal(summary.sources[0].matchedSignals.length, 2);
});

test('applyCheckResults updates freshness dates without inventing prices', () => {
  const now = '2026-05-27';
  const game = {
    officialPriceStatus: 'not_officially_announced',
    preorderStatus: 'not_live',
    lastUpdated: '2026-05-26',
  };
  const prices = [{ price: null, status: 'not_officially_announced', lastChecked: '2026-05-26' }];
  const preorders = [{ status: 'not_live', lastChecked: '2026-05-26' }];

  const next = applyCheckResults({ game, prices, preorders, checkedDate: now });

  assert.equal(next.game.lastUpdated, now);
  assert.equal(next.game.officialPriceStatus, 'not_officially_announced');
  assert.equal(next.prices[0].price, null);
  assert.equal(next.prices[0].lastChecked, now);
  assert.equal(next.preorders[0].status, 'not_live');
  assert.equal(next.preorders[0].lastChecked, now);
});
