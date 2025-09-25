import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { View } from '../App';

interface DashboardViewProps {
  setView: (view: View) => void;
}

const DashboardIcon: React.FC<{ view: Exclude<View, 'dashboard'> }> = ({ view }) => {
    const icons: { [key in Exclude<View, 'dashboard'>]: React.ReactNode } = {
        solutions: <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
        simulator: <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M9 14.25a3 3 0 100-6 3 3 0 000 6z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
        practices: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />,
        tools: <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
        wiring: <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />,
        commissioning: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
        reference: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
    };
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-500 dark:text-indigo-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {icons[view]}
        </svg>
    );
};

export const DashboardView: React.FC<DashboardViewProps> = ({ setView }) => {
    const { t } = useTranslation();

    const tools: { key: Exclude<View, 'dashboard'>, label: string, description: string }[] = [
        { key: 'solutions', label: t('header.solutions'), description: t('header_descriptions.solutions') },
        { key: 'simulator', label: t('header.simulator'), description: t('header_descriptions.simulator') },
        { key: 'practices', label: t('header.practices'), description: t('header_descriptions.practices') },
        { key: 'tools', label: t('header.tools'), description: t('header_descriptions.tools') },
        { key: 'wiring', label: t('header.wiring'), description: t('header_descriptions.wiring') },
        { key: 'commissioning', label: t('header.commissioning'), description: t('header_descriptions.commissioning') },
        { key: 'reference', label: t('header.reference'), description: t('header_descriptions.reference') },
    ];

    return (
        <div className="w-full">
            <header className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight sm:text-5xl">{t('dashboard.title')}</h1>
                <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">{t('dashboard.subtitle')}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tools.map((tool) => (
                    <button
                        key={tool.key}
                        onClick={() => setView(tool.key)}
                        className="text-left bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl hover:border-indigo-500/50 dark:hover:border-indigo-500/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                    >
                        <DashboardIcon view={tool.key} />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{tool.label}</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">{tool.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};