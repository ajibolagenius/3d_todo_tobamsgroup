'use client';

import React from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import type { TodoState } from '../../types/todo';
import { CelebrationParticles } from './CelebrationParticles';

function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
        case 'high': return '#ef4444';
        case 'medium': return '#f59e0b';
        case 'low': return '#10b981';
        default: return '#6b7280';
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

export const GlassCylinderProgress = React.memo(function GlassCylinderProgress({
    todoState,
    performanceLevel,
    hoveredPriority,
    setHoveredPriority,
}: {
    todoState: TodoState;
    performanceLevel: 'low' | 'medium' | 'high';
    hoveredPriority: 'high' | 'medium' | 'low' | null;
    setHoveredPriority: (priority: 'high' | 'medium' | 'low' | null) => void;
}) {
    const groupRef = React.useRef<THREE.Group>(null);
    const glassRef = React.useRef<THREE.Mesh>(null);
    const liquidRef = React.useRef<THREE.Mesh>(null);
    const liquidTopRef = React.useRef<THREE.Mesh>(null);

    const { completionPercentage } = todoState;
    const targetLevel = Math.max(0, Math.min(1, completionPercentage / 100));
    const targetLevelRef = React.useRef(targetLevel);
    const animatedLevel = React.useRef(0);
    const { invalidate } = useThree();

    const geometrySegments = React.useMemo(() => {
        switch (performanceLevel) {
            case 'low': return 24;
            case 'medium': return 32;
            case 'high': return 48;
            default: return 32;
        }
    }, [performanceLevel]);

    React.useEffect(() => {
        targetLevelRef.current = Math.max(0, Math.min(1, completionPercentage / 100));
        invalidate();
        const scaleY = Math.max(targetLevelRef.current, 0.0001);
        if (liquidRef.current) {
            liquidRef.current.scale.set(1, scaleY, 1);
            liquidRef.current.position.y = -2 + 2 * scaleY;
        }
        if (liquidTopRef.current) {
            liquidTopRef.current.position.y = -2 + 4 * scaleY;
            liquidTopRef.current.visible = targetLevelRef.current > 0.001;
        }
    }, [completionPercentage, invalidate]);

    useFrame((state, delta) => {
        if (!liquidRef.current || !groupRef.current) return;
        const lerpFactor = Math.min(delta * 3, 1);
        animatedLevel.current = THREE.MathUtils.lerp(animatedLevel.current, targetLevelRef.current, lerpFactor);

        const scaleY = Math.max(animatedLevel.current, 0.0001);
        liquidRef.current.scale.set(1, scaleY, 1);
        liquidRef.current.position.y = -2 + 2 * scaleY;

        if (liquidTopRef.current) {
            const wobble = performanceLevel === 'low' ? 0 : Math.sin(state.clock.elapsedTime * 2) * 0.03;
            liquidTopRef.current.position.y = -2 + 4 * scaleY + wobble;
            liquidTopRef.current.visible = animatedLevel.current > 0.001;
            liquidTopRef.current.scale.set(1, 0.18, 1);
        }

        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    });

    const liquidColor = '#C2F1D5';

    return (
        <group ref={groupRef}>
            <mesh ref={liquidRef} position={[0, -2, 0]} renderOrder={1}>
                <cylinderGeometry args={[0.72, 0.72, 4, geometrySegments]} />
                <meshStandardMaterial color={liquidColor} transparent opacity={0.9} emissive={liquidColor} emissiveIntensity={0.12} depthWrite />
            </mesh>

            <mesh ref={liquidTopRef} position={[0, -2, 0]} renderOrder={1}>
                <sphereGeometry args={[0.72, geometrySegments, geometrySegments]} />
                <meshStandardMaterial color={liquidColor} transparent opacity={0.85} depthWrite />
            </mesh>

            <mesh ref={glassRef} position={[0, 0, 0]} renderOrder={2}
                onPointerEnter={() => setHoveredPriority(null)}
                onPointerLeave={() => setHoveredPriority(null)}
            >
                <cylinderGeometry args={[0.82, 0.82, 4, geometrySegments]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    transmission={0.6}
                    transparent
                    opacity={0.18}
                    roughness={0.08}
                    thickness={0.3}
                    ior={1.2}
                    metalness={0}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>

            <mesh position={[0, 2.15, 0]}>
                <cylinderGeometry args={[0.83, 0.83, 0.18, geometrySegments]} />
                <meshStandardMaterial color={liquidColor} />
            </mesh>

            <mesh position={[0, -2.35, 0]}>
                <cylinderGeometry args={[0.9, 0.9, 0.7, geometrySegments]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>

            <CelebrationParticles
                isActive={completionPercentage >= 100}
                performanceLevel={performanceLevel}
                priorityCounts={todoState.priorityCounts}
            />
        </group>
    );
});

export default GlassCylinderProgress;

