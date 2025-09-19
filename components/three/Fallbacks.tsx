'use client';

import React from 'react';
import type { TodoState } from '../../types/todo';

export function LoadingFallback() {
    return (
        <div
            className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg"
            role="status"
            aria-label="Loading 3D visualization"
        >
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-4" aria-hidden="true"></div>
            <div className="text-gray-600 text-center">
                <div className="font-medium">Loading 3D visualization...</div>
                <div className="text-sm mt-1">Please wait while we prepare your progress display</div>
            </div>
        </div>
    );
}

export function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-lg border border-red-200">
            <div className="text-red-600 mb-2">3D visualization failed to load</div>
            <div className="text-sm text-red-500 mb-4">{error.message}</div>
            <button
                onClick={resetErrorBoundary}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
                Try again
            </button>
        </div>
    );
}

export function FallbackVisualization({ todoState }: { todoState: TodoState }) {
    const { completionPercentage, priorityCounts } = todoState;
    return (
        <div
            className="flex items-center justify-center h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg border-2 border-blue-200 hover:shadow-md transition-all duration-200"
            role="img"
            aria-label={`Progress visualization showing ${completionPercentage}% completion`}
        >
            <div className="text-center p-6">
                <div className="text-gray-700 mb-2 font-medium">Progress Visualization</div>
                <div className="text-sm text-gray-500 mb-2 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    3D not supported on this device
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
                {(priorityCounts.high + priorityCounts.medium + priorityCounts.low) > 0 && (
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

export default LoadingFallback;

