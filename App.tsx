import React, { useState } from 'react';
import { Header } from './components/Header';
import { LandingView } from './views/LandingView';
import { SolutionsView } from './views/SolutionsView';
import { PracticesView } from './views/PracticesView';
import { ToolsView } from './views/ToolsView';
import { WiringView } from './views/WiringView';
import { CommissioningView } from './views/CommissioningView';
import { ReferenceView } from './views/ReferenceView';
import { LogicGeneratorView } from './views/LogicGeneratorView';
import { SimulatorView } from './views/SimulatorView';
import { Watermark } from './components/Watermark';

export type View = 'solutions' | 'practices' | 'tools' | 'wiring' | 'commissioning' | 'reference' | 'logic' | 'simulator';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('solutions');
  
  return (
     <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header currentView={currentView} setView={setCurrentView} />
      
      {currentView === 'solutions' || currentView === 'logic' || currentView === 'simulator' ? (
        <>
          {currentView === 'solutions' && <SolutionsView />}
          {currentView === 'logic' && <LogicGeneratorView />}
          {currentView === 'simulator' && <SimulatorView />}
        </>
      ) : (
        <main className="flex-grow overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 w-full">
            {currentView === 'practices' && <PracticesView />}
            {currentView === 'tools' && <ToolsView />}
            {currentView === 'wiring' && <WiringView />}
            {currentView === 'commissioning' && <CommissioningView />}
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
