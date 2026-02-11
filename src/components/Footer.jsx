import React from 'react';
import { Anchor, Instagram, Facebook, Twitter } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-primary pt-16 pb-8 border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">

                    {/* Brand */}
                    <div className="max-w-xs">
                        <div className="flex items-center gap-2 text-2xl font-bold text-white mb-4">
                            <Anchor className="text-accent" size={28} />
                            BOATY
                        </div>
                        <p className="text-slate text-sm">
                            The premier on-demand marketplace for luxury boat rentals. Experience the sea on your terms.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex gap-16">
                        <div>
                            <h4 className="text-white font-bold mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm text-slate">
                                <li><a href="#" className="hover:text-accent transition-colors">Destinations</a></li>
                                <li><a href="#" className="hover:text-accent transition-colors">How it Works</a></li>
                                <li><a href="#" className="hover:text-accent transition-colors">Safety</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-slate">
                                <li><a href="#" className="hover:text-accent transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-accent transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-accent transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="text-white font-bold mb-4">Follow Us</h4>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-slate hover:bg-accent hover:text-primary transition-all duration-300">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-slate hover:bg-accent hover:text-primary transition-all duration-300">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-slate hover:bg-accent hover:text-primary transition-all duration-300">
                                <Twitter size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center text-sm text-slate">
                    <p>&copy; {new Date().getFullYear()} BOATY. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
