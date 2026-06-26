import { useEffect, useRef, useState } from 'react';
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
import '../../styles/sidebar.css';
import { useFetch } from '../../hooks/useFetch';
import ChatMenu from './components/chat/Chat';
import type { Chat } from '../../types/chat';


// ---------------------------------------------------------------------------
// AddPolicyModal
// ---------------------------------------------------------------------------

interface AddPolicyModalProps {
  onClose: () => void;
  // onSubmit: (data: PolicyFormData) => void;
}

function AddPolicyModal({ onClose }: AddPolicyModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
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

  function toggleDepartment(id: string) {
    setSelectedDepartments((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }

  function toggleSystem(id: string) {
    setSelectedSystems((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
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
      className="apm-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="apm-title"
    >
      <div className="apm-modal">
        {/* Header */}
        <div className="apm-header">
          <div className="apm-header-left">
            <div className="apm-header-icon">
              <FileText size={16} strokeWidth={1.8} />
            </div>
            <h2 id="apm-title">Adicionar Política / Norma</h2>
          </div>
          <button type="button" className="apm-close" onClick={onClose} aria-label="Fechar modal">
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="apm-form">
          {/* File upload */}
          <div className="apm-section">
            <p className="apm-label">Arquivo</p>
            <div
              className={`apm-dropzone${dragOver ? ' drag-over' : ''}${file ? ' has-file' : ''}`}
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
                style={{ display: 'none' }}
              />
              <div className={`apm-upload-icon-wrap${file ? ' active' : ''}`}>
                <Upload size={18} strokeWidth={1.6} />
              </div>
              {file ? (
                <span className="apm-filename">{file.name}</span>
              ) : (
                <>
                  <span className="apm-drop-text">Arraste um arquivo ou clique para selecionar</span>
                  <span className="apm-drop-hint">PDF · DOC · DOCX · TXT</span>
                </>
              )}
            </div>
          </div>

          {/* Departments */}
          <div className="apm-section">
            <p className="apm-label">Departamentos responsáveis</p>
            <div className="apm-chip-group" role="group" aria-label="Selecionar departamentos">
              {/* {availableDepartments.map((dep) => (
                <button
                  key={dep.id}
                  type="button"
                  className={`apm-chip${selectedDepartments.includes(dep.id) ? ' selected' : ''}`}
                  onClick={() => toggleDepartment(dep.id)}
                  aria-pressed={selectedDepartments.includes(dep.id)}
                >
                  {dep.name}
                </button>
              ))} */}
            </div>
          </div>

          {/* Systems */}
          <div className="apm-section">
            <p className="apm-label">Sistemas integrados</p>
            <div className="apm-chip-group" role="group" aria-label="Selecionar sistemas">
              {/* {availableSystems.map((sys) => (
                <button
                  key={sys.id}
                  type="button"
                  className={`apm-chip${selectedSystems.includes(sys.id) ? ' selected' : ''}`}
                  onClick={() => toggleSystem(sys.id)}
                  aria-pressed={selectedSystems.includes(sys.id)}
                >
                  {sys.name}
                </button>
              ))} */}
            </div>
          </div>

          {/* Actions */}
          <div className="apm-actions">
            <button type="button" className="apm-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="apm-btn-submit" disabled={!isValid}>
              Adicionar política
            </button>
          </div>
        </form>
      </div>

      <style>{`
        /* ── Overlay ──────────────────────────────────────────────────────── */
        .apm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        /* ── Modal shell ──────────────────────────────────────────────────── */
        .apm-modal {
          width: 100%;
          max-width: 496px;
          max-height: 90vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #171d29 0%, #141a25 100%);
          border: 1px solid #232a39;
          border-radius: 18px;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.03),
            0 24px 60px rgba(0, 0, 0, 0.45);
        }

        .apm-modal::-webkit-scrollbar { width: 6px; }
        .apm-modal::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.07);
          border-radius: 999px;
        }

        /* ── Header ───────────────────────────────────────────────────────── */
        .apm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px 16px;
          border-bottom: 1px solid #232a39;
          flex-shrink: 0;
        }

        .apm-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .apm-header-icon {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #5e86ff;
          background: rgba(47, 95, 255, 0.08);
          border: 1px solid rgba(94, 134, 255, 0.12);
          flex-shrink: 0;
        }

        .apm-header h2 {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #f3f6fb;
        }

        .apm-close {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #737d8f;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          flex-shrink: 0;
        }

        .apm-close:hover {
          background: rgba(255,255,255,0.06);
          border-color: #232a39;
          color: #a4adbc;
        }

        /* ── Form body ────────────────────────────────────────────────────── */
        .apm-form {
          padding: 18px 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .apm-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .apm-label {
          margin: 0;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #737d8f;
        }

        /* ── Dropzone ─────────────────────────────────────────────────────── */
        .apm-dropzone {
          border: 1.5px dashed #232a39;
          border-radius: 14px;
          padding: 22px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
          text-align: center;
          outline: none;
          background: rgba(255,255,255,0.01);
        }

        .apm-dropzone:hover,
        .apm-dropzone:focus-visible {
          border-color: rgba(47, 95, 255, 0.45);
          background: rgba(47, 95, 255, 0.04);
          box-shadow: 0 0 0 3px rgba(47, 95, 255, 0.08);
        }

        .apm-dropzone.drag-over {
          border-color: #2f5fff;
          background: rgba(47, 95, 255, 0.07);
          box-shadow: 0 0 0 4px rgba(47, 95, 255, 0.12);
        }

        .apm-dropzone.has-file {
          border-style: solid;
          border-color: rgba(65, 117, 255, 0.35);
          background: rgba(47, 95, 255, 0.05);
        }

        .apm-upload-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #737d8f;
          background:
            radial-gradient(circle at 30% 20%, rgba(94, 134, 255, 0.08), transparent 65%),
            rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          transition: color 0.18s, background 0.18s, border-color 0.18s;
          margin-bottom: 2px;
        }

        .apm-upload-icon-wrap.active {
          color: #5e86ff;
          background: rgba(47, 95, 255, 0.1);
          border-color: rgba(94, 134, 255, 0.2);
        }

        .apm-filename {
          font-size: 13px;
          font-weight: 600;
          color: #7ea0ff;
          word-break: break-all;
          letter-spacing: -0.01em;
        }

        .apm-drop-text {
          font-size: 13px;
          color: #a4adbc;
          line-height: 1.4;
        }

        .apm-drop-hint {
          font-size: 11px;
          color: #737d8f;
          letter-spacing: 0.04em;
        }

        /* ── Chips ────────────────────────────────────────────────────────── */
        .apm-chip-group {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .apm-chip {
          padding: 5px 13px;
          border-radius: 999px;
          border: 1px solid #232a39;
          background: rgba(255,255,255,0.02);
          font-size: 12px;
          font-weight: 500;
          color: #a4adbc;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s;
        }

        .apm-chip:hover {
          border-color: rgba(47, 95, 255, 0.4);
          color: #7ea0ff;
          background: rgba(47, 95, 255, 0.06);
        }

        .apm-chip.selected {
          background: linear-gradient(180deg, #3268ff 0%, #2a5cff 100%);
          border-color: rgba(71, 115, 255, 0.5);
          color: #fff;
          box-shadow: 0 4px 12px rgba(38, 92, 255, 0.22);
        }

        /* ── Actions ──────────────────────────────────────────────────────── */
        .apm-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 2px;
        }

        .apm-btn-cancel {
          height: 38px;
          padding: 0 16px;
          border-radius: 10px;
          border: 1px solid #232a39;
          background: rgba(255,255,255,0.03);
          font-size: 13px;
          font-weight: 600;
          color: #a4adbc;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }

        .apm-btn-cancel:hover {
          background: rgba(255,255,255,0.06);
          border-color: #30384b;
          color: #f3f6fb;
        }

        .apm-btn-submit {
          height: 38px;
          padding: 0 18px;
          border-radius: 10px;
          border: 1px solid rgba(71, 115, 255, 0.35);
          background: linear-gradient(180deg, #3268ff 0%, #2a5cff 100%);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(38, 92, 255, 0.2);
          transition: filter 0.15s, transform 0.15s, opacity 0.15s;
        }

        .apm-btn-submit:not(:disabled):hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }

        .apm-btn-submit:disabled {
          opacity: 0.38;
          cursor: not-allowed;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user.role === '2';
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { get } = useFetch()  
  async function handleGetMyChats (lastChatId?:string) {

    let url = `/chat/scrolling`

    if(lastChatId) {
      url+=`?lastChatId=${lastChatId}`
    }

    const response: {data:Chat[],finished:boolean} = await get(url) as {data:Chat[],finished:boolean}

    return response
  }

  async function handleGetSharedChats (lastChatId?:string) {

    let url = `/chat/shared-scrolling`

    if(lastChatId) {
      url+=`?lastChatId=${lastChatId}`
    }

    const response: {data:Chat[],finished:boolean} = await get(url) as {data:Chat[],finished:boolean}

    return response
  }

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
    if (isMobile) setIsCollapsed(true);
  }, [isMobile, location.pathname]);

  const sidebarClassName = ['sidebar', isCollapsed ? 'collapsed' : '', isMobile ? 'mobile' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <aside className={sidebarClassName} aria-label="Navegação principal">
        <div className="sidebar-top-icons">
          <NavLink to="/chat" className="sidebar-brand" aria-label="Ir para o chat">
            <ShieldCheck size={20} strokeWidth={1.8} />
          </NavLink>

          <button
            type="button"
            className="sidebar-chat-icon"
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

        <div className="sidebar-content" aria-hidden={isCollapsed}>
          <div className="sidebar-divider" />

          <section className="sidebar-section sidebar-sources">
            <NavLink
              to={isAdmin ? '/admin/documents' : '/chat'}
              className="sidebar-section-header sidebar-section-header-link"
              aria-label={isAdmin ? 'Ir para políticas e normas' : 'Fontes da empresa'}
            >
              <h2>Fontes da Empresa</h2>
              <Grid2X2 size={17} strokeWidth={1.8} />
            </NavLink>

            {isAdmin && (
              <button
                type="button"
                className="sidebar-add-source"
                // onClick={() => setIsPolicyModalOpen(true)}
              >
                <span aria-hidden="true">+</span>
                Adicionar políticas/normas
              </button>
            )}
          </section>

          {isAdmin && (
            <section className="sidebar-admin-panel" aria-label="Administração">
              <p className="sidebar-kicker">Administração</p>

              <nav className="sidebar-admin-nav">
                <NavLink to="/admin/documents" className="sidebar-admin-link">
                  <FileText size={17} strokeWidth={1.8} />
                  Gestão de Documentos
                </NavLink>

                <NavLink to="/admin/users" className="sidebar-admin-link">
                  <UserCog size={17} strokeWidth={1.8} />
                  Gerenciamento de Usuários
                </NavLink>

                <NavLink to="/admin/departments" className="sidebar-admin-link">
                  <Layers3 size={17} strokeWidth={1.8} />
                  Departamentos
                </NavLink>

                <NavLink to="/admin/systems" className="sidebar-admin-link">
                  <Layers3 size={17} strokeWidth={1.8} />
                  Sistemas
                </NavLink>

                <NavLink to="/admin/tokens" className="sidebar-admin-link">
                  <KeyRound size={17} strokeWidth={1.8} />
                  Gerenciamento de Tokens
                </NavLink>
              </nav>
            </section>
          )}

          <ChatMenu handleGetChat={handleGetMyChats} />

          <ChatMenu handleGetChat={handleGetSharedChats} />

          <div className="sidebar-saved-empty">
            <div className="sidebar-saved-icon">
              <FileText size={23} strokeWidth={1.8} />
            </div>
            <p>As políticas salvas vão aparecer aqui.</p>
          </div>

          <section className="sidebar-profile-card" aria-label="Perfil do usuário">
            <div className="sidebar-profile-info">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>

            <NavLink to="/profile/edit" className="sidebar-profile-link">
              <Pencil size={15} strokeWidth={1.8} />
              Editar perfil
            </NavLink>
          </section>
        </div>
      </aside>

      {isMobile && !isCollapsed && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Fechar sidebar"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* ── Modal ── */}
      {/* {isPolicyModalOpen && (
        <AddPolicyModal
          onClose={() => setIsPolicyModalOpen(false)}
          onSubmit={handlePolicySubmit}
        />
      )} */}
    </>
  );
}
