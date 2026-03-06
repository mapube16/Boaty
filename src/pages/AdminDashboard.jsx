import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    LogOut, RefreshCw, CheckCircle, Clock, Users, Ship, ChevronDown,
    Mail, Phone, Building, MapPin, Anchor, Calendar, DollarSign,
    TrendingUp, BarChart2, CheckSquare, XSquare, Hash, Activity, Edit2, Save, X
} from 'lucide-react';

export const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('providers'); // 'providers' | 'financial' | 'users'
    const [providers, setProviders] = useState([]);
    const [financialData, setFinancialData] = useState([]);
    const [userStats, setUserStats] = useState({ clients: [], boats: [] });
    const [loading, setLoading] = useState(false);
    const [financialLoading, setFinancialLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [actionMsg, setActionMsg] = useState('');
    const [error, setError] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [expandedOperatorId, setExpandedOperatorId] = useState(null);
    const [systemUsers, setSystemUsers] = useState({ users: [], providers: [] });
    const [phoneEditing, setPhoneEditing] = useState(null); // { id, type: 'user'|'provider' }
    const [phoneValue, setPhoneValue] = useState('');

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

    const loadFinancialInfo = useCallback(async () => {
        setFinancialLoading(true);
        try {
            const res = await fetch('/api/admin/financial-info', { credentials: 'include' });
            const data = await res.json();
            if (res.ok && data?.success) setFinancialData(data.data || []);
            else showMsg(data?.message || 'Error cargando información financiera.', true);
        } catch {
            showMsg('Error de conexion.', true);
        } finally {
            setFinancialLoading(false);
        }
    }, []);

    const loadUserStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const res = await fetch('/api/admin/users-stats', { credentials: 'include' });
            const data = await res.json();
            if (res.ok && data?.success) {
                setUserStats({ clients: data.clients || [], boats: data.boats || [] });
            } else {
                showMsg(data?.message || 'Error cargando estadísticas.', true);
            }
        } catch {
            showMsg('Error de conexion.', true);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    const loadSystemUsers = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/system-users', { credentials: 'include' });
            const data = await res.json();
            if (res.ok && data?.success) setSystemUsers({ users: data.users || [], providers: data.providers || [] });
        } catch { /* silent */ }
    }, []);

    const savePhone = async (id, type) => {
        const url = type === 'user'
            ? `/api/admin/users/${id}/telefono`
            : `/api/admin/providers/${id}/telefono`;
        try {
            const res = await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ telefono: phoneValue }),
            });
            const data = await res.json();
            if (data.success) {
                showMsg('Telefono actualizado.');
                setPhoneEditing(null);
                loadSystemUsers();
            } else {
                showMsg(data.message || 'Error actualizando.', true);
            }
        } catch {
            showMsg('Error de conexion.', true);
        }
    };

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

    useEffect(() => {
        if (tab === 'providers') loadProviders();
        if (tab === 'financial') loadFinancialInfo();
        if (tab === 'users') { loadUserStats(); loadSystemUsers(); }
    }, [tab, loadProviders, loadFinancialInfo, loadUserStats, loadSystemUsers]);

    // Real-time SSE: show alert and refresh on new booking events
    useEffect(() => {
        const es = new EventSource('http://localhost:3002/api/events', { withCredentials: true });
        es.addEventListener('booking_event', (e) => {
            const payload = JSON.parse(e.data);
            if (payload.type === 'new_booking') {
                showMsg(`Nueva reserva recibida: ${payload.booking?.codigo} — ${payload.booking?.clienteNombre}`);
                if (tab === 'users') loadUserStats();
            } else if (payload.type === 'booking_status') {
                showMsg(`Reserva ${payload.codigo} cambio a: ${payload.estado.toUpperCase()}`);
            }
        });
        es.onerror = () => { /* browser handles reconnect */ };
        return () => es.close();
    }, [tab, loadUserStats]);

    const pendientes = providers.filter(p => p.estado === 'pendiente');
    const revisados = providers.filter(p => p.estado !== 'pendiente');

    const totalIngresos = financialData.reduce((s, o) => s + (o.totalIngresos || 0), 0);
    const totalViajes = financialData.reduce((s, o) => s + (o.totalViajes || 0), 0);

    const formatCOP = (val) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

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

            <main className="container mx-auto max-w-7xl px-6 py-10">

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-8">
                    <StatCard label="Proveedores" value={providers.length} icon={<Users size={18} />} color="blue" />
                    <StatCard label="Pendientes" value={pendientes.length} icon={<Clock size={18} />} color="amber" />
                    <StatCard label="Revisados" value={revisados.length} icon={<CheckCircle size={18} />} color="emerald" />
                    <StatCard label="Ingresos totales" value={financialData.length ? formatCOP(totalIngresos) : '—'} icon={<DollarSign size={18} />} color="violet" />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-6">
                    <TabButton active={tab === 'providers'} onClick={() => setTab('providers')} icon={<Ship size={14} />} label="Solicitudes" />
                    <TabButton active={tab === 'users'} onClick={() => setTab('users')} icon={<Users size={14} />} label="Usuarios & Disponibilidad" />
                    <TabButton active={tab === 'financial'} onClick={() => setTab('financial')} icon={<BarChart2 size={14} />} label="Resumen Financiero" />
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

                <AnimatePresence mode="wait">
                    {/* ── PROVIDERS TAB ── */}
                    {tab === 'providers' && (
                        <motion.div key="providers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                                            className={`rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 ${isExpanded ? 'bg-slate-50 border-slate-300 ring-1 ring-slate-200' : 'bg-white border-slate-200'}`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setExpandedId(isExpanded ? null : provider._id)}
                                                className={`w-full p-6 flex items-center justify-between gap-4 text-left transition-colors ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
                                            >
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isExpanded ? 'bg-white shadow-sm border border-slate-200' : 'bg-navy-dark/5'}`}>
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
                                                    <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg ${provider.estado === 'pendiente'
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
                                                        className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-navy-dark' : 'text-slate-400'}`}
                                                    />
                                                </div>
                                            </button>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                        className="overflow-hidden bg-white rounded-b-2xl border-t border-slate-200"
                                                    >
                                                        <div className="px-6 pb-6 pt-5">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                <InfoField icon={<Mail size={14} />} label="Email" value={provider.email} />
                                                                <InfoField icon={<Phone size={14} />} label="Teléfono" value={provider.telefono} />
                                                                <InfoField icon={<Building size={14} />} label="Empresa" value={provider.empresa || '—'} />
                                                                <InfoField icon={<MapPin size={14} />} label="Destino" value={provider.destino} />
                                                                <InfoField icon={<Ship size={14} />} label="Tipo de embarcación" value={provider.tipoEmbarcacion} />
                                                                <InfoField icon={<Anchor size={14} />} label="Cantidad embarcaciones" value={provider.cantidadEmbarcaciones} />
                                                                <InfoField icon={<Users size={14} />} label="Capacidad personas" value={provider.capacidadPersonas || '—'} />
                                                                {createdAt && (
                                                                    <InfoField icon={<Calendar size={14} />} label="Fecha de registro" value={createdAt} />
                                                                )}
                                                            </div>

                                                            {provider.descripcion && (
                                                                <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100/50">
                                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Descripción</p>
                                                                    <p className="text-sm text-slate-700 leading-relaxed">{provider.descripcion}</p>
                                                                </div>
                                                            )}

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
                        </motion.div>
                    )}

                    {/* ── USERS & AVAILABILITY TAB ── */}
                    {tab === 'users' && (
                        <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-heading font-black text-navy-dark">Usuarios & Disponibilidad</h2>
                                <button
                                    onClick={loadUserStats}
                                    disabled={statsLoading}
                                    className="flex items-center gap-2 rounded-xl bg-navy-dark text-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-navy-dark/90 transition-all disabled:opacity-50"
                                >
                                    <RefreshCw size={14} className={statsLoading ? 'animate-spin' : ''} />
                                    Recargar
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Clients Stats Table */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                                        <Users size={16} className="text-navy-dark" />
                                        <h3 className="font-bold text-navy-dark">Clientes (Uso de Boaty)</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <th className="px-6 py-3">Cliente</th>
                                                    <th className="px-6 py-3 text-center">Viajes</th>
                                                    <th className="px-6 py-3 text-right">Total Gastado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {userStats.clients.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="3" className="px-6 py-10 text-center text-slate-400">No hay datos de clientes.</td>
                                                    </tr>
                                                ) : (
                                                    userStats.clients.map((c) => (
                                                        <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <p className="font-bold text-navy-dark">{c.nombre || 'Sin nombre'}</p>
                                                                <p className="text-xs text-slate-400">{c._id}</p>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-bold">
                                                                    {c.totalViajes}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right font-black text-navy-dark">
                                                                {formatCOP(c.totalGastado)}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Boat Availability Table */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                                        <Ship size={16} className="text-navy-dark" />
                                        <h3 className="font-bold text-navy-dark">Disponibilidad de Lanchas</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <th className="px-6 py-3">Embarcación</th>
                                                    <th className="px-6 py-3">Matrícula</th>
                                                    <th className="px-6 py-3 text-right">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {userStats.boats.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="3" className="px-6 py-10 text-center text-slate-400">No hay embarcaciones registradas.</td>
                                                    </tr>
                                                ) : (
                                                    userStats.boats.map((b) => (
                                                        <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <p className="font-bold text-navy-dark">{b.nombre}</p>
                                                                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{b.tipo}</p>
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-500 font-medium">
                                                                {b.matricula}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${b.estado === 'activa' ? 'bg-emerald-50 text-emerald-600' :
                                                                        b.estado === 'mantenimiento' ? 'bg-amber-50 text-amber-600' :
                                                                            'bg-slate-50 text-slate-500'
                                                                    }`}>
                                                                    {b.estado}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* ── Phone Editor ── */}
                            <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                                    <Phone size={16} className="text-emerald-600" />
                                    <h3 className="font-bold text-navy-dark">Telefonos WhatsApp</h3>
                                    <span className="text-xs text-slate-400 ml-1">— Necesario para notificaciones automaticas</span>
                                </div>

                                {/* Operators / Staff */}
                                {systemUsers.users.filter(u => ['OPERATOR','STAFF','ADMIN'].includes(u.role)).length > 0 && (
                                    <div className="px-6 py-4 border-b border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Operadores & Staff</p>
                                        <div className="space-y-2">
                                            {systemUsers.users.filter(u => ['OPERATOR','STAFF','ADMIN'].includes(u.role)).map(u => (
                                                <PhoneRow
                                                    key={u._id}
                                                    id={u._id}
                                                    type="user"
                                                    name={u.email}
                                                    badge={u.role}
                                                    phone={u.telefono}
                                                    editing={phoneEditing?.id === u._id}
                                                    phoneValue={phoneValue}
                                                    onEdit={() => { setPhoneEditing({ id: u._id, type: 'user' }); setPhoneValue(u.telefono || ''); }}
                                                    onCancel={() => setPhoneEditing(null)}
                                                    onSave={() => savePhone(u._id, 'user')}
                                                    onChange={setPhoneValue}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Providers */}
                                {systemUsers.providers.length > 0 && (
                                    <div className="px-6 py-4">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Proveedores (Duenos de lancha)</p>
                                        <div className="space-y-2">
                                            {systemUsers.providers.map(p => (
                                                <PhoneRow
                                                    key={p._id}
                                                    id={p._id}
                                                    type="provider"
                                                    name={`${p.nombre} ${p.apellido || ''} — ${p.email}`}
                                                    badge="PROVEEDOR"
                                                    phone={p.telefono}
                                                    editing={phoneEditing?.id === p._id}
                                                    phoneValue={phoneValue}
                                                    onEdit={() => { setPhoneEditing({ id: p._id, type: 'provider' }); setPhoneValue(p.telefono || ''); }}
                                                    onCancel={() => setPhoneEditing(null)}
                                                    onSave={() => savePhone(p._id, 'provider')}
                                                    onChange={setPhoneValue}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {systemUsers.users.length === 0 && systemUsers.providers.length === 0 && (
                                    <div className="px-6 py-8 text-center text-slate-400 text-sm">Cargando usuarios...</div>
                                )}
                            </div>

                        </motion.div>
                    )}

                    {/* ── FINANCIAL TAB ── */}
                    {tab === 'financial' && (
                        <motion.div key="financial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-heading font-black text-navy-dark">Resumen Financiero</h2>
                                    <p className="text-slate-500 text-sm mt-1">Dinero procesado por cada operador</p>
                                </div>
                                <button
                                    onClick={loadFinancialInfo}
                                    disabled={financialLoading}
                                    className="flex items-center gap-2 rounded-xl bg-navy-dark text-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-navy-dark/90 transition-all disabled:opacity-50"
                                >
                                    <RefreshCw size={14} className={financialLoading ? 'animate-spin' : ''} />
                                    Recargar
                                </button>
                            </div>

                            {/* Financial global summary */}
                            {financialData.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                    <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg">
                                        <div className="flex items-center gap-2 mb-3 opacity-80">
                                            <TrendingUp size={16} />
                                            <span className="text-xs font-bold uppercase tracking-widest">Ingresos Totales</span>
                                        </div>
                                        <p className="text-3xl font-heading font-black">{formatCOP(totalIngresos)}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                                        <div className="flex items-center gap-2 mb-3 opacity-80">
                                            <Activity size={16} />
                                            <span className="text-xs font-bold uppercase tracking-widest">Viajes Procesados</span>
                                        </div>
                                        <p className="text-3xl font-heading font-black">{totalViajes}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                                        <div className="flex items-center gap-2 mb-3 opacity-80">
                                            <Users size={16} />
                                            <span className="text-xs font-bold uppercase tracking-widest">Operadores Activos</span>
                                        </div>
                                        <p className="text-3xl font-heading font-black">{financialData.length}</p>
                                    </div>
                                </div>
                            )}

                            {/* Per-operator cards */}
                            {financialLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="w-8 h-8 border-4 border-navy-dark/20 border-t-navy-dark rounded-full animate-spin" />
                                </div>
                            ) : financialData.length === 0 ? (
                                <div className="text-center py-20">
                                    <DollarSign size={40} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-400 text-sm font-semibold">No hay registros financieros aún.</p>
                                    <p className="text-slate-400 text-xs mt-1">Los registros se crean cuando un operador completa un viaje.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {financialData.map((op, i) => {
                                        const isExpanded = expandedOperatorId === op.operadorId;
                                        return (
                                            <motion.div
                                                key={op.operadorId}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className={`rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 ${isExpanded ? 'bg-slate-50 border-slate-300 ring-1 ring-slate-200' : 'bg-white border-slate-200'}`}
                                            >
                                                {/* Operator header */}
                                                <button
                                                    onClick={() => setExpandedOperatorId(isExpanded ? null : op.operadorId)}
                                                    className={`w-full px-6 py-5 flex items-center gap-4 text-left transition-colors ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
                                                >
                                                    <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                                                        <Users size={20} className="text-violet-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-heading font-bold text-navy-dark truncate">{op.operadorEmail}</p>
                                                        <div className="flex items-center gap-4 mt-1 flex-wrap">
                                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                <Activity size={10} />
                                                                {op.totalViajes} {op.totalViajes === 1 ? 'viaje' : 'viajes'}
                                                            </span>
                                                            <span className="text-xs text-emerald-500 flex items-center gap-1">
                                                                <CheckSquare size={10} />
                                                                {op.viajesCompletados} completado{op.viajesCompletados !== 1 ? 's' : ''}
                                                            </span>
                                                            {op.viajesCancelados > 0 && (
                                                                <span className="text-xs text-red-400 flex items-center gap-1">
                                                                    <XSquare size={10} />
                                                                    {op.viajesCancelados} cancelado{op.viajesCancelados !== 1 ? 's' : ''}
                                                                </span>
                                                            )}
                                                            {op.ultimaActividad && (
                                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                    <Calendar size={10} />
                                                                    Último: {formatDate(op.ultimaActividad)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-lg font-heading font-black text-violet-700">{formatCOP(op.totalIngresos)}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total procesado</p>
                                                    </div>
                                                    <ChevronDown
                                                        size={18}
                                                        className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-navy-dark' : 'text-slate-300'}`}
                                                    />
                                                </button>

                                                {/* Expandable trip list */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                            className="overflow-hidden bg-white border-t border-slate-200"
                                                        >
                                                            <div className="px-6 pb-6 pt-4">
                                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                                                    Detalle de viajes ({op.registros.length})
                                                                </p>
                                                                <div className="space-y-2">
                                                                    {op.registros.map((r) => (
                                                                        <div
                                                                            key={r._id}
                                                                            className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-4 flex-wrap"
                                                                        >
                                                                            {/* Status badge */}
                                                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0 ${r.estadoRegistro === 'completada'
                                                                                ? 'bg-emerald-50 text-emerald-600'
                                                                                : 'bg-red-50 text-red-500'
                                                                                }`}>
                                                                                {r.estadoRegistro}
                                                                            </span>

                                                                            {/* Code */}
                                                                            <span className="text-xs text-slate-500 flex items-center gap-1 min-w-0">
                                                                                <Hash size={10} className="flex-shrink-0" />
                                                                                {r.codigoReserva}
                                                                            </span>

                                                                            {/* Client */}
                                                                            <span className="text-sm font-semibold text-navy-dark truncate flex-1 min-w-[120px]">
                                                                                {r.clienteNombre}
                                                                            </span>

                                                                            {/* Destination */}
                                                                            {r.destino && (
                                                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                                    <MapPin size={10} />
                                                                                    {r.destino}
                                                                                </span>
                                                                            )}

                                                                            {/* Date */}
                                                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                                <Calendar size={10} />
                                                                                {formatDate(r.fecha)}
                                                                            </span>

                                                                            {/* Passengers */}
                                                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                                <Users size={10} />
                                                                                {r.pasajeros} pax
                                                                            </span>

                                                                            {/* Duration */}
                                                                            {r.duracionHoras && (
                                                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                                    <Clock size={10} />
                                                                                    {r.duracionHoras}h
                                                                                </span>
                                                                            )}

                                                                            {/* Amount */}
                                                                            <span className={`text-sm font-black ml-auto flex-shrink-0 ${r.estadoRegistro === 'completada' ? 'text-emerald-600' : 'text-slate-400 line-through'}`}>
                                                                                {formatCOP(r.montoCobrado)}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* Totals row */}
                                                                <div className="mt-4 bg-violet-50 rounded-xl px-4 py-3 flex items-center justify-between border border-violet-100">
                                                                    <span className="text-xs font-bold text-violet-700 uppercase tracking-widest">Total cobrado por este operador</span>
                                                                    <span className="text-lg font-heading font-black text-violet-700">{formatCOP(op.totalIngresos)}</span>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

/* ─── PhoneRow ─── */
const PhoneRow = ({ name, badge, phone, editing, phoneValue, onEdit, onCancel, onSave, onChange }) => {
    const roleColor = {
        OPERATOR: 'bg-blue-50 text-blue-600',
        STAFF: 'bg-violet-50 text-violet-600',
        ADMIN: 'bg-slate-100 text-slate-600',
        PROVEEDOR: 'bg-emerald-50 text-emerald-600',
    };
    return (
        <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 flex-wrap">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0 ${roleColor[badge] || 'bg-slate-100 text-slate-500'}`}>
                {badge}
            </span>
            <span className="text-xs font-semibold text-slate-600 flex-1 min-w-0 truncate">{name}</span>
            {editing ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                    <input
                        autoFocus
                        type="tel"
                        value={phoneValue}
                        onChange={e => onChange(e.target.value)}
                        placeholder="+573001234567"
                        className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-300 w-40"
                        onKeyDown={e => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel(); }}
                    />
                    <button onClick={onSave} className="bg-emerald-500 text-white rounded-lg px-3 py-1.5 text-[10px] font-black uppercase hover:bg-emerald-600 transition-colors">
                        <Save size={12} />
                    </button>
                    <button onClick={onCancel} className="bg-slate-200 text-slate-600 rounded-lg px-3 py-1.5 text-[10px] font-black hover:bg-slate-300 transition-colors">
                        <X size={12} />
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold flex items-center gap-1 ${phone ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <Phone size={11} />
                        {phone || 'Sin telefono'}
                    </span>
                    <button onClick={onEdit} className="text-slate-400 hover:text-navy-dark transition-colors p-1 rounded-lg hover:bg-white">
                        <Edit2 size={13} />
                    </button>
                </div>
            )}
        </div>
    );
};

/* ─── Sub-components ─── */

const StatCard = ({ label, value, icon, color }) => {
    const colorMap = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        violet: 'bg-violet-50 text-violet-600 border-violet-100',
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-6 shadow-sm ${colorMap[color] || colorMap.blue}`}
        >
            <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center">
                    {icon}
                </div>
            </div>
            <p className="text-2xl font-heading font-black">{value}</p>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mt-1">{label}</p>
        </motion.div>
    );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${active
            ? 'bg-navy-dark text-white shadow-md'
            : 'bg-white text-slate-500 hover:text-navy-dark border border-slate-200'
            }`}
    >
        {icon} {label}
    </button>
);

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

