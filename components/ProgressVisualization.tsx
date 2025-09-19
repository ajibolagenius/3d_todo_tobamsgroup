'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ErrorBoundary } from './ErrorBoundary';
import { getDevicePerformanceLevel, getWebGLLevel } from '../utils/performance';
import { TodoState } from '../types/todo';
import { Scene } from './three/Scene';
import { LoadingFallback, ErrorFallback, FallbackVisualization } from './three/Fallbacks';
import { PriorityHoverInfo } from './three/PriorityHoverInfo';

interface ProgressVisualizationProps {
    todoState: TodoState; // Contains filtered data - all calculations are based on filteredTodos
}

export default function ProgressVisualization({ todoState }: ProgressVisualizationProps) {
    const { completionPercentage } = todoState;
    const [webglSupported, setWebglSupported] = React.useState<boolean | null>(null);
    const [performanceLevel, setPerformanceLevel] = React.useState<'low' | 'medium' | 'high'>('medium');
    const [isLoading, setIsLoading] = React.useState(true);
    const [hoveredPriority, setHoveredPriority] = React.useState<'high' | 'medium' | 'low' | null>(null);
    const previousPercentage = React.useRef(completionPercentage);

    // Track filter changes for smooth transitions
    const previousFilteredCount = React.useRef(todoState.totalCount);
    React.useEffect(() => {
        if (previousFilteredCount.current !== todoState.totalCount) {
            previousFilteredCount.current = todoState.totalCount;
        }
    }, [todoState.totalCount, todoState.filteredTodos?.length]);

    const canvasHeight = React.useMemo(() => {
        switch (performanceLevel) {
            case 'low': return 'h-48 sm:h-56 md:h-64';
            case 'medium': return 'h-56 sm:h-64 md:h-72 lg:h-80';
            case 'high': return 'h-64 sm:h-72 md:h-80 lg:h-96';
            default: return 'h-56 sm:h-64 md:h-72 lg:h-80';
        }
    }, [performanceLevel]);


    const canvasSettings = React.useMemo(() => {
        const baseSettings = {
            camera: { position: [0, 0, 6] as [number, number, number], fov: 50 },
            style: { background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' },
        };

        switch (performanceLevel) {
            case 'low':
                return {
                    ...baseSettings,
                    shadows: false,
                    gl: { antialias: false, alpha: false, powerPreference: 'low-power' as const },
                    dpr: [0.5, 1] as [number, number],
                    frameloop: 'always' as const,
                };
            case 'medium':
                return {
                    ...baseSettings,
                    shadows: false,
                    gl: { antialias: true, alpha: false },
                    dpr: [1, 1.5] as [number, number],
                };
            case 'high':
                return {
                    ...baseSettings,
                    shadows: true,
                    gl: { antialias: true, alpha: false },
                    dpr: [1, 2] as [number, number],
                };
            default:
                return {
                    ...baseSettings,
                    shadows: false,
                    gl: { antialias: true, alpha: false },
                    dpr: [1, 1.5] as [number, number],
                };
        }
    }, [performanceLevel]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setWebglSupported(getWebGLLevel() !== 'none');
            setPerformanceLevel(getDevicePerformanceLevel());
            setIsLoading(false);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    React.useEffect(() => {
        if (previousPercentage.current !== completionPercentage && !isLoading) {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';

            if (completionPercentage === 100) {
                announcement.textContent = 'Congratulations! All tasks completed. Progress is now 100%.';
            } else if (completionPercentage === 0) {
                announcement.textContent = 'Progress reset to 0%.';
            } else {
                announcement.textContent = `Progress updated to ${completionPercentage}%.`;
            }

            document.body.appendChild(announcement);
            setTimeout(() => document.body.removeChild(announcement), 2000);

            previousPercentage.current = completionPercentage;
        }
    }, [completionPercentage, isLoading]);

    if (isLoading || webglSupported === null) {
        return <LoadingFallback />;
    }
    if (!webglSupported) {
        return <FallbackVisualization todoState={todoState} />;
    }

    return (
        <div
            className={`w-full ${canvasHeight} rounded-lg overflow-hidden relative`}
            role="img"
            aria-label={`3D progress visualization showing ${completionPercentage}% completion`}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    const announcement = document.createElement('div');
                    announcement.setAttribute('aria-live', 'assertive');
                    announcement.className = 'sr-only';
                    announcement.textContent = `Current progress: ${completionPercentage}% of tasks completed`;
                    document.body.appendChild(announcement);
                    setTimeout(() => document.body.removeChild(announcement), 2000);
                }
            }}
        >
            <ErrorBoundary
                fallback={<ErrorFallback error={new Error('3D visualization error')} resetErrorBoundary={() => window.location.reload()} />}
                onError={(error, errorInfo) => {
                    console.error('3D Visualization Error:', error, errorInfo);
                }}
            >
                <Suspense fallback={<LoadingFallback />}>
                    <Canvas {...canvasSettings} data-testid="three-canvas">
                        <Scene
                            todoState={todoState}
                            performanceLevel={performanceLevel}
                            hoveredPriority={hoveredPriority}
                            setHoveredPriority={setHoveredPriority}
                        />
                    </Canvas>
                </Suspense>
            </ErrorBoundary>
            <PriorityHoverInfo hoveredPriority={hoveredPriority} todoState={todoState} />
            <div className="sr-only">
                3D progress visualization. Current completion: {completionPercentage}%.
                {completionPercentage === 100 ? 'All tasks completed with celebration effects.' :
                    completionPercentage >= 75 ? 'Nearly complete with enhanced visual effects.' :
                        completionPercentage >= 50 ? 'Halfway complete with progress animations.' :
                            completionPercentage > 0 ? 'Progress started with visual feedback.' :
                                'No progress yet, waiting for first task completion.'}
            </div>
        </div>
    );
}

