import { describe, expect, it } from 'vitest';
import { runAction } from './run-action';
import { DomainError } from './domain-error';

describe('runAction', () => {
  it('returns ok with the data on success', async () => {
    await expect(runAction(async () => 'value')).resolves.toEqual({ ok: true, data: 'value' });
  });

  it('converts a thrown DomainError into a coded ActionResult, not an unhandled rejection', async () => {
    const result = await runAction(async () => {
      throw new DomainError('FORBIDDEN', 'Anda tidak memiliki akses untuk tindakan ini.');
    });
    expect(result).toEqual({ ok: false, code: 'FORBIDDEN', message: 'Anda tidak memiliki akses untuk tindakan ini.' });
  });
});
