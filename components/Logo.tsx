
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Glow effect behind the logo */}
      <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
      
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full drop-shadow-md"
      >
        {/* Hexagonal Frame */}
        <path 
          d="M50 5L89 27.5V72.5L50 95L11 72.5V27.5L50 5Z" 
          stroke="currentColor" 
          strokeWidth="6" 
          strokeLinejoin="round"
          className="text-white"
        />
        
        {/* Inner Circuit Trace 'C' */}
        <path 
          d="M70 35C66 30 60 27 52 27C38.1929 27 27 38.1929 27 52C27 65.8071 38.1929 77 52 77C60 77 66 74 70 69" 
          stroke="url(#logo-gradient)" 
          strokeWidth="8" 
          strokeLinecap="round"
        />
        
        {/* Power Node - The "Cortex" center */}
        <circle cx="52" cy="52" r="8" fill="white" className="animate-pulse" />
        
        {/* Connection Points */}
        <circle cx="70" cy="35" r="4" fill="white" />
        <circle cx="70" cy="69" r="4" fill="white" />
        
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="logo-gradient" x1="27" y1="27" x2="70" y2="77" gradientUnits="userSpaceOnUse">
            <stop stopColor="#818CF8" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
