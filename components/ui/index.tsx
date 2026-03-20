'use client';

import React from 'react';
import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = "Card";

export const GlowCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }>(({
  className,
  children,
  onClick,
  interactive = true,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        "relative rounded-xl border border-border bg-card p-5 overflow-hidden transition-all duration-300",
        interactive && "cursor-pointer hover:border-primary hover:shadow-[0_0_15px_rgba(113,196,239,0.3)] hover:-translate-y-1 hover:scale-[1.02]",
        className
      )}
      {...props}
    >
      {/* Subtle corner gradient decoration */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none group-hover:opacity-100 rounded-tr-xl" />
      {children}
    </div>
  );
});
GlowCard.displayName = "GlowCard";

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}>(({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-50 disabled:cursor-not-allowed",
        {
          'bg-primary text-primary-foreground hover:shadow-[0_0_10px_rgba(113,196,239,0.5)] hover:bg-primary/90': variant === 'primary',
          'bg-secondary/20 text-secondary-foreground border border-secondary/30 hover:bg-secondary/40': variant === 'secondary',
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-[0_0_10px_rgba(239,68,68,0.5)]': variant === 'danger',
          'bg-transparent hover:bg-muted text-foreground': variant === 'ghost',
          'border border-border bg-transparent hover:bg-muted text-foreground': variant === 'outline',
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 py-2': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
          'h-10 w-10 p-2': size === 'icon',
        },
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";

export const Badge = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary' | 'secondary';
}>(({
  className,
  variant = 'default',
  children,
  ...props
}, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          'bg-muted text-muted-foreground': variant === 'default',
          'bg-success/20 text-success border border-success/30': variant === 'success',
          'bg-warning/20 text-warning border border-warning/30': variant === 'warning',
          'bg-destructive/20 text-destructive border border-destructive/30': variant === 'danger',
          'bg-primary/20 text-primary border border-primary/30': variant === 'primary',
          'bg-secondary/20 text-secondary border border-secondary/30': variant === 'secondary',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});
Badge.displayName = "Badge";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({
  className,
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm placeholder:text-muted-foreground transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:shadow-[0_0_10px_rgba(113,196,239,0.2)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Modal } from './Modal';
