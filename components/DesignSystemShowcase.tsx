'use client'

import {
    Plus,
    Check,
    X,
    Edit3,
    Trash2,
    Search,
    Filter,
    ChevronDown,
    AlertCircle,
    CheckCircle,
    Info,
    Star,
    Calendar,
    Clock
} from 'lucide-react'

/**
 * Design System Showcase Component
 */
export default function DesignSystemShowcase() {
    return (
        <div className="container mx-auto p-8 space-y-12">
            <div className="text-center">
                <h1 className="heading-1 mb-4">Modern Design System</h1>
                <p className="body-large text-neutral-light">
                    A comprehensive design system foundation with modern colors, typography, and components
                </p>
            </div>

            {/* Color Palette */}
            <section className="space-y-6">
                <h2 className="heading-2">Color Palette</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Primary Colors */}
                    <div className="card p-6">
                        <h3 className="heading-4 mb-4">Primary (Greens)</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-md" style={{ backgroundColor: 'var(--primary-100)' }}></div>
                                <span className="body-small">primary-100</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-md" style={{ backgroundColor: 'var(--primary-500)' }}></div>
                                <span className="body-small">primary-500</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-md" style={{ backgroundColor: 'var(--primary-600)' }}></div>
                                <span className="body-small">primary-600</span>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Colors */}
                    <div className="card p-6">
                        <h3 className="heading-4 mb-4">Secondary (Warm)</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-md" style={{ backgroundColor: 'var(--secondary-100)' }}></div>
                                <span className="body-small">secondary-100</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-md" style={{ backgroundColor: 'var(--secondary-500)' }}></div>
                                <span className="body-small">secondary-500</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-md" style={{ backgroundColor: 'var(--secondary-600)' }}></div>
                                <span className="body-small">secondary-600</span>
                            </div>
                        </div>
                    </div>

                    {/* Accent Colors */}
                    <div className="card p-6">
                        <h3 className="heading-4 mb-4">Accent (Blues)</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-md" style={{ backgroundColor: 'var(--accent-100)' }}></div>
                                <span className="body-small">accent-100</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-md" style={{ backgroundColor: 'var(--accent-500)' }}></div>
                                <span className="body-small">accent-500</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-md" style={{ backgroundColor: 'var(--accent-600)' }}></div>
                                <span className="body-small">accent-600</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Typography System */}
            <section className="space-y-6">
                <h2 className="heading-2">Typography System</h2>

                <div className="card p-6 space-y-4">
                    <h1 className="heading-1">Heading 1 - Bold & Impactful</h1>
                    <h2 className="heading-2">Heading 2 - Section Headers</h2>
                    <h3 className="heading-3">Heading 3 - Subsections</h3>
                    <h4 className="heading-4">Heading 4 - Component Titles</h4>
                    <p className="body-large">Body Large - Prominent text content with relaxed line height for better readability.</p>
                    <p className="body-base">Body Base - Standard text content with optimal line height for comfortable reading.</p>
                    <p className="body-small">Body Small - Secondary text content with subtle styling.</p>
                    <p className="caption">Caption - Small text for labels, metadata, and supplementary information.</p>
                </div>
            </section>

            {/* Button System */}
            <section className="space-y-6">
                <h2 className="heading-2">Button System</h2>

                <div className="card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-3">
                            <h4 className="heading-4">Primary</h4>
                            <button className="btn-primary w-full">
                                <Plus size={16} />
                                Add Task
                            </button>
                            <button className="btn-primary btn-sm w-full">
                                <Check size={14} />
                                Small
                            </button>
                            <button className="btn-primary btn-lg w-full">
                                <Star size={18} />
                                Large
                            </button>
                        </div>

                        <div className="space-y-3">
                            <h4 className="heading-4">Secondary</h4>
                            <button className="btn-secondary w-full">
                                <Edit3 size={16} />
                                Edit
                            </button>
                            <button className="btn-secondary btn-sm w-full">
                                <Filter size={14} />
                                Filter
                            </button>
                            <button className="btn-secondary btn-lg w-full">
                                <Calendar size={18} />
                                Schedule
                            </button>
                        </div>

                        <div className="space-y-3">
                            <h4 className="heading-4">Accent</h4>
                            <button className="btn-accent w-full">
                                <Search size={16} />
                                Search
                            </button>
                            <button className="btn-accent btn-sm w-full">
                                <Info size={14} />
                                Info
                            </button>
                            <button className="btn-accent btn-lg w-full">
                                <Clock size={18} />
                                Timer
                            </button>
                        </div>

                        <div className="space-y-3">
                            <h4 className="heading-4">Ghost</h4>
                            <button className="btn-ghost w-full">
                                <X size={16} />
                                Cancel
                            </button>
                            <button className="btn-ghost btn-sm w-full">
                                <Trash2 size={14} />
                                Delete
                            </button>
                            <button className="btn-ghost btn-lg w-full">
                                <ChevronDown size={18} />
                                More
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Iconography */}
            <section className="space-y-6">
                <h2 className="heading-2">Iconography (Lucide React)</h2>

                <div className="card p-6">
                    <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4">
                        {[
                            { icon: Plus, name: 'Plus' },
                            { icon: Check, name: 'Check' },
                            { icon: X, name: 'X' },
                            { icon: Edit3, name: 'Edit3' },
                            { icon: Trash2, name: 'Trash2' },
                            { icon: Search, name: 'Search' },
                            { icon: Filter, name: 'Filter' },
                            { icon: ChevronDown, name: 'ChevronDown' },
                            { icon: AlertCircle, name: 'AlertCircle' },
                            { icon: CheckCircle, name: 'CheckCircle' },
                            { icon: Info, name: 'Info' },
                            { icon: Star, name: 'Star' },
                            { icon: Calendar, name: 'Calendar' },
                            { icon: Clock, name: 'Clock' }
                        ].map(({ icon: Icon, name }) => (
                            <div key={name} className="text-center space-y-2">
                                <div className="flex justify-center">
                                    <Icon size={24} className="text-neutral-600" />
                                </div>
                                <span className="caption">{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
