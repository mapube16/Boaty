import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    LogOut, Ship, MapPin, Users, Mail, Phone, Building,
    Anchor, CheckCircle, Clock, AlertTriangle, Settings, ChevronRight
} from 'lucide-react';

const statusConfig = {
    pendiente: { label: 'Pendiente de revisión', color: 'amber', icon: Clock, description: 'Tu solicitud está siendo revisada por nuestro equipo.' },
    revisado: { label: 'Revisado', color: 'blue', icon: CheckCircle, description: 'Tu solicitud ha sido revisada. Pronto recibirás novedades.' },
    activo: { label: 'Activo', color: 'emerald', icon: CheckCircle, description: '¡Tu cuenta está activa! Ya puedes publicar embarcaciones.' },
    rechazado: { label: 'Rechazado', color: 'red', icon: AlertTriangle, description: 'Tu solicitud no fue aprobada. Contacta a soporte para más información.' },
};

export const ProviderDashboard = () => {
    const { user, logout, loadMe } = useAuth();
    const navigate = useNavigate();
    const [provider, setProvider] = useState(user?.provider || null);

    useEffect(() => {
        if (user?.provider) setProvider(user.provider);
    }, [user]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const status = statusConfig[provider?.estado] || statusConfig.pendiente;
    const StatusIcon = status.icon;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Bar */}
            <header className="bg-navy-dark border-b border-white/10 sticky top-0 z-50">
                <div className="container mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
                    <a href="/" className="group flex items-center gap-3">
                        <span className="text-white font-heading font-extrabold text-xl tracking-widest">BOATY</span>
                        <span className="text-white/30 text-xs font-semibold uppercase tracking-widest hidden sm:inline">Mi Panel</span>
                    </a>
                    <div className="flex items-center gap-5">
                        <div className="text-right hidden sm:block">
                            <p className="text-white text-sm font-semibold">{user?.email}</p>
                            <p className="text-white/40 text-xs uppercase tracking-widest">Proveedor</p>
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

            <main className="container mx-auto max-w-6xl px-6 py-10">
                {/* Welcome */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-3xl md:text-4xl font-heading font-black text-navy-dark">
                        Hola, {provider?.nombre || 'Proveedor'} 👋
                    </h1>
                    <p className="text-slate-500 mt-2">Bienvenido a tu panel de control en BOATY.</p>
                </motion.div>

                {/* Status banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`rounded-2xl border p-6 mb-8 flex items-start gap-4 ${
                        status.color === 'emerald' ? 'bg-emerald-50 border-emerald-200' :
                        status.color === 'amber' ? 'bg-amber-50 border-amber-200' :
                        status.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                        'bg-red-50 border-red-200'
                    }`}
                >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        status.color === 'emerald' ? 'bg-emerald-100' :
                        status.color === 'amber' ? 'bg-amber-100' :
                        status.color === 'blue' ? 'bg-blue-100' :
                        'bg-red-100'
                    }`}>
                        <StatusIcon size={22} className={
                            status.color === 'emerald' ? 'text-emerald-600' :
                            status.color === 'amber' ? 'text-amber-600' :
                            status.color === 'blue' ? 'text-blue-600' :
                            'text-red-600'
                        } />
                    </div>
                    <div>
                        <p className={`text-sm font-bold uppercase tracking-widest ${
                            status.color === 'emerald' ? 'text-emerald-700' :
                            status.color === 'amber' ? 'text-amber-700' :
                            status.color === 'blue' ? 'text-blue-700' :
                            'text-red-700'
                        }`}>
                            Estado: {status.label}
                        </p>
                        <p className={`text-sm mt-1 ${
                            status.color === 'emerald' ? 'text-emerald-600' :
                            status.color === 'amber' ? 'text-amber-600' :
                            status.color === 'blue' ? 'text-blue-600' :
                            'text-red-600'
                        }`}>
                            {status.description}
                        </p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column — Profile info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Personal info */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="font-heading font-bold text-navy-dark">Información personal</h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoField icon={<Users size={14} />} label="Nombre completo" value={`${provider?.nombre || ''} ${provider?.apellido || ''}`} />
                                <InfoField icon={<Mail size={14} />} label="Email" value={provider?.email || user?.email} />
                                <InfoField icon={<Phone size={14} />} label="Teléfono" value={provider?.telefono || '—'} />
                                <InfoField icon={<Building size={14} />} label="Empresa" value={provider?.empresa || '—'} />
                            </div>
                        </div>

                        {/* Boat info */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h2 className="font-heading font-bold text-navy-dark">Información de embarcaciones</h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoField icon={<MapPin size={14} />} label="Destino" value={provider?.destino || '—'} />
                                <InfoField icon={<Ship size={14} />} label="Tipo de embarcación" value={provider?.tipoEmbarcacion || '—'} />
                                <InfoField icon={<Anchor size={14} />} label="Cantidad de embarcaciones" value={provider?.cantidadEmbarcaciones || '—'} />
                                <InfoField icon={<Users size={14} />} label="Capacidad de personas" value={provider?.capacidadPersonas || '—'} />
                            </div>
                            {provider?.descripcion && (
                                <div className="px-6 pb-6">
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Descripción</p>
                                        <p className="text-sm text-slate-700 leading-relaxed">{provider.descripcion}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right column — Quick actions & stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Quick stats */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h3 className="font-heading font-bold text-navy-dark mb-4">Resumen</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Embarcaciones</span>
                                    <span className="text-lg font-heading font-black text-navy-dark">{provider?.cantidadEmbarcaciones || 0}</span>
                                </div>
                                <div className="h-px bg-slate-100" />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Reservas</span>
                                    <span className="text-lg font-heading font-black text-slate-300">0</span>
                                </div>
                                <div className="h-px bg-slate-100" />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Ingresos</span>
                                    <span className="text-lg font-heading font-black text-slate-300">$0</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h3 className="font-heading font-bold text-navy-dark mb-4">Acciones rápidas</h3>
                            <div className="space-y-2">
                                <QuickAction
                                    icon={<Ship size={16} />}
                                    label="Mis embarcaciones"
                                    description="Próximamente"
                                    disabled
                                />
                                <QuickAction
                                    icon={<Settings size={16} />}
                                    label="Configuración"
                                    description="Próximamente"
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Registration date */}
                        {provider?.createdAt && (
                            <div className="text-center text-xs text-slate-400 px-2">
                                Registrado el {new Date(provider.createdAt).toLocaleDateString('es-CO', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </div>
                        )}
                    </motion.div>
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

const QuickAction = ({ icon, label, description, disabled, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
            disabled
                ? 'bg-slate-50 text-slate-400 cursor-not-allowed'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
        }`}
    >
        <span className={disabled ? 'text-slate-300' : 'text-navy-dark'}>{icon}</span>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{label}</p>
            {description && <p className="text-xs text-slate-400">{description}</p>}
        </div>
        <ChevronRight size={14} className="text-slate-300" />
    </button>
);
