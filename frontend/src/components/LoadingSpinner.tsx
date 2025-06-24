import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center flex-grow w-full min-h-[300px]">
            <div 
                className="w-12 h-12 border-4 border-gray-200 rounded-full border-t-blue-600 animate-spin"
                role="status"
                aria-label="Loading"
            >
                <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-4 text-lg text-white text-center">Loading session...</p>
        </div>
    );
};

export default LoadingSpinner;
