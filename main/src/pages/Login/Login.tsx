import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, X, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLoginForm, type LoginFormData } from '../../hooks/forms/useLoginForm';
import { useRequestAccessForm, type RequestAccessFormData } from '../../hooks/forms/useRequestAccessForm';
import { useFetch } from '../../hooks/useFetch';
import './login.css';

interface LoginResponse {
  user: {
    name: string;
    email: string;
    userTypeId: '1' | '2';
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
      login({
        ...response.user,
        role: response.user.userTypeId,
      });
      navigate('/chat');
    }
  };

  const onRequestSubmit = (_data: RequestAccessFormData) => {
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
    <main className="login-page">
      <section className="login-intro" aria-label="Apresentação">
        <div className="login-brand">
          <span className="login-brand-icon">
            <ShieldCheck size={18} strokeWidth={1.9} />
          </span>
          <div>
            <strong>Assistente de Políticas</strong>
            <span>Baseado em normas internas</span>
          </div>
        </div>
        <div className="login-pill">
          <LockKeyhole size={15} strokeWidth={1.8} />
          Acesso seguro para colaboradores
        </div>
        <div className="login-copy">
          <h1>Consulte políticas internas com clareza e segurança.</h1>
          <p>
            Entre no ambiente adequado para acessar respostas orientadas por
            documentos, normas e processos oficiais da empresa.
          </p>
        </div>
      </section>

      <section className="login-panel" aria-label="Entrar">
        <form className="login-card" onSubmit={handleSubmit(onSubmit)}>
          <header className="login-card-header">
            <h2>Entrar</h2>
            <p>Acesse sua conta corporativa para continuar para o assistente.</p>
          </header>
          <label className="login-field">
            <span>E-mail corporativo</span>
            <div className="login-input-shell">
              <input type="email" placeholder="nome@empresa.com" {...register('email')} />
              <Mail size={17} strokeWidth={1.8} />
            </div>
            {errors.email && <span className="login-error-message">{errors.email.message}</span>}
          </label>
          <label className="login-field">
            <span>Senha</span>
            <div className="login-input-shell">
              <input type="password" placeholder="Digite sua senha" {...register('password')} />
              <LockKeyhole size={17} strokeWidth={1.8} />
            </div>
            {errors.password && <span className="login-error-message">{errors.password.message}</span>}
          </label>
          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? (
              <>
                Entrando...
                <Loader2 size={17} strokeWidth={1.9} className="login-spinner" />
              </>
            ) : (
              <>
                Entrar no assistente
                <ArrowRight size={17} strokeWidth={1.9} />
              </>
            )}
          </button>

          <div className="login-footer-links">
            <button type="button" className="login-link">Esqueci minha senha</button>
            <button type="button" className="login-link" onClick={() => setIsRequestOpen(true)}>
              Solicitar Acesso
            </button>
          </div>
        </form>
      </section>

      {/* Modal Solicitar Acesso */}
      {isRequestOpen && (
        <div className="login-modal-backdrop" onClick={handleCloseRequest}>
          <div className="login-modal" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="login-modal-close"
              onClick={handleCloseRequest}
              aria-label="Fechar"
            >
              <X size={16} />
            </button>

            {requestSent ? (
              <div className="login-modal-success">
                <p>Solicitação enviada com sucesso!</p>
                <span>Em breve você receberá um retorno.</span>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmitHook(onRequestSubmit)}>
                <h2 className="login-modal-title">Solicitar acesso</h2>
                <p className="login-modal-desc">
                  Preencha os dados abaixo para enviar sua solicitação de acesso à plataforma.
                </p>

                <label className="login-field">
                  <span>Nome completo</span>
                  <div className="login-input-shell">
                    <input
                      type="text"
                      placeholder="Digite seu nome completo"
                      {...registerRequest('name')}
                    />
                  </div>
                  {requestErrors.name && (
                    <span className="login-error-message">{requestErrors.name.message}</span>
                  )}
                </label>

                <label className="login-field" style={{ marginTop: '14px' }}>
                  <span>E-mail corporativo</span>
                  <div className="login-input-shell">
                    <input
                      type="email"
                      placeholder="nome@empresa.com"
                      {...registerRequest('email')}
                    />
                    <Mail size={17} strokeWidth={1.8} />
                  </div>
                  {requestErrors.email && (
                    <span className="login-error-message">{requestErrors.email.message}</span>
                  )}
                </label>

                <button type="submit" className="login-submit" style={{ marginTop: '22px' }}>
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