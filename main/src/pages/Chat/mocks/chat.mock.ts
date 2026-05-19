import type { AiProvider, ChatSource } from '../types/chat.types';

export const chatDepartments = [
  'Todos os departamentos',
  'Governança / RH',
  'Tecnologia (TI)',
  'Recursos Humanos',
  'Financeiro',
];

export const chatSystems = [
  'Todos os sistemas',
  'Portal RH',
  'Service Desk',
  'Reembolso Online',
  'Portal de Governança',
];

export const aiProviders: AiProvider[] = ['GPT', 'Claude', 'Gemini'];

const departmentKnowledge: Record<string, { content: string; sources: ChatSource[] }> = {
  'Governança / RH': {
    content:
      'Resposta filtrada para Governança / RH: a orientação deve seguir a política corporativa vigente e os fluxos de aprovação definidos pelo comitê interno. A recomendação considera apenas documentos associados a governança, conformidade e rotinas de RH.',
    sources: [
      {
        id: 'governance-hr-policy',
        title: 'Manual de Governança e RH.pdf',
      },
    ],
  },
  'Tecnologia (TI)': {
    content:
      'Resposta filtrada para Tecnologia (TI): a solicitação deve observar as normas de segurança, acesso, VPN, gestão de credenciais e uso de sistemas internos. A resposta prioriza documentos técnicos e políticas operacionais de TI.',
    sources: [
      {
        id: 'it-security-policy',
        title: 'Política de Segurança da Informação.pdf',
      },
    ],
  },
  'Recursos Humanos': {
    content:
      'Resposta filtrada para Recursos Humanos: a orientação considera normas de férias, benefícios, jornada, reembolso relacionado a colaboradores e procedimentos de atendimento interno do RH.',
    sources: [
      {
        id: 'hr-benefits-policy',
        title: 'Política de Benefícios e Jornada.pdf',
      },
    ],
  },
  Financeiro: {
    content:
      'Resposta filtrada para Financeiro: a orientação considera regras de reembolso, prestação de contas, centros de custo, aprovações financeiras e auditoria de despesas.',
    sources: [
      {
        id: 'finance-reimbursement-policy',
        title: 'Política de Reembolso de Despesas v3.2.pdf',
      },
    ],
  },
};

const systemKnowledge: Record<string, { content: string; sources: ChatSource[] }> = {
  'Portal RH': {
    content:
      'Resposta filtrada para o Portal RH: a orientação considera solicitações de férias, benefícios, holerites, jornada e fluxos de atendimento aos colaboradores.',
    sources: [
      {
        id: 'portal-rh-policy',
        title: 'Manual de Uso do Portal RH.pdf',
      },
    ],
  },
  'Service Desk': {
    content:
      'Resposta filtrada para o Service Desk: a orientação considera abertura de chamados, priorização, SLA, suporte técnico e regras de atendimento interno.',
    sources: [
      {
        id: 'service-desk-policy',
        title: 'Política de Atendimento Service Desk.pdf',
      },
    ],
  },
  'Reembolso Online': {
    content:
      'Resposta filtrada para o Reembolso Online: a orientação considera envio de despesas, comprovantes, aprovações, limites e prazos de reembolso.',
    sources: [
      {
        id: 'reembolso-online-policy',
        title: 'Manual do Sistema de Reembolso Online.pdf',
      },
    ],
  },
  'Portal de Governança': {
    content:
      'Resposta filtrada para o Portal de Governança: a orientação considera normas corporativas, auditoria, aprovações e consulta de políticas internas.',
    sources: [
      {
        id: 'governance-portal-policy',
        title: 'Guia do Portal de Governança.pdf',
      },
    ],
  },
};

const defaultKnowledge = {
  content:
    'Resposta considerando todos os departamentos: a orientação usa a base geral de políticas internas e pode combinar normas de RH, Financeiro, TI e Governança quando a pergunta envolver mais de uma área.',
  sources: [
    {
      id: 'general-policy-index',
      title: 'Índice Geral de Políticas Internas.pdf',
    },
  ],
};

export function getMockAssistantResponse(
  departments: string[],
  systems: string[],
  aiProvider: AiProvider
) {
  const selectedDepartments = departments.filter((department) => department !== chatDepartments[0]);
  const selectedSystems = systems.filter((system) => system !== chatSystems[0]);
  const departmentResponses = selectedDepartments
    .map((department) => departmentKnowledge[department])
    .filter(Boolean);
  const systemResponses = selectedSystems
    .map((system) => systemKnowledge[system])
    .filter(Boolean);
  const responses = [...departmentResponses, ...systemResponses];

  if (responses.length > 0) {
    return {
      content: `[${aiProvider}] ${responses.map((response) => response.content).join('\n\n')}`,
      sources: responses.flatMap((response) => response.sources),
    };
  }

  return {
    ...defaultKnowledge,
    content: `[${aiProvider}] ${defaultKnowledge.content}`,
  };
}
