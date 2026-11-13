import { NextResponse } from 'next/server';
import type { ActionErrorCode } from '@shared/types/action-result.type';
import { DomainError } from './domain-error';

const STATUS_BY_CODE: Record<ActionErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INVALID_INPUT: 400,
  VALIDATION_FAILED: 422,
  WARNING_NOTE_REQUIRED: 422,
  CONFLICT: 409,
  PERIOD_LOCKED: 409,
  NO_ACTIVE_PERIOD: 409,
  IN_USE: 409,
  UNEXPECTED: 500,
};

export function jsonErrorResponse(error: unknown): NextResponse {
  if (error instanceof DomainError) {
    return NextResponse.json({ code: error.code, message: error.message }, { status: STATUS_BY_CODE[error.code] });
  }

  console.error(error);
  return NextResponse.json({ code: 'UNEXPECTED', message: 'Terjadi kesalahan. Coba lagi.' }, { status: 500 });
}
