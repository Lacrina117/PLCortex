
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { ThemeToggle } from './ThemeToggle';
import { Language, useLanguage } from '../contexts/LanguageContext';
import { View } from '../App';

interface HeaderProps {
    currentView: View;
    setView: (view: View) => void;
    userDescription?: string | null;
    onLogout?: () => void;
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

    const buttonBaseClasses = 'px-3 py-1.5 rounded-md text-sm transition-all duration-200';
    const activeClasses = 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-500/20';
    
    const inactiveDesktopClasses = 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700';
    const inactiveMobileClasses = 'bg-slate-700 hover:bg-slate-600 text-gray-300';
    
    const inactiveClasses = isMobile ? inactiveMobileClasses : inactiveDesktopClasses;

    return (
        <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
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

export const Header: React.FC<HeaderProps> = ({ currentView, setView, userDescription, onLogout }) => {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const UserMenu: React.FC<{ description: string; onLogout: () => void }> = ({ description, onLogout }) => {
        const [isOpen, setIsOpen] = useState(false);
        const menuRef = useRef<HTMLDivElement>(null);
    
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);
    
        return (
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all bg-white dark:bg-gray-800"
                >
                    <span className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                        {description.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[120px] truncate">{description}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
    
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in z-50 border border-gray-100 dark:border-gray-700">
                        <div className="py-1">
                            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-t-xl">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">{t('header.signedInAs')}</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate mt-1">{description}</p>
                            </div>
                            <div className="border-t border-gray-100 dark:border-gray-700"></div>
                            <button
                                onClick={onLogout}
                                className="w-full text-left block px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                {t('header.logout')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const navItems: { key: View, label: string, description: string }[] = [
        { key: 'solutions', label: t('header.solutions'), description: t('header_descriptions.solutions') },
        { key: 'shiftLog', label: t('header.shiftLog'), description: t('header_descriptions.shiftLog') },
        { key: 'tools', label: t('header.tools'), description: t('header_descriptions.tools') },
        { key: 'calculator', label: t('header.calculator'), description: t('header_descriptions.calculator') },
        { key: 'reference', label: t('header.reference'), description: t('header_descriptions.reference') },
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


    const baseNavClass = "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out relative group";
    const activeNavClass = "text-indigo-600 dark:text-white bg-indigo-50 dark:bg-white/10";
    const inactiveNavClass = "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5";

    return (
        <header className="sticky top-0 z-40 w-full glass border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button onClick={() => setView('dashboard')} className="flex-shrink-0 flex items-center gap-2 group focus:outline-none">
                             <div className="relative flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/40 group-hover:scale-105 transition-transform duration-300">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                 </svg>
                             </div>
                             <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">PLCortex</span>
                        </button>
                    </div>
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        <nav className="flex space-x-1">
                            {navItems.map(item => (
                                <button key={item.key} onClick={() => handleNavClick(item.key)} className={`${baseNavClass} ${currentView === item.key ? activeNavClass : inactiveNavClass}`}>
                                    {item.label}
                                    {currentView === item.key && (
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-full transform scale-x-100 transition-transform"></span>
                                    )}
                                </button>
                            ))}
                        </nav>
                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            {userDescription && onLogout ? (
                                <UserMenu description={userDescription} onLogout={onLogout} />
                            ) : (
                                <LanguageSelector />
                            )}
                        </div>
                    </div>
                    <div className="md:hidden flex items-center gap-4">
                        <ThemeToggle />
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
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
             <div className={`md:hidden fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-40 transform transition-transform duration-300 ease-in-out shadow-2xl ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-5 flex flex-col h-full">
                     <div className="flex justify-between items-center mb-8">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">Menu</span>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                             <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <nav className="flex flex-col space-y-2 flex-grow">
                        {navItems.map(item => (
                            <button
                                key={item.key}
                                onClick={() => handleNavClick(item.key)}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${currentView === item.key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            >
                               <span className="block font-bold text-base">{item.label}</span>
                               <span className={`block text-xs mt-0.5 ${currentView === item.key ? 'text-indigo-200' : 'text-gray-400'}`}>{item.description}</span>
                            </button>
                        ))}
                    </nav>
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                        {userDescription && onLogout ? (
                             <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">{t('header.signedInAs')}</p>
                                <p className="font-bold text-gray-900 dark:text-white">{userDescription}</p>
                                <button onClick={onLogout} className="mt-3 w-full px-4 py-2 rounded-lg font-medium text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    {t('header.logout')}
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-center">
                               <LanguageSelector isMobile={true}/>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
