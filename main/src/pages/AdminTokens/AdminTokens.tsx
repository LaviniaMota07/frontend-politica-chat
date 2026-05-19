import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Coins,
  Database,
  Plus,
  Search,
  TrendingUp,
  Zap,
} from 'lucide-react';
import '../../styles/admin-users.css';
import '../../styles/admin-tokens.css';

type AiProvider = 'GPT' | 'Claude' | 'Gemini';

type ApiKeyUsageRecord = {
  id: number;
  provider: AiProvider;
  apiKeyName: string;
  apiKeyPreview: string;
  tokenLimit: number;
  tokens: number;
  date: string;
  dateValue: string;
};

const TOKENS_PER_PAGE = 4;

const apiKeyUsageRecords: ApiKeyUsageRecord[] = [
  {
    id: 1,
    provider: 'GPT',
    apiKeyName: 'GPT Produção',
    apiKeyPreview: 'sk-prod-****-8A21',
    tokenLimit: 4000000,
    tokens: 2864000,
    date: '10 Out 2026, 14:35',
    dateValue: '2026-10-10T14:35:00',
  },
  {
    id: 2,
    provider: 'Claude',
    apiKeyName: 'Claude Jurídico',
    apiKeyPreview: 'sk-ant-****-4F19',
    tokenLimit: 3000000,
    tokens: 2152800,
    date: '10 Out 2026, 11:20',
    dateValue: '2026-10-10T11:20:00',
  },
  {
    id: 3,
    provider: 'GPT',
    apiKeyName: 'GPT Homologação',
    apiKeyPreview: 'sk-hml-****-72BC',
    tokenLimit: 1500000,
    tokens: 996500,
    date: '09 Out 2026, 17:05',
    dateValue: '2026-10-09T17:05:00',
  },
  {
    id: 4,
    provider: 'Gemini',
    apiKeyName: 'Gemini Pesquisa',
    apiKeyPreview: 'gm-****-91DA',
    tokenLimit: 1000000,
    tokens: 584200,
    date: '09 Out 2026, 09:45',
    dateValue: '2026-10-09T09:45:00',
  },
  {
    id: 5,
    provider: 'Claude',
    apiKeyName: 'Claude Atendimento',
    apiKeyPreview: 'sk-ant-****-7B33',
    tokenLimit: 2000000,
    tokens: 743900,
    date: '08 Out 2026, 16:10',
    dateValue: '2026-10-08T16:10:00',
  },
  {
    id: 6,
    provider: 'GPT',
    apiKeyName: 'GPT Relatórios',
    apiKeyPreview: 'sk-rpt-****-2C88',
    tokenLimit: 2500000,
    tokens: 1320800,
    date: '08 Out 2026, 10:25',
    dateValue: '2026-10-08T10:25:00',
  },
  {
    id: 7,
    provider: 'Gemini',
    apiKeyName: 'Gemini Documentos',
    apiKeyPreview: 'gm-****-45FA',
    tokenLimit: 1200000,
    tokens: 412600,
    date: '07 Out 2026, 13:40',
    dateValue: '2026-10-07T13:40:00',
  },
  {
    id: 8,
    provider: 'Claude',
    apiKeyName: 'Claude Auditoria',
    apiKeyPreview: 'sk-ant-****-9D12',
    tokenLimit: 1800000,
    tokens: 879300,
    date: '07 Out 2026, 08:55',
    dateValue: '2026-10-07T08:55:00',
  },
];

const totalTokens = 10000000;
const usedTokens = 6450000;

function formatTokens(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export default function AdminTokens() {
  const [search, setSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState('15 dias');
  const [customPeriod, setCustomPeriod] = useState({ start: '', end: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [apiProvider, setApiProvider] = useState<AiProvider>('GPT');
  const [apiKey, setApiKey] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const remainingTokens = totalTokens - usedTokens;
  const usagePercent = (usedTokens / totalTokens) * 100;
  const dailyAverage = Math.round(usedTokens / 15);
  const estimatedDaysLeft = Math.max(1, Math.floor(remainingTokens / dailyAverage));

  const topProvider = useMemo(() => {
    const usageByProvider = apiKeyUsageRecords.reduce<Record<string, number>>((acc, record) => {
      acc[record.provider] = (acc[record.provider] ?? 0) + record.tokens;
      return acc;
    }, {});

    return Object.entries(usageByProvider).sort((first, second) => second[1] - first[1])[0]?.[0] ?? 'Sem dados';
  }, []);

  useEffect(() => {
    const loadingTimer = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(loadingTimer);
  }, []);

  const filteredRecords = useMemo(() => {
    const latestRecordDate = Math.max(...apiKeyUsageRecords.map((record) => new Date(record.dateValue).getTime()));
    const periodStartDate = new Date(latestRecordDate);

    if (periodFilter === '7 dias') {
      periodStartDate.setDate(periodStartDate.getDate() - 6);
    } else if (periodFilter === '15 dias') {
      periodStartDate.setDate(periodStartDate.getDate() - 14);
    } else if (periodFilter === '30 dias') {
      periodStartDate.setDate(periodStartDate.getDate() - 29);
    }

    return apiKeyUsageRecords
      .filter((record) => {
        const searchValue = search.toLowerCase();
        const recordDate = new Date(record.dateValue);
        const matchesSearch =
          record.provider.toLowerCase().includes(searchValue) ||
          record.apiKeyName.toLowerCase().includes(searchValue) ||
          record.apiKeyPreview.toLowerCase().includes(searchValue);

        const matchesPeriod =
          periodFilter === 'personalizado'
            ? (!customPeriod.start || recordDate >= new Date(customPeriod.start)) &&
              (!customPeriod.end || recordDate <= new Date(customPeriod.end))
            : recordDate >= periodStartDate;

        return matchesSearch && matchesPeriod;
      })
      .sort((firstRecord, secondRecord) => secondRecord.tokens - firstRecord.tokens);
  }, [search, periodFilter, customPeriod]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / TOKENS_PER_PAGE));
  const pageStart = (currentPage - 1) * TOKENS_PER_PAGE;
  const pageEnd = pageStart + TOKENS_PER_PAGE;
  const paginatedRecords = filteredRecords.slice(pageStart, pageEnd);
  const firstVisibleRecord = filteredRecords.length === 0 ? 0 : pageStart + 1;
  const lastVisibleRecord = Math.min(pageEnd, filteredRecords.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, periodFilter, customPeriod]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  function closeAddModal() {
    setIsAddModalOpen(false);
    setApiProvider('GPT');
    setApiKey('');
  }

  function handleAddApiKey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    closeAddModal();
  }

  return (
    <main className="admin-users-page admin-tokens-page">
      <section className="admin-users-content tokens-content">
        <header className="admin-users-header tokens-header">
          <div>
            <h1>Gerenciamento de Tokens</h1>
            <p>Monitore o consumo das APIs de IA por chave cadastrada.</p>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="primary-btn token-primary-btn"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={16} />
              Adicionar API Key
            </button>
          </div>
        </header>

        <section className="tokens-stats-grid" aria-label="Resumo de tokens">
          <article className="token-stat-card">
            <div>
              <span className="token-stat-label">Tokens Disponíveis (Mês)</span>
              <strong className="token-stat-value">{formatTokens(totalTokens)}</strong>
              <span className="token-stat-note">Limite máximo configurado na franquia</span>
              <span className="token-stat-micro">
                <CalendarDays size={12} />
                Próxima renovação: 01 Nov 2026
              </span>
            </div>
            <span className="token-stat-icon token-stat-icon-blue">
              <Database size={17} />
            </span>
          </article>

          <article className="token-stat-card">
            <div>
              <span className="token-stat-label">Tokens Utilizados</span>
              <strong className="token-stat-value">{formatTokens(usedTokens)}</strong>
              <span className="token-stat-note token-stat-warning">
                <TrendingUp size={13} />
                {usagePercent.toFixed(1)}% do limite mensal consumido
              </span>
              <span className="token-stat-micro">Média diária: {formatTokens(dailyAverage)} tokens</span>
              <span className="token-stat-micro">IA com maior uso no mês: {topProvider}</span>
            </div>
            <span className="token-stat-icon token-stat-icon-yellow">
              <Zap size={17} />
            </span>
          </article>

          <article className="token-stat-card">
            <div>
              <span className="token-stat-label">Tokens Restantes</span>
              <strong className="token-stat-value">{formatTokens(remainingTokens)}</strong>
              <span className="token-stat-note token-stat-success">
                <Coins size={13} />
                Suficiente para ~15 dias de uso
              </span>
              <span className="token-stat-micro">
                Esgotamento estimado: {estimatedDaysLeft} dias
              </span>
            </div>
            <span className="token-stat-icon token-stat-icon-green">
              <Coins size={17} />
            </span>
          </article>
        </section>

        <section className="token-details-section">
          <div className="token-section-header token-details-header">
            <h2>Consumo por API Key</h2>

            <div className="token-table-controls">
              <label className="token-search">
                <Search size={17} />
                <input
                  type="text"
                  placeholder="Buscar por IA ou API key..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <select
                className="token-filter-select"
                value={periodFilter}
                onChange={(event) => setPeriodFilter(event.target.value)}
                aria-label="Filtrar por período"
              >
                <option value="7 dias">7 dias</option>
                <option value="15 dias">15 dias</option>
                <option value="30 dias">30 dias</option>
                <option value="personalizado">Personalizado</option>
              </select>

              {periodFilter === 'personalizado' && (
                <div className="token-custom-period">
                  <input
                    type="date"
                    value={customPeriod.start}
                    onChange={(event) => setCustomPeriod((current) => ({ ...current, start: event.target.value }))}
                    aria-label="Data inicial"
                  />
                  <input
                    type="date"
                    value={customPeriod.end}
                    onChange={(event) => setCustomPeriod((current) => ({ ...current, end: event.target.value }))}
                    aria-label="Data final"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="users-table-wrapper token-table-wrapper">
            <table className="users-table token-table">
              <thead>
                <tr>
                  <th>IA</th>
                  <th>API Key</th>
                  <th>Tokens consumidos</th>
                  <th>Tokens da API Key</th>
                </tr>
              </thead>

              <tbody>
                {isLoading &&
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr className="token-skeleton-row" key={`skeleton-${index}`}>
                      <td colSpan={4}>
                        <span />
                      </td>
                    </tr>
                  ))}

                {!isLoading && paginatedRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="user-cell">
                        <strong className="user-name">{record.provider}</strong>
                        <span className="user-email">Modelo de IA conectado</span>
                      </div>
                    </td>
                    <td>
                      <div className="user-cell">
                        <strong className="user-name">{record.apiKeyName}</strong>
                        <span className="user-email">{record.apiKeyPreview}</span>
                      </div>
                    </td>
                    <td>
                      <strong className="token-count">{formatTokens(record.tokens)}</strong>
                    </td>
                    <td>{formatTokens(record.tokenLimit)}</td>
                  </tr>
                ))}

                {!isLoading && filteredRecords.length === 0 && (
                  <tr>
                    <td className="users-empty-cell" colSpan={4}>
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && (
            <div className="table-pagination" aria-label="Paginação de tokens">
              <span className="pagination-summary">
                Mostrando {firstVisibleRecord}-{lastVisibleRecord} de {filteredRecords.length} registros
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
          )}
        </section>
      </section>

      {isAddModalOpen && (
        <div className="role-modal-backdrop" role="presentation">
          <form
            className="role-modal token-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="token-modal-title"
            onSubmit={handleAddApiKey}
          >
            <header className="role-modal-header">
              <div>
                <h2 id="token-modal-title">Adicionar API Key</h2>
                <p>Escolha a IA utilizada e informe a chave de integração.</p>
              </div>
              <button
                type="button"
                className="role-modal-close"
                onClick={closeAddModal}
                aria-label="Fechar"
              >
                x
              </button>
            </header>

            <div className="invite-form-grid">
              <label className="invite-field">
                <span>IA</span>
                <select value={apiProvider} onChange={(event) => setApiProvider(event.target.value as AiProvider)} required>
                  <option value="GPT">GPT</option>
                  <option value="Claude">Claude</option>
                  <option value="Gemini">Gemini</option>
                </select>
              </label>

              <label className="invite-field">
                <span>API Key</span>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder="Cole a chave da API"
                  required
                />
              </label>
            </div>

            <footer className="role-modal-actions">
              <button type="button" className="secondary-btn" onClick={closeAddModal}>
                Cancelar
              </button>
              <button type="submit" className="primary-btn">
                Salvar
              </button>
            </footer>
          </form>
        </div>
      )}
    </main>
  );
}
