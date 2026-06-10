import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { ArrowLeft, FileText, Link2, Plus, RefreshCcw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminModal } from '../../components/admin/AdminModal';
import { useFetch } from '../../hooks/useFetch';
import { useCursorScroll } from '../../hooks/useCursorScroll';
import { useNewVersionForm } from '../../hooks/forms/useNewVersionForm';
import { useSyncLinksForm } from '../../hooks/forms/useSyncLinksForm';
import {
  type BackendDepartment,
  type BackendDocumentDetail,
  type BackendDocumentVersionsResponse,
  type BackendSystem,
  type BackendDocumentVersion,
  type NewDocumentVersionResponse,
  mapBackendDepartment,
  mapBackendSystem,
} from '../../services/adminApi';
import { formatDocumentStatus } from '../../utils/documentStatus';
import { adminStyles, buttonStyles, formStyles, modalStyles } from '../../utils/tailwindStyles';
import type { NewVersionFormData, SyncLinksFormData } from '../../validation/admin.schema';

function toggleNumber(values: number[], nextValue: number) {
  return values.includes(nextValue)
    ? values.filter((value) => value !== nextValue)
    : [...values, nextValue];
}

export default function AdminDocumentDetail() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { get, post, put, loading } = useFetch();
  const [document, setDocument] = useState<BackendDocumentDetail | null>(null);
  const [versions, setVersions] = useState<BackendDocumentVersion[]>([]);
  const [versionsFinished, setVersionsFinished] = useState(true);
  const [departments, setDepartments] = useState<Array<{ id: number; name: string; acronym: string }>>([]);
  const [systems, setSystems] = useState<Array<{ id: number; name: string; acronym: string }>>([]);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<number[]>([]);
  const [selectedSystemIds, setSelectedSystemIds] = useState<number[]>([]);
  const [versionFile, setVersionFile] = useState<File | null>(null);
  const [versionFileError, setVersionFileError] = useState('');
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  const {
    register: registerVersion,
    handleSubmit: handleVersionSubmit,
    formState: { errors: versionErrors },
    reset: resetVersionForm,
    setValue: setVersionValue,
  } = useNewVersionForm();

  const {
    handleSubmit: handleSyncSubmit,
    setValue: setSyncValue,
  } = useSyncLinksForm();

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

  const loadVersions = useCallback(async (
    cursor: BackendDocumentVersion | null = null,
    append = false,
  ) => {
    if (!documentId) return;

    const params = new URLSearchParams({ limit: '10' });

    if (cursor) {
      params.set('lastCreatedAt', cursor.createdAt);
      params.set('lastId', cursor.documentVersionId);
    }

    const response = await get(
      `/documents/${documentId}/versions?${params.toString()}`,
    ) as BackendDocumentVersionsResponse | null;

    setVersions((current) => (append ? [...current, ...(response?.data ?? [])] : response?.data ?? []));
    setVersionsFinished(response?.finished ?? true);
  }, [documentId, get]);

  const loadPageData = useCallback(async () => {
    if (!documentId) return;

    setIsLoadingPage(true);
    const [departmentRows, systemRows, documentDetail] = await Promise.all([
      fetchAllDepartments(),
      fetchAllSystems(),
      get(`/documents/${documentId}`) as Promise<BackendDocumentDetail | null>,
    ]);

    setDepartments(departmentRows.map(mapBackendDepartment));
    setSystems(systemRows.map(mapBackendSystem));
    setDocument(documentDetail);
    setSelectedDepartmentIds(documentDetail?.departmentIds ?? []);
    setSelectedSystemIds(documentDetail?.systemIds ?? []);
    setSyncValue('documentId', documentId, { shouldValidate: true });
    setVersionValue('fileId', documentId, { shouldValidate: true });
    setIsLoadingPage(false);

    await loadVersions(null, false);
  }, [documentId, fetchAllDepartments, fetchAllSystems, get, loadVersions, setSyncValue, setVersionValue]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadPageData();
    });
  }, [loadPageData]);

  const linkedDepartments = useMemo(
    () => departments.filter((department) => selectedDepartmentIds.includes(department.id)),
    [departments, selectedDepartmentIds],
  );
  const linkedSystems = useMemo(
    () => systems.filter((system) => selectedSystemIds.includes(system.id)),
    [systems, selectedSystemIds],
  );

  function handleVersionFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setVersionFile(file);
    if (file) setVersionFileError('');
  }

  function closeVersionModal() {
    setIsVersionModalOpen(false);
    setVersionFile(null);
    setVersionFileError('');
    resetVersionForm({ fileId: documentId ?? '', version: '2.0' });
  }

  async function handleNewVersion(data: NewVersionFormData) {
    if (!versionFile) {
      setVersionFileError('Selecione um arquivo para enviar.');
      return;
    }

    const formData = new FormData();
    formData.append('file', versionFile);
    formData.append('fileId', data.fileId.trim());
    formData.append('version', data.version.trim());

    const response = await post('/documents/new-version', {
      formData,
      successAlert: {
        title: 'Nova versão enviada',
        message: 'A versão foi criada e enviada para processamento.',
      },
    }) as NewDocumentVersionResponse | null;

    if (!response) return;

    closeVersionModal();
    await loadPageData();
  }

  async function handleSyncLinks(data: SyncLinksFormData) {
    await Promise.all([
      put('/documents/departments', {
        body: { documentId: data.documentId, departmentIds: selectedDepartmentIds },
        successAlert: {
          title: 'Departamentos atualizados',
          message: 'Os vínculos do documento foram sincronizados.',
        },
      }),
      put('/documents/systems', {
        body: { documentId: data.documentId, systemIds: selectedSystemIds },
        successAlert: {
          title: 'Sistemas atualizados',
          message: 'Os vínculos do documento foram sincronizados.',
        },
      }),
    ]);

    await loadPageData();
  }

  return (
    <main className={adminStyles.page}>
      <section className={adminStyles.content}>
        <header className={adminStyles.header}>
          <div>
            <button
              type="button"
              className={`${buttonStyles.secondary} mb-4`}
              onClick={() => navigate('/admin/documents')}
            >
              <ArrowLeft size={16} /> Voltar para documentos
            </button>
            <h1 className={adminStyles.title}>{document?.title ?? 'Documento'}</h1>
            <p className={adminStyles.subtitle}>
              Histórico de versões, vínculo com departamentos e vínculo com sistemas.
            </p>
          </div>
          <div className={adminStyles.headerActions}>
            <button
              type="button"
              className={buttonStyles.primary}
              onClick={() => setIsVersionModalOpen(true)}
              disabled={!documentId}
            >
              <Plus size={16} /> Nova versão
            </button>
          </div>
        </header>

        <section className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">
          <InfoCard label="Versão atual" value={document?.lastVersion?.version ?? 'Sem versão'} />
          <InfoCard
            label="Status"
            value={formatDocumentStatus(document?.lastVersion?.status)}
            status={document?.lastVersion?.status ?? ''}
          />
          <InfoCard label="Autor" value={document?.authorName ?? 'Sem autor'} />
          <InfoCard label="Última atualização" value={document ? formatDate(document.lastUpdateAt) : 'Sem data'} />
        </section>

        {isLoadingPage ? (
          <section className={adminStyles.section}>
            <div className={adminStyles.deleteBody}>Carregando documento...</div>
          </section>
        ) : (
          <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] gap-6 max-[1050px]:grid-cols-1">
            <section className={adminStyles.section}>
              <div className={adminStyles.sectionHeader}>
                <div>
                  <h2 className={adminStyles.sectionTitle}>Versões</h2>
                  <p className={adminStyles.subtitle}>Versões antigas e versão atual do documento.</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {versions.length === 0 ? (
                  <div className={adminStyles.deleteBody}>Nenhuma versão encontrada.</div>
                ) : versions.map((version) => (
                  <article
                    key={version.documentVersionId}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-4 max-[700px]:flex-col max-[700px]:items-start"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                        <FileText size={18} />
                      </span>
                      <div>
                        <strong className="font-[var(--heading)] text-lg font-extrabold tracking-[-0.035em] text-[var(--text-primary)]">
                          Versão {version.version}
                        </strong>
                        <p className="text-sm leading-6 text-[var(--text-secondary)]">
                          Criada por {version.authorName} em {formatDate(version.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-2">
                      <span className={getDocumentStatusDotClass(version.status ?? '')} aria-hidden="true" />
                      <span className={getDocumentStatusBadgeClass(version.status ?? '')}>
                        {formatDocumentStatus(version.status)}
                      </span>
                    </span>
                  </article>
                ))}
              </div>

              {!versionsFinished && (
                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    className={buttonStyles.secondary}
                    onClick={() => void loadVersions(versions.at(-1) ?? null, true)}
                    disabled={loading}
                  >
                    Carregar mais versões
                  </button>
                </div>
              )}
            </section>

            <section className={adminStyles.section}>
              <div className={adminStyles.sectionHeader}>
                <div>
                  <h2 className={adminStyles.sectionTitle}>Vínculos</h2>
                  <p className={adminStyles.subtitle}>Defina quais departamentos e sistemas usam este documento.</p>
                </div>
                <Link2 size={20} />
              </div>

              <form className="flex flex-col gap-5" onSubmit={handleSyncSubmit(handleSyncLinks)}>
                <LinkGroup
                  title="Departamentos vinculados"
                  emptyLabel="Nenhum departamento vinculado."
                  selectedNames={linkedDepartments.map((department) => `${department.name} (${department.acronym})`)}
                />

                <div className={adminStyles.deleteBody}>
                  <strong>Departamentos</strong>
                  {departments.map((department) => (
                    <label key={department.id} className={modalStyles.option}>
                      <input
                        type="checkbox"
                        checked={selectedDepartmentIds.includes(department.id)}
                        onChange={() => setSelectedDepartmentIds((current) => toggleNumber(current, department.id))}
                      />
                      <span>{department.name} ({department.acronym})</span>
                    </label>
                  ))}
                </div>

                <LinkGroup
                  title="Sistemas vinculados"
                  emptyLabel="Nenhum sistema vinculado."
                  selectedNames={linkedSystems.map((system) => `${system.name} (${system.acronym})`)}
                />

                <div className={adminStyles.deleteBody}>
                  <strong>Sistemas</strong>
                  {systems.map((system) => (
                    <label key={system.id} className={modalStyles.option}>
                      <input
                        type="checkbox"
                        checked={selectedSystemIds.includes(system.id)}
                        onChange={() => setSelectedSystemIds((current) => toggleNumber(current, system.id))}
                      />
                      <span>{system.name} ({system.acronym})</span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button type="submit" className={buttonStyles.primary} disabled={loading || !documentId}>
                    Salvar vínculos
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </section>

      <AdminModal
        open={isVersionModalOpen}
        title="Nova versão"
        titleId="new-version-title"
        description="Envie um novo arquivo para criar uma versão deste documento."
        as="form"
        onClose={closeVersionModal}
        onSubmit={handleVersionSubmit(handleNewVersion)}
        actions={(
          <>
            <button type="button" className={buttonStyles.secondary} onClick={closeVersionModal}>
              Cancelar
            </button>
            <button type="submit" className={buttonStyles.primary} disabled={loading || !versionFile}>
              <RefreshCcw size={16} /> Enviar nova versão
            </button>
          </>
        )}
      >
        <div className={`${modalStyles.body} ${adminStyles.formGrid}`}>
          <label className={formStyles.label}>
            <span>Versão</span>
            <input className={formStyles.input} type="text" {...registerVersion('version')} />
            {versionErrors.version && <p className={formStyles.error}>{versionErrors.version.message}</p>}
          </label>

          <label className={formStyles.label}>
            <span>Arquivo</span>
            <input className={formStyles.input} type="file" onChange={handleVersionFileChange} />
            {versionFileError && <p className={formStyles.error}>{versionFileError}</p>}
          </label>
        </div>

        {versionErrors.fileId && (
          <p className={`${formStyles.error} px-6 pb-5`}>{versionErrors.fileId.message}</p>
        )}
      </AdminModal>
    </main>
  );
}

function InfoCard({ label, value, status }: { label: string; value: string; status?: string }) {
  return (
    <article className={adminStyles.statCard}>
      <div>
        <span className={adminStyles.statLabel}>{label}</span>
        <strong className="mt-3 block font-[var(--heading)] text-2xl font-extrabold tracking-[-0.045em] text-[var(--text-primary)]">
          {value}
        </strong>
      </div>
      {status && <span className={getDocumentStatusDotClass(status)} aria-hidden="true" />}
    </article>
  );
}

function LinkGroup({
  title,
  emptyLabel,
  selectedNames,
}: {
  title: string;
  emptyLabel: string;
  selectedNames: string[];
}) {
  return (
    <div className={adminStyles.deleteBody}>
      <strong>{title}</strong>
      {selectedNames.length === 0 ? (
        <span>{emptyLabel}</span>
      ) : (
        <div className="flex flex-wrap gap-2">
          {selectedNames.map((name) => (
            <span key={name} className={adminStyles.departmentBadge}>{name}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function getDocumentStatusDotClass(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes('pend') || normalizedStatus.includes('process')) {
    return adminStyles.statusDotPending;
  }

  if (normalizedStatus.includes('erro') || normalizedStatus.includes('error') || normalizedStatus.includes('fail')) {
    return adminStyles.statusDotError;
  }

  return adminStyles.statusDotSynced;
}

function getDocumentStatusBadgeClass(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes('erro') || normalizedStatus.includes('error') || normalizedStatus.includes('fail')) {
    return adminStyles.badgeBlocked;
  }

  if (normalizedStatus.includes('process')) {
    return adminStyles.badgeRoleDefault;
  }

  return adminStyles.badgeActive;
}

function formatDate(value: string) {
  if (!value) return 'Sem data';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}
