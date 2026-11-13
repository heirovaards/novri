import { describe, expect, it } from 'vitest';
import { formatRupiahJuta } from './format-rupiah-juta';

describe('formatRupiahJuta', () => {
  it('converts rupiah to Rp juta with two decimals', () => {
    expect(formatRupiahJuta(40_000_000)).toBe('40,00');
  });

  it('accepts a bigint', () => {
    expect(formatRupiahJuta(40_000_000n)).toBe('40,00');
  });

  it('formats thousands of juta with a dot separator', () => {
    expect(formatRupiahJuta(1_234_560_000)).toBe('1.234,56');
  });

  it('formats zero', () => {
    expect(formatRupiahJuta(0)).toBe('0,00');
  });
});
