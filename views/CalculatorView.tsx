import React from 'react';
import { Calculator } from '../components/Calculator';
import { useTranslation } from '../hooks/useTranslation';

export const CalculatorView: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <header className="text-center">
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight sm:text-4xl">{t('calculator.title')}</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('calculator.description')}</p>
            </header>
            <Calculator />
        </div>
    );
};