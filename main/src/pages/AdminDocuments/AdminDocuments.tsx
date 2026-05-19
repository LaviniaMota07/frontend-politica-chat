import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileText,
  History,
  MoreHorizontal,
  Power,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import '../../styles/admin-users.css';
import '../../styles/admin-documents.css';

type ActiveStatus = 'Ativo' | 'Inativo';

type ManagedDocument = {
  id: number;
  title: string;
  version: string;
  description: string;
  department: string;
  activeStatus: ActiveStatus;
  updatedAt: string;
  updatedBy: string;
};

type DocumentFormValues = {
  title: string;
  version: string;
  description: string;
  department: string;
  file: File | null;
};

const DOCUMENTS_PER_PAGE = 5;

const initialDocuments: ManagedDocument[] = [
  {
    id: 1,
    title: 'Código de Conduta Corporativa',
    version: 'v8.2',
    description: 'Revisão técnica concluída',
    department: 'Recursos Humanos',
    activeStatus: 'Ativo',
    updatedAt: 'Hoje, 09:40',
    updatedBy: 'Ana Souza',
  },
  {
    id: 2,
    title: 'Política de Home Office',
    version: 'v5.1',
    description: 'Nova proposta de auxílio',
    department: 'Recursos Humanos',
    activeStatus: 'Inativo',
    updatedAt: 'Ontem, 17:25',
    updatedBy: 'Ana Souza',
  },
  {
    id: 3,
    title: 'Norma de Acesso Privilegiado',
    version: 'v3.1',
    description: 'Atualização de segurança',
    department: 'TI & Segurança',
    activeStatus: 'Ativo',
    updatedAt: '12 Mar, 14:10',
    updatedBy: 'João Pereira',
  },
  {
    id: 4,
    title: 'Política de Segurança da Informação',
    version: 'v11.4',
    description: 'Indexada para respostas da IA',
    department: 'TI & Segurança',
    activeStatus: 'Inativo',
    updatedAt: '10 Mar, 08:30',
    updatedBy: 'Sistema AI',
  },
  {
    id: 5,
    title: 'Diretrizes de Reembolso',
    version: 'v2.0',
    description: 'Limites anuais atualizados',
    department: 'Financeiro',
    activeStatus: 'Ativo',
    updatedAt: '05 Mar, 11:15',
    updatedBy: 'Marcos Silva',
  },
  {
    id: 6,
    title: 'Manual de Compras Corporativas',
    version: 'v4.7',
    description: 'Fluxos de aprovação revisados',
    department: 'Financeiro',
    activeStatus: 'Ativo',
    updatedAt: '02 Mar, 16:00',
    updatedBy: 'Carla Mendes',
  },
  {
    id: 7,
    title: 'Guia de Proteção de Dados',
    version: 'v6.0',
    description: 'Adequação de retenção documental',
    department: 'Jurídico',
    activeStatus: 'Ativo',
    updatedAt: '28 Fev, 10:20',
    updatedBy: 'Bianca Rocha',
  },
  {
    id: 8,
    title: 'Procedimento de Onboarding',
    version: 'v1.8',
    description: 'Checklist de integração atualizado',
    department: 'Recursos Humanos',
    activeStatus: 'Inativo',
    updatedAt: '25 Fev, 15:45',
    updatedBy: 'Ana Souza',
  },
  {
    id: 9,
    title: 'Política de Senhas',
    version: 'v3.9',
    description: 'Critérios mínimos de complexidade',
    department: 'TI & Segurança',
    activeStatus: 'Ativo',
    updatedAt: '22 Fev, 13:12',
    updatedBy: 'João Pereira',
  },
  {
    id: 10,
    title: 'Norma de Viagens',
    version: 'v2.6',
    description: 'Regras para reservas e prestação de contas',
    department: 'Financeiro',
    activeStatus: 'Ativo',
    updatedAt: '18 Fev, 09:05',
    updatedBy: 'Marcos Silva',
  },
];

const emptyDocumentForm: DocumentFormValues = {
  title: '',
  version: 'v1.0',
  description: '',
  department: 'Recursos Humanos',
  file: null,
};

export default function AdminDocuments() {
  const navigate = useNavigate();
  const [managedDocuments, setManagedDocuments] = useState<ManagedDocument[]>(initialDocuments);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<DocumentFormValues>(emptyDocumentForm);
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagedDocument | null>(null);
  const [editingDocumentId, setEditingDocumentId] = useState<number | null>(null);

  const departmentOptions = useMemo(
    () => ['Todos', ...Array.from(new Set(managedDocuments.map((document) => document.department)))],
    [managedDocuments]
  );

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return managedDocuments.filter((document) => {
      const matchesSearch =
        document.title.toLowerCase().includes(normalizedSearch) ||
        document.description.toLowerCase().includes(normalizedSearch) ||
        document.version.toLowerCase().includes(normalizedSearch);
      const matchesDepartment = departmentFilter === 'Todos' || document.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [departmentFilter, managedDocuments, search]);

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / DOCUMENTS_PER_PAGE));
  const visiblePage = Math.min(currentPage, totalPages);
  const pageStart = (visiblePage - 1) * DOCUMENTS_PER_PAGE;
  const pageEnd = pageStart + DOCUMENTS_PER_PAGE;
  const paginatedDocuments = filteredDocuments.slice(pageStart, pageEnd);
  const firstVisibleDocument = filteredDocuments.length === 0 ? 0 : pageStart + 1;
  const lastVisibleDocument = Math.min(pageEnd, filteredDocuments.length);
  const activeDocuments = managedDocuments.filter((document) => document.activeStatus === 'Ativo').length;
  const trustScore = 90;

  function handleSearchChange(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function handleDepartmentChange(value: string) {
    setDepartmentFilter(value);
    setCurrentPage(1);
  }

  function handleCloseUploadModal() {
    setIsUploadModalOpen(false);
    setEditingDocumentId(null);
    setFormValues(emptyDocumentForm);
  }

  function handleOpenCreate() {
    setEditingDocumentId(null);
    setFormValues(emptyDocumentForm);
    setIsUploadModalOpen(true);
  }

  function handleUploadSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingDocumentId) {
      setManagedDocuments((current) =>
        current.map((document) =>
          document.id === editingDocumentId
            ? {
                ...document,
                title: formValues.title.trim(),
                version: formValues.version.trim(),
                description: formValues.description.trim(),
                department: formValues.department,
                updatedAt: 'Agora',
                updatedBy: 'Admin',
              }
            : document
        )
      );
      handleCloseUploadModal();
      return;
    }

    const nextDocument: ManagedDocument = {
      id: Math.max(...managedDocuments.map((document) => document.id), 0) + 1,
      title: formValues.title.trim(),
      version: formValues.version.trim(),
      description: formValues.description.trim() || `Arquivo ${formValues.file?.name ?? 'enviado'} aguardando indexação`,
      department: formValues.department,
      activeStatus: 'Ativo',
      updatedAt: 'Agora',
      updatedBy: 'Admin',
    };

    setManagedDocuments((current) => [nextDocument, ...current]);
    setCurrentPage(1);
    handleCloseUploadModal();
  }

  function handleToggleDocument(documentId: number) {
    setManagedDocuments((current) =>
      current.map((document) =>
        document.id === documentId
          ? {
              ...document,
              activeStatus: document.activeStatus === 'Ativo' ? 'Inativo' : 'Ativo',
              updatedAt: 'Agora',
              updatedBy: 'Admin',
            }
          : document
      )
    );
    setOpenActionMenuId(null);
  }

  function handleReindexDocument(documentId: number) {
    setManagedDocuments((current) =>
      current.map((document) =>
        document.id === documentId
          ? {
              ...document,
              description: 'Reindexado para respostas da IA',
              updatedAt: 'Agora',
              updatedBy: 'Sistema AI',
            }
          : document
      )
    );
    setOpenActionMenuId(null);
  }

  function handleOpenEdit(document: ManagedDocument) {
    setEditingDocumentId(document.id);
    setFormValues({
      title: document.title,
      version: document.version,
      description: document.description,
      department: document.department,
      file: null,
    });
    setIsUploadModalOpen(true);
    setOpenActionMenuId(null);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setManagedDocuments((current) => current.filter((document) => document.id !== deleteTarget.id));
    setDeleteTarget(null);
    setOpenActionMenuId(null);
  }

  return (
    <main className="admin-users-page admin-documents-page">
      <section className="admin-users-content documents-content">
        <header className="admin-users-header documents-header">
          <div className="documents-title">
            <FileText size={22} />
            <h1>Gestão de Documentos</h1>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="primary-btn documents-primary-btn"
              onClick={handleOpenCreate}
            >
              <Plus size={17} />
              Novo documento
            </button>
          </div>
        </header>

        <section className="documents-stats-grid" aria-label="Resumo de documentos">
          <article className="stat-card document-stat-card">
            <span className="stat-label">Documentos ativos</span>
            <strong className="stat-value">{activeDocuments}</strong>
          </article>

          <article className="stat-card document-stat-card">
            <span className="stat-label">Confiabilidade da base</span>
            <strong className="stat-value">{trustScore}%</strong>
          </article>
        </section>

        <section className="users-section documents-section">
          <div className="documents-toolbar">
            <label className="catalog-search document-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Pesquisar documentos, versões..."
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
              />
            </label>

            <div className="documents-filters">
              <select
                className="filter-select document-filter-select"
                value={departmentFilter}
                onChange={(event) => handleDepartmentChange(event.target.value)}
                aria-label="Filtrar por departamento"
              >
                {departmentOptions.map((department) => (
                  <option value={department} key={department}>
                    {department === 'Todos' ? 'Departamento' : department}
                  </option>
                ))}
              </select>

            </div>
          </div>

          <div className="users-table-wrapper documents-table-wrapper">
            <table className="users-table documents-table">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Departamento</th>
                  <th>Documento ativo</th>
                  <th>Última atualização</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {paginatedDocuments.map((document) => (
                  <tr key={document.id}>
                    <td>
                      <div className="document-name-cell">
                        <span className="document-file-icon">
                          <FileText size={16} />
                        </span>
                        <div className="document-copy">
                          <strong>{document.title}</strong>
                          <span>
                            <b>{document.version}</b>
                            {document.description}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`document-department ${getDepartmentClass(document.department)}`}>
                        {document.department}
                      </span>
                    </td>
                    <td>
                      <span className={`document-active ${document.activeStatus.toLowerCase()}`}>
                        {document.activeStatus}
                      </span>
                    </td>
                    <td>
                      <div className="document-updated">
                        <strong>{document.updatedAt}</strong>
                        <span>por {document.updatedBy}</span>
                      </div>
                    </td>
                    <td>
                      <div className="document-actions-cell">
                        <button
                          type="button"
                          className="document-action-btn"
                          onClick={() =>
                            setOpenActionMenuId((current) => (current === document.id ? null : document.id))
                          }
                          aria-expanded={openActionMenuId === document.id}
                          aria-label={`Mais ações para ${document.title}`}
                          title="Mais ações"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {openActionMenuId === document.id && (
                          <div className="document-row-menu">
                            <button type="button" onClick={() => handleOpenEdit(document)}>
                              <Edit3 size={15} />
                              Editar documento
                            </button>
                            <button type="button" onClick={() => navigate('/document-timeline')}>
                              <History size={15} />
                              Ver histórico
                            </button>
                            <button type="button" onClick={() => handleReindexDocument(document.id)}>
                              <RefreshCw size={15} />
                              Reindexar na IA
                            </button>
                            <button type="button" onClick={() => handleToggleDocument(document.id)}>
                              <Power size={15} />
                              {document.activeStatus === 'Ativo' ? 'Desativar documento' : 'Ativar documento'}
                            </button>
                            <button
                              type="button"
                              className="danger"
                              onClick={() => {
                                setDeleteTarget(document);
                                setOpenActionMenuId(null);
                              }}
                            >
                              <Trash2 size={15} />
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredDocuments.length === 0 && (
                  <tr>
                    <td className="users-empty-cell" colSpan={5}>
                      Nenhum documento encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-pagination" aria-label="Paginação de documentos">
            <span className="pagination-summary">
              Mostrando {firstVisibleDocument}-{lastVisibleDocument} de {filteredDocuments.length} documentos
            </span>

            <div className="pagination-actions">
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={visiblePage === 1}
                aria-label="Página anterior"
                title="Página anterior"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="pagination-page">
                Página {visiblePage} de {totalPages}
              </span>

              <button
                type="button"
                className="pagination-btn"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={visiblePage === totalPages}
                aria-label="Próxima página"
                title="Próxima página"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </section>

      {isUploadModalOpen && (
        <div className="role-modal-backdrop" role="presentation">
          <form
            className="role-modal document-upload-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-upload-title"
            onSubmit={handleUploadSubmit}
          >
            <header className="role-modal-header">
              <div>
                <h2 id="document-upload-title">
                  {editingDocumentId ? 'Editar documento' : 'Novo documento'}
                </h2>
                <p>
                  {editingDocumentId
                    ? 'Atualize as informações do documento cadastrado.'
                    : 'Envie um arquivo e defina como ele será usado pela base do chat.'}
                </p>
              </div>

              <button
                type="button"
                className="role-modal-close"
                onClick={handleCloseUploadModal}
                aria-label="Fechar upload"
              >
                <X size={17} />
              </button>
            </header>

            <div className="invite-form-grid document-upload-grid">
              <label className="document-file-drop">
                <UploadCloud size={28} />
                <span>{formValues.file ? formValues.file.name : 'Selecionar documento'}</span>
                <small>PDF, DOCX, TXT ou Markdown</small>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      file: event.target.files?.[0] ?? null,
                    }))
                  }
                  required={!editingDocumentId}
                />
              </label>

              <label className="invite-field">
                <span>Título</span>
                <input
                  type="text"
                  value={formValues.title}
                  onChange={(event) =>
                    setFormValues((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Ex: Política de Privacidade"
                  required
                />
              </label>

              <div className="document-upload-row">
                <label className="invite-field">
                  <span>Versão</span>
                  <input
                    type="text"
                    value={formValues.version}
                    onChange={(event) =>
                      setFormValues((current) => ({ ...current, version: event.target.value }))
                    }
                    placeholder="v1.0"
                    required
                  />
                </label>

                <label className="invite-field">
                  <span>Departamento</span>
                  <select
                    value={formValues.department}
                    onChange={(event) =>
                      setFormValues((current) => ({ ...current, department: event.target.value }))
                    }
                    required
                  >
                    {departmentOptions
                      .filter((department) => department !== 'Todos')
                      .map((department) => (
                        <option value={department} key={department}>
                          {department}
                        </option>
                      ))}
                  </select>
                </label>
              </div>

              <label className="invite-field">
                <span>Descrição para indexação</span>
                <textarea
                  value={formValues.description}
                  onChange={(event) =>
                    setFormValues((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Resumo curto para orientar a base de conhecimento do chat"
                  required
                />
              </label>

            </div>

            <footer className="role-modal-actions">
              <button type="button" className="secondary-btn" onClick={handleCloseUploadModal}>
                Cancelar
              </button>
              <button type="submit" className="primary-btn">
                {editingDocumentId ? 'Salvar alterações' : 'Salvar documento'}
              </button>
            </footer>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="role-modal-backdrop" role="presentation">
          <section
            className="role-modal delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-document-title"
          >
            <header className="role-modal-header">
              <div>
                <h2 id="delete-document-title">Excluir documento</h2>
                <p>Esta ação remove o documento da base administrativa.</p>
              </div>
              <button
                type="button"
                className="role-modal-close"
                onClick={() => setDeleteTarget(null)}
                aria-label="Fechar"
              >
                <X size={17} />
              </button>
            </header>

            <div className="delete-modal-body">
              Tem certeza que deseja excluir <strong>{deleteTarget.title}</strong>?
              <span>O documento deixará de aparecer na gestão de documentos.</span>
            </div>

            <footer className="role-modal-actions">
              <button type="button" className="secondary-btn" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </button>
              <button type="button" className="primary-btn danger-btn" onClick={handleConfirmDelete}>
                Excluir
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}

function getDepartmentClass(department: string) {
  if (department.includes('TI')) {
    return 'technology';
  }

  return department.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
}
