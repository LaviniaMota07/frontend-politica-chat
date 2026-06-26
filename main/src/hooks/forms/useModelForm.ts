import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createModelSchema, type CreateModelFormData } from '../../validation/admin.schema';

export type { CreateModelFormData };

export function useModelForm() {
  return useForm<CreateModelFormData>({
    resolver: zodResolver(createModelSchema),
    defaultValues: {
      modelNm: '',
      chatModel: '',
    },
  });
}
