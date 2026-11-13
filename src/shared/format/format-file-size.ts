const UNITS = ['KB', 'MB', 'GB'] as const;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;

  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < UNITS.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const formatted = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(value);
  return `${formatted} ${UNITS[unitIndex]}`;
}
