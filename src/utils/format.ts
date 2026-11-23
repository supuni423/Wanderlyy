/**
 * Small, pure display helpers for country data. Formatting is done by
 * hand (not Intl) so the output is the same on every phone and in tests.
 */

/** 1234567 -> "1,234,567" */
export function formatNumber(value: number): string {
  const [whole, fraction] = Math.abs(Math.round(value * 10) / 10)
    .toString()
    .split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = value < 0 ? '-' : '';
  return fraction ? `${sign}${grouped}.${fraction}` : `${sign}${grouped}`;
}

/** Short population for cards: 950 -> "950", 1_234_567 -> "1.2M". */
export function formatCompact(value: number): string {
  const units: [number, string][] = [
    [1e3, 'K'],
    [1e6, 'M'],
    [1e9, 'B'],
  ];
  const oneDecimal = (n: number) => Math.round(n * 10) / 10;
  for (let i = units.length - 1; i >= 0; i--) {
    const [size, suffix] = units[i];
    if (Math.abs(value) >= size) {
      const short = oneDecimal(value / size);
      // 999_950 would read "1000K": move up to the next unit ("1M").
      if (Math.abs(short) >= 1000 && i < units.length - 1) {
        const [bigSize, bigSuffix] = units[i + 1];
        return `${oneDecimal(value / bigSize)}${bigSuffix}`;
      }
      return `${short}${suffix}`;
    }
  }
  return formatNumber(value);
}

export function formatPopulation(value: number): string {
  return value > 0 ? formatNumber(value) : 'Unknown';
}

/** 377975 -> "377,975 km²" */
export function formatArea(km2: number | null): string {
  return km2 === null ? 'Unknown' : `${formatNumber(km2)} km²`;
}

/** ["Japanese"] -> "Japanese"; [] -> fallback */
export function formatList(items: string[], fallback = 'None'): string {
  return items.length > 0 ? items.join(', ') : fallback;
}

/** ["81"] -> "+81"; already-prefixed codes are left alone. */
export function formatCallingCodes(codes: string[]): string {
  return formatList(
    codes.map(code => (code.startsWith('+') ? code : `+${code}`)),
  );
}

/**
 * How long ago something was saved, in plain words:
 * "just now", "5 min ago", "3 h ago", "yesterday", "4 days ago".
 */
export function formatTimeAgo(timestamp: number, now = Date.now()): string {
  const minutes = Math.floor(Math.max(0, now - timestamp) / 60_000);
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} h ago`;
  }
  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}
