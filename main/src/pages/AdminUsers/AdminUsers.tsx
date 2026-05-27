import { useCallback, useEffect, useMemo, useState } from 'react';
import { UsersStats } from './components/UsersStats';
import { UsersTable } from './components/UsersTable';
import type { User, UserRole, UserStatus } from '../../types/user';
import { useFetch } from '../../hooks/useFetch';
import {
  type BackendUser,
  mapBackendUser,
  roleToTypeUserId,
} from '../../services/adminApi';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminModal } from '../../components/admin/AdminModal';
import { adminStyles, buttonStyles, formStyles, modalStyles } from '../../utils/tailwindStyles';

const USERS_PER_PAGE = 4;

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [departmentFilter, setDepartmentFilter] = useState('Todos');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Default');
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>('Ativo');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Default');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const { get, post, patch, del, loading } = useFetch();

  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    const response = await get('/user') as BackendUser[] | null;

    if (response) {
      setUsers(response.map(mapBackendUser));
    }

    setIsLoadingUsers(false);
  }, [get]);

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
  const departments = ['Todos', ...new Set(users.map((user) => user.department))];

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
  }

  function handleCloseRoleModal() {
    setEditingUser(null);
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
        currentUsers.map((user) =>
          user.id === editingUser.id ? mapBackendUser(response) : user
        )
      );
    }

    handleCloseRoleModal();
  }

  function handleCloseInviteModal() {
    setIsInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
    setInvitePassword('');
    setInviteRole('Default');
  }

  async function handleInviteUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await post('/user', {
      body: {
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        password: invitePassword,
        typeUserId: roleToTypeUserId(inviteRole),
      },
      successAlert: {
        title: 'Usuário criado',
        message: 'O usuário foi cadastrado com sucesso.',
      },
    }) as BackendUser | null;

    if (response) {
      setUsers((currentUsers) => [mapBackendUser(response), ...currentUsers]);
      handleCloseInviteModal();
    }
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
                {departments.map((department) => (
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
        title="Editar papel"
        titleId="role-modal-title"
        description={editingUser?.name}
        onClose={handleCloseRoleModal}
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
              <strong className="text-[var(--text-primary)]">{editingUser.department}</strong>
            </div>

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
        onSubmit={handleInviteUser}
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
              value={inviteName}
              onChange={(event) => setInviteName(event.target.value)}
              placeholder="Ex: Beatriz Almeida"
              required
            />
          </label>

          <label className={formStyles.label}>
            <span>E-mail</span>
            <input
              className={formStyles.input}
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="nome@empresa.com"
              required
            />
          </label>

          <label className={formStyles.label}>
            <span>Senha inicial</span>
            <input
              className={formStyles.input}
              type="password"
              value={invitePassword}
              onChange={(event) => setInvitePassword(event.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              maxLength={32}
              required
            />
          </label>
        </div>

        <fieldset className={modalStyles.body}>
          <legend className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">Papel inicial</legend>

              <label className={modalStyles.option}>
                <input
                  type="radio"
                  name="invite-role"
                  value="Admin"
                  checked={inviteRole === 'Admin'}
                  onChange={() => setInviteRole('Admin')}
                />
                <span className={modalStyles.optionText}>
                  <strong>Admin</strong>
                  Acesso ao chat e páginas de gerenciamento.
                </span>
              </label>

              <label className={modalStyles.option}>
                <input
                  type="radio"
                  name="invite-role"
                  value="Default"
                  checked={inviteRole === 'Default'}
                  onChange={() => setInviteRole('Default')}
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
