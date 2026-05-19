import { useState } from 'react';
import { Check, Copy, Share2, X, UserPlus } from 'lucide-react';

type SharePermission = 'read' | 'edit';

interface SharedUser {
  id: number;
  name: string;
  email: string;
  status: 'pending' | 'active';
  permission: SharePermission;
}

const mockSharedUsers: SharedUser[] = [
  { id: 1, name: 'Ana Souza', email: 'ana.souza@empresa.com', status: 'active', permission: 'read' },
  { id: 2, name: 'Carlos Oliveira', email: 'carlos.oliveira@empresa.com', status: 'pending', permission: 'edit' },
];

export function ChatHeader() {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [permission, setPermission] = useState<SharePermission>('read');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>(mockSharedUsers);

  function handleGenerateLink() {
    const shareUrl = new URL(window.location.href);
    shareUrl.searchParams.set('share', crypto.randomUUID());
    shareUrl.searchParams.set('permission', permission);
    setGeneratedLink(shareUrl.toString());
    setIsCopied(false);
  }

  async function handleCopyLink() {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
  }

  function handleAddEmail() {
    setInviteError('');
    const email = inviteEmail.trim();
    if (!email) return;
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValid) { setInviteError('E-mail inválido.'); return; }
    if (sharedUsers.some((u) => u.email === email)) {
      setInviteError('E-mail já adicionado.'); return;
    }

    const newUser: SharedUser = {
      id: Date.now(),
      name: email.split('@')[0],
      email,
      status: 'pending',
      permission,
    };

    setSharedUsers((prev) => [...prev, newUser]);
    setInviteEmail('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); handleAddEmail(); }
  }

  function handleAcceptUser(id: number) {
    setSharedUsers((prev) =>
      prev.map((u) => u.id === id ? { ...u, status: 'active' } : u)
    );
  }

  function handleRemoveUser(id: number) {
    setSharedUsers((prev) => prev.filter((u) => u.id !== id));
  }

  function handleCloseShare() {
    setIsShareOpen(false);
    setGeneratedLink('');
    setIsCopied(false);
    setInviteEmail('');
    setInviteError('');
  }

  return (
    <header className="chat-header">
      <div className="chat-header-main">
        <h1 className="chat-header-title">Assistente de Políticas</h1>
      </div>

      <div className="chat-header-actions" aria-label="Ações do chat">
        <button
          type="button"
          className="chat-icon-button"
          onClick={() => setIsShareOpen(true)}
          aria-label="Compartilhar chat"
          title="Compartilhar"
        >
          <Share2 size={16} />
        </button>
      </div>

      {isShareOpen && (
        <div className="chat-share-backdrop" role="presentation">
          <div className="chat-share-modal-wrapper">
            <section
              className="chat-share-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="chat-share-title"
            >
              <header className="chat-share-header">
                <div>
                  <h2 id="chat-share-title">Compartilhar chat</h2>
                  <p>Escolha o nível de acesso e gere um link seguro.</p>
                </div>
                <button
                  type="button"
                  className="chat-share-close"
                  onClick={handleCloseShare}
                  aria-label="Fechar compartilhamento"
                >
                  <X size={17} />
                </button>
              </header>

              <fieldset className="chat-share-permissions">
                <legend>Permissão</legend>
                <label className="chat-share-option">
                  <input
                    type="radio"
                    name="share-permission"
                    value="read"
                    checked={permission === 'read'}
                    onChange={() => setPermission('read')}
                  />
                  <span>
                    <strong>Somente leitura</strong>
                    A pessoa pode abrir e consultar a conversa.
                  </span>
                </label>
                <label className="chat-share-option">
                  <input
                    type="radio"
                    name="share-permission"
                    value="edit"
                    checked={permission === 'edit'}
                    onChange={() => setPermission('edit')}
                  />
                  <span>
                    <strong>Pode editar</strong>
                    A pessoa pode continuar e modificar a conversa.
                  </span>
                </label>
              </fieldset>

              {/* ── Adicionar por e-mail ── */}
              <div className="chat-share-invite-area">
                <span className="chat-share-invite-label">Adicionar por e-mail</span>
                <div className="chat-share-invite-row">
                  <input
                    type="email"
                    className="chat-share-invite-input"
                    placeholder="nome@empresa.com"
                    value={inviteEmail}
                    onChange={(e) => { setInviteEmail(e.target.value); setInviteError(''); }}
                    onKeyDown={handleKeyDown}
                    aria-label="E-mail para convite"
                  />
                  <button type="button" className="chat-share-invite-btn" onClick={handleAddEmail}>
                    <UserPlus size={15} />
                    Adicionar
                  </button>
                </div>
                {inviteError && <p className="chat-share-invite-error">{inviteError}</p>}
              </div>

              <div className="chat-share-link-area">
                <button type="button" className="chat-share-generate" onClick={handleGenerateLink}>
                  Gerar link
                </button>
                {generatedLink && (
                  <div className="chat-share-link-box">
                    <input type="text" value={generatedLink} readOnly aria-label="Link compartilhável" />
                    <button type="button" onClick={handleCopyLink}>
                      {isCopied ? <Check size={16} /> : <Copy size={16} />}
                      {isCopied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* ── Pessoas com acesso ── */}
            {sharedUsers.length > 0 && (
              <section className="chat-share-users-panel">
                <h3 className="chat-share-users-title">Pessoas com acesso</h3>
                <ul className="chat-share-users-list">
                  {sharedUsers.map((user) => (
                    <li key={user.id} className="chat-share-user-item">
                      <div className="chat-share-user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="chat-share-user-info">
                        <span className="chat-share-user-name">{user.name}</span>
                        <span className="chat-share-user-email">{user.email}</span>
                      </div>

                      <span
                        className="chat-share-user-status"
                        style={{
                          background: user.permission === 'edit'
                            ? 'rgba(47, 125, 246, 0.14)'
                            : 'rgba(16, 185, 129, 0.14)',
                          color: user.permission === 'edit' ? '#7eb8ff' : '#34d399',
                        }}
                      >
                        {user.permission === 'edit' ? 'Pode editar' : 'Somente leitura'}
                      </span>

                      <div className="chat-share-user-actions">
                        <button
                          type="button"
                          className="chat-share-user-btn remove"
                          onClick={() => handleRemoveUser(user.id)}
                          aria-label={`Remover ${user.name}`}
                        >
                          <X size={13} />
                          Remover
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      )}
    </header>
  );
}