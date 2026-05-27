import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { syncLinksSchema, type SyncLinksFormData } from '../../validation/admin.schema';

export type { SyncLinksFormData };

export function useSyncLinksForm() {
  return useForm<SyncLinksFormData>({
    resolver: zodResolver(syncLinksSchema),
    defaultValues: {
      documentId: '',
    },
  });
}
