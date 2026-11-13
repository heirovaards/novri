import { describe, expect, it } from 'vitest';
import { formatDateId } from './format-date-id';

describe('formatDateId', () => {
  it('formats an ISO date string as "DD Mon YYYY"', () => {
    expect(formatDateId('2026-11-08')).toBe('08 Nov 2026');
  });

  it('formats a Date object', () => {
    expect(formatDateId(new Date('2026-11-08T00:00:00Z'))).toBe('08 Nov 2026');
  });
});
