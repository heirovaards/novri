import { z } from 'zod';
import '../common/zod-error-map-id';

export const userSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(1).max(200),
    email: z.email(),
    roles: z.array(z.enum(['admin_sistem', 'kaprodi', 'admin_prodi', 'dtpr', 'dosen'])).min(1),
    dosenId: z.string().uuid().nullable().optional(),
    password: z.string().min(10).regex(/[A-Za-z]/).regex(/[0-9]/).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.id && !data.password) {
      ctx.addIssue({ code: 'custom', message: 'Kata sandi awal wajib diisi.', path: ['password'] });
    }
  });
