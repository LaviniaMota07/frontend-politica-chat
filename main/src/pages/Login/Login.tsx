import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, X, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLoginForm, type LoginFormData } from '../../hooks/forms/useLoginForm';
import { useRequestAccessForm } from '../../hooks/forms/useRequestAccessForm';
import { useFetch } from '../../hooks/useFetch';
import { formStyles } from '../../utils/tailwindStyles';

interface LoginResponse {
  user: {
    userId: number;
    name: string;
    email: string;
    typeUserId: number;
  };
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

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
    <main className="grid min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_10%,rgba(47,110,242,0.22),transparent_34%),linear-gradient(135deg,#07111f_0%,#050914_55%,#020617_100%)] text-slate-100 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative flex min-h-[44vh] flex-col justify-between overflow-hidden p-8 lg:min-h-screen lg:p-14" aria-label="Apresentação">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" aria-hidden="true" />
        <div className="relative flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white shadow-[0_10px_25px_rgba(47,110,242,0.35)]">
            <ShieldCheck size={18} strokeWidth={1.9} />
          </span>
          <div>
            <strong className="block text-sm font-black text-white">Assistente de Políticas</strong>
            <span className="block text-xs text-slate-400">Baseado em normas internas</span>
          </div>
        </div>
        <div className="relative mt-12 inline-flex w-fit items-center gap-2 rounded-full border border-blue-300/20 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-blue-200">
          <LockKeyhole size={15} strokeWidth={1.8} />
          Acesso seguro para colaboradores
        </div>
        <div className="relative mt-auto max-w-3xl pt-16">
          <h1 className="text-[clamp(2.6rem,6vw,5.4rem)] font-black leading-[0.95] tracking-[-0.07em] text-white">Consulte políticas internas com clareza e segurança.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Entre no ambiente adequado para acessar respostas orientadas por
            documentos, normas e processos oficiais da empresa.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 lg:p-12" aria-label="Entrar">
        <form className="w-full max-w-[440px] rounded-[32px] border border-white/10 bg-[#0b1220]/90 p-7 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl" onSubmit={handleSubmit(onSubmit)}>
          <header className="mb-8">
            <h2 className="text-3xl font-black tracking-[-0.05em] text-white">Entrar</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Acesse sua conta corporativa para continuar para o assistente.</p>
          </header>
          <label className="mb-4 flex flex-col gap-2">
            <span className="text-xs font-black uppercase tracking-[0.11em] text-slate-500">E-mail corporativo</span>
            <div className="relative">
              <input className={`${formStyles.input} pr-11`} type="email" placeholder="nome@empresa.com" {...register('email')} />
              <Mail className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} strokeWidth={1.8} />
            </div>
            {errors.email && <span className={formStyles.error}>{errors.email.message}</span>}
          </label>
          <label className="mb-5 flex flex-col gap-2">
            <span className="text-xs font-black uppercase tracking-[0.11em] text-slate-500">Senha</span>
            <div className="relative">
              <input className={`${formStyles.input} pr-11`} type="password" placeholder="Digite sua senha" {...register('password')} />
              <LockKeyhole className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} strokeWidth={1.8} />
            </div>
            {errors.password && <span className={formStyles.error}>{errors.password.message}</span>}
          </label>
          <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 text-sm font-black text-white shadow-[0_16px_34px_rgba(47,110,242,0.35)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0" disabled={loading}>
            {loading ? (
              <>
                Entrando...
                <Loader2 size={17} strokeWidth={1.9} className="animate-spin" />
              </>
            ) : (
              <>
                Entrar no assistente
                <ArrowRight size={17} strokeWidth={1.9} />
              </>
            )}
          </button>

          <div className="mt-6 flex items-center justify-between gap-4 text-xs font-bold text-blue-200">
            <button type="button" className="transition hover:text-blue-100">Esqueci minha senha</button>
            <button type="button" className="transition hover:text-blue-100" onClick={() => setIsRequestOpen(true)}>
              Solicitar Acesso
            </button>
          </div>
        </form>
      </section>

      {/* Modal Solicitar Acesso */}
      {isRequestOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md" onClick={handleCloseRequest}>
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1220] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.5)]" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-200"
              onClick={handleCloseRequest}
              aria-label="Fechar"
            >
              <X size={16} />
            </button>

            {requestSent ? (
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-5 text-center">
                <p className="font-black text-emerald-200">Solicitação enviada com sucesso!</p>
                <span className="mt-2 block text-sm text-emerald-100/80">Em breve você receberá um retorno.</span>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmitHook(onRequestSubmit)}>
                <h2 className="text-2xl font-black tracking-[-0.04em] text-white">Solicitar acesso</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Preencha os dados abaixo para enviar sua solicitação de acesso à plataforma.
                </p>

                <label className="mt-6 flex flex-col gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.11em] text-slate-500">Nome completo</span>
                  <div>
                    <input
                      className={formStyles.input}
                      type="text"
                      placeholder="Digite seu nome completo"
                      {...registerRequest('name')}
                    />
                  </div>
                  {requestErrors.name && (
                    <span className={formStyles.error}>{requestErrors.name.message}</span>
                  )}
                </label>

                <label className="mt-4 flex flex-col gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.11em] text-slate-500">E-mail corporativo</span>
                  <div className="relative">
                    <input
                      className={`${formStyles.input} pr-11`}
                      type="email"
                      placeholder="nome@empresa.com"
                      {...registerRequest('email')}
                    />
                    <Mail className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} strokeWidth={1.8} />
                  </div>
                  {requestErrors.email && (
                    <span className={formStyles.error}>{requestErrors.email.message}</span>
                  )}
                </label>

                <button type="submit" className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 text-sm font-black text-white shadow-[0_16px_34px_rgba(47,110,242,0.35)] transition hover:-translate-y-0.5 hover:brightness-110">
                  Enviar solicitação
                  <Send size={15} strokeWidth={1.9} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}