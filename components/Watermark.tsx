import React from 'react';

export const Watermark: React.FC = () => {
    return (
        <div className="fixed bottom-4 right-4 z-50 pointer-events-none select-none text-right">
            <p className="text-xs text-gray-500/50 dark:text-gray-400/50">Ing. Jesús Jiménez</p>
            <p className="text-xs text-gray-500/50 dark:text-gray-400/50">jesusjimenez117@outlook.com</p>
            <p className="text-xs text-gray-500/50 dark:text-gray-400/50">+52 6863542736</p>
        </div>
    );
};