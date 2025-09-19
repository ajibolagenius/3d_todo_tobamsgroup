'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MemoryManager } from '../../utils/performance';

export const CelebrationParticles = React.memo(function CelebrationParticles({
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

    const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const particles = useMemo(() => {
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

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

    useFrame((state) => {
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
    });

    if (!isActive) return null;

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={particleCount} array={particles.positions} itemSize={3} />
                <bufferAttribute attach="attributes-color" count={particleCount} array={particles.colors} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={performanceLevel === 'low' ? 0.03 : 0.05} vertexColors transparent opacity={0.8} sizeAttenuation />
        </points>
    );
});

export default CelebrationParticles;

