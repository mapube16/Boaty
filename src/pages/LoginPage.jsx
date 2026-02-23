import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            // Redirect based on role
            if (user.role === 'STAFF') navigate('/admin');
            else if (user.role === 'ADMIN') navigate('/dashboard');
            else if (user.role === 'OPERATOR') navigate('/operador');
            else navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy-dark to-[#1e3a5f] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-10">
                    <a href="/" className="inline-block">
                        <h1 className="text-white font-heading font-extrabold text-3xl tracking-widest">
                            BO<span className="text-white">A</span>TY
                        </h1>
                        <div className="h-[2px] bg-gradient-to-r from-orange-DEFAULT to-orange-light mt-2 mx-auto w-16" />
                    </a>
                </div>

                {/* Card */}
                <div className="bg-white/[0.06] backdrop-blur-xl rounded-3xl border border-white/10 p-10 shadow-2xl">
                    <h2 className="text-white font-heading font-bold text-2xl mb-2">Iniciar sesión</h2>
                    <p className="text-white/50 text-sm mb-8">Accede a tu panel de control</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-DEFAULT/50 focus:ring-1 focus:ring-orange-DEFAULT/25 transition-all"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-DEFAULT/50 focus:ring-1 focus:ring-orange-DEFAULT/25 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-red-400 font-semibold bg-red-500/10 rounded-xl px-4 py-2"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-orange-DEFAULT text-white py-3.5 text-sm font-black uppercase tracking-[0.25em] hover:bg-orange-dark transition-all shadow-premium-orange hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            {loading ? 'Verificando...' : 'Entrar'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-white/20 text-xs mt-8">
                    <a href="/" className="hover:text-white/40 transition-colors">← Volver al inicio</a>
                </p>
            </motion.div>
        </div>
    );
};
