import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const InvitePage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { loadMe } = useAuth();

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) setError('Enlace de invitación inválido. No se encontró el token.');
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        if (password !== confirm) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/complete-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.message || 'Error al completar el registro.');
                return;
            }
            setSuccess(true);
            // Refresh auth context — the user is now logged in via cookies
            await loadMe();
            // Redirect to dashboard after a moment
            setTimeout(() => navigate('/dashboard'), 2500);
        } catch {
            setError('Error de conexión. Intenta de nuevo.');
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
                    <a href="/">
                        <h1 className="text-white font-heading font-extrabold text-3xl tracking-widest">
                            BOATY
                        </h1>
                        <div className="h-[2px] bg-gradient-to-r from-orange-DEFAULT to-orange-light mt-2 mx-auto w-16" />
                    </a>
                </div>

                {/* Card */}
                <div className="bg-white/[0.06] backdrop-blur-xl rounded-3xl border border-white/10 p-10 shadow-2xl">
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6"
                        >
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                                <CheckCircle size={32} className="text-emerald-400" />
                            </div>
                            <h2 className="text-white font-heading font-bold text-2xl mb-2">
                                ¡Registro completado!
                            </h2>
                            <p className="text-white/50 text-sm">
                                Tu cuenta está activa. Redirigiendo a tu panel...
                            </p>
                        </motion.div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h2 className="text-white font-heading font-bold text-2xl mb-2">
                                    Completa tu registro
                                </h2>
                                <p className="text-white/50 text-sm leading-relaxed">
                                    Tu solicitud fue aprobada. Crea una contraseña para acceder a tu panel de proveedor.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                                        Contraseña
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3 pr-12 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-DEFAULT/50 focus:ring-1 focus:ring-orange-DEFAULT/25 transition-all"
                                            placeholder="Mínimo 8 caracteres"
                                            required
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                                        Confirmar contraseña
                                    </label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-DEFAULT/50 focus:ring-1 focus:ring-orange-DEFAULT/25 transition-all"
                                        placeholder="Repite tu contraseña"
                                        required
                                        minLength={8}
                                    />
                                </div>

                                {/* Password strength indicator */}
                                {password && (
                                    <div className="flex gap-1.5">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1.5 flex-1 rounded-full transition-all ${
                                                    password.length >= level * 3
                                                        ? level <= 1 ? 'bg-red-400'
                                                        : level <= 2 ? 'bg-amber-400'
                                                        : level <= 3 ? 'bg-blue-400'
                                                        : 'bg-emerald-400'
                                                        : 'bg-white/10'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-3"
                                    >
                                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !token}
                                    className="w-full rounded-xl bg-orange-DEFAULT text-white py-3.5 text-sm font-black uppercase tracking-[0.25em] hover:bg-orange-dark transition-all shadow-premium-orange hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                    {loading ? 'Activando cuenta...' : 'Crear mi cuenta'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
