import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Mail, Send, ShieldCheck, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLoginForm, type LoginFormData } from '../../hooks/forms/useLoginForm';
import { useRequestAccessForm } from '../../hooks/forms/useRequestAccessForm';
import { useFetch } from '../../hooks/useFetch';
import { formStyles } from '../../utils/tailwindStyles';
import type { LoginResponse } from '../../services/authApi';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useLoginForm();
  const { post, loading } = useFetch<LoginResponse>();

  const {
    register: registerRequest,
    handleSubmit: handleRequestSubmitHook,
    reset: resetRequestForm,
    formState: { errors: requestErrors },
  } = useRequestAccessForm();

  const onSubmit = async (data: LoginFormData) => {
    const response = await post('/user/login', {
      body: { email: data.email, password: data.password },
    });

    if (response?.user) {
      const userTypeId = String(response.user.typeUserId) as '1' | '2';
      login({
        ...response.user,
        role: userTypeId,
        userTypeId,
      });
      navigate('/chat');
    }
  };

  const onRequestSubmit = () => {
    setRequestSent(true);
    setTimeout(() => {
      setIsRequestOpen(false);
      setRequestSent(false);
      resetRequestForm();
    }, 2000);
  };

  function handleCloseRequest() {
    setIsRequestOpen(false);
    setRequestSent(false);
    resetRequestForm();
  }

  return (
    <main className="flex min-h-screen bg-[var(--bg-base)]">
      {/* Left column — institutional panel */}
      <aside className="hidden w-[420px] shrink-0 flex-col justify-between bg-[var(--sidebar-bg)] p-12 lg:flex">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--text-inverse)]">
            <ShieldCheck size={20} strokeWidth={1.8} />
          </span>
          <span className="font-[var(--heading)] text-sm font-extrabold tracking-[-0.025em] text-[var(--text-inverse)]">
            Assistente de Políticas
          </span>
        </div>

        <div>
          <h1 className="font-[var(--heading)] text-[2.2rem] font-extrabold leading-[1.15] tracking-[-0.045em] text-[var(--text-inverse)]">
            Consulte normas.<br />Entenda processos.<br />Decida com confiança.
          </h1>
          <ul className="mt-8 flex flex-col gap-3">
            {[
              'Acesso às políticas da empresa em segundos',
              'Respostas com referência direta aos documentos',
              'Interface simples, sem necessidade de treinamento',
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 text-sm leading-6 text-[var(--text-inverse)]/68">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-[var(--text-inverse)]/30">
          © {new Date().getFullYear()} AI Observatory
        </p>
      </aside>

      {/* Right column — login card */}
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <section className="w-full max-w-[420px] animate-fade-slide-up" aria-label="Entrar">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--text-inverse)]">
              <ShieldCheck size={18} strokeWidth={1.8} />
            </span>
            <span className="font-[var(--heading)] text-sm font-extrabold tracking-[-0.025em] text-[var(--text-primary)]">
              Assistente de Políticas
            </span>
          </div>

          <div className="rounded-[20px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-8 shadow-[0_18px_50px_rgba(31,29,25,0.1)]">
            <h2 className="font-[var(--heading)] text-[1.65rem] font-extrabold tracking-[-0.045em] text-[var(--text-primary)]">
              Acesse as políticas da sua empresa.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Consulte normas, procedimentos e documentos internos em uma conversa simples.
            </p>

            <form className="mt-7 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">E-mail corporativo</span>
                <div className="relative">
                  <input
                    className={`${formStyles.input} pr-11`}
                    type="email"
                    placeholder="nome@empresa.com"
                    {...register('email')}
                  />
                  <Mail className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} strokeWidth={1.8} />
                </div>
                {errors.email && <span className={formStyles.error}>{errors.email.message}</span>}
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">Senha</span>
                <div className="relative">
                  <input
                    className={`${formStyles.input} pr-12`}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
                  </button>
                </div>
                {errors.password && <span className={formStyles.error}>{errors.password.message}</span>}
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] text-sm font-bold text-[var(--text-inverse)] shadow-[0_10px_24px_rgba(168,101,53,0.18)] transition duration-200 hover:-translate-y-px hover:bg-[var(--accent-strong)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>Entrando… <Loader2 size={16} strokeWidth={1.9} className="animate-spin" /></>
                ) : (
                  <>Entrar <ArrowRight size={16} strokeWidth={2} /></>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-[var(--text-muted)]">
              Não tem acesso?{' '}
              <button
                type="button"
                className="font-bold text-[var(--accent-strong)] underline-offset-4 transition hover:underline"
                onClick={() => setIsRequestOpen(true)}
              >
                Solicitar acesso
              </button>
            </p>
          </div>
        </section>
      </div>

      {/* Request access modal */}
      {isRequestOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(31,29,25,0.52)] p-4"
          onClick={handleCloseRequest}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-[22px] border border-[var(--border-neutral)] border-t-[3px] border-t-[var(--accent)] bg-[var(--bg-elevated)] p-7 shadow-[0_28px_80px_rgba(31,29,25,0.24)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[var(--text-muted)] transition hover:border-[var(--border-neutral)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]"
              onClick={handleCloseRequest}
              aria-label="Fechar"
            >
              <X size={15} />
            </button>

            {requestSent ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                <p className="font-bold text-emerald-800">Solicitação enviada com sucesso!</p>
                <span className="mt-2 block text-sm text-emerald-700">Em breve você receberá um retorno.</span>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmitHook(onRequestSubmit)}>
                <h2 className="font-[var(--heading)] text-2xl font-extrabold tracking-[-0.04em] text-[var(--text-primary)]">
                  Solicitar acesso
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Preencha os dados abaixo para enviar sua solicitação de acesso à plataforma.
                </p>

                <label className="mt-6 flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">Nome completo</span>
                  <input
                    className={formStyles.input}
                    type="text"
                    placeholder="Digite seu nome completo"
                    {...registerRequest('name')}
                  />
                  {requestErrors.name && (
                    <span className={formStyles.error}>{requestErrors.name.message}</span>
                  )}
                </label>

                <label className="mt-4 flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">E-mail corporativo</span>
                  <div className="relative">
                    <input
                      className={`${formStyles.input} pr-11`}
                      type="email"
                      placeholder="nome@empresa.com"
                      {...registerRequest('email')}
                    />
                    <Mail className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} strokeWidth={1.8} />
                  </div>
                  {requestErrors.email && (
                    <span className={formStyles.error}>{requestErrors.email.message}</span>
                  )}
                </label>

                <button
                  type="submit"
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] text-sm font-bold text-[var(--text-inverse)] shadow-[0_10px_24px_rgba(168,101,53,0.18)] transition hover:-translate-y-px hover:bg-[var(--accent-strong)]"
                >
                  Enviar solicitação
                  <Send size={14} strokeWidth={1.9} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
