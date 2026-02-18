import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Beneficios', href: '#beneficios' },
        { name: 'Cómo funciona', href: '#como-funciona' },
        { name: 'Registro', href: '#registro' },
    ];

    return (
        <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 ${scrolled ? 'py-4' : 'py-8'
                }`}
        >
            <div className={`container mx-auto max-w-7xl transition-all duration-500 ${scrolled ? 'glass-navy rounded-2xl px-8 py-3 shadow-premium' : 'bg-transparent px-2'
                }`}>
                <div className="flex items-center justify-between">
                    {/* Premium Logo */}
                    <a href="#" className="group flex flex-col items-start">
                        <span className="text-white font-heading font-extrabold text-2xl tracking-widest leading-none transition-transform duration-300 group-hover:scale-105">
                            BO<span className="relative">
                                <span className="text-white">A</span>
                            </span>TY
                        </span>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ delay: 1, duration: 1 }}
                            className="h-[2px] bg-gradient-to-r from-orange-DEFAULT to-orange-light mt-1.5"
                        />
                    </a>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-white/70 hover:text-white transition-all text-xs font-semibold uppercase tracking-widest relative group"
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-orange-DEFAULT transition-all duration-300 group-hover:w-full" />
                            </a>
                        ))}
                        <a
                            href="#registro"
                            className="bg-orange-DEFAULT text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-orange-dark transition-all shadow-premium-orange hover:-translate-y-0.5"
                        >
                            Unirme
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white p-2"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="md:hidden glass-navy rounded-3xl mt-4 p-8 flex flex-col gap-6 shadow-2xl border border-white/10"
                >
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-white/80 hover:text-white text-lg font-heading font-semibold tracking-wide"
                            onClick={() => setMenuOpen(false)}
                        >
                            {link.name}
                        </a>
                    ))}
                    <a
                        href="#registro"
                        className="bg-orange-DEFAULT text-white px-6 py-4 rounded-xl font-bold text-center mt-2"
                        onClick={() => setMenuOpen(false)}
                    >
                        Registrarme como proveedor
                    </a>
                </motion.div>
            )}
        </motion.nav>
    );
};
