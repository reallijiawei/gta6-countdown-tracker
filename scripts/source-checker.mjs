export function createCheckSummary(sourceResults, checkedDate) {
  const failing = sourceResults.filter((source) => !source.ok || source.missingSignals.length > 0);

  return {
    lastChecked: checkedDate,
    overallStatus: failing.length === 0 ? 'ok' : 'needs_review',
    note:
      failing.length === 0
        ? 'Tracked official sources were reachable and expected public signals were present.'
        : 'One or more tracked sources changed or could not be verified. Manual review is recommended before changing public statuses.',
    sources: sourceResults,
  };
}

export function applyCheckResults({ game, prices, preorders, checkedDate }) {
  return {
    game: {
      ...game,
      lastUpdated: checkedDate,
    },
    prices: prices.map((item) => ({
      ...item,
      lastChecked: checkedDate,
    })),
    preorders: preorders.map((item) => ({
      ...item,
      lastChecked: checkedDate,
    })),
  };
}

export async function checkSource(source, checkedAt = new Date().toISOString()) {
  try {
    const response = await fetch(source.url, {
      headers: {
        'user-agent': 'Mozilla/5.0 GTA6CountdownTracker/0.1 (+unofficial source freshness check)',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    const text = await response.text();
    const matchedSignals = source.signals.filter((signal) => text.toLowerCase().includes(signal.toLowerCase()));
    const missingSignals = source.signals.filter((signal) => !matchedSignals.includes(signal));

    return {
      id: source.id,
      label: source.label,
      url: source.url,
      ok: response.ok,
      status: response.status,
      matchedSignals,
      missingSignals,
      checkedAt,
    };
  } catch (error) {
    return {
      id: source.id,
      label: source.label,
      url: source.url,
      ok: false,
      status: null,
      matchedSignals: [],
      missingSignals: source.signals,
      checkedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
