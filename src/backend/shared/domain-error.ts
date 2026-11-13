import type { ActionErrorCode } from '@shared/types/action-result.type';

export class DomainError extends Error {
  readonly code: ActionErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: ActionErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.details = details;
  }
}
