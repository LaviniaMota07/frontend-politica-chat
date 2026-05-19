import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Plus, Search, Trash2 } from 'lucide-react';
import '../../styles/admin-users.css';
import '../../styles/admin-catalogs.css';

const ITEMS_PER_PAGE = 4;

type CatalogStatus = 'Ativo' | 'Inativo';
type CatalogMode = 'departments' | 'systems';

type Department = {
  id: number;
  name: string;
  description: string;
  manager: string;
  status: CatalogStatus;
};

type CompanySystem = {
  id: number;
  name: string;
  description: string;
  departmentId: number;
  url: string;
  status: CatalogStatus;
};

type CatalogItem = Department | CompanySystem;

const mockDepartments: Department[] = [
  {
    id: 1,
    name: 'Recursos Humanos',
    description: 'Políticas internas, benefícios e gestão de pessoas.',
    manager: 'Ana Souza',
    status: 'Ativo',
  },
  {
    id: 2,
    name: 'Tecnologia (TI)',
    description: 'Sistemas corporativos, infraestrutura e segurança.',
    manager: 'João Pereira',
    status: 'Ativo',
  },
  {
    id: 3,
    name: 'Financeiro',
    description: 'Reembolsos, pagamentos e normas fiscais.',
    manager: 'Rafael Lima',
    status: 'Inativo',
  },
];

const mockSystems: CompanySystem[] = [
  {
    id: 1,
    name: 'Portal RH',
    description: 'Solicitações de férias, holerites e benefícios.',
    departmentId: 1,
    url: 'https://rh.empresa.com',
    status: 'Ativo',
  },
  {
    id: 2,
    name: 'Service Desk',
    description: 'Abertura e acompanhamento de chamados internos.',
    departmentId: 2,
    url: 'https://suporte.empresa.com',
    status: 'Ativo',
  },
  {
    id: 3,
    name: 'Reembolso Online',
    description: 'Registro e aprovação de despesas corporativas.',
    departmentId: 3,
    url: 'https://reembolso.empresa.com',
    status: 'Inativo',
  },
];

const emptyForm = {
  name: '',
  description: '',
  manager: '',
  departmentId: '',
  url: '',
  status: 'Ativo' as CatalogStatus,
};

interface AdminCatalogsProps {
  mode: CatalogMode;
}

function AdminCatalogs({ mode }: AdminCatalogsProps) {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [systems, setSystems] = useState<CompanySystem[]>(mockSystems);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogItem | null>(null);
  const [formValues, setFormValues] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const isDepartmentsTab = mode === 'departments';
  const currentItems = isDepartmentsTab ? departments : systems;

  const filteredItems = useMemo(() => {
    return currentItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'Todos' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [currentItems, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageEnd = pageStart + ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(pageStart, pageEnd);
  const firstVisibleItem = filteredItems.length === 0 ? 0 : pageStart + 1;
  const lastVisibleItem = Math.min(pageEnd, filteredItems.length);

  const activeDepartments = departments.filter((item) => item.status === 'Ativo').length;
  const activeSystems = systems.filter((item) => item.status === 'Ativo').length;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, mode]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  function handleOpenCreate() {
    setEditingItem(null);
    setFormValues({
      ...emptyForm,
      departmentId: departments[0]?.id.toString() ?? '',
    });
    setIsFormOpen(true);
  }

  function handleOpenEdit(item: CatalogItem) {
    setEditingItem(item);
    setFormValues({
      name: item.name,
      description: item.description,
      manager: 'manager' in item ? item.manager : '',
      departmentId: 'departmentId' in item ? item.departmentId.toString() : '',
      url: 'url' in item ? item.url : '',
      status: item.status,
    });
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormValues(emptyForm);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isDepartmentsTab) {
      const nextDepartment: Department = {
        id: editingItem?.id ?? Math.max(...departments.map((item) => item.id), 0) + 1,
        name: formValues.name.trim(),
        description: formValues.description.trim(),
        manager: formValues.manager.trim(),
        status: formValues.status,
      };

      setDepartments((current) =>
        editingItem
          ? current.map((item) => (item.id === editingItem.id ? nextDepartment : item))
          : [nextDepartment, ...current]
      );
    } else {
      const nextSystem: CompanySystem = {
        id: editingItem?.id ?? Math.max(...systems.map((item) => item.id), 0) + 1,
        name: formValues.name.trim(),
        description: formValues.description.trim(),
        departmentId: Number(formValues.departmentId),
        url: formValues.url.trim(),
        status: formValues.status,
      };

      setSystems((current) =>
        editingItem
          ? current.map((item) => (item.id === editingItem.id ? nextSystem : item))
          : [nextSystem, ...current]
      );
    }

    handleCloseForm();
  }

  function handleConfirmDelete() {
    if (!deleteTarget) {
      return;
    }

    if (isDepartmentsTab) {
      setDepartments((current) => current.filter((item) => item.id !== deleteTarget.id));
      setSystems((current) =>
        current.filter((item) => item.departmentId !== deleteTarget.id)
      );
    } else {
      setSystems((current) => current.filter((item) => item.id !== deleteTarget.id));
    }

    setDeleteTarget(null);
  }

  return (
    <main className="admin-users-page admin-catalogs-page">
      <section className="admin-users-content">
        <header className="admin-users-header">
          <div>
            <h1>{isDepartmentsTab ? 'Departamentos' : 'Sistemas'}</h1>
          </div>

          <div className="header-actions">
            <button type="button" className="primary-btn" onClick={handleOpenCreate}>
              <Plus size={17} />
              {isDepartmentsTab ? 'Novo departamento' : 'Novo sistema'}
            </button>
          </div>
        </header>

        <section className="stats-grid">
          <article className="stat-card">
            <span className="stat-label">Departamentos</span>
            <strong className="stat-value">{departments.length}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Departamentos ativos</span>
            <strong className="stat-value">{activeDepartments}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Sistemas</span>
            <strong className="stat-value">{systems.length}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Sistemas ativos</span>
            <strong className="stat-value">{activeSystems}</strong>
          </article>
        </section>

        <section className="users-section catalog-section">
          <div className="users-section-header catalog-section-header">
            <h2>{isDepartmentsTab ? 'Departamentos' : 'Sistemas'}</h2>

            <div className="filters-row">
              <label className="catalog-search">
                <Search size={17} />
                <input
                  type="text"
                  placeholder="Buscar por nome ou descrição"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="filter-select"
              >
                <option value="Todos">Status: Todos</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>

          <div className="users-table-wrapper">
            <table className="users-table catalog-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  {isDepartmentsTab && <th>Responsável</th>}
                  {!isDepartmentsTab && <th>URL</th>}
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={`${mode}-${item.id}`}>
                    <td>
                      <strong className="catalog-name">{item.name}</strong>
                    </td>
                    <td>{item.description}</td>
                    {'manager' in item && (
                      <td>
                        <span className="department-badge">{item.manager}</span>
                      </td>
                    )}
                    {'url' in item && (
                      <td>
                        <span className="catalog-url">{item.url}</span>
                      </td>
                    )}
                    <td>
                      <span className={`status-badge ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="catalog-actions">
                        <button
                          type="button"
                          className="catalog-icon-btn"
                          onClick={() => handleOpenEdit(item)}
                          aria-label={`Editar ${item.name}`}
                          title="Editar"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          className="catalog-icon-btn danger"
                          onClick={() => setDeleteTarget(item)}
                          aria-label={`Excluir ${item.name}`}
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-pagination" aria-label="Paginação">
            <span className="pagination-summary">
              Mostrando {firstVisibleItem}-{lastVisibleItem} de {filteredItems.length} {isDepartmentsTab ? 'departamentos' : 'sistemas'}
            </span>

            <div className="pagination-actions">
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                aria-label="Página anterior"
                title="Página anterior"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="pagination-page">
                Página {currentPage} de {totalPages}
              </span>

              <button
                type="button"
                className="pagination-btn"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                aria-label="Próxima página"
                title="Próxima página"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </section>

      {isFormOpen && (
        <div className="role-modal-backdrop" role="presentation">
          <form
            className="role-modal catalog-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalog-modal-title"
            onSubmit={handleSubmit}
          >
            <header className="role-modal-header">
              <div>
                <h2 id="catalog-modal-title">
                  {editingItem ? 'Editar' : 'Adicionar'}{' '}
                  {isDepartmentsTab ? 'departamento' : 'sistema'}
                </h2>
                <p>Preencha as informações do cadastro.</p>
              </div>

              <button
                type="button"
                className="role-modal-close"
                onClick={handleCloseForm}
                aria-label="Fechar"
              >
                x
              </button>
            </header>

            <div className="invite-form-grid">
              <label className="invite-field">
                <span>Nome</span>
                <input
                  type="text"
                  value={formValues.name}
                  onChange={(event) =>
                    setFormValues((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder={isDepartmentsTab ? 'Ex: Jurídico' : 'Ex: Portal Jurídico'}
                  required
                />
              </label>

              <label className="invite-field">
                <span>Descrição</span>
                <textarea
                  value={formValues.description}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Descreva a finalidade deste cadastro"
                  required
                />
              </label>

              {isDepartmentsTab ? (
                <label className="invite-field">
                  <span>Responsável</span>
                  <input
                    type="text"
                    value={formValues.manager}
                    onChange={(event) =>
                      setFormValues((current) => ({
                        ...current,
                        manager: event.target.value,
                      }))
                    }
                    placeholder="Ex: Camila Andrade"
                    required
                  />
                </label>
              ) : (
                <>
                  <label className="invite-field">
                    <span>Departamento</span>
                    <select
                      value={formValues.departmentId}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          departmentId: event.target.value,
                        }))
                      }
                      required
                    >
                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="invite-field">
                    <span>URL</span>
                    <input
                      type="url"
                      value={formValues.url}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, url: event.target.value }))
                      }
                      placeholder="https://sistema.empresa.com"
                      required
                    />
                  </label>
                </>
              )}

              <label className="invite-field">
                <span>Status</span>
                <select
                  value={formValues.status}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      status: event.target.value as CatalogStatus,
                    }))
                  }
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </label>
            </div>

            <footer className="role-modal-actions">
              <button type="button" className="secondary-btn" onClick={handleCloseForm}>
                Cancelar
              </button>
              <button type="submit" className="primary-btn">
                Salvar
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
            aria-labelledby="delete-modal-title"
          >
            <header className="role-modal-header">
              <div>
                <h2 id="delete-modal-title">Excluir cadastro</h2>
                <p>Esta ação remove o item da lista atual.</p>
              </div>
              <button
                type="button"
                className="role-modal-close"
                onClick={() => setDeleteTarget(null)}
                aria-label="Fechar"
              >
                x
              </button>
            </header>

            <div className="delete-modal-body">
              Tem certeza que deseja excluir <strong>{deleteTarget.name}</strong>?
              {isDepartmentsTab && (
                <span>
                  Sistemas vinculados a este departamento também serão removidos.
                </span>
              )}
            </div>

            <footer className="role-modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setDeleteTarget(null)}
              >
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

export default function AdminDepartments() {
  return <AdminCatalogs mode="departments" />;
}

export function AdminSystems() {
  return <AdminCatalogs mode="systems" />;
}