import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    LogOut, Ship, MapPin, Users, Calendar, Clock, ChevronDown,
    ChevronRight, Anchor, CheckCircle, AlertCircle, Play, Eye,
    Phone, Mail, Navigation, Filter, RefreshCw, Hash
} from 'lucide-react';

const API = 'http://localhost:3002/api/operator';

const estadoConfig = {
    pendiente:  { label: 'Pendiente',  color: 'amber',   icon: Clock },
    confirmada: { label: 'Confirmada', color: 'blue',    icon: CheckCircle },
    'en-curso': { label: 'En curso',   color: 'emerald', icon: Play },
    completada: { label: 'Completada', color: 'slate',   icon: CheckCircle },
    cancelada:  { label: 'Cancelada',  color: 'red',     icon: AlertCircle },
};

const boatEstadoConfig = {
    activa:        { label: 'Activa',        color: 'emerald' },
    mantenimiento: { label: 'Mantenimiento', color: 'amber' },
    inactiva:      { label: 'Inactiva',      color: 'slate' },
};

export const OperatorDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [tab, setTab] = useState('bookings'); // 'bookings' | 'boats'
    const [bookings, setBookings] = useState([]);
    const [boats, setBoats] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedBooking, setExpandedBooking] = useState(null);
    const [filterEstado, setFilterEstado] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const opts = { credentials: 'include' };
            const [bkRes, btRes, smRes] = await Promise.all([
                fetch(`${API}/bookings${filterEstado ? `?estado=${filterEstado}` : ''}`, opts),
                fetch(`${API}/boats`, opts),
                fetch(`${API}/summary`, opts),
            ]);
            const [bkData, btData, smData] = await Promise.all([bkRes.json(), btRes.json(), smRes.json()]);
            if (bkData.success) setBookings(bkData.bookings);
            if (btData.success) setBoats(btData.boats);
            if (smData.success) setSummary(smData.summary);
        } catch (err) {
            console.error('Error cargando datos:', err);
        } finally {
            setLoading(false);
        }
    }, [filterEstado]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleStatusChange = async (bookingId, newEstado) => {
        try {
            const res = await fetch(`${API}/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ estado: newEstado }),
            });
            const data = await res.json();
            if (data.success) {
                setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, estado: newEstado } : b));
                // Refresh summary
                const smRes = await fetch(`${API}/summary`, { credentials: 'include' });
                const smData = await smRes.json();
                if (smData.success) setSummary(smData.summary);
            }
        } catch (err) {
            console.error('Error actualizando estado:', err);
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-navy-dark border-b border-white/10 sticky top-0 z-50">
                <div className="container mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
                    <a href="/" className="group flex items-center gap-3">
                        <span className="text-white font-heading font-extrabold text-xl tracking-widest">BOATY</span>
                        <span className="text-white/30 text-xs font-semibold uppercase tracking-widest hidden sm:inline">Operador</span>
                    </a>
                    <div className="flex items-center gap-5">
                        <div className="text-right hidden sm:block">
                            <p className="text-white text-sm font-semibold">{user?.email}</p>
                            <p className="text-white/40 text-xs uppercase tracking-widest">Operador</p>
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
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-heading font-black text-navy-dark">
                        Panel del Operador ⚓
                    </h1>
                    <p className="text-slate-500 mt-2">Gestiona tus viajes y embarcaciones asignadas.</p>
                </motion.div>

                {/* Stats cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
                >
                    <StatCard label="Embarcaciones" value={summary?.totalBoats ?? '—'} icon={<Ship size={18} />} color="blue" />
                    <StatCard label="Viajes hoy" value={summary?.todayBookings ?? '—'} icon={<Calendar size={18} />} color="emerald" />
                    <StatCard label="Pendientes" value={summary?.pendingBookings ?? '—'} icon={<Clock size={18} />} color="amber" />
                    <StatCard label="Activos" value={summary?.activeBookings ?? '—'} icon={<Play size={18} />} color="blue" />
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center gap-2 mb-6"
                >
                    <TabButton active={tab === 'bookings'} onClick={() => setTab('bookings')} icon={<Calendar size={14} />} label="Viajes asignados" count={bookings.length} />
                    <TabButton active={tab === 'boats'} onClick={() => setTab('boats')} icon={<Ship size={14} />} label="Mis embarcaciones" count={boats.length} />
                    <div className="flex-1" />
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-navy-dark uppercase tracking-widest transition-colors"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Actualizar
                    </button>
                </motion.div>

                {/* Tab content */}
                <AnimatePresence mode="wait">
                    {tab === 'bookings' && (
                        <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Filter bar */}
                            <div className="flex items-center gap-3 mb-4">
                                <Filter size={14} className="text-slate-400" />
                                <select
                                    value={filterEstado}
                                    onChange={(e) => setFilterEstado(e.target.value)}
                                    className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-navy-dark/20"
                                >
                                    <option value="">Todos los estados</option>
                                    <option value="pendiente">Pendiente</option>
                                    <option value="confirmada">Confirmada</option>
                                    <option value="en-curso">En curso</option>
                                    <option value="completada">Completada</option>
                                    <option value="cancelada">Cancelada</option>
                                </select>
                            </div>

                            {loading ? (
                                <LoadingSpinner />
                            ) : bookings.length === 0 ? (
                                <EmptyState icon={<Calendar size={40} />} message="No tienes viajes asignados" />
                            ) : (
                                <div className="space-y-3">
                                    {bookings.map((booking) => (
                                        <BookingCard
                                            key={booking._id}
                                            booking={booking}
                                            expanded={expandedBooking === booking._id}
                                            onToggle={() => setExpandedBooking(expandedBooking === booking._id ? null : booking._id)}
                                            onStatusChange={handleStatusChange}
                                            formatDate={formatDate}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {tab === 'boats' && (
                        <motion.div key="boats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {loading ? (
                                <LoadingSpinner />
                            ) : boats.length === 0 ? (
                                <EmptyState icon={<Ship size={40} />} message="No tienes embarcaciones asignadas" />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {boats.map((boat) => (
                                        <BoatCard key={boat._id} boat={boat} />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

/* ───────── Sub-components ───────── */

const StatCard = ({ label, value, icon, color }) => {
    const colorMap = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
    };
    return (
        <div className={`rounded-2xl border p-5 ${colorMap[color] || colorMap.blue}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="opacity-60">{icon}</span>
            </div>
            <p className="text-2xl font-heading font-black">{value}</p>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mt-1">{label}</p>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label, count }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            active
                ? 'bg-navy-dark text-white shadow-md'
                : 'bg-white text-slate-500 hover:text-navy-dark border border-slate-200'
        }`}
    >
        {icon} {label}
        {typeof count === 'number' && (
            <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
                {count}
            </span>
        )}
    </button>
);

const BookingCard = ({ booking, expanded, onToggle, onStatusChange, formatDate }) => {
    const estado = estadoConfig[booking.estado] || estadoConfig.pendiente;
    const EstadoIcon = estado.icon;

    const colorClasses = {
        amber:   { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
        blue:    { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
        slate:   { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
        red:     { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
    };
    const c = colorClasses[estado.color] || colorClasses.amber;

    return (
        <motion.div layout className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header row */}
            <button onClick={onToggle} className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-slate-50/50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                    <EstadoIcon size={18} className={c.text} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-bold text-navy-dark">{booking.clienteNombre}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                            {estado.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Hash size={10} />{booking.codigo}</span>
                        <span className="flex items-center gap-1"><Calendar size={10} />{formatDate(booking.fecha)}</span>
                        <span className="flex items-center gap-1"><Clock size={10} />{booking.horaInicio}{booking.horaFin ? ` - ${booking.horaFin}` : ''}</span>
                        {booking.boatId && (
                            <span className="flex items-center gap-1"><Ship size={10} />{booking.boatId.nombre}</span>
                        )}
                    </div>
                </div>
                <ChevronDown size={18} className={`text-slate-300 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>

            {/* Expanded details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-5 border-t border-slate-100 pt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                                <DetailField icon={<Users size={13} />} label="Pasajeros" value={booking.pasajeros} />
                                <DetailField icon={<Navigation size={13} />} label="Destino" value={booking.destino || '—'} />
                                <DetailField icon={<Anchor size={13} />} label="Tipo de viaje" value={booking.tipoViaje} />
                                <DetailField icon={<Mail size={13} />} label="Email cliente" value={booking.clienteEmail || '—'} />
                                <DetailField icon={<Phone size={13} />} label="Teléfono cliente" value={booking.clienteTelefono || '—'} />
                                {booking.duracionHoras && (
                                    <DetailField icon={<Clock size={13} />} label="Duración" value={`${booking.duracionHoras}h`} />
                                )}
                                {booking.precioTotal > 0 && (
                                    <DetailField icon={<Hash size={13} />} label="Precio total" value={`$${booking.precioTotal.toLocaleString()}`} />
                                )}
                                {booking.boatId?.tipo && (
                                    <DetailField icon={<Ship size={13} />} label="Tipo embarcación" value={booking.boatId.tipo} />
                                )}
                                {booking.boatId?.capacidad && (
                                    <DetailField icon={<Users size={13} />} label="Capacidad embarcación" value={`${booking.boatId.capacidad} personas`} />
                                )}
                            </div>

                            {booking.notas && (
                                <div className="bg-slate-50 rounded-xl p-4 mb-5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notas</p>
                                    <p className="text-sm text-slate-700">{booking.notas}</p>
                                </div>
                            )}

                            {/* Status actions */}
                            {booking.estado !== 'completada' && booking.estado !== 'cancelada' && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">Cambiar estado:</span>
                                    {booking.estado === 'pendiente' && (
                                        <StatusButton label="Confirmar" color="blue" onClick={() => onStatusChange(booking._id, 'confirmada')} />
                                    )}
                                    {(booking.estado === 'pendiente' || booking.estado === 'confirmada') && (
                                        <StatusButton label="Iniciar viaje" color="emerald" onClick={() => onStatusChange(booking._id, 'en-curso')} />
                                    )}
                                    {booking.estado === 'en-curso' && (
                                        <StatusButton label="Completar" color="slate" onClick={() => onStatusChange(booking._id, 'completada')} />
                                    )}
                                    <StatusButton label="Cancelar" color="red" onClick={() => onStatusChange(booking._id, 'cancelada')} />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const BoatCard = ({ boat }) => {
    const estado = boatEstadoConfig[boat.estado] || boatEstadoConfig.activa;
    const colorMap = {
        emerald: 'bg-emerald-50 text-emerald-700',
        amber:   'bg-amber-50 text-amber-700',
        slate:   'bg-slate-100 text-slate-600',
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Ship size={22} className="text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-heading font-bold text-navy-dark">{boat.nombre}</h3>
                        <p className="text-xs text-slate-400">{boat.tipo}</p>
                    </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${colorMap[estado.color]}`}>
                    {estado.label}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <DetailField icon={<Users size={13} />} label="Capacidad" value={`${boat.capacidad} personas`} />
                <DetailField icon={<MapPin size={13} />} label="Ubicación" value={boat.ubicacion || '—'} />
                {boat.matricula && <DetailField icon={<Hash size={13} />} label="Matrícula" value={boat.matricula} />}
                {boat.providerId && (
                    <DetailField icon={<Anchor size={13} />} label="Proveedor" value={boat.providerId.empresa || `${boat.providerId.nombre} ${boat.providerId.apellido}`} />
                )}
            </div>
            {boat.descripcion && (
                <div className="mt-4 bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500">{boat.descripcion}</p>
                </div>
            )}
        </motion.div>
    );
};

const DetailField = ({ icon, label, value }) => (
    <div className="flex items-start gap-2">
        <span className="text-slate-400 mt-0.5">{icon}</span>
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-semibold text-slate-700">{value}</p>
        </div>
    </div>
);

const StatusButton = ({ label, color, onClick }) => {
    const colorMap = {
        blue:    'bg-blue-500 hover:bg-blue-600 text-white',
        emerald: 'bg-emerald-500 hover:bg-emerald-600 text-white',
        slate:   'bg-slate-500 hover:bg-slate-600 text-white',
        red:     'bg-red-500 hover:bg-red-600 text-white',
    };
    return (
        <button
            onClick={onClick}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${colorMap[color] || colorMap.blue}`}
        >
            {label}
        </button>
    );
};

const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-navy-dark/20 border-t-navy-dark rounded-full animate-spin" />
    </div>
);

const EmptyState = ({ icon, message }) => (
    <div className="flex flex-col items-center justify-center py-20 text-slate-300">
        {icon}
        <p className="mt-4 text-sm font-semibold">{message}</p>
    </div>
);
