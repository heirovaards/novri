import { describe, expect, it } from 'vitest';
import { changePasswordSchema } from './change-password.schema';

const BASE = { currentPassword: 'OldPass123', newPassword: 'NewPass123', confirmNewPassword: 'NewPass123' };

describe('changePasswordSchema', () => {
  it('accepts a password with at least 10 characters, a letter and a digit', () => {
    expect(changePasswordSchema.safeParse(BASE).success).toBe(true);
  });

  it('rejects a new password shorter than 10 characters', () => {
    const result = changePasswordSchema.safeParse({ ...BASE, newPassword: 'Short1', confirmNewPassword: 'Short1' });
    expect(result.success).toBe(false);
  });

  it('rejects a new password with no digit', () => {
    const result = changePasswordSchema.safeParse({ ...BASE, newPassword: 'NoDigitsHere', confirmNewPassword: 'NoDigitsHere' });
    expect(result.success).toBe(false);
  });

  it('rejects a new password with no letter', () => {
    const result = changePasswordSchema.safeParse({ ...BASE, newPassword: '1234567890', confirmNewPassword: '1234567890' });
    expect(result.success).toBe(false);
  });

  it('rejects when confirmation does not match', () => {
    const result = changePasswordSchema.safeParse({ ...BASE, confirmNewPassword: 'Different123' });
    expect(result.success).toBe(false);
  });

  it('rejects when the new password equals the current password', () => {
    const result = changePasswordSchema.safeParse({ ...BASE, newPassword: BASE.currentPassword, confirmNewPassword: BASE.currentPassword });
    expect(result.success).toBe(false);
  });
});
