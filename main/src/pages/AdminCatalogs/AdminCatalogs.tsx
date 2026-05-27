import { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit3, Plus, Search, Trash2 } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import {
  type BackendDepartment,
  type BackendSystem,
  type CatalogItem,
  type CatalogStatus,
  mapBackendDepartment,
  mapBackendSystem,
} from '../../services/adminApi';
import { useCursorScroll } from '../../hooks/useCursorScroll';
import { AdminStatsGrid } from '../../components/admin/AdminStatsGrid';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminModal } from '../../components/admin/AdminModal';
import { adminStyles, buttonStyles, formStyles, modalStyles } from '../../utils/tailwindStyles';
import { cn } from '../../utils/classNames';

const ITEMS_PER_PAGE = 4;

type CatalogMode = 'departments' | 'systems';

const emptyForm = {
  name: '',
  acronym: '',
  status: 'Ativo' as CatalogStatus,
};

interface AdminCatalogsProps {
  mode: CatalogMode;
}

function AdminCatalogs({ mode }: AdminCatalogsProps) {
  const [departments, setDepartments] = useState<CatalogItem[]>([]);
  const [systems, setSystems] = useState<CatalogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogItem | null>(null);
  const [formValues, setFormValues] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);
  const { post, put, patch, del, loading } = useFetch();
  const { fetchAll: fetchAllDepartments } = useCursorScroll<BackendDepartment>({
    endpoint: '/department/scrolling',
    cursorParam: 'departmentId',
    getCursor: (department) => department.departmentId,
  });
  const { fetchAll: fetchAllSystems } = useCursorScroll<BackendSystem>({
    endpoint: '/systems/scrolling',
    cursorParam: 'systemId',
    getCursor: (system) => system.systemId,
  });

  const isDepartmentsTab = mode === 'departments';
  const currentItems = isDepartmentsTab ? departments : systems;

  const loadCatalogs = useCallback(async () => {
    setIsLoadingCatalogs(true);
    const [departmentRows, systemRows] = await Promise.all([
      fetchAllDepartments(),
      fetchAllSystems(),
    ]);

    setDepartments(departmentRows.map(mapBackendDepartment));
    setSystems(systemRows.map(mapBackendSystem));
    setIsLoadingCatalogs(false);
  }, [fetchAllDepartments, fetchAllSystems]);

  const filteredItems = useMemo(() => {
    return currentItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.acronym.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'Todos' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [currentItems, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageEnd = pageStart + ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(pageStart, pageEnd);
  const activeDepartments = departments.filter((item) => item.status === 'Ativo').length;
  const activeSystems = systems.filter((item) => item.status === 'Ativo').length;

  useEffect(() => {
    queueMicrotask(() => {
      void loadCatalogs();
    });
  }, [loadCatalogs]);

  useEffect(() => {
    queueMicrotask(() => setCurrentPage(1));
  }, [searchTerm, statusFilter, mode]);

  useEffect(() => {
    queueMicrotask(() => setCurrentPage((page) => Math.min(page, totalPages)));
  }, [totalPages]);

  function handleOpenCreate() {
    setEditingItem(null);
    setFormValues(emptyForm);
    setIsFormOpen(true);
  }

  function handleOpenEdit(item: CatalogItem) {
    setEditingItem(item);
    setFormValues({
      name: item.name,
      acronym: item.acronym,
      status: item.status,
    });
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormValues(emptyForm);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isDepartmentsTab) {
      if (editingItem && formValues.status === 'Inativo') {
        await del(`/department/${editingItem.id}`, {
          successAlert: {
            title: 'Departamento desativado',
            message: 'O departamento foi removido da listagem ativa.',
          },
        });
      } else if (editingItem) {
        await patch(`/department/${editingItem.id}`, {
          body: {
            departmentId: editingItem.id,
            departmentNm: formValues.name.trim(),
            acronym: formValues.acronym.trim().toUpperCase(),
          },
          successAlert: {
            title: 'Departamento atualizado',
            message: 'O cadastro foi salvo no backend.',
          },
        });
      } else {
        await post('/department', {
          body: {
            departmentNm: formValues.name.trim(),
            acronym: formValues.acronym.trim().toUpperCase(),
          },
          successAlert: {
            title: 'Departamento criado',
            message: 'O cadastro foi salvo no backend.',
          },
        });
      }
    } else if (editingItem && formValues.status === 'Inativo') {
      await del(`/systems/${editingItem.id}`, {
        successAlert: {
          title: 'Sistema desativado',
          message: 'O sistema foi removido da listagem ativa.',
        },
      });
    } else if (editingItem) {
      await put('/systems', {
        body: {
          systemId: editingItem.id,
          systemNm: formValues.name.trim(),
          acronym: formValues.acronym.trim().toUpperCase(),
        },
        successAlert: {
          title: 'Sistema atualizado',
          message: 'O cadastro foi salvo no backend.',
        },
      });
    } else {
      await post('/systems', {
        body: {
          systemNm: formValues.name.trim(),
          acronym: formValues.acronym.trim().toUpperCase(),
        },
        successAlert: {
          title: 'Sistema criado',
          message: 'O cadastro foi salvo no backend.',
        },
      });
    }

    await loadCatalogs();
    handleCloseForm();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) {
      return;
    }

    if (isDepartmentsTab) {
      await del(`/department/${deleteTarget.id}`, {
        successAlert: {
          title: 'Departamento desativado',
          message: 'O departamento foi removido da listagem ativa.',
        },
      });
    } else {
      await del(`/systems/${deleteTarget.id}`, {
        successAlert: {
          title: 'Sistema desativado',
          message: 'O sistema foi removido da listagem ativa.',
        },
      });
    }

    await loadCatalogs();
    setDeleteTarget(null);
  }

  return (
    <main className={adminStyles.page}>
      <section className={adminStyles.content}>
        <header className={adminStyles.header}>
          <div>
            <h1 className={adminStyles.title}>{isDepartmentsTab ? 'Departamentos' : 'Sistemas'}</h1>
          </div>

          <div className={adminStyles.headerActions}>
            <button type="button" className={buttonStyles.primary} onClick={handleOpenCreate}>
              <Plus size={17} />
              {isDepartmentsTab ? 'Novo departamento' : 'Novo sistema'}
            </button>
          </div>
        </header>

        <AdminStatsGrid
          cards={[
            { label: 'Departamentos', value: departments.length },
            { label: 'Departamentos ativos', value: activeDepartments },
            { label: 'Sistemas', value: systems.length },
            { label: 'Sistemas ativos', value: activeSystems },
          ]}
        />

        <section className={adminStyles.section}>
          <div className={adminStyles.sectionHeader}>
            <h2 className={adminStyles.sectionTitle}>{isDepartmentsTab ? 'Departamentos' : 'Sistemas'}</h2>

            <div className={adminStyles.filtersRow}>
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={17} />
                <input
                  className={`${formStyles.input} ${adminStyles.filterInput} pl-10`}
                  type="text"
                  placeholder="Buscar por nome ou sigla"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className={formStyles.select}
              >
                <option value="Todos">Status: Todos</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>

          <AdminTable
            columns={['Nome', 'Sigla', 'Status', 'Ações']}
            isLoading={isLoadingCatalogs}
            loadingMessage="Carregando cadastros..."
            isEmpty={paginatedItems.length === 0}
            emptyMessage="Nenhum cadastro encontrado."
          >
            {paginatedItems.map((item) => (
              <tr key={`${mode}-${item.id}`}>
                <td className={adminStyles.td}>
                  <strong className={adminStyles.userName}>{item.name}</strong>
                </td>
                <td className={adminStyles.td}>{item.acronym}</td>
                <td className={adminStyles.td}>
                  <span className={item.status === 'Ativo' ? adminStyles.badgeActive : adminStyles.badgeBlocked}>
                    {item.status}
                  </span>
                </td>
                <td className={adminStyles.td}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={buttonStyles.icon}
                      onClick={() => handleOpenEdit(item)}
                      aria-label={`Editar ${item.name}`}
                      title="Editar"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      className={buttonStyles.iconDanger}
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
          </AdminTable>

          <AdminPagination
            currentPage={currentPage}
            totalItems={filteredItems.length}
            perPage={ITEMS_PER_PAGE}
            itemLabel={isDepartmentsTab ? 'departamentos' : 'sistemas'}
            onChange={setCurrentPage}
          />
        </section>
      </section>

      <AdminModal
        open={isFormOpen}
        as="form"
        title={`${editingItem ? 'Editar' : 'Adicionar'} ${isDepartmentsTab ? 'departamento' : 'sistema'}`}
        titleId="catalog-modal-title"
        description="Preencha as informações do cadastro."
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        actions={
          <>
            <button type="button" className={buttonStyles.secondary} onClick={handleCloseForm}>
              Cancelar
            </button>
            <button type="submit" className={buttonStyles.primary} disabled={loading}>
              Salvar
            </button>
          </>
        }
      >
        <div className={`${modalStyles.body} ${adminStyles.formGrid}`}>
          <label className={formStyles.label}>
            <span>Nome</span>
            <input
              className={formStyles.input}
              type="text"
              value={formValues.name}
              onChange={(event) =>
                setFormValues((current) => ({ ...current, name: event.target.value }))
              }
              placeholder={isDepartmentsTab ? 'Ex: Jurídico' : 'Ex: Portal Jurídico'}
              required
            />
          </label>

          <label className={formStyles.label}>
            <span>Sigla</span>
            <input
              className={formStyles.input}
              type="text"
              value={formValues.acronym}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  acronym: event.target.value.toUpperCase(),
                }))
              }
              placeholder={isDepartmentsTab ? 'Ex: JUR' : 'Ex: PORT'}
              minLength={2}
              maxLength={5}
              required
            />
          </label>

          <label className={formStyles.label}>
            <span>Status</span>
            <select
              className={formStyles.select}
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
      </AdminModal>

      <AdminModal
        open={Boolean(deleteTarget)}
        title="Excluir cadastro"
        titleId="delete-modal-title"
        description="Esta ação remove o item da lista atual."
        onClose={() => setDeleteTarget(null)}
        panelClassName={modalStyles.panel}
        actions={
          <>
            <button
              type="button"
              className={buttonStyles.secondary}
              onClick={() => setDeleteTarget(null)}
            >
              Cancelar
            </button>
            <button type="button" className={buttonStyles.danger} onClick={handleConfirmDelete}>
              Excluir
            </button>
          </>
        }
      >
        {deleteTarget && (
          <div className={cn(modalStyles.body, adminStyles.deleteBody)}>
            Tem certeza que deseja excluir <strong>{deleteTarget.name}</strong>?
            <span>O backend fará uma desativação lógica do cadastro.</span>
          </div>
        )}
      </AdminModal>
    </main>
  );
}

export default function AdminDepartments() {
  return <AdminCatalogs mode="departments" />;
}

export function AdminSystems() {
  return <AdminCatalogs mode="systems" />;
}