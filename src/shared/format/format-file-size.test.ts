import { describe, expect, it } from 'vitest';
import { formatFileSize } from './format-file-size';

describe('formatFileSize', () => {
  it('formats bytes below 1 KB as bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('formats exact kilobytes without decimals', () => {
    expect(formatFileSize(2048)).toBe('2 KB');
  });

  it('formats fractional kilobytes with a comma decimal', () => {
    expect(formatFileSize(1536)).toBe('1,5 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(5_242_880)).toBe('5 MB');
  });
});
