import { z } from 'zod';
import '../common/zod-error-map-id';

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
