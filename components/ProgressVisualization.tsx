'use client';

import React, { Suspense, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ErrorBoundary } from './ErrorBoundary';
import { getDevicePerformanceLevel, getWebGLLevel, MemoryManager } from '../utils/performance';
import { TodoState } from '../types/todo';

// Removed unused function getProgressColor

function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
        case 'high': return '#ef4444'; // Red
        case 'medium': return '#f59e0b'; // Yellow/Orange
        case 'low': return '#10b981'; // Green
        default: return '#6b7280'; // Gray fallback
    }
}

function getPriorityEmissiveColor(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
        case 'high': return '#dc2626';
        case 'medium': return '#d97706';
        case 'low': return '#059669';
        default: return '#4b5563';
    }
}



const CelebrationParticles = React.memo(function CelebrationParticles({
    isActive,
    performanceLevel,
    priorityCounts
}: {
    isActive: boolean;
    performanceLevel: 'low' | 'medium' | 'high';
    priorityCounts: { high: number; medium: number; low: number };
}) {
    const particlesRef = useRef<THREE.Points>(null);
    const particleCount = useMemo(() => {
        switch (performanceLevel) {
            case 'low': return 15;
            case 'medium': return 30;
            case 'high': return 50;
            default: return 30;
        }
    }, [performanceLevel]);

    const particles = useMemo(() => {
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        // Calculate priority distribution for particle colors based on filtered data
        const totalTasks = priorityCounts.high + priorityCounts.medium + priorityCounts.low;
        const highRatio = totalTasks > 0 ? priorityCounts.high / totalTasks : 0.33;
        const mediumRatio = totalTasks > 0 ? priorityCounts.medium / totalTasks : 0.33;

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            positions[i3] = (Math.random() - 0.5) * 4;
            positions[i3 + 1] = (Math.random() - 0.5) * 4;
            positions[i3 + 2] = (Math.random() - 0.5) * 4;

            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = Math.random() * 0.03;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

            // Assign priority-based colors to particles
            const rand = Math.random();
            let priorityColor: string;
            if (rand < highRatio) {
                priorityColor = getPriorityColor('high');
            } else if (rand < highRatio + mediumRatio) {
                priorityColor = getPriorityColor('medium');
            } else {
                priorityColor = getPriorityColor('low');
            }

            const color = new THREE.Color(priorityColor);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        MemoryManager.addDisposable(() => {
            positions.fill(0);
            velocities.fill(0);
            colors.fill(0);
        });

        return { positions, velocities, colors };
    }, [particleCount, priorityCounts]);

    useFrame(useCallback((state) => {
        if (!particlesRef.current || !isActive) return;

        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            positions[i3] += particles.velocities[i3];
            positions[i3 + 1] += particles.velocities[i3 + 1];
            positions[i3 + 2] += particles.velocities[i3 + 2];
            const gravityStrength = performanceLevel === 'low' ? 0.0003 : 0.0005;
            const windStrength = performanceLevel === 'low' ? 0.00005 : 0.0001;

            particles.velocities[i3 + 1] -= gravityStrength;
            particles.velocities[i3] += Math.sin(state.clock.elapsedTime + i) * windStrength;
            if (positions[i3 + 1] < -5) {
                positions[i3] = (Math.random() - 0.5) * 2;
                positions[i3 + 1] = 3;
                positions[i3 + 2] = (Math.random() - 0.5) * 2;
                particles.velocities[i3 + 1] = Math.random() * 0.02;
            }
        }

        particlesRef.current.geometry.attributes.position.needsUpdate = true;

    }, [isActive, particleCount, particles, performanceLevel]));

    if (!isActive) return null;

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particleCount}
                    array={particles.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={particleCount}
                    array={particles.colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={performanceLevel === 'low' ? 0.03 : 0.05}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
            />
        </points>
    );
});

const PriorityProgressBar = React.memo(function PriorityProgressBar({
    todoState,
    performanceLevel,
    hoveredPriority,
    setHoveredPriority
}: {
    todoState: TodoState;
    performanceLevel: 'low' | 'medium' | 'high';
    hoveredPriority: 'high' | 'medium' | 'low' | null;
    setHoveredPriority: (priority: 'high' | 'medium' | 'low' | null) => void;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const highFillRef = useRef<THREE.Mesh>(null);
    const mediumFillRef = useRef<THREE.Mesh>(null);
    const lowFillRef = useRef<THREE.Mesh>(null);
    const highMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
    const mediumMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
    const lowMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

    // Hover state management
    const hoverIntensity = useRef(0);

    const animatedProgress = useRef({ high: 0, medium: 0, low: 0 });
    const { completionPercentage, priorityCounts, totalCount } = todoState;
    const isCompleted = completionPercentage >= 100;
    const celebrationIntensity = useRef(0);

    // Track previous values for smooth transitions when filters change
    const previousTotalCount = useRef(totalCount);
    const previousPriorityCounts = useRef(priorityCounts);

    // Calculate completed tasks by priority using filteredTodos for accurate representation
    const completedByPriority = useMemo(() => {
        // Use filteredTodos if available, otherwise fall back to todos for backward compatibility
        const todosToUse = todoState.filteredTodos || todoState.todos;
        const completed = todosToUse.filter(todo => todo.completed);
        return {
            high: completed.filter(todo => todo.priority === 'high').length,
            medium: completed.filter(todo => todo.priority === 'medium').length,
            low: completed.filter(todo => todo.priority === 'low').length,
        };
    }, [todoState.filteredTodos, todoState.todos]);

    // Calculate target progress for each priority
    const targetProgress = useMemo(() => {
        if (totalCount === 0) return { high: 0, medium: 0, low: 0 };

        return {
            high: priorityCounts.high > 0 ? completedByPriority.high / priorityCounts.high : 0,
            medium: priorityCounts.medium > 0 ? completedByPriority.medium / priorityCounts.medium : 0,
            low: priorityCounts.low > 0 ? completedByPriority.low / priorityCounts.low : 0,
        };
    }, [completedByPriority, priorityCounts, totalCount]);

    // Calculate priority weights for visual emphasis
    const priorityWeights = useMemo(() => {
        const totalTasks = priorityCounts.high + priorityCounts.medium + priorityCounts.low;
        if (totalTasks === 0) return { high: 1, medium: 1, low: 1 };

        return {
            high: Math.max(0.5, priorityCounts.high / totalTasks * 2), // High priority gets more emphasis
            medium: Math.max(0.3, priorityCounts.medium / totalTasks * 1.5),
            low: Math.max(0.2, priorityCounts.low / totalTasks),
        };
    }, [priorityCounts]);

    const geometrySegments = useMemo(() => {
        switch (performanceLevel) {
            case 'low': return 16;
            case 'medium': return 24;
            case 'high': return 32;
            default: return 24;
        }
    }, [performanceLevel]);

    useFrame((state, delta) => {
        if (!highFillRef.current || !mediumFillRef.current || !lowFillRef.current || !groupRef.current) return;
        if (!highMaterialRef.current || !mediumMaterialRef.current || !lowMaterialRef.current) return;

        // Detect filter changes and adjust lerp factor for smoother transitions
        const hasFilterChanged = previousTotalCount.current !== totalCount ||
            previousPriorityCounts.current.high !== priorityCounts.high ||
            previousPriorityCounts.current.medium !== priorityCounts.medium ||
            previousPriorityCounts.current.low !== priorityCounts.low;

        // Use faster transitions when filters change to provide immediate visual feedback
        const lerpFactor = hasFilterChanged ? Math.min(delta * 5, 1) : Math.min(delta * 3, 1);

        // Update previous values
        if (hasFilterChanged) {
            previousTotalCount.current = totalCount;
            previousPriorityCounts.current = { ...priorityCounts };
        }

        // Animate each priority level independently
        animatedProgress.current.high = THREE.MathUtils.lerp(
            animatedProgress.current.high,
            targetProgress.high,
            lerpFactor
        );
        animatedProgress.current.medium = THREE.MathUtils.lerp(
            animatedProgress.current.medium,
            targetProgress.medium,
            lerpFactor
        );
        animatedProgress.current.low = THREE.MathUtils.lerp(
            animatedProgress.current.low,
            targetProgress.low,
            lerpFactor
        );

        // Update high priority segment (top third)
        const highScale = animatedProgress.current.high || 0.01;
        if (highFillRef.current?.scale && highFillRef.current?.position) {
            highFillRef.current.scale.y = highScale;
            highFillRef.current.position.y = 0.67 + (highScale - 1) * 0.67; // Top third
        }

        // Update medium priority segment (middle third)
        const mediumScale = animatedProgress.current.medium || 0.01;
        if (mediumFillRef.current?.scale && mediumFillRef.current?.position) {
            mediumFillRef.current.scale.y = mediumScale;
            mediumFillRef.current.position.y = 0 + (mediumScale - 1) * 0.67; // Middle third
        }

        // Update low priority segment (bottom third)
        const lowScale = animatedProgress.current.low || 0.01;
        if (lowFillRef.current?.scale && lowFillRef.current?.position) {
            lowFillRef.current.scale.y = lowScale;
            lowFillRef.current.position.y = -0.67 + (lowScale - 1) * 0.67; // Bottom third
        }

        // Handle hover effects and priority weighting
        const targetHoverIntensity = hoveredPriority ? 1 : 0;
        hoverIntensity.current = THREE.MathUtils.lerp(hoverIntensity.current, targetHoverIntensity, delta * 5);

        // Apply priority-weighted visual emphasis
        const highEmphasis = priorityWeights.high * (hoveredPriority === 'high' ? 1.5 : 1);
        const mediumEmphasis = priorityWeights.medium * (hoveredPriority === 'medium' ? 1.5 : 1);
        const lowEmphasis = priorityWeights.low * (hoveredPriority === 'low' ? 1.5 : 1);

        // Apply emphasis to scale and position
        if (highFillRef.current?.scale) {
            highFillRef.current.scale.x = 1 + (highEmphasis - 1) * 0.1;
            highFillRef.current.scale.z = 1 + (highEmphasis - 1) * 0.1;
        }
        if (mediumFillRef.current?.scale) {
            mediumFillRef.current.scale.x = 1 + (mediumEmphasis - 1) * 0.1;
            mediumFillRef.current.scale.z = 1 + (mediumEmphasis - 1) * 0.1;
        }
        if (lowFillRef.current?.scale) {
            lowFillRef.current.scale.x = 1 + (lowEmphasis - 1) * 0.1;
            lowFillRef.current.scale.z = 1 + (lowEmphasis - 1) * 0.1;
        }

        if (isCompleted) {
            celebrationIntensity.current = Math.min(celebrationIntensity.current + delta * 2, 1);

            if (performanceLevel !== 'low') {
                groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.3;
                groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.15;
                groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.2) * 0.1;

                const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
                [highFillRef, mediumFillRef, lowFillRef].forEach(ref => {
                    if (ref.current?.scale) {
                        ref.current.scale.x = pulseScale;
                        ref.current.scale.z = pulseScale;
                    }
                });

                const baseEmissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
                highMaterialRef.current.emissiveIntensity = baseEmissiveIntensity * (hoveredPriority === 'high' ? 1.5 : 1);
                mediumMaterialRef.current.emissiveIntensity = baseEmissiveIntensity * (hoveredPriority === 'medium' ? 1.5 : 1);
                lowMaterialRef.current.emissiveIntensity = baseEmissiveIntensity * (hoveredPriority === 'low' ? 1.5 : 1);
            } else {
                groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
                groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1) * 0.08;

                highMaterialRef.current.emissiveIntensity = 0.2 * (hoveredPriority === 'high' ? 1.5 : 1);
                mediumMaterialRef.current.emissiveIntensity = 0.2 * (hoveredPriority === 'medium' ? 1.5 : 1);
                lowMaterialRef.current.emissiveIntensity = 0.2 * (hoveredPriority === 'low' ? 1.5 : 1);
            }
        } else {
            celebrationIntensity.current = Math.max(celebrationIntensity.current - delta * 2, 0);

            const animationStrength = performanceLevel === 'low' ? 0.5 : 1;
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * (0.1 * animationStrength);
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * (0.05 * animationStrength);
            groupRef.current.rotation.x = 0;

            [highFillRef, mediumFillRef, lowFillRef].forEach(ref => {
                if (ref.current?.scale) {
                    ref.current.scale.x = 1;
                    ref.current.scale.z = 1;
                }
            });

            highMaterialRef.current.emissiveIntensity = 0.15 * (hoveredPriority === 'high' ? 1.8 : 1) * highEmphasis;
            mediumMaterialRef.current.emissiveIntensity = 0.15 * (hoveredPriority === 'medium' ? 1.8 : 1) * mediumEmphasis;
            lowMaterialRef.current.emissiveIntensity = 0.15 * (hoveredPriority === 'low' ? 1.8 : 1) * lowEmphasis;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Progress container - outer cylinder */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.8, 0.8, 4, geometrySegments]} />
                <meshStandardMaterial
                    color="#e5e7eb"
                    transparent
                    opacity={0.3}
                    wireframe={false}
                />
            </mesh>

            {/* High priority segment (top third) */}
            <mesh
                ref={highFillRef}
                position={[0, 0.67, 0]}
                onPointerEnter={() => setHoveredPriority('high')}
                onPointerLeave={() => setHoveredPriority(null)}
            >
                <cylinderGeometry args={[0.75, 0.75, 1.33, geometrySegments]} />
                <meshStandardMaterial
                    ref={highMaterialRef}
                    color={getPriorityColor('high')}
                    transparent
                    opacity={priorityCounts.high > 0 ? 0.8 : 0.2}
                    emissive={getPriorityEmissiveColor('high')}
                    emissiveIntensity={0.15}
                />
            </mesh>

            {/* Medium priority segment (middle third) */}
            <mesh
                ref={mediumFillRef}
                position={[0, 0, 0]}
                onPointerEnter={() => setHoveredPriority('medium')}
                onPointerLeave={() => setHoveredPriority(null)}
            >
                <cylinderGeometry args={[0.75, 0.75, 1.33, geometrySegments]} />
                <meshStandardMaterial
                    ref={mediumMaterialRef}
                    color={getPriorityColor('medium')}
                    transparent
                    opacity={priorityCounts.medium > 0 ? 0.8 : 0.2}
                    emissive={getPriorityEmissiveColor('medium')}
                    emissiveIntensity={0.15}
                />
            </mesh>

            {/* Low priority segment (bottom third) */}
            <mesh
                ref={lowFillRef}
                position={[0, -0.67, 0]}
                onPointerEnter={() => setHoveredPriority('low')}
                onPointerLeave={() => setHoveredPriority(null)}
            >
                <cylinderGeometry args={[0.75, 0.75, 1.33, geometrySegments]} />
                <meshStandardMaterial
                    ref={lowMaterialRef}
                    color={getPriorityColor('low')}
                    transparent
                    opacity={priorityCounts.low > 0 ? 0.8 : 0.2}
                    emissive={getPriorityEmissiveColor('low')}
                    emissiveIntensity={0.15}
                />
            </mesh>

            {/* Base platform */}
            <mesh position={[0, -2.2, 0]}>
                <cylinderGeometry args={[1, 1, 0.2, geometrySegments]} />
                <meshStandardMaterial color="#6b7280" />
            </mesh>

            {/* Priority indicator rings */}
            {performanceLevel !== 'low' && (
                <>
                    {/* High priority ring */}
                    <mesh position={[0, 1.3, 0]}>
                        <torusGeometry args={[0.85, 0.02, 8, geometrySegments]} />
                        <meshStandardMaterial
                            color={priorityCounts.high > 0 ? getPriorityColor('high') : "#9ca3af"}
                            transparent
                            opacity={0.6}
                        />
                    </mesh>
                    {/* Medium priority ring */}
                    <mesh position={[0, 0, 0]}>
                        <torusGeometry args={[0.85, 0.02, 8, geometrySegments]} />
                        <meshStandardMaterial
                            color={priorityCounts.medium > 0 ? getPriorityColor('medium') : "#9ca3af"}
                            transparent
                            opacity={0.6}
                        />
                    </mesh>
                    {/* Low priority ring */}
                    <mesh position={[0, -1.3, 0]}>
                        <torusGeometry args={[0.85, 0.02, 8, geometrySegments]} />
                        <meshStandardMaterial
                            color={priorityCounts.low > 0 ? getPriorityColor('low') : "#9ca3af"}
                            transparent
                            opacity={0.6}
                        />
                    </mesh>
                </>
            )}

            {/* Celebration particles for 100% completion */}
            <CelebrationParticles
                isActive={isCompleted}
                performanceLevel={performanceLevel}
                priorityCounts={priorityCounts}
            />
        </group>
    );
});

// Priority information overlay component
const PriorityHoverInfo = React.memo(function PriorityHoverInfo({
    hoveredPriority,
    todoState
}: {
    hoveredPriority: 'high' | 'medium' | 'low' | null;
    todoState: TodoState;
}) {
    if (!hoveredPriority) return null;

    const { priorityCounts, filteredTodos, todos } = todoState;
    // Use filteredTodos if available, otherwise fall back to todos for backward compatibility
    const todosToUse = filteredTodos || todos;
    const completedByPriority = todosToUse.filter(todo => todo.completed && todo.priority === hoveredPriority).length;
    const totalByPriority = priorityCounts[hoveredPriority];
    const percentage = totalByPriority > 0 ? Math.round((completedByPriority / totalByPriority) * 100) : 0;

    const priorityLabels = {
        high: 'High Priority',
        medium: 'Medium Priority',
        low: 'Low Priority'
    };

    const priorityColors = {
        high: 'text-red-600 bg-red-50 border-red-200',
        medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        low: 'text-green-600 bg-green-50 border-green-200'
    };

    return (
        <div className={`absolute top-4 right-4 p-3 rounded-lg border-2 ${priorityColors[hoveredPriority]} backdrop-blur-sm z-10 transition-all duration-200`}>
            <div className="text-sm font-semibold mb-1">
                {priorityLabels[hoveredPriority]}
            </div>
            <div className="text-xs space-y-1">
                <div>Tasks: {totalByPriority}</div>
                <div>Completed: {completedByPriority}</div>
                <div>Progress: {percentage}%</div>
            </div>
        </div>
    );
});

// Basic 3D scene component - Performance optimized
function Scene({
    todoState,
    performanceLevel,
    hoveredPriority,
    setHoveredPriority
}: {
    todoState: TodoState;
    performanceLevel: 'low' | 'medium' | 'high';
    hoveredPriority: 'high' | 'medium' | 'low' | null;
    setHoveredPriority: (priority: 'high' | 'medium' | 'low' | null) => void;
}) {
    return (
        <>
            <ambientLight intensity={0.4} />
            <directionalLight
                position={[5, 5, 5]}
                intensity={0.8}
                castShadow={performanceLevel === 'high'}
            />
            {performanceLevel !== 'low' && (
                <pointLight
                    position={[-5, 5, 5]}
                    intensity={0.3}
                    color="#fbbf24"
                />
            )}
            <PriorityProgressBar
                todoState={todoState}
                performanceLevel={performanceLevel}
                hoveredPriority={hoveredPriority}
                setHoveredPriority={setHoveredPriority}
            />
        </>
    );
}

function LoadingFallback() {
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

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
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





function FallbackVisualization({ todoState }: { todoState: TodoState }) {
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
                {completionPercentage === 100 && (
                    <div className="mt-3 text-green-600 font-medium animate-pulse">
                        🎉 All tasks completed!
                    </div>
                )}
            </div>
        </div>
    );
}

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
        // When filtered count changes, we know filters have been applied
        if (previousFilteredCount.current !== todoState.totalCount) {
            previousFilteredCount.current = todoState.totalCount;
            // The 3D visualization will automatically update through the todoState prop
            // and the enhanced lerp factor in useFrame will provide smooth transitions
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
                    frameloop: 'demand' as const,
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
        }, 100); // Small delay to show loading state

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
