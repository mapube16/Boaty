import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Globe, Clock, Shield, BarChart2, Headphones } from 'lucide-react';

const benefits = [
    {
        icon: Globe,
        title: 'Alcance Global',
        description: 'Conecta con la demanda turística más sofisticada. Tu servicio visible para viajeros de alto perfil.',
    },
    {
        icon: TrendingUp,
        title: 'Optimización de Activos',
        description: 'Maximiza la ocupación de tu flota. Convierte los tiempos muertos en reservas confirmadas.',
    },
    {
        icon: Clock,
        title: 'Respuesta Instantánea',
        description: 'Sincronización en tiempo real. Elimina la fricción de las cotizaciones manuales y cierra ventas en minutos.',
    },
    {
        icon: Shield,
        title: 'Seguridad Operativa',
        description: 'Estandarización y protocolos claros. Gestiona tu operación con la tranquilidad de una plataforma profesional.',
    },
    {
        icon: BarChart2,
        title: 'Inteligencia de Datos',
        description: 'Accede a métricas de rendimiento avanzadas para escalar tu negocio basado en resultados reales.',
    },
    {
        icon: Headphones,
        title: 'Soporte Concierge',
        description: 'Asistencia personalizada para proveedores. Nuestro equipo está contigo en cada etapa de la transacción.',
    },
];

export const Benefits = () => {
    return (
        <section id="beneficios" className="py-32 bg-white relative overflow-hidden">
            <div className="container mx-auto max-w-7xl px-6 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="max-w-2xl"
                    >
                        <span className="text-orange-DEFAULT font-bold text-[10px] uppercase tracking-[0.4em] mb-4 block">
                            EL ALIADO ESTRATÉGICO
                        </span>
                        <h2 className="text-5xl md:text-7xl font-heading font-black text-navy-dark leading-tight">
                            Elevamos la <br />
                            <span className="text-gradient">Eficiencia de tu Negocio.</span>
                        </h2>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-navy-dark/40 max-w-sm text-sm font-medium leading-relaxed pb-2"
                    >
                        BOATY no es solo una plataforma de reservas; es la infraestructura digital que tu operación náutica necesita para competir a nivel global.
                    </motion.p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {benefits.map((benefit, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className="group relative p-10 rounded-[40px] border border-cream hover:border-orange-DEFAULT/20 transition-all duration-500 bg-cream-light/30 hover:bg-white hover:shadow-premium"
                        >
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-orange-DEFAULT transition-colors duration-500">
                                <benefit.icon className="text-navy-dark group-hover:text-white transition-colors duration-500" size={24} />
                            </div>
                            <h3 className="text-navy-dark font-heading font-bold text-xl mb-4 tracking-tight">{benefit.title}</h3>
                            <p className="text-navy-dark/50 text-sm leading-relaxed font-medium group-hover:text-navy-dark/70 transition-colors">{benefit.description}</p>

                            {/* Accent Dot */}
                            <div className="absolute top-10 right-10 w-1.5 h-1.5 rounded-full bg-cream group-hover:bg-orange-DEFAULT transition-colors" />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Subtle background element */}
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-DEFAULT/5 rounded-full blur-[100px] pointer-events-none" />
        </section>
    );
};
