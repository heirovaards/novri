import { describe, expect, it } from 'vitest';
import { canPerform } from './can-perform';
import type { Capability, Role } from './capability.type';

const ALL_ROLES: Role[] = ['admin_sistem', 'kaprodi', 'admin_prodi', 'dtpr', 'dosen'];

// Independently transcribed from PRD §3.2, not from permission-matrix.ts, so this test
// actually catches a transcription mistake rather than checking the matrix against itself.
const EXPECTED: Record<Capability, Role[]> = {
  'users.manage': ['admin_sistem'],
  'period.reopen': ['admin_sistem'],
  'refs.manage': ['admin_sistem', 'kaprodi'],
  'audit.view': ['admin_sistem', 'kaprodi'],
  'period.create': ['kaprodi'],
  'period.submit': ['kaprodi'],
  'settings.validation': ['kaprodi'],
  'entries.verify': ['kaprodi'],
  'period.view': ['admin_sistem', 'kaprodi', 'admin_prodi'],
  'master.manage': ['kaprodi', 'admin_prodi'],
  'import.run': ['kaprodi', 'admin_prodi'],
  'entries.manage_all': ['kaprodi', 'admin_prodi'],
  'table.nihil': ['kaprodi', 'admin_prodi'],
  'preview.view': ['kaprodi', 'admin_prodi'],
  'export.run': ['kaprodi', 'admin_prodi'],
  'dashboard.full': ['kaprodi', 'admin_prodi'],
  'evidence.view_all': ['kaprodi', 'admin_prodi'],
  'entries.manage_own': ['kaprodi', 'admin_prodi', 'dtpr'],
  'evidence.view_own': ['kaprodi', 'admin_prodi', 'dtpr', 'dosen'],
  'dashboard.my_tasks': ['kaprodi', 'admin_prodi', 'dtpr', 'dosen'],
  'curriculum.edit_own': ['kaprodi', 'admin_prodi', 'dosen'],
};

describe('canPerform', () => {
  for (const capability of Object.keys(EXPECTED) as Capability[]) {
    for (const role of ALL_ROLES) {
      const expected = EXPECTED[capability].includes(role);
      it(`${capability} × ${role} → ${expected}`, () => {
        expect(canPerform({ roles: [role] }, capability)).toBe(expected);
      });
    }
  }

  it('is the union across multiple roles', () => {
    expect(canPerform({ roles: ['dosen'] }, 'users.manage')).toBe(false);
    expect(canPerform({ roles: ['dosen', 'admin_sistem'] }, 'users.manage')).toBe(true);
  });
});
