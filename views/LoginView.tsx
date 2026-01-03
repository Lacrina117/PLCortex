
import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import * as authService from '../services/authService';
import { Logo } from '../components/Logo';

interface LoginViewProps {
  onLoginSuccess: (description: string) => void;
  onAdminLoginSuccess: () => void;
}

type LoginMode = 'user' | 'admin';

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onAdminLoginSuccess }) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<LoginMode>('user');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (authService.isMasterPassword(code)) {
        await authService.adminLogin(code);
        onAdminLoginSuccess();
      } else if (authService.isUserMasterPassword(code)) {
        sessionStorage.setItem('user_token', 'validated');
        const description = t('login.masterUser');
        sessionStorage.setItem('user_description', description);
        onLoginSuccess(description);
      } else if (mode === 'user') {
        const description = await authService.validateCode(code);
        onLoginSuccess(description);
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (err) {
      setError(mode === 'admin' ? 'Contraseña administrativa incorrecta' : t('login.error'));
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-300 flex items-center justify-center p-4 animate-fade-in relative">
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-10 pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-indigo-600/10 rounded-3xl border border-indigo-500/20 mb-6">
                <Logo size="lg" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">{t('login.title')}</h1>
            <p className="mt-2 text-indigo-400 font-medium">{t('login.subtitle')}</p>
        </div>
        
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
          
          {/* Admin/User Tabs */}
          <div className="flex border-b border-slate-800">
            <button 
              onClick={() => { setMode('user'); setError(null); setCode(''); }}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${mode === 'user' ? 'text-white bg-slate-800/50 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Acceso Ingeniería
            </button>
            <button 
              onClick={() => { setMode('admin'); setError(null); setCode(''); }}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${mode === 'admin' ? 'text-white bg-slate-800/50 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Administración
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="mb-6">
              <label htmlFor="access-code" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
                {mode === 'user' ? 'Código de Acceso' : 'Contraseña de Administrador'}
              </label>
              <input
                id="access-code"
                type={mode === 'user' ? 'text' : 'password'}
                value={code}
                onChange={(e) => setCode(mode === 'user' ? e.target.value.toUpperCase() : e.target.value)}
                placeholder={mode === 'user' ? t('login.placeholder') : '••••••••'}
                className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                disabled={isLoading}
                autoComplete={mode === 'admin' ? 'current-password' : 'off'}
              />
            </div>
            
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-shake">
                  <p className="text-red-400 text-sm text-center font-bold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !code}
              className="w-full px-8 py-4 bg-indigo-600 text-white font-black text-lg rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:bg-slate-800 disabled:text-gray-600 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('login.loading')}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'user' ? t('login.button') : 'Entrar al Panel'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-gray-500 text-xs">
            © {new Date().getFullYear()} PLCortex Industrial Intelligence. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};
