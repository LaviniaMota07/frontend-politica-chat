import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inviteUserSchema, type InviteUserFormData } from '../../validation/admin.schema';

export type { InviteUserFormData };

export function useInviteUserForm() {
  return useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'Default',
    },
  });
}
