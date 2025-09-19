'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { TodoState, Priority, FilterStatus, FilterPriority } from '../types/todo';
import { useTodos } from '../hooks/useTodos';
import { ErrorBoundary } from '../components/ErrorBoundary';

interface TodoContextType {
    state: TodoState;
    addTodo: (text: string, description?: string, priority?: Priority) => void;
    toggleTodo: (id: string) => void;
    deleteTodo: (id: string) => void;
    editTodo: (id: string, text: string, description?: string, priority?: Priority) => void;
    setSearchQuery: (query: string) => void;
    setStatusFilter: (status: FilterStatus) => void;
    setPriorityFilter: (priority: FilterPriority) => void;
    clearFilters: () => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

interface TodoProviderProps {
    children: ReactNode;
}

export function TodoProvider({ children }: TodoProviderProps) {
    const {
        state,
        addTodo,
        toggleTodo,
        deleteTodo,
        editTodo,
        setSearchQuery,
        setStatusFilter,
        setPriorityFilter,
        clearFilters
    } = useTodos();

    const value: TodoContextType = {
        state,
        addTodo,
        toggleTodo,
        deleteTodo,
        editTodo,
        setSearchQuery,
        setStatusFilter,
        setPriorityFilter,
        clearFilters,
    };

    return (
        <ErrorBoundary
            fallback={
                <div className="p-8 text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">
                        Todo App Error
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Something went wrong with the todo application. Please refresh the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Refresh Page
                    </button>
                </div>
            }
        >
            <TodoContext.Provider value={value}>
                {children}
            </TodoContext.Provider>
        </ErrorBoundary>
    );
}

export function useTodoContext(): TodoContextType {
    const context = useContext(TodoContext);
    if (context === undefined) {
        throw new Error('useTodoContext must be used within a TodoProvider');
    }
    return context;
}
