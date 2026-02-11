import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { Button } from './Button';

export const Hero = () => {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image Placeholder - In a real app, uses a high-quality video or image */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/90 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&q=80&w=2070"
                    alt="Luxury Boat"
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="container mx-auto px-6 z-20 relative">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-4xl mx-auto"
                >
                    <motion.h1
                        className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Experience the Sea, <br />
                        <span className="text-gradient">On Your Terms.</span>
                    </motion.h1>

                    <motion.p
                        className="text-lg md:text-xl text-light-slate mb-10 max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        The premier on-demand marketplace for luxury boat rentals.
                        Fast, reliable, and exclusive experiences for international travelers.
                    </motion.p>

                    {/* Search Box - Glassmorphism */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="glass p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between max-w-3xl mx-auto shadow-2xl border border-white/10"
                    >
                        <div className="flex items-center gap-3 w-full md:w-auto px-4 py-2 bg-primary/30 rounded-lg border border-white/5">
                            <MapPin className="text-accent" />
                            <input
                                type="text"
                                placeholder="Where to?"
                                className="bg-transparent border-none text-white focus:ring-0 placeholder-slate/50 w-full"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto px-4 py-2 bg-primary/30 rounded-lg border border-white/5">
                            <Calendar className="text-accent" />
                            <input
                                type="text"
                                placeholder="Date"
                                className="bg-transparent border-none text-white focus:ring-0 placeholder-slate/50 w-full"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto px-4 py-2 bg-primary/30 rounded-lg border border-white/5">
                            <Users className="text-accent" />
                            <select className="bg-transparent border-none text-white focus:ring-0 w-full [&>option]:bg-primary">
                                <option>2 Guests</option>
                                <option>4 Guests</option>
                                <option>6+ Guests</option>
                            </select>
                        </div>

                        <Button className="w-full md:w-auto bg-accent text-primary font-bold shadow-lg shadow-accent/20">
                            Search Boats
                        </Button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary to-transparent z-10" />
        </section>
    );
};
