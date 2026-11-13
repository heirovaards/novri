import { describe, expect, it } from 'vitest';
import { formatNumberId } from './format-number-id';

describe('formatNumberId', () => {
  it('uses a dot as the thousands separator', () => {
    expect(formatNumberId(1234)).toBe('1.234');
  });

  it('formats numbers below 1000 without a separator', () => {
    expect(formatNumberId(42)).toBe('42');
  });

  it('formats zero', () => {
    expect(formatNumberId(0)).toBe('0');
  });
});
