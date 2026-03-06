import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export const Button = ({
    children,
    variant = 'primary',
    className,
    loading = false,
    disabled = false,
    type = 'button', // prevent accidental form submission when used outside <form>
    ...props
}) => {
    const isDisabled = disabled || loading;

    const baseStyles = [
        "px-6 py-3 rounded-lg font-semibold transition-all duration-300",
        "flex items-center justify-center gap-2",
        // Keyboard focus ring — only shown when navigating by keyboard, not on click
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent",
        isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
    ].join(' ');

    const variants = {
        primary: "bg-accent text-primary hover:bg-accent/80 hover:shadow-[0_0_15px_rgba(100,255,218,0.5)]",
        secondary: "border border-accent text-accent hover:bg-accent/10",
        text: "text-light-slate hover:text-accent",
    };

    return (
        <motion.button
            type={type}
            disabled={isDisabled}
            aria-disabled={isDisabled}  // redundant but improves AT compatibility
            aria-busy={loading}          // tells screen readers a result is pending
            // Skip scale animations when disabled so the button feels truly inert
            whileHover={isDisabled ? {} : { scale: 1.05 }}
            whileTap={isDisabled ? {} : { scale: 0.95 }}
            className={clsx(baseStyles, variants[variant], className)}
            {...props}
        >
            {/* Spinner replaces leading content; children kept for width stability */}
            {loading ? (
                <>
                    <Loader2 size={16} className="animate-spin shrink-0" aria-hidden="true" />
                    <span>{children}</span>
                </>
            ) : children}
        </motion.button>
    );
};
