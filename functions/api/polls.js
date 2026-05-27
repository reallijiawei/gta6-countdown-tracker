import { createPollState, mergePollState, recordVote, serializePolls } from '../../scripts/polls-core.mjs';

const STORAGE_KEY = 'polls:v1';

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...init.headers,
    },
  });
}

async function readState(env) {
  const stored = await env.POLL_KV?.get(STORAGE_KEY, 'json');
  return mergePollState(stored ?? createPollState());
}

async function writeState(env, state) {
  await env.POLL_KV.put(STORAGE_KEY, JSON.stringify(state));
}

export async function onRequestGet({ env }) {
  if (!env.POLL_KV) {
    return json({ error: 'Poll storage is not configured.' }, { status: 500 });
  }

  const state = await readState(env);
  return json({ polls: serializePolls(state) });
}

export async function onRequestPost({ request, env }) {
  if (!env.POLL_KV) {
    return json({ error: 'Poll storage is not configured.' }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (typeof body?.pollId !== 'string' || typeof body?.optionId !== 'string') {
    return json({ error: 'pollId and optionId are required.' }, { status: 400 });
  }

  try {
    const current = await readState(env);
    const next = recordVote(current, body.pollId, body.optionId);
    await writeState(env, next);
    return json({ polls: serializePolls(next) });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unable to record vote.' }, { status: 400 });
  }
}
