export function formatNumberId(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}
