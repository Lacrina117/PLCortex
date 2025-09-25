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
        <div className="flex space-x-2">
        {languageOptions.map(opt => (
            <button
                key={opt.key}
                onClick={() => setLanguage(opt.key)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${language === opt.key ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-700 hover:bg-slate-600 text-gray-300'}`}
            >
                {opt.flag}
            </button>
        ))}
        </div>
    );
};

export const LandingView: React.FC<LandingViewProps> = ({ onEnter }) => {
  const { t } = useTranslation();

  const renderIcon = (path: string) => (
    <div className="flex-shrink-0 w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-gray-300 font-sans">
      <header className="sticky top-0 z-50 bg-slate-900/70 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
             <div className="flex items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                 </svg>
                 <h1 className="text-2xl font-bold text-white tracking-tight">PLCortex</h1>
             </div>
             <div className="flex items-center space-x-4">
                <LanguageSelector />
             </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 sm:py-24">
        {/* Hero Section */}
        <section className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tighter">
            {t('landing.heroTitle')}
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-indigo-300">
            {t('landing.heroSubtitle')}
          </p>
          <p className="mt-6 text-lg max-w-2xl mx-auto text-gray-400">
            {t('landing.heroDescription')}
          </p>
          <button
            onClick={onEnter}
            className="mt-10 px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-500 transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
          >
            {t('landing.heroCta')}
          </button>
        </section>

        {/* Specialization Section */}
        <section className="mt-24 md:mt-32">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">{t('landing.specializationTitle')}</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
              {renderIcon("M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10")}
              <h3 className="mt-6 text-2xl font-bold text-white">{t('landing.plcTitle')}</h3>
              <p className="mt-2 text-gray-400">{t('landing.plcDescription')}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {t('landing.plcTags').split(',').map(tag => <span key={tag} className="bg-indigo-500/20 text-indigo-300 text-sm font-medium px-3 py-1 rounded-full">{tag.trim()}</span>)}
              </div>
            </div>
            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
              {renderIcon("M13 10V3L4 14h7v7l9-11h-7z")}
              <h3 className="mt-6 text-2xl font-bold text-white">{t('landing.vfdTitle')}</h3>
              <p className="mt-2 text-gray-400">{t('landing.vfdDescription')}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {t('landing.vfdTags').split(',').map(tag => <span key={tag} className="bg-green-500/20 text-green-300 text-sm font-medium px-3 py-1 rounded-full">{tag.trim()}</span>)}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mt-24 md:mt-32">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white">{t('landing.howItWorksTitle')}</h2>
                <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">{t('landing.howItWorksSubtitle')}</p>
            </div>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-center">
                {[1, 2, 3, 4, 5].map(step => (
                     <div key={step} className="flex flex-col items-center">
                         <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-indigo-500 flex items-center justify-center text-2xl font-bold text-indigo-400">{step}</div>
                         <h3 className="mt-4 text-xl font-semibold text-white">{t(`landing.step${step}Title`)}</h3>
                         <p className="mt-1 text-gray-400">{t(`landing.step${step}Description`)}</p>
                     </div>
                ))}
            </div>
        </section>

        {/* Benefits Section */}
        <section className="mt-24 md:mt-32">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white">{t('landing.benefitsTitle')}</h2>
            </div>
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", key: "time" },
                    { icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2m4-4h2a2 2 0 012 2v2h-4V4z", key: "clarity" },
                    { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", key: "updated" },
                    { icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", key: "cost" },
                ].map(benefit => (
                    <div key={benefit.key} className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        {renderIcon(benefit.icon)}
                        <h3 className="mt-4 text-xl font-semibold text-white">{t(`landing.benefit${benefit.key}Title`)}</h3>
                        <p className="mt-1 text-gray-400">{t(`landing.benefit${benefit.key}Description`)}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* Final CTA */}
        <section className="mt-24 md:mt-32 text-center bg-slate-800/50 border border-slate-700 rounded-2xl p-10 md:p-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">{t('landing.finalCtaTitle')}</h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto text-gray-400">
                {t('landing.finalCtaDescription')}
            </p>
            <button
                onClick={onEnter}
                className="mt-8 px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-500 transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
            >
                {t('landing.finalCtaButton')}
            </button>
        </section>
      </main>

      <footer className="container mx-auto px-6 py-8 text-center text-gray-500">
        <p>{t('footerText')}</p>
      </footer>
    </div>
  );
};