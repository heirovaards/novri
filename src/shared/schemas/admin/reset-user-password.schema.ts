import { z } from 'zod';
import '../common/zod-error-map-id';

export const resetUserPasswordSchema = z
  .object({
    userId: z.string(),
    newPassword: z.string().min(10).regex(/[A-Za-z]/).regex(/[0-9]/),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Konfirmasi kata sandi tidak cocok.',
    path: ['confirmNewPassword'],
  });
