import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!email || !token) {
            setError('Faltan parámetros de seguridad. Asegúrate de usar el enlace completo enviado a tu correo.');
        }
    }, [email, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, password }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 5000);
            } else {
                setError(data.message || 'Error al restablecer la contraseña.');
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
                {!success ? (
                    <>
                        <h1 className="text-3xl font-heading font-black text-navy-dark mb-2">
                            Nueva contraseña ⛵
                        </h1>
                        <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                            Crea una nueva contraseña segura para tu cuenta en <strong>BOATY</strong>.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Nueva Contraseña</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-navy-dark transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-11 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-navy-dark placeholder:text-slate-400 focus:bg-white focus:border-navy-dark/10 focus:outline-none transition-all"
                                        placeholder="Min. 8 caracteres"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-navy-dark transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Confirmar Contraseña</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-navy-dark transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-11 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-navy-dark placeholder:text-slate-400 focus:bg-white focus:border-navy-dark/10 focus:outline-none transition-all"
                                        placeholder="Repite la contraseña"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-3 bg-red-50 p-4 rounded-2xl border border-red-100">
                                    <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-600 text-xs font-semibold leading-relaxed">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !token}
                                className="w-full bg-navy-dark text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-navy-dark/90 active:scale-[0.98] transition-all shadow-lg shadow-navy-dark/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Actualizar contraseña'
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-heading font-black text-navy-dark mb-3">¡Cambiado con éxito!</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8">
                            Tu contraseña ha sido actualizada correctamente. Serás redirigido al inicio de sesión en unos segundos.
                        </p>
                        <Link
                            to="/login"
                            className="inline-block w-full bg-navy-dark text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-navy-dark/90 transition-all"
                        >
                            Ir al Login ahora
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
