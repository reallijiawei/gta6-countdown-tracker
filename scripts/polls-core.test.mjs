import test from 'node:test';
import assert from 'node:assert/strict';
import { createPollState, recordVote, serializePolls } from './polls-core.mjs';

test('createPollState returns empty polls with stable options', () => {
  const state = createPollState();

  assert.equal(state.price.options.length, 4);
  assert.equal(state.platform.options.length, 3);
  assert.equal(state.price.options[0].id, 'price-6999');
  assert.equal(state.price.options[0].votes, 0);
});

test('recordVote increments only the selected option', () => {
  const state = createPollState();
  const previous = state.price.options.find((option) => option.id === 'price-7999').votes;

  const next = recordVote(state, 'price', 'price-7999');

  assert.equal(next.price.options.find((option) => option.id === 'price-7999').votes, previous + 1);
  assert.equal(next.platform.options.find((option) => option.id === 'platform-ps5').votes, 0);
});

test('serializePolls returns whole-number percentages that sum to 100', () => {
  const state = recordVote(recordVote(createPollState(), 'price', 'price-7999'), 'platform', 'platform-ps5');

  const publicPolls = serializePolls(state);
  const priceTotal = publicPolls.price.options.reduce((sum, option) => sum + option.percent, 0);
  const platformTotal = publicPolls.platform.options.reduce((sum, option) => sum + option.percent, 0);

  assert.equal(priceTotal, 100);
  assert.equal(platformTotal, 100);
});

test('recordVote rejects unknown poll and option ids', () => {
  const state = createPollState();

  assert.throws(() => recordVote(state, 'unknown', 'price-6999'), /Unknown poll/);
  assert.throws(() => recordVote(state, 'price', 'unknown'), /Unknown option/);
});
