import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { BarChart3, ShieldCheck, Clock } from 'lucide-react';

export const ForOwners = () => {
    const benefits = [
        {
            icon: <Clock className="text-accent" />,
            title: "Optimize Your Assets",
            desc: "Turn idle time into revenue with our high-demand international network."
        },
        {
            icon: <BarChart3 className="text-accent" />,
            title: "Control Everything",
            desc: "Manage availability, pricing, and bookings from a single dashboard."
        },
        {
            icon: <ShieldCheck className="text-accent" />,
            title: "Trusted Partners",
            desc: "We verify guests and handle payments so you can focus on operations."
        }
    ];

    return (
        <section id="owners" className="py-24 bg-gradient-to-b from-secondary to-primary relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-16">

                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            Partner with <span className="text-accent">BOATY</span>
                        </h2>
                        <p className="text-lg text-slate mb-8 leading-relaxed">
                            Join the network of professional boat owners maximizing their fleet's potential.
                            Get access to premium international tourists and streamline your business.
                        </p>

                        <div className="space-y-6 mb-10">
                            {benefits.map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="mt-1 p-2 bg-accent/10 rounded-lg h-fit">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg">{item.title}</h4>
                                        <p className="text-slate text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button>List Your Boat</Button>
                    </motion.div>

                    {/* Image Side */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="flex-1 relative"
                    >
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&q=80&w=2070"
                                alt="Captain on boat"
                                className="w-full h-full object-cover grayscale0 hover:grayscale-0 transition-all duration-500"
                            />
                            <div className="absolute inset-0 bg-primary/20 hover:bg-transparent transition-colors duration-500" />
                        </div>
                        {/* Floating Card */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            viewport={{ once: true }}
                            className="absolute -bottom-6 -left-6 glass p-6 rounded-xl border border-white/10 shadow-xl hidden md:block"
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-3xl font-bold text-accent">+15%</div>
                                <div className="text-sm text-slate">Revenue Increase<br />in first month</div>
                            </div>
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};
