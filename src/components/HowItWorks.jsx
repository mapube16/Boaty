import React from 'react';
import { motion } from 'framer-motion';
import { Search, CalendarCheck, Sailboat } from 'lucide-react';

export const HowItWorks = () => {
    const steps = [
        {
            icon: <Search size={40} />,
            title: "1. Search",
            desc: "Browse our curated fleet of yachts and boats in top destinations."
        },
        {
            icon: <CalendarCheck size={40} />,
            title: "2. Book",
            desc: "Select your dates and book instantly. No more waiting for quotes."
        },
        {
            icon: <Sailboat size={40} />,
            title: "3. Sail",
            desc: "Meet your captain and enjoy an unforgettable experience at sea."
        }
    ];

    return (
        <section id="how-it-works" className="py-20 bg-primary relative">
            <div className="container mx-auto px-6 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-5xl font-bold mb-16"
                >
                    How <span className="text-accent">BOATY</span> Works
                </motion.h2>

                <div className="grid md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className="relative z-10 flex flex-col items-center"
                        >
                            <div className="w-24 h-24 rounded-full bg-secondary border border-accent/20 flex items-center justify-center text-accent mb-6 shadow-[0_0_20px_rgba(100,255,218,0.1)]">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                            <p className="text-slate max-w-xs">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
