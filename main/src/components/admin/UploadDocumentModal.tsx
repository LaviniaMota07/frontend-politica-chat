import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import {
  type BackendDepartment,
  type BackendSystem,
  type UploadedDocumentResponse,
  mapBackendDepartment,
  mapBackendSystem,
} from '../../services/adminApi';
import { useCursorScroll } from '../../hooks/useCursorScroll';
import { AdminModal } from './AdminModal';
import { adminStyles, buttonStyles, formStyles, modalStyles } from '../../utils/tailwindStyles';
import { useUploadDocumentForm } from '../../hooks/forms/useUploadDocumentForm';
import type { UploadDocumentFormData } from '../../validation/admin.schema';

function toggleNumber(values: number[], nextValue: number) {
  return values.includes(nextValue)
    ? values.filter((value) => value !== nextValue)
    : [...values, nextValue];
}

interface UploadDocumentModalProps {
  open: boolean;
  onClose: () => void;
  onUploaded?: () => void | Promise<void>;
}

export function UploadDocumentModal({ open, onClose, onUploaded }: UploadDocumentModalProps) {
  const { post, loading } = useFetch();
  const [departments, setDepartments] = useState<Array<{ id: number; name: string; acronym: string }>>([]);
  const [systems, setSystems] = useState<Array<{ id: number; name: string; acronym: string }>>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
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
    if (!open) return;

    queueMicrotask(() => {
      void loadOptions();
    });
  }, [open, loadOptions]);

  function resetUploadState() {
    resetUploadForm();
    setUploadFile(null);
    setUploadFileError('');
    setUploadDepartmentIds([]);
    setUploadSystemIds([]);
  }

  function handleClose() {
    resetUploadState();
    onClose();
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

    handleClose();
    await onUploaded?.();
  }

  return (
    <AdminModal
      open={open}
      title="Novo documento"
      titleId="new-document-title"
      description="Cria o documento e a versão."
      as="form"
      onClose={handleClose}
      onSubmit={handleUploadSubmit(handleUpload)}
      actions={(
        <>
          <button type="button" className={buttonStyles.secondary} onClick={handleClose}>
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
  );
}
