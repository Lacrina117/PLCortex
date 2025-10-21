import React, { useState, useEffect } from 'react';

// Import services
import { addRecentActivity } from './services/activityService';
import * as authService from './services/authService';

// Import components and views
import { Header } from './components/Header';
import { LandingView } from './views/LandingView';
import { LoginView } from './views/LoginView';
import { AdminView } from './views/AdminView';
import { DashboardView } from './views/DashboardView';
import { SolutionsView } from './views/SolutionsView';
import { PracticesView } from './views/PracticesView';
import { ToolsView } from './views/ToolsView';
import { ReferenceView } from './views/ReferenceView';
import { CalculatorView } from './views/CalculatorView';

// FIX: Define and export the `View` type. This fixes errors in Header.tsx,
// DashboardView.tsx, and activityService.ts which were unable to import it.
export type View =
  | 'dashboard'
  | 'solutions'
  | 'practices'
  | 'tools'
  | 'reference'
  | 'calculator';

type AppState = 'landing' | 'login' | 'app' | 'admin';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('landing');
    const [currentView, setCurrentView] = useState<View>('dashboard');

    useEffect(() => {
        // Simple session check for demo purposes
        if (sessionStorage.getItem('admin_token')) {
            setAppState('admin');
        }
    }, []);

    const handleSetView = (view: View) => {
        setCurrentView(view);
        addRecentActivity(view);
    };

    const renderCurrentView = () => {
        switch (currentView) {
            case 'solutions':
                return <SolutionsView />;
            case 'practices':
                return <PracticesView />;
            case 'tools':
                return <ToolsView />;
            case 'reference':
                return <ReferenceView />;
            case 'calculator':
                return <CalculatorView />;
            case 'dashboard':
            default:
                return <DashboardView setView={handleSetView} />;
        }
    };

    const handleLogout = () => {
        authService.adminLogout();
        setAppState('landing');
    };

    switch (appState) {
        case 'landing':
            return <LandingView onEnter={() => setAppState('login')} />;
        case 'login':
            return (
                <LoginView
                    onLoginSuccess={() => setAppState('app')}
                    onAdminLoginSuccess={() => setAppState('admin')}
                />
            );
        case 'admin':
            return <AdminView onLogout={handleLogout} />;
        case 'app':
            const isFullBleedView = ['solutions'].includes(currentView);
            
            const mainClasses = isFullBleedView
                ? "flex-grow flex flex-col overflow-hidden"
                : "flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8";

            return (
                <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                    <Header currentView={currentView} setView={handleSetView} />
                    <main className={mainClasses}>
                        {renderCurrentView()}
                    </main>
                </div>
            );
    }
};

// FIX: Default export the `App` component. This resolves errors in index.tsx
// which was unable to find a default export to render.
export default App;