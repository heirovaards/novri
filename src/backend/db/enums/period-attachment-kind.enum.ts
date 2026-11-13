import { pgEnum } from 'drizzle-orm/pg-core';

export const periodAttachmentKindEnum = pgEnum('period_attachment_kind', [
  'org_chart',
  'roadmap_penelitian',
  'roadmap_pkm',
  'sk_pendirian',
  'sk_pembukaan',
  'sk_akreditasi',
]);
