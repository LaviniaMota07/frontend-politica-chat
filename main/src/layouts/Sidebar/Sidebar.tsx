import { useCallback, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Grid2X2,
  KeyRound,
  Layers3,
  Pencil,
  Plus,
  ShieldCheck,
  UserCog,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import SidebarChatMenu from './components/SidebarChatMenu';
import type { ChatListResponse } from '../../types/chat';
import { sidebarStyles } from '../../utils/tailwindStyles';
import CreateChatModal from '../../components/CreateChatModal/CreateChatModal';
import { UploadDocumentModal } from '../../components/admin/UploadDocumentModal';
import { buildChatScrollUrl, buildSharedChatScrollUrl } from '../../services/chatApi';

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user.role === '1';
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [openCreateChat, setOpenCreateChat] = useState(false);
  const { get } = useFetch<ChatListResponse>();
  const location = useLocation();
  const navigate = useNavigate();
  const isOnChat = location.pathname === '/chat' || location.pathname.startsWith('/chat/');

  const handleGetMyChats = useCallback(async (lastChatId?: string): Promise<ChatListResponse> => {
    const response = await get(buildChatScrollUrl(lastChatId));
    return response ?? { data: [], finished: true };
  }, [get]);

  const handleGetSharedChats = useCallback(async (lastChatId?: string): Promise<ChatListResponse> => {
    const response = await get(buildSharedChatScrollUrl(lastChatId));
    return response ?? { data: [], finished: true };
  }, [get]);

  const handleClosePolicyModal = useCallback(() => setIsPolicyModalOpen(false), []);

  return (
    <>
      <aside className={sidebarStyles.aside} aria-label="Navegação principal">
        <div className={sidebarStyles.topIcons}>
          <NavLink to="/chat" className="flex min-w-0 flex-1 items-center gap-3" aria-label="Ir para o chat">
            <span className={sidebarStyles.brand}>
              <ShieldCheck size={20} strokeWidth={1.8} />
            </span>
            <span className={sidebarStyles.brandText}>
              <span className={sidebarStyles.brandName}>NormaHub</span>
              <span className={sidebarStyles.brandCaption}>Chat de Documentos</span>
            </span>
          </NavLink>
        </div>

        <div className={sidebarStyles.content}>
          <button
            type="button"
            className={sidebarStyles.newChatButton}
            onClick={() => setOpenCreateChat(true)}
          >
            <Plus size={16} strokeWidth={2.2} />
            Nova Conversa
          </button>

          {!isOnChat && (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-(--text-inverse)/80 transition duration-200 hover:border-white/20 hover:bg-white/10 hover:text-(--text-inverse) active:scale-[0.98]"
              onClick={() => navigate('/chat')}
            >
              <ArrowLeft size={16} strokeWidth={2.2} />
              Voltar ao chat
            </button>
          )}

          <div className={sidebarStyles.divider} />

          <section className={sidebarStyles.section}>
            <NavLink
              to={isAdmin ? '/admin/documents' : '/chat'}
              className={sidebarStyles.sectionHeader}
              aria-label={isAdmin ? 'Ir para políticas e normas' : 'Fontes da empresa'}
            >
              <h2 className={sidebarStyles.sectionTitle}>Fontes da Empresa</h2>
              <Grid2X2 size={17} strokeWidth={1.8} />
            </NavLink>

            {isAdmin && (
              <button
                type="button"
                className={sidebarStyles.addButton}
                onClick={() => setIsPolicyModalOpen(true)}
              >
                <span aria-hidden="true">+</span>
                Adicionar políticas/normas
              </button>
            )}
          </section>

          {isAdmin && (
            <section className={sidebarStyles.section} aria-label="Administração">
              <p className={sidebarStyles.kicker}>Administração</p>

              <nav className={sidebarStyles.nav}>
                <NavLink to="/admin/documents" className={sidebarStyles.navLink}>
                  <FileText size={17} strokeWidth={1.8} />
                  Gestão de Documentos
                </NavLink>

                <NavLink to="/admin/users" className={sidebarStyles.navLink}>
                  <UserCog size={17} strokeWidth={1.8} />
                  Gerenciamento de Usuários
                </NavLink>

                <NavLink to="/admin/departments" className={sidebarStyles.navLink}>
                  <Layers3 size={17} strokeWidth={1.8} />
                  Departamentos
                </NavLink>

                <NavLink to="/admin/systems" className={sidebarStyles.navLink}>
                  <Layers3 size={17} strokeWidth={1.8} />
                  Sistemas
                </NavLink>

                <NavLink to="/admin/permission-groups" className={sidebarStyles.navLink}>
                  <ShieldCheck size={17} strokeWidth={1.8} />
                  Grupos de Permissão
                </NavLink>

                <NavLink to="/admin/tokens" className={sidebarStyles.navLink}>
                  <KeyRound size={17} strokeWidth={1.8} />
                  Gerenciamento de Tokens
                </NavLink>
              </nav>
            </section>
          )}

          <SidebarChatMenu
            title="Minhas conversas"
            emptyMessage="Nenhuma conversa criada por você."
            handleGetChat={handleGetMyChats}
          />

          <SidebarChatMenu
            title="Compartilhadas comigo"
            emptyMessage="Nenhuma conversa compartilhada com você."
            handleGetChat={handleGetSharedChats}
          />

          <section className={sidebarStyles.profileCard} aria-label="Perfil do usuário">
            <div className={sidebarStyles.profileInfo}>
              <strong className={sidebarStyles.profileName}>{user.name}</strong>
              <span className={sidebarStyles.profileEmail}>{user.email}</span>
            </div>

            <NavLink to="/profile/edit" className={sidebarStyles.profileLink}>
              <Pencil size={15} strokeWidth={1.8} />
              Editar perfil
            </NavLink>
          </section>
        </div>
      </aside>

      <UploadDocumentModal
        open={isPolicyModalOpen}
        onClose={handleClosePolicyModal}
      />

      <CreateChatModal isOpen={openCreateChat} onClose={() => setOpenCreateChat(false)} />
    </>
  );
}
