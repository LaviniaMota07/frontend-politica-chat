import { z } from 'zod';

export const createChatSchema = z.object({
  title: z
    .string()
    .min(3, 'O título deve ter no mínimo 3 caracteres')
    .max(100, 'O título deve ter no máximo 100 caracteres'),
});

export type CreateChatFormData = z.infer<typeof createChatSchema>;

export const shareChatSchema = z.object({
  email: z.string('E-mail é um campo obrigatório').email('E-mail inválido'),
  permission: z.number('permissão é um campo obrigatório').positive('Permissão invalida'),
  userId: z.number('ID do usuário é um campo obrigatório'),
});

export type ShareChatFormData = z.infer<typeof shareChatSchema>;
