import React, { useState } from 'react';
import { Header } from './components/Header';
import { LandingView } from './views/LandingView';
import { SolutionsView } from './views/SolutionsView';
import { PracticesView } from './views/PracticesView';
// FIX: Corrected import paths for views that were not modules. These components will now be created and export valid components.
import { ToolsView } from './views/ToolsView';
import { CommissioningView } from './views/CommissioningView';
import { ReferenceView } from './views/ReferenceView';
import { CalculatorView } from './views/CalculatorView';
import { Watermark } from './components/Watermark';
// FIX: Corrected import paths for views that were not modules. These components will now be created and export valid components.
import { DashboardView } from './views/DashboardView';
import { addRecentActivity } from './services/activityService';

export type View = 'dashboard' | 'solutions' | 'practices' | 'tools' | 'commissioning' | 'reference' | 'calculator';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const handleSetView = (view: View) => {
    addRecentActivity(view);
    setCurrentView(view);
  };
  
  return (
     <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header currentView={currentView} setView={handleSetView} />
      
      {currentView === 'solutions' || currentView === 'commissioning' ? (
        <div key={currentView} className="flex-grow flex flex-col animate-fade-in-up">
          {currentView === 'solutions' && <SolutionsView />}
          {currentView === 'commissioning' && <CommissioningView />}
        </div>
      ) : (
        <main className="flex-grow overflow-y-auto">
          <div key={currentView} className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 w-full animate-fade-in-up">
            {currentView === 'dashboard' && <DashboardView setView={handleSetView} />}
            {currentView === 'practices' && <PracticesView />}
            {currentView === 'tools' && <ToolsView />}
            {currentView === 'reference' && <ReferenceView />}
            {currentView === 'calculator' && <CalculatorView />}
          </div>
        </main>
      )}
      
      <Watermark />
    </div>
  );
}


function App() {
  const [hasEntered, setHasEntered] = useState(false);

  if (hasEntered) {
    return <MainApp />;
  }
  
  return <LandingView onEnter={() => setHasEntered(true)} />;
}

export default App;