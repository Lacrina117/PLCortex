

import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-r-lg" role="alert">
      <div className="flex">
        <div className="py-1">
            <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <div>
          <p className="font-bold">{t('errorAlertTitle')}</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};