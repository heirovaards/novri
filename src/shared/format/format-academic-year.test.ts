import { describe, expect, it } from 'vitest';
import { formatAcademicYear } from './format-academic-year';

describe('formatAcademicYear', () => {
  it('formats a start year as "start/start+1"', () => {
    expect(formatAcademicYear(2025)).toBe('2025/2026');
  });
});
