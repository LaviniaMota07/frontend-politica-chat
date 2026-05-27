import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
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
  previewModelKey,
} from '../../services/adminApi';
import { AdminStatsGrid } from '../../components/admin/AdminStatsGrid';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminModal } from '../../components/admin/AdminModal';
import { adminStyles, buttonStyles, formStyles, modalStyles } from '../../utils/tailwindStyles';

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
  const [modelName, setModelName] = useState('');

  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');

  const [editingKey, setEditingKey] = useState<AiKeyItem | null>(null);
  const [editingTokenAmount, setEditingTokenAmount] = useState('');

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
    setSelectedModelId((current) => current || modelRows[0]?.modelIaId.toString() || '');
    setIsLoading(false);
  }, [get]);

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

    return keys.filter((key) =>
      key.modelName.toLowerCase().includes(searchValue) ||
      key.modelKey.toLowerCase().includes(searchValue),
    );
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
    setModelName('');
  }

  function closeKeyModal() {
    setIsKeyModalOpen(false);
    setTokenAmount('');
    setSelectedModelId(models[0]?.modelIaId.toString() || '');
  }

  function closeEditKeyModal() {
    setEditingKey(null);
    setEditingTokenAmount('');
  }

  async function handleCreateModel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await post('/model-ia', {
      body: { modelNm: modelName.trim() },
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

  async function handleCreateKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await post('/model-ia-key', {
      body: {
        modelIaId: Number(selectedModelId),
        qtnToken: Number(tokenAmount),
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

  async function handleUpdateKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingKey) {
      return;
    }

    const response = await patch('/model-ia-key', {
      body: {
        modelIaId: editingKey.modelIaId,
        modelKey: editingKey.modelKey,
        qtnToken: Number(editingTokenAmount),
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
              description: <span className="mt-2 block text-xs text-slate-500">Modelos retornados por /model-ia</span>,
              icon: <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200"><Database size={17} /></span>,
            },
            {
              label: 'Tokens Configurados',
              value: formatTokens(totalConfiguredTokens),
              description: <span className="mt-2 inline-flex items-center gap-1 text-xs text-amber-200"><Zap size={13} /> Soma de qtnToken das chaves ativas</span>,
              icon: <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-200"><Zap size={17} /></span>,
            },
            {
              label: 'Chaves Ativas',
              value: activeKeys,
              description: <span className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-200"><Coins size={13} /> Média: {formatTokens(averageTokensPerKey)} tokens</span>,
              icon: <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200"><Coins size={17} /></span>,
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
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  className={`${formStyles.input} min-w-[260px] pl-10`}
                  type="text"
                  placeholder="Buscar por modelo ou chave..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
            </div>
          </div>

          <AdminTable
            columns={['IA', 'Chave gerada', 'Tokens da chave', 'Ações']}
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
                <td className={adminStyles.td}>
                  <div className={adminStyles.userCell}>
                    <strong className={adminStyles.userName}>{previewModelKey(key.modelKey)}</strong>
                    <span className={adminStyles.userEmail}>Chave UUID gerada pelo backend</span>
                  </div>
                </td>
                <td className={adminStyles.td}><strong className="font-black text-amber-200">{formatTokens(key.qtnToken)}</strong></td>
                <td className={adminStyles.td}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={buttonStyles.icon}
                      onClick={() => {
                        setEditingKey(key);
                        setEditingTokenAmount(String(key.qtnToken));
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
        onSubmit={handleCreateModel}
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
            <input className={formStyles.input} value={modelName} onChange={(event) => setModelName(event.target.value)} minLength={2} maxLength={100} required />
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
        onSubmit={handleCreateKey}
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
            <select className={formStyles.select} value={selectedModelId} onChange={(event) => setSelectedModelId(event.target.value)} required>
              {models.map((model) => (
                <option key={model.modelIaId} value={model.modelIaId}>{model.modelNm}</option>
              ))}
            </select>
          </label>
          <label className={formStyles.label}>
            <span>Quantidade de tokens</span>
            <input className={formStyles.input} type="number" value={tokenAmount} onChange={(event) => setTokenAmount(event.target.value)} min={1} required />
          </label>
        </div>
      </AdminModal>

      <AdminModal
        open={Boolean(editingKey)}
        as="form"
        title="Editar tokens da chave"
        titleId="edit-key-modal-title"
        description={editingKey ? `${editingKey.modelName} - ${previewModelKey(editingKey.modelKey)}` : undefined}
        onClose={closeEditKeyModal}
        onSubmit={handleUpdateKey}
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
            <input className={formStyles.input} type="number" value={editingTokenAmount} onChange={(event) => setEditingTokenAmount(event.target.value)} min={1} required />
          </label>
        </div>
      </AdminModal>
    </main>
  );
}
