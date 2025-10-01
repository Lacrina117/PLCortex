import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { getRecentActivity } from '../services/activityService';
import { View } from '../App';

interface DashboardViewProps {
    setView: (view: View) => void;
}

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void }> = ({ title, description, icon, onClick }) => (
    <button
        onClick={onClick}
        className="text-left w-full h-full bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1"
    >
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
        </div>
    </button>
);

export const DashboardView: React.FC<DashboardViewProps> = ({ setView }) => {
    const { t } = useTranslation();
    const recentActivity = getRecentActivity();

    const features: { key: View, title: string, description: string, icon: React.ReactNode }[] = [
        { key: 'solutions', title: t('header.solutions'), description: t('header_descriptions.solutions'), icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
        { key: 'practices', title: t('header.practices'), description: t('header_descriptions.practices'), icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
        { key: 'tools', title: t('header.tools'), description: t('header_descriptions.tools'), icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
        { key: 'commissioning', title: t('header.commissioning'), description: t('header_descriptions.commissioning'), icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { key: 'reference', title: t('header.reference'), description: t('header_descriptions.reference'), icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
        { key: 'calculator', title: t('header.calculator'), description: t('header_descriptions.calculator'), icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
    ];
    
    return (
        <div>
            <header className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight sm:text-5xl">{t('dashboard.title')}</h1>
                <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">{t('dashboard.subtitle')}</p>
            </header>

            {recentActivity.length > 0 && (
                <section className="mb-12">
                    <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4">{t('dashboard.recentActivity')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentActivity.map(viewKey => {
                            const feature = features.find(f => f.key === viewKey);
                            if (!feature) return null;
                            return <FeatureCard key={feature.key} {...feature} onClick={() => setView(feature.key)} />;
                        })}
                    </div>
                </section>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {features.map(feature => (
                    <FeatureCard key={feature.key} {...feature} onClick={() => setView(feature.key)} />
                ))}
            </div>
        </div>
    );
};