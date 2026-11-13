import { z } from 'zod';
import '../common/zod-error-map-id';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(10).regex(/[A-Za-z]/).regex(/[0-9]/),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Konfirmasi kata sandi tidak cocok.',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'Kata sandi baru harus berbeda dari kata sandi saat ini.',
    path: ['newPassword'],
  });
