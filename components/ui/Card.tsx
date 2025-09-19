'use client';

import React from 'react';

type ElementTag = keyof JSX.IntrinsicElements;

interface CardProps<T extends ElementTag = 'div'> {
    as?: T;
    className?: string;
    children: React.ReactNode;
}

export function Card<T extends ElementTag = 'div'>({ as, className = '', children, ...rest }: CardProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof CardProps<T>>) {
    const Tag = (as || 'div') as ElementTag;
    const base = 'card';
    const classes = className ? `${base} ${className}` : base;
    // @ts-expect-error - dynamic element tag
    return <Tag className={classes} {...rest}>{children}</Tag>;
}

export default Card;

