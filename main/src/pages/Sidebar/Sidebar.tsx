import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Grid2X2,
  History,
  KeyRound,
  Layers3,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Share2,
  ShieldCheck,
  UserCog,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/sidebar.css';

const conversationHistory = [
  'Política de reembolso de vi...',
  'Solicitação de férias 2024',
  'Uso de VPN fora do país',
];

const sharedConversationHistory = [
  { id: 'shared-beneficios', title: 'Benefícios e plano de saúde', owner: 'Ana Souza', updatedAt: 'Hoje' },
  { id: 'shared-home-office', title: 'Regras de home office', owner: 'Carlos Oliveira', updatedAt: 'Ontem' },
  { id: 'shared-conduta', title: 'Código de conduta interno', owner: 'Marina Lima', updatedAt: '12/05' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user.role === '2';
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isConversationHistoryOpen, setIsConversationHistoryOpen] = useState(false);
  const [isSharedHistoryOpen, setIsSharedHistoryOpen] = useState(false);
  const [conversationSearch, setConversationSearch] = useState('');
  const [sharedSearch, setSharedSearch] = useState('');

  const filteredConversationHistory = useMemo(() => {
    const search = conversationSearch.trim().toLowerCase();
    if (!search) return conversationHistory;
    return conversationHistory.filter((item) => item.toLowerCase().includes(search));
  }, [conversationSearch]);

  const filteredSharedConversationHistory = useMemo(() => {
    const search = sharedSearch.trim().toLowerCase();
    if (!search) return sharedConversationHistory;

    return sharedConversationHistory.filter((item) =>
      `${item.title} ${item.owner} ${item.updatedAt}`.toLowerCase().includes(search)
    );
  }, [sharedSearch]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 900px)');

    function handleViewportChange() {
      setIsMobile(mediaQuery.matches);
      setIsCollapsed(mediaQuery.matches);
    }

    handleViewportChange();
    mediaQuery.addEventListener('change', handleViewportChange);

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange);
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile, location.pathname]);

  const sidebarClassName = [
    'sidebar',
    isCollapsed ? 'collapsed' : '',
    isMobile ? 'mobile' : '',
  ].filter(Boolean).join(' ');

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
              <NavLink to="/admin/documents" className="sidebar-add-source">
                <span aria-hidden="true">+</span>
                Adicionar políticas/normas
              </NavLink>
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

                <NavLink to="/document-timeline" className="sidebar-admin-link">
                  <History size={17} strokeWidth={1.8} />
                  Timeline de Documentos
                </NavLink>
              </nav>
            </section>
          )}

          <section className="sidebar-history" aria-label="Histórico de conversas">
            <button
              type="button"
              className="sidebar-history-toggle"
              onClick={() => setIsConversationHistoryOpen((current) => !current)}
              aria-expanded={isConversationHistoryOpen}
            >
              <span>Histórico de Conversas</span>
              {isConversationHistoryOpen ? (
                <ChevronDown size={16} strokeWidth={1.8} />
              ) : (
                <ChevronRight size={16} strokeWidth={1.8} />
              )}
            </button>

            {isConversationHistoryOpen && (
              <>
                <label className="sidebar-history-search">
                  <input
                    type="search"
                    placeholder="Buscar conversa"
                    value={conversationSearch}
                    onChange={(event) => setConversationSearch(event.target.value)}
                  />
                </label>

                <nav className="sidebar-history-list">
                  {filteredConversationHistory.map((item) => (
                    <NavLink to="/chat" className="sidebar-history-link" key={item}>
                      <MessageSquare size={17} strokeWidth={1.8} />
                      <span>{item}</span>
                    </NavLink>
                  ))}
                </nav>

                {filteredConversationHistory.length === 0 && (
                  <p className="sidebar-history-empty">Nenhuma conversa encontrada.</p>
                )}
              </>
            )}
          </section>

          <section className="sidebar-history sidebar-shared-history" aria-label="Conversas compartilhadas">
            <button
              type="button"
              className="sidebar-history-toggle"
              onClick={() => setIsSharedHistoryOpen((current) => !current)}
              aria-expanded={isSharedHistoryOpen}
            >
              <span>Conversas Compartilhadas</span>
              {isSharedHistoryOpen ? (
                <ChevronDown size={16} strokeWidth={1.8} />
              ) : (
                <ChevronRight size={16} strokeWidth={1.8} />
              )}
            </button>

            {isSharedHistoryOpen && (
              <>
                <label className="sidebar-history-search">
                  <input
                    type="search"
                    placeholder="Buscar compartilhada"
                    value={sharedSearch}
                    onChange={(event) => setSharedSearch(event.target.value)}
                  />
                </label>

                <nav className="sidebar-history-list">
                  {filteredSharedConversationHistory.map((item) => (
                    <NavLink
                      to={`/chat?shared=${item.id}`}
                      className="sidebar-history-link sidebar-shared-history-link"
                      key={item.id}
                    >
                      <Share2 size={17} strokeWidth={1.8} />

                      <span className="sidebar-shared-history-text">
                        <strong>{item.title}</strong>
                        <small>{item.owner} · {item.updatedAt}</small>
                      </span>
                    </NavLink>
                  ))}
                </nav>

                {filteredSharedConversationHistory.length === 0 && (
                  <p className="sidebar-history-empty">Nenhuma conversa compartilhada encontrada.</p>
                )}
              </>
            )}
          </section>

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
    </>
  );
}