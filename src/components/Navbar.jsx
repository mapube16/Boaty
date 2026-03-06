import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, LogIn, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Intersection Observer for active nav items
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(`#${entry.target.id}`);
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '-80px 0px 0px 0px'
        });

        // Observe elements
        const sections = document.querySelectorAll('section[id]');
        sections.forEach((section) => observer.observe(section));

        return () => {
            window.removeEventListener('scroll', handleScroll);
            sections.forEach((section) => observer.unobserve(section));
        };
    }, []);

    const navLinks = [
        { name: 'Beneficios', href: '#beneficios' },
        { name: 'Cómo funciona', href: '#como-funciona' },
        ...(!user ? [{ name: 'Registro', href: '#registro' }] : []),
    ];

    const dashboardPath = user?.role === 'STAFF' ? '/admin' : user?.role === 'OPERATOR' ? '/operador' : '/dashboard';

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
                    <a href="/" className="group flex flex-col items-start">
                        <span className="text-white font-heading font-extrabold text-2xl tracking-widest leading-none transition-transform duration-300 group-hover:scale-105">
                            BO<span className="relative">
                                <span className="text-white">A</span>
                            </span>TY
                        </span>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ delay: 1, duration: 1 }}
                            className="h-[2px] bg-gradient-to-r from-orange to-orange-light mt-1.5"
                        />
                    </a>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => {
                            const isActive = activeSection === link.href;

                            return (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className={`transition-all text-xs font-semibold uppercase tracking-widest relative group ${isActive ? 'text-white' : 'text-white/70 hover:text-white'
                                        }`}
                                >
                                    {link.name}
                                    <span
                                        className={`absolute -bottom-1 left-0 h-[1px] bg-orange transition-all duration-300 group-hover:w-full ${isActive ? 'w-full' : 'w-0'
                                            }`}
                                    />
                                </a>
                            );
                        })}
                        {user ? (
                            <Link
                                to={dashboardPath}
                                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
                            >
                                <User size={14} />
                                Mi panel
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-2 text-white/70 hover:text-white transition-all text-xs font-semibold uppercase tracking-widest"
                            >
                                <LogIn size={14} />
                                Entrar
                            </Link>
                        )}
                        {!user && (
                            <a
                                href="#registro"
                                className="bg-orange text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-orange-dark transition-all shadow-premium-orange hover:-translate-y-0.5"
                            >
                                Unirme
                            </a>
                        )}
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
                    {navLinks.map((link) => {
                        const isActive = activeSection === link.href;

                        return (
                            <a
                                key={link.name}
                                href={link.href}
                                className={`text-lg font-heading font-semibold tracking-wide flex items-center gap-3 ${isActive ? 'text-orange' : 'text-white/80 hover:text-white'
                                    }`}
                                onClick={() => setMenuOpen(false)}
                            >
                                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange" />}
                                {link.name}
                            </a>
                        );
                    })}
                    {user ? (
                        <Link
                            to={dashboardPath}
                            className="flex items-center gap-2 text-white/80 hover:text-white text-lg font-heading font-semibold tracking-wide"
                            onClick={() => setMenuOpen(false)}
                        >
                            <User size={18} />
                            Mi panel
                        </Link>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-2 text-white/80 hover:text-white text-lg font-heading font-semibold tracking-wide"
                            onClick={() => setMenuOpen(false)}
                        >
                            <LogIn size={18} />
                            Iniciar sesión
                        </Link>
                    )}
                    {!user && (
                        <a
                            href="#registro"
                            className="bg-orange text-white px-6 py-4 rounded-xl font-bold text-center mt-2"
                            onClick={() => setMenuOpen(false)}
                        >
                            Registrarme como proveedor
                        </a>
                    )}
                </motion.div>
            )}
        </motion.nav>
    );
};
