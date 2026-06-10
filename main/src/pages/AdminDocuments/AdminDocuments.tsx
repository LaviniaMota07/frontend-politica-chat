import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { FileText, Plus, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import {
  type BackendDocument,
  type BackendDocumentsResponse,
  type BackendDepartment,
  type BackendSystem,
  type UploadedDocumentResponse,
  mapBackendDepartment,
  mapBackendDocument,
  mapBackendSystem,
} from '../../services/adminApi';
import type { SessionDocument } from '../../interfaces/admin.interface';
import { useCursorScroll } from '../../hooks/useCursorScroll';
import { AdminModal } from '../../components/admin/AdminModal';
import { AdminStatsGrid } from '../../components/admin/AdminStatsGrid';
import { formatDocumentStatus } from '../../utils/documentStatus';
import { adminStyles, buttonStyles, formStyles, modalStyles } from '../../utils/tailwindStyles';
import { useUploadDocumentForm } from '../../hooks/forms/useUploadDocumentForm';
import type { UploadDocumentFormData } from '../../validation/admin.schema';

function toggleNumber(values: number[], nextValue: number) {
  return values.includes(nextValue)
    ? values.filter((value) => value !== nextValue)
    : [...values, nextValue];
}

export default function AdminDocuments() {
  const navigate = useNavigate();
  const { get, post, loading } = useFetch();
  const [departments, setDepartments] = useState<Array<{ id: number; name: string; acronym: string }>>([]);
  const [systems, setSystems] = useState<Array<{ id: number; name: string; acronym: string }>>([]);
  const [documents, setDocuments] = useState<SessionDocument[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFileError, setUploadFileError] = useState('');
  const [uploadDepartmentIds, setUploadDepartmentIds] = useState<number[]>([]);
  const [uploadSystemIds, setUploadSystemIds] = useState<number[]>([]);

  const {
    register: registerUpload,
    handleSubmit: handleUploadSubmit,
    formState: { errors: uploadErrors },
    reset: resetUploadForm,
  } = useUploadDocumentForm();

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

  const fetchAllDocuments = useCallback(async () => {
    const documentsRows: BackendDocument[] = [];
    let lastDocument: BackendDocument | null = null;
    let finished = false;

    while (!finished) {
      const params = new URLSearchParams({ limit: '100' });

      if (lastDocument) {
        params.set('lastUpdateAt', lastDocument.lastUpdateAt);
        params.set('lastId', lastDocument.documentId);
      }

      const response = await get(`/documents?${params.toString()}`) as BackendDocumentsResponse | null;
      const pageRows = response?.data ?? [];
      documentsRows.push(...pageRows);
      finished = response?.finished ?? true;
      lastDocument = pageRows.at(-1) ?? null;

      if (!lastDocument) {
        finished = true;
      }
    }

    return documentsRows;
  }, [get]);

  const loadPageData = useCallback(async () => {
    setIsLoadingOptions(true);
    const [departmentRows, systemRows, documentRows] = await Promise.all([
      fetchAllDepartments(),
      fetchAllSystems(),
      fetchAllDocuments(),
    ]);

    setDepartments(departmentRows.map(mapBackendDepartment));
    setSystems(systemRows.map(mapBackendSystem));
    setDocuments(documentRows.map(mapBackendDocument));
    setIsLoadingOptions(false);
  }, [fetchAllDepartments, fetchAllDocuments, fetchAllSystems]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadPageData();
    });
  }, [loadPageData]);

  const statusTotals = useMemo(() => {
    return documents.reduce(
      (totals, document) => {
        const status = document.status.toLowerCase();
        if (status.includes('process')) totals.processing += 1;
        if (status.includes('error') || status.includes('erro')) totals.error += 1;
        if (status.includes('done')) totals.done += 1;
        return totals;
      },
      { processing: 0, error: 0, done: 0 },
    );
  }, [documents]);

  function resetUploadState() {
    resetUploadForm();
    setUploadFile(null);
    setUploadFileError('');
    setUploadDepartmentIds([]);
    setUploadSystemIds([]);
  }

  function closeUploadModal() {
    setIsUploadModalOpen(false);
    resetUploadState();
  }

  function handleUploadFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setUploadFile(file);
    if (file) setUploadFileError('');
  }

  async function handleUpload(data: UploadDocumentFormData) {
    if (!uploadFile) {
      setUploadFileError('Selecione um arquivo para enviar.');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', data.title.trim());
    uploadDepartmentIds.forEach((departmentId) => formData.append('departmentIds', String(departmentId)));
    uploadSystemIds.forEach((systemId) => formData.append('systemIds', String(systemId)));

    const response = await post('/documents/upload', {
      formData,
      successAlert: {
        title: 'Documento enviado',
        message: 'O processamento foi enfileirado no backend.',
      },
    }) as UploadedDocumentResponse | null;

    if (!response) return;

    closeUploadModal();
    await loadPageData();
  }

  return (
    <main className={adminStyles.page}>
      <section className={adminStyles.content}>
        <header className={adminStyles.header}>
          <div>
            <h1 className={adminStyles.title}>Documentos</h1>
            <p className={adminStyles.subtitle}>
              Consulte as fontes cadastradas e acesse cada documento para gerenciar versões e vínculos.
            </p>
          </div>

          <div className={adminStyles.headerActions}>
            <button
              type="button"
              className={buttonStyles.primary}
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Plus size={16} /> Novo documento
            </button>
          </div>
        </header>

        <AdminStatsGrid
          cards={[
            { label: 'Documentos cadastrados', value: documents.length },
            { label: 'Departamentos disponíveis', value: departments.length },
            { label: 'Sistemas disponíveis', value: systems.length },
            { label: 'Em processamento', value: statusTotals.processing },
          ]}
        />

        <section className={adminStyles.section}>
          <div className={adminStyles.sectionHeader}>
            <div>
              <h2 className={adminStyles.sectionTitle}>Documentos cadastrados</h2>
              <p className={adminStyles.subtitle}>
                Clique em um card para abrir o histórico de versões e os vínculos do documento.
              </p>
            </div>
          </div>

          {documents.length === 0 ? (
            <div className={adminStyles.deleteBody}>
              {isLoadingOptions ? 'Carregando documentos...' : 'Nenhum documento cadastrado até o momento.'}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">
              {documents.map((document) => (
                <button
                  key={document.id}
                  type="button"
                  className="group flex min-h-[190px] flex-col justify-between rounded-[22px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-5 text-left shadow-[0_18px_44px_rgba(31,29,25,0.08)] transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[0_24px_60px_rgba(31,29,25,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(168,101,53,0.18)]"
                  onClick={() => navigate(`/admin/documents/${document.id}`)}
                >
                  <span className="flex items-start justify-between gap-4">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                      <FileText size={20} />
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className={getDocumentStatusDotClass(document.status)} aria-hidden="true" />
                      <span className={getDocumentStatusBadgeClass(document.status)}>{formatDocumentStatus(document.status)}</span>
                    </span>
                  </span>

                  <span className="mt-5 flex flex-col gap-2">
                    <strong className="line-clamp-2 font-[var(--heading)] text-xl font-extrabold tracking-[-0.035em] text-[var(--text-primary)]">
                      {document.title}
                    </strong>
                    <span className="text-sm leading-6 text-[var(--text-secondary)]">
                      Versão atual: <strong className="text-[var(--text-primary)]">{document.version}</strong>
                    </span>
                  </span>

                  <span className="mt-5 flex items-center justify-between gap-4 border-t border-[var(--border-neutral)] pt-4 text-xs font-semibold text-[var(--text-secondary)]">
                    <span>{document.authorName}</span>
                    <span>{formatDate(document.lastUpdateAt)}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </section>

      <AdminModal
        open={isUploadModalOpen}
        title="Novo documento"
        titleId="new-document-title"
        description="Cria o documento e a versão 1.0 no backend."
        as="form"
        onClose={closeUploadModal}
        onSubmit={handleUploadSubmit(handleUpload)}
        actions={(
          <>
            <button type="button" className={buttonStyles.secondary} onClick={closeUploadModal}>
              Cancelar
            </button>
            <button type="submit" className={buttonStyles.primary} disabled={loading || !uploadFile}>
              <Upload size={16} /> Enviar documento
            </button>
          </>
        )}
      >
        <div className={`${modalStyles.body} ${adminStyles.formGrid}`}>
          <label className={formStyles.label}>
            <span>Título</span>
            <input className={formStyles.input} type="text" {...registerUpload('title')} />
            {uploadErrors.title && <p className={formStyles.error}>{uploadErrors.title.message}</p>}
          </label>

          <label className={formStyles.label}>
            <span>Arquivo</span>
            <input className={formStyles.input} type="file" onChange={handleUploadFileChange} />
            {uploadFileError && <p className={formStyles.error}>{uploadFileError}</p>}
          </label>
        </div>

        <div className={`${adminStyles.deleteBody} mx-6 mb-4`}>
          <strong>Departamentos</strong>
          {isLoadingOptions ? 'Carregando...' : departments.map((department) => (
            <label key={department.id} className={modalStyles.option}>
              <input
                type="checkbox"
                checked={uploadDepartmentIds.includes(department.id)}
                onChange={() => setUploadDepartmentIds((current) => toggleNumber(current, department.id))}
              />
              <span>{department.name} ({department.acronym})</span>
            </label>
          ))}
        </div>

        <div className={`${adminStyles.deleteBody} mx-6 mb-4`}>
          <strong>Sistemas</strong>
          {isLoadingOptions ? 'Carregando...' : systems.map((system) => (
            <label key={system.id} className={modalStyles.option}>
              <input
                type="checkbox"
                checked={uploadSystemIds.includes(system.id)}
                onChange={() => setUploadSystemIds((current) => toggleNumber(current, system.id))}
              />
              <span>{system.name} ({system.acronym})</span>
            </label>
          ))}
        </div>
      </AdminModal>
    </main>
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
