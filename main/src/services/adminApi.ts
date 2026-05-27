import type { User, UserRole, UserStatus } from '../types/user';

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

export function roleToTypeUserId(role: UserRole) {
  return role === 'Admin' ? 1 : 2;
}

export function typeUserIdToRole(typeUserId: number): UserRole {
  return typeUserId === 1 ? 'Admin' : 'Default';
}

export function activeToUserStatus(active: boolean): UserStatus {
  return active ? 'Ativo' : 'Bloqueado';
}

export function mapBackendUser(user: BackendUser): User {
  return {
    id: user.userId,
    name: user.name,
    email: user.email,
    role: typeUserIdToRole(user.typeUserId),
    department: 'Não informado',
    status: activeToUserStatus(user.active),
  };
}

export function mapBackendDepartment(department: BackendDepartment): CatalogItem {
  return {
    id: department.departmentId,
    name: department.departmentNm,
    acronym: department.acronym,
    status: department.active ? 'Ativo' : 'Inativo',
  };
}

export function mapBackendSystem(system: BackendSystem): CatalogItem {
  return {
    id: system.systemId,
    name: system.systemNm,
    acronym: system.acronym,
    status: system.active ? 'Ativo' : 'Inativo',
  };
}

export function mapBackendModelKey(
  key: BackendModelIaKey,
  modelName: string,
): AiKeyItem {
  return {
    id: `${key.modelIaId}:${key.modelKey}`,
    modelIaId: key.modelIaId,
    modelName,
    modelKey: key.modelKey,
    qtnToken: Number(key.qtnToken),
    active: key.active,
  };
}

export function previewModelKey(modelKey: string) {
  if (modelKey.length <= 12) {
    return modelKey;
  }

  return `${modelKey.slice(0, 8)}...${modelKey.slice(-6)}`;
}
