import type { ActionResult } from '@shared/types/action-result.type';
import { toActionResult } from './to-action-result';

export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    return toActionResult(error);
  }
}
