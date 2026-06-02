import type { UserRole, UserStatus } from '../interfaces/user.interface';
import type { User } from '../interfaces/user.interface';
import type {
  BackendUser,
  BackendDepartment,
  BackendDocument,
  BackendSystem,
  BackendModelIaKey,
  CatalogItem,
  AiKeyItem,
  SessionDocument,
} from '../interfaces/admin.interface';

export type { CatalogStatus } from '../interfaces/admin.interface';
export type {
  BackendUser,
  BackendDepartment,
  BackendPermissionGroup,
  BackendPermissionGroupUser,
  PermissionGroupPaginationResponse,
  PermissionGroupUsersScrollingResponse,
  BackendDocument,
  BackendDocumentsResponse,
  BackendSystem,
  BackendModelIa,
  BackendModelIaKey,
  CatalogItem,
  AiKeyItem,
  UploadedDocumentResponse,
  NewDocumentVersionResponse,
  SessionDocument,
} from '../interfaces/admin.interface';

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

export function mapBackendDocument(document: BackendDocument): SessionDocument {
  return {
    id: document.documentId,
    title: document.title ?? 'Sem título',
    version: document.lastVersion?.version ?? 'Sem versão',
    status: document.lastVersion?.status ?? 'Sem status',
    lastVersionId: document.lastVersionId,
    departmentIds: document.departmentIds ?? [],
    systemIds: document.systemIds ?? [],
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
