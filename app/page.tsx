import type { Metadata } from 'next'
import { TodoApp } from '../components/TodoApp'

export const metadata: Metadata = {
    title: '3D Todo App | Tobams Group',
    description: 'Manage your tasks with an engaging 3D progress visualization. Create, complete, and track your todos in a modern, interactive interface.',
}

export default function HomePage() {
    return (
        <main className="min-h-screen">
            <TodoApp />
        </main>
    )
}
