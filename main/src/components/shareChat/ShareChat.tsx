import { X } from 'lucide-react';
import CardPermissionType from './components/CardPermissionType';
import { type ReactElement, useState } from 'react';
import SharedUsers, { type SharedUser } from './components/SharedUsers';
import CopyLinkButton from './components/CopyLinkButton';
import InviteByEmail from './components/InviteByEmail';
import { useShareChatForm } from '../../hooks/forms/useShareChatForm';
import type { ShareChatFormData } from '../../validation/chat.schema';
import { useParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { modalStyles } from '../../utils/tailwindStyles';
import type { ShareChatResponse } from '../../services/chatApi';

interface ShareChatProps {
  onClose: () => void;
}

interface Permissions {
  id: number;
  name: string;
  description: ReactElement;
}

const ShareChat = ({ onClose }: ShareChatProps) => {
  const { chatId } = useParams();
  const { post } = useFetch<ShareChatResponse>();
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [inviteResetSignal, setInviteResetSignal] = useState(0);

  const { register, watch, setValue, handleSubmit, formState: { errors } } = useShareChatForm();

  const selectedPermission = watch('permission');

  const permissions: Permissions[] = [
    {
      id: 1,
      name: 'read',
      description: <span><strong>Somente leitura</strong>A pessoa pode abrir e consultar a conversa.</span>,
    },
    {
      id: 2,
      name: 'edit',
      description: <span><strong>Pode editar</strong>A pessoa pode abrir, ler e responder.</span>,
    },
  ];

  async function handleSharedChat(formData: ShareChatFormData) {
    if (!chatId) {
      return;
    }

    try {
      const response = await post('/chat/share', {
        body: {
          chatId,
          targetUserId: formData.userId,
          roleChatId: formData.permission,
        },
        successAlert: {
          title: 'Sucesso',
          message: 'Chat compartilhado com sucesso!',
        },
      });

      if (response) {
        const newUser: SharedUser = {
          userNm: response.user.name,
          typeAccess: formData.permission === 2 ? 'edit' : 'read',
          roleChatId: formData.permission,
          userId: formData.userId,
          email: formData.email,
        };
        setSharedUsers((currentUsers) => {
          if (currentUsers.some((user) => user.userId === newUser.userId)) {
            return currentUsers;
          }
          return [...currentUsers, newUser];
        });

        setValue('email', '');
        setValue('userId', 0);
        setValue('permission', 0);
        setInviteResetSignal((value) => value + 1);
      }
    } catch {
      // handled by useFetch alert
    }
  }

  return (
    <div className={modalStyles.backdrop} role="presentation">
      <div className="grid w-full max-w-5xl grid-cols-[minmax(0,1fr)_360px] gap-5 max-[900px]:grid-cols-1">
        <form
          onSubmit={handleSubmit(handleSharedChat)}
          className={modalStyles.formPanel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-share-title"
        >
          <header className={modalStyles.header}>
            <div>
              <h2 id="chat-share-title" className={modalStyles.title}>Compartilhar chat</h2>
              <p className={modalStyles.description}>Escolha o nível de acesso e gere um link seguro.</p>
            </div>
            <button
              type="button"
              className={modalStyles.close}
              onClick={onClose}
              aria-label="Fechar compartilhamento"
            >
              <X size={17} />
            </button>
          </header>

          <fieldset className={modalStyles.body}>
            <legend className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">Permissão</legend>

            {permissions.map((permission) => (
              <CardPermissionType
                key={permission.id}
                currentPermission={permission.id}
                selectPermission={selectedPermission}
                setPermission={(permission) => setValue('permission', permission)}
              >
                {permission.description}
              </CardPermissionType>
            ))}

            {errors.permission &&
              <p className="text-xs font-semibold text-red-700">{errors.permission.message}</p>
            }
          </fieldset>

          <InviteByEmail
            register={register}
            error={errors.email?.message}
            setValue={setValue}
            resetSignal={inviteResetSignal}
          />

          <CopyLinkButton />
        </form>

        <SharedUsers sharedUsers={sharedUsers} setSharedUsers={setSharedUsers} />
      </div>
    </div>
  );
};

export default ShareChat;
