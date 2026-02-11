import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';

const DestinationCard = ({ name, image, boats, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        viewport={{ once: true }}
        className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer"
    >
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent z-10" />
        <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute bottom-0 left-0 w-full p-6 z-20">
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 text-accent mb-2">
                        <MapPin size={16} />
                        <span className="text-sm font-medium tracking-wider">COLOMBIA</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{name}</h3>
                    <p className="text-slate text-sm">{boats} Boats Available</p>
                </div>

                <div className="bg-accent/10 p-2 rounded-full backdrop-blur-sm group-hover:bg-accent group-hover:text-primary transition-all duration-300">
                    <ArrowRight size={20} />
                </div>
            </div>
        </div>
    </motion.div>
);

export const Destinations = () => {
    const destinations = [
        {
            name: "Cartagena",
            image: "https://images.unsplash.com/photo-1629833728636-6132473426a8?q=80&w=2070&auto=format&fit=crop",
            boats: "120+",
            delay: 0.1
        },
        {
            name: "Santa Marta",
            image: "https://images.unsplash.com/photo-1628608684828-56e6d453982f?q=80&w=2070&auto=format&fit=crop",
            boats: "45+",
            delay: 0.2
        },
        {
            name: "San Andrés",
            image: "https://images.unsplash.com/photo-1620614050212-9c1851e22033?q=80&w=2070&auto=format&fit=crop",
            boats: "80+",
            delay: 0.3
        }
    ];

    return (
        <section id="destinations" className="py-20 bg-primary">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Popular <span className="text-gradient">Destinations</span></h2>
                        <p className="text-slate max-w-xl">Explore the most breathtaking coastal paradises.</p>
                    </div>
                    <button className="hidden md:flex items-center gap-2 text-accent hover:text-white transition-colors">
                        View all locations <ArrowRight size={16} />
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {destinations.map((dest, index) => (
                        <DestinationCard key={index} {...dest} />
                    ))}
                </div>
            </div>
        </section>
    );
};
