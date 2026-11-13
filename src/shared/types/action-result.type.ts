export type RuleViolation = { ruleId: string; severity: 'error' | 'warning'; message: string; field?: string };

export type ActionResult<T = void> =
  | { ok: true; data: T; violations?: RuleViolation[] }
  | { ok: false; code: ActionErrorCode; message: string; fieldErrors?: Record<string, string>; violations?: RuleViolation[] };

export type ActionErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INVALID_INPUT'
  | 'VALIDATION_FAILED'
  | 'WARNING_NOTE_REQUIRED'
  | 'CONFLICT'
  | 'PERIOD_LOCKED'
  | 'NO_ACTIVE_PERIOD'
  | 'IN_USE'
  | 'UNEXPECTED';
