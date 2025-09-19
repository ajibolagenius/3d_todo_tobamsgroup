/**
 * Performance monitoring and optimization utilities
 */

import React from 'react';

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
    FRAME_TIME_MS: 16.67, // 60fps = 16.67ms per frame
    INTERACTION_DELAY_MS: 100, // Maximum delay for user interactions
    BUNDLE_SIZE_KB: 300, // Maximum first load JS size
    MEMORY_USAGE_MB: 50, // Maximum memory usage for 3D components
} as const;

// Device performance levels
export type PerformanceLevel = 'low' | 'medium' | 'high';

// Performance metrics interface
export interface PerformanceMetrics {
    fps: number;
    memoryUsage: number;
    renderTime: number;
    interactionDelay: number;
}

/**
 * Detect device performance level based on various factors
 */
export function getDevicePerformanceLevel(): PerformanceLevel {
    // Check for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 2;

    // Check device memory if available
    const memory = (navigator as any).deviceMemory || 4;

    // Check connection speed if available
    const connection = (navigator as any).connection;
    const isSlowConnection = connection && (
        connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g' ||
        connection.saveData === true
    );

    // Check WebGL capabilities
    const webglLevel = getWebGLLevel();

    // Scoring system
    let score = 0;

    // CPU score
    if (cores >= 8) score += 3;
    else if (cores >= 4) score += 2;
    else if (cores >= 2) score += 1;

    // Memory score
    if (memory >= 8) score += 3;
    else if (memory >= 4) score += 2;
    else if (memory >= 2) score += 1;

    // WebGL score
    if (webglLevel === 'webgl2') score += 2;
    else if (webglLevel === 'webgl') score += 1;

    // Penalties
    if (isMobile) score -= 2;
    if (isSlowConnection) score -= 2;

    // Determine performance level
    if (score >= 6) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
}

/**
 * Check WebGL support level
 */
export function getWebGLLevel(): 'none' | 'webgl' | 'webgl2' {
    try {
        const canvas = document.createElement('canvas');

        // Check WebGL2 support
        const gl2 = canvas.getContext('webgl2');
        if (gl2) return 'webgl2';

        // Check WebGL support
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) return 'webgl';

        return 'none';
    } catch (e) {
        return 'none';
    }
}

/**
 * Performance monitor class for tracking metrics
 */
export class PerformanceMonitor {
    private frameCount = 0;
    private lastTime = performance.now();
    private fps = 60;
    private memoryUsage = 0;
    private renderTimes: number[] = [];
    private isMonitoring = false;

    start() {
        this.isMonitoring = true;
        this.monitorLoop();
    }

    stop() {
        this.isMonitoring = false;
    }

    private monitorLoop() {
        if (!this.isMonitoring) return;

        const now = performance.now();
        const delta = now - this.lastTime;

        this.frameCount++;

        // Update FPS every second
        if (delta >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / delta);
            this.frameCount = 0;
            this.lastTime = now;

            // Update memory usage if available
            if ('memory' in performance) {
                const memory = (performance as any).memory;
                this.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024);
            }
        }

        requestAnimationFrame(() => this.monitorLoop());
    }

    recordRenderTime(time: number) {
        this.renderTimes.push(time);

        // Keep only last 60 measurements (1 second at 60fps)
        if (this.renderTimes.length > 60) {
            this.renderTimes.shift();
        }
    }

    getMetrics(): PerformanceMetrics {
        const avgRenderTime = this.renderTimes.length > 0
            ? this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length
            : 0;

        return {
            fps: this.fps,
            memoryUsage: this.memoryUsage,
            renderTime: avgRenderTime,
            interactionDelay: 0, // Would be measured separately
        };
    }

    isPerformanceGood(): boolean {
        const metrics = this.getMetrics();
        return (
            metrics.fps >= 55 && // Allow some tolerance below 60fps
            metrics.renderTime <= PERFORMANCE_THRESHOLDS.FRAME_TIME_MS &&
            metrics.memoryUsage <= PERFORMANCE_THRESHOLDS.MEMORY_USAGE_MB
        );
    }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate = false
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };

        const callNow = immediate && !timeout;

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if (callNow) func(...args);
    };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Lazy loading utility for components
 * Currently disabled due to syntax issues - use React.lazy directly
 */
// export function createLazyComponent<T extends React.ComponentType<any>>(
//     importFunc: () => Promise<{ default: T }>,
//     fallback?: React.ComponentType
// ) {
//     const LazyComponent = React.lazy(importFunc);

//     return function LazyWrapper(props: React.ComponentProps<T>) {
//         return (
//             <React.Suspense fallback={fallback ? React.createElement(fallback) : null}>
//                 <LazyComponent {...props} />
//             </React.Suspense>
//         );
//     };
// }

/**
 * Memory cleanup utility
 */
export class MemoryManager {
    private static disposables: (() => void)[] = [];

    static addDisposable(dispose: () => void) {
        this.disposables.push(dispose);
    }

    static cleanup() {
        this.disposables.forEach(dispose => {
            try {
                dispose();
            } catch (error) {
                console.warn('Error during cleanup:', error);
            }
        });
        this.disposables = [];
    }

    static scheduleCleanup() {
        // Clean up when page is about to unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // Clean up on visibility change (when tab becomes hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.cleanup();
            }
        });
    }
}

/**
 * Bundle size analyzer (development only)
 */
export function analyzeBundleSize() {
    if (process.env.NODE_ENV !== 'development') return;

    // This would typically be used with webpack-bundle-analyzer
    console.log('Bundle analysis would be performed here in development');
}

// Initialize memory manager
if (typeof window !== 'undefined') {
    MemoryManager.scheduleCleanup();
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();
