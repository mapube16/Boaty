import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Anchor, Menu, X } from 'lucide-react';
import { Button } from './Button';

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Destinations', href: '#destinations' },
        { name: 'How it Works', href: '#how-it-works' },
        { name: 'For Owners', href: '#owners' },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass py-4 shadow-lg' : 'bg-transparent py-6'}`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                <a href="#" className="flex items-center gap-2 text-2xl font-bold text-white">
                    <Anchor className="text-accent" size={32} />
                    BOATY
                </a>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a key={link.name} href={link.href} className="text-light-slate hover:text-accent transition-colors text-sm font-medium">
                            {link.name}
                        </a>
                    ))}
                    <Button variant="secondary" className="px-4 py-2 text-sm">Sign In</Button>
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass overflow-hidden"
                    >
                        <div className="flex flex-col items-center gap-6 py-8">
                            {navLinks.map((link) => (
                                <a key={link.name} href={link.href} className="text-light-slate hover:text-accent font-medium" onClick={() => setIsOpen(false)}>
                                    {link.name}
                                </a>
                            ))}
                            <Button variant="secondary" className="w-48">Sign In</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};
