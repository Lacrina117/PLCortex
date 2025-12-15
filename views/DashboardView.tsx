
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { getRecentActivity } from '../services/activityService';
import { getUserGroup } from '../services/authService';
import { View } from '../App';

interface DashboardViewProps {
    setView: (view: View) => void;
}

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void; accentColor: string }> = ({ title, description, icon, onClick, accentColor }) => (
    <button
        onClick={onClick}
        className="group relative text-left w-full h-full bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-xl hover:border-transparent transition-all duration-300 overflow-hidden"
    >
        <div className={`absolute inset-0 border-2 border-transparent rounded-2xl group-hover:border-${accentColor}-500/20 transition-colors duration-300 pointer-events-none`}></div>
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${accentColor}-500/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:bg-${accentColor}-500/10 transition-colors duration-300`}></div>
        
        <div className="relative flex flex-col h-full">
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300 bg-${accentColor}-100 dark:bg-${accentColor}-900/30 text-${accentColor}-600 dark:text-${accentColor}-400`}>
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
            </div>
            <div className="mt-auto pt-4 flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                Open Tool 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
    </button>
);

export const DashboardView: React.FC<DashboardViewProps> = ({ setView }) => {
    const { t } = useTranslation();
    const recentActivity = getRecentActivity();
    
    // Check user group
    const userGroup = getUserGroup();
    const isEnterprise = userGroup !== 'Individual';

    const features: { key: View, title: string, description: string, icon: React.ReactNode, accentColor: string }[] = [
        { key: 'solutions', title: t('header.solutions'), description: t('header_descriptions.solutions'), accentColor: 'indigo', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
        // Only include shiftLog if enterprise user
        ...(isEnterprise ? [{ key: 'shiftLog' as View, title: t('header.shiftLog'), description: t('header_descriptions.shiftLog'), accentColor: 'purple', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> }] : []),
        { key: 'practices', title: t('header.practices'), description: t('header_descriptions.practices'), accentColor: 'emerald', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
        { key: 'tools', title: t('header.tools'), description: t('header_descriptions.tools'), accentColor: 'cyan', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
        { key: 'reference', title: t('header.reference'), description: t('header_descriptions.reference'), accentColor: 'orange', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
        { key: 'calculator', title: t('header.calculator'), description: t('header_descriptions.calculator'), accentColor: 'pink', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
    ];
    
    // Filter recent activity to ensure restricted items don't appear
    const visibleRecentActivity = recentActivity.filter(viewKey => viewKey !== 'shiftLog' || isEnterprise);

    return (
        <div className="max-w-7xl mx-auto">
            <header className="text-center mb-16 animate-fade-in">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-5xl mb-4">
                    {t('dashboard.title')}
                </h1>
                <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                    {t('dashboard.subtitle')}
                </p>
            </header>

            {visibleRecentActivity.length > 0 && (
                <section className="mb-16 animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="h-8 w-1 bg-indigo-500 rounded-full"></div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.recentActivity')}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleRecentActivity.map(viewKey => {
                            const feature = features.find(f => f.key === viewKey);
                            if (!feature) return null;
                            return <FeatureCard key={feature.key} {...feature} onClick={() => setView(feature.key)} />;
                        })}
                    </div>
                </section>
            )}

            <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {features.map(feature => (
                        <FeatureCard key={feature.key} {...feature} onClick={() => setView(feature.key)} />
                    ))}
                </div>
            </section>
        </div>
    );
};
