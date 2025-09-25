import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { ThemeToggle } from './ThemeToggle';
import { Language, useLanguage } from '../contexts/LanguageContext';
import { View } from '../App';

interface HeaderProps {
    currentView: View;
    setView: (view: View) => void;
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
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${language === opt.key ? 'bg-indigo-600 text-white font-semibold' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                    {opt.flag}
                </button>
            ))}
        </div>
    );
};

export const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems: { key: View, label: string, description: string }[] = [
        { key: 'solutions', label: t('header.solutions'), description: t('header_descriptions.solutions') },
        { key: 'simulator', label: t('header.simulator'), description: t('header_descriptions.simulator') },
        { key: 'practices', label: t('header.practices'), description: t('header_descriptions.practices') },
        { key: 'tools', label: t('header.tools'), description: t('header_descriptions.tools') },
        { key: 'wiring', label: t('header.wiring'), description: t('header_descriptions.wiring') },
        { key: 'commissioning', label: t('header.commissioning'), description: t('header_descriptions.commissioning') },
        { key: 'reference', label: t('header.reference'), description: t('header_descriptions.reference') },
    ];

    const handleNavClick = (view: View) => {
        setView(view);
        setIsMenuOpen(false);
    };

    useEffect(() => {
        // Prevent body scroll when mobile menu is open
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isMenuOpen]);


    const baseNavClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out";
    const activeNavClass = "bg-indigo-600 text-white shadow-sm";
    const inactiveNavClass = "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40 transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button onClick={() => setView('dashboard')} className="flex-shrink-0 flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-indigo-500 rounded-md">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                            <span className="ml-3 text-xl font-bold text-gray-800 dark:text-gray-200">PLCortex</span>
                        </button>
                        {currentView !== 'dashboard' && (
                            <nav className="hidden md:flex items-center ml-10 space-x-4">
                                {navItems.map(item => (
                                    <button
                                        key={item.key}
                                        onClick={() => handleNavClick(item.key)}
                                        className={`${baseNavClass} ${currentView === item.key ? activeNavClass : inactiveNavClass}`}
                                        title={item.description}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-4">
                            <LanguageSelector />
                            <ThemeToggle />
                        </div>
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {isMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex flex-col">
                    <div className="flex justify-end p-4">
                         <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-md text-gray-300 hover:bg-gray-700">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                             </svg>
                        </button>
                    </div>
                    <div className="flex flex-col items-center justify-center flex-grow space-y-8 px-4">
                        <LanguageSelector />
                        <ThemeToggle />
                    </div>
                    <div className="text-center pb-8">
                        <p className="text-xs text-gray-500">Ing. Jesús Jiménez</p>
                        <p className="text-xs text-gray-500">jesusjimenez117@outlook.com</p>
                        <p className="text-xs text-gray-500">+52 6863542736</p>
                    </div>
                </div>
            )}
        </header>
    );
};