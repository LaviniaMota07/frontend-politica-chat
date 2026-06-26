import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { X } from 'lucide-react';
import { buttonStyles, formStyles, modalStyles } from '../../utils/tailwindStyles';
import { useChatHistory } from '../../contexts/ChatHistoryContext';
import { createChatSchema, type CreateChatFormData } from '../../validation/chat.schema';
import type { CreateChatResponse } from '../../services/chatApi';

interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId?: string;
  initialTitle?: string;
}

export default function CreateChatModal({ isOpen, onClose, chatId, initialTitle }: CreateChatModalProps) {
  const navigate = useNavigate();
  const { post, put } = useFetch<CreateChatResponse>();
  const { notifyChatCreated, notifyChatUpdated } = useChatHistory();
  const isEditMode = !!chatId;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CreateChatFormData>({
    resolver: zodResolver(createChatSchema),
    defaultValues: {
      title: initialTitle || '',
    },
  });

  useEffect(() => {
    if (initialTitle !== undefined) {
      setValue('title', initialTitle);
    }
  }, [initialTitle, setValue]);

  const onSubmit = async (data: CreateChatFormData) => {
    try {
      let response;

      if (isEditMode) {
        response = await put(`/chat/${chatId}`, {
          body: {
            title: data.title,
          },
          successAlert: {
            message: 'Chat atualizado!',
            title: 'Sucesso',
          },
        });
      } else {
        response = await post('/chat', {
          body: {
            title: data.title,
          },
          successAlert: {
            message: 'Chat criado!',
            title: 'Sucesso',
          },
        });
      }

      if (response) {
        reset();
        onClose();

        if (!isEditMode) {
          if (response.chatId) {
            notifyChatCreated();
            navigate(`/chat/${response.chatId}`);
          }
        } else {
          notifyChatUpdated();
        }
      }
    } catch {
      // handled by useFetch alert
    }
  };

  if (!isOpen) return null;

  return (
    <div className={modalStyles.backdrop} onClick={onClose}>
      <div className={modalStyles.formPanel} onClick={(e) => e.stopPropagation()}>
        <div className={modalStyles.header}>
          <h2 className={modalStyles.title}>{isEditMode ? 'Editar Chat' : 'Novo Chat'}</h2>
          <button type="button" className={modalStyles.close} onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={modalStyles.body}>
          <div className="flex flex-col gap-2">
            <label htmlFor="title">Título do Chat</label>
            <input
              id="title"
              type="text"
              placeholder="Digite o título do chat..."
              {...register('title')}
              className={formStyles.input}
              disabled={isSubmitting}
            />
            {errors.title && <span className={formStyles.error}>{errors.title.message}</span>}
          </div>

          <button type="submit" className={buttonStyles.primary} disabled={isSubmitting}>
            {isSubmitting ? (isEditMode ? 'Salvando...' : 'Criando...') : (isEditMode ? 'Salvar' : 'Criar Chat')}
          </button>
        </form>
      </div>
    </div>
  );
}
