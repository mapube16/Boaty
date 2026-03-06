import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            else if (user.role === 'CLIENT') navigate('/cliente');
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
                        <div className="h-[2px] bg-gradient-to-r from-orange to-orange-light mt-2 mx-auto w-16" />
                    </a>
                </div>

                {/* Card */}
                <div className="bg-white/[0.06] backdrop-blur-xl rounded-3xl border border-white/10 p-10 shadow-2xl">
                    {/* aria-live announces errors to screen readers without stealing focus */}
                    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                        {error}
                    </div>

                    <h2 className="text-white font-heading font-bold text-2xl mb-2">Iniciar sesión</h2>
                    <p className="text-white/50 text-sm mb-8">Accede a tu panel de control</p>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {/* Email — htmlFor links the label to the input for AT and click targeting */}
                        <div>
                            <label
                                htmlFor="login-email"
                                className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2"
                            >
                                Email
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange/50 focus:ring-1 focus:ring-orange/25 transition-all"
                                placeholder="tu@email.com"
                                required
                                aria-required="true"
                            />
                        </div>

                        {/* Password — show/hide toggle improves usability on all devices */}
                        <div>
                            <label
                                htmlFor="login-password"
                                className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2"
                            >
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3 pr-11 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange/50 focus:ring-1 focus:ring-orange/25 transition-all"
                                    placeholder="••••••••"
                                    required
                                    aria-required="true"
                                />
                                {/* 44×44px touch target; type="button" prevents form submission */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    className="absolute inset-y-0 right-0 flex items-center justify-center w-11 text-white/30 hover:text-white/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange/50 rounded-r-xl"
                                >
                                    {showPassword
                                        ? <EyeOff size={16} aria-hidden="true" />
                                        : <Eye size={16} aria-hidden="true" />
                                    }
                                </button>
                            </div>
                            <div className="flex justify-end mt-2">
                                <a
                                    href="/forgot-password"
                                    className="text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-orange transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                        </div>

                        {/* Error message — visible counterpart to the sr-only aria-live region */}
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                role="alert"
                                className="flex items-center gap-2 text-sm text-red-400 font-semibold bg-red-500/10 rounded-xl px-4 py-2"
                            >
                                <AlertCircle size={15} className="shrink-0" aria-hidden="true" />
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            aria-busy={loading}
                            className="w-full rounded-xl bg-orange text-white py-3.5 text-sm font-black uppercase tracking-[0.25em] hover:bg-orange-dark transition-all shadow-premium-orange hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-navy-dark"
                        >
                            {loading && <Loader2 size={15} className="animate-spin shrink-0" aria-hidden="true" />}
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
