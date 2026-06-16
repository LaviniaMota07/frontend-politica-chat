import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Edit3, Power, Search, Users } from 'lucide-react';
import { AdminModal } from '../../components/admin/AdminModal';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminStatsGrid } from '../../components/admin/AdminStatsGrid';
import { AdminTable } from '../../components/admin/AdminTable';
import { useCursorScroll } from '../../hooks/useCursorScroll';
import { useFetch } from '../../hooks/useFetch';
import type {
  BackendDepartment,
  BackendPermissionGroup,
  BackendPermissionGroupDetail,
  BackendPermissionGroupUser,
  BackendSystem,
  BackendUser,
  PermissionGroupPaginationResponse,
} from '../../services/adminApi';
import { adminStyles, buttonStyles, formStyles, modalStyles } from '../../utils/tailwindStyles';

const GROUPS_PER_PAGE = 4;
const PERMISSION_GROUPS_PAGE_SIZE = 100;
const SCROLLABLE_MODAL_PANEL =
  'w-full max-w-[640px] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[22px] border border-[var(--border-neutral)] border-t-[3px] border-t-[var(--accent)] bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-[0_28px_80px_rgba(31,29,25,0.24)]';

interface PermissionGroupRow {
  id: number;
  name: string;
  active: boolean;
  departmentIds: number[];
  systemIds: number[];
  departmentNames: string[];
  systemNames: string[];
}

function toggleNumber(values: number[], nextValue: number) {
  return values.includes(nextValue)
    ? values.filter((value) => value !== nextValue)
    : [...values, nextValue];
}

function formatAccessLabels(labels: string[]) {
  if (labels.length === 0) {
    return 'Sem vínculo';
  }

  return labels.join(', ');
}

function toggleSetValue(values: Set<number>, value: number) {
  const next = new Set(values);

  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }

  return next;
}

function matchesUserSearch(
  user: Pick<BackendPermissionGroupUser, 'name' | 'email'>,
  search: string,
) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return (
    user.name.toLowerCase().includes(normalizedSearch) ||
    user.email.toLowerCase().includes(normalizedSearch)
  );
}

export default function AdminPermissionGroups() {
  const { get, post, patch, del, loading } = useFetch();
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroupRow[]>([]);
  const [departments, setDepartments] = useState<BackendDepartment[]>([]);
  const [systems, setSystems] = useState<BackendSystem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<PermissionGroupRow | null>(null);
  const [groupName, setGroupName] = useState('');
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<number[]>([]);
  const [selectedSystemIds, setSelectedSystemIds] = useState<number[]>([]);
  const [managingGroup, setManagingGroup] = useState<PermissionGroupRow | null>(null);
  const [allUsers, setAllUsers] = useState<BackendUser[]>([]);
  const [groupMembers, setGroupMembers] = useState<BackendPermissionGroupUser[]>([]);
  const [selectedToAdd, setSelectedToAdd] = useState<Set<number>>(() => new Set());
  const [selectedToRemove, setSelectedToRemove] = useState<Set<number>>(() => new Set());
  const [memberSearch, setMemberSearch] = useState('');
  const [availableSearch, setAvailableSearch] = useState('');
  const [isLoadingUsersModal, setIsLoadingUsersModal] = useState(false);

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

  const fetchAllPermissionGroups = useCallback(async () => {
    const groups: BackendPermissionGroup[] = [];
    let currentPermissionGroupsPage = 1;
    let totalPermissionGroupsPages = 1;

    do {
      const response = await get(
        `/permission-groups/pagination?limit=${PERMISSION_GROUPS_PAGE_SIZE}&currentPage=${currentPermissionGroupsPage}`,
      ) as PermissionGroupPaginationResponse | null;

      if (!response) {
        break;
      }

      groups.push(...response.data);
      totalPermissionGroupsPages = response.pages;
      currentPermissionGroupsPage += 1;
    } while (currentPermissionGroupsPage <= totalPermissionGroupsPages);

    return groups;
  }, [get]);

  const loadPageData = useCallback(async () => {
    setIsLoadingGroups(true);

    const [departmentRows, systemRows, groupRows] = await Promise.all([
      fetchAllDepartments(),
      fetchAllSystems(),
      fetchAllPermissionGroups(),
    ]);

    const activeDepartments = departmentRows.filter((department) => department.active);
    const activeSystems = systemRows.filter((system) => system.active);

    const groupsWithAccess = await Promise.all(
      groupRows.map(async (group) => {
        const [groupDepartments, groupSystems] = await Promise.all([
          get(`/permission-groups/${group.permissionGroupId}/departments`) as Promise<BackendDepartment[] | null>,
          get(`/permission-groups/${group.permissionGroupId}/systems`) as Promise<BackendSystem[] | null>,
        ]);

        return {
          id: group.permissionGroupId,
          name: group.permissionGroupNm,
          active: group.active,
          departmentIds: (groupDepartments ?? []).map((department) => department.departmentId),
          systemIds: (groupSystems ?? []).map((system) => system.systemId),
          departmentNames: (groupDepartments ?? []).map((department) => department.departmentNm),
          systemNames: (groupSystems ?? []).map((system) => system.systemNm),
        };
      }),
    );

    setDepartments(activeDepartments);
    setSystems(activeSystems);
    setPermissionGroups(groupsWithAccess);
    setIsLoadingGroups(false);
  }, [fetchAllDepartments, fetchAllPermissionGroups, fetchAllSystems, get]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadPageData();
    });
  }, [loadPageData]);

  const filteredGroups = useMemo(() => {
    return permissionGroups.filter((group) => {
      const normalizedSearch = searchTerm.toLowerCase();
      const matchesSearch =
        group.name.toLowerCase().includes(normalizedSearch) ||
        group.departmentNames.some((department) => department.toLowerCase().includes(normalizedSearch)) ||
        group.systemNames.some((system) => system.toLowerCase().includes(normalizedSearch));

      const matchesStatus =
        statusFilter === 'Todos' ||
        (statusFilter === 'Ativo' && group.active) ||
        (statusFilter === 'Inativo' && !group.active);

      return matchesSearch && matchesStatus;
    });
  }, [permissionGroups, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / GROUPS_PER_PAGE));
  const pageStart = (currentPage - 1) * GROUPS_PER_PAGE;
  const paginatedGroups = filteredGroups.slice(pageStart, pageStart + GROUPS_PER_PAGE);
  const activeGroups = permissionGroups.filter((group) => group.active).length;

  const memberIdSet = useMemo(
    () => new Set(groupMembers.map((member) => member.userId)),
    [groupMembers],
  );

  const filteredGroupMembers = useMemo(
    () => groupMembers.filter((member) => matchesUserSearch(member, memberSearch)),
    [groupMembers, memberSearch],
  );

  const filteredAvailableUsers = useMemo(
    () =>
      allUsers
        .filter((user) => !memberIdSet.has(user.userId))
        .filter((user) => matchesUserSearch(user, availableSearch)),
    [allUsers, availableSearch, memberIdSet],
  );

  const hasUserChanges = selectedToAdd.size > 0 || selectedToRemove.size > 0;

  useEffect(() => {
    queueMicrotask(() => setCurrentPage(1));
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    queueMicrotask(() => setCurrentPage((page) => Math.min(page, totalPages)));
  }, [totalPages]);

  function handleOpenCreate() {
    setEditingGroup(null);
    setGroupName('');
    setSelectedDepartmentIds([]);
    setSelectedSystemIds([]);
    setIsFormOpen(true);
  }

  function handleOpenEdit(group: PermissionGroupRow) {
    setEditingGroup(group);
    setGroupName(group.name);
    setSelectedDepartmentIds(group.departmentIds);
    setSelectedSystemIds(group.systemIds);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingGroup(null);
    setGroupName('');
    setSelectedDepartmentIds([]);
    setSelectedSystemIds([]);
  }

  function handleCloseManageUsers() {
    setManagingGroup(null);
    setAllUsers([]);
    setGroupMembers([]);
    setSelectedToAdd(new Set());
    setSelectedToRemove(new Set());
    setMemberSearch('');
    setAvailableSearch('');
    setIsLoadingUsersModal(false);
  }

  async function handleOpenManageUsers(group: PermissionGroupRow) {
    setManagingGroup(group);
    setSelectedToAdd(new Set());
    setSelectedToRemove(new Set());
    setMemberSearch('');
    setAvailableSearch('');
    setIsLoadingUsersModal(true);

    const [allUsersResponse, groupDetail] = await Promise.all([
      get('/user') as Promise<BackendUser[] | null>,
      get(`/permission-groups/${group.id}`) as Promise<BackendPermissionGroupDetail | null>,
    ]);

    if (!groupDetail) {
      setIsLoadingUsersModal(false);
      setManagingGroup(null);
      return;
    }

    const members = (groupDetail.permissionGroupUsers ?? []).map((entry) => entry.user);

    setAllUsers(allUsersResponse ?? []);
    setGroupMembers(members);
    setIsLoadingUsersModal(false);
  }

  async function handleSaveGroupUsers() {
    if (!managingGroup) {
      return;
    }

    const addIds = [...selectedToAdd];
    const removeIds = [...selectedToRemove];

    if (addIds.length === 0 && removeIds.length === 0) {
      handleCloseManageUsers();
      return;
    }

    if (addIds.length > 0) {
      const response = await post(`/permission-groups/${managingGroup.id}/users/bulk`, {
        body: { userIds: addIds },
      });

      if (!response) {
        return;
      }
    }

    if (removeIds.length > 0) {
      const removalResults = await Promise.all(
        removeIds.map((userId) => del(`/permission-groups/${managingGroup.id}/users/${userId}`)),
      );

      if (removalResults.some((result) => !result)) {
        return;
      }
    }

    toast.success('Usuários do grupo atualizados.');
    await loadPageData();
    handleCloseManageUsers();
  }

  async function syncGroupAccess(
    permissionGroupId: number,
    currentIds: number[],
    nextIds: number[],
    resource: 'departments' | 'systems',
  ) {
    const currentSet = new Set(currentIds);
    const nextSet = new Set(nextIds);
    const additions = nextIds.filter((id) => !currentSet.has(id));
    const removals = currentIds.filter((id) => !nextSet.has(id));
    const idField = resource === 'departments' ? 'departmentId' : 'systemId';

    await Promise.all([
      ...additions.map((id) =>
        post(`/permission-groups/${resource}`, {
          body: {
            permissionGroupId,
            [idField]: id,
          },
        }),
      ),
      ...removals.map((id) => del(`/permission-groups/${permissionGroupId}/${resource}/${id}`)),
    ]);
  }

  async function handleSubmitGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const permissionGroupNm = groupName.trim();

    if (permissionGroupNm.length < 3) {
      toast.error('Nome do grupo deve ter pelo menos 3 caracteres.');
      return;
    }

    let permissionGroupId = editingGroup?.id;

    if (editingGroup) {
      const response = await patch('/permission-groups', {
        body: {
          permissionGroupId: editingGroup.id,
          permissionGroupNm,
        },
      }) as BackendPermissionGroup | null;

      if (!response) {
        return;
      }
    } else {
      const response = await post('/permission-groups', {
        body: { permissionGroupNm },
      }) as BackendPermissionGroup | null;

      if (!response) {
        return;
      }

      permissionGroupId = response.permissionGroupId;
    }

    if (!permissionGroupId) {
      return;
    }

    await syncGroupAccess(
      permissionGroupId,
      editingGroup?.departmentIds ?? [],
      selectedDepartmentIds,
      'departments',
    );
    await syncGroupAccess(
      permissionGroupId,
      editingGroup?.systemIds ?? [],
      selectedSystemIds,
      'systems',
    );

    toast.success(editingGroup ? 'Grupo de permissão atualizado.' : 'Grupo de permissão criado.');
    await loadPageData();
    handleCloseForm();
  }

  async function handleToggleActive(group: PermissionGroupRow) {
    const response = await patch(`/permission-groups/${group.id}/toggle-active`);

    if (response) {
      toast.success(group.active ? 'Grupo de permissão desativado.' : 'Grupo de permissão ativado.');
      await loadPageData();
    }
  }

  return (
    <main className={adminStyles.page}>
      <section className={adminStyles.content}>
        <header className={adminStyles.header}>
          <div>
            <h1 className={adminStyles.title}>Grupos de Permissão</h1>
            <p className={adminStyles.subtitle}>
              Crie grupos e defina quais departamentos e sistemas ficam disponíveis para os usuários vinculados.
            </p>
          </div>

          <div className={adminStyles.headerActions}>
            <button type="button" className={buttonStyles.primary} onClick={handleOpenCreate}>
              Novo grupo
            </button>
          </div>
        </header>

        <AdminStatsGrid
          cards={[
            { label: 'Grupos', value: permissionGroups.length },
            { label: 'Grupos ativos', value: activeGroups },
            { label: 'Departamentos disponíveis', value: departments.length },
            { label: 'Sistemas disponíveis', value: systems.length },
          ]}
        />

        <section className={adminStyles.section}>
          <div className={adminStyles.sectionHeader}>
            <h2 className={adminStyles.sectionTitle}>Permissões</h2>

            <div className={adminStyles.filtersRow}>
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={17} />
                <input
                  className={`${formStyles.input} ${adminStyles.filterInput} pl-10`}
                  type="text"
                  placeholder="Buscar grupo, departamento ou sistema"
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
            columns={['Grupo', 'Departamentos', 'Sistemas', 'Status', 'Ações']}
            isLoading={isLoadingGroups}
            loadingMessage="Carregando grupos de permissão..."
            isEmpty={paginatedGroups.length === 0}
            emptyMessage="Nenhum grupo de permissão encontrado."
          >
            {paginatedGroups.map((group) => (
              <tr key={group.id}>
                <td className={adminStyles.td}>
                  <strong className={adminStyles.userName}>{group.name}</strong>
                </td>
                <td className={adminStyles.td}>{formatAccessLabels(group.departmentNames)}</td>
                <td className={adminStyles.td}>{formatAccessLabels(group.systemNames)}</td>
                <td className={adminStyles.td}>
                  <span className={group.active ? adminStyles.badgeActive : adminStyles.badgeBlocked}>
                    {group.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className={adminStyles.td}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={buttonStyles.icon}
                      onClick={() => void handleOpenManageUsers(group)}
                      aria-label={`Gerenciar usuários de ${group.name}`}
                      title="Gerenciar usuários"
                    >
                      <Users size={16} />
                    </button>
                    <button
                      type="button"
                      className={buttonStyles.icon}
                      onClick={() => handleOpenEdit(group)}
                      aria-label={`Editar ${group.name}`}
                      title="Editar"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      className={buttonStyles.icon}
                      onClick={() => void handleToggleActive(group)}
                      aria-label={`${group.active ? 'Desativar' : 'Ativar'} ${group.name}`}
                      title={group.active ? 'Desativar' : 'Ativar'}
                    >
                      <Power size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>

          <AdminPagination
            currentPage={currentPage}
            totalItems={filteredGroups.length}
            perPage={GROUPS_PER_PAGE}
            itemLabel="grupos"
            onChange={setCurrentPage}
          />
        </section>
      </section>

      <AdminModal
        open={isFormOpen}
        as="form"
        title={editingGroup ? 'Editar grupo de permissão' : 'Novo grupo de permissão'}
        titleId="permission-group-modal-title"
        description="Defina o nome do grupo e os acessos que ele concede."
        onClose={handleCloseForm}
        onSubmit={handleSubmitGroup}
        panelClassName="w-full max-w-[640px] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[22px] border border-[var(--border-neutral)] border-t-[3px] border-t-[var(--accent)] bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-[0_28px_80px_rgba(31,29,25,0.24)]"
        actions={
          <>
            <button type="button" className={buttonStyles.secondary} onClick={handleCloseForm}>
              Cancelar
            </button>
            <button type="submit" className={buttonStyles.primary} disabled={loading}>
              Salvar grupo
            </button>
          </>
        }
      >
        <div className={modalStyles.body}>
          <label className={formStyles.label}>
            <span>Nome do grupo</span>
            <input
              className={formStyles.input}
              type="text"
              placeholder="Ex: Jurídico e Sistemas Internos"
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
            />
          </label>
        </div>

        <fieldset className={modalStyles.body}>
          <legend className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">Departamentos</legend>
          <div className="grid grid-cols-2 gap-3 max-[700px]:grid-cols-1">
            {departments.length === 0 && (
              <span className="text-sm text-[var(--text-secondary)]">Nenhum departamento ativo disponível.</span>
            )}
            {departments.map((department) => (
              <label key={department.departmentId} className={modalStyles.option}>
                <input
                  type="checkbox"
                  checked={selectedDepartmentIds.includes(department.departmentId)}
                  onChange={() =>
                    setSelectedDepartmentIds((current) => toggleNumber(current, department.departmentId))
                  }
                />
                <span className={modalStyles.optionText}>
                  <strong>{department.departmentNm}</strong>
                  {department.acronym}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={modalStyles.body}>
          <legend className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">Sistemas</legend>
          <div className="grid grid-cols-2 gap-3 max-[700px]:grid-cols-1">
            {systems.length === 0 && (
              <span className="text-sm text-[var(--text-secondary)]">Nenhum sistema ativo disponível.</span>
            )}
            {systems.map((system) => (
              <label key={system.systemId} className={modalStyles.option}>
                <input
                  type="checkbox"
                  checked={selectedSystemIds.includes(system.systemId)}
                  onChange={() => setSelectedSystemIds((current) => toggleNumber(current, system.systemId))}
                />
                <span className={modalStyles.optionText}>
                  <strong>{system.systemNm}</strong>
                  {system.acronym}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </AdminModal>

      <AdminModal
        open={managingGroup !== null}
        title={managingGroup ? `Usuários de ${managingGroup.name}` : 'Usuários do grupo'}
        titleId="permission-group-users-modal-title"
        description="Marque usuários para adicionar ou remover do grupo de permissão."
        onClose={handleCloseManageUsers}
        panelClassName={SCROLLABLE_MODAL_PANEL}
        actions={
          <>
            <button type="button" className={buttonStyles.secondary} onClick={handleCloseManageUsers}>
              Cancelar
            </button>
            <button
              type="button"
              className={buttonStyles.primary}
              disabled={loading || isLoadingUsersModal || !hasUserChanges}
              onClick={() => void handleSaveGroupUsers()}
            >
              Salvar alterações
            </button>
          </>
        }
      >
        {isLoadingUsersModal ? (
          <p className={`${modalStyles.body} text-sm text-[var(--text-secondary)]`}>
            Carregando usuários do grupo...
          </p>
        ) : (
          <>
            <fieldset className={modalStyles.body}>
              <legend className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                Membros atuais
              </legend>

              <label className={`${formStyles.label} mb-3`}>
                <span>Buscar membros</span>
                <input
                  className={formStyles.input}
                  type="text"
                  placeholder="Nome ou e-mail"
                  value={memberSearch}
                  onChange={(event) => setMemberSearch(event.target.value)}
                />
              </label>

              <div className="grid grid-cols-1 gap-3">
                {filteredGroupMembers.length === 0 && (
                  <span className="text-sm text-[var(--text-secondary)]">
                    {groupMembers.length === 0
                      ? 'Nenhum usuário vinculado a este grupo.'
                      : 'Nenhum membro encontrado para a busca.'}
                  </span>
                )}

                {filteredGroupMembers.map((member) => (
                  <label key={member.userId} className={modalStyles.option}>
                    <input
                      type="checkbox"
                      checked={selectedToRemove.has(member.userId)}
                      onChange={() =>
                        setSelectedToRemove((current) => toggleSetValue(current, member.userId))
                      }
                    />
                    <span className={modalStyles.optionText}>
                      <strong>{member.name}</strong>
                      {member.email}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className={modalStyles.body}>
              <legend className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                Adicionar usuários
              </legend>

              <label className={`${formStyles.label} mb-3`}>
                <span>Buscar usuários disponíveis</span>
                <input
                  className={formStyles.input}
                  type="text"
                  placeholder="Nome ou e-mail"
                  value={availableSearch}
                  onChange={(event) => setAvailableSearch(event.target.value)}
                />
              </label>

              <div className="grid grid-cols-1 gap-3">
                {filteredAvailableUsers.length === 0 && (
                  <span className="text-sm text-[var(--text-secondary)]">
                    {allUsers.length === groupMembers.length
                      ? 'Todos os usuários ativos já estão neste grupo.'
                      : 'Nenhum usuário disponível encontrado para a busca.'}
                  </span>
                )}

                {filteredAvailableUsers.map((user) => (
                  <label key={user.userId} className={modalStyles.option}>
                    <input
                      type="checkbox"
                      checked={selectedToAdd.has(user.userId)}
                      onChange={() =>
                        setSelectedToAdd((current) => toggleSetValue(current, user.userId))
                      }
                    />
                    <span className={modalStyles.optionText}>
                      <strong>{user.name}</strong>
                      {user.email}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}
      </AdminModal>
    </main>
  );
}
