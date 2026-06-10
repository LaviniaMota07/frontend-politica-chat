import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Coins,
  Database,
  Edit3,
  Plus,
  Search,
  Trash2,
  Zap,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import {
  type AiKeyItem,
  type BackendModelIa,
  type BackendModelIaKey,
  mapBackendModelKey,
} from '../../services/adminApi';
import { AdminStatsGrid } from '../../components/admin/AdminStatsGrid';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminModal } from '../../components/admin/AdminModal';
import { adminStyles, buttonStyles, formStyles, modalStyles } from '../../utils/tailwindStyles';
import { useModelForm } from '../../hooks/forms/useModelForm';
import { useCreateKeyForm, useUpdateKeyForm } from '../../hooks/forms/useKeyForm';
import type { CreateModelFormData, CreateKeyFormData, UpdateKeyFormData } from '../../validation/admin.schema';

const TOKENS_PER_PAGE = 4;

function formatTokens(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export default function AdminTokens() {
  const { get, post, patch, del, loading } = useFetch();
  const [models, setModels] = useState<BackendModelIa[]>([]);
  const [keys, setKeys] = useState<AiKeyItem[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<AiKeyItem | null>(null);

  const modelForm = useModelForm();
  const {
    register: registerModel,
    handleSubmit: handleModelSubmit,
    formState: { errors: modelErrors },
    reset: resetModelForm,
  } = modelForm;

  const [defaultModelId, setDefaultModelId] = useState('');
  const keyForm = useCreateKeyForm(defaultModelId);
  const {
    register: registerKey,
    handleSubmit: handleKeySubmit,
    formState: { errors: keyErrors },
    reset: resetKeyForm,
    setValue: setKeyValue,
  } = keyForm;

  const updateKeyForm = useUpdateKeyForm();
  const {
    register: registerUpdateKey,
    handleSubmit: handleUpdateKeySubmit,
    formState: { errors: updateKeyErrors },
    reset: resetUpdateKeyForm,
  } = updateKeyForm;

  const loadTokens = useCallback(async () => {
    setIsLoading(true);
    const modelRows = await get('/model-ia') as BackendModelIa[] | null;

    if (!modelRows) {
      setIsLoading(false);
      return;
    }

    const keyGroups = await Promise.all(
      modelRows.map(async (model) => {
        const modelKeys = await get(`/model-ia-key/${model.modelIaId}`) as BackendModelIaKey[] | null;
        return (modelKeys ?? []).map((key) => mapBackendModelKey(key, model.modelNm));
      }),
    );

    setModels(modelRows);
    setKeys(keyGroups.flat());

    const firstId = modelRows[0]?.modelIaId.toString() ?? '';
    setDefaultModelId((current) => current || firstId);
    setKeyValue('modelIaId', firstId);
    setIsLoading(false);
  }, [get, setKeyValue]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadTokens();
    });
  }, [loadTokens]);

  const totalConfiguredTokens = useMemo(
    () => keys.reduce((total, key) => total + key.qtnToken, 0),
    [keys],
  );
  const activeKeys = keys.filter((key) => key.active).length;
  const averageTokensPerKey = activeKeys > 0 ? Math.round(totalConfiguredTokens / activeKeys) : 0;

  const filteredKeys = useMemo(() => {
    const searchValue = search.toLowerCase();

    return keys.filter((key) => key.modelName.toLowerCase().includes(searchValue));
  }, [keys, search]);

  const totalPages = Math.max(1, Math.ceil(filteredKeys.length / TOKENS_PER_PAGE));
  const pageStart = (currentPage - 1) * TOKENS_PER_PAGE;
  const pageEnd = pageStart + TOKENS_PER_PAGE;
  const paginatedKeys = filteredKeys.slice(pageStart, pageEnd);

  useEffect(() => {
    queueMicrotask(() => setCurrentPage(1));
  }, [search]);

  useEffect(() => {
    queueMicrotask(() => setCurrentPage((page) => Math.min(page, totalPages)));
  }, [totalPages]);

  function closeModelModal() {
    setIsModelModalOpen(false);
    resetModelForm();
  }

  function closeKeyModal() {
    setIsKeyModalOpen(false);
    resetKeyForm();
  }

  function closeEditKeyModal() {
    setEditingKey(null);
    resetUpdateKeyForm();
  }

  async function handleCreateModel(data: CreateModelFormData) {
    const response = await post('/model-ia', {
      body: { modelNm: data.modelNm.trim() },
      successAlert: {
        title: 'Modelo criado',
        message: 'O modelo de IA foi cadastrado no backend.',
      },
    }) as BackendModelIa | null;

    if (response) {
      closeModelModal();
      await loadTokens();
    }
  }

  async function handleCreateKey(data: CreateKeyFormData) {
    const response = await post('/model-ia-key', {
      body: {
        modelIaId: Number(data.modelIaId),
        qtnToken: Number(data.qtnToken),
      },
      successAlert: {
        title: 'Chave criada',
        message: 'A chave de IA foi gerada pelo backend.',
      },
    }) as BackendModelIaKey | null;

    if (response) {
      closeKeyModal();
      await loadTokens();
    }
  }

  async function handleUpdateKey(data: UpdateKeyFormData) {
    if (!editingKey) {
      return;
    }

    const response = await patch('/model-ia-key', {
      body: {
        modelIaId: editingKey.modelIaId,
        modelKey: editingKey.modelKey,
        qtnToken: Number(data.qtnToken),
        active: true,
      },
      successAlert: {
        title: 'Chave atualizada',
        message: 'A franquia de tokens foi salva no backend.',
      },
    }) as BackendModelIaKey | null;

    if (response) {
      closeEditKeyModal();
      await loadTokens();
    }
  }

  async function handleDeleteKey(key: AiKeyItem) {
    const response = await del(`/model-ia-key/${key.modelIaId}/${key.modelKey}`, {
      successAlert: {
        title: 'Chave desativada',
        message: 'A chave não aparecerá mais na lista ativa.',
      },
    });

    if (response) {
      await loadTokens();
    }
  }

  async function handleDeleteModel(model: BackendModelIa) {
    const response = await del(`/model-ia/${model.modelIaId}`, {
      successAlert: {
        title: 'Modelo desativado',
        message: 'O modelo não aparecerá mais na lista ativa.',
      },
    });

    if (response) {
      await loadTokens();
    }
  }

  return (
    <main className={adminStyles.page}>
      <section className={adminStyles.content}>
        <header className={adminStyles.header}>
          <div>
            <h1 className={adminStyles.title}>Gerenciamento de Tokens</h1>
            <p className={adminStyles.subtitle}>Administre modelos de IA e chaves geradas pelo backend.</p>
          </div>

          <div className={adminStyles.headerActions}>
            <button type="button" className={buttonStyles.secondary} onClick={() => setIsModelModalOpen(true)}>
              <Plus size={16} /> Novo modelo
            </button>
            <button
              type="button"
              className={buttonStyles.primary}
              onClick={() => setIsKeyModalOpen(true)}
              disabled={models.length === 0}
            >
              <Plus size={16} /> Nova chave
            </button>
          </div>
        </header>

        <AdminStatsGrid
          className="grid grid-cols-3 gap-4 max-[1000px]:grid-cols-1"
          cards={[
            {
              label: 'Modelos Ativos',
              value: models.length,
              description: <span className="mt-2 block text-xs text-[var(--text-muted)]">Modelos retornados por /model-ia</span>,
              icon: <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border-neutral)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"><Database size={17} /></span>,
            },
            {
              label: 'Tokens Configurados',
              value: formatTokens(totalConfiguredTokens),
              description: <span className="mt-2 inline-flex items-center gap-1 text-xs text-amber-700"><Zap size={13} /> Soma de qtnToken das chaves ativas</span>,
              icon: <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700"><Zap size={17} /></span>,
            },
            {
              label: 'Chaves Ativas',
              value: activeKeys,
              description: <span className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-700"><Coins size={13} /> Média: {formatTokens(averageTokensPerKey)} tokens</span>,
              icon: <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700"><Coins size={17} /></span>,
            },
          ]}
        />

        <section className={adminStyles.section}>
          <div className={adminStyles.sectionHeader}>
            <h2 className={adminStyles.sectionTitle}>Modelos cadastrados</h2>
          </div>

          <AdminTable
            columns={['Modelo', 'ID', 'Status', 'Ações']}
            isLoading={isLoading}
            loadingMessage="Carregando modelos..."
            isEmpty={models.length === 0}
            emptyMessage="Nenhum modelo cadastrado."
          >
            {models.map((model) => (
              <tr key={model.modelIaId}>
                <td className={adminStyles.td}><strong className={adminStyles.userName}>{model.modelNm}</strong></td>
                <td className={adminStyles.td}>{model.modelIaId}</td>
                <td className={adminStyles.td}><span className={adminStyles.badgeActive}>Ativo</span></td>
                <td className={adminStyles.td}>
                  <button type="button" className={buttonStyles.iconDanger} onClick={() => void handleDeleteModel(model)} title="Desativar modelo">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </AdminTable>
        </section>

        <section className={adminStyles.section}>
          <div className={adminStyles.sectionHeader}>
            <h2 className={adminStyles.sectionTitle}>Chaves por modelo</h2>

            <div>
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={17} />
                <input
                  className={`${formStyles.input} min-w-[260px] pl-10`}
                  type="text"
                  placeholder="Buscar por modelo..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
            </div>
          </div>

          <AdminTable
            columns={['IA', 'Tokens da chave', 'Ações']}
            isLoading={isLoading}
            loadingMessage="Carregando chaves..."
            isEmpty={filteredKeys.length === 0}
            emptyMessage="Nenhuma chave encontrada."
          >
            {paginatedKeys.map((key) => (
              <tr key={key.id}>
                <td className={adminStyles.td}>
                  <div className={adminStyles.userCell}>
                    <strong className={adminStyles.userName}>{key.modelName}</strong>
                    <span className={adminStyles.userEmail}>Modelo #{key.modelIaId}</span>
                  </div>
                </td>
                <td className={adminStyles.td}><strong className="font-bold text-amber-700">{formatTokens(key.qtnToken)}</strong></td>
                <td className={adminStyles.td}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={buttonStyles.icon}
                      onClick={() => {
                        setEditingKey(key);
                        resetUpdateKeyForm({ qtnToken: String(key.qtnToken) });
                      }}
                      title="Editar tokens"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button type="button" className={buttonStyles.iconDanger} onClick={() => void handleDeleteKey(key)} title="Desativar chave">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>

          {!isLoading && (
            <AdminPagination
              currentPage={currentPage}
              totalItems={filteredKeys.length}
              perPage={TOKENS_PER_PAGE}
              itemLabel="chaves"
              onChange={setCurrentPage}
              ariaLabel="Paginação de tokens"
            />
          )}
        </section>
      </section>

      <AdminModal
        open={isModelModalOpen}
        as="form"
        title="Novo modelo de IA"
        titleId="model-modal-title"
        description="Cadastre o nome do modelo usado pelo backend."
        onClose={closeModelModal}
        onSubmit={handleModelSubmit(handleCreateModel)}
        actions={
          <>
            <button type="button" className={buttonStyles.secondary} onClick={closeModelModal}>Cancelar</button>
            <button type="submit" className={buttonStyles.primary} disabled={loading}>Salvar</button>
          </>
        }
      >
        <div className={`${modalStyles.body} ${adminStyles.formGrid}`}>
          <label className={formStyles.label}>
            <span>Nome do modelo</span>
            <input
              className={formStyles.input}
              {...registerModel('modelNm')}
            />
            {modelErrors.modelNm && <p className={formStyles.error}>{modelErrors.modelNm.message}</p>}
          </label>
        </div>
      </AdminModal>

      <AdminModal
        open={isKeyModalOpen}
        as="form"
        title="Nova chave de IA"
        titleId="key-modal-title"
        description="O backend gera a chave e armazena a quantidade de tokens."
        onClose={closeKeyModal}
        onSubmit={handleKeySubmit(handleCreateKey)}
        actions={
          <>
            <button type="button" className={buttonStyles.secondary} onClick={closeKeyModal}>Cancelar</button>
            <button type="submit" className={buttonStyles.primary} disabled={loading}>Salvar</button>
          </>
        }
      >
        <div className={`${modalStyles.body} ${adminStyles.formGrid}`}>
          <label className={formStyles.label}>
            <span>Modelo</span>
            <select className={formStyles.select} {...registerKey('modelIaId')}>
              {models.map((model) => (
                <option key={model.modelIaId} value={model.modelIaId}>{model.modelNm}</option>
              ))}
            </select>
            {keyErrors.modelIaId && <p className={formStyles.error}>{keyErrors.modelIaId.message}</p>}
          </label>
          <label className={formStyles.label}>
            <span>Quantidade de tokens</span>
            <input
              className={formStyles.input}
              type="number"
              min={1}
              {...registerKey('qtnToken')}
            />
            {keyErrors.qtnToken && <p className={formStyles.error}>{keyErrors.qtnToken.message}</p>}
          </label>
        </div>
      </AdminModal>

      <AdminModal
        open={Boolean(editingKey)}
        as="form"
        title="Editar tokens da chave"
        titleId="edit-key-modal-title"
        description={editingKey ? editingKey.modelName : undefined}
        onClose={closeEditKeyModal}
        onSubmit={handleUpdateKeySubmit(handleUpdateKey)}
        actions={
          <>
            <button type="button" className={buttonStyles.secondary} onClick={closeEditKeyModal}>Cancelar</button>
            <button type="submit" className={buttonStyles.primary} disabled={loading}>Salvar</button>
          </>
        }
      >
        <div className={`${modalStyles.body} ${adminStyles.formGrid}`}>
          <label className={formStyles.label}>
            <span>Quantidade de tokens</span>
            <input
              className={formStyles.input}
              type="number"
              min={1}
              {...registerUpdateKey('qtnToken')}
            />
            {updateKeyErrors.qtnToken && <p className={formStyles.error}>{updateKeyErrors.qtnToken.message}</p>}
          </label>
        </div>
      </AdminModal>
    </main>
  );
}
