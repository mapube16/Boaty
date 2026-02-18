import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Activity, Send, Award } from 'lucide-react';

const steps = [
    {
        icon: ClipboardCheck,
        title: 'Registro de Activos',
        description: 'Incorpora tu flota a nuestro catálogo exclusivo. Validación rápida para asegurar estándares premium.',
    },
    {
        icon: Activity,
        title: 'Control en Tiempo Real',
        description: 'Cruza tu calendario y disponibilidad. Nuestra tecnología se encarga del resto sin intervención manual.',
    },
    {
        icon: Send,
        title: 'Recepción Instantánea',
        description: 'Recibe solicitudes de turistas calificados. Sin regateos ni esperas: confirmación on-demand.',
    },
    {
        icon: Award,
        title: 'Crecimiento Exponencial',
        description: 'Monitorea tu reputación y escala tu operación basado en métricas de satisfacción internacional.',
    },
];

export const HowItWorks = () => {
    return (
        <section id="como-funciona" className="py-32 bg-navy-dark relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
            </div>

            <div className="container mx-auto max-w-7xl px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-24"
                >
                    <span className="text-orange-DEFAULT font-bold text-[10px] uppercase tracking-[0.5em] mb-6 block">
                        EL MODELO OPERATIVO
                    </span>
                    <h2 className="text-5xl md:text-7xl font-heading font-black text-white leading-tight mb-8">
                        Simplicidad en la <br />
                        <span className="text-gradient">Escala.</span>
                    </h2>
                    <div className="w-20 h-1 bg-white/10 mx-auto rounded-full" />
                </motion.div>

                {/* Steps Horizontal */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.2 }}
                            className="relative text-center group"
                        >
                            {/* Number label */}
                            <div className="mb-10 flex justify-center">
                                <div className="w-24 h-24 rounded-full glass-premium flex items-center justify-center relative transition-all duration-500 group-hover:scale-110 group-hover:border-orange-DEFAULT/40">
                                    <step.icon className="text-white group-hover:text-orange-DEFAULT transition-colors" size={32} />

                                    {/* Small Number Bubble */}
                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg transform transition-transform group-hover:rotate-12">
                                        <span className="text-navy-dark font-heading font-black text-xs">0{i + 1}</span>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-white font-heading font-bold text-xl mb-4 group-hover:text-orange-DEFAULT transition-colors tracking-tight">{step.title}</h3>
                            <p className="text-white/40 text-sm leading-relaxed font-medium px-4 transition-colors group-hover:text-white/60">{step.description}</p>

                            {/* Decorative connector for desktop */}
                            {i < 3 && (
                                <div className="hidden lg:block absolute top-12 left-[70%] w-full h-[1px] bg-gradient-to-r from-white/20 to-transparent z-0" />
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Call to Action */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1, duration: 1 }}
                    className="mt-24 text-center"
                >
                    <a
                        href="#registro"
                        className="inline-flex items-center gap-4 text-white/40 hover:text-white transition-all group font-bold tracking-widest text-[10px] uppercase py-4 px-8 rounded-full glass-premium"
                    >
                        TRANSFORMA TU OPERACIÓN HOY
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-orange-DEFAULT transition-colors">
                            <ArrowRight size={12} className="text-white" />
                        </div>
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

// Re-using ArrowRight component if not imported
const ArrowRight = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M5 12h14" />
        <path d="M12 5l7 7-7 7" />
    </svg>
);
