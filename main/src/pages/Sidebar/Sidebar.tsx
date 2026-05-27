import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FileText,
  Grid2X2,
  KeyRound,
  Layers3,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  ShieldCheck,
  Upload,
  UserCog,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import ChatMenu from './components/chat/Chat';
import type { ChatListResponse } from '../../types/chat';
import { buttonStyles, modalStyles, sidebarStyles } from '../../utils/tailwindStyles';
import { cn } from '../../utils/classNames';


// ---------------------------------------------------------------------------
// AddPolicyModal
// ---------------------------------------------------------------------------

interface AddPolicyModalProps {
  onClose: () => void;
  // onSubmit: (data: PolicyFormData) => void;
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
    // onSubmit({ file, departmentIds: selectedDepartments, systemIds: selectedSystems });
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
        {/* Header */}
        <div className={modalStyles.header}>
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-300/15 bg-blue-500/10 text-blue-200">
              <FileText size={16} strokeWidth={1.8} />
            </div>
            <h2 id="apm-title" className={modalStyles.title}>Adicionar Política / Norma</h2>
          </div>
          <button type="button" className={modalStyles.close} onClick={onClose} aria-label="Fechar modal">
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={modalStyles.body}>
          {/* File upload */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">Arquivo</p>
            <div
              className={cn(
                'flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-center outline-none transition hover:border-blue-300/45 hover:bg-blue-500/10 focus-visible:border-blue-300/45 focus-visible:ring-4 focus-visible:ring-blue-500/10',
                dragOver && 'border-blue-400 bg-blue-500/15 ring-4 ring-blue-500/10',
                file && 'border-solid border-blue-300/35 bg-blue-500/10',
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
                'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-500 transition',
                file && 'border-blue-300/25 bg-blue-500/15 text-blue-200',
              )}>
                <Upload size={18} strokeWidth={1.6} />
              </div>
              {file ? (
                <span className="break-all text-sm font-bold text-blue-200">{file.name}</span>
              ) : (
                <>
                  <span className="text-sm text-slate-300">Arraste um arquivo ou clique para selecionar</span>
                  <span className="text-xs uppercase tracking-[0.08em] text-slate-500">PDF · DOC · DOCX · TXT</span>
                </>
              )}
            </div>
          </div>

          {/* Departments */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">Departamentos responsáveis</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Selecionar departamentos">
              <span className="text-xs text-slate-500">Seleção pendente de integração com catálogos.</span>
            </div>
          </div>

          {/* Systems */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">Sistemas integrados</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Selecionar sistemas">
              <span className="text-xs text-slate-500">Seleção pendente de integração com catálogos.</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
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
  const location = useLocation();
  const isAdmin = user.role === '1';
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const { get } = useFetch<ChatListResponse>()  
  const handleGetMyChats = useCallback(async (lastChatId?:string): Promise<ChatListResponse> => {

    let url = `/chat/scrolling`

    if(lastChatId) {
      url+=`?lastChatId=${lastChatId}`
    }

    const response = await get(url)

    return response ?? { data: [], finished: true }
  }, [get])

  const handleGetSharedChats = useCallback(async (lastChatId?:string): Promise<ChatListResponse> => {

    let url = `/chat/shared-scrolling`

    if(lastChatId) {
      url+=`?lastChatId=${lastChatId}`
    }

    const response = await get(url)

    return response ?? { data: [], finished: true }
  }, [get])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 900px)');

    function handleViewportChange() {
      setIsMobile(mediaQuery.matches);
      setIsCollapsed(mediaQuery.matches);
    }

    handleViewportChange();
    mediaQuery.addEventListener('change', handleViewportChange);
    return () => mediaQuery.removeEventListener('change', handleViewportChange);
  }, []);

  useEffect(() => {
    if (isMobile) {
      queueMicrotask(() => setIsCollapsed(true));
    }
  }, [isMobile, location.pathname]);

  const sidebarClassName = cn(sidebarStyles.aside, isCollapsed && sidebarStyles.collapsed);

  return (
    <>
      <aside className={sidebarClassName} aria-label="Navegação principal">
        <div className={sidebarStyles.topIcons}>
          <NavLink to="/chat" className={sidebarStyles.brand} aria-label="Ir para o chat">
            <ShieldCheck size={20} strokeWidth={1.8} />
          </NavLink>

          <button
            type="button"
            className={sidebarStyles.iconButton}
            onClick={() => setIsCollapsed((current) => !current)}
            aria-label={isCollapsed ? 'Abrir sidebar' : 'Fechar sidebar'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={19} strokeWidth={1.8} />
            ) : (
              <PanelLeftClose size={19} strokeWidth={1.8} />
            )}
          </button>
        </div>

        <div className={cn(sidebarStyles.content, isCollapsed && 'pointer-events-none opacity-0')} aria-hidden={isCollapsed}>
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

          <div className={sidebarStyles.savedEmpty}>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-500">
              <FileText size={23} strokeWidth={1.8} />
            </div>
            <p>As políticas salvas vão aparecer aqui.</p>
          </div>

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

      {isMobile && !isCollapsed && (
        <button
          type="button"
          className={sidebarStyles.backdrop}
          aria-label="Fechar sidebar"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* ── Modal ── */}
      {isPolicyModalOpen && (
        <AddPolicyModal
          onClose={() => setIsPolicyModalOpen(false)}
        />
      )}
    </>
  );
}
