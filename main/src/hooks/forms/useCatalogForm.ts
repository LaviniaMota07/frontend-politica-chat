import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { catalogSchema, type CatalogFormData } from '../../validation/admin.schema';

export type { CatalogFormData };

export function useCatalogForm(defaults?: Partial<CatalogFormData>) {
  return useForm<CatalogFormData>({
    resolver: zodResolver(catalogSchema),
    defaultValues: {
      name: '',
      acronym: '',
      status: 'Ativo',
      ...defaults,
    },
  });
}
