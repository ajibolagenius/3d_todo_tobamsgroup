'use client';

import React from 'react';
import { GlassCylinderProgress } from './GlassCylinderProgress';
import type { TodoState } from '../../types/todo';

export function Scene({
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
            <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow={performanceLevel === 'high'} />
            {performanceLevel !== 'low' && (
                <pointLight position={[-5, 5, 5]} intensity={0.3} color="#fbbf24" />
            )}
            <GlassCylinderProgress
                todoState={todoState}
                performanceLevel={performanceLevel}
                hoveredPriority={hoveredPriority}
                setHoveredPriority={setHoveredPriority}
            />
        </>
    );
}

export default Scene;

