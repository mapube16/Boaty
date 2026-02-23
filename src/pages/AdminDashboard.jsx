import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, RefreshCw, CheckCircle, Clock, Users, Ship, ChevronDown, Mail, Phone, Building, MapPin, Anchor, Calendar } from 'lucide-react';

export const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionMsg, setActionMsg] = useState('');
    const [error, setError] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    const showMsg = (msg, isError = false) => {
        if (isError) setError(msg);
        else setActionMsg(msg);
        setTimeout(() => { setError(''); setActionMsg(''); }, 4000);
    };

    const loadProviders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/providers', { credentials: 'include' });
            const data = await res.json();
            if (res.ok && data?.success) setProviders(data.data || []);
            else showMsg(data?.message || 'Error cargando proveedores.', true);
        } catch {
            showMsg('Error de conexion.', true);
        } finally {
            setLoading(false);
        }
    }, []);

    const approveProvider = async (id) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/providers/${id}/approve`, {
                method: 'POST',
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) { showMsg(data?.message || 'Error al aprobar.', true); return; }
            showMsg(data?.message || 'Proveedor aprobado.');
            await loadProviders();
        } catch {
            showMsg('Error de conexion.', true);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    useEffect(() => { loadProviders(); }, [loadProviders]);

    const pendientes = providers.filter(p => p.estado === 'pendiente');
    const revisados = providers.filter(p => p.estado !== 'pendiente');

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Bar */}
            <header className="bg-navy-dark border-b border-white/10 sticky top-0 z-50">
                <div className="container mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
                    <a href="/" className="group flex items-center gap-3">
                        <span className="text-white font-heading font-extrabold text-xl tracking-widest">BOATY</span>
                        <span className="text-white/30 text-xs font-semibold uppercase tracking-widest hidden sm:inline">Panel Admin</span>
                    </a>
                    <div className="flex items-center gap-5">
                        <div className="text-right hidden sm:block">
                            <p className="text-white text-sm font-semibold">{user?.email}</p>
                            <p className="text-white/40 text-xs uppercase tracking-widest">{user?.role}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Salir</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto max-w-7xl px-6 py-10">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0 }}
                        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Users size={18} className="text-blue-500" />
                            </div>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total</span>
                        </div>
                        <p className="text-3xl font-heading font-black text-navy-dark">{providers.length}</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                <Clock size={18} className="text-amber-500" />
                            </div>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Pendientes</span>
                        </div>
                        <p className="text-3xl font-heading font-black text-amber-600">{pendientes.length}</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <CheckCircle size={18} className="text-emerald-500" />
                            </div>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Revisados</span>
                        </div>
                        <p className="text-3xl font-heading font-black text-emerald-600">{revisados.length}</p>
                    </motion.div>
                </div>

                {/* Action bar */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-heading font-black text-navy-dark">Solicitudes de proveedores</h2>
                    <button
                        onClick={loadProviders}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl bg-navy-dark text-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-navy-dark/90 transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Recargar
                    </button>
                </div>

                {/* Messages */}
                {actionMsg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-5 py-3 text-sm font-semibold mb-6">
                        {actionMsg}
                    </motion.div>
                )}
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-3 text-sm font-semibold mb-6">
                        {error}
                    </motion.div>
                )}

                {/* Provider List */}
                <div className="space-y-4">
                    {providers.length === 0 && !loading && (
                        <div className="text-center py-16">
                            <Ship size={40} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-400 text-sm">No hay proveedores registrados aún.</p>
                        </div>
                    )}
                    {providers.map((provider, i) => {
                        const isExpanded = expandedId === provider._id;
                        const createdAt = provider.createdAt ? new Date(provider.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

                        return (
                            <motion.div
                                key={provider._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                            >
                                {/* Header row — clickable */}
                                <button
                                    type="button"
                                    onClick={() => setExpandedId(isExpanded ? null : provider._id)}
                                    className="w-full p-6 flex items-center justify-between gap-4 text-left hover:bg-slate-50/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-navy-dark/5 flex items-center justify-center flex-shrink-0">
                                            <span className="text-navy-dark font-heading font-black text-lg">
                                                {(provider.nombre || '?')[0].toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-900 truncate">
                                                {provider.nombre} {provider.apellido}
                                            </p>
                                            <p className="text-sm text-slate-500 truncate">{provider.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg ${
                                            provider.estado === 'pendiente'
                                                ? 'bg-amber-50 text-amber-600'
                                                : provider.estado === 'revisado'
                                                ? 'bg-blue-50 text-blue-600'
                                                : provider.estado === 'activo'
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'bg-slate-50 text-slate-500'
                                        }`}>
                                            {provider.estado}
                                        </span>
                                        <ChevronDown
                                            size={18}
                                            className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                        />
                                    </div>
                                </button>

                                {/* Expanded detail */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6 border-t border-slate-100 pt-5">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {/* Contacto */}
                                                    <InfoField icon={<Mail size={14} />} label="Email" value={provider.email} />
                                                    <InfoField icon={<Phone size={14} />} label="Teléfono" value={provider.telefono} />
                                                    <InfoField icon={<Building size={14} />} label="Empresa" value={provider.empresa || '—'} />

                                                    {/* Embarcación */}
                                                    <InfoField icon={<MapPin size={14} />} label="Destino" value={provider.destino} />
                                                    <InfoField icon={<Ship size={14} />} label="Tipo de embarcación" value={provider.tipoEmbarcacion} />
                                                    <InfoField icon={<Anchor size={14} />} label="Cantidad embarcaciones" value={provider.cantidadEmbarcaciones} />
                                                    <InfoField icon={<Users size={14} />} label="Capacidad personas" value={provider.capacidadPersonas || '—'} />
                                                    {createdAt && (
                                                        <InfoField icon={<Calendar size={14} />} label="Fecha de registro" value={createdAt} />
                                                    )}
                                                </div>

                                                {/* Descripción */}
                                                {provider.descripcion && (
                                                    <div className="mt-4 bg-slate-50 rounded-xl p-4">
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Descripción</p>
                                                        <p className="text-sm text-slate-700 leading-relaxed">{provider.descripcion}</p>
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                {provider.estado === 'pendiente' && (
                                                    <div className="mt-5 flex gap-3">
                                                        <button
                                                            onClick={() => approveProvider(provider._id)}
                                                            disabled={loading}
                                                            className="rounded-xl bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50"
                                                        >
                                                            Aprobar y enviar invitación
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

const InfoField = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 bg-slate-50/80 rounded-xl px-4 py-3">
        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-slate-400">{icon}</span>
        </div>
        <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
        </div>
    </div>
);
