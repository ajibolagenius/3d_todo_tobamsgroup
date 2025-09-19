'use client';

import { useState, FormEvent, useCallback } from 'react';
import { validateTodoText, validateTodoDescription, todoActionLimiter } from '../utils/validation';
import { debounce } from '../utils/performance';
import { Priority } from '../types/todo';

interface TodoFormProps {
    onAddTodo: (text: string, description?: string, priority?: Priority) => void;
}

export function TodoForm({ onAddTodo }: TodoFormProps) {
    const [inputValue, setInputValue] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [descriptionError, setDescriptionError] = useState<string | null>(null);

    const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Clear previous errors
        setError(null);
        setDescriptionError(null);

        // Rate limiting check
        if (!todoActionLimiter.isAllowed('add-todo')) {
            setError('Too many requests. Please wait a moment before adding more tasks.');
            return;
        }

        // Validate and sanitize input
        const validation = validateTodoText(inputValue);
        if (!validation.isValid) {
            setError(validation.error || 'Task description cannot be empty');
            return;
        }

        // Validate description if provided
        const descriptionValidation = validateTodoDescription(description);
        if (!descriptionValidation.isValid) {
            setDescriptionError(descriptionValidation.error || 'Invalid description');
            return;
        }

        setIsSubmitting(true);

        try {
            // Add a small delay to show loading state in tests
            await new Promise(resolve => setTimeout(resolve, 100));

            onAddTodo(validation.sanitizedValue!, descriptionValidation.sanitizedValue, priority);
            setInputValue('');
            setDescription('');
            setPriority('medium'); // Reset to default priority

            // Announce success to screen readers
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = 'Task added successfully';
            document.body.appendChild(announcement);
            setTimeout(() => document.body.removeChild(announcement), 1000);
        } catch (error) {
            console.error('Error adding todo:', error);
            setError('Failed to add task. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [inputValue, description, priority, onAddTodo]);

    // Debounced input validation for better performance
    const debouncedValidation = useCallback(
        (value: string) => {
            const debouncedFn = debounce((val: string) => {
                if (val.trim()) {
                    const validation = validateTodoText(val);
                    if (!validation.isValid) {
                        setError(validation.error || 'Invalid input');
                    } else {
                        setError(null);
                    }
                } else {
                    setError(null);
                }
            }, 300);
            debouncedFn(value);
        },
        []
    );

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        // Clear previous errors
        setError(null);

        // Immediate validation for length limits
        if (value.length >= 200) {
            setError('Task description must be 200 characters or less');
        } else if (value.trim() === '' && value.length > 0) {
            setError('Task description cannot be empty');
        } else {
            debouncedValidation(value);
        }
    }, [debouncedValidation]);

    const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setDescription(value);

        // Clear previous errors
        setDescriptionError(null);

        // Immediate validation for description length
        if (value.length > 500) {
            setDescriptionError('Description must be 500 characters or less');
        } else {
            const validation = validateTodoDescription(value);
            if (!validation.isValid) {
                setDescriptionError(validation.error || 'Invalid description');
            }
        }
    }, []);

    return (
        <form
            onSubmit={handleSubmit}
            className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md focus-within:shadow-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20"
            role="form"
            aria-label="Add new task with priority"
            noValidate
        >
            <div className="flex flex-col gap-4">
                <div className="flex-1">
                    <label
                        htmlFor="todo-input"
                        className="block text-sm font-medium text-gray-700 mb-2 sm:sr-only"
                    >
                        Task Description
                    </label>
                    <div className="relative">
                        <input
                            id="todo-input"
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder="What needs to be done?"
                            className={`w-full px-4 py-3 sm:py-2 text-base sm:text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 touch-manipulation ${isSubmitting
                                ? 'border-gray-300 hover:border-gray-400 focus:border-blue-500 opacity-50 cursor-not-allowed'
                                : error
                                    ? 'border-red-300 hover:border-red-400 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                                }`}
                            disabled={isSubmitting}
                            maxLength={200}
                            aria-describedby="todo-input-help"
                            aria-invalid={!!error}
                            autoComplete="off"
                        />
                        {isSubmitting && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" aria-hidden="true"></div>
                            </div>
                        )}
                    </div>

                    {/* Character count */}
                    <div className="flex justify-between items-center mt-1">
                        <div
                            className={`text-xs ${error ? 'text-red-600' : 'text-gray-500'
                                }`}
                            id="todo-input-help"
                        >
                            {error || 'Enter a task description'}
                        </div>
                        <div className={`text-xs ${inputValue.length > 180 ? 'text-amber-600' : inputValue.length > 190 ? 'text-red-600' : 'text-gray-400'}`}>
                            {inputValue.length}/200
                        </div>
                    </div>


                </div>

                {/* Description field */}
                <div className="flex-1">
                    <label
                        htmlFor="description-input"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Description (optional)
                    </label>
                    <div className="relative">
                        <textarea
                            id="description-input"
                            value={description}
                            onChange={handleDescriptionChange}
                            placeholder="Add additional details about this task..."
                            rows={3}
                            maxLength={500}
                            className={`w-full px-4 py-3 sm:py-2 text-base sm:text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 touch-manipulation resize-vertical min-h-[80px] ${isSubmitting
                                ? 'border-gray-300 hover:border-gray-400 focus:border-blue-500 opacity-50 cursor-not-allowed'
                                : descriptionError
                                    ? 'border-red-300 hover:border-red-400 focus:border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                                }`}
                            disabled={isSubmitting}
                            aria-describedby="description-help"
                            aria-invalid={!!descriptionError}
                            autoComplete="off"
                        />
                    </div>

                    {/* Character count for description */}
                    <div className="flex justify-between items-center mt-1">
                        <div
                            className={`text-xs ${descriptionError ? 'text-red-600' : 'text-gray-500'
                                }`}
                            id="description-help"
                        >
                            {descriptionError || 'Optional details about the task'}
                        </div>
                        <div className={`text-xs ${description.length > 450 ? 'text-amber-600' : description.length > 480 ? 'text-red-600' : 'text-gray-400'}`}>
                            {description.length}/500
                        </div>
                    </div>


                </div>

                {/* Priority and Submit Row */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
                    <div className="w-full sm:w-auto">
                        <label
                            htmlFor="priority-select"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Priority Level
                        </label>
                        <div className="relative">
                            <select
                                id="priority-select"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as Priority)}
                                className={`w-full px-4 py-3 sm:py-2 text-base sm:text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 touch-manipulation min-h-[44px] sm:min-h-[36px] bg-white appearance-none cursor-pointer ${priority === 'high'
                                    ? 'border-red-300 bg-red-50 text-red-700'
                                    : priority === 'medium'
                                        ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
                                        : 'border-green-300 bg-green-50 text-green-700'
                                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isSubmitting}
                                aria-label="Select task priority"
                                aria-describedby="priority-help"
                            >
                                <option value="high">● High Priority</option>
                                <option value="medium">● Medium Priority</option>
                                <option value="low">● Low Priority</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        <div
                            id="priority-help"
                            className="mt-1 text-xs text-gray-500"
                        >
                            {priority === 'high' && 'Urgent tasks that need immediate attention'}
                            {priority === 'medium' && 'Standard tasks with normal importance'}
                            {priority === 'low' && 'Tasks that can be done when time permits'}
                        </div>
                    </div>

                    <div className="w-full sm:w-auto sm:flex-shrink-0 sm:self-end">
                        <button
                            type="submit"
                            disabled={isSubmitting || (inputValue.length > 200) || (description.length > 500)}
                            className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-blue-600 text-white text-base sm:text-sm font-medium rounded-md hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation min-h-[44px] sm:min-h-[36px] transform hover:scale-105 active:scale-95 disabled:transform-none"
                            aria-label="Add task"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {isSubmitting && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" aria-hidden="true"></div>
                                )}
                                {isSubmitting ? 'Adding...' : 'Add Task'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
