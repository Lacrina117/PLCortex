import React from 'react';

interface BrandLogoProps {
  brand?: string;
  topic: 'PLC' | 'VFD';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ brand = 'General', topic, className = 'h-8 w-8' }) => {
  const baseClasses = `flex-shrink-0 rounded-md flex items-center justify-center ${className}`;

  const renderLogo = () => {
    switch (brand) {
      case 'Siemens':
        return (
          <div className={`${baseClasses} p-1`}>
            <svg viewBox="0 0 128 35" fill="currentColor" className="text-[#009999] dark:text-white">
              <path d="M12.87 34.64h10.95c11.3 0 16.2-6.53 16.2-16.7S35.12 1.25 23.82 1.25H12.87v33.39zm8.56-27.15c4.13 0 5.4 2.89 5.4 7.91 0 5.02-1.27 7.91-5.4 7.91h-2.32V7.49h2.32zM40.94 34.64h6.24V1.25h-6.24v33.39zM55.84 34.64h6.24V14.16L73.1 34.64h7.52L69.6 12.89l10.32-11.64h-7.2L64.1 9.29l-1.9-8.04h-6.36v33.39zM83.42 34.64h17.15V28.4H90.1V19.7h8.92v-5.83H90.1V7.49h10.21V1.25H83.42v33.39zM103.11 34.64h6.24V1.25h-6.24v33.39zM111.45 34.64h7.62l8.3-15.65v15.65h6.24V1.25h-7.28l-8.62 16.28V1.25h-6.56v33.39z"></path>
            </svg>
          </div>
        );
      case 'Allen-Bradley':
        return (
          <div className={`${baseClasses} bg-[#E41C00] text-white p-1`}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 7v10l11 5 11-5V7L12 2zm0 2.618L19.531 8 12 11.382 4.469 8 12 4.618zM3 8.545l8 3.636v7.364L3 15.909V8.545zm10 10.99v-7.364l8-3.636v7.364L13 19.535z"></path></svg>
          </div>
        );
      case 'ABB':
        return (
          <div className={`${baseClasses} bg-[#FF0000] text-white font-bold text-lg p-1`}>
            ABB
          </div>
        );
       case 'Schneider Electric':
        return (
          <div className={`${baseClasses} bg-[#3DCD58] text-white p-1.5`}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.88 5.783c-4.44-1.898-8.23-1.05-9.33.19-.24.27-.4.6-.52.95l-.33.9c.14-.1.29-.2.46-.27l1.7-.72c.42-.18.88-.23 1.33-.14l6.1.99c.39.06.76.24 1.05.51l.24.22c-1.63 1.34-3.5 2.5-5.52 3.42-3.1 1.35-5.4 2.1-6.19 2.2-1.99.27-3.62-1.07-3.9-3-.2-.05-.4-.1-.58-.12-1.08-.13-2.12.3-2.8.98l1.01 2.76c.72 1.96 2.45 3.3 4.49 3.3.36 0 .7-.05 1.03-.13 3.43-.87 7.14-3.1 10.74-6.42 2-1.83 3.53-3.9 4.2-6.04.2-.6.28-1.2.22-1.78a2.5 2.5 0 00-.77-1.42c-1.04-.95-2.65-1.1-4.47-.73z"></path></svg>
          </div>
        );
      case 'Yaskawa':
        return (
          <div className={`${baseClasses} bg-[#0057B8] text-white p-1.5`}>
            <svg viewBox="0 0 60 10" fill="currentColor"><path d="M0 0v10h6V8h2v2h6V0h-6v2h-2V0H0zm2 2h2v6H2V2zM8 2h4v6H8V2zm6.5 0L18 10h5L19.5 0h-5zm11 0l-7 10h5l5.5-8 1.5 8h5l-7-10h-5zm9 0V10h6V8h2V10h6V0h-6V2h-2V0h-6zm2 2h2v4h-2V2zm6 0h4v6h-4V2z"></path></svg>
          </div>
        );
      case 'Mitsubishi Electric':
        return (
          <div className={`${baseClasses} bg-red-600 text-white p-1.5`}>
            <svg viewBox="0 0 100 86.6" fill="currentColor"><polygon points="50 0 25 43.3 0 0 50 0"></polygon><polygon points="25 43.3 50 86.6 75 43.3 25 43.3"></polygon><polygon points="100 0 75 43.3 50 0 100 0"></polygon></svg>
          </div>
        );
      case 'Danfoss':
        return (
          <div className={`${baseClasses} bg-[#E3132A] text-white p-1.5`}>
            <svg viewBox="0 0 68 11" fill="currentColor"><path d="M12.9 5.5c0-2.3-1.8-4.2-4-4.2H0V11h8.8c2.2 0 4.1-1.9 4.1-4.2V5.5zm-3.8.1c0 .8-.6 1.4-1.4 1.4H4.2V4h3.5c.8 0 1.4.6 1.4 1.4v.2zM15.4 1.3v9.7h10.2v-3H21v-1.1h4.6v-3H21V2.8h4.6v-1.5H15.4zM34.7 9.9L30.3 1.3h4.4l2 4.1 2-4.1h4.4l-4.5 8.6h-3.4zM45.5 1.3v9.7h4.2V1.3h-4.2zm7.4 0v9.7h4.2V1.3h-4.2zm11 0l-3.3 5.4V1.3H56.4v9.7h3.3l3.3-5.4v5.4h4.2V1.3h-3.1z"></path></svg>
          </div>
        );
      case 'Eaton':
        return (
          <div className={`${baseClasses} bg-[#005EB8] text-white p-1.5`}>
            <svg viewBox="0 0 220 40" fill="currentColor"><path d="M0 0h44v40H0zM22 2c11 0 20 9 20 20s-9 20-20 20S2 33 2 22 11 2 22 2zM56 0h16v40H56zM84 0h60v12H84zM84 28h60v12H84zM84 14h48v12H84zM156 0h12l24 20-24 20h-12l24-20z"></path></svg>
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} bg-gray-500 dark:bg-gray-600 text-white`}>
            {topic === 'PLC' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.926 9.034a1 1 0 01.447 1.324l-2.33 3.993a1 1 0 01-1.39.447l-2.002-1.156a1 1 0 01-.447-1.324l2.33-3.994a1 1 0 011.39-.447l2.002 1.156zM9.926 9.034a1 1 0 01.447 1.324l-2.33 3.993a1 1 0 01-1.39.447l-2.002-1.156a1 1 0 01-.447-1.324l2.33-3.994a1 1 0 011.39-.447l2.002 1.156zM9.926 2.034a1 1 0 01.447 1.324l-2.33 3.993a1 1 0 01-1.39.447L4.65 6.642a1 1 0 01-.447-1.324l2.33-3.994a1 1 0 011.39-.447l2.002 1.156z" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
            )}
          </div>
        );
    }
  };

  return <>{renderLogo()}</>;
};
