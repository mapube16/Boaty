import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, Twitter } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-navy-dark relative overflow-hidden">
            <div className="container mx-auto max-w-7xl px-6 py-24 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                    {/* Brand Column */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="flex flex-col items-start">
                            <span className="text-white font-heading font-black text-3xl tracking-widest leading-none">
                                BOATY
                            </span>
                            <div className="h-[2px] w-12 bg-orange-DEFAULT mt-2" />
                            <p className="text-white/30 text-[10px] uppercase tracking-[0.5em] mt-3 font-bold">RESERVAS ON DEMAND</p>
                        </div>
                        <p className="text-white/40 text-sm font-medium leading-relaxed max-w-xs">
                            La plataforma definitiva para la gestión de activos náuticos y el turismo internacional de alta gama.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Instagram, Twitter, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-orange-DEFAULT hover:text-white transition-all duration-300">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-white font-heading font-bold text-xs uppercase tracking-[0.3em] mb-8">Navegación</h4>
                        <ul className="space-y-4">
                            {['Beneficios', 'Cómo funciona', 'Registro', 'Socios'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-white/30 hover:text-white transition-colors text-sm font-medium">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-heading font-bold text-xs uppercase tracking-[0.3em] mb-8">Contacto</h4>
                        <ul className="space-y-4">
                            <li className="text-white/30 text-sm font-medium">Cartagena, CO</li>
                            <li className="text-white/30 text-sm font-medium">partners@boaty.com</li>
                            <li>
                                <a href="#registro" className="text-orange-DEFAULT hover:text-orange-light text-sm font-bold tracking-widest uppercase">Unirse</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom line */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-white/10 text-[10px] uppercase tracking-widest font-bold">
                        © {new Date().getFullYear()} BOATY ASSETS S.A.S.
                    </p>
                    <div className="flex gap-8">
                        <a href="#" className="text-white/10 hover:text-white/30 transition-colors text-[10px] uppercase tracking-widest font-bold">Privacidad</a>
                        <a href="#" className="text-white/10 hover:text-white/30 transition-colors text-[10px] uppercase tracking-widest font-bold">Términos</a>
                    </div>
                </div>
            </div>

            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-navy-light/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        </footer>
    );
};
