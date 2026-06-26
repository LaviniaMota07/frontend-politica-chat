import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { X } from 'lucide-react';

const createChatSchema = z.object({
  title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres').max(100, 'O título deve ter no máximo 100 caracteres'),
});

type CreateChatFormData = z.infer<typeof createChatSchema>;

interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId?: string;
  initialTitle?: string;
}

export default function CreateChatModal({ isOpen, onClose, chatId, initialTitle }: CreateChatModalProps) {
  const navigate = useNavigate();
  const { post, put } = useFetch();
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

  // Atualizar o valor do título quando initialTitle mudar
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
          successAlert:{
            message:"Chat atualizado!",
            title:"Sucesso"
          }
        });
      } else {
        response = await post('/chat', {
          body: {
            title: data.title,
          },
          successAlert:{
            message:"Chat criado!",
            title:"Sucesso"
          }
        });
      }

      if (response) {
        reset();
        onClose();

        if (!isEditMode) {
          const res = response as any;
          if (res.chatId) {
            // Disparar evento para atualizar a sidebar
            window.dispatchEvent(new CustomEvent('chatCreated'));
            navigate(`/chat/${res.chatId}`);
          }
        } else {
          // Disparar evento para atualizar a sidebar quando editar
          window.dispatchEvent(new CustomEvent('chatUpdated'));
        }
      }
    } catch (error) {
      console.error(isEditMode ? 'Erro ao editar chat:' : 'Erro ao criar chat:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Editar Chat' : 'Novo Chat'}</h2>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
          <div className="modal-form-group">
            <label htmlFor="title">Título do Chat</label>
            <input
              id="title"
              type="text"
              placeholder="Digite o título do chat..."
              {...register('title')}
              className="modal-input"
              disabled={isSubmitting}
            />
            {errors.title && <span className="modal-error">{errors.title.message}</span>}
          </div>

          <button type="submit" className="modal-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (isEditMode ? 'Salvando...' : 'Criando...') : (isEditMode ? 'Salvar' : 'Criar Chat')}
          </button>
        </form>
      </div>
    </div>
  );
}