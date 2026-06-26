import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormData } from '../../validation/profile.schema';

export type { ProfileFormData };

export function useProfileForm(defaults: ProfileFormData) {
  return useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaults,
  });
}
