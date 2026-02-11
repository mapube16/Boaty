import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export const Button = ({ children, variant = 'primary', className, ...props }) => {
    const baseStyles = "px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2";
    const variants = {
        primary: "bg-accent text-primary hover:bg-accent/80 hover:shadow-[0_0_15px_rgba(100,255,218,0.5)]",
        secondary: "border border-accent text-accent hover:bg-accent/10",
        text: "text-light-slate hover:text-accent",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={clsx(baseStyles, variants[variant], className)}
            {...props}
        >
            {children}
        </motion.button>
    );
};
