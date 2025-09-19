/**
 * Priority levels for todos
 */
export type Priority = 'high' | 'medium' | 'low';

/**
 * Filter status options for todos
 */
export type FilterStatus = 'all' | 'completed' | 'incomplete';

/**
 * Filter priority options for todos
 */
export type FilterPriority = 'all' | 'high' | 'medium' | 'low';

/**
 * Filter state interface for search and filtering functionality
 */
export interface FilterState {
    searchQuery: string;
    status: FilterStatus;
    priority: FilterPriority;
}

/**
 * Core Todo interface representing a single task
 */
export interface Todo {
    id: string;
    text: string;
    description?: string;
    completed: boolean;
    priority: Priority;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * TodoState interface representing the complete state of the todo application
 */
export interface TodoState {
    todos: Todo[];
    filteredTodos: Todo[];
    filters: FilterState;
    completedCount: number;
    totalCount: number;
    completionPercentage: number;
    priorityCounts: {
        high: number;
        medium: number;
        low: number;
    };
}

/**
 * Action types for todo state management
 */
export type TodoAction =
    | { type: 'ADD_TODO'; payload: { text: string; description?: string; priority: Priority } }
    | { type: 'TOGGLE_TODO'; payload: { id: string } }
    | { type: 'DELETE_TODO'; payload: { id: string } }
    | { type: 'EDIT_TODO'; payload: { id: string; text: string; description?: string; priority: Priority } }
    | { type: 'SET_SEARCH_QUERY'; payload: { query: string } }
    | { type: 'SET_STATUS_FILTER'; payload: { status: FilterStatus } }
    | { type: 'SET_PRIORITY_FILTER'; payload: { priority: FilterPriority } }
    | { type: 'CLEAR_FILTERS' }
    | { type: 'LOAD_TODOS'; payload: { todos: Todo[] } }
    | { type: 'LOAD_FILTERS'; payload: { filters: FilterState } };

/**
 * Context type for TodoContext provider
 */
export interface TodoContextType {
    state: TodoState;
    dispatch: React.Dispatch<TodoAction>;
    addTodo: (text: string, description?: string, priority?: Priority) => void;
    toggleTodo: (id: string) => void;
    deleteTodo: (id: string) => void;
    editTodo: (id: string, text: string, description?: string, priority?: Priority) => void;
    setSearchQuery: (query: string) => void;
    setStatusFilter: (status: FilterStatus) => void;
    setPriorityFilter: (priority: FilterPriority) => void;
    clearFilters: () => void;
}

/**
 * Local storage data structure for persistence
 */
export interface StoredTodoData {
    todos: Todo[];
    filters?: FilterState;
    version: string;
    lastUpdated: string;
}
