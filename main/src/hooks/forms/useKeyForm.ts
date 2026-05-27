import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createKeySchema,
  updateKeySchema,
  type CreateKeyFormData,
  type UpdateKeyFormData,
} from '../../validation/admin.schema';

export type { CreateKeyFormData, UpdateKeyFormData };

export function useCreateKeyForm(defaultModelId?: string) {
  return useForm<CreateKeyFormData>({
    resolver: zodResolver(createKeySchema),
    defaultValues: {
      modelIaId: defaultModelId ?? '',
      qtnToken: '',
    },
  });
}

export function useUpdateKeyForm(defaultQtnToken?: number) {
  return useForm<UpdateKeyFormData>({
    resolver: zodResolver(updateKeySchema),
    defaultValues: {
      qtnToken: defaultQtnToken ? String(defaultQtnToken) : '',
    },
  });
}
