# API Documentation

## Overview

The 3D Todo App uses a client-side architecture with local storage for data persistence. This document outlines the internal APIs and interfaces used throughout the application.

## Core Types

### Todo Interface

```typescript
interface Todo {
  id: string;          // Unique identifier (UUID)
  text: string;        // Task description
  completed: boolean;  // Completion status
  createdAt: Date;     // Creation timestamp
}
```

### TodoState Interface

```typescript
interface TodoState {
  todos: Todo[];                    // Array of all todos
  completedCount: number;           // Number of completed todos
  totalCount: number;              // Total number of todos
  completionPercentage: number;    // Completion percentage (0-100)
}
```

### TodoAction Types

```typescript
type TodoAction =
  | { type: 'ADD_TODO'; payload: { text: string } }
  | { type: 'TOGGLE_TODO'; payload: { id: string } }
  | { type: 'DELETE_TODO'; payload: { id: string } }
  | { type: 'LOAD_TODOS'; payload: { todos: Todo[] } };
```

## Context API

### TodoContext

The main context provider for todo state management.

```typescript
interface TodoContextType {
  state: TodoState;
  dispatch: React.Dispatch<TodoAction>;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}
```

#### Methods

##### `addTodo(text: string): void`
Creates a new todo with the provided text.

**Parameters:**
- `text` (string): The todo description

**Behavior:**
- Generates a unique ID using crypto.randomUUID()
- Sets completed to false
- Sets createdAt to current date
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
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}
```

**Returns:**
- `state`: Current todo state
- `addTodo`: Function to add a new todo
- `toggleTodo`: Function to toggle todo completion
- `deleteTodo`: Function to delete a todo

## Utility Functions

### localStorage.ts

#### `saveTodos(todos: Todo[]): void`
Saves todos to localStorage with error handling.

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

#### `validateTodoText(text: string): boolean`
Validates todo text input.

**Parameters:**
- `text` (string): Text to validate

**Returns:**
- `true` if valid, `false` otherwise

**Validation Rules:**
- Must not be empty or only whitespace
- Maximum length of 500 characters
- No HTML tags allowed

#### `sanitizeTodoText(text: string): string`
Sanitizes todo text for safe storage and display.

**Parameters:**
- `text` (string): Text to sanitize

**Returns:**
- Sanitized text string

**Sanitization:**
- Trims whitespace
- Removes HTML tags
- Escapes special characters

### performance.ts

#### `measurePerformance(name: string, fn: () => void): void`
Measures and logs performance of a function.

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
  completionPercentage: number;  // 0-100
  totalTasks: number;           // Total number of tasks
  isComplete: boolean;          // Whether all tasks are complete
}
```

### 3D Scene Configuration

#### Default Settings
- **Camera Position**: [0, 0, 5]
- **Field of View**: 75 degrees
- **Ambient Light**: 0.6 intensity
- **Directional Light**: 1.0 intensity at [10, 10, 5]

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

### Performance Thresholds
- Frame rate: Minimum 30fps, target 60fps
- Initial load: Maximum 3 seconds
- Todo operations: Maximum 100ms response time

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
