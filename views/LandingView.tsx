
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage, Language } from '../contexts/LanguageContext';

interface LandingViewProps {
  onEnter: () => void;
}

const LanguageSelector: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const languageOptions: { key: Language, label: string, flag: string }[] = [
        { key: 'es', label: 'Español', flag: '🇲🇽' },
        { key: 'en', label: 'English', flag: '🇺🇸' }
    ];

    return (
        <div className="flex space-x-1 bg-gray-800/50 backdrop-blur-sm p-1 rounded-lg border border-gray-700">
        {languageOptions.map(opt => (
            <button
                key={opt.key}
                onClick={() => setLanguage(opt.key)}
                className={`px-3 py-1.5 rounded-md text-sm transition-all duration-300 ${language === opt.key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 font-medium' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
            >
                {opt.flag}
            </button>
        ))}
        </div>
    );
};

export const LandingView: React.FC<LandingViewProps> = ({ onEnter }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
             <div className="flex items-center gap-3">
                 <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-sm opacity-50 rounded-full"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="relative h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                 </div>
                 <span className="text-xl font-bold tracking-tight text-white">PLCortex</span>
             </div>
             <div className="flex items-center">
                <LanguageSelector />
             </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-16 pb-24 relative z-10">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400 tracking-tight mb-6 animate-fade-in-up">
                {t('landing.heroTitle')}
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {t('landing.heroDescription')}
            </p>
            
            <button
                onClick={onEnter}
                className="group relative px-8 py-4 bg-white text-indigo-900 font-bold text-lg rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
            >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity"></span>
                {t('landing.heroCta')}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </button>
        </div>

        {/* Specialization Cards */}
        <div className="mt-24 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 hover:border-indigo-500/50 transition-colors duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gray-800 rounded-lg group-hover:bg-indigo-900/50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400 group-hover:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-indigo-200 transition-colors">{t('landing.plcTitle')}</h3>
                </div>
                <p className="text-gray-400 mb-6 group-hover:text-gray-300 transition-colors">{t('landing.plcDescription')}</p>
                <div className="flex flex-wrap gap-2">
                    {t('landing.plcTags').split(',').map(tag => (
                        <span key={tag} className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs font-medium text-gray-300">{tag.trim()}</span>
                    ))}
                </div>
            </div>

            <div className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 hover:border-cyan-500/50 transition-colors duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gray-800 rounded-lg group-hover:bg-cyan-900/50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400 group-hover:text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-cyan-200 transition-colors">{t('landing.vfdTitle')}</h3>
                </div>
                <p className="text-gray-400 mb-6 group-hover:text-gray-300 transition-colors">{t('landing.vfdDescription')}</p>
                <div className="flex flex-wrap gap-2">
                    {t('landing.vfdTags').split(',').map(tag => (
                        <span key={tag} className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs font-medium text-gray-300">{tag.trim()}</span>
                    ))}
                </div>
            </div>
        </div>
      </main>

      <footer className="container mx-auto px-6 py-8 text-center border-t border-white/5 relative z-10">
        <p className="text-gray-500 text-sm">{t('footerText')}</p>
        <p className="mt-2 text-xs text-gray-600">{t('landing.creator')}</p>
      </footer>
    </div>
  );
};
