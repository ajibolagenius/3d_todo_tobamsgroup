'use client';

import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { TodoState } from '../types/todo';

// Lazy load the heavy 3D component
const ProgressVisualization = lazy(() => import('./ProgressVisualization'));

// Lightweight loading fallback
function LoadingFallback() {
    return (
        <div
            className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg animate-pulse"
            role="status"
            aria-label="Loading 3D visualization"
        >
            <div className="w-16 h-16 bg-gray-300 rounded-full mb-4"></div>
            <div className="w-32 h-4 bg-gray-300 rounded mb-2"></div>
            <div className="w-24 h-3 bg-gray-300 rounded"></div>
        </div>
    );
}

// Error fallback for 3D component
function ThreeDErrorFallback({ todoState }: { todoState: TodoState }) {
    const { completionPercentage, priorityCounts } = todoState;
    return (
        <div
            className="flex items-center justify-center h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg border-2 border-blue-200"
            role="img"
            aria-label={`Progress visualization showing ${completionPercentage}% completion`}
        >
            <div className="text-center p-6">
                <div className="text-gray-700 mb-2 font-medium">Progress Visualization</div>
                <div className="text-sm text-gray-500 mb-2 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    3D visualization unavailable
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-4">
                    {completionPercentage}% Complete
                </div>
                <div className="w-40 h-6 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                    <div
                        className={`h-full transition-all duration-700 ease-out ${completionPercentage === 100
                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500'
                            }`}
                        style={{ width: `${completionPercentage}%` }}
                        role="progressbar"
                        aria-valuenow={completionPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${completionPercentage}% progress`}
                    ></div>
                </div>
                {completionPercentage === 100 && (
                    <div className="mt-3 text-green-600 font-medium animate-pulse">
                        🎉 All tasks completed!
                    </div>
                )}
                {/* Priority breakdown */}
                {(priorityCounts.high > 0 || priorityCounts.medium > 0 || priorityCounts.low > 0) && (
                    <div className="mt-3 text-xs text-gray-600">
                        <div className="flex justify-center gap-3">
                            {priorityCounts.high > 0 && (
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span>High: {priorityCounts.high}</span>
                                </div>
                            )}
                            {priorityCounts.medium > 0 && (
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span>Med: {priorityCounts.medium}</span>
                                </div>
                            )}
                            {priorityCounts.low > 0 && (
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Low: {priorityCounts.low}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface ProgressVisualizationLazyProps {
    todoState: TodoState;
}

export default function ProgressVisualizationLazy({
    todoState
}: ProgressVisualizationLazyProps) {
    return (
        <ErrorBoundary
            fallback={<ThreeDErrorFallback todoState={todoState} />}
            onError={(error, errorInfo) => {
                console.error('3D Visualization Error:', error, errorInfo);
                // In production, you might want to send this to an error tracking service
            }}
        >
            <Suspense fallback={<LoadingFallback />}>
                <ProgressVisualization todoState={todoState} />
            </Suspense>
        </ErrorBoundary>
    );
}
