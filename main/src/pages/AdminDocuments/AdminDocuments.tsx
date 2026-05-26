import React, { useMemo, useState, useRef, useEffect, type KeyboardEvent, type MouseEvent, type ChangeEvent, type DragEvent } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Collaborator {
  id: string;
  name: string;
  avatar?: string; // URL da foto de perfil (opcional)
  initials: string;
  color: string; // cor de fundo quando não há foto
  role: "editor" | "viewer" | "owner";
  lastSeen?: string; // label ex: "Agora", "Há 5 min"
  isOnline?: boolean;
  isEditing?: boolean; // está editando agora?
}

interface PolicyFormData {
  file: File | null;
  departmentIds: string[];
  systemIds: string[];
}

interface Version {
  id: number;
  version: string;
  timelineLabel: string;
  isActive: boolean;
  status: "approved" | "published";
  name: string;
  fileName: string | null;
  modifiedBy?: Collaborator; // quem modificou esta versão
}

interface Document {
  id: number;
  title: string;
  code: string;
  updatedLabel: string;
  departments: string[];
  systems: string[];
  versions: Version[];
  collaborators: Collaborator[]; // todos os colaboradores do documento
  currentEditor?: Collaborator | null; // quem está editando agora
}

interface VersionModalState {
  mode: "create" | "edit";
  version?: Version;
}

interface VersionModalConfirmPayload {
  versionNumber: string;
  versionName: string;
  fileName: string | null;
  versionId?: number;
}

// ── Icon components ───────────────────────────────────────────────────────────

interface IconProps { size?: number; }

const IconFileText: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconPlus: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconSearch: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconCheck: React.FC<IconProps> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconPower: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
    <line x1="12" y1="2" x2="12" y2="12" />
  </svg>
);

const IconEyeOff: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12c.92-2.6 2.63-4.84 4.94-6.34" />
    <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58" />
    <path d="M9.88 5.09A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11.8 11.8 0 0 1-1.67 2.68" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconBuilding: React.FC<IconProps> = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 22V12h6v10" />
    <path d="M3 9h18" />
  </svg>
);

const IconCpu: React.FC<IconProps> = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="15" x2="23" y2="15" />
    <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="15" x2="4" y2="15" />
  </svg>
);

const IconTag: React.FC<IconProps> = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const IconUpload: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const IconX: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconFile: React.FC<IconProps> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
);

const IconAlertTriangle: React.FC<IconProps> = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconEdit: React.FC<IconProps> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
  </svg>
);

const IconTrash: React.FC<IconProps> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const IconUsers: React.FC<IconProps> = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

// ── Collaborator Avatar Component ─────────────────────────────────────────────

interface AvatarProps {
  collaborator: Collaborator;
  size?: number;
  showTooltip?: boolean;
  showOnlineRing?: boolean;
  showEditingPulse?: boolean;
  style?: React.CSSProperties;
}

const CollaboratorAvatar: React.FC<AvatarProps> = ({
  collaborator,
  size = 26,
  showTooltip = true,
  showOnlineRing = true,
  showEditingPulse = false,
  style,
}) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const roleLabel = collaborator.role === "owner"
    ? "Proprietário"
    : collaborator.role === "editor"
    ? "Editor"
    : "Visualizador";

  return (
    <div
      className="dm-avatar-wrap"
      style={{ width: size, height: size, ...style }}
      onMouseEnter={() => showTooltip && setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
    >
      {/* Ring de edição pulsante */}
      {collaborator.isEditing && showEditingPulse && (
        <div
          className="dm-avatar-editing-ring"
          style={{ width: size + 6, height: size + 6 }}
        />
      )}

      {/* Avatar */}
      <div
        className={`dm-avatar${collaborator.isEditing ? " dm-avatar-editing" : ""}`}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.36,
          background: collaborator.avatar ? "transparent" : collaborator.color,
          borderRadius: "50%",
        }}
      >
        {collaborator.avatar ? (
          <img
            src={collaborator.avatar}
            alt={collaborator.name}
            style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
            onError={(e) => {
              // fallback para iniciais se a imagem falhar
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="dm-avatar-initials">{collaborator.initials}</span>
        )}
      </div>

      {/* Indicador online */}
      {showOnlineRing && collaborator.isOnline && (
        <div
          className="dm-avatar-online-dot"
          style={{
            width: Math.max(7, size * 0.28),
            height: Math.max(7, size * 0.28),
          }}
        />
      )}

      {/* Tooltip */}
      {showTooltip && tooltipVisible && (
        <div className="dm-avatar-tooltip">
          <div className="dm-avatar-tooltip-name">{collaborator.name}</div>
          <div className="dm-avatar-tooltip-meta">
            <span className="dm-avatar-tooltip-role">{roleLabel}</span>
            {collaborator.isEditing && (
              <span className="dm-avatar-tooltip-editing">Editando agora</span>
            )}
            {!collaborator.isEditing && collaborator.lastSeen && (
              <span className="dm-avatar-tooltip-seen">{collaborator.lastSeen}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Avatar Stack (grupo de avatares sobrepostos) ──────────────────────────────

interface AvatarStackProps {
  collaborators: Collaborator[];
  maxVisible?: number;
  size?: number;
  showCurrentEditor?: boolean;
  currentEditor?: Collaborator | null;
}

const AvatarStack: React.FC<AvatarStackProps> = ({
  collaborators,
  maxVisible = 4,
  size = 26,
  showCurrentEditor = false,
  currentEditor,
}) => {
  const [overflowTooltip, setOverflowTooltip] = useState(false);

  // Coloca o editor atual primeiro (se houver)
  const sorted = useMemo(() => {
    if (!currentEditor) return collaborators;
    const rest = collaborators.filter((c) => c.id !== currentEditor.id);
    return [currentEditor, ...rest];
  }, [collaborators, currentEditor]);

  const visible = sorted.slice(0, maxVisible);
  const overflow = sorted.length - maxVisible;
  const overflowNames = sorted.slice(maxVisible).map((c) => c.name);

  const overlap = Math.round(size * 0.35);

  return (
    <div className="dm-avatar-stack" style={{ height: size }}>
      {visible.map((collab, idx) => (
        <CollaboratorAvatar
          key={collab.id}
          collaborator={collab}
          size={size}
          showEditingPulse={showCurrentEditor && collab.isEditing}
          style={{
            marginLeft: idx === 0 ? 0 : -overlap,
            zIndex: visible.length - idx,
            position: "relative",
          }}
        />
      ))}

      {overflow > 0 && (
        <div
          className="dm-avatar-overflow"
          style={{
            width: size,
            height: size,
            fontSize: size * 0.33,
            marginLeft: -overlap,
            zIndex: 0,
          }}
          onMouseEnter={() => setOverflowTooltip(true)}
          onMouseLeave={() => setOverflowTooltip(false)}
        >
          +{overflow}
          {overflowTooltip && (
            <div className="dm-avatar-tooltip dm-avatar-tooltip-overflow">
              {overflowNames.map((name, i) => (
                <div key={i} className="dm-avatar-tooltip-overflow-name">{name}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── CollaboratorsPanel (painel completo no detail view) ───────────────────────

interface CollaboratorsPanelProps {
  collaborators: Collaborator[];
  currentEditor?: Collaborator | null;
}

const CollaboratorsPanel: React.FC<CollaboratorsPanelProps> = ({ collaborators, currentEditor }) => {
  const [expanded, setExpanded] = useState(false);

  const online = collaborators.filter((c) => c.isOnline);
  const offline = collaborators.filter((c) => !c.isOnline);

  return (
    <div className="dm-collab-panel">
      <button
        className="dm-collab-panel-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="dm-collab-panel-toggle-left">
          <IconUsers size={13} />
          <span>Colaboradores</span>
          <span className="dm-collab-count">{collaborators.length}</span>
          {currentEditor && (
            <span className="dm-collab-editing-badge">
              <span className="dm-collab-editing-dot" />
              {currentEditor.name.split(" ")[0]} editando
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AvatarStack collaborators={collaborators} maxVisible={5} size={24} currentEditor={currentEditor ?? undefined} />
          <svg
            width={12} height={12} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: "transform 0.2s ease", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", color: "#6b778c", flexShrink: 0 }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="dm-collab-list">
          {online.length > 0 && (
            <>
              <div className="dm-collab-list-section">Online</div>
              {online.map((c) => (
                <CollaboratorRow key={c.id} collaborator={c} />
              ))}
            </>
          )}
          {offline.length > 0 && (
            <>
              <div className="dm-collab-list-section">Offline</div>
              {offline.map((c) => (
                <CollaboratorRow key={c.id} collaborator={c} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const CollaboratorRow: React.FC<{ collaborator: Collaborator }> = ({ collaborator }) => {
  const roleLabel = collaborator.role === "owner" ? "Proprietário" : collaborator.role === "editor" ? "Editor" : "Visualizador";
  const roleColor = collaborator.role === "owner" ? "#c084fc" : collaborator.role === "editor" ? "#7ea0ff" : "#737d8f";

  return (
    <div className="dm-collab-row">
      <CollaboratorAvatar collaborator={collaborator} size={30} showTooltip={false} />
      <div className="dm-collab-row-info">
        <div className="dm-collab-row-name">
          {collaborator.name}
          {collaborator.isEditing && <span className="dm-collab-row-editing">Editando</span>}
        </div>
        <div className="dm-collab-row-meta">
          <span style={{ color: roleColor, fontSize: 10.5, fontWeight: 600 }}>{roleLabel}</span>
          {collaborator.lastSeen && !collaborator.isEditing && (
            <span className="dm-collab-row-seen">· {collaborator.lastSeen}</span>
          )}
        </div>
      </div>
      <div className="dm-collab-row-status">
        {collaborator.isOnline ? (
          <span className="dm-collab-status-online">●</span>
        ) : (
          <span className="dm-collab-status-offline">●</span>
        )}
      </div>
    </div>
  );
};

// ── Constants & helpers ───────────────────────────────────────────────────────

const COLLABORATOR_COLORS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #fd7f6f 0%, #b2e4b2 100%)",
  "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
];

// Dados fictícios de colaboradores
const MOCK_COLLABORATORS: Record<string, Collaborator[]> = {
  "1": [
    { id: "u1", name: "Ana Souza", initials: "AS", color: COLLABORATOR_COLORS[0], role: "owner", isOnline: true, isEditing: true, lastSeen: "Agora", avatar: "https://i.pravatar.cc/150?img=47" },
    { id: "u2", name: "Carlos Lima", initials: "CL", color: COLLABORATOR_COLORS[1], role: "editor", isOnline: true, isEditing: false, lastSeen: "Há 5 min", avatar: "https://i.pravatar.cc/150?img=12" },
    { id: "u3", name: "Beatriz Nunes", initials: "BN", color: COLLABORATOR_COLORS[2], role: "viewer", isOnline: false, lastSeen: "Há 2 horas" },
    { id: "u4", name: "Felipe Torres", initials: "FT", color: COLLABORATOR_COLORS[3], role: "editor", isOnline: false, lastSeen: "Ontem" },
  ],
  "2": [
    { id: "u5", name: "Mariana Costa", initials: "MC", color: COLLABORATOR_COLORS[4], role: "owner", isOnline: true, isEditing: false, lastSeen: "Há 1 min", avatar: "https://i.pravatar.cc/150?img=32" },
    { id: "u6", name: "Rafael Dias", initials: "RD", color: COLLABORATOR_COLORS[5], role: "editor", isOnline: true, isEditing: true, lastSeen: "Agora", avatar: "https://i.pravatar.cc/150?img=15" },
    { id: "u7", name: "Juliana Alves", initials: "JA", color: COLLABORATOR_COLORS[6], role: "viewer", isOnline: false, lastSeen: "Há 3 horas" },
  ],
  "3": [
    { id: "u8", name: "Pedro Henrique", initials: "PH", color: COLLABORATOR_COLORS[7], role: "owner", isOnline: false, lastSeen: "Há 1 dia", avatar: "https://i.pravatar.cc/150?img=52" },
    { id: "u1", name: "Ana Souza", initials: "AS", color: COLLABORATOR_COLORS[0], role: "editor", isOnline: true, isEditing: false, lastSeen: "Há 10 min", avatar: "https://i.pravatar.cc/150?img=47" },
    { id: "u9", name: "Thiago Mendes", initials: "TM", color: COLLABORATOR_COLORS[1], role: "editor", isOnline: true, isEditing: true, lastSeen: "Agora", avatar: "https://i.pravatar.cc/150?img=67" },
    { id: "u10", name: "Carla Ferreira", initials: "CF", color: COLLABORATOR_COLORS[2], role: "viewer", isOnline: false, lastSeen: "Há 5 horas" },
    { id: "u11", name: "Gustavo Rocha", initials: "GR", color: COLLABORATOR_COLORS[3], role: "viewer", isOnline: false, lastSeen: "Semana passada" },
  ],
  "4": [
    { id: "u12", name: "Fernanda Lima", initials: "FL", color: COLLABORATOR_COLORS[4], role: "owner", isOnline: true, isEditing: false, lastSeen: "Há 2 min", avatar: "https://i.pravatar.cc/150?img=25" },
    { id: "u13", name: "Leonardo Vieira", initials: "LV", color: COLLABORATOR_COLORS[5], role: "editor", isOnline: false, lastSeen: "Ontem" },
  ],
  "5": [
    { id: "u14", name: "Isabela Neto", initials: "IN", color: COLLABORATOR_COLORS[6], role: "owner", isOnline: true, isEditing: true, lastSeen: "Agora", avatar: "https://i.pravatar.cc/150?img=44" },
    { id: "u15", name: "Eduardo Pinto", initials: "EP", color: COLLABORATOR_COLORS[7], role: "editor", isOnline: true, isEditing: false, lastSeen: "Há 8 min" },
    { id: "u16", name: "Natalia Gomes", initials: "NG", color: COLLABORATOR_COLORS[0], role: "editor", isOnline: false, lastSeen: "Há 1 hora", avatar: "https://i.pravatar.cc/150?img=36" },
  ],
};

const DEFAULT_TIMELINE: string[] = [
  "Hoje, 14:30","Ontem, 09:15","10 de Out, 16:40","05 de Out, 10:00",
  "03 de Out, 11:20","28 de Set, 08:10","22 de Set, 15:50","14 de Set, 09:05",
];

const createVersionHistory = (docId: number, labels: string[] = ["2.1","2.0","1.9","1.8"]): Version[] => {
  const collabs = MOCK_COLLABORATORS[String(docId)] ?? MOCK_COLLABORATORS["1"];
  return labels.map((label, index) => ({
    id: Number(`${Date.now()}${index}`) + Math.floor(Math.random() * 1000),
    version: label,
    timelineLabel: DEFAULT_TIMELINE[index] ?? `Versão anterior ${index + 1}`,
    isActive: index === 0,
    status: index === 0 ? "approved" : "published",
    name: "",
    fileName: null,
    modifiedBy: collabs[index % collabs.length],
  }));
};

const initialDocuments: Document[] = [
  {
    id: 1, title: "Código de Conduta", code: "POL-2024-001", updatedLabel: "Atualizado ontem",
    departments: ["Recursos Humanos", "Jurídico"], systems: ["Portal RH", "Intranet"],
    versions: createVersionHistory(1, ["2.1","2.0","1.9","1.8"]),
    collaborators: MOCK_COLLABORATORS["1"],
    currentEditor: MOCK_COLLABORATORS["1"].find(c => c.isEditing) ?? null,
  },
  {
    id: 2, title: "Política de Férias", code: "POL-2024-042", updatedLabel: "Há 3 dias",
    departments: ["Recursos Humanos"], systems: ["Portal RH"],
    versions: createVersionHistory(2, ["1.7","1.6","1.5","1.4"]),
    collaborators: MOCK_COLLABORATORS["2"],
    currentEditor: MOCK_COLLABORATORS["2"].find(c => c.isEditing) ?? null,
  },
  {
    id: 3, title: "Trabalho Remoto", code: "POL-2024-015", updatedLabel: "Há 1 semana",
    departments: ["Operações", "TI"], systems: ["Intranet", "ServiceDesk", "SAP HCM"],
    versions: createVersionHistory(3, ["3.2","3.1","3.0","2.9"]),
    collaborators: MOCK_COLLABORATORS["3"],
    currentEditor: MOCK_COLLABORATORS["3"].find(c => c.isEditing) ?? null,
  },
  {
    id: 4, title: "Benefícios e Auxílios", code: "POL-2024-008", updatedLabel: "Há 2 semanas",
    departments: ["Financeiro", "Recursos Humanos"], systems: ["SAP HCM"],
    versions: createVersionHistory(4, ["1.4","1.3","1.2","1.1"]),
    collaborators: MOCK_COLLABORATORS["4"],
    currentEditor: MOCK_COLLABORATORS["4"].find(c => c.isEditing) ?? null,
  },
  {
    id: 5, title: "Uso de Equipamentos", code: "POL-2024-023", updatedLabel: "Há 1 mês",
    departments: ["TI"], systems: ["ServiceDesk", "Portal RH", "Intranet"],
    versions: createVersionHistory(5, ["2.3","2.2","2.1","2.0"]),
    collaborators: MOCK_COLLABORATORS["5"],
    currentEditor: MOCK_COLLABORATORS["5"].find(c => c.isEditing) ?? null,
  },
];

const DEP_MAP: Record<string, string> = {
  "dep-1": "Recursos Humanos",
  "dep-2": "Tecnologia da Informação",
  "dep-3": "Jurídico",
  "dep-4": "Financeiro",
  "dep-5": "Operações",
};

const SYS_MAP: Record<string, string> = {
  "sys-1": "ERP Corporativo",
  "sys-2": "Portal do Colaborador",
  "sys-3": "Sistema de RH",
  "sys-4": "Helpdesk",
  "sys-5": "Intranet",
};

const getNextVersionNumber = (versions: Version[]): string => {
  const highest = Math.max(...versions.map((v) => parseFloat(v.version)));
  return (Math.round((highest + 0.1) * 10) / 10).toFixed(1);
};

const getVersionGridStyle = (count: number): React.CSSProperties => ({
  gridTemplateColumns: `repeat(${Math.max(count, 4)}, minmax(240px, 1fr))`,
});

const getLatestVersion = (versions: Version[]): Version =>
  versions.reduce((max, v) => parseFloat(v.version) > parseFloat(max.version) ? v : max);

const getActiveVersion = (versions: Version[]): Version | null =>
  versions.find((v) => v.isActive) ?? null;

// ── TagInput ──────────────────────────────────────────────────────────────────

interface TagInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  colorClass?: string;
}

const TagInput: React.FC<TagInputProps> = ({ values, onChange, placeholder = "Adicionar...", colorClass = "dm-tag-blue" }) => {
  const [input, setInput] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (): void => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed]);
    setInput("");
  };
  const removeTag = (idx: number): void => onChange(values.filter((_, i) => i !== idx));
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
    if (e.key === "Backspace" && input === "" && values.length > 0) onChange(values.slice(0, -1));
  };

  return (
    <div className={`dm-tag-input-wrap ${colorClass}`} onClick={() => inputRef.current?.focus()}>
      {values.map((v, i) => (
        <span key={i} className="dm-tag-chip">
          {v}
          <button className="dm-tag-chip-remove" onClick={(e: MouseEvent) => { e.stopPropagation(); removeTag(i); }}>
            <IconX size={10} />
          </button>
        </span>
      ))}
      <input ref={inputRef} className="dm-tag-input" value={input}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
        onKeyDown={handleKeyDown} onBlur={addTag}
        placeholder={values.length === 0 ? placeholder : ""} />
    </div>
  );
};

// ── VersionModal ──────────────────────────────────────────────────────────────

interface VersionModalProps {
  mode: "create" | "edit";
  suggestedVersion?: string;
  initialData?: Version | null;
  onConfirm: (payload: VersionModalConfirmPayload) => void;
  onClose: () => void;
}

const VersionModal: React.FC<VersionModalProps> = ({ mode, suggestedVersion, initialData = null, onConfirm, onClose }) => {
  const isEdit = mode === "edit";
  const [versionNumber, setVersionNumber] = useState<string>(isEdit ? (initialData?.version ?? "") : (suggestedVersion ?? ""));
  const [versionName, setVersionName] = useState<string>(isEdit ? (initialData?.name ?? "") : "");
  const [file, setFile] = useState<File | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(isEdit ? (initialData?.fileName ?? null) : null);
  const [dragging, setDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | undefined): void => { if (f) { setFile(f); setExistingFileName(null); } };
  const handleDrop = (e: DragEvent<HTMLDivElement>): void => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };
  const handleRemoveFile = (e: MouseEvent): void => { e.stopPropagation(); setFile(null); setExistingFileName(null); };
  const handleSubmit = (): void => {
    if (!versionNumber.trim()) return;
    onConfirm({ versionNumber: versionNumber.trim(), versionName: versionName.trim(), fileName: file ? file.name : existingFileName, versionId: isEdit ? initialData?.id : undefined });
  };
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>): void => { if (e.target === e.currentTarget) onClose(); };

  const hasFile = file !== null || existingFileName !== null;
  const displayFileName = file ? file.name : existingFileName;
  const displayFileSize = file ? `${(file.size / 1024).toFixed(1)} KB` : "Arquivo existente";

  return (
    <div className="dm-modal-backdrop" onClick={handleBackdropClick}>
      <div className="dm-modal">
        <div className="dm-modal-header">
          <div className="dm-modal-header-left">
            <div className={`dm-modal-icon${isEdit ? " dm-modal-icon-edit" : ""}`}>
              {isEdit ? <IconEdit size={18} /> : <IconPlus size={18} />}
            </div>
            <div>
              <h3 className="dm-modal-title">{isEdit ? `Editar versão ${initialData?.version}` : "Nova versão"}</h3>
              <p className="dm-modal-subtitle">{isEdit ? "Altere os dados desta versão do documento" : "Preencha os dados da nova versão do documento"}</p>
            </div>
          </div>
          <button className="dm-modal-close" onClick={onClose}><IconX size={16} /></button>
        </div>
        <div className="dm-modal-body">
          <div className="dm-modal-field">
            <label className="dm-modal-label">Número da versão <span className="dm-modal-required">*</span></label>
            <input className="dm-modal-input" type="text" value={versionNumber}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setVersionNumber(e.target.value)}
              placeholder="Ex: 2.2" autoFocus />
            <span className="dm-modal-hint">{isEdit ? "Edite o número identificador desta versão" : "Versão sugerida com base no histórico atual"}</span>
          </div>
          <div className="dm-modal-field">
            <label className="dm-modal-label">Nome da versão</label>
            <input className="dm-modal-input" type="text" value={versionName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setVersionName(e.target.value)}
              placeholder="Ex: Revisão de compliance Q4" />
            <span className="dm-modal-hint">Opcional — um rótulo descritivo para identificar esta versão</span>
          </div>
          <div className="dm-modal-field">
            <label className="dm-modal-label">Arquivo do documento</label>
            <div
              className={`dm-dropzone${dragging ? " dm-dropzone-active" : ""}${hasFile ? " dm-dropzone-filled" : ""}`}
              onDragOver={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => { if (!hasFile) fileInputRef.current?.click(); }}
            >
              {hasFile ? (
                <div className="dm-dropzone-file">
                  <div className="dm-dropzone-file-icon"><IconFile size={20} /></div>
                  <div className="dm-dropzone-file-info">
                    <span className="dm-dropzone-file-name">{displayFileName}</span>
                    <span className="dm-dropzone-file-size">{displayFileSize}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button className="dm-dropzone-remove dm-dropzone-replace" onClick={(e: MouseEvent) => { e.stopPropagation(); fileInputRef.current?.click(); }}><IconUpload size={12} /></button>
                    <button className="dm-dropzone-remove" onClick={handleRemoveFile}><IconX size={13} /></button>
                  </div>
                </div>
              ) : (
                <div className="dm-dropzone-empty">
                  <div className="dm-dropzone-upload-icon"><IconUpload size={22} /></div>
                  <p className="dm-dropzone-text">Arraste um arquivo aqui ou <span className="dm-dropzone-link">clique para selecionar</span></p>
                  <p className="dm-dropzone-sub">PDF, DOCX, XLSX — até 50 MB</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" style={{ display: "none" }} accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0])} />
          </div>
        </div>
        <div className="dm-modal-footer">
          <button className="dm-modal-cancel" onClick={onClose}>Cancelar</button>
          <button className={`dm-modal-confirm${!versionNumber.trim() ? " dm-modal-confirm-disabled" : ""}`} onClick={handleSubmit} disabled={!versionNumber.trim()}>
            {isEdit ? <IconCheck size={14} /> : <IconPlus size={14} />}
            {isEdit ? "Salvar alterações" : "Criar versão"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── DeleteVersionModal ────────────────────────────────────────────────────────

interface DeleteVersionModalProps { version: Version; onConfirm: () => void; onClose: () => void; }

const DeleteVersionModal: React.FC<DeleteVersionModalProps> = ({ version, onConfirm, onClose }) => {
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>): void => { if (e.target === e.currentTarget) onClose(); };
  return (
    <div className="dm-modal-backdrop" onClick={handleBackdropClick}>
      <div className="dm-modal dm-modal-delete">
        <div className="dm-modal-header dm-modal-header-danger">
          <div className="dm-modal-header-left">
            <div className="dm-modal-icon dm-modal-icon-danger"><IconAlertTriangle size={18} /></div>
            <div>
              <h3 className="dm-modal-title">Excluir versão</h3>
              <p className="dm-modal-subtitle">Esta ação não pode ser desfeita</p>
            </div>
          </div>
          <button className="dm-modal-close" onClick={onClose}><IconX size={16} /></button>
        </div>
        <div className="dm-modal-body dm-delete-modal-body">
          <div className="dm-delete-version-preview">
            <div className="dm-delete-version-icon"><IconFileText size={18} /></div>
            <div className="dm-delete-version-info">
              <span className="dm-delete-version-label">versão {version.version}</span>
              {version.name && <span className="dm-delete-version-name">"{version.name}"</span>}
              {version.fileName && <span className="dm-delete-version-file"><IconFile size={11} />{version.fileName}</span>}
              <span className="dm-delete-version-date">{version.timelineLabel}</span>
            </div>
          </div>
          <p className="dm-delete-warning-text">Tem certeza que deseja excluir permanentemente a{" "}<strong>versão {version.version}</strong>? Todo o histórico e arquivos associados a esta versão serão removidos e não poderão ser recuperados.</p>
        </div>
        <div className="dm-modal-footer">
          <button className="dm-modal-cancel" onClick={onClose}>Cancelar</button>
          <button className="dm-modal-confirm dm-modal-confirm-danger" onClick={onConfirm}><IconTrash size={14} />Excluir versão</button>
        </div>
      </div>
    </div>
  );
};

// ── DeleteDocumentModal ───────────────────────────────────────────────────────

interface DeleteDocumentModalProps { document: Document; onConfirm: () => void; onClose: () => void; }

const DeleteDocumentModal: React.FC<DeleteDocumentModalProps> = ({ document, onConfirm, onClose }) => {
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>): void => { if (e.target === e.currentTarget) onClose(); };
  const latestVersion = getLatestVersion(document.versions);
  return (
    <div className="dm-modal-backdrop" onClick={handleBackdropClick}>
      <div className="dm-modal dm-modal-delete">
        <div className="dm-modal-header dm-modal-header-danger">
          <div className="dm-modal-header-left">
            <div className="dm-modal-icon dm-modal-icon-danger"><IconAlertTriangle size={18} /></div>
            <div>
              <h3 className="dm-modal-title">Excluir documento</h3>
              <p className="dm-modal-subtitle">Esta ação não pode ser desfeita</p>
            </div>
          </div>
          <button className="dm-modal-close" onClick={onClose}><IconX size={16} /></button>
        </div>
        <div className="dm-modal-body dm-delete-modal-body">
          <div className="dm-delete-doc-preview">
            <div className="dm-delete-doc-icon"><IconFileText size={20} /></div>
            <div className="dm-delete-doc-info">
              <span className="dm-delete-doc-title">{document.title}</span>
              <span className="dm-delete-doc-code">{document.code}</span>
              <div className="dm-delete-doc-meta">
                <span className="dm-delete-doc-versions">{document.versions.length} {document.versions.length === 1 ? "versão" : "versões"} · v{latestVersion.version} mais recente</span>
              </div>
            </div>
          </div>
          <p className="dm-delete-warning-text">Tem certeza que deseja excluir permanentemente o documento{" "}<strong>{document.title}</strong>? Todas as versões, arquivos e histórico associados serão removidos e não poderão ser recuperados.</p>
        </div>
        <div className="dm-modal-footer">
          <button className="dm-modal-cancel" onClick={onClose}>Cancelar</button>
          <button className="dm-modal-confirm dm-modal-confirm-danger" onClick={onConfirm}><IconTrash size={14} />Excluir documento</button>
        </div>
      </div>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────

const DocumentManagement: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [filterSystem, setFilterSystem] = useState<string>("all");
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [editingCardTitle, setEditingCardTitle] = useState<string>("");
  const [editingCardDepts, setEditingCardDepts] = useState<string[]>([]);
  const [editingCardSystems, setEditingCardSystems] = useState<string[]>([]);
  const cardInputRef = useRef<HTMLInputElement>(null);

  const [editingDepts, setEditingDepts] = useState<boolean>(false);
  const [editingDeptsValue, setEditingDeptsValue] = useState<string[]>([]);
  const [editingSystems, setEditingSystems] = useState<boolean>(false);
  const [editingSystemsValue, setEditingSystemsValue] = useState<string[]>([]);

  const [versionSearch, setVersionSearch] = useState<string>("");
  const [versionModal, setVersionModal] = useState<VersionModalState | null>(null);
  const [deleteVersionTarget, setDeleteVersionTarget] = useState<Version | null>(null);
  const [deleteDocumentTarget, setDeleteDocumentTarget] = useState<Document | null>(null);

  useEffect(() => {
    function handlePolicyAdded(e: Event) {
      const data = (e as CustomEvent<PolicyFormData>).detail;
      const now = new Date();
      const timeLabel = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const newDoc: Document = {
        id: Date.now(),
        title: data.file ? data.file.name.replace(/\.[^.]+$/, "") : "Novo Documento",
        code: `POL-${now.getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
        updatedLabel: "Adicionado agora",
        departments: data.departmentIds.map((id) => DEP_MAP[id] ?? id),
        systems: data.systemIds.map((id) => SYS_MAP[id] ?? id),
        versions: [{
          id: Date.now() + 1, version: "1.0",
          timelineLabel: `Hoje, ${timeLabel}`,
          isActive: true, status: "approved",
          name: "Versão inicial", fileName: data.file?.name ?? null,
        }],
        collaborators: [],
        currentEditor: null,
      };
      setDocuments((prev) => [newDoc, ...prev]);
    }
    window.addEventListener("policy:added", handlePolicyAdded);
    return () => window.removeEventListener("policy:added", handlePolicyAdded);
  }, []);

  const allDepartments = useMemo<string[]>(() => Array.from(new Set(documents.flatMap((d) => d.departments))).sort(), [documents]);
  const allSystems = useMemo<string[]>(() => Array.from(new Set(documents.flatMap((d) => d.systems))).sort(), [documents]);

  const filteredDocuments = useMemo<Document[]>(() => {
    const term = search.trim().toLowerCase();
    return documents.filter((doc) => {
      const matchesSearch = !term || doc.title.toLowerCase().includes(term) || doc.code.toLowerCase().includes(term) || doc.departments.some((d) => d.toLowerCase().includes(term)) || doc.systems.some((s) => s.toLowerCase().includes(term));
      const matchesDept = filterDept === "all" || doc.departments.includes(filterDept);
      const matchesSys = filterSystem === "all" || doc.systems.includes(filterSystem);
      return matchesSearch && matchesDept && matchesSys;
    });
  }, [documents, search, filterDept, filterSystem]);

  const selectedDocument = useMemo<Document | null>(() => documents.find((doc) => doc.id === selectedDocumentId) ?? null, [documents, selectedDocumentId]);

  const filteredVersions = useMemo<Version[]>(() => {
    if (!selectedDocument) return [];
    const term = versionSearch.trim().toLowerCase();
    if (!term) return selectedDocument.versions;
    return selectedDocument.versions.filter((v) =>
      v.version.toLowerCase().includes(term) || v.name.toLowerCase().includes(term) ||
      (v.fileName && v.fileName.toLowerCase().includes(term)) ||
      v.timelineLabel.toLowerCase().includes(term) || v.status.toLowerCase().includes(term)
    );
  }, [selectedDocument, versionSearch]);

  const handleOpenDocument = (documentId: number): void => { setSelectedDocumentId(documentId); setIsEditingTitle(false); setVersionSearch(""); };
  const handleStartEditTitle = (): void => { if (!selectedDocument) return; setEditingTitle(selectedDocument.title); setIsEditingTitle(true); setTimeout(() => titleInputRef.current?.select(), 0); };
  const handleSaveTitle = (): void => {
    const trimmed = editingTitle.trim();
    if (!trimmed || !selectedDocument) { setIsEditingTitle(false); return; }
    setDocuments((prev) => prev.map((doc) => doc.id === selectedDocument.id ? { ...doc, title: trimmed, updatedLabel: "Atualizado agora" } : doc));
    setIsEditingTitle(false);
  };
  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => { if (e.key === "Enter") handleSaveTitle(); if (e.key === "Escape") setIsEditingTitle(false); };

  const handleStartEditCard = (e: MouseEvent, doc: Document): void => { e.stopPropagation(); setEditingCardId(doc.id); setEditingCardTitle(doc.title); setEditingCardDepts([...doc.departments]); setEditingCardSystems([...doc.systems]); setTimeout(() => cardInputRef.current?.select(), 0); };
  const handleSaveCardTitle = (docId: number): void => {
    const trimmedTitle = editingCardTitle.trim();
    if (trimmedTitle) {
      setDocuments((prev) => prev.map((doc) => doc.id === docId ? { ...doc, title: trimmedTitle, departments: editingCardDepts.length > 0 ? editingCardDepts : doc.departments, systems: editingCardSystems.length > 0 ? editingCardSystems : doc.systems, updatedLabel: "Atualizado agora" } : doc));
    }
    setEditingCardId(null);
  };
  const handleCardTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>, docId: number): void => { if (e.key === "Enter") handleSaveCardTitle(docId); if (e.key === "Escape") setEditingCardId(null); };

  const handleRequestDeleteDocument = (e: MouseEvent, doc: Document): void => { e.stopPropagation(); setDeleteDocumentTarget(doc); };
  const handleConfirmDeleteDocument = (): void => {
    if (!deleteDocumentTarget) return;
    setDocuments((prev) => prev.filter((d) => d.id !== deleteDocumentTarget.id));
    setDeleteDocumentTarget(null);
    if (selectedDocumentId === deleteDocumentTarget.id) setSelectedDocumentId(null);
  };

  const handleOpenCreateModal = (): void => setVersionModal({ mode: "create" });
  const handleOpenEditModal = (e: MouseEvent, version: Version): void => { e.stopPropagation(); setVersionModal({ mode: "edit", version }); };
  const handleCloseVersionModal = (): void => setVersionModal(null);
  const handleConfirmVersionModal = ({ versionNumber, versionName, fileName, versionId }: VersionModalConfirmPayload): void => {
    if (!selectedDocument) return;
    if (versionModal?.mode === "edit" && versionId != null) {
      setDocuments((prev) => prev.map((doc) => {
        if (doc.id !== selectedDocument.id) return doc;
        return { ...doc, updatedLabel: "Atualizado agora", versions: doc.versions.map((v) => v.id === versionId ? { ...v, version: versionNumber, name: versionName, fileName } : v) };
      }));
    } else {
      setDocuments((prev) => prev.map((doc) => {
        if (doc.id !== selectedDocument.id) return doc;
        const newVersions: Version[] = [
          { id: Date.now(), version: versionNumber, name: versionName, fileName, timelineLabel: "Hoje, agora", isActive: true, status: "approved" },
          ...doc.versions.map((v) => ({ ...v, isActive: false, status: "published" as const })),
        ];
        return { ...doc, updatedLabel: "Atualizado agora", versions: newVersions };
      }));
    }
    setVersionModal(null);
  };

  const handleRequestDeleteVersion = (e: MouseEvent, version: Version): void => { e.stopPropagation(); if (!selectedDocument) return; if (selectedDocument.versions.length <= 1 || version.isActive) return; setDeleteVersionTarget(version); };
  const handleConfirmDeleteVersion = (): void => {
    if (!deleteVersionTarget || !selectedDocument) return;
    setDocuments((prev) => prev.map((doc) => doc.id === selectedDocument.id ? { ...doc, versions: doc.versions.filter((v) => v.id !== deleteVersionTarget.id) } : doc));
    setDeleteVersionTarget(null);
  };

  const handleActivateVersion = (versionId: number): void => {
    if (!selectedDocument) return;
    setDocuments((prev) => prev.map((doc) => doc.id !== selectedDocument.id ? doc : { ...doc, updatedLabel: "Atualizado agora", versions: doc.versions.map((v) => ({ ...v, isActive: v.id === versionId, status: (v.id === versionId ? "approved" : "published") as Version["status"] })) }));
  };
  const handleDeactivateVersion = (versionId: number): void => {
    if (!selectedDocument) return;
    setDocuments((prev) => prev.map((doc) => doc.id !== selectedDocument.id ? doc : { ...doc, updatedLabel: "Atualizado agora", versions: doc.versions.map((v) => v.id === versionId ? { ...v, isActive: false, status: "published" as const } : v) }));
  };

  const handleStartEditDepts = (): void => { if (!selectedDocument) return; setEditingDeptsValue([...selectedDocument.departments]); setEditingDepts(true); };
  const handleSaveDepts = (): void => {
    if (selectedDocument && editingDeptsValue.length > 0) {
      setDocuments((prev) => prev.map((doc) => doc.id === selectedDocument.id ? { ...doc, departments: editingDeptsValue, updatedLabel: "Atualizado agora" } : doc));
    }
    setEditingDepts(false);
  };
  const handleStartEditSystems = (): void => { if (!selectedDocument) return; setEditingSystemsValue([...selectedDocument.systems]); setEditingSystems(true); };
  const handleSaveSystems = (): void => {
    if (selectedDocument && editingSystemsValue.length > 0) {
      setDocuments((prev) => prev.map((doc) => doc.id === selectedDocument.id ? { ...doc, systems: editingSystemsValue, updatedLabel: "Atualizado agora" } : doc));
    }
    setEditingSystems(false);
  };

  const isVersionSearchActive = versionSearch.trim().length > 0;
  const displayedVersions = filteredVersions;

  // ── Styles ────────────────────────────────────────────────────────────────

  const styles = `
    :root {
      --dm-bg: #0b0f16;
      --dm-surface: #131924;
      --dm-border: #232a39;
      --dm-text: #f3f6fb;
      --dm-text-2: #a4adbc;
      --dm-text-3: #737d8f;
      --dm-blue: #2f5fff;
      --dm-blue-soft: rgba(47, 95, 255, 0.14);
      --dm-red: #ef4444;
      --dm-shadow: 0 14px 40px rgba(0, 0, 0, 0.28);
      --dm-radius-xl: 18px;
      --dm-radius-lg: 14px;
      --dm-radius-md: 12px;
    }

    .dm-page *, .dm-page *::before, .dm-page *::after { box-sizing: border-box; }
    .dm-page button, .dm-page input { font: inherit; }
    .dm-page button { border: 0; background: transparent; color: inherit; }
    .dm-page input { outline: none; }

    .dm-page {
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      background: transparent; overflow: hidden;
      color: var(--dm-text);
      font-family: Inter, ui-sans-serif, system-ui, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    .dm-main { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden; width: 100%; }

    .dm-main-topbar {
      height: 68px; min-height: 68px; padding: 0 24px 0 28px;
      border-bottom: 1px solid var(--dm-border);
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(11, 15, 22, 0.78); backdrop-filter: blur(10px); flex-shrink: 0;
    }

    .dm-main-title-wrap { display: flex; align-items: center; gap: 10px; }
    .dm-main-title-wrap h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.03em; color: #f6f8fc; }

    .dm-badge {
      height: 24px; padding: 0 10px; border-radius: 999px;
      display: inline-flex; align-items: center;
      background: rgba(47, 95, 255, 0.18); border: 1px solid rgba(72, 114, 255, 0.18);
      color: #7ea0ff; font-size: 11px; font-weight: 600;
    }

    .dm-content { flex: 1; min-height: 0; overflow-y: auto; padding: 22px 22px 24px; }

    .dm-content-head {
      display: flex; align-items: center; justify-content: space-between;
      gap: 18px; margin-bottom: 20px; flex-wrap: wrap;
    }

    .dm-content-head-left { display: flex; align-items: center; gap: 14px; min-width: 0; }

    .dm-section-icon {
      width: 38px; height: 38px; border-radius: 12px;
      display: inline-flex; align-items: center; justify-content: center; color: #5e86ff;
      background: radial-gradient(circle at 30% 20%, rgba(94, 134, 255, 0.2), transparent 65%), rgba(47, 95, 255, 0.08);
      border: 1px solid rgba(94, 134, 255, 0.18); flex-shrink: 0;
    }

    .dm-content-head-left h2 { margin: 0 0 3px; font-size: 26px; font-weight: 700; letter-spacing: -0.03em; color: #f5f7fb; }
    .dm-content-head-left p { margin: 0; font-size: 12px; color: var(--dm-text-2); }

    .dm-search {
      position: relative; width: 220px; height: 40px;
      border-radius: 12px; border: 1px solid var(--dm-border);
      background: linear-gradient(180deg, #121823 0%, #111722 100%);
      display: flex; align-items: center; gap: 10px;
      padding: 0 14px; color: #94a0b2;
    }
    .dm-search input { width: 100%; height: 100%; border: 0; background: transparent; color: var(--dm-text); font-size: 13px; }
    .dm-search input::placeholder { color: #7f8897; }

    .dm-content-head-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

    .dm-filter-wrap {
      position: relative; height: 40px; display: flex; align-items: center; gap: 7px;
      padding: 0 10px 0 12px; border-radius: 12px; border: 1px solid var(--dm-border);
      background: linear-gradient(180deg, #121823 0%, #111722 100%);
      color: #94a0b2; transition: border-color 0.15s ease, background 0.15s ease;
    }
    .dm-filter-select { appearance: none; border: none; background: transparent; color: var(--dm-text-2); font-size: 12.5px; font-weight: 500; cursor: pointer; padding-right: 2px; min-width: 0; max-width: 130px; }
    .dm-filter-select:focus { outline: none; }
    .dm-filter-select option { background: #131924; color: #f3f6fb; }
    .dm-select-arrow { color: #6b778c; flex-shrink: 0; pointer-events: none; }
    .dm-filter-wrap.active { border-color: rgba(72, 114, 255, 0.4); background: rgba(47, 95, 255, 0.09); color: #7ea0ff; }
    .dm-filter-wrap.active .dm-filter-select { color: #7ea0ff; }
    .dm-filter-wrap.active .dm-select-arrow { color: #7ea0ff; }

    .dm-page .dm-clear-filters-btn {
      height: 40px; padding: 0 12px; border-radius: 12px;
      border: 1px solid rgba(255, 80, 80, 0.2); background: rgba(255, 60, 60, 0.07);
      color: #f87171; font-size: 12px; font-weight: 600; cursor: pointer;
      display: inline-flex; align-items: center; gap: 6px;
      transition: background 0.15s ease, border-color 0.15s ease; white-space: nowrap;
    }
    .dm-page .dm-clear-filters-btn:hover { background: rgba(255, 60, 60, 0.13); border-color: rgba(255, 80, 80, 0.38); }

    .dm-doc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; align-items: stretch; }

    .dm-doc-card {
      border-radius: 16px; padding: 14px 16px 0;
      display: flex; flex-direction: column;
      background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0)), linear-gradient(180deg, #171d29 0%, #141a25 100%);
      border: 1px solid #232a39;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.02), 0 10px 24px rgba(0,0,0,0.18);
      transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer; gap: 0; overflow: hidden;
    }
    .dm-doc-card:hover { transform: translateY(-2px); border-color: rgba(66, 120, 255, 0.35); box-shadow: inset 0 1px 0 rgba(255,255,255,0.025), 0 14px 30px rgba(0,0,0,0.22); outline: none; }

    .dm-doc-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; }
    .dm-doc-icon-dept { display: flex; align-items: center; gap: 7px; min-width: 0; flex: 1; }
    .dm-doc-dept-label { font-size: 11px; font-weight: 600; color: #c084fc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px; }
    .dm-doc-icon { width: 30px; height: 30px; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center; color: #5e86ff; background: rgba(47, 95, 255, 0.08); border: 1px solid rgba(94, 134, 255, 0.12); flex-shrink: 0; }

    .dm-doc-card-top-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }

    .dm-page .dm-card-edit-btn {
      width: 26px; height: 26px; border-radius: 7px;
      display: inline-flex; align-items: center; justify-content: center;
      color: #6b778c; background: transparent; border: 1px solid transparent;
      cursor: pointer; opacity: 0; transition: opacity 0.15s ease, background 0.15s ease, color 0.15s ease; flex-shrink: 0;
    }
    .dm-doc-card:hover .dm-card-edit-btn { opacity: 1; }
    .dm-page .dm-card-edit-btn:hover { background: rgba(255,255,255,0.07); border-color: var(--dm-border); color: #c5cdd9; }

    .dm-doc-body { flex: 1; padding-bottom: 8px; }
    .dm-doc-body h3 { margin: 0 0 3px; font-size: 14px; font-weight: 700; color: #f6f8fd; line-height: 1.3; }
    .dm-doc-code { display: inline-block; font-size: 11px; color: #919bad; margin-bottom: 10px; }

    .dm-doc-meta-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; margin-bottom: 6px; }
    .dm-meta-chip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 7px; border-radius: 6px; font-size: 10.5px; font-weight: 500; white-space: nowrap; }
    .dm-meta-chip-sys { background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.16); color: #4ade80; }
    .dm-meta-chip-more { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #737d8f; font-weight: 700; cursor: default; letter-spacing: 0.01em; }

    .dm-doc-version-row { display: flex; align-items: center; gap: 6px; margin-top: 6px; }
    .dm-version-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 999px; font-size: 10.5px; font-weight: 600; white-space: nowrap; }
    .dm-version-pill-latest { background: rgba(47, 95, 255, 0.12); border: 1px solid rgba(72, 114, 255, 0.2); color: #7ea0ff; }
    .dm-version-pill-active { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); color: #4ade80; }
    .dm-version-pill-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: 0.7; flex-shrink: 0; }

    /* ── NOVO: área de colaboradores no card ── */
    .dm-doc-card-collab {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 0 10px; margin-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.04);
    }
    .dm-doc-card-collab-left { display: flex; align-items: center; gap: 7px; }
    .dm-doc-card-editing-label {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 10.5px; color: #4ade80; font-weight: 600;
    }
    .dm-doc-card-editing-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #4ade80;
      box-shadow: 0 0 6px rgba(74, 222, 128, 0.7);
      animation: dm-pulse-green 1.8s ease-in-out infinite;
    }
    @keyframes dm-pulse-green {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(0.75); }
    }
    .dm-doc-card-collab-count { font-size: 10.5px; color: #737d8f; }

    /* Footer do card com update label e botão de lixeira */
    .dm-doc-card-footer {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 0 10px;
    }
    .dm-doc-footer-label { font-size: 11px; color: #8e97a8; }

    .dm-page .dm-card-delete-btn {
      width: 26px; height: 26px; border-radius: 7px;
      display: inline-flex; align-items: center; justify-content: center;
      color: #6b778c; background: transparent; border: 1px solid transparent;
      cursor: pointer; opacity: 0;
      transition: opacity 0.15s ease, background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
      flex-shrink: 0;
    }
    .dm-doc-card:hover .dm-card-delete-btn { opacity: 1; }
    .dm-page .dm-card-delete-btn:hover { background: rgba(255, 60, 60, 0.12); border-color: rgba(255, 80, 80, 0.25); color: #ff6b6b; }

    .dm-empty-state {
      min-height: 180px; grid-column: 1 / -1; border-radius: 16px;
      border: 1px dashed rgba(255,255,255,0.08); background: rgba(255,255,255,0.015);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 10px; text-align: center; padding: 24px;
    }
    .dm-empty-icon { width: 38px; height: 38px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: #8ea1c8; background: rgba(255,255,255,0.03); }
    .dm-empty-state h3 { margin: 0; font-size: 16px; color: #eef2f8; }
    .dm-empty-state p { margin: 0; max-width: 380px; color: var(--dm-text-2); font-size: 13px; line-height: 1.5; }

    /* ── Avatar ── */
    .dm-avatar-wrap {
      position: relative;
      display: inline-flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .dm-avatar {
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 50%;
      border: 2px solid #141a25;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      position: relative; z-index: 1;
      flex-shrink: 0;
    }
    .dm-avatar.dm-avatar-editing {
      border-color: #4ade80;
    }
    .dm-avatar-initials {
      font-weight: 700; color: #fff;
      line-height: 1; text-shadow: 0 1px 3px rgba(0,0,0,0.4);
      user-select: none;
    }
    .dm-avatar-online-dot {
      position: absolute; bottom: 0; right: 0; z-index: 2;
      border-radius: 50%;
      background: #4ade80;
      border: 2px solid #141a25;
      box-shadow: 0 0 6px rgba(74,222,128,0.6);
    }
    .dm-avatar-editing-ring {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      border: 2px solid #4ade80;
      z-index: 0;
      animation: dm-editing-ring 1.4s ease-in-out infinite;
    }
    @keyframes dm-editing-ring {
      0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      50% { opacity: 0.3; transform: translate(-50%, -50%) scale(1.1); }
    }

    /* ── Avatar Tooltip ── */
    .dm-avatar-tooltip {
      position: absolute; bottom: calc(100% + 8px); left: 50%;
      transform: translateX(-50%);
      background: #1e2635; border: 1px solid #2e3a50;
      border-radius: 10px; padding: 8px 10px;
      min-width: 130px; max-width: 200px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.5);
      z-index: 999; pointer-events: none;
      white-space: nowrap;
    }
    .dm-avatar-tooltip::after {
      content: "";
      position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: #1e2635;
    }
    .dm-avatar-tooltip-name { font-size: 12px; font-weight: 700; color: #f4f7ff; margin-bottom: 3px; }
    .dm-avatar-tooltip-meta { display: flex; flex-direction: column; gap: 2px; }
    .dm-avatar-tooltip-role { font-size: 10.5px; color: #7ea0ff; font-weight: 600; }
    .dm-avatar-tooltip-editing {
      font-size: 10.5px; color: #4ade80; font-weight: 600;
      display: inline-flex; align-items: center; gap: 4px;
    }
    .dm-avatar-tooltip-editing::before {
      content: ""; display: inline-block;
      width: 5px; height: 5px; border-radius: 50%;
      background: #4ade80; flex-shrink: 0;
    }
    .dm-avatar-tooltip-seen { font-size: 10.5px; color: #737d8f; }

    .dm-avatar-tooltip-overflow { min-width: 140px; }
    .dm-avatar-tooltip-overflow-name { font-size: 11.5px; color: #c5cdd9; padding: 2px 0; }

    /* ── Avatar Stack ── */
    .dm-avatar-stack { display: flex; align-items: center; position: relative; }

    /* ── Avatar Overflow badge ── */
    .dm-avatar-overflow {
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 50%;
      background: #1e2738;
      border: 2px solid #141a25;
      color: #94a0b2; font-weight: 700;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      position: relative; cursor: default;
      flex-shrink: 0;
    }

    /* ── Collaborators Panel (detail view) ── */
    .dm-collab-panel {
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.02);
      overflow: hidden;
    }
    .dm-collab-panel-toggle {
      width: 100%; display: flex; align-items: center; justify-content: space-between;
      padding: 10px 14px; cursor: pointer; gap: 12px;
      transition: background 0.15s ease;
      border: none; background: transparent; color: inherit;
    }
    .dm-collab-panel-toggle:hover { background: rgba(255,255,255,0.03); }
    .dm-collab-panel-toggle-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .dm-collab-panel-toggle-left > svg { color: #6b778c; flex-shrink: 0; }
    .dm-collab-panel-toggle-left > span { font-size: 12px; font-weight: 600; color: #737d8f; letter-spacing: 0.05em; text-transform: uppercase; }
    .dm-collab-count {
      height: 18px; padding: 0 6px; border-radius: 999px;
      display: inline-flex; align-items: center;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
      color: #737d8f; font-size: 10px; font-weight: 700;
    }
    .dm-collab-editing-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 2px 8px; border-radius: 999px;
      background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.18);
      color: #4ade80; font-size: 10.5px; font-weight: 600; white-space: nowrap;
    }
    .dm-collab-editing-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: #4ade80;
      animation: dm-pulse-green 1.8s ease-in-out infinite;
    }

    .dm-collab-list { border-top: 1px solid rgba(255,255,255,0.05); padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 2px; }
    .dm-collab-list-section { font-size: 10px; font-weight: 700; color: #555e70; letter-spacing: 0.07em; text-transform: uppercase; padding: 6px 4px 4px; }
    .dm-collab-row {
      display: flex; align-items: center; gap: 10px;
      padding: 6px 8px; border-radius: 8px;
      transition: background 0.12s ease;
    }
    .dm-collab-row:hover { background: rgba(255,255,255,0.04); }
    .dm-collab-row-info { flex: 1; min-width: 0; }
    .dm-collab-row-name { font-size: 13px; font-weight: 600; color: #e2e8f4; display: flex; align-items: center; gap: 6px; }
    .dm-collab-row-editing {
      font-size: 10px; font-weight: 700; color: #4ade80;
      background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.2);
      border-radius: 4px; padding: 1px 5px;
    }
    .dm-collab-row-meta { display: flex; align-items: center; gap: 4px; margin-top: 1px; }
    .dm-collab-row-seen { font-size: 10.5px; color: #555e70; }
    .dm-collab-row-status { flex-shrink: 0; font-size: 9px; }
    .dm-collab-status-online { color: #4ade80; }
    .dm-collab-status-offline { color: #374151; }

    /* ── Version card modifier avatar ── */
    .dm-version-modifier {
      display: flex; align-items: center; gap: 6px;
      margin-top: 8px; padding-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .dm-version-modifier-label { font-size: 10.5px; color: #555e70; }
    .dm-version-modifier-name { font-size: 11px; font-weight: 600; color: #a4adbc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px; }

    /* TagInput */
    .dm-tag-input-wrap { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; min-height: 40px; border-radius: 10px; padding: 5px 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); cursor: text; transition: border-color 0.15s ease, box-shadow 0.15s ease; }
    .dm-tag-input-wrap:focus-within { border-color: rgba(88,125,255,0.6); box-shadow: 0 0 0 3px rgba(47,95,255,0.12); }
    .dm-tag-input-wrap.dm-tag-purple:focus-within { border-color: rgba(192,132,252,0.5); box-shadow: 0 0 0 3px rgba(192,132,252,0.1); }
    .dm-tag-input-wrap.dm-tag-green:focus-within { border-color: rgba(74,222,128,0.4); box-shadow: 0 0 0 3px rgba(74,222,128,0.08); }
    .dm-tag-chip { display: inline-flex; align-items: center; gap: 5px; padding: 2px 8px; border-radius: 6px; font-size: 11.5px; font-weight: 600; white-space: nowrap; user-select: none; }
    .dm-tag-input-wrap.dm-tag-purple .dm-tag-chip { background: rgba(192,132,252,0.12); border: 1px solid rgba(192,132,252,0.22); color: #c084fc; }
    .dm-tag-input-wrap.dm-tag-green .dm-tag-chip { background: rgba(34,197,94,0.1); border: 1px solid rgba(74,222,128,0.2); color: #4ade80; }
    .dm-tag-input-wrap.dm-tag-blue .dm-tag-chip { background: rgba(47,95,255,0.12); border: 1px solid rgba(79,124,255,0.22); color: #7ea0ff; }
    .dm-tag-chip-remove { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 3px; background: transparent; border: none; cursor: pointer; padding: 0; color: currentColor; opacity: 0.5; transition: opacity 0.1s ease, background 0.1s ease; }
    .dm-tag-chip-remove:hover { opacity: 1; background: rgba(255,255,255,0.12); }
    .dm-tag-input { flex: 1; min-width: 80px; border: none; background: transparent; color: var(--dm-text); font-size: 13px; padding: 0; }
    .dm-tag-input::placeholder { color: #555e70; }

    .dm-card-edit-wrap { display: flex; flex-direction: column; gap: 7px; margin-bottom: 3px; }
    .dm-card-edit-row { display: flex; flex-direction: column; gap: 5px; }
    .dm-card-edit-field-label { font-size: 10.5px; font-weight: 600; color: #6b778c; letter-spacing: 0.04em; display: flex; align-items: center; gap: 4px; margin-bottom: 2px; }
    .dm-card-edit-actions { display: flex; gap: 6px; margin-top: 2px; }
    .dm-page .dm-card-save-btn { flex: 1; height: 28px; border-radius: 7px; background: linear-gradient(180deg, #3268ff 0%, #2a5cff 100%); color: #fff; font-size: 11.5px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 5px; cursor: pointer; border: none; transition: filter 0.15s ease; }
    .dm-page .dm-card-save-btn:hover { filter: brightness(1.1); }
    .dm-page .dm-card-cancel-btn { height: 28px; padding: 0 10px; border-radius: 7px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #8c95a6; font-size: 11.5px; font-weight: 500; cursor: pointer; transition: background 0.15s ease; }
    .dm-page .dm-card-cancel-btn:hover { background: rgba(255,255,255,0.08); }
    .dm-card-title-input { width: 100%; font-size: 14px; font-weight: 700; color: #f6f8fd; background: rgba(255,255,255,0.06); border: 1px solid rgba(88,125,255,0.5); border-radius: 6px; padding: 3px 8px; outline: none; box-shadow: 0 0 0 3px rgba(47,95,255,0.12); }

    .dm-page .dm-back-btn { width: 34px; height: 34px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: #a4adbc; background: rgba(255,255,255,0.04); border: 1px solid var(--dm-border); cursor: pointer; flex-shrink: 0; transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease; }
    .dm-page .dm-back-btn:hover { background: rgba(255,255,255,0.08); color: #f3f6fb; transform: translateX(-2px); }

    .dm-detail-view { display: flex; flex-direction: column; gap: 20px; }
    .dm-detail-hero { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding-bottom: 8px; }
    .dm-detail-hero-left { display: flex; align-items: flex-start; gap: 14px; min-width: 0; }
    .dm-detail-doc-icon { width: 40px; height: 40px; border-radius: 12px; background: rgba(43, 92, 255, 0.14); color: #4f7cff; display: inline-flex; align-items: center; justify-content: center; border: 1px solid rgba(79, 124, 255, 0.16); flex-shrink: 0; }
    .dm-detail-doc-copy h2 { margin: 0; font-size: 1.6rem; line-height: 1.15; color: #f4f7ff; font-weight: 700; }
    .dm-detail-meta { margin-top: 6px; display: flex; align-items: center; gap: 8px; color: #8c95a6; font-size: 0.85rem; flex-wrap: wrap; }

    .dm-detail-info-bar { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 8px; padding: 12px 16px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; }
    .dm-info-item { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; color: #a4adbc; }
    .dm-info-item-label { display: flex; align-items: center; gap: 5px; white-space: nowrap; padding-top: 2px; flex-shrink: 0; }
    .dm-info-divider { width: 1px; height: 16px; background: rgba(255,255,255,0.08); flex-shrink: 0; margin-top: 2px; }
    .dm-info-tag-list { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
    .dm-info-tag { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; white-space: nowrap; }
    .dm-info-tag-dept { background: rgba(192,132,252,0.1); border: 1px solid rgba(192,132,252,0.2); color: #c084fc; }
    .dm-info-tag-sys { background: rgba(34,197,94,0.08); border: 1px solid rgba(74,222,128,0.16); color: #4ade80; }
    .dm-page .dm-info-tags-editable { display: inline-flex; align-items: center; gap: 5px; background: transparent; border: none; cursor: pointer; padding: 1px 6px; border-radius: 6px; transition: background 0.15s ease; }
    .dm-page .dm-info-tags-editable:hover { background: rgba(255,255,255,0.05); }
    .dm-page .dm-info-tags-editable svg { color: #6b778c; opacity: 0; transition: opacity 0.15s ease; flex-shrink: 0; margin-left: 3px; }
    .dm-page .dm-info-tags-editable:hover svg { opacity: 1; }
    .dm-info-tag-editor { display: flex; flex-direction: column; gap: 6px; min-width: 220px; max-width: 320px; }
    .dm-info-tag-editor-actions { display: flex; gap: 5px; margin-top: 2px; }
    .dm-page .dm-tag-editor-save { height: 26px; padding: 0 10px; border-radius: 7px; background: linear-gradient(180deg, #3268ff 0%, #2a5cff 100%); color: #fff; font-size: 11.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; border: none; transition: filter 0.15s ease; }
    .dm-page .dm-tag-editor-save:hover { filter: brightness(1.1); }
    .dm-page .dm-tag-editor-cancel { height: 26px; padding: 0 10px; border-radius: 7px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #8c95a6; font-size: 11.5px; font-weight: 500; cursor: pointer; transition: background 0.15s ease; }
    .dm-page .dm-tag-editor-cancel:hover { background: rgba(255,255,255,0.08); }
    .dm-tag-editor-hint { font-size: 10.5px; color: #555e70; }
    .dm-info-version-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
    .dm-info-version-latest { background: rgba(47, 95, 255, 0.14); border: 1px solid rgba(72, 114, 255, 0.22); color: #7ea0ff; }
    .dm-info-version-active { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); color: #4ade80; }
    .dm-info-version-none { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #737d8f; }

    .dm-version-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .dm-version-toolbar-left { display: flex; align-items: center; gap: 10px; }
    .dm-version-section-label { font-size: 12px; font-weight: 600; color: #737d8f; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap; }

    .dm-version-search { position: relative; height: 36px; display: flex; align-items: center; gap: 9px; padding: 0 12px; border-radius: 10px; border: 1px solid var(--dm-border); background: linear-gradient(180deg, #111722 0%, #10161f 100%); color: #94a0b2; transition: border-color 0.18s ease, box-shadow 0.18s ease; width: 200px; }
    .dm-version-search:focus-within { border-color: rgba(88,125,255,0.55); box-shadow: 0 0 0 3px rgba(47,95,255,0.10); }
    .dm-version-search input { flex: 1; border: none; background: transparent; color: var(--dm-text); font-size: 12.5px; }
    .dm-version-search input::placeholder { color: #555e70; }
    .dm-page .dm-version-search-clear { width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; color: #6b778c; cursor: pointer; transition: color 0.12s ease, background 0.12s ease; }
    .dm-page .dm-version-search-clear:hover { color: #c5cdd9; background: rgba(255,255,255,0.08); }

    .dm-version-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 36px 20px; text-align: center; border: 1px dashed rgba(255,255,255,0.07); border-radius: 16px; background: rgba(255,255,255,0.012); }
    .dm-version-empty-icon { width: 36px; height: 36px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: #7282a0; background: rgba(255,255,255,0.03); }
    .dm-version-empty h4 { margin: 0; font-size: 14px; color: #d8dff0; font-weight: 600; }
    .dm-version-empty p { margin: 0; font-size: 12px; color: #737d8f; line-height: 1.5; }
    .dm-page .dm-version-empty-reset { height: 30px; padding: 0 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #a4adbc; font-size: 12px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: background 0.15s ease; }
    .dm-page .dm-version-empty-reset:hover { background: rgba(255,255,255,0.08); }

    .dm-version-count-badge { height: 20px; padding: 0 7px; border-radius: 999px; display: inline-flex; align-items: center; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: #737d8f; font-size: 10.5px; font-weight: 600; }
    .dm-version-count-badge.filtered { background: rgba(47,95,255,0.14); border-color: rgba(72,114,255,0.22); color: #7ea0ff; }

    .dm-page .dm-version-create-btn { height: 40px; padding: 0 14px; border-radius: 10px; border: 1px solid rgba(71, 115, 255, 0.35); background: linear-gradient(180deg, #3268ff 0%, #2a5cff 100%); color: #fff; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13px; cursor: pointer; flex-shrink: 0; box-shadow: 0 8px 20px rgba(38, 92, 255, 0.22); transition: filter 0.15s ease; }
    .dm-page .dm-version-create-btn:hover { filter: brightness(1.06); }

    .dm-version-scroll { overflow-x: auto; overflow-y: hidden; padding-bottom: 6px; }
    .dm-version-scroll::-webkit-scrollbar { height: 6px; }
    .dm-version-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 999px; }
    .dm-version-timeline-wrap { position: relative; display: grid; gap: 14px; min-width: max-content; margin-bottom: 14px; padding-top: 4px; }
    .dm-version-track-line { position: absolute; left: 0; right: 0; top: 44px; height: 1px; background: rgba(255,255,255,0.08); }
    .dm-timeline-item { min-width: 220px; position: relative; z-index: 1; text-align: center; }
    .dm-timeline-date { font-size: 0.75rem; color: #9199ab; margin-bottom: 10px; white-space: nowrap; }
    .dm-timeline-marker { width: 22px; height: 22px; margin: 0 auto; border-radius: 999px; background: #191f2a; border: 1px solid rgba(255,255,255,0.08); color: #7f8898; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 0 0 5px #0d1118; }
    .dm-timeline-marker.active { background: #2b5cff; color: #fff; border-color: rgba(70,121,255,0.45); }

    .dm-version-cards { display: grid; gap: 14px; min-width: max-content; }
    .dm-version-card { min-height: 200px; background: linear-gradient(180deg, rgba(21,26,35,0.98) 0%, rgba(17,21,29,0.98) 100%); border: 1px solid rgba(255,255,255,0.06); border-radius: 18px; padding: 16px; display: flex; flex-direction: column; box-shadow: 0 12px 32px rgba(0,0,0,0.18); }
    .dm-version-card.active { border-color: rgba(65,117,255,0.24); }
    .dm-version-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
    .dm-version-card-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }

    .dm-page .dm-version-icon-btn { width: 26px; height: 26px; border-radius: 7px; display: inline-flex; align-items: center; justify-content: center; color: #6b778c; background: transparent; border: 1px solid transparent; cursor: pointer; opacity: 0; transition: opacity 0.15s ease, background 0.15s ease, color 0.15s ease; }
    .dm-version-card:hover .dm-version-icon-btn { opacity: 1; }
    .dm-page .dm-version-icon-btn:hover { background: rgba(255,255,255,0.07); border-color: var(--dm-border); color: #c5cdd9; }
    .dm-page .dm-version-icon-btn-danger:hover { background: rgba(255,60,60,0.1); border-color: rgba(255,80,80,0.2); color: #ff6b6b; }
    .dm-page .dm-version-icon-btn:disabled { opacity: 0.2 !important; cursor: not-allowed; }

    .dm-version-card-copy h3 { margin: 0; color: #f4f7ff; font-size: 1.3rem; font-weight: 700; line-height: 1.15; }
    .dm-version-card-copy h3 span { display: block; margin-top: 3px; color: #f4f7ff; font-size: 1.25rem; font-weight: 700; }
    .dm-version-card-name { font-size: 11.5px; color: #8c95a6; margin-top: 4px; font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
    .dm-version-card-file { display: inline-flex; align-items: center; gap: 5px; margin-top: 6px; font-size: 11px; color: #5e86ff; background: rgba(47,95,255,0.08); border: 1px solid rgba(79,124,255,0.14); border-radius: 5px; padding: 2px 7px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .dm-version-approved-badge { padding: 4px 8px; border-radius: 999px; background: rgba(43, 92, 255, 0.12); color: #4f7cff; font-size: 0.65rem; font-weight: 800; letter-spacing: 0.08em; white-space: nowrap; }
    .dm-version-card-spacer { flex: 1; }
    .dm-version-card-footer { margin-top: 16px; }

    .dm-page .dm-version-action { width: 100%; height: 38px; border: 0; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: filter 0.2s ease, transform 0.2s ease; }
    .dm-page .dm-version-action:hover { filter: brightness(1.05); transform: translateY(-1px); }
    .dm-page .dm-version-action-primary { background: linear-gradient(180deg, #3268ff 0%, #2a5cff 100%); color: #fff; box-shadow: 0 6px 16px rgba(38,92,255,0.18); }
    .dm-page .dm-version-action-secondary { background: rgba(255,255,255,0.04); color: #d7deed; border: 1px solid rgba(255,255,255,0.08); }

    .dm-title-display { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; border-radius: 8px; padding: 2px 4px 2px 0; transition: background 0.15s ease; }
    .dm-title-display:hover { background: rgba(255,255,255,0.04); }
    .dm-title-display h2 { margin: 0; }
    .dm-title-edit-icon { color: #6b778c; display: inline-flex; align-items: center; opacity: 0; transition: opacity 0.15s ease; flex-shrink: 0; }
    .dm-title-display:hover .dm-title-edit-icon { opacity: 1; }
    .dm-title-edit-wrap { display: flex; align-items: center; gap: 8px; }
    .dm-title-input { font-size: 1.6rem; font-weight: 700; color: #f4f7ff; background: rgba(255,255,255,0.06); border: 1px solid rgba(88,125,255,0.5); border-radius: 8px; padding: 2px 10px; outline: none; min-width: 0; width: 100%; box-shadow: 0 0 0 3px rgba(47,95,255,0.12); letter-spacing: -0.02em; }
    .dm-page .dm-title-save-btn { width: 32px; height: 32px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #3268ff 0%, #2a5cff 100%); color: #fff; border: none; cursor: pointer; flex-shrink: 0; transition: filter 0.2s ease; }
    .dm-page .dm-title-save-btn:hover { filter: brightness(1.1); }

    .dm-delete-doc-preview { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); }
    .dm-delete-doc-icon { width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.18); }
    .dm-delete-doc-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .dm-delete-doc-title { font-size: 15px; font-weight: 700; color: #f4f7ff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .dm-delete-doc-code { font-size: 11px; color: #737d8f; }
    .dm-delete-doc-meta { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
    .dm-delete-doc-versions { font-size: 11px; color: #8c95a6; }

    .dm-modal-backdrop { position: fixed; inset: 0; z-index: 1000; background: rgba(0, 0, 0, 0.65); display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); animation: dm-fade-in 0.18s ease; }
    @keyframes dm-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes dm-slide-up { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .dm-modal { width: 100%; max-width: 480px; background: #141b27; border: 1px solid #2a3347; border-radius: 20px; box-shadow: 0 32px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.04) inset; display: flex; flex-direction: column; animation: dm-slide-up 0.22s cubic-bezier(0.22, 1, 0.36, 1); overflow: hidden; }
    .dm-modal-delete { max-width: 420px; }
    .dm-modal-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 20px 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .dm-modal-header-danger { background: linear-gradient(180deg, rgba(239,68,68,0.06) 0%, transparent 100%); border-bottom-color: rgba(239,68,68,0.12); }
    .dm-modal-header-left { display: flex; align-items: flex-start; gap: 12px; }
    .dm-modal-icon { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: rgba(47, 95, 255, 0.16); color: #5e86ff; border: 1px solid rgba(79, 124, 255, 0.2); }
    .dm-modal-icon-edit { background: rgba(251, 191, 36, 0.12); color: #fbbf24; border-color: rgba(251, 191, 36, 0.24); }
    .dm-modal-icon-danger { background: rgba(239, 68, 68, 0.14); color: #f87171; border-color: rgba(239, 68, 68, 0.24); }
    .dm-modal-title { margin: 0 0 3px; font-size: 15px; font-weight: 700; color: #f4f7ff; }
    .dm-modal-subtitle { margin: 0; font-size: 12px; color: #7a8499; line-height: 1.4; }
    .dm-page .dm-modal-close { width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; color: #6b778c; border: 1px solid transparent; cursor: pointer; transition: background 0.15s ease, color 0.15s ease; margin-top: 2px; }
    .dm-page .dm-modal-close:hover { background: rgba(255,255,255,0.07); color: #c5cdd9; }
    .dm-modal-body { padding: 20px; display: flex; flex-direction: column; gap: 18px; }
    .dm-delete-modal-body { gap: 14px; }
    .dm-delete-version-preview { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); }
    .dm-delete-version-icon { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.18); }
    .dm-delete-version-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .dm-delete-version-label { font-size: 14px; font-weight: 700; color: #f4f7ff; }
    .dm-delete-version-name { font-size: 12px; color: #8c95a6; font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .dm-delete-version-file { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: #5e86ff; }
    .dm-delete-version-date { font-size: 11px; color: #737d8f; }
    .dm-delete-warning-text { margin: 0; font-size: 13px; color: #a4adbc; line-height: 1.6; }
    .dm-delete-warning-text strong { color: #e2e8f4; font-weight: 600; }
    .dm-modal-field { display: flex; flex-direction: column; gap: 6px; }
    .dm-modal-label { font-size: 12px; font-weight: 600; color: #a4adbc; letter-spacing: 0.02em; }
    .dm-modal-required { color: #ff6b6b; }
    .dm-modal-input { height: 40px; border-radius: 10px; padding: 0 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #f3f6fb; font-size: 14px; font-weight: 500; transition: border-color 0.15s ease, box-shadow 0.15s ease; }
    .dm-modal-input::placeholder { color: #555e70; }
    .dm-modal-input:focus { border-color: rgba(88,125,255,0.6); box-shadow: 0 0 0 3px rgba(47,95,255,0.12); }
    .dm-modal-hint { font-size: 11px; color: #5c6678; line-height: 1.4; }
    .dm-dropzone { border-radius: 12px; border: 1.5px dashed rgba(255,255,255,0.12); background: rgba(255,255,255,0.025); transition: border-color 0.15s ease, background 0.15s ease; cursor: pointer; overflow: hidden; }
    .dm-dropzone:not(.dm-dropzone-filled):hover { border-color: rgba(79,124,255,0.4); background: rgba(47,95,255,0.04); }
    .dm-dropzone-active { border-color: rgba(79,124,255,0.6) !important; background: rgba(47,95,255,0.08) !important; }
    .dm-dropzone-filled { cursor: default; border-style: solid; border-color: rgba(47,95,255,0.25); }
    .dm-dropzone-empty { padding: 24px 16px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
    .dm-dropzone-upload-icon { width: 44px; height: 44px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; background: rgba(47,95,255,0.1); color: #5e86ff; border: 1px solid rgba(79,124,255,0.18); }
    .dm-dropzone-text { margin: 0; font-size: 13px; color: #a4adbc; line-height: 1.4; }
    .dm-dropzone-link { color: #5e86ff; font-weight: 600; }
    .dm-dropzone-sub { margin: 0; font-size: 11px; color: #5c6678; }
    .dm-dropzone-file { padding: 12px 14px; display: flex; align-items: center; gap: 10px; }
    .dm-dropzone-file-icon { width: 36px; height: 36px; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center; background: rgba(47,95,255,0.1); color: #5e86ff; border: 1px solid rgba(79,124,255,0.16); flex-shrink: 0; }
    .dm-dropzone-file-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .dm-dropzone-file-name { font-size: 13px; font-weight: 600; color: #e2e8f4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .dm-dropzone-file-size { font-size: 11px; color: #6b778c; }
    .dm-page .dm-dropzone-remove { width: 26px; height: 26px; border-radius: 7px; display: inline-flex; align-items: center; justify-content: center; color: #6b778c; border: 1px solid transparent; cursor: pointer; flex-shrink: 0; transition: background 0.15s ease, color 0.15s ease; }
    .dm-page .dm-dropzone-remove:hover { background: rgba(255,60,60,0.1); border-color: rgba(255,80,80,0.2); color: #ff6b6b; }
    .dm-page .dm-dropzone-replace { color: #5e86ff; }
    .dm-page .dm-dropzone-replace:hover { background: rgba(47,95,255,0.12) !important; border-color: rgba(79,124,255,0.3) !important; color: #7ea0ff !important; }
    .dm-modal-footer { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.06); }
    .dm-page .dm-modal-cancel { height: 38px; padding: 0 16px; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #a4adbc; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s ease; }
    .dm-page .dm-modal-cancel:hover { background: rgba(255,255,255,0.08); }
    .dm-page .dm-modal-confirm { height: 38px; padding: 0 16px; border-radius: 10px; background: linear-gradient(180deg, #3268ff 0%, #2a5cff 100%); border: 1px solid rgba(71,115,255,0.35); color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; box-shadow: 0 6px 16px rgba(38,92,255,0.22); transition: filter 0.15s ease; }
    .dm-page .dm-modal-confirm:hover:not(:disabled) { filter: brightness(1.08); }
    .dm-page .dm-modal-confirm-disabled { opacity: 0.4; cursor: not-allowed !important; }
    .dm-page .dm-modal-confirm-danger { background: linear-gradient(180deg, #e53e3e 0%, #c53030 100%); border-color: rgba(229, 62, 62, 0.4); box-shadow: 0 6px 16px rgba(197, 48, 48, 0.28); }
    .dm-page .dm-modal-confirm-danger:hover { filter: brightness(1.08); }

    @media (max-width: 900px) {
      .dm-content-head { flex-direction: column; align-items: stretch; }
      .dm-search { flex: 1; width: auto; }
      .dm-detail-hero { flex-direction: column; align-items: stretch; }
      .dm-version-toolbar { flex-direction: column; align-items: stretch; }
      .dm-version-create-btn { width: 100%; justify-content: center; }
      .dm-version-search { width: 100%; }
    }
    @media (max-width: 600px) {
      .dm-main-topbar { padding: 0 16px; }
      .dm-main-title-wrap h1 { font-size: 18px; }
      .dm-content { padding: 16px 14px 20px; }
      .dm-content-head-left h2 { font-size: 20px; }
      .dm-doc-grid { grid-template-columns: 1fr 1fr; }
      .dm-timeline-item, .dm-version-card { min-width: 200px; }
      .dm-modal { border-radius: 16px; }
    }
  `;

  return (
    <div className="dm-page">
      <style>{styles}</style>
      <main className="dm-main dm-main-full">
        <header className="dm-main-topbar">
          <div className="dm-main-title-wrap">
            <h1>Gestão de Documentos</h1>
            <span className="dm-badge">Linha do tempo</span>
          </div>
        </header>

        <section className="dm-content">
          {!selectedDocument ? (
            <>
              <div className="dm-content-head">
                <div className="dm-content-head-left">
                  <div className="dm-section-icon"><IconFileText size={20} /></div>
                  <div>
                    <h2>Documentos</h2>
                    <p>Atualizado há 2 horas</p>
                  </div>
                </div>
                <div className="dm-content-head-right">
                  <label className="dm-search">
                    <IconSearch size={16} />
                    <input type="text" placeholder="Pesquisar..." value={search}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} />
                  </label>

                  <div className={`dm-filter-wrap${filterDept !== "all" ? " active" : ""}`}>
                    <IconBuilding size={13} />
                    <select className="dm-filter-select" value={filterDept}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterDept(e.target.value)}>
                      <option value="all">Todos os depto.</option>
                      {allDepartments.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <svg className="dm-select-arrow" width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>

                  <div className={`dm-filter-wrap${filterSystem !== "all" ? " active" : ""}`}>
                    <IconCpu size={13} />
                    <select className="dm-filter-select" value={filterSystem}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterSystem(e.target.value)}>
                      <option value="all">Todos os sistemas</option>
                      {allSystems.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <svg className="dm-select-arrow" width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>

                  {(filterDept !== "all" || filterSystem !== "all" || search) && (
                    <button className="dm-clear-filters-btn"
                      onClick={() => { setFilterDept("all"); setFilterSystem("all"); setSearch(""); }}>
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              <div className="dm-doc-grid">
                {filteredDocuments.length > 0 ? filteredDocuments.map((doc) => {
                  const latest = getLatestVersion(doc.versions);
                  const active = getActiveVersion(doc.versions);
                  const onlineCount = doc.collaborators.filter(c => c.isOnline).length;
                  return (
                    <article
                      className="dm-doc-card" key={doc.id}
                      onClick={() => editingCardId !== doc.id && handleOpenDocument(doc.id)}
                      onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
                        if (editingCardId === doc.id) return;
                        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleOpenDocument(doc.id); }
                      }}
                      role="button" tabIndex={0}
                    >
                      <div className="dm-doc-card-top">
                        <div className="dm-doc-icon-dept">
                          <div className="dm-doc-icon"><IconFileText size={18} /></div>
                          <span className="dm-doc-dept-label">
                            {doc.departments[0]}{doc.departments.length > 1 ? ` +${doc.departments.length - 1}` : ""}
                          </span>
                        </div>
                        <div className="dm-doc-card-top-actions">
                          <button className="dm-card-edit-btn" onClick={(e: MouseEvent) => handleStartEditCard(e, doc)} title="Editar documento">
                            <IconEdit size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="dm-doc-body">
                        {editingCardId === doc.id ? (
                          <div className="dm-card-edit-wrap" onClick={(e: MouseEvent) => e.stopPropagation()}>
                            <input ref={cardInputRef} className="dm-card-title-input" value={editingCardTitle}
                              placeholder="Nome do documento"
                              onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingCardTitle(e.target.value)}
                              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleCardTitleKeyDown(e, doc.id)} autoFocus />
                            <div className="dm-card-edit-row">
                              <div>
                                <div className="dm-card-edit-field-label"><IconBuilding size={11} />Departamentos</div>
                                <TagInput values={editingCardDepts} onChange={setEditingCardDepts} placeholder="Adicionar departamento..." colorClass="dm-tag-purple" />
                              </div>
                              <div>
                                <div className="dm-card-edit-field-label"><IconCpu size={11} />Sistemas</div>
                                <TagInput values={editingCardSystems} onChange={setEditingCardSystems} placeholder="Adicionar sistema..." colorClass="dm-tag-green" />
                              </div>
                            </div>
                            <div className="dm-card-edit-actions">
                              <button className="dm-card-save-btn" onClick={() => handleSaveCardTitle(doc.id)}><IconCheck size={11} /> Salvar</button>
                              <button className="dm-card-cancel-btn" onClick={() => setEditingCardId(null)}>Cancelar</button>
                            </div>
                          </div>
                        ) : <h3>{doc.title}</h3>}
                        <span className="dm-doc-code">{doc.code}</span>
                        {editingCardId !== doc.id && (
                          <div className="dm-doc-meta-tags">
                            {doc.systems.slice(0, 2).map((s) => (
                              <span key={s} className="dm-meta-chip dm-meta-chip-sys"><IconCpu size={11} />{s}</span>
                            ))}
                            {doc.systems.length > 2 && (
                              <span className="dm-meta-chip dm-meta-chip-more" title={doc.systems.slice(2).join(", ")}>
                                +{doc.systems.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="dm-doc-version-row">
                          <span className="dm-version-pill dm-version-pill-latest">
                            <span className="dm-version-pill-dot" />v{latest.version}
                          </span>
                          {active ? (
                            <span className="dm-version-pill dm-version-pill-active">
                              <IconCheck size={9} />ativa v{active.version}
                            </span>
                          ) : (
                            <span className="dm-version-pill" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#737d8f", fontSize: "10.5px", fontWeight: 600, padding: "3px 8px", borderRadius: "999px" }}>
                              sem ativa
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ── NOVO: Área de colaboradores no card ── */}
                      {doc.collaborators.length > 0 && editingCardId !== doc.id && (
                        <div className="dm-doc-card-collab" onClick={(e: MouseEvent) => e.stopPropagation()}>
                          <div className="dm-doc-card-collab-left">
                            <AvatarStack
                              collaborators={doc.collaborators}
                              maxVisible={4}
                              size={24}
                              currentEditor={doc.currentEditor ?? undefined}
                            />
                            {onlineCount > 0 && (
                              <span className="dm-doc-card-collab-count">{onlineCount} online</span>
                            )}
                          </div>
                          {doc.currentEditor && (
                            <div className="dm-doc-card-editing-label">
                              <span className="dm-doc-card-editing-dot" />
                              editando
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer com label de atualização e botão de lixeira */}
                      <div className="dm-doc-card-footer" onClick={(e: MouseEvent) => e.stopPropagation()}>
                        <span className="dm-doc-footer-label">{doc.updatedLabel}</span>
                        <button className="dm-card-delete-btn"
                          onClick={(e: MouseEvent) => handleRequestDeleteDocument(e, doc)}
                          title="Excluir documento">
                          <IconTrash size={13} />
                        </button>
                      </div>
                    </article>
                  );
                }) : (
                  <div className="dm-empty-state">
                    <div className="dm-empty-icon"><IconSearch size={20} /></div>
                    <h3>Nenhum documento encontrado</h3>
                    <p>Tente buscar por nome, código, departamento ou sistema.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="dm-detail-view">
              <div className="dm-detail-hero">
                <div className="dm-detail-hero-left">
                  <button className="dm-back-btn" onClick={() => setSelectedDocumentId(null)} aria-label="Voltar">
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                    </svg>
                  </button>
                  <div className="dm-detail-doc-icon"><IconFileText size={22} /></div>
                  <div className="dm-detail-doc-copy">
                    {isEditingTitle ? (
                      <div className="dm-title-edit-wrap">
                        <input ref={titleInputRef} className="dm-title-input" value={editingTitle}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingTitle(e.target.value)}
                          onKeyDown={handleTitleKeyDown} onBlur={handleSaveTitle} autoFocus />
                        <button className="dm-title-save-btn" onClick={handleSaveTitle}><IconCheck size={13} /></button>
                      </div>
                    ) : (
                      <div className="dm-title-display" onClick={handleStartEditTitle}>
                        <h2>{selectedDocument.title}</h2>
                        <span className="dm-title-edit-icon"><IconEdit size={14} /></span>
                      </div>
                    )}
                    <div className="dm-detail-meta">
                      <span>ID: {selectedDocument.code}</span>
                      <span>•</span>
                      <span>{selectedDocument.updatedLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              {(() => {
                const latest = getLatestVersion(selectedDocument.versions);
                const active = getActiveVersion(selectedDocument.versions);
                return (
                  <div className="dm-detail-info-bar">
                    <div className="dm-info-item">
                      <div className="dm-info-item-label"><IconBuilding size={13} /><span>Departamentos:</span></div>
                      {editingDepts ? (
                        <div className="dm-info-tag-editor">
                          <TagInput values={editingDeptsValue} onChange={setEditingDeptsValue} placeholder="Adicionar departamento..." colorClass="dm-tag-purple" />
                          <p className="dm-tag-editor-hint">Digite e pressione Enter ou vírgula para adicionar</p>
                          <div className="dm-info-tag-editor-actions">
                            <button className="dm-tag-editor-save" onClick={handleSaveDepts}><IconCheck size={11} />Salvar</button>
                            <button className="dm-tag-editor-cancel" onClick={() => setEditingDepts(false)}>Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <button className="dm-info-tags-editable" onClick={handleStartEditDepts}>
                          <div className="dm-info-tag-list">
                            {selectedDocument.departments.map((d) => (
                              <span key={d} className="dm-info-tag dm-info-tag-dept">{d}</span>
                            ))}
                          </div>
                          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="dm-info-divider" />

                    <div className="dm-info-item">
                      <div className="dm-info-item-label"><IconCpu size={13} /><span>Sistemas:</span></div>
                      {editingSystems ? (
                        <div className="dm-info-tag-editor">
                          <TagInput values={editingSystemsValue} onChange={setEditingSystemsValue} placeholder="Adicionar sistema..." colorClass="dm-tag-green" />
                          <p className="dm-tag-editor-hint">Digite e pressione Enter ou vírgula para adicionar</p>
                          <div className="dm-info-tag-editor-actions">
                            <button className="dm-tag-editor-save" onClick={handleSaveSystems}><IconCheck size={11} />Salvar</button>
                            <button className="dm-tag-editor-cancel" onClick={() => setEditingSystems(false)}>Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <button className="dm-info-tags-editable" onClick={handleStartEditSystems}>
                          <div className="dm-info-tag-list">
                            {selectedDocument.systems.map((s) => (
                              <span key={s} className="dm-info-tag dm-info-tag-sys">{s}</span>
                            ))}
                          </div>
                          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="dm-info-divider" />

                    <div className="dm-info-item">
                      <div className="dm-info-item-label"><IconTag size={13} /><span>Última versão:</span></div>
                      <span className="dm-info-version-badge dm-info-version-latest">v{latest.version}</span>
                    </div>

                    <div className="dm-info-divider" />

                    <div className="dm-info-item">
                      <div className="dm-info-item-label"><IconCheck size={13} /><span>Versão ativa:</span></div>
                      {active ? (
                        <span className="dm-info-version-badge dm-info-version-active">v{active.version}</span>
                      ) : (
                        <span className="dm-info-version-badge dm-info-version-none">Nenhuma</span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ── NOVO: Painel de colaboradores na view de detalhe ── */}
              {selectedDocument.collaborators.length > 0 && (
                <CollaboratorsPanel
                  collaborators={selectedDocument.collaborators}
                  currentEditor={selectedDocument.currentEditor}
                />
              )}

              <div className="dm-version-toolbar">
                <div className="dm-version-toolbar-left">
                  <span className="dm-version-section-label">Versões</span>
                  <span className={`dm-version-count-badge${isVersionSearchActive ? " filtered" : ""}`}>
                    {isVersionSearchActive
                      ? `${displayedVersions.length} de ${selectedDocument.versions.length}`
                      : selectedDocument.versions.length}
                  </span>

                  <label className="dm-version-search">
                    <IconSearch size={13} />
                    <input type="text" placeholder="Buscar versão..." value={versionSearch}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setVersionSearch(e.target.value)} />
                    {isVersionSearchActive && (
                      <button className="dm-version-search-clear" onClick={() => setVersionSearch("")} aria-label="Limpar busca">
                        <IconX size={11} />
                      </button>
                    )}
                  </label>
                </div>

                <button className="dm-version-create-btn" onClick={handleOpenCreateModal}>
                  <IconPlus size={16} /><span>Criar nova versão</span>
                </button>
              </div>

              {displayedVersions.length === 0 ? (
                <div className="dm-version-empty">
                  <div className="dm-version-empty-icon"><IconSearch size={18} /></div>
                  <h4>Nenhuma versão encontrada</h4>
                  <p>Não há versões que correspondam a "<strong>{versionSearch}</strong>".</p>
                  <button className="dm-version-empty-reset" onClick={() => setVersionSearch("")}>
                    <IconX size={11} /> Limpar busca
                  </button>
                </div>
              ) : (
                <div className="dm-version-scroll">
                  <div className="dm-version-timeline-wrap" style={getVersionGridStyle(displayedVersions.length)}>
                    <div className="dm-version-track-line" />
                    {displayedVersions.map((version) => (
                      <div className="dm-timeline-item" key={version.id}>
                        <div className="dm-timeline-date">{version.timelineLabel}</div>
                        <div className={`dm-timeline-marker ${version.isActive ? "active" : ""}`}>
                          {version.isActive ? <IconCheck size={12} /> : <IconFileText size={11} />}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="dm-version-cards" style={getVersionGridStyle(displayedVersions.length)}>
                    {displayedVersions.map((version) => {
                      const canDelete = !version.isActive && selectedDocument.versions.length > 1;
                      return (
                        <article className={`dm-version-card ${version.isActive ? "active" : ""}`} key={version.id}>
                          <div className="dm-version-card-head">
                            <div className="dm-version-card-copy">
                              <h3>versão {version.version}<span>Publicada</span></h3>
                              {version.name && <div className="dm-version-card-name">"{version.name}"</div>}
                              {version.fileName && (
                                <div className="dm-version-card-file"><IconFile size={11} />{version.fileName}</div>
                              )}
                            </div>

                            <div className="dm-version-card-actions">
                              {version.status === "approved" && (
                                <span className="dm-version-approved-badge">APROVADO</span>
                              )}
                              <button className="dm-version-icon-btn"
                                onClick={(e: MouseEvent) => handleOpenEditModal(e, version)} title="Editar versão">
                                <IconEdit size={12} />
                              </button>
                              <button className="dm-version-icon-btn dm-version-icon-btn-danger"
                                onClick={(e: MouseEvent) => handleRequestDeleteVersion(e, version)}
                                disabled={!canDelete}
                                title={version.isActive ? "Não é possível excluir a versão ativa" : "Excluir versão"}>
                                <IconTrash size={12} />
                              </button>
                            </div>
                          </div>

                          {/* ── NOVO: quem modificou esta versão ── */}
                          {version.modifiedBy && (
                            <div className="dm-version-modifier">
                              <CollaboratorAvatar
                                collaborator={version.modifiedBy}
                                size={20}
                                showOnlineRing={false}
                                showEditingPulse={false}
                              />
                              <span className="dm-version-modifier-label">por</span>
                              <span className="dm-version-modifier-name">{version.modifiedBy.name}</span>
                            </div>
                          )}

                          <div className="dm-version-card-spacer" />

                          <div className="dm-version-card-footer">
                            {version.isActive ? (
                              <button className="dm-version-action dm-version-action-secondary" onClick={() => handleDeactivateVersion(version.id)}>
                                <IconEyeOff size={16} /><span>Desativar versão</span>
                              </button>
                            ) : (
                              <button className="dm-version-action dm-version-action-primary" onClick={() => handleActivateVersion(version.id)}>
                                <IconPower size={16} /><span>Ativar versão</span>
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {versionModal && selectedDocument && (
        <VersionModal
          mode={versionModal.mode}
          suggestedVersion={versionModal.mode === "create" ? getNextVersionNumber(selectedDocument.versions) : undefined}
          initialData={versionModal.mode === "edit" ? versionModal.version ?? null : null}
          onConfirm={handleConfirmVersionModal}
          onClose={handleCloseVersionModal}
        />
      )}

      {deleteVersionTarget && (
        <DeleteVersionModal
          version={deleteVersionTarget}
          onConfirm={handleConfirmDeleteVersion}
          onClose={() => setDeleteVersionTarget(null)}
        />
      )}

      {deleteDocumentTarget && (
        <DeleteDocumentModal
          document={deleteDocumentTarget}
          onConfirm={handleConfirmDeleteDocument}
          onClose={() => setDeleteDocumentTarget(null)}
        />
      )}
    </div>
  );
};

export default DocumentManagement;