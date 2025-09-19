# API Documentation

## Overview

The 3D Todo App uses a client-side architecture with local storage for data persistence. This document outlines the internal APIs and interfaces used throughout the application.

## Core Types

### Todo Interface

```typescript
type Priority = 'high' | 'medium' | 'low';

interface Todo {
  id: string;                 // Unique identifier (UUID or similar)
  text: string;               // Task title (max 200 chars)
  description?: string;       // Optional description (max 500 chars)
  completed: boolean;         // Completion status
  priority: Priority;         // Priority level
  createdAt: Date;            // Creation timestamp
  updatedAt: Date;            // Last update timestamp
}
```

### Filter & State Interfaces

```typescript
type FilterStatus = 'all' | 'completed' | 'incomplete';
type FilterPriority = 'all' | 'high' | 'medium' | 'low';

interface FilterState {
  searchQuery: string;
  status: FilterStatus;
  priority: FilterPriority;
}

interface TodoState {
  todos: Todo[];                      // All todos
  filteredTodos: Todo[];              // Todos after applying filters
  filters: FilterState;               // Active filters
  completedCount: number;             // Completed in filtered set
  totalCount: number;                 // Count of filtered set
  completionPercentage: number;       // Based on filtered set
  priorityCounts: {                   // Counts in filtered set
    high: number;
    medium: number;
    low: number;
  };
}
```

### TodoAction Types

```typescript
type TodoAction =
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
```

## Context API

### TodoContext

The main context provider for todo state management.

```typescript
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
```

#### Methods

##### `addTodo(text: string, description?: string, priority = 'medium'): void`
Creates a new todo with optional description and priority.

**Parameters:**
- `text` (string): The todo title (required)
- `description` (string?): Optional details
- `priority` (Priority): 'high' | 'medium' | 'low' (default 'medium')

**Behavior:**
- Generates a unique ID
- Sets completed to false, priority to provided value
- Sets createdAt/updatedAt
- Saves to localStorage
- Updates the UI immediately

##### `toggleTodo(id: string): void`
Toggles the completion status of a todo.

**Parameters:**
- `id` (string): The unique identifier of the todo

**Behavior:**
- Finds the todo by ID
- Toggles the completed status
- Saves to localStorage
- Updates 3D visualization

##### `deleteTodo(id: string): void`
Removes a todo from the list.

**Parameters:**
- `id` (string): The unique identifier of the todo

**Behavior:**
- Removes todo from the array
- Saves updated list to localStorage
- Updates completion percentage

## Custom Hooks

### useTodos

Main hook for todo state management using useReducer.

```typescript
function useTodos(): {
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
```

**Returns:**
- `state`: Current todo state
- `addTodo`: Function to add a new todo
- `toggleTodo`: Function to toggle todo completion
- `deleteTodo`: Function to delete a todo

## Utility Functions

### localStorage.ts

#### `loadTodosFromStorage(): Todo[]`
#### `saveTodosToStorage(todos: Todo[], filters?: FilterState): boolean`
#### `loadFiltersFromStorage(): FilterState`
#### `saveFiltersToStorage(filters: FilterState): boolean`

**Parameters:**
- `todos` (Todo[]): Array of todos to save

**Error Handling:**
- Catches and logs localStorage quota exceeded errors
- Gracefully handles JSON serialization errors

#### `loadTodos(): Todo[]`
Loads todos from localStorage with validation.

**Returns:**
- Array of valid Todo objects
- Empty array if no data or invalid data

**Validation:**
- Checks for required properties
- Validates data types
- Filters out invalid entries

### validation.ts

#### `validateTodoText(text: string): { isValid: boolean; sanitizedValue?: string; error?: string }`

**Parameters:**
- `text` (string): Text to validate

**Returns:**
- `true` if valid, `false` otherwise

**Validation Rules:**
- Must not be empty or only whitespace
- Max length 200, min length 1
- Sanitization removes unsafe patterns; rejects if significantly altered

#### `validateTodoDescription(text?: string): { isValid: boolean; sanitizedValue?: string; error?: string }`

**Parameters:**
- `text` (string): Text to sanitize

**Returns:**
- Sanitized text string

**Sanitization:**
- Trims whitespace
- Optional field; max length 500; sanitized like title

### performance.ts

Key utilities:
- `performanceMonitor`: fps/memory tracking
- `debounce(fn, wait)`, `throttle(fn, limit)`
- `MemoryManager`: register disposables and automatic cleanup

**Parameters:**
- `name` (string): Performance measurement name
- `fn` (function): Function to measure

**Usage:**
```typescript
measurePerformance('todo-render', () => {
  // Expensive operation
});
```

## 3D Component API

### ProgressVisualization Props

```typescript
interface ProgressVisualizationProps {
  todoState: TodoState; // filtered-based metrics used in the scene
}
```

### 3D Scene Configuration

#### Default Settings
- **Camera Position**: [0, 0, 6]
- **Field of View**: 50 degrees
- **Ambient/Directional Lights** tuned per device performance

#### Performance Settings
- **Target FPS**: 60
- **Pixel Ratio**: Capped at 2 for performance
- **Shadow Maps**: Enabled on desktop, disabled on mobile

## Error Handling

### Error Boundaries

The app includes error boundaries for:
- 3D component failures
- localStorage access errors
- Component rendering errors

### Error Types

```typescript
interface AppError {
  type: 'STORAGE_ERROR' | '3D_ERROR' | 'VALIDATION_ERROR';
  message: string;
  details?: any;
}
```

## Browser Compatibility

### Required Features
- ES2020+ support
- localStorage API
- WebGL (for 3D features)
- CSS Grid and Flexbox

### Fallbacks
- 2D progress bar for devices without WebGL
- Graceful degradation for older browsers
- Error messages for unsupported features

## Performance Monitoring

### Metrics Tracked
- 3D rendering frame rate
- Component render times
- localStorage operation times
- Memory usage for 3D scenes

### Performance Notes
- Debounced search input reduces filter churn
- Device-level adjustments for shadows and DPR

## Security Considerations

### Input Validation
- All user input is validated and sanitized
- XSS prevention through proper escaping
- Length limits on todo text

### Data Storage
- No sensitive data stored in localStorage
- Data is kept client-side only
- No external API calls or data transmission

## Testing API

### Test Utilities

```typescript
// Test helper for creating mock todos
function createMockTodo(overrides?: Partial<Todo>): Todo

// Test helper for creating mock state
function createMockState(todos?: Todo[]): TodoState

// Test helper for rendering with context
function renderWithTodoContext(component: ReactElement, initialState?: TodoState)
```

### Mock Data

```typescript
const mockTodos: Todo[] = [
  {
    id: '1',
    text: 'Test todo 1',
    completed: false,
    createdAt: new Date('2023-01-01')
  },
  // ... more mock data
];
```

This API documentation provides a comprehensive reference for developers working with the 3D Todo App codebase.
##### `editTodo(id: string, text: string, description?: string, priority?: Priority): void`
Updates fields on an existing todo.

##### `setSearchQuery(query: string): void`
Sets the live search query; input is debounced in UI.

##### `setStatusFilter(status: FilterStatus): void`
##### `setPriorityFilter(priority: FilterPriority): void`
##### `clearFilters(): void`
