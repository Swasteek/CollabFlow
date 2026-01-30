import React from 'react';

const LoadingSpinner = ({ 
    size = 'medium', 
    color = 'blue',
    fullScreen = false,
    text = ''
}) => {
    const sizeClasses = {
        small: 'w-4 h-4 border-2',
        medium: 'w-8 h-8 border-3',
        large: 'w-12 h-12 border-4'
    };

    const colorClasses = {
        blue: 'border-blue-500',
        white: 'border-white',
        gray: 'border-slate-400'
    };

    const spinner = (
        <div className={`
            ${sizeClasses[size]} 
            ${colorClasses[color]} 
            border-t-transparent 
            rounded-full 
            animate-spin
        `}></div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                {spinner}
                {text && (
                    <p className="mt-4 text-slate-300 text-sm">{text}</p>
                )}
            </div>
        );
    }

    if (text) {
        return (
            <div className="flex flex-col items-center justify-center gap-3">
                {spinner}
                <p className="text-slate-400 text-sm">{text}</p>
            </div>
        );
    }

    return spinner;
};

// Page loading state
export const PageLoader = ({ text = 'Loading...' }) => (
    <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center">
        <LoadingSpinner size="large" text={text} />
    </div>
);

// Inline loading state
export const InlineLoader = ({ size = 'small' }) => (
    <span className="inline-flex items-center">
        <LoadingSpinner size={size} />
    </span>
);

// Button loading state
export const ButtonLoader = () => (
    <svg 
        className="animate-spin h-4 w-4 text-white" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
    >
        <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
        />
        <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
    </svg>
);

// Skeleton loader for cards
export const SkeletonCard = () => (
    <div className="bg-[var(--bg-card)] h-48 rounded-xl border border-[var(--border)] animate-pulse p-5">
        <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
    </div>
);

// Skeleton loader for task cards
export const SkeletonTaskCard = () => (
    <div className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border)] animate-pulse mb-3">
        <div className="h-4 bg-slate-700 rounded w-16 mb-3"></div>
        <div className="h-4 bg-slate-700/50 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-700/50 rounded w-2/3"></div>
    </div>
);

export default LoadingSpinner;
