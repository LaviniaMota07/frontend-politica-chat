import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { FileText, Link2, RefreshCcw, Upload } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import {
  type BackendDepartment,
  type BackendSystem,
  type NewDocumentVersionResponse,
  type UploadedDocumentResponse,
  mapBackendDepartment,
  mapBackendSystem,
} from '../../services/adminApi';
import { useCursorScroll } from '../../hooks/useCursorScroll';
import { AdminStatsGrid } from '../../components/admin/AdminStatsGrid';
import { AdminTable } from '../../components/admin/AdminTable';
import { adminStyles, buttonStyles, formStyles, modalStyles } from '../../utils/tailwindStyles';

interface SessionDocument {
  id: string;
  title: string;
  version: string;
  status: string;
  lastVersionId: string | null;
  departmentIds: number[];
  systemIds: number[];
}

function toggleNumber(values: number[], nextValue: number) {
  return values.includes(nextValue)
    ? values.filter((value) => value !== nextValue)
    : [...values, nextValue];
}

export default function AdminDocuments() {
  const { post, put, loading } = useFetch();
  const [departments, setDepartments] = useState<Array<{ id: number; name: string; acronym: string }>>([]);
  const [systems, setSystems] = useState<Array<{ id: number; name: string; acronym: string }>>([]);
  const [sessionDocuments, setSessionDocuments] = useState<SessionDocument[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  const [title, setTitle] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDepartmentIds, setUploadDepartmentIds] = useState<number[]>([]);
  const [uploadSystemIds, setUploadSystemIds] = useState<number[]>([]);

  const [versionDocumentId, setVersionDocumentId] = useState('');
  const [versionNumber, setVersionNumber] = useState('2.0');
  const [versionFile, setVersionFile] = useState<File | null>(null);

  const [syncDocumentId, setSyncDocumentId] = useState('');
  const [syncDepartmentIds, setSyncDepartmentIds] = useState<number[]>([]);
  const [syncSystemIds, setSyncSystemIds] = useState<number[]>([]);

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

  const loadOptions = useCallback(async () => {
    setIsLoadingOptions(true);
    const [departmentRows, systemRows] = await Promise.all([
      fetchAllDepartments(),
      fetchAllSystems(),
    ]);

    setDepartments(departmentRows.map(mapBackendDepartment));
    setSystems(systemRows.map(mapBackendSystem));
    setIsLoadingOptions(false);
  }, [fetchAllDepartments, fetchAllSystems]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadOptions();
    });
  }, [loadOptions]);

  const selectedDocument = useMemo(
    () => sessionDocuments.find((document) => document.id === syncDocumentId),
    [sessionDocuments, syncDocumentId],
  );

  function handleUploadFileChange(event: ChangeEvent<HTMLInputElement>) {
    setUploadFile(event.target.files?.[0] ?? null);
  }

  function handleVersionFileChange(event: ChangeEvent<HTMLInputElement>) {
    setVersionFile(event.target.files?.[0] ?? null);
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!uploadFile) {
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', title.trim());
    uploadDepartmentIds.forEach((departmentId) => formData.append('departmentIds', String(departmentId)));
    uploadSystemIds.forEach((systemId) => formData.append('systemIds', String(systemId)));

    const response = await post('/documents/upload', {
      formData,
      successAlert: {
        title: 'Documento enviado',
        message: 'O processamento foi enfileirado no backend.',
      },
    }) as UploadedDocumentResponse | null;

    if (!response) {
      return;
    }

    const nextDocument: SessionDocument = {
      id: response.document.documentId,
      title: response.document.title,
      version: response.documentVersion.version,
      status: response.documentVersion.status,
      lastVersionId: response.document.lastVersionId,
      departmentIds: uploadDepartmentIds,
      systemIds: uploadSystemIds,
    };

    setSessionDocuments((current) => [nextDocument, ...current]);
    setVersionDocumentId(nextDocument.id);
    setSyncDocumentId(nextDocument.id);
    setSyncDepartmentIds(uploadDepartmentIds);
    setSyncSystemIds(uploadSystemIds);
    setTitle('');
    setUploadFile(null);
    setUploadDepartmentIds([]);
    setUploadSystemIds([]);
  }

  async function handleNewVersion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!versionFile || !versionDocumentId.trim()) {
      return;
    }

    const formData = new FormData();
    formData.append('file', versionFile);
    formData.append('fileId', versionDocumentId.trim());
    formData.append('version', versionNumber.trim());

    const response = await post('/documents/new-version', {
      formData,
      successAlert: {
        title: 'Nova versão enviada',
        message: 'A versão foi criada e enviada para processamento.',
      },
    }) as NewDocumentVersionResponse | null;

    if (response) {
      setSessionDocuments((current) =>
        current.map((document) =>
          document.id === response.documentId
            ? {
                ...document,
                version: response.version,
                status: response.status,
                lastVersionId: response.documentVersionId,
              }
            : document,
        ),
      );
      setVersionFile(null);
      setVersionNumber('2.0');
    }
  }

  async function handleSyncLinks(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const documentId = syncDocumentId.trim();

    if (!documentId) {
      return;
    }

    await Promise.all([
      put('/documents/departments', {
        body: { documentId, departmentIds: syncDepartmentIds },
        successAlert: {
          title: 'Departamentos atualizados',
          message: 'Os vínculos do documento foram sincronizados.',
        },
      }),
      put('/documents/systems', {
        body: { documentId, systemIds: syncSystemIds },
        successAlert: {
          title: 'Sistemas atualizados',
          message: 'Os vínculos do documento foram sincronizados.',
        },
      }),
    ]);

    setSessionDocuments((current) =>
      current.map((document) =>
        document.id === documentId
          ? { ...document, departmentIds: syncDepartmentIds, systemIds: syncSystemIds }
          : document,
      ),
    );
  }

  function handleSelectDocument(documentId: string) {
    setSyncDocumentId(documentId);
    setVersionDocumentId(documentId);

    const document = sessionDocuments.find((item) => item.id === documentId);

    if (document) {
      setSyncDepartmentIds(document.departmentIds);
      setSyncSystemIds(document.systemIds);
    }
  }

  return (
    <main className={adminStyles.page}>
      <section className={adminStyles.content}>
        <header className={adminStyles.header}>
          <div>
            <h1 className={adminStyles.title}>Documentos</h1>
          </div>
        </header>

        <AdminStatsGrid
          cards={[
            { label: 'Documentos nesta sessão', value: sessionDocuments.length },
            { label: 'Departamentos disponíveis', value: departments.length },
            { label: 'Sistemas disponíveis', value: systems.length },
            { label: 'Backend', value: 'Upload' },
          ]}
        />

        <section className={adminStyles.section}>
          <div className={adminStyles.sectionHeader}>
            <h2 className={adminStyles.sectionTitle}>Ações disponíveis no backend</h2>
          </div>

          <form className="mb-5 rounded-[20px] border border-[var(--border-neutral)] bg-[var(--bg-surface)]" onSubmit={handleUpload}>
            <header className={modalStyles.header}>
              <div>
                <h2 className={modalStyles.title}>Enviar documento</h2>
                <p className={modalStyles.description}>Cria o documento e a versão 1.0 no backend.</p>
              </div>
              <Upload size={20} />
            </header>

            <div className={`${modalStyles.body} ${adminStyles.formGrid}`}>
              <label className={formStyles.label}>
                <span>Título</span>
                <input
                  className={formStyles.input}
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  minLength={5}
                  maxLength={150}
                  required
                />
              </label>

              <label className={formStyles.label}>
                <span>Arquivo</span>
                <input className={formStyles.input} type="file" onChange={handleUploadFileChange} required />
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

            <footer className={modalStyles.actions}>
              <button type="submit" className={buttonStyles.primary} disabled={loading || !uploadFile}>
                Enviar documento
              </button>
            </footer>
          </form>

          <form className="mb-5 rounded-[20px] border border-[var(--border-neutral)] bg-[var(--bg-surface)]" onSubmit={handleNewVersion}>
            <header className={modalStyles.header}>
              <div>
                <h2 className={modalStyles.title}>Nova versão</h2>
                <p className={modalStyles.description}>Use um ID de documento existente ou selecione um criado nesta sessão.</p>
              </div>
              <RefreshCcw size={20} />
            </header>

            <div className={`${modalStyles.body} ${adminStyles.formGrid}`}>
              <label className={formStyles.label}>
                <span>Documento</span>
                <select className={formStyles.select} value={versionDocumentId} onChange={(event) => setVersionDocumentId(event.target.value)}>
                  <option value="">Informar manualmente abaixo</option>
                  {sessionDocuments.map((document) => (
                    <option key={document.id} value={document.id}>{document.title}</option>
                  ))}
                </select>
              </label>

              <label className={formStyles.label}>
                <span>ID do documento</span>
                <input
                  className={formStyles.input}
                  type="text"
                  value={versionDocumentId}
                  onChange={(event) => setVersionDocumentId(event.target.value)}
                  placeholder="UUID do documento"
                  required
                />
              </label>

              <label className={formStyles.label}>
                <span>Versão</span>
                <input
                  className={formStyles.input}
                  type="text"
                  value={versionNumber}
                  onChange={(event) => setVersionNumber(event.target.value)}
                  maxLength={10}
                  required
                />
              </label>

              <label className={formStyles.label}>
                <span>Arquivo</span>
                <input className={formStyles.input} type="file" onChange={handleVersionFileChange} required />
              </label>
            </div>

            <footer className={modalStyles.actions}>
              <button type="submit" className={buttonStyles.primary} disabled={loading || !versionFile}>
                Enviar nova versão
              </button>
            </footer>
          </form>

          <form className="rounded-[20px] border border-[var(--border-neutral)] bg-[var(--bg-surface)]" onSubmit={handleSyncLinks}>
            <header className={modalStyles.header}>
              <div>
                <h2 className={modalStyles.title}>Vínculos do documento</h2>
                <p className={modalStyles.description}>Sincroniza departamentos e sistemas para um documento existente.</p>
              </div>
              <Link2 size={20} />
            </header>

            <div className={`${modalStyles.body} ${adminStyles.formGrid}`}>
              <label className={formStyles.label}>
                <span>Documento da sessão</span>
                <select className={formStyles.select} value={syncDocumentId} onChange={(event) => handleSelectDocument(event.target.value)}>
                  <option value="">Informar manualmente abaixo</option>
                  {sessionDocuments.map((document) => (
                    <option key={document.id} value={document.id}>{document.title}</option>
                  ))}
                </select>
              </label>

              <label className={formStyles.label}>
                <span>ID do documento</span>
                <input
                  className={formStyles.input}
                  type="text"
                  value={syncDocumentId}
                  onChange={(event) => setSyncDocumentId(event.target.value)}
                  placeholder="UUID do documento"
                  required
                />
              </label>
            </div>

            {selectedDocument && (
              <div className={`${adminStyles.deleteBody} mx-6 mb-4`}>
                <strong>Documento selecionado: {selectedDocument.title}</strong>
                <span>Versão atual conhecida nesta sessão: {selectedDocument.version}</span>
              </div>
            )}

            <div className={`${adminStyles.deleteBody} mx-6 mb-4`}>
              <strong>Departamentos</strong>
              {departments.map((department) => (
                <label key={department.id} className={modalStyles.option}>
                  <input
                    type="checkbox"
                    checked={syncDepartmentIds.includes(department.id)}
                    onChange={() => setSyncDepartmentIds((current) => toggleNumber(current, department.id))}
                  />
                  <span>{department.name} ({department.acronym})</span>
                </label>
              ))}
            </div>

            <div className={`${adminStyles.deleteBody} mx-6 mb-4`}>
              <strong>Sistemas</strong>
              {systems.map((system) => (
                <label key={system.id} className={modalStyles.option}>
                  <input
                    type="checkbox"
                    checked={syncSystemIds.includes(system.id)}
                    onChange={() => setSyncSystemIds((current) => toggleNumber(current, system.id))}
                  />
                  <span>{system.name} ({system.acronym})</span>
                </label>
              ))}
            </div>

            <footer className={modalStyles.actions}>
              <button type="submit" className={buttonStyles.primary} disabled={loading}>
                Sincronizar vínculos
              </button>
            </footer>
          </form>
        </section>

        <section className={`${adminStyles.section} mt-5`}>
          <div className={adminStyles.sectionHeader}>
            <h2 className={adminStyles.sectionTitle}>Documentos criados nesta sessão</h2>
          </div>

          <AdminTable
            columns={['Título', 'ID', 'Versão', 'Status', 'Ação']}
            isEmpty={sessionDocuments.length === 0}
            emptyMessage="O backend atual não expõe listagem de documentos. Documentos enviados aparecerão aqui durante a sessão atual."
          >
            {sessionDocuments.map((document) => (
              <tr key={document.id}>
                <td className={adminStyles.td}>
                  <div className={adminStyles.userCell}>
                    <strong className={adminStyles.userName}>{document.title}</strong>
                    <span className={adminStyles.userEmail}>Última versão conhecida: {document.lastVersionId ?? 'não informada'}</span>
                  </div>
                </td>
                <td className={adminStyles.td}>{document.id}</td>
                <td className={adminStyles.td}>{document.version}</td>
                <td className={adminStyles.td}>
                  <span className="inline-flex items-center gap-2">
                    <span className={getDocumentStatusDotClass(document.status)} aria-hidden="true" />
                    <span className={adminStyles.badgeActive}>{document.status}</span>
                  </span>
                </td>
                <td className={adminStyles.td}>
                  <button type="button" className={adminStyles.editButton} onClick={() => handleSelectDocument(document.id)}>
                    <FileText size={14} /> Usar ID
                  </button>
                </td>
              </tr>
            ))}
          </AdminTable>
        </section>
      </section>
    </main>
  );
}

function getDocumentStatusDotClass(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes('pend') || normalizedStatus.includes('process')) {
    return adminStyles.statusDotPending;
  }

  if (normalizedStatus.includes('erro') || normalizedStatus.includes('fail')) {
    return adminStyles.statusDotError;
  }

  return adminStyles.statusDotSynced;
}
