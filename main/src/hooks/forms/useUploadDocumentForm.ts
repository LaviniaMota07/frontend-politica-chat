import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { uploadDocumentSchema, type UploadDocumentFormData } from '../../validation/admin.schema';

export type { UploadDocumentFormData };

export function useUploadDocumentForm() {
  return useForm<UploadDocumentFormData>({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: {
      title: '',
    },
  });
}
