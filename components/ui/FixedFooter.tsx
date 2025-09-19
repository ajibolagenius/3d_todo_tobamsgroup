'use client';

import React from 'react';

export default function FixedFooter() {
    return (
        <footer
            role="contentinfo"
            className="fixed bottom-0 left-0 right-0 z-40"
            aria-label="Site footer"
        >
            <div className="bg-gradient-to-r from-[var(--primary-600)] via-[var(--accent-600)] to-[var(--primary-700)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-14 sm:h-16 text-white">
                        <span className="uppercase tracking-wider text-xs sm:text-sm font-semibold drop-shadow">
                            CREATED BY: AJIBOLA AKELEBE 🐼
                        </span>
                    </div>
                </div>
            </div>
            <div className="pointer-events-none absolute inset-0 backdrop-blur-[2px] opacity-40" aria-hidden="true"></div>
        </footer>
    );
}

