export type Role = 'admin_sistem' | 'kaprodi' | 'admin_prodi' | 'dtpr' | 'dosen';

export type Capability =
  | 'users.manage'
  | 'refs.manage'
  | 'audit.view'
  | 'period.create'
  | 'period.submit'
  | 'period.reopen'
  | 'period.view'
  | 'settings.validation'
  | 'master.manage'
  | 'import.run'
  | 'entries.manage_all'
  | 'entries.manage_own'
  | 'curriculum.edit_own'
  | 'entries.verify'
  | 'table.nihil'
  | 'preview.view'
  | 'export.run'
  | 'dashboard.full'
  | 'dashboard.my_tasks'
  | 'evidence.view_all'
  | 'evidence.view_own';
