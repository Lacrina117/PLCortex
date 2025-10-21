import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { ThemeToggle } from './ThemeToggle';
import { Language, useLanguage } from '../contexts/LanguageContext';
import { View } from '../App';

interface HeaderProps {
    currentView: View;
    setView: (view: View) => void;
}

interface LanguageSelectorProps {
    isMobile?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isMobile = false }) => {
    const { language, setLanguage } = useLanguage();
    const languageOptions: { key: Language, label: string, flag: string }[] = [
        { key: 'es', label: 'Español', flag: '🇲🇽' },
        { key: 'en', label: 'English', flag: '🇺🇸' }
    ];

    const buttonBaseClasses = 'px-3 py-1.5 rounded-md text-sm transition-colors';
    const activeClasses = 'bg-indigo-600 text-white font-semibold';
    
    const inactiveDesktopClasses = 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600';
    const inactiveMobileClasses = 'bg-slate-700 hover:bg-slate-600 text-gray-300';
    
    const inactiveClasses = isMobile ? inactiveMobileClasses : inactiveDesktopClasses;

    return (
        <div className="flex space-x-2">
            {languageOptions.map(opt => (
                <button
                    key={opt.key}
                    onClick={() => setLanguage(opt.key)}
                    className={`${buttonBaseClasses} ${language === opt.key ? activeClasses : inactiveClasses}`}
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
        { key: 'practices', label: t('header.practices'), description: t('header_descriptions.practices') },
        { key: 'tools', label: t('header.tools'), description: t('header_descriptions.tools') },
        { key: 'reference', label: t('header.reference'), description: t('header_descriptions.reference') },
        { key: 'calculator', label: t('header.calculator'), description: t('header_descriptions.calculator') },
    ];

    const handleNavClick = (view: View) => {
        setView(view);
        setIsMenuOpen(false);
    };

    useEffect(() => {
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
                             <span className="ml-2 text-xl font-bold text-gray-800 dark:text-gray-200">PLCortex</span>
                        </button>
                    </div>
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        <nav className="flex space-x-1">
                            {navItems.map(item => (
                                <button key={item.key} onClick={() => handleNavClick(item.key)} className={`${baseNavClass} ${currentView === item.key ? activeNavClass : inactiveNavClass}`}>
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
                        <LanguageSelector />
                        <ThemeToggle />
                    </div>
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
            )}
             <div className={`md:hidden fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-800 z-40 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-5">
                     <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-bold">Menu</span>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                             <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <nav className="flex flex-col space-y-1">
                        {navItems.map(item => (
                            <button
                                key={item.key}
                                onClick={() => handleNavClick(item.key)}
                                className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${currentView === item.key ? 'bg-indigo-50 text-indigo-700 dark:bg-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                               <span className="block font-bold">{item.label}</span>
                               <span className="block text-sm text-gray-500 dark:text-gray-400">{item.description}</span>
                            </button>
                        ))}
                    </nav>
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                       <LanguageSelector isMobile={true}/>
                       <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
};