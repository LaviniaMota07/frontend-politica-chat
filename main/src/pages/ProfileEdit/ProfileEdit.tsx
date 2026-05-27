import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowLeft, Save, Eye, EyeOff, X } from 'lucide-react';
import { buttonStyles, formStyles, modalStyles } from '../../utils/tailwindStyles';

export default function ProfileEdit() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSaved(false);
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!currentPassword) {
      setPasswordError('Informe a senha atual.');
      return;
    }
    if (!newPassword) {
      setPasswordError('Informe a nova senha.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }
    // updatePassword(currentPassword, newPassword) — chame sua função aqui
    setPasswordSaved(true);
    setTimeout(() => handleCloseModal(), 2000);
  };

  return (
    <main className="flex h-screen w-full overflow-y-auto bg-[#071a30] px-6 py-8 text-slate-200 max-[700px]:px-4">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-7 flex items-center gap-5 max-[640px]:items-start">
          <button type="button" className={buttonStyles.secondary} onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Voltar
          </button>
          <div>
            <h1 className="text-4xl font-black tracking-[-0.06em] text-slate-50">Editar Perfil</h1>
            <p className="mt-2 text-sm text-slate-400">Gerencie suas informações pessoais e senha</p>
          </div>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSave}>
          <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200">
              <User size={36} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-lg font-black text-slate-50">{user.name}</p>
              <p className="text-sm text-slate-400">{user.role === '1' ? 'Administrador' : 'Usuário'}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0c1628] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.24)]">
            <h2 className="mb-5 text-xl font-black tracking-[-0.04em] text-slate-50">Informações Pessoais</h2>
            <div className="mb-4 flex flex-col gap-2">
              <label className={formStyles.label}>Nome</label>
              <div className="relative">
                <User size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" className={`${formStyles.input} pl-10`} value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" required />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className={formStyles.label}>E-mail</label>
              <div className="relative">
                <Mail size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" className={`${formStyles.input} pl-10`} value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0c1628] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.24)]">
            <h2 className="text-xl font-black tracking-[-0.04em] text-slate-50">Senha</h2>
            <p className="mt-2 text-sm text-slate-400">Mantenha sua conta segura com uma senha forte</p>
            <button type="button" className={`${buttonStyles.secondary} mt-5`} onClick={() => setShowPasswordModal(true)}>
              <Lock size={14} />
              Alterar senha
            </button>
          </div>

          {saved && <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200">Perfil atualizado com sucesso!</div>}

          <div className="flex justify-end gap-3">
            <button type="button" className={buttonStyles.secondary} onClick={() => navigate(-1)}>Cancelar</button>
            <button type="submit" className={buttonStyles.primary}>
              <Save size={15} />
              Salvar alterações
            </button>
          </div>
        </form>
      </div>

      {/* ── Modal: Alterar Senha ── */}
      {showPasswordModal && (
        <div className={modalStyles.backdrop} onClick={handleCloseModal}>
          <div className={modalStyles.formPanel} onClick={e => e.stopPropagation()}>
            <div className={modalStyles.header}>
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200">
                  <Lock size={18} />
                </div>
                <h2 className={modalStyles.title}>Alterar Senha</h2>
              </div>
              <button type="button" className={modalStyles.close} onClick={handleCloseModal}>
                <X size={16} />
              </button>
            </div>

            <form className={modalStyles.body} onSubmit={handleSavePassword}>
              <div className="flex flex-col gap-2">
                <label className={formStyles.label}>Senha atual</label>
                <div className="relative">
                  <Lock size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type={showCurrent ? 'text' : 'password'} className={`${formStyles.input} px-10`} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-200" onClick={() => setShowCurrent(o => !o)}>
                    {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className={formStyles.label}>Nova senha</label>
                <div className="relative">
                  <Lock size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type={showNew ? 'text' : 'password'} className={`${formStyles.input} px-10`} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-200" onClick={() => setShowNew(o => !o)}>
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className={formStyles.label}>Confirmar nova senha</label>
                <div className="relative">
                  <Lock size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type={showConfirm ? 'text' : 'password'} className={`${formStyles.input} px-10`} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-200" onClick={() => setShowConfirm(o => !o)}>
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {passwordError && <p className={formStyles.error}>{passwordError}</p>}
              {passwordSaved && <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200">Senha alterada com sucesso!</div>}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                <button type="button" className={buttonStyles.secondary} onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className={buttonStyles.primary} disabled={passwordSaved}>
                  <Save size={15} />
                  Salvar senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}