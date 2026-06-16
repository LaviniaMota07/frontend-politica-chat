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

export interface BackendPermissionGroup {
  permissionGroupId: number;
  permissionGroupNm: string;
  active: boolean;
}

export interface BackendPermissionGroupDetail extends BackendPermissionGroup {
  permissionGroupUsers: {
    user: BackendPermissionGroupUser;
  }[];
}

export interface BackendPermissionGroupUser {
  userId: number;
  name: string;
  email: string;
  active: boolean;
}

export interface PermissionGroupPaginationResponse {
  data: BackendPermissionGroup[];
  totalItems: number;
  pages: number;
}

export interface PermissionGroupUsersScrollingResponse {
  data: BackendPermissionGroupUser[];
  finish: boolean;
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

export interface BackendDocument {
  documentId: string;
  title: string | null;
  active: boolean;
  lastUpdateAt: string;
  lastVersionId?: string | null;
  lastVersion: BackendDocumentVersionSummary | null;
  departmentIds?: number[];
  systemIds?: number[];
  authorName: string;
}

export interface BackendDocumentsResponse {
  data: BackendDocument[];
  finished: boolean;
}

export type DocumentProcessingStatus = 'PROCESSING' | 'DONE' | 'ERROR';

export interface BackendDocumentVersionSummary {
  documentVersionId: string;
  version: string;
  status: DocumentProcessingStatus | null;
  active: boolean;
  createdAt?: string;
}

export interface BackendDocumentDetail extends BackendDocument {
  departmentIds: number[];
  systemIds: number[];
}

export interface BackendDocumentVersion {
  documentVersionId: string;
  documentId: string;
  version: string;
  documentPath: string;
  hash: string;
  status: DocumentProcessingStatus | null;
  active: boolean;
  createdAt: string;
  authorName: string;
}

export interface BackendDocumentVersionsResponse {
  data: BackendDocumentVersion[];
  finished: boolean;
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
  departmentIds: number[];
  systemIds: number[];
  authorName: string;
  lastUpdateAt: string;
}
