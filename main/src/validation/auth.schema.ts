import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' })
  .refine((value) => /[A-Z]/.test(value), {
    message: 'A senha deve conter pelo menos uma letra maiúscula.',
  })
  .refine((value) => /[a-z]/.test(value), {
    message: 'A senha deve conter pelo menos uma letra minúscula.',
  })
  .refine((value) => /[0-9]/.test(value), {
    message: 'A senha deve conter pelo menos um número.',
  })
  .refine((value) => /[^A-Za-z0-9]/.test(value), {
    message: 'A senha deve conter pelo menos um caractere especial.',
  });
