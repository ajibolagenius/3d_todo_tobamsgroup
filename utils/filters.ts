import type { Todo, FilterState, FilterStatus, FilterPriority } from '../types/todo';

/**
 * Default filter state
 */
export const defaultFilterState: FilterState = {
    searchQuery: '',
    status: 'all',
    priority: 'all',
};

/**
 * Filter todos based on search query
 * Searches both task text and description
 */
export function filterBySearch(todos: Todo[], searchQuery: string): Todo[] {
    if (!searchQuery.trim()) {
        return todos;
    }

    const query = searchQuery.toLowerCase().trim();
    return todos.filter(todo => {
        const textMatch = todo.text.toLowerCase().includes(query);
        const descriptionMatch = todo.description?.toLowerCase().includes(query) || false;
        return textMatch || descriptionMatch;
    });
}

/**
 * Filter todos based on completion status
 */
export function filterByStatus(todos: Todo[], status: FilterStatus): Todo[] {
    switch (status) {
        case 'completed':
            return todos.filter(todo => todo.completed);
        case 'incomplete':
            return todos.filter(todo => !todo.completed);
        case 'all':
        default:
            return todos;
    }
}

/**
 * Filter todos based on priority level
 */
export function filterByPriority(todos: Todo[], priority: FilterPriority): Todo[] {
    if (priority === 'all') {
        return todos;
    }
    return todos.filter(todo => todo.priority === priority);
}

/**
 * Apply all filters to todos array
 * Combines search, status, and priority filters using AND logic
 */
export function applyFilters(todos: Todo[], filters: FilterState): Todo[] {
    let filteredTodos = todos;

    // Apply search filter
    filteredTodos = filterBySearch(filteredTodos, filters.searchQuery);

    // Apply status filter
    filteredTodos = filterByStatus(filteredTodos, filters.status);

    // Apply priority filter
    filteredTodos = filterByPriority(filteredTodos, filters.priority);

    return filteredTodos;
}

/**
 * Check if any filters are active (non-default)
 */
export function hasActiveFilters(filters: FilterState): boolean {
    return (
        filters.searchQuery.trim() !== '' ||
        filters.status !== 'all' ||
        filters.priority !== 'all'
    );
}

/**
 * Validate search query input
 */
export function validateSearchQuery(query: string): { isValid: boolean; sanitizedValue: string; error?: string } {
    if (typeof query !== 'string') {
        return { isValid: false, sanitizedValue: '', error: 'Search query must be a string' };
    }

    // Allow empty search queries
    const sanitized = query.trim();

    // Check for reasonable length limit
    if (sanitized.length > 500) {
        return { isValid: false, sanitizedValue: '', error: 'Search query is too long' };
    }

    return { isValid: true, sanitizedValue: sanitized };
}

/**
 * Validate filter status value
 */
export function validateFilterStatus(status: string): { isValid: boolean; value: FilterStatus; error?: string } {
    const validStatuses: FilterStatus[] = ['all', 'completed', 'incomplete'];

    if (!validStatuses.includes(status as FilterStatus)) {
        return { isValid: false, value: 'all', error: 'Invalid filter status' };
    }

    return { isValid: true, value: status as FilterStatus };
}

/**
 * Validate filter priority value
 */
export function validateFilterPriority(priority: string): { isValid: boolean; value: FilterPriority; error?: string } {
    const validPriorities: FilterPriority[] = ['all', 'high', 'medium', 'low'];

    if (!validPriorities.includes(priority as FilterPriority)) {
        return { isValid: false, value: 'all', error: 'Invalid filter priority' };
    }

    return { isValid: true, value: priority as FilterPriority };
}
