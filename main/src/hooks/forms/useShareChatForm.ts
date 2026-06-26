import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { shareChatSchema, type ShareChatFormData } from '../../validation/chat.schema';

export type { ShareChatFormData };

export const useShareChatForm = () => {
  return useForm<ShareChatFormData>({
    resolver: zodResolver(shareChatSchema),
    defaultValues: {
      email: '',
      permission: 0,
      userId: 0,
    },
  });
};
