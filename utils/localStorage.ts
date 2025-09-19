import type { Todo, StoredTodoData, Priority, FilterState } from '../types/todo';
import { defaultFilterState } from './filters';

const STORAGE_KEY = 'todo-app-data';
const STORAGE_VERSION = '4.0.0'; // Updated version for search and filter support

/**
 * Safely parse JSON data with error handling
 */
function safeJsonParse<T>(data: string | null, fallback: T): T {
    if (!data) return fallback;

    try {
        return JSON.parse(data);
    } catch (error) {
        console.warn('Failed to parse localStorage data:', error);
        return fallback;
    }
}

/**
 * Check if localStorage is available in the current environment
 */
export function isLocalStorageAvailable(): boolean {
    try {
        const testKey = '__localStorage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
}

/**
 * Migrate old todo data to include priority and description fields
 */
function migrateTodoData(todo: any): Todo {
    const now = new Date();
    return {
        ...todo,
        priority: (todo.priority as Priority) || 'medium', // Default to medium priority for existing todos
        description: todo.description || undefined, // Preserve existing description or set to undefined
        createdAt: todo.createdAt ? new Date(todo.createdAt) : now,
        updatedAt: todo.updatedAt ? new Date(todo.updatedAt) : now
    };
}

/**
 * Load todos from localStorage with proper error handling and data migration
 */
export function loadTodosFromStorage(): Todo[] {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage is not available');
        return [];
    }

    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        const parsedData = safeJsonParse<StoredTodoData | null>(storedData, null);

        if (!parsedData || !Array.isArray(parsedData.todos)) {
            return [];
        }

        // Handle data migration for older versions
        const migratedTodos = parsedData.todos.map(migrateTodoData);

        // If we migrated data from an older version, save the updated format
        if (parsedData.version !== STORAGE_VERSION) {
            console.log(`Migrating todo data from version ${parsedData.version} to ${STORAGE_VERSION}`);
            saveTodosToStorage(migratedTodos, parsedData.filters);
        }

        return migratedTodos;
    } catch (error) {
        console.error('Error loading todos from localStorage:', error);
        return [];
    }
}

/**
 * Load filter state from localStorage with proper error handling
 */
export function loadFiltersFromStorage(): FilterState {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage is not available');
        return defaultFilterState;
    }

    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        const parsedData = safeJsonParse<StoredTodoData | null>(storedData, null);

        if (!parsedData || !parsedData.filters) {
            return defaultFilterState;
        }

        // Validate filter state structure
        const filters = parsedData.filters;
        return {
            searchQuery: typeof filters.searchQuery === 'string' ? filters.searchQuery : '',
            status: ['all', 'completed', 'incomplete'].includes(filters.status) ? filters.status : 'all',
            priority: ['all', 'high', 'medium', 'low'].includes(filters.priority) ? filters.priority : 'all',
        };
    } catch (error) {
        console.error('Error loading filters from localStorage:', error);
        return defaultFilterState;
    }
}

/**
 * Save todos to localStorage with proper error handling
 */
export function saveTodosToStorage(todos: Todo[], filters?: FilterState): boolean {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage is not available');
        return false;
    }

    try {
        // Load existing data to preserve filters if not provided
        let existingFilters: FilterState | undefined = filters;
        if (!existingFilters) {
            const existingData = localStorage.getItem(STORAGE_KEY);
            const parsedData = safeJsonParse<StoredTodoData | null>(existingData, null);
            existingFilters = parsedData?.filters;
        }

        const dataToStore: StoredTodoData = {
            todos,
            filters: existingFilters,
            version: STORAGE_VERSION,
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
        return true;
    } catch (error) {
        console.error('Error saving todos to localStorage:', error);
        return false;
    }
}

/**
 * Save filter state to localStorage with proper error handling
 */
export function saveFiltersToStorage(filters: FilterState): boolean {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage is not available');
        return false;
    }

    try {
        // Load existing data to preserve todos
        const existingData = localStorage.getItem(STORAGE_KEY);
        const parsedData = safeJsonParse<StoredTodoData | null>(existingData, null);

        const dataToStore: StoredTodoData = {
            todos: parsedData?.todos || [],
            filters,
            version: STORAGE_VERSION,
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
        return true;
    } catch (error) {
        console.error('Error saving filters to localStorage:', error);
        return false;
    }
}

/**
 * Clear all todo data from localStorage
 */
export function clearTodosFromStorage(): boolean {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage is not available');
        return false;
    }

    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing todos from localStorage:', error);
        return false;
    }
}

/**
 * Get storage usage information
 */
export function getStorageInfo(): { hasData: boolean; version?: string; lastUpdated?: string } {
    if (!isLocalStorageAvailable()) {
        return { hasData: false };
    }

    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        const parsedData = safeJsonParse<StoredTodoData | null>(storedData, null);

        if (!parsedData) {
            return { hasData: false };
        }

        return {
            hasData: true,
            version: parsedData.version,
            lastUpdated: parsedData.lastUpdated
        };
    } catch (error) {
        console.error('Error getting storage info:', error);
        return { hasData: false };
    }
}
