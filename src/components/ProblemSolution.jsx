import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

export const ProblemSolution = () => {
    const problems = [
        "No price transparency",
        "Slow response times (24h+)",
        "Unreliable availability",
        "Manual booking process"
    ];

    const solutions = [
        "Instant pricing & booking",
        "Real-time availability",
        "Verified boat owners",
        "Digital, secure payments"
    ];

    return (
        <section className="py-20 bg-primary relative overflow-hidden">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose <span className="text-accent">BOATY</span>?</h2>
                    <p className="text-slate max-w-2xl mx-auto">
                        We're revolutionizing the way you experience the sea. Say goodbye to the old way of renting boats.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Old Way */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-2xl bg-secondary/30 border border-red-500/20"
                    >
                        <h3 className="text-2xl font-bold text-red-400 mb-6">The Old Way</h3>
                        <ul className="space-y-4">
                            {problems.map((item, index) => (
                                <li key={index} className="flex items-center gap-3 text-slate">
                                    <XCircle className="text-red-500 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* New Way - BOATY */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-2xl bg-secondary/80 border border-accent/20 shadow-[0_0_30px_rgba(100,255,218,0.05)] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 bg-accent/10 rounded-bl-2xl">
                            <span className="text-accent font-bold text-xs">MODERN CHOICE</span>
                        </div>

                        <h3 className="text-2xl font-bold text-accent mb-6">The BOATY Way</h3>
                        <ul className="space-y-4">
                            {solutions.map((item, index) => (
                                <li key={index} className="flex items-center gap-3 text-white">
                                    <CheckCircle className="text-accent shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
