'use client';

import { useState, useCallback } from 'react';
import { useTodoContext } from '../contexts/TodoContext';
import { FilterStatus, FilterPriority } from '../types/todo';
import { hasActiveFilters } from '../utils/filters';

export function SearchAndFilters() {
    const { state, setSearchQuery, setStatusFilter, setPriorityFilter, clearFilters } = useTodoContext();
    const [searchValue, setSearchValue] = useState(state.filters.searchQuery);

    // Handle search input changes with real-time filtering
    const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchValue(value);
        setSearchQuery(value);
    }, [setSearchQuery]);

    // Clear search functionality
    const handleClearSearch = useCallback(() => {
        setSearchValue('');
        setSearchQuery('');
    }, [setSearchQuery]);

    // Handle status filter changes
    const handleStatusFilterChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const status = event.target.value as FilterStatus;
        setStatusFilter(status);
    }, [setStatusFilter]);

    // Handle priority filter changes
    const handlePriorityFilterChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const priority = event.target.value as FilterPriority;
        setPriorityFilter(priority);
    }, [setPriorityFilter]);

    // Handle clear all filters
    const handleClearAllFilters = useCallback(() => {
        setSearchValue('');
        clearFilters();
    }, [clearFilters]);

    const activeFilters = hasActiveFilters(state.filters);
    const filteredCount = state.filteredTodos.length;
    const totalCount = state.totalCount;

    return (
        <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="space-y-3">
                {/* Inline Controls: Search, Status, Priority */}
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <label htmlFor="search-tasks" className="sr-only">
                            Search tasks
                        </label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                                className="h-5 w-5 text-gray-400"
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
                        </div>
                        <input
                            id="search-tasks"
                            type="text"
                            value={searchValue}
                            onChange={handleSearchChange}
                            placeholder="Search tasks and descriptions..."
                            className="input w-full pl-10 pr-10 py-3 text-sm sm:text-base"
                        />
                        {searchValue && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors duration-200"
                                aria-label="Clear search"
                            >
                                <svg
                                    className="h-5 w-5 text-gray-400 hover:text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Status Filter */}
                    <div className="min-w-[9rem]">
                        <label htmlFor="status-filter" className="sr-only">Status</label>
                        <select
                            id="status-filter"
                            value={state.filters.status}
                            onChange={handleStatusFilterChange}
                            className="select w-full px-3 py-3 text-sm sm:text-base"
                            aria-label="Filter by status"
                        >
                            <option value="all">All Tasks</option>
                            <option value="incomplete">Incomplete</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {/* Priority Filter */}
                    <div className="min-w-[10rem]">
                        <label htmlFor="priority-filter" className="sr-only">Priority</label>
                        <select
                            id="priority-filter"
                            value={state.filters.priority}
                            onChange={handlePriorityFilterChange}
                            className="select w-full px-3 py-3 text-sm sm:text-base"
                            aria-label="Filter by priority"
                        >
                            <option value="all">All Priorities</option>
                            <option value="high" className="text-red-600">🔴 High Priority</option>
                            <option value="medium" className="text-yellow-600">🟡 Medium Priority</option>
                            <option value="low" className="text-green-600">🟢 Low Priority</option>
                        </select>
                    </div>
                </div>

                {/* Filter Status and Clear Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-neutral-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        {activeFilters ? (
                            <>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Filtered
                                </span>
                                <span>
                                    Showing {filteredCount} of {totalCount} tasks
                                </span>
                            </>
                        ) : (
                            <span>
                                Showing all {totalCount} tasks
                            </span>
                        )}
                    </div>

                    {activeFilters && (
                        <button
                            type="button"
                            onClick={handleClearAllFilters}
                            className="btn-secondary btn-sm inline-flex items-center"
                        >
                            <svg
                                className="w-4 h-4 mr-1.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
