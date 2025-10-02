import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import * as authService from '../services/authService';

interface LoginViewProps {
  onLoginSuccess: () => void;
  onAdminLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onAdminLoginSuccess }) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (authService.isMasterPassword(code)) {
        await authService.adminLogin(code);
        onAdminLoginSuccess();
      } else {
        await authService.validateCode(code);
        onLoginSuccess();
      }
    } catch (err) {
      setError(t('login.error'));
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-300 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <svg xmlns="http://www.w.org/2000/svg" className="h-12 w-12 text-indigo-400 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <h1 className="text-3xl font-bold text-white">{t('login.title')}</h1>
            <p className="mt-2 text-indigo-300">{t('login.subtitle')}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl">
          <div className="mb-4">
            <label htmlFor="access-code" className="sr-only">{t('login.placeholder')}</label>
            <input
              id="access-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t('login.placeholder')}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            />
          </div>
          
          {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

          <button
            type="submit"
            disabled={isLoading || !code}
            className="w-full px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-500 transition-colors duration-300 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('login.loading')}
              </>
            ) : (
              t('login.button')
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
