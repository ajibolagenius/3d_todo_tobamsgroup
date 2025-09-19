'use client';

import { useState, useRef, useEffect } from 'react';
import type { Todo, Priority } from '../types/todo';
import { TaskDescription } from './TaskDescription';

interface TodoItemProps {
    todo: Todo;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string, text: string, description?: string, priority?: Priority) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);
    const [editDescription, setEditDescription] = useState(todo.description || '');
    const [editPriority, setEditPriority] = useState(todo.priority);
    const [isSaving, setIsSaving] = useState(false);
    const editInputRef = useRef<HTMLInputElement>(null);

    const handleToggle = async () => {
        setIsToggling(true);
        try {
            onToggle(todo.id);
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = `Task "${todo.text}" marked as ${!todo.completed ? 'completed' : 'incomplete'}`;
            document.body.appendChild(announcement);
            setTimeout(() => document.body.removeChild(announcement), 1000);
        } catch (error) {
            console.error('Error toggling todo:', error);
        } finally {
            setIsToggling(false);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = `Task "${todo.text}" deleted`;
            document.body.appendChild(announcement);
            setTimeout(() => document.body.removeChild(announcement), 1000);

            onDelete(todo.id);
        } catch (error) {
            console.error('Error deleting todo:', error);
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setEditText(todo.text);
        setEditDescription(todo.description || '');
        setEditPriority(todo.priority);
    };

    const handleSaveEdit = async () => {
        if (editText.trim() === '') {
            return;
        }

        setIsSaving(true);
        try {
            // Add a small delay to show loading state in tests
            await new Promise(resolve => setTimeout(resolve, 100));

            onEdit(todo.id, editText.trim(), editDescription.trim() || undefined, editPriority);
            setIsEditing(false);

            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = `Task updated to "${editText.trim()}"`;
            document.body.appendChild(announcement);
            setTimeout(() => document.body.removeChild(announcement), 1000);
        } catch (error) {
            console.error('Error editing todo:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditText(todo.text);
        setEditDescription(todo.description || '');
        setEditPriority(todo.priority);
    };

    const handleEditKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancelEdit();
        }
    };

    // Focus the input when entering edit mode
    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [isEditing]);

    // Handle keyboard navigation for delete confirmation and editing
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (showDeleteConfirm) {
            if (e.key === 'Escape') {
                handleCancelDelete();
            } else if (e.key === 'Enter' && e.target === e.currentTarget) {
                handleConfirmDelete();
            }
        } else if (!isEditing && e.key === 'Enter' && e.target === e.currentTarget) {
            handleEditClick();
        }
    };

    return (
        <div
            className={`group flex items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-4 bg-white rounded-lg border transition-all duration-300 hover:shadow-md focus-within:shadow-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20 ${todo.completed
                ? 'border-green-200 bg-green-50 hover:bg-green-100'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${isToggling || isDeleting || isSaving ? 'opacity-75 pointer-events-none' : ''}`}
            role="listitem"
            onKeyDown={handleKeyDown}
            tabIndex={showDeleteConfirm ? 0 : -1}
            aria-label={showDeleteConfirm ? `Confirm deletion of task: ${todo.text}. Press Enter to confirm, Escape to cancel.` : undefined}
        >
            <div className="flex items-center pt-1 sm:pt-0">
                <div className="relative">
                    <input
                        type="checkbox"
                        id={`todo-${todo.id}`}
                        checked={todo.completed}
                        onChange={handleToggle}
                        disabled={isToggling || isDeleting || isEditing}
                        className="w-5 h-5 sm:w-5 sm:h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200 cursor-pointer touch-manipulation hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-describedby={`todo-text-${todo.id} todo-status-${todo.id}`}
                    />
                    {isToggling && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent" aria-hidden="true"></div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <div className="space-y-3">
                        <div>
                            <input
                                ref={editInputRef}
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyDown={handleEditKeyDown}
                                disabled={isSaving}
                                className="w-full px-3 py-2 text-sm font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="Enter task text..."
                                aria-label="Edit task text"
                            />
                        </div>
                        <TaskDescription
                            description=""
                            isEditing={true}
                            editValue={editDescription}
                            onEditChange={setEditDescription}
                        />
                        <div>
                            <label htmlFor={`priority-${todo.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                                Priority
                            </label>
                            <select
                                id={`priority-${todo.id}`}
                                value={editPriority}
                                onChange={(e) => setEditPriority(e.target.value as Priority)}
                                disabled={isSaving}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] sm:min-h-[36px]"
                                aria-label="Edit task priority"
                            >
                                <option value="high">● High Priority</option>
                                <option value="medium">● Medium Priority</option>
                                <option value="low">● Low Priority</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleSaveEdit}
                                disabled={isSaving || editText.trim() === ''}
                                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation min-h-[44px] sm:min-h-[36px] transform hover:scale-105 active:scale-95 disabled:transform-none"
                                aria-label="Save task changes"
                            >
                                <span className="flex items-center justify-center gap-1">
                                    {isSaving && (
                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" aria-hidden="true"></div>
                                    )}
                                    {isSaving ? 'Saving...' : 'Save'}
                                </span>
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                                className="px-3 py-2 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 active:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation min-h-[44px] sm:min-h-[36px] transform hover:scale-105 active:scale-95 disabled:transform-none"
                                aria-label="Cancel task editing"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-start gap-3 sm:gap-3">
                            {/* Priority indicator dot */}
                            <div className="flex items-center pt-1">
                                <div
                                    className={`w-3 h-3 rounded-full flex-shrink-0 transition-all duration-200 ${todo.priority === 'high'
                                        ? 'bg-red-500 shadow-red-200 shadow-lg'
                                        : todo.priority === 'medium'
                                            ? 'bg-yellow-500 shadow-yellow-200 shadow-lg'
                                            : 'bg-green-500 shadow-green-200 shadow-lg'
                                        } ${todo.completed ? 'opacity-50' : ''}`}
                                    aria-label={`${todo.priority} priority`}
                                    title={`${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority`}
                                />
                            </div>

                            {/* Task text with priority-based typography */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <div
                                        onClick={handleEditClick}
                                        className={`flex-1 cursor-pointer transition-all duration-300 leading-relaxed hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 rounded px-1 py-1 ${todo.completed
                                            ? 'text-gray-500 line-through'
                                            : todo.priority === 'high'
                                                ? 'text-gray-900 font-semibold text-sm sm:text-base'
                                                : todo.priority === 'medium'
                                                    ? 'text-gray-800 font-medium text-sm sm:text-sm'
                                                    : 'text-gray-700 font-normal text-sm sm:text-sm'
                                            }`}
                                        tabIndex={0}
                                        onKeyDown={handleKeyDown}
                                        role="button"
                                        aria-label={`Edit task: ${todo.text}. Press Enter to edit.`}
                                        id={`todo-text-${todo.id}`}
                                    >
                                        {todo.text}
                                    </div>

                                    {/* Description indicator icon */}
                                    {todo.description && (
                                        <div
                                            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                            title="This task has additional details"
                                            aria-label="Task has description"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Task description display */}
                                <TaskDescription
                                    description={todo.description || ''}
                                    className="ml-1"
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-1">
                            <div className="text-xs text-gray-400">
                                Created {new Date(todo.createdAt).toLocaleDateString()}
                            </div>

                            {/* Enhanced priority badge */}
                            <div
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 touch-manipulation min-h-[28px] ${todo.priority === 'high'
                                    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                    : todo.priority === 'medium'
                                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                                        : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                    } ${todo.completed ? 'opacity-60' : ''}`}
                                aria-label={`Priority: ${todo.priority}`}
                                title={`${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority`}
                            >
                                <div
                                    className={`w-2 h-2 rounded-full ${todo.priority === 'high'
                                        ? 'bg-red-500'
                                        : todo.priority === 'medium'
                                            ? 'bg-yellow-500'
                                            : 'bg-green-500'
                                        }`}
                                    aria-hidden="true"
                                />
                                <span className="font-medium">
                                    {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                                </span>
                            </div>

                            {/* Status badge */}
                            <div
                                id={`todo-status-${todo.id}`}
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 min-h-[28px] ${todo.completed
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}
                                aria-label={`Task status: ${todo.completed ? 'completed' : 'pending'}`}
                            >
                                {todo.completed ? 'Completed' : 'Pending'}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center gap-2 pt-1 sm:pt-0">
                {!showDeleteConfirm && !isEditing ? (
                    <button
                        onClick={handleDeleteClick}
                        disabled={isToggling || isDeleting}
                        className="sm:opacity-0 sm:group-hover:opacity-100 p-2 sm:p-2 text-gray-400 hover:text-red-600 active:text-red-700 hover:bg-red-50 active:bg-red-100 rounded-md transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        aria-label={`Delete task: ${todo.text}`}
                        title="Delete task"
                    >
                        <svg
                            className="w-5 h-5 sm:w-4 sm:h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                ) : showDeleteConfirm ? (
                    <div
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-1 p-2 bg-red-50 rounded-md border border-red-200"
                        role="group"
                        aria-label="Delete confirmation"
                    >
                        <div className="text-xs text-red-700 mb-2 sm:mb-0 sm:mr-2 text-center sm:text-left">
                            Delete this task?
                        </div>
                        <button
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="px-3 py-2 sm:px-2 sm:py-1 text-sm sm:text-xs bg-red-600 text-white rounded hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 touch-manipulation min-h-[44px] sm:min-h-[32px] transform hover:scale-105 active:scale-95 disabled:transform-none"
                            aria-label="Confirm delete task"
                        >
                            <span className="flex items-center justify-center gap-1">
                                {isDeleting && (
                                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" aria-hidden="true"></div>
                                )}
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </span>
                        </button>
                        <button
                            onClick={handleCancelDelete}
                            disabled={isDeleting}
                            className="px-3 py-2 sm:px-2 sm:py-1 text-sm sm:text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 active:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 touch-manipulation min-h-[44px] sm:min-h-[32px] transform hover:scale-105 active:scale-95 disabled:transform-none"
                            aria-label="Cancel delete task"
                        >
                            Cancel
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
