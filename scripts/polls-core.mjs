export function createPollState() {
  return {
    price: {
      id: 'price',
      label: 'What do you think GTA 6 will cost?',
      options: [
        { id: 'price-6999', label: '$69.99', votes: 28 },
        { id: 'price-7999', label: '$79.99', votes: 34 },
        { id: 'price-8999', label: '$89.99', votes: 21 },
        { id: 'price-9999-plus', label: '$99.99+', votes: 17 },
      ],
    },
    platform: {
      id: 'platform',
      label: 'Which platform will you play on?',
      options: [
        { id: 'platform-ps5', label: 'PlayStation 5', votes: 46 },
        { id: 'platform-xbox', label: 'Xbox Series X|S', votes: 31 },
        { id: 'platform-pc', label: 'Waiting for PC', votes: 23 },
      ],
    },
  };
}

export function mergePollState(storedState) {
  const defaults = createPollState();
  if (!storedState || typeof storedState !== 'object') return defaults;

  return Object.fromEntries(
    Object.entries(defaults).map(([pollId, poll]) => {
      const storedPoll = storedState[pollId];
      return [
        pollId,
        {
          ...poll,
          options: poll.options.map((option) => {
            const storedOption = storedPoll?.options?.find((item) => item.id === option.id);
            return {
              ...option,
              votes: Number.isSafeInteger(storedOption?.votes) && storedOption.votes >= 0 ? storedOption.votes : option.votes,
            };
          }),
        },
      ];
    }),
  );
}

export function recordVote(state, pollId, optionId) {
  const normalized = mergePollState(state);
  const poll = normalized[pollId];
  if (!poll) throw new Error(`Unknown poll: ${pollId}`);

  const hasOption = poll.options.some((option) => option.id === optionId);
  if (!hasOption) throw new Error(`Unknown option: ${optionId}`);

  return {
    ...normalized,
    [pollId]: {
      ...poll,
      options: poll.options.map((option) => ({
        ...option,
        votes: option.id === optionId ? option.votes + 1 : option.votes,
      })),
    },
  };
}

function percentages(options) {
  const total = options.reduce((sum, option) => sum + option.votes, 0);
  if (total === 0) return options.map(() => 0);

  const raw = options.map((option) => (option.votes / total) * 100);
  const rounded = raw.map(Math.floor);
  let remainder = 100 - rounded.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);

  for (const item of order) {
    if (remainder <= 0) break;
    rounded[item.index] += 1;
    remainder -= 1;
  }

  return rounded;
}

export function serializePolls(state) {
  const normalized = mergePollState(state);

  return Object.fromEntries(
    Object.entries(normalized).map(([pollId, poll]) => {
      const optionPercentages = percentages(poll.options);
      const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

      return [
        pollId,
        {
          ...poll,
          totalVotes,
          options: poll.options.map((option, index) => ({
            ...option,
            percent: optionPercentages[index],
          })),
        },
      ];
    }),
  );
}
