import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a2332',
            color: '#f5f7fb',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '0.9rem',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#1a2332' },
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: '#1a2332' },
          },
        }}
      />
    </AuthProvider>
  </BrowserRouter>
);