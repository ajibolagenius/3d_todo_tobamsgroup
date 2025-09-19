'use client';

import { useState, useRef, useEffect } from 'react';

interface TaskDescriptionProps {
    description: string;
    isEditing?: boolean;
    editValue?: string;
    onEditChange?: (value: string) => void;
    className?: string;
}

export function TaskDescription({
    description,
    isEditing = false,
    editValue = '',
    onEditChange,
    className = ''
}: TaskDescriptionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [shouldShowToggle, setShouldShowToggle] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Check if text is long enough to need truncation
    useEffect(() => {
        if (textRef.current && !isEditing) {
            const element = textRef.current;
            // Create a temporary element to measure full height
            const temp = element.cloneNode(true) as HTMLElement;
            temp.style.maxHeight = 'none';
            temp.style.position = 'absolute';
            temp.style.visibility = 'hidden';
            temp.style.top = '-9999px';
            document.body.appendChild(temp);

            const fullHeight = temp.scrollHeight;
            document.body.removeChild(temp);

            // Check if content exceeds 3 lines (approximately 72px with line-height)
            setShouldShowToggle(fullHeight > 72);
        }
    }, [description, isEditing]);

    // Auto-resize textarea in edit mode
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            const textarea = textareaRef.current;
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.max(80, textarea.scrollHeight)}px`;
        }
    }, [isEditing, editValue]);

    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggleExpand();
        }
    };

    if (isEditing) {
        return (
            <div className={`stack-sm ${className}`}>
                <label htmlFor="edit-description" className="caption font-medium text-neutral">
                    Description
                </label>
                <textarea
                    ref={textareaRef}
                    id="edit-description"
                    value={editValue}
                    onChange={(e) => onEditChange?.(e.target.value)}
                    placeholder="Add additional details about this task..."
                    className="textarea resize-none"
                    style={{ minHeight: '80px' }}
                    aria-label="Edit task description"
                />
                <div className="flex justify-end">
                    <div className={`caption ${editValue.length > 450 ? 'text-warning' : editValue.length > 480 ? 'text-error' : 'text-neutral-light'}`}>
                        {editValue.length}/500
                    </div>
                </div>
            </div>
        );
    }

    if (!description.trim()) {
        return null;
    }

    return (
        <div className={`stack-sm ${className}`}>
            <div className="relative">
                <div
                    ref={textRef}
                    className={`body-small text-neutral leading-relaxed whitespace-pre-wrap transition-normal ease-in-out ${isExpanded ? 'max-h-none' : 'max-h-[72px] overflow-hidden'
                        }`}
                    style={{
                        maskImage: !isExpanded && shouldShowToggle
                            ? 'linear-gradient(to bottom, black 60%, transparent 100%)'
                            : 'none',
                        WebkitMaskImage: !isExpanded && shouldShowToggle
                            ? 'linear-gradient(to bottom, black 60%, transparent 100%)'
                            : 'none'
                    }}
                >
                    {description}
                </div>

                {shouldShowToggle && (
                    <button
                        onClick={handleToggleExpand}
                        onKeyDown={handleKeyDown}
                        className="btn-ghost btn-sm inline-sm"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? 'Show less description' : 'Show more description'}
                    >
                        {isExpanded ? (
                            <>
                                Show less
                                <svg
                                    className="w-3 h-3 transition-normal"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </>
                        ) : (
                            <>
                                Show more
                                <svg
                                    className="w-3 h-3 transition-normal"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
