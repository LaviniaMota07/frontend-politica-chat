import { X } from "lucide-react";
import CardPermissionType from "./components/CardPermissionType";
import { type ReactElement, useRef } from "react";
import SharedUsers, { type SharedUsersHandle, type SharedUser } from "./components/SharedUsers";
import CopyLinkButton from "./components/CopyLinkButton";
import InviteByEmail from "./components/InviteByEmail";
import { useShareChatForm, type ShareChatFormData } from "../../hooks/forms/useShareChatForm";
import { useParams } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";

interface ShareChatProps {
  onClose: () => void;
}

interface Permissions {
  id: number;
  name: string;
  description: ReactElement;
}

const ShareChat = ({ onClose }: ShareChatProps) => {
  const {chatId} = useParams()
  const {post} = useFetch()
  const sharedUsersRef = useRef<SharedUsersHandle>(null)
  
  const { register,watch,setValue,handleSubmit,formState:{errors} } = useShareChatForm()

  const selectedPermission = watch("permission")
  
  const permissions: Permissions[] = [
    {
      id: 1,
      name: "read",
      description: <span><strong>Somente leitura</strong>A pessoa pode abrir e consultar a conversa.</span>
    },
    {
      id: 2,
      name: "edit",
      description: <span><strong>Pode editar</strong>A pessoa pode abrir, ler e responder.</span>
    }
  ]

  async function handleSharedChat (formData:ShareChatFormData) {
    if (!chatId) {
      console.error('chatId não encontrado')
      return
    }

    try {
      const response = await post('/chat/share', {
        body: {
          chatId,
          targetUserId: formData.userId,
          roleChatId: formData.permission
        },
        successAlert: {
          title: 'Sucesso',
          message: 'Chat compartilhado com sucesso!'
        }
      })

      if (response) {
        const newUser: SharedUser = {
          userNm: (response as any).user.name, // Isso viria da resposta da API
          typeAccess: formData.permission === 2 ? 'edit' : 'read',
          roleChatId: formData.permission,
          userId: formData.userId,
          email: formData.email
        }
        sharedUsersRef.current?.addSharedUser(newUser)
        
        // Limpar o formulário
        setValue('email', '')
        setValue('userId', 0)
        setValue('permission', 0)
      }
    } catch (error) {
      console.error('Erro ao compartilhar chat:', error)
    }
  }

  return (
    <div className="chat-share-backdrop" role="presentation">
      <div className="chat-share-modal-wrapper">
        <form 
          onSubmit={handleSubmit(handleSharedChat,(error) => {
            console.log(error)
          })}
          className="chat-share-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-share-title"
        >
          <header className="chat-share-header">
            <div>
              <h2 id="chat-share-title">Compartilhar chat</h2>
              <p>Escolha o nível de acesso e gere um link seguro.</p>
            </div>
            <button
              type="button"
              className="chat-share-close"
              onClick={onClose}
              aria-label="Fechar compartilhamento"
            >
              <X size={17} />
            </button>
          </header>

          <fieldset className="chat-share-permissions">
            <legend>Permissão</legend>
            
            {permissions.map((permission) => (
              <CardPermissionType
                key={permission.id}
                currentPermission={permission.id}
                selectPermission={selectedPermission}
                setPermission={(permission)=> setValue("permission", permission)}
              >
                {permission.description}
              </CardPermissionType>
            ))}

            {errors.permission && 
              <p className="chat-share-invite-error">{errors.permission.message}</p>
            }

          </fieldset>

          <InviteByEmail 
            register={register}
            error={errors.email?.message}
            setValue={setValue}
          />

          <CopyLinkButton />
        </form>

        {/* ── Pessoas com acesso ── */}
        <SharedUsers ref={sharedUsersRef} />
      </div>
    </div>
  )
}

export default ShareChat