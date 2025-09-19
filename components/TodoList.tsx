'use client';

import { TodoItem } from './TodoItem';
import type { Todo, Priority } from '../types/todo';

interface TodoListProps {
    todos: Todo[];
    filteredTodos: Todo[];
    hasFilters: boolean;
    totalCount: number;
    onToggleTodo: (id: string) => void;
    onDeleteTodo: (id: string) => void;
    onEditTodo: (id: string, text: string, description?: string, priority?: Priority) => void;
}

export function TodoList({ todos, filteredTodos, hasFilters, totalCount, onToggleTodo, onDeleteTodo, onEditTodo }: TodoListProps) {
    // Use filteredTodos for display when filters are active, otherwise use all todos
    const displayTodos = hasFilters ? filteredTodos : todos;
    const displayCount = displayTodos.length;

    // Show empty state when no tasks exist at all
    if (totalCount === 0) {
        return (
            <div
                className="text-center py-8 sm:py-12"
                role="region"
                aria-label="Empty task list"
            >
                <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 mb-4 text-gray-300 animate-pulse">
                    <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        className="w-full h-full"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                    </svg>
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    No tasks yet
                </h3>
                <p className="text-sm sm:text-base text-gray-500 max-w-sm mx-auto px-4">
                    Get started by adding your first task above. Stay organized and track your progress!
                </p>
                <div className="mt-4 text-xs text-gray-400">
                    Tip: Use the form above to create your first task
                </div>
            </div>
        );
    }

    // Show filtered empty state when filters are active but no tasks match
    if (hasFilters && filteredTodos.length === 0) {
        return (
            <div
                className="text-center py-8 sm:py-12"
                role="region"
                aria-label="No matching tasks"
            >
                <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 mb-4 text-gray-300">
                    <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        className="w-full h-full"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    No matching tasks
                </h3>
                <p className="text-sm sm:text-base text-gray-500 max-w-sm mx-auto px-4">
                    No tasks match your current search and filter criteria. Try adjusting your filters or search terms.
                </p>
                <div className="mt-4 text-xs text-gray-400">
                    {totalCount} total tasks available
                </div>
            </div>
        );
    }

    const incompleteTodos = displayTodos.filter(todo => !todo.completed);
    const completedTodos = displayTodos.filter(todo => todo.completed);

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Result Count Display - Only show when filters are active */}
            {hasFilters && displayCount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 shadow-accent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg
                                className="w-5 h-5 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <span className="text-sm font-medium text-blue-800">
                                Filtered Results
                            </span>
                        </div>
                        <span className="text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                            {displayCount} of {totalCount} tasks
                        </span>
                    </div>
                </div>
            )}

            {incompleteTodos.length > 0 && (
                <section aria-labelledby="active-tasks-heading">
                    <h3
                        id="active-tasks-heading"
                        className="text-sm font-medium text-gray-700 mb-3 px-1 flex items-center gap-2"
                    >
                        <span>Active Tasks ({incompleteTodos.length})</span>
                        <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                            aria-hidden="true"
                            title="Active tasks indicator"
                        ></div>
                    </h3>
                    <ul
                        className="space-y-2 sm:space-y-3"
                        role="list"
                        aria-label={`${incompleteTodos.length} active tasks`}
                        aria-describedby="active-tasks-heading"
                    >
                        {incompleteTodos.map((todo, index) => (
                            <li
                                key={todo.id}
                                className="animate-in slide-in-from-top-2 fade-in duration-300 transform hover:scale-[1.02] transition-transform"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <TodoItem
                                    todo={todo}
                                    onToggle={onToggleTodo}
                                    onDelete={onDeleteTodo}
                                    onEdit={onEditTodo}
                                />
                            </li>
                        ))}
                    </ul>
                </section>
            )}


            {completedTodos.length > 0 && (
                <section aria-labelledby="completed-tasks-heading">
                    <h3
                        id="completed-tasks-heading"
                        className="text-sm font-medium text-gray-700 mb-3 px-1 flex items-center gap-2"
                    >
                        <span>Completed ({completedTodos.length})</span>
                        <svg
                            className="w-4 h-4 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </h3>
                    <ul
                        className="space-y-2 sm:space-y-3"
                        role="list"
                        aria-label={`${completedTodos.length} completed tasks`}
                        aria-describedby="completed-tasks-heading"
                    >
                        {completedTodos.map((todo, index) => (
                            <li
                                key={todo.id}
                                className="animate-in slide-in-from-top-2 fade-in duration-300 transform hover:scale-[1.02] transition-transform"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <TodoItem
                                    todo={todo}
                                    onToggle={onToggleTodo}
                                    onDelete={onDeleteTodo}
                                    onEdit={onEditTodo}
                                />
                            </li>
                        ))}
                    </ul>
                </section>
            )}


            {displayTodos.length > 0 && (
                <section
                    className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                    aria-labelledby="progress-summary-heading"
                    role="region"
                >
                    <h4
                        id="progress-summary-heading"
                        className="sr-only"
                    >
                        Task completion progress summary
                    </h4>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-sm">
                        <span className="text-gray-600 flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {hasFilters ? 'Filtered Progress:' : 'Progress:'} {completedTodos.length} of {displayTodos.length} tasks completed
                        </span>
                        <span className={`font-semibold text-base sm:text-sm px-2 py-1 rounded-full border ${completedTodos.length === displayTodos.length
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : completedTodos.length > displayTodos.length / 2
                                ? 'bg-blue-100 text-blue-700 border-blue-200'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}>
                            {displayTodos.length > 0 ? Math.round((completedTodos.length / displayTodos.length) * 100) : 0}%
                        </span>
                    </div>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            className={`h-3 rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${completedTodos.length === displayTodos.length
                                ? 'from-[var(--success-500)] to-[var(--success-600)]'
                                : 'from-[var(--primary-600)] to-[var(--accent-600)]'
                                }`}
                            style={{
                                width: `${displayTodos.length > 0 ? (completedTodos.length / displayTodos.length) * 100 : 0}%`
                            }}
                            role="progressbar"
                            aria-valuenow={completedTodos.length}
                            aria-valuemin={0}
                            aria-valuemax={displayTodos.length}
                            aria-label={`${completedTodos.length} of ${displayTodos.length} tasks completed, ${displayTodos.length > 0 ? Math.round((completedTodos.length / displayTodos.length) * 100) : 0}% progress`}
                        />
                    </div>

                    {/* Motivational message */}
                    <div className="mt-2 text-xs text-center">
                        {completedTodos.length === displayTodos.length ? (
                            <span className="text-green-600 font-semibold">
                                🎉 {hasFilters ? 'All filtered tasks completed!' : 'All tasks completed!'} Great job!
                            </span>
                        ) : completedTodos.length > displayTodos.length / 2 ? (
                            <span className="text-blue-600 font-medium">🚀 You&apos;re more than halfway there!</span>
                        ) : completedTodos.length > 0 ? (
                            <span className="text-gray-600">✨ Keep going, you&apos;re making progress!</span>
                        ) : (
                            <span className="text-gray-500">📝 Start checking off tasks to see your progress!</span>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
