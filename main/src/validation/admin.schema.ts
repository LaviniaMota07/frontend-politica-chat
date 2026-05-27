import { z } from 'zod';

export const inviteUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z
    .string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .max(32, 'A senha deve ter no máximo 32 caracteres'),
  role: z.enum(['Admin', 'Default']),
});

export type InviteUserFormData = z.infer<typeof inviteUserSchema>;

export const createModelSchema = z.object({
  modelNm: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
});

export type CreateModelFormData = z.infer<typeof createModelSchema>;

export const createKeySchema = z.object({
  modelIaId: z
    .string()
    .min(1, 'Selecione um modelo'),
  qtnToken: z
    .string()
    .min(1, 'Quantidade de tokens é obrigatória')
    .refine((val) => Number(val) >= 1, { message: 'Quantidade deve ser pelo menos 1' }),
});

export type CreateKeyFormData = z.infer<typeof createKeySchema>;

export const updateKeySchema = z.object({
  qtnToken: z
    .string()
    .min(1, 'Quantidade de tokens é obrigatória')
    .refine((val) => Number(val) >= 1, { message: 'Quantidade deve ser pelo menos 1' }),
});

export type UpdateKeyFormData = z.infer<typeof updateKeySchema>;

export const catalogSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  acronym: z
    .string()
    .min(2, 'Sigla deve ter pelo menos 2 caracteres')
    .max(5, 'Sigla deve ter no máximo 5 caracteres'),
  status: z.enum(['Ativo', 'Inativo']),
});

export type CatalogFormData = z.infer<typeof catalogSchema>;

export const uploadDocumentSchema = z.object({
  title: z
    .string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(150, 'Título deve ter no máximo 150 caracteres'),
});

export type UploadDocumentFormData = z.infer<typeof uploadDocumentSchema>;

export const newVersionSchema = z.object({
  fileId: z.string().min(1, 'ID do documento é obrigatório'),
  version: z
    .string()
    .min(1, 'Versão é obrigatória')
    .max(10, 'Versão deve ter no máximo 10 caracteres'),
});

export type NewVersionFormData = z.infer<typeof newVersionSchema>;

export const syncLinksSchema = z.object({
  documentId: z.string().min(1, 'ID do documento é obrigatório'),
});

export type SyncLinksFormData = z.infer<typeof syncLinksSchema>;
