
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, subMessage }) => {
  const { t } = useTranslation();
  return (
    <div className="text-center my-10 p-6 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
      <svg className="animate-spin mx-auto h-12 w-12 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">{message || t('spinnerLoading')}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{subMessage || t('spinnerWait')}</p>
    </div>
  );
};