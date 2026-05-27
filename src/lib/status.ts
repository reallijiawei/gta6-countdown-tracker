export const statusLabels: Record<string, string> = {
  not_officially_announced: 'Not officially announced',
  official: 'Official',
  placeholder: 'Placeholder listing',
  rumor: 'Rumor / unconfirmed',
  unavailable: 'Unavailable',
  not_live: 'Not live yet',
  wishlist: 'Wishlist available',
  live: 'Live',
  sold_out: 'Sold out',
  announced: 'Announced',
};

export const statusTone: Record<string, string> = {
  not_officially_announced: 'text-amber bg-amber/10',
  official: 'text-mint bg-mint/10',
  placeholder: 'text-cyan bg-cyan/10',
  rumor: 'text-coral bg-coral/10',
  unavailable: 'text-zinc-300 bg-white/5',
  not_live: 'text-amber bg-amber/10',
  wishlist: 'text-cyan bg-cyan/10',
  live: 'text-mint bg-mint/10',
  sold_out: 'text-coral bg-coral/10',
  announced: 'text-mint bg-mint/10',
};

export function labelFor(status: string) {
  return statusLabels[status] ?? status;
}

export function toneFor(status: string) {
  return statusTone[status] ?? 'text-zinc-300 bg-white/5';
}
