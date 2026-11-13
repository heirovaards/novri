import { z } from 'zod';
import { id } from 'zod/locales';

export const zodErrorMapId = z.config({ localeError: id().localeError });
