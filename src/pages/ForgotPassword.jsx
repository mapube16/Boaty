import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) {
                setSent(true);
            } else {
                setError(data.message || 'Error al enviar el correo.');
            }
        } catch (err) {
            setError('Error de conexión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10"
            >
                <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-navy-dark text-xs font-bold uppercase tracking-widest transition-colors mb-8">
                    <ArrowLeft size={14} />
                    Volver al inicio
                </Link>

                {!sent ? (
                    <>
                        <h1 className="text-3xl font-heading font-black text-navy-dark mb-2">
                            ¿Olvidaste tu contraseña? ⚓
                        </h1>
                        <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                            No te preocupes. Ingresa tu correo electrónico y te enviaremos instrucciones para restablecerla.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-navy-dark transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-navy-dark placeholder:text-slate-400 focus:bg-white focus:border-navy-dark/10 focus:outline-none transition-all"
                                        placeholder="tu@email.com"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-xs font-semibold bg-red-50 p-3 rounded-lg border border-red-100">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-navy-dark text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-navy-dark/90 active:scale-[0.98] transition-all shadow-lg shadow-navy-dark/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Enviar instrucciones
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-heading font-black text-navy-dark mb-3">¡Correo enviado!</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8">
                            Hemos enviado un enlace de recuperación a <strong>{email}</strong>. Por favor revisa tu bandeja de entrada (y la carpeta de spam).
                        </p>
                        <Link
                            to="/login"
                            className="inline-block w-full bg-white border-2 border-slate-100 text-slate-600 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm hover:border-navy-dark/10 hover:text-navy-dark transition-all"
                        >
                            Ir al Login
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
