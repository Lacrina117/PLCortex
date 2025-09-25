import React, { useState } from 'react';
import { Header } from './components/Header';
import { LandingView } from './views/LandingView';
import { SolutionsView } from './views/SolutionsView';
import { PracticesView } from './views/PracticesView';
import { ToolsView } from './views/ToolsView';
import { WiringView } from './views/WiringView';
import { CommissioningView } from './views/CommissioningView';
import { ReferenceView } from './views/ReferenceView';
import { SimulatorView } from './views/SimulatorView';
import { Watermark } from './components/Watermark';
import { DashboardView } from './views/DashboardView';

export type View = 'dashboard' | 'solutions' | 'practices' | 'tools' | 'wiring' | 'commissioning' | 'reference' | 'simulator';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  return (
     <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header currentView={currentView} setView={setCurrentView} />
      
      {currentView === 'solutions' || currentView === 'simulator' || currentView === 'commissioning' ? (
        <>
          {currentView === 'solutions' && <SolutionsView />}
          {currentView === 'simulator' && <SimulatorView />}
          {currentView === 'commissioning' && <CommissioningView />}
        </>
      ) : (
        <main className="flex-grow overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 w-full">
            {currentView === 'dashboard' && <DashboardView setView={setCurrentView} />}
            {currentView === 'practices' && <PracticesView />}
            {currentView === 'tools' && <ToolsView />}
            {currentView === 'wiring' && <WiringView />}
            {currentView === 'reference' && <ReferenceView />}
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