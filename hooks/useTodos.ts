import { useReducer, useEffect, useCallback } from 'react';
import { Todo, TodoState, TodoAction, Priority, FilterState, FilterStatus, FilterPriority } from '../types/todo';
import { loadTodosFromStorage, saveTodosToStorage, loadFiltersFromStorage, saveFiltersToStorage } from '../utils/localStorage';
import { validateTodoText, validateTodoDescription, validateTodoId, validateTodoForStorage } from '../utils/validation';
import { applyFilters, defaultFilterState, validateSearchQuery, validateFilterStatus, validateFilterPriority } from '../utils/filters';

// TodoAction is now imported from types/todo.ts

const initialState: TodoState = {
    todos: [],
    filteredTodos: [],
    filters: defaultFilterState,
    completedCount: 0,
    totalCount: 0,
    completionPercentage: 0,
    priorityCounts: {
        high: 0,
        medium: 0,
        low: 0,
    },
};

function calculateStats(todos: Todo[], filteredTodos: Todo[]): Pick<TodoState, 'completedCount' | 'totalCount' | 'completionPercentage' | 'priorityCounts'> {
    // Calculate stats based on filtered todos for display purposes
    const totalCount = filteredTodos.length;
    const completedCount = filteredTodos.filter(todo => todo.completed).length;
    const completionPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    // Calculate priority counts based on filtered todos
    const priorityCounts = filteredTodos.reduce(
        (counts, todo) => {
            counts[todo.priority]++;
            return counts;
        },
        { high: 0, medium: 0, low: 0 }
    );

    return { completedCount, totalCount, completionPercentage, priorityCounts };
}

function todoReducer(state: TodoState, action: TodoAction): TodoState {
    let newTodos: Todo[] = state.todos;
    let newFilters: FilterState = state.filters;

    switch (action.type) {
        case 'ADD_TODO':
            const now = new Date();
            const newTodo: Todo = {
                id: crypto.randomUUID(),
                text: action.payload.text.trim(),
                description: action.payload.description && action.payload.description.trim() ? action.payload.description.trim() : undefined,
                completed: false,
                priority: action.payload.priority,
                createdAt: now,
                updatedAt: now,
            };
            newTodos = [...state.todos, newTodo];
            break;

        case 'TOGGLE_TODO':
            newTodos = state.todos.map(todo =>
                todo.id === action.payload.id
                    ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
                    : todo
            );
            break;

        case 'DELETE_TODO':
            newTodos = state.todos.filter(todo => todo.id !== action.payload.id);
            break;

        case 'EDIT_TODO':
            newTodos = state.todos.map(todo =>
                todo.id === action.payload.id
                    ? {
                        ...todo,
                        text: action.payload.text.trim(),
                        description: action.payload.description && action.payload.description.trim() ? action.payload.description.trim() : undefined,
                        priority: action.payload.priority,
                        updatedAt: new Date()
                    }
                    : todo
            );
            break;

        case 'SET_SEARCH_QUERY':
            newFilters = { ...state.filters, searchQuery: action.payload.query };
            break;

        case 'SET_STATUS_FILTER':
            newFilters = { ...state.filters, status: action.payload.status };
            break;

        case 'SET_PRIORITY_FILTER':
            newFilters = { ...state.filters, priority: action.payload.priority };
            break;

        case 'CLEAR_FILTERS':
            newFilters = defaultFilterState;
            break;

        case 'LOAD_TODOS':
            newTodos = action.payload.todos;
            break;

        case 'LOAD_FILTERS':
            newFilters = action.payload.filters;
            break;

        default:
            return state;
    }

    // Apply filters to get filtered todos
    const filteredTodos = applyFilters(newTodos, newFilters);
    const stats = calculateStats(newTodos, filteredTodos);

    return {
        todos: newTodos,
        filteredTodos,
        filters: newFilters,
        ...stats,
    };
}

export function useTodos() {
    const [state, dispatch] = useReducer(todoReducer, initialState);

    // Load todos and filters from localStorage on mount
    useEffect(() => {
        const savedTodos = loadTodosFromStorage();
        const savedFilters = loadFiltersFromStorage();

        if (savedTodos.length > 0) {
            dispatch({ type: 'LOAD_TODOS', payload: { todos: savedTodos } });
        }

        // Load filters even if there are no todos
        dispatch({ type: 'LOAD_FILTERS', payload: { filters: savedFilters } });
    }, []);

    // Save todos to localStorage whenever todos change
    useEffect(() => {
        if (state.todos.length > 0 || state.totalCount > 0) {
            saveTodosToStorage(state.todos, state.filters);
        }
    }, [state.todos, state.filters]);

    // Save filters to localStorage whenever filters change
    useEffect(() => {
        saveFiltersToStorage(state.filters);
    }, [state.filters]);

    const addTodo = useCallback((text: string, description?: string, priority: Priority = 'medium') => {
        const textValidation = validateTodoText(text);
        const descriptionValidation = validateTodoDescription(description);

        if (textValidation.isValid && textValidation.sanitizedValue && descriptionValidation.isValid) {
            dispatch({
                type: 'ADD_TODO',
                payload: {
                    text: textValidation.sanitizedValue,
                    description: descriptionValidation.sanitizedValue,
                    priority
                }
            });
        } else {
            const error = textValidation.error || descriptionValidation.error || 'Invalid todo data';
            console.error('Invalid todo data:', error);
            throw new Error(error);
        }
    }, []);

    const toggleTodo = useCallback((id: string) => {
        const validation = validateTodoId(id);
        if (validation.isValid) {
            dispatch({ type: 'TOGGLE_TODO', payload: { id } });
        } else {
            console.error('Invalid todo ID:', validation.error);
            throw new Error(validation.error || 'Invalid todo ID');
        }
    }, []);

    const deleteTodo = useCallback((id: string) => {
        const validation = validateTodoId(id);
        if (validation.isValid) {
            dispatch({ type: 'DELETE_TODO', payload: { id } });
        } else {
            console.error('Invalid todo ID:', validation.error);
            throw new Error(validation.error || 'Invalid todo ID');
        }
    }, []);

    const editTodo = useCallback((id: string, text: string, description?: string, priority: Priority = 'medium') => {
        const textValidation = validateTodoText(text);
        const descriptionValidation = validateTodoDescription(description);
        const idValidation = validateTodoId(id);

        // Check if todo exists
        const existingTodo = state.todos.find(todo => todo.id === id);
        if (!existingTodo) {
            const error = 'Todo not found';
            console.error('Invalid todo data:', error);
            throw new Error(error);
        }

        if (textValidation.isValid && textValidation.sanitizedValue && descriptionValidation.isValid && idValidation.isValid) {
            dispatch({
                type: 'EDIT_TODO',
                payload: {
                    id,
                    text: textValidation.sanitizedValue,
                    description: descriptionValidation.sanitizedValue,
                    priority
                }
            });
        } else {
            const error = textValidation.error || descriptionValidation.error || idValidation.error || 'Invalid todo data';
            console.error('Invalid todo data:', error);
            throw new Error(error);
        }
    }, [state.todos]);

    const setSearchQuery = useCallback((query: string) => {
        const validation = validateSearchQuery(query);
        if (validation.isValid) {
            dispatch({ type: 'SET_SEARCH_QUERY', payload: { query: validation.sanitizedValue } });
        } else {
            console.error('Invalid search query:', validation.error);
            throw new Error(validation.error || 'Invalid search query');
        }
    }, []);

    const setStatusFilter = useCallback((status: FilterStatus) => {
        const validation = validateFilterStatus(status);
        if (validation.isValid) {
            dispatch({ type: 'SET_STATUS_FILTER', payload: { status: validation.value } });
        } else {
            console.error('Invalid filter status:', validation.error);
            throw new Error(validation.error || 'Invalid filter status');
        }
    }, []);

    const setPriorityFilter = useCallback((priority: FilterPriority) => {
        const validation = validateFilterPriority(priority);
        if (validation.isValid) {
            dispatch({ type: 'SET_PRIORITY_FILTER', payload: { priority: validation.value } });
        } else {
            console.error('Invalid filter priority:', validation.error);
            throw new Error(validation.error || 'Invalid filter priority');
        }
    }, []);

    const clearFilters = useCallback(() => {
        dispatch({ type: 'CLEAR_FILTERS' });
    }, []);

    return {
        state,
        dispatch,
        addTodo,
        toggleTodo,
        deleteTodo,
        editTodo,
        setSearchQuery,
        setStatusFilter,
        setPriorityFilter,
        clearFilters,
    };
}
