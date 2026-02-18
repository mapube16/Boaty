import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const Hero = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-navy-dark px-6">
            {/* Background Layer with Parallax */}
            <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/40 via-navy-dark/20 to-navy-dark/95 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1567623049182-3561a0625458?auto=format&fit=crop&q=80&w=2070"
                    alt="Luxury Yacht"
                    className="w-full h-full object-cover scale-110"
                />
            </motion.div>

            {/* Content Container */}
            <div className="container mx-auto max-w-6xl z-20 relative pt-20">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    className="text-center"
                >
                    {/* Premium Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="inline-block px-5 py-2 glass-premium rounded-full mb-8 border border-white/10"
                    >
                        <span className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-bold">
                            Elevando la navegación <span className="text-orange-DEFAULT mx-2">•</span> On Demand
                        </span>
                    </motion.div>

                    {/* Dramatic Typography */}
                    <div className="overflow-hidden mb-6">
                        <motion.h1
                            className="text-6xl md:text-9xl font-heading font-black text-white leading-[0.9] tracking-tightest"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        >
                            TU BOATY, <br />
                            <span className="text-gradient">SIN LÍMITES.</span>
                        </motion.h1>
                    </div>



                    {/* Refined Subheadline */}
                    <motion.p
                        className="text-lg md:text-2xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed font-light font-sans"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.8 }}
                    >
                        Únete al marketplace on-demand que conecta tu servicio náutico con el turismo más exclusivo del mundo.
                    </motion.p>

                    {/* Premium CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3, duration: 0.8 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                    >
                        <a
                            href="#registro"
                            className="group bg-orange-DEFAULT text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-orange-dark transition-all shadow-premium-orange hover:shadow-orange-DEFAULT/40 flex items-center gap-3 active:scale-95"
                        >
                            COMENZAR AHORA
                            <ArrowRight className="transition-transform group-hover:translate-x-1" size={20} />
                        </a>
                        <a
                            href="#como-funciona"
                            className="text-white/60 hover:text-white px-8 py-5 font-bold tracking-widest text-xs uppercase transition-all flex items-center gap-2 border-b border-white/10 hover:border-white"
                        >
                            DESCUBRE EL MODELO
                        </a>
                    </motion.div>

                    {/* Scroll Stats - Glassmorphism */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.8, duration: 1 }}
                        className="mt-24 grid grid-cols-2 md:grid-cols-3 gap-12 max-w-4xl mx-auto glass-premium p-10 rounded-[32px] border-white/5"
                    >
                        {[
                            { value: '15%', label: 'Take Rate' },
                            { value: '30m', label: 'Match Time' },
                            { value: '80%', label: 'Efficiency' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center space-y-2">
                                <div className="text-4xl font-heading font-black text-white">{stat.value}</div>
                                <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{stat.label}</div>
                                <div className="w-8 h-[1px] bg-orange-DEFAULT mx-auto opacity-30" />
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            {/* Decorative Blurs */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-DEFAULT/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-navy-light/20 rounded-full blur-[120px] pointer-events-none" />
        </section>
    );
};
