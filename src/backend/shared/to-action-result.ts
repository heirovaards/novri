import { ZodError } from 'zod';
import type { ActionResult } from '@shared/types/action-result.type';
import { DomainError } from './domain-error';

export function toActionResult(error: unknown): ActionResult<never> {
  if (error instanceof DomainError) {
    return { ok: false, code: error.code, message: error.message };
  }

  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of error.issues) {
      const key = issue.path.join('.');
      if (key && !(key in fieldErrors)) fieldErrors[key] = issue.message;
    }
    return { ok: false, code: 'INVALID_INPUT', message: 'Data tidak valid.', fieldErrors };
  }

  console.error(error);
  return { ok: false, code: 'UNEXPECTED', message: 'Terjadi kesalahan. Coba lagi.' };
}
