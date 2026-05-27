import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newVersionSchema, type NewVersionFormData } from '../../validation/admin.schema';

export type { NewVersionFormData };

export function useNewVersionForm() {
  return useForm<NewVersionFormData>({
    resolver: zodResolver(newVersionSchema),
    defaultValues: {
      fileId: '',
      version: '2.0',
    },
  });
}
