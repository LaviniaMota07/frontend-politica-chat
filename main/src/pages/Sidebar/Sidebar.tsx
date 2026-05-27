import { useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FileText,
  Grid2X2,
  KeyRound,
  Layers3,
  Pencil,
  Plus,
  ShieldCheck,
  Upload,
  UserCog,
  X,
} from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import ChatMenu from './components/chat/Chat';
import type { ChatListResponse } from '../../types/chat';
import { buttonStyles, modalStyles, sidebarStyles } from '../../utils/tailwindStyles';
import CreateChatModal from '../../components/modalCreateChat/Index';
import { cn } from '@/lib/utils';


// ---------------------------------------------------------------------------
// AddPolicyModal
// ---------------------------------------------------------------------------

interface AddPolicyModalProps {
  onClose: () => void;
}

function AddPolicyModal({ onClose }: AddPolicyModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedDepartments] = useState<string[]>([]);
  const [selectedSystems] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    setFile(e.dataTransfer.files?.[0] ?? null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onClose();
  }

  const isValid = file !== null && selectedDepartments.length > 0 && selectedSystems.length > 0;

  return (
    <div
      ref={overlayRef}
      className={modalStyles.backdrop}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="apm-title"
    >
      <div className={modalStyles.formPanel}>
        <div className={modalStyles.header}>
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border-neutral)] bg-[var(--accent-soft)] text-[var(--accent-strong)]">
              <FileText size={16} strokeWidth={1.8} />
            </div>
            <h2 id="apm-title" className={modalStyles.title}>Adicionar Política / Norma</h2>
          </div>
          <button type="button" className={modalStyles.close} onClick={onClose} aria-label="Fechar modal">
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={modalStyles.body}>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">Arquivo</p>
            <div
              className={cn(
                'flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--border-neutral)] bg-[var(--bg-body)] px-4 py-6 text-center outline-none transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] focus-visible:border-[var(--accent)] focus-visible:ring-4 focus-visible:ring-[rgba(168,101,53,0.12)]',
                dragOver && 'border-solid border-[var(--accent)] bg-[var(--accent-soft)] ring-4 ring-[rgba(168,101,53,0.12)]',
                file && 'border-solid border-[var(--accent)] bg-[var(--accent-soft)]',
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
              aria-label="Área para upload de arquivo"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface)] text-[var(--text-muted)] transition',
                file && 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]',
              )}>
                <Upload size={18} strokeWidth={1.6} />
              </div>
              {file ? (
                <span className="break-all text-sm font-bold text-[var(--accent-strong)]">{file.name}</span>
              ) : (
                <>
                  <span className="text-sm text-[var(--text-secondary)]">Arraste um arquivo ou clique para selecionar</span>
                  <span className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">PDF · DOC · DOCX · TXT</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">Departamentos responsáveis</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Selecionar departamentos">
              <span className="text-xs text-[var(--text-muted)]">Seleção pendente de integração com catálogos.</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">Sistemas integrados</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Selecionar sistemas">
              <span className="text-xs text-[var(--text-muted)]">Seleção pendente de integração com catálogos.</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-[var(--border-neutral)] pt-5">
            <button type="button" className={buttonStyles.secondary} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={buttonStyles.primary} disabled={!isValid}>
              Adicionar política
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user.role === '1';
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [openCreateChat, setOpenCreateChat] = useState(false);
  const { get } = useFetch<ChatListResponse>();

  const handleGetMyChats = useCallback(async (lastChatId?: string): Promise<ChatListResponse> => {
    let url = `/chat/scrolling`;
    if (lastChatId) url += `?lastChatId=${lastChatId}`;
    const response = await get(url);
    return response ?? { data: [], finished: true };
  }, [get]);

  const handleGetSharedChats = useCallback(async (lastChatId?: string): Promise<ChatListResponse> => {
    let url = `/chat/shared-scrolling`;
    if (lastChatId) url += `?lastChatId=${lastChatId}`;
    const response = await get(url);
    return response ?? { data: [], finished: true };
  }, [get]);

  return (
    <>
      <aside className={sidebarStyles.aside} aria-label="Navegação principal">
        <div className={sidebarStyles.topIcons}>
          <NavLink to="/chat" className="flex min-w-0 flex-1 items-center gap-3" aria-label="Ir para o chat">
            <span className={sidebarStyles.brand}>
              <ShieldCheck size={20} strokeWidth={1.8} />
            </span>
            <span className={sidebarStyles.brandText}>
              <span className={sidebarStyles.brandName}>Norma AI</span>
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

                <NavLink to="/admin/tokens" className={sidebarStyles.navLink}>
                  <KeyRound size={17} strokeWidth={1.8} />
                  Gerenciamento de Tokens
                </NavLink>
              </nav>
            </section>
          )}

          <ChatMenu
            title="Minhas conversas"
            emptyMessage="Nenhuma conversa criada por você."
            handleGetChat={handleGetMyChats}
          />

          <ChatMenu
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

      {isPolicyModalOpen && (
        <AddPolicyModal
          onClose={() => setIsPolicyModalOpen(false)}
        />
      )}

      <CreateChatModal isOpen={openCreateChat} onClose={() => setOpenCreateChat(false)} />
    </>
  );
}
