import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import FixedFooter from '../components/ui/FixedFooter'

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter'
})

export const metadata: Metadata = {
    title: {
        default: '3D Todo App',
        template: '%s | 3D Todo App'
    },
    description: 'A modern, interactive to-do list web application with engaging 3D progress visualization. Manage your tasks with style and watch your progress come to life.',
    keywords: ['todo', 'task management', '3D visualization', 'productivity', 'React', 'Next.js'],
    authors: [{ name: 'Ajibola Akelebe' }],
    creator: 'Ajibola Akelebe',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://3dtodotobamsgroup.vercel.app/',
        title: '3D Todo App',
        description: 'A modern, interactive to-do list web application with engaging 3D progress visualization.',
        siteName: '3D Todo App',
    },
    twitter: {
        card: 'summary_large_image',
        title: '3D Todo App',
        description: 'A modern, interactive to-do list web application with engaging 3D progress visualization.',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#000000' },
    ],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={inter.variable}>
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <meta name="theme-color" content="#ffffff" />
            </head>
            <body className={`${inter.className} antialiased`}>
                <div id="root">
                    {children}
                    {/* Spacer to prevent content being hidden behind fixed footer */}
                    <div aria-hidden="true" className="h-16" />
                </div>
                <FixedFooter />
            </body>
        </html>
    )
}
