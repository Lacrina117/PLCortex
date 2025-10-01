import React from 'react';

export const SkeletonBlock: React.FC<{ width?: string; height?: string; className?: string }> = ({ width = 'w-full', height = 'h-4', className = '' }) => (
    <div className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${width} ${height} ${className}`}></div>
);

export const ResultSkeleton: React.FC = () => (
    <div className="mt-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
        <SkeletonBlock width="w-1/3" height="h-8" className="mb-6" />
        <div className="space-y-3">
            <SkeletonBlock />
            <SkeletonBlock width="w-5/6" />
            <SkeletonBlock />
            <SkeletonBlock width="w-3/4" />
            <SkeletonBlock height="h-16" className="mt-6" />
            <SkeletonBlock width="w-1/2" />
        </div>
    </div>
);

export const PracticeSkeleton: React.FC = () => (
    <div className="mt-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
        <SkeletonBlock width="w-1/2" height="h-8" className="mb-6" />
        <div className="space-y-3">
            <SkeletonBlock />
            <SkeletonBlock width="w-11/12" />
            <SkeletonBlock />
            <SkeletonBlock width="w-5/6" />
        </div>
        <div className="mt-8 text-center">
            <SkeletonBlock width="w-48" height="h-12" className="mx-auto" />
        </div>
    </div>
);