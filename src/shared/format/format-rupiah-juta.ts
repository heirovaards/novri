export function formatRupiahJuta(rupiah: bigint | number): string {
  const juta = Number(rupiah) / 1_000_000;
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(juta);
}
