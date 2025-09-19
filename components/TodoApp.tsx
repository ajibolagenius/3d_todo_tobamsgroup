'use client';

import { useEffect } from 'react';
import { TodoProvider, useTodoContext } from '../contexts/TodoContext';
import { TodoForm } from './TodoForm';
import { TodoList } from './TodoList';
import { SearchAndFilters } from './SearchAndFilters';
import ProgressVisualizationLazy from './ProgressVisualizationLazy';
import { performanceMonitor } from '../utils/performance';
import { hasActiveFilters } from '../utils/filters';
import { Card } from './ui/Card';

function TodoAppContent() {
    const { state, addTodo, toggleTodo, deleteTodo, editTodo } = useTodoContext();

    useEffect(() => {
        performanceMonitor.start();

        if (process.env.NODE_ENV === 'development') {
            const interval = setInterval(() => {
                const metrics = performanceMonitor.getMetrics();
                if (metrics.fps < 55 || metrics.memoryUsage > 50) {
                    console.warn('Performance warning:', metrics);
                }
            }, 5000);

            return () => {
                clearInterval(interval);
                performanceMonitor.stop();
            };
        }

        return () => performanceMonitor.stop();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 relative">
            <a
                href="#main-content"
                className="skip-link"
                aria-label="Skip to main content"
            >
                Skip to main content
            </a>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
                <header className="text-center mb-8 sm:mb-12 lg:mb-16">
                    <h1 className="heading-1 sm:text-4xl lg:text-5xl xl:text-6xl bg-gradient-to-r from-[var(--primary-600)] via-[var(--accent-600)] to-[var(--primary-700)] bg-clip-text text-transparent mb-4 sm:mb-6">
                        3D Todo App
                    </h1>
                    <p className="body-large text-neutral-600 max-w-2xl mx-auto">
                        Manage your tasks with style and watch your progress come to life in 3D
                    </p>
                </header>

                <main
                    id="main-content"
                    className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8"
                    role="main"
                    aria-label="Todo application main content"
                >

                    <div className="xl:col-span-2 stack-lg">
                        {/* Add Task Section */}
                        <Card as="section" aria-labelledby="add-task-heading" className="p-6 sm:p-8">
                            <h2 id="add-task-heading" className="heading-3 mb-6 bg-gradient-to-r from-[var(--primary-700)] to-[var(--accent-700)] bg-clip-text text-transparent">
                                Add New Task
                            </h2>
                            <TodoForm onAddTodo={addTodo} />
                        </Card>

                        {/* Search and Filters Section */}
                        {state.totalCount > 0 && (
                            <Card as="section" aria-labelledby="search-filters-heading" className="p-6 sm:p-8">
                                <h2 id="search-filters-heading" className="heading-3 mb-6 bg-gradient-to-r from-[var(--primary-700)] to-[var(--accent-700)] bg-clip-text text-transparent">
                                    Search & Filter
                                </h2>
                                <SearchAndFilters />
                            </Card>
                        )}

                        {/* Task List Section */}
                        <Card as="section" aria-labelledby="task-list-heading" className="p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 id="task-list-heading" className="heading-3 bg-gradient-to-r from-[var(--primary-700)] to-[var(--accent-700)] bg-clip-text text-transparent">
                                    Your Tasks
                                </h2>
                                {state.totalCount > 0 && (
                                    <div className="badge-primary">
                                        {state.filteredTodos.length} of {state.totalCount} tasks
                                    </div>
                                )}
                            </div>
                            <TodoList
                                todos={state.todos}
                                filteredTodos={state.filteredTodos}
                                hasFilters={hasActiveFilters(state.filters)}
                                totalCount={state.totalCount}
                                onToggleTodo={toggleTodo}
                                onDeleteTodo={deleteTodo}
                                onEditTodo={editTodo}
                            />
                        </Card>
                    </div>

                    {/* Progress Visualization Section */}
                    <div className="xl:col-span-1 order-first xl:order-last">
                        <div className="xl:sticky xl:top-8 stack-lg">
                            {/* Progress Overview Card */}
                            <section aria-labelledby="progress-heading" className="card p-6 sm:p-8">
                                <h2 id="progress-heading" className="heading-3 mb-6 text-neutral-900">
                                    Progress Overview
                                </h2>

                                <div className="stack-md">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-neutral-light rounded-lg">
                                            <div className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-1">
                                                {state.totalCount}
                                            </div>
                                            <div className="body-small text-neutral-600">
                                                Total Tasks
                                            </div>
                                        </div>
                                        <div className="text-center p-4 bg-primary-light rounded-lg">
                                            <div className="text-2xl sm:text-3xl font-bold text-primary-700 mb-1">
                                                {state.completedCount}
                                            </div>
                                            <div className="body-small text-primary-600">
                                                Completed
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="body-small text-neutral-600">
                                                Progress
                                            </span>
                                            <span className="heading-4 text-primary-600">
                                                {state.completionPercentage}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-neutral-200 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full transition-all duration-700 ease-out"
                                                style={{
                                                    width: `${state.completionPercentage}%`
                                                }}
                                                role="progressbar"
                                                aria-valuenow={state.completionPercentage}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                                aria-label={`${state.completionPercentage}% of tasks completed`}
                                            />
                                        </div>
                                    </div>

                                    {/* Priority Breakdown */}
                                    {state.totalCount > 0 && (
                                        <div className="space-y-2">
                                            <div className="body-small text-neutral-600 font-medium">Priority Breakdown</div>
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="p-2 bg-error-50 rounded border border-error-200">
                                                    <div className="text-sm font-semibold text-error-700">
                                                        {state.priorityCounts.high}
                                                    </div>
                                                    <div className="text-xs text-error-600">High</div>
                                                </div>
                                                <div className="p-2 bg-warning-50 rounded border border-warning-200">
                                                    <div className="text-sm font-semibold text-warning-700">
                                                        {state.priorityCounts.medium}
                                                    </div>
                                                    <div className="text-xs text-warning-600">Medium</div>
                                                </div>
                                                <div className="p-2 bg-success-50 rounded border border-success-200">
                                                    <div className="text-sm font-semibold text-success-700">
                                                        {state.priorityCounts.low}
                                                    </div>
                                                    <div className="text-xs text-success-600">Low</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* 3D Visualization Card */}
                            <Card as="section" aria-labelledby="3d-viz-heading" className="p-6 sm:p-8">
                                <h2 id="3d-viz-heading" className="heading-3 mb-6 bg-gradient-to-r from-[var(--primary-700)] to-[var(--accent-700)] bg-clip-text text-transparent">
                                    3D Visualization
                                </h2>
                                <ProgressVisualizationLazy todoState={state} />
                            </Card>

                            {/* Motivational Message Card */}
                            {state.totalCount > 0 && (
                                <Card className="p-6 bg-gradient-to-r from-[var(--primary-50)] to-[var(--accent-50)] border-primary-200">
                                    <p className="body-small text-center font-medium">
                                        {state.completionPercentage === 100 ? (
                                            <span className="text-success-700">
                                                🎉 Amazing! All tasks completed!
                                            </span>
                                        ) : state.completionPercentage >= 75 ? (
                                            <span className="text-accent-700">
                                                🚀 You&apos;re almost there! Keep going!
                                            </span>
                                        ) : state.completionPercentage >= 50 ? (
                                            <span className="text-primary-700">
                                                💪 Great progress! You&apos;re halfway done!
                                            </span>
                                        ) : state.completionPercentage > 0 ? (
                                            <span className="text-accent-700">
                                                ✨ Nice start! Every task counts!
                                            </span>
                                        ) : (
                                            <span className="text-neutral-600">
                                                📝 Add your first task to get started!
                                            </span>
                                        )}
                                    </p>
                                </Card>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export function TodoApp() {
    return (
        <TodoProvider>
            <TodoAppContent />
        </TodoProvider>
    );
}
