import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Corrected import path. App.tsx will now export a valid component.
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
          <App />
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);