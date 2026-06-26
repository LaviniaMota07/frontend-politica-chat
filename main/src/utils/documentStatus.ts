export function formatDocumentStatus(status?: string | null) {
  const trimmedStatus = status?.trim();
  const normalizedStatus = trimmedStatus?.toLowerCase();

  if (!trimmedStatus || !normalizedStatus) return 'Sem status';

  if (normalizedStatus.includes('process') || normalizedStatus.includes('pend')) {
    return 'Em processamento';
  }

  if (normalizedStatus.includes('erro') || normalizedStatus.includes('error') || normalizedStatus.includes('fail')) {
    return 'Erro';
  }

  if (normalizedStatus.includes('done') || normalizedStatus.includes('conclu') || normalizedStatus.includes('success')) {
    return 'Concluído';
  }

  return trimmedStatus;
}
