import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { UsersStats } from './components/UsersStats';
import { UsersTable } from './components/UsersTable';
import type { User, UserRole, UserStatus } from '../../interfaces/user.interface';
import { useFetch } from '../../hooks/useFetch';
import {
  type BackendDepartment,
  type BackendPermissionGroup,
  type BackendPermissionGroupUser,
  type BackendUser,
  type PermissionGroupPaginationResponse,
  type PermissionGroupUsersScrollingResponse,
  mapBackendUser,
  roleToTypeUserId,
} from '../../services/adminApi';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminModal } from '../../components/admin/AdminModal';
import { adminStyles, buttonStyles, formStyles, modalStyles } from '../../utils/tailwindStyles';
import { useInviteUserForm } from '../../hooks/forms/useInviteUserForm';
import type { InviteUserFormData } from '../../hooks/forms/useInviteUserForm';

const USERS_PER_PAGE = 4;
const PERMISSION_GROUPS_PAGE_SIZE = 100;
const EMPTY_DEPARTMENT_LABEL = 'Não informado';
const SCROLLABLE_USER_MODAL_PANEL =
  'w-full max-w-[560px] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[22px] border border-[var(--border-neutral)] border-t-[3px] border-t-[var(--accent)] bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-[0_28px_80px_rgba(31,29,25,0.24)]';

type PermissionGroupAccess = Record<
  number,
  {
    users: BackendPermissionGroupUser[];
    departments: BackendDepartment[];
  }
>;

function formatUserDepartments(userId: number, accessByGroup: PermissionGroupAccess) {
  const departmentNames = new Set<string>();

  Object.values(accessByGroup).forEach(({ users, departments }) => {
    const userBelongsToGroup = users.some((user) => user.userId === userId);

    if (!userBelongsToGroup) {
      return;
    }

    departments.forEach((department) => {
      if (department.active) {
        departmentNames.add(department.departmentNm);
      }
    });
  });

  if (departmentNames.size === 0) {
    return EMPTY_DEPARTMENT_LABEL;
  }

  return Array.from(departmentNames).sort((first, second) => first.localeCompare(second)).join(', ');
}

function toggleNumber(values: number[], nextValue: number) {
  return values.includes(nextValue)
    ? values.filter((value) => value !== nextValue)
    : [...values, nextValue];
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<BackendPermissionGroup[]>([]);
  const [permissionGroupAccess, setPermissionGroupAccess] = useState<PermissionGroupAccess>({});
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [departmentFilter, setDepartmentFilter] = useState('Todos');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Default');
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>('Ativo');
  const [selectedGroupToAdd, setSelectedGroupToAdd] = useState<number | ''>('');
  const [isUpdatingGroups, setIsUpdatingGroups] = useState(false);
  const [invitePermissionGroupIds, setInvitePermissionGroupIds] = useState<number[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const { get, post, patch, del, loading } = useFetch();

  const {
    register: registerInvite,
    handleSubmit: handleInviteSubmit,
    formState: { errors: inviteErrors },
    reset: resetInviteForm,
    watch: watchInvite,
    setValue: setInviteValue,
  } = useInviteUserForm();

  const inviteRole = watchInvite('role');

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

  const fetchPermissionGroupUsers = useCallback(async (permissionGroupId: number) => {
    const groupUsers: BackendPermissionGroupUser[] = [];
    let cursor: number | undefined;

    while (true) {
      const query = cursor ? `?userId=${cursor}` : '';
      const response = await get(
        `/permission-groups/${permissionGroupId}/users/scrolling${query}`,
      ) as PermissionGroupUsersScrollingResponse | null;

      if (!response) {
        break;
      }

      groupUsers.push(...response.data);

      if (response.finish || response.data.length === 0) {
        break;
      }

      cursor = response.data[response.data.length - 1].userId;
    }

    return groupUsers;
  }, [get]);

  const fetchPermissionGroupAccess = useCallback(async (groups: BackendPermissionGroup[]) => {
    const accessEntries = await Promise.all(
      groups.map(async (group) => {
        const [groupUsers, groupDepartments] = await Promise.all([
          fetchPermissionGroupUsers(group.permissionGroupId),
          get(`/permission-groups/${group.permissionGroupId}/departments`) as Promise<BackendDepartment[] | null>,
        ]);

        return [
          group.permissionGroupId,
          {
            users: groupUsers,
            departments: groupDepartments ?? [],
          },
        ] as const;
      }),
    );

    return Object.fromEntries(accessEntries) as PermissionGroupAccess;
  }, [fetchPermissionGroupUsers, get]);

  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    const [usersResponse, permissionGroupRows] = await Promise.all([
      get('/user') as Promise<BackendUser[] | null>,
      fetchAllPermissionGroups(),
    ]);

    const accessByGroup = await fetchPermissionGroupAccess(permissionGroupRows);

    setPermissionGroups(permissionGroupRows);
    setPermissionGroupAccess(accessByGroup);

    if (usersResponse) {
      const mappedUsers = usersResponse.map((user) => ({
        ...mapBackendUser(user),
        department: formatUserDepartments(user.userId, accessByGroup),
      }));

      setUsers(mappedUsers);
      setEditingUser((current) => {
        if (!current) {
          return null;
        }

        return mappedUsers.find((user) => user.id === current.id) ?? current;
      });
    }

    setIsLoadingUsers(false);
  }, [fetchAllPermissionGroups, fetchPermissionGroupAccess, get]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadUsers();
    });
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === 'Todos' || user.role === roleFilter;

      const matchesDepartment =
        departmentFilter === 'Todos' || user.department === departmentFilter;

      return matchesSearch && matchesRole && matchesDepartment;
    });
  }, [users, search, roleFilter, departmentFilter]);

  const totalUsers = users.length;
  const totalAdmins = users.filter((user) => user.role === 'Admin').length;
  const totalDefault = users.filter((user) => user.role === 'Default').length;
  const activeUsers = users.filter((user) => user.status === 'Ativo').length;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const pageStart = (currentPage - 1) * USERS_PER_PAGE;
  const pageEnd = pageStart + USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(pageStart, pageEnd);
  const departmentFilters = ['Todos', ...new Set(users.map((user) => user.department))];
  const activePermissionGroups = permissionGroups.filter((group) => group.active);

  const getUserPermissionGroups = useCallback(
    (userId: number) =>
      permissionGroups.filter(
        (group) =>
          group.active &&
          permissionGroupAccess[group.permissionGroupId]?.users.some(
            (user) => user.userId === userId,
          ),
      ),
    [permissionGroupAccess, permissionGroups],
  );

  const editingUserPermissionGroups = useMemo(
    () => (editingUser ? getUserPermissionGroups(editingUser.id) : []),
    [editingUser, getUserPermissionGroups],
  );

  const availableGroupsToAdd = useMemo(() => {
    if (!editingUser) {
      return [];
    }

    const linkedGroupIds = new Set(
      editingUserPermissionGroups.map((group) => group.permissionGroupId),
    );

    return activePermissionGroups.filter(
      (group) => !linkedGroupIds.has(group.permissionGroupId),
    );
  }, [activePermissionGroups, editingUser, editingUserPermissionGroups]);

  useEffect(() => {
    queueMicrotask(() => setCurrentPage(1));
  }, [search, roleFilter, departmentFilter]);

  useEffect(() => {
    queueMicrotask(() => setCurrentPage((page) => Math.min(page, totalPages)));
  }, [totalPages]);

  function handleOpenRoleModal(user: User) {
    setEditingUser(user);
    setSelectedRole(user.role);
    setSelectedStatus(user.status);
    setSelectedGroupToAdd('');
  }

  function handleCloseRoleModal() {
    setEditingUser(null);
    setSelectedGroupToAdd('');
  }

  async function handleAddPermissionGroup() {
    if (!editingUser || selectedGroupToAdd === '') {
      return;
    }

    const userAlreadyInGroup = permissionGroupAccess[selectedGroupToAdd]?.users.some(
      (user) => user.userId === editingUser.id,
    );

    if (userAlreadyInGroup) {
      toast.success('Usuário já está vinculado a este grupo de permissão.');
      return;
    }

    setIsUpdatingGroups(true);

    const response = await post('/permission-groups/users', {
      body: {
        permissionGroupId: selectedGroupToAdd,
        userId: editingUser.id,
      },
    });

    if (response) {
      toast.success('Grupo de permissão adicionado ao usuário.');
      setSelectedGroupToAdd('');
      await loadUsers();
    }

    setIsUpdatingGroups(false);
  }

  async function handleRemovePermissionGroup(permissionGroupId: number) {
    if (!editingUser) {
      return;
    }

    setIsUpdatingGroups(true);

    const response = await del(
      `/permission-groups/${permissionGroupId}/users/${editingUser.id}`,
      {
        successAlert: {
          title: 'Grupo removido',
          message: 'O usuário foi desvinculado do grupo de permissão.',
        },
      },
    );

    if (response) {
      await loadUsers();
    }

    setIsUpdatingGroups(false);
  }

  async function handleSaveRole() {
    if (!editingUser) {
      return;
    }

    if (selectedStatus === 'Bloqueado') {
      const response = await del(`/user/${editingUser.id}`, {
        successAlert: {
          title: 'Usuário bloqueado',
          message: 'O usuário foi desativado no backend.',
        },
      });

      if (response) {
        setUsers((currentUsers) =>
          currentUsers.filter((user) => user.id !== editingUser.id)
        );
      }

      handleCloseRoleModal();
      return;
    }

    const response = await patch('/user', {
      body: {
        userId: editingUser.id,
        name: editingUser.name,
        email: editingUser.email,
        typeUserId: roleToTypeUserId(selectedRole),
      },
      successAlert: {
        title: 'Usuário atualizado',
        message: 'O papel do usuário foi salvo no backend.',
      },
    }) as BackendUser | null;

    if (response) {
      setUsers((currentUsers) =>
        currentUsers.map((user) => {
          if (user.id !== editingUser.id) {
            return user;
          }

          return {
            ...mapBackendUser(response),
            department: user.department,
          };
        })
      );
    }

    handleCloseRoleModal();
  }

  function handleCloseInviteModal() {
    setIsInviteModalOpen(false);
    setInvitePermissionGroupIds([]);
    resetInviteForm();
  }

  async function handleInviteUser(data: InviteUserFormData) {
    const response = await post('/user', {
      body: {
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        typeUserId: roleToTypeUserId(data.role),
      },
      successAlert: {
        title: 'Usuário criado',
        message: 'O usuário foi cadastrado com sucesso.',
      },
    }) as BackendUser | null;

    if (!response) {
      return;
    }

    if (invitePermissionGroupIds.length > 0) {
      const linkResults = await Promise.all(
        invitePermissionGroupIds.map((permissionGroupId) =>
          post('/permission-groups/users', {
            body: {
              permissionGroupId,
              userId: response.userId,
            },
          }),
        ),
      );

      const linkedCount = linkResults.filter(Boolean).length;

      if (linkedCount > 0) {
        toast.success(
          linkedCount === 1
            ? 'Usuário vinculado ao grupo de permissão.'
            : `Usuário vinculado a ${linkedCount} grupos de permissão.`,
        );
      }
    }

    await loadUsers();
    handleCloseInviteModal();
  }

  return (
    <main className={adminStyles.page}>
      <section className={adminStyles.content}>
        <header className={adminStyles.header}>
          <div>
            <h1 className={adminStyles.title}>Gerenciamento de Usuários</h1>
          </div>

          <div className={adminStyles.headerActions}>
            <button
              type="button"
              className={buttonStyles.primary}
              onClick={() => setIsInviteModalOpen(true)}
            >
              Novo usuário
            </button>
          </div>
        </header>

        <UsersStats
          totalUsers={totalUsers}
          totalAdmins={totalAdmins}
          totalDefault={totalDefault}
          activeUsers={activeUsers}
        />

        <section className={adminStyles.section}>
          <div className={adminStyles.sectionHeader}>
            <h2 className={adminStyles.sectionTitle}>Usuários</h2>

            <div className={adminStyles.filtersRow}>
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${formStyles.input} ${adminStyles.filterInput}`}
              />

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={formStyles.select}
              >
                <option value="Todos">Papel: Todos</option>
                <option value="Admin">Admin</option>
                <option value="Default">Default</option>
              </select>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className={formStyles.select}
              >
                {departmentFilters.map((department) => (
                  <option key={department} value={department}>
                    {department === 'Todos' ? 'Departamento' : department}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoadingUsers ? (
            <div className={adminStyles.tableWrapper}>
              <div className={adminStyles.emptyCell}>Carregando usuários...</div>
            </div>
          ) : (
            <UsersTable users={paginatedUsers} onEditRole={handleOpenRoleModal} />
          )}

          <AdminPagination
            currentPage={currentPage}
            totalItems={filteredUsers.length}
            perPage={USERS_PER_PAGE}
            itemLabel="usuários"
            onChange={setCurrentPage}
            ariaLabel="Paginação de usuários"
          />
        </section>
      </section>

      <AdminModal
        open={Boolean(editingUser)}
        title="Editar usuário"
        titleId="role-modal-title"
        description={editingUser?.name}
        onClose={handleCloseRoleModal}
        panelClassName={SCROLLABLE_USER_MODAL_PANEL}
        actions={
          <>
            <button
              type="button"
              className={buttonStyles.secondary}
              onClick={handleCloseRoleModal}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={buttonStyles.primary}
              onClick={handleSaveRole}
              disabled={loading}
            >
              {selectedStatus === 'Bloqueado' ? 'Bloquear usuário' : 'Salvar alteração'}
            </button>
          </>
        }
      >
        {editingUser && (
          <>
            <div className="mx-6 mt-5 flex flex-col gap-1 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-body)] p-4 text-sm text-[var(--text-secondary)]">
              <span>{editingUser.email}</span>
              <strong className="text-[var(--text-primary)]">
                {editingUserPermissionGroups.length > 0
                  ? editingUserPermissionGroups.map((group) => group.permissionGroupNm).join(', ')
                  : 'Nenhum grupo de permissão vinculado'}
              </strong>
            </div>

            <fieldset className={modalStyles.body}>
              <legend className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">Grupos de permissão</legend>

              <div className="flex flex-wrap gap-2 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-body)] p-4">
                {editingUserPermissionGroups.length === 0 ? (
                  <span className="text-sm text-[var(--text-secondary)]">Nenhum grupo vinculado</span>
                ) : (
                  editingUserPermissionGroups.map((group) => (
                    <span
                      key={group.permissionGroupId}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)] px-3 py-1 text-sm text-[var(--text-primary)]"
                    >
                      {group.permissionGroupNm}
                      <button
                        type="button"
                        className="text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] disabled:opacity-50"
                        onClick={() => handleRemovePermissionGroup(group.permissionGroupId)}
                        disabled={isUpdatingGroups || loading}
                        aria-label={`Remover ${group.permissionGroupNm}`}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>

              <div className={adminStyles.formGrid}>
                <label className={formStyles.label}>
                  <span>Adicionar grupo</span>
                  <select
                    className={formStyles.select}
                    value={selectedGroupToAdd}
                    disabled={availableGroupsToAdd.length === 0 || isUpdatingGroups}
                    onChange={(event) =>
                      setSelectedGroupToAdd(event.target.value ? Number(event.target.value) : '')
                    }
                  >
                    <option value="">
                      {availableGroupsToAdd.length === 0
                        ? 'Nenhum grupo disponível'
                        : 'Selecione um grupo'}
                    </option>
                    {availableGroupsToAdd.map((group) => (
                      <option key={group.permissionGroupId} value={group.permissionGroupId}>
                        {group.permissionGroupNm}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-body)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
                O usuário pode pertencer a mais de um grupo de permissão. Cada alteração é salva imediatamente.
              </div>

              <button
                type="button"
                className={buttonStyles.secondary}
                onClick={handleAddPermissionGroup}
                disabled={
                  loading ||
                  isUpdatingGroups ||
                  selectedGroupToAdd === ''
                }
              >
                {isUpdatingGroups ? 'Atualizando...' : 'Adicionar grupo'}
              </button>
            </fieldset>

            <fieldset className={modalStyles.body}>
              <legend className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">Novo papel</legend>

              <label className={modalStyles.option}>
                <input
                  type="radio"
                  name="user-role"
                  value="Admin"
                  checked={selectedRole === 'Admin'}
                  onChange={() => setSelectedRole('Admin')}
                />
                <span className={modalStyles.optionText}>
                  <strong>Admin</strong>
                  Acesso ao chat e páginas de gerenciamento.
                </span>
              </label>

              <label className={modalStyles.option}>
                <input
                  type="radio"
                  name="user-role"
                  value="Default"
                  checked={selectedRole === 'Default'}
                  onChange={() => setSelectedRole('Default')}
                />
                <span className={modalStyles.optionText}>
                  <strong>Default</strong>
                  Acesso apenas ao chat e fontes disponíveis.
                </span>
              </label>
            </fieldset>

            <fieldset className={modalStyles.body}>
              <legend className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">Status do usuário</legend>

              <label className={modalStyles.option}>
                <input
                  type="radio"
                  name="user-status"
                  value="Ativo"
                  checked={selectedStatus === 'Ativo'}
                  onChange={() => setSelectedStatus('Ativo')}
                />
                <span className={modalStyles.optionText}>
                  <strong>Ativo</strong>
                  Usuário liberado para acessar a plataforma.
                </span>
              </label>

              <label className={modalStyles.option}>
                <input
                  type="radio"
                  name="user-status"
                  value="Bloqueado"
                  checked={selectedStatus === 'Bloqueado'}
                  onChange={() => setSelectedStatus('Bloqueado')}
                />
                <span className={modalStyles.optionText}>
                  <strong>Bloqueado</strong>
                  Usuário sem acesso até nova alteração.
                </span>
              </label>
            </fieldset>
          </>
        )}
      </AdminModal>

      <AdminModal
        open={isInviteModalOpen}
        as="form"
        title="Novo usuário"
        titleId="invite-modal-title"
        description="Cadastre uma pessoa diretamente no backend."
        onClose={handleCloseInviteModal}
        onSubmit={handleInviteSubmit(handleInviteUser)}
        actions={
          <>
            <button
              type="button"
              className={buttonStyles.secondary}
              onClick={handleCloseInviteModal}
            >
              Cancelar
            </button>
            <button type="submit" className={buttonStyles.primary} disabled={loading}>
              Criar usuário
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
              placeholder="Ex: Beatriz Almeida"
              {...registerInvite('name')}
            />
            {inviteErrors.name && <p className={formStyles.error}>{inviteErrors.name.message}</p>}
          </label>

          <label className={formStyles.label}>
            <span>E-mail</span>
            <input
              className={formStyles.input}
              type="email"
              placeholder="nome@empresa.com"
              {...registerInvite('email')}
            />
            {inviteErrors.email && <p className={formStyles.error}>{inviteErrors.email.message}</p>}
          </label>

          <label className={formStyles.label}>
            <span>Senha inicial</span>
            <input
              className={formStyles.input}
              type="password"
              placeholder="Mínimo 6 caracteres"
              {...registerInvite('password')}
            />
            {inviteErrors.password && <p className={formStyles.error}>{inviteErrors.password.message}</p>}
          </label>
        </div>

        <fieldset className={modalStyles.body}>
          <legend className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">Grupos de permissão</legend>

          <div className={`${adminStyles.deleteBody} mx-0`}>
            {activePermissionGroups.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">Nenhum grupo de permissão ativo disponível.</p>
            ) : (
              activePermissionGroups.map((group) => (
                <label key={group.permissionGroupId} className={modalStyles.option}>
                  <input
                    type="checkbox"
                    checked={invitePermissionGroupIds.includes(group.permissionGroupId)}
                    onChange={() =>
                      setInvitePermissionGroupIds((current) =>
                        toggleNumber(current, group.permissionGroupId),
                      )
                    }
                  />
                  <span>{group.permissionGroupNm}</span>
                </label>
              ))
            )}
          </div>

          <div className="rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-body)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
            Selecione um ou mais grupos. O usuário será criado e depois adicionado a cada grupo escolhido.
          </div>
        </fieldset>

        <fieldset className={modalStyles.body}>
          <legend className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">Papel inicial</legend>

          <label className={modalStyles.option}>
            <input
              type="radio"
              value="Admin"
              checked={inviteRole === 'Admin'}
              onChange={() => setInviteValue('role', 'Admin')}
            />
            <span className={modalStyles.optionText}>
              <strong>Admin</strong>
              Acesso ao chat e páginas de gerenciamento.
            </span>
          </label>

          <label className={modalStyles.option}>
            <input
              type="radio"
              value="Default"
              checked={inviteRole === 'Default'}
              onChange={() => setInviteValue('role', 'Default')}
            />
            <span className={modalStyles.optionText}>
              <strong>Default</strong>
              Acesso apenas ao chat e fontes disponíveis.
            </span>
          </label>
        </fieldset>
      </AdminModal>
    </main>
  );
}
