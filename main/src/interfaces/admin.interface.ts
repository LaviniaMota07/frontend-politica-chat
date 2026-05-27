export type CatalogStatus = 'Ativo' | 'Inativo';

export interface BackendUser {
  userId: number;
  name: string;
  email: string;
  typeUserId: number;
  registeredAt?: string;
  active: boolean;
  typeUser?: {
    typeUserId: number;
    name: string;
  };
}

export interface BackendDepartment {
  departmentId: number;
  departmentNm: string;
  acronym: string;
  active: boolean;
}

export interface BackendSystem {
  systemId: number;
  systemNm: string;
  acronym: string;
  active: boolean;
}

export interface BackendModelIa {
  modelIaId: number;
  modelNm: string;
  active: boolean;
}

export interface BackendModelIaKey {
  modelIaId: number;
  modelKey: string;
  qtnToken: number | string;
  active: boolean;
}

export interface CatalogItem {
  id: number;
  name: string;
  acronym: string;
  status: CatalogStatus;
}

export interface AiKeyItem {
  id: string;
  modelIaId: number;
  modelName: string;
  modelKey: string;
  qtnToken: number;
  active: boolean;
}

export interface UploadedDocumentResponse {
  document: {
    documentId: string;
    title: string;
    active: boolean;
    lastVersionId: string | null;
  };
  documentVersion: {
    documentVersionId: string;
    documentId: string;
    version: string;
    status: 'PROCESSING' | 'DONE' | 'ERROR';
    active: boolean;
    createdAt?: string;
  };
}

export interface NewDocumentVersionResponse {
  documentVersionId: string;
  documentId: string;
  version: string;
  status: 'PROCESSING' | 'DONE' | 'ERROR';
  active: boolean;
  createdAt?: string;
}

export interface SessionDocument {
  id: string;
  title: string;
  version: string;
  status: string;
  lastVersionId: string | null;
  departmentIds: number[];
  systemIds: number[];
}
