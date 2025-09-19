'use client';

import React from 'react';
import type { TodoState } from '../../types/todo';

export function PriorityHoverInfo({
    hoveredPriority,
    todoState
}: {
    hoveredPriority: 'high' | 'medium' | 'low' | null;
    todoState: TodoState;
}) {
    if (!hoveredPriority) return null;

    const { priorityCounts, filteredTodos, todos } = todoState;
    const todosToUse = filteredTodos || todos;
    const completedByPriority = todosToUse.filter(todo => todo.completed && todo.priority === hoveredPriority).length;
    const totalByPriority = priorityCounts[hoveredPriority];
    const percentage = totalByPriority > 0 ? Math.round((completedByPriority / totalByPriority) * 100) : 0;

    const priorityLabels = {
        high: 'High Priority',
        medium: 'Medium Priority',
        low: 'Low Priority'
    } as const;

    const priorityColors = {
        high: 'text-red-600 bg-red-50 border-red-200',
        medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        low: 'text-green-600 bg-green-50 border-green-200'
    } as const;

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
}

export default PriorityHoverInfo;

