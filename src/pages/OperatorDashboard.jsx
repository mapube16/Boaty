import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    LogOut, Ship, MapPin, Users, Calendar, Clock, ChevronDown,
    ChevronRight, ChevronLeft, Anchor, CheckCircle, AlertCircle, Play, Eye,
    Phone, Mail, Navigation, Filter, RefreshCw, Hash
} from 'lucide-react';

const API = 'http://localhost:3002/api/operator';

const estadoConfig = {
    pendiente: { label: 'Pendiente', color: 'amber', icon: Clock },
    confirmada: { label: 'Confirmada', color: 'blue', icon: CheckCircle },
    'en-curso': { label: 'En curso', color: 'emerald', icon: Play },
    completada: { label: 'Completada', color: 'slate', icon: CheckCircle },
    cancelada: { label: 'Cancelada', color: 'red', icon: AlertCircle },
};

const boatEstadoConfig = {
    activa: { label: 'Activa', color: 'emerald' },
    mantenimiento: { label: 'Mantenimiento', color: 'amber' },
    inactiva: { label: 'Inactiva', color: 'slate' },
};

const colorClasses = {
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' },
    slate: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
    red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-400' },
};

export const OperatorDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [tab, setTab] = useState('calendar'); // 'calendar' | 'today' | 'pending'
    const [bookings, setBookings] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedBooking, setExpandedBooking] = useState(null);
    const [calSelectedDay, setCalSelectedDay] = useState(null);
    const [calMonth, setCalMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const opts = { credentials: 'include' };
            const [bkRes, smRes] = await Promise.all([
                fetch(`${API}/bookings`, opts),
                fetch(`${API}/summary`, opts),
            ]);
            const [bkData, smData] = await Promise.all([bkRes.json(), smRes.json()]);
            if (bkData.success) setBookings(bkData.bookings);
            if (smData.success) setSummary(smData.summary);
        } catch (err) {
            console.error('Error cargando datos:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Real-time SSE: refresh data when a booking event arrives
    useEffect(() => {
        const es = new EventSource('http://localhost:3002/api/events', { withCredentials: true });
        es.addEventListener('booking_event', () => { fetchData(); });
        es.onerror = () => { /* reconnect handled by browser */ };
        return () => es.close();
    }, [fetchData]);

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

    const isToday = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        return d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear();
    };

    const isFuture = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return d > now;
    };

    const todayBookings = bookings.filter(b => isToday(b.fecha));
    const pendingBookings = bookings.filter(b => isFuture(b.fecha) && !isToday(b.fecha));

    const getTimingStatus = (booking) => {
        if (booking.estado === 'completada') return { label: 'Finalizado', color: 'slate' };
        if (booking.estado === 'cancelada') return { label: 'Cancelado', color: 'red' };
        if (booking.estado === 'en-curso') return { label: 'En curso', color: 'emerald' };

        const [hours, minutes] = booking.horaInicio.split(':').map(Number);
        const bookingTime = new Date(booking.fecha);
        bookingTime.setHours(hours, minutes, 0, 0);

        const now = new Date();
        const diffMinutes = (bookingTime - now) / 60000;

        if (diffMinutes > 0 && diffMinutes <= 60) return { label: 'Inicia pronto', color: 'amber' };
        if (diffMinutes < 0) return { label: 'Atrasado/Inicia ya', color: 'red' };

        return { label: 'Programado', color: 'blue' };
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
                    <StatCard label="Total Viajes" value={summary?.totalBookings ?? '—'} icon={<Hash size={18} />} color="blue" />
                    <StatCard label="Viajes hoy" value={todayBookings.length} icon={<Calendar size={18} />} color="emerald" />
                    <StatCard label="Futuros" value={pendingBookings.length} icon={<Clock size={18} />} color="amber" />
                    <StatCard label="En curso" value={summary?.activeBookings ?? '—'} icon={<Play size={18} />} color="blue" />
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center gap-2 mb-6"
                >
                    <TabButton active={tab === 'calendar'} onClick={() => setTab('calendar')} icon={<Calendar size={14} />} label="Calendario" />
                    <TabButton active={tab === 'today'} onClick={() => setTab('today')} icon={<Play size={14} />} label="Viajes Hoy" count={todayBookings.length} />
                    <TabButton active={tab === 'pending'} onClick={() => setTab('pending')} icon={<Clock size={14} />} label="Pendientes" count={pendingBookings.length} />
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
                    {tab === 'today' && (
                        <motion.div key="today" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {loading ? (
                                <LoadingSpinner />
                            ) : todayBookings.length === 0 ? (
                                <EmptyState icon={<Calendar size={40} />} message="No tienes viajes para hoy" />
                            ) : (
                                <div className="space-y-3">
                                    {todayBookings.map((booking) => (
                                        <BookingCard
                                            key={booking._id}
                                            booking={booking}
                                            expanded={expandedBooking === booking._id}
                                            onToggle={() => setExpandedBooking(expandedBooking === booking._id ? null : booking._id)}
                                            onStatusChange={handleStatusChange}
                                            formatDate={formatDate}
                                            timingStatus={getTimingStatus(booking)}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {tab === 'pending' && (
                        <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {loading ? (
                                <LoadingSpinner />
                            ) : pendingBookings.length === 0 ? (
                                <EmptyState icon={<Clock size={40} />} message="No hay viajes pendientes a futuro" />
                            ) : (
                                <div className="space-y-3">
                                    {pendingBookings.map((booking) => (
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

                    {tab === 'calendar' && (
                        <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <BookingCalendar
                                bookings={bookings}
                                calMonth={calMonth}
                                setCalMonth={setCalMonth}
                                calSelectedDay={calSelectedDay}
                                setCalSelectedDay={setCalSelectedDay}
                                onStatusChange={handleStatusChange}
                                formatDate={formatDate}
                            />
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
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${active
            ? 'bg-orange text-white shadow-premium-orange'
            : 'bg-white text-slate-500 hover:text-navy-dark border border-slate-200'
            }`}
    >
        {icon} {label}
        {typeof count === 'number' && (
            <span className={`ml-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-white text-orange' : 'bg-slate-100 text-slate-500'
                }`}>
                {count}
            </span>
        )}
    </button>
);

const BookingCard = ({ booking, expanded, onToggle, onStatusChange, formatDate, timingStatus }) => {
    const estado = estadoConfig[booking.estado] || estadoConfig.pendiente;
    const EstadoIcon = estado.icon;

    const colorClasses = {
        amber: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', border: 'border-amber-100' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400', border: 'border-blue-100' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', border: 'border-emerald-100' },
        slate: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', border: 'border-slate-200' },
        red: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400', border: 'border-red-100' },
    };
    const c = colorClasses[estado.color] || colorClasses.amber;
    const tc = timingStatus ? colorClasses[timingStatus.color] : null;

    return (
        <motion.div layout className={`rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 ${expanded ? 'bg-slate-50 border-slate-300 ring-1 ring-slate-200' : 'bg-white border-slate-200'
            }`}>
            {/* Header row */}
            <button onClick={onToggle} className={`w-full px-6 py-4 flex items-center gap-4 text-left transition-colors ${expanded ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${expanded ? 'bg-white shadow-sm ring-1 ring-slate-200' : c.bg
                    }`}>
                    <EstadoIcon size={18} className={expanded ? 'text-navy-dark' : c.text} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-bold text-navy-dark">{booking.clienteNombre}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                            {estado.label}
                        </span>
                        {timingStatus && (
                            <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${tc.bg} ${tc.text} border ${tc.border}`}>
                                {timingStatus.label}
                            </span>
                        )}
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
                <ChevronDown size={18} className={`transition-transform duration-300 ${expanded ? 'rotate-180 text-navy-dark' : 'text-slate-300'}`} />
            </button>

            {/* Expanded details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-white rounded-b-2xl border-t border-slate-200"
                    >
                        <div className="px-6 pb-5 pt-4">
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
                                <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-100/50">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notas</p>
                                    <p className="text-sm text-slate-700">{booking.notas}</p>
                                </div>
                            )}

                            {/* Status actions */}
                            {booking.estado !== 'completada' && booking.estado !== 'cancelada' && (
                                <div className="flex items-center gap-2 flex-wrap bg-slate-50/50 rounded-xl p-3 border border-slate-100 mt-2">
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
        amber: 'bg-amber-50 text-amber-700',
        slate: 'bg-slate-100 text-slate-600',
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
        blue: 'bg-blue-500 hover:bg-blue-600 text-white',
        emerald: 'bg-emerald-500 hover:bg-emerald-600 text-white',
        slate: 'bg-slate-500 hover:bg-slate-600 text-white',
        red: 'bg-red-500 hover:bg-red-600 text-white',
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

/* ─── Calendar Component ─── */
const BookingCalendar = ({ bookings, calMonth, setCalMonth, calSelectedDay, setCalSelectedDay, onStatusChange, formatDate }) => {
    const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    // Get days for the current month view
    const firstDayOfMonth = new Date(calMonth.year, calMonth.month, 1);
    const lastDayOfMonth = new Date(calMonth.year, calMonth.month + 1, 0);

    // Adjust for Monday start (JS 0 is Sunday, so transform to 0=Mon, 6=Sun)
    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay === -1) startDay = 6;

    const days = [];
    // Prefix empty days
    for (let i = 0; i < startDay; i++) {
        days.push({ day: null, date: null });
    }
    // Month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const dateStr = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        days.push({ day: i, date: dateStr });
    }

    const nextMonth = () => {
        if (calMonth.month === 11) setCalMonth({ year: calMonth.year + 1, month: 0 });
        else setCalMonth({ ...calMonth, month: calMonth.month + 1 });
    };

    const prevMonth = () => {
        if (calMonth.month === 0) setCalMonth({ year: calMonth.year - 1, month: 11 });
        else setCalMonth({ ...calMonth, month: calMonth.month - 1 });
    };

    const monthName = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(firstDayOfMonth);

    const getBookingsForDate = (dateStr) => {
        if (!dateStr) return [];
        return bookings.filter(b => b.fecha.split('T')[0] === dateStr);
    };

    const selectedDayBookings = calSelectedDay ? getBookingsForDate(calSelectedDay) : [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="font-heading font-bold text-navy-dark capitalize">{monthName}</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={prevMonth} className="p-2 hover:bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-navy-dark transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-navy-dark transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-7 mb-2">
                        {daysOfWeek.map(d => (
                            <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">
                                {d}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((d, i) => {
                            const dateBookings = d.date ? getBookingsForDate(d.date) : [];
                            const isToday = d.date === new Date().toISOString().split('T')[0];
                            const isSelected = d.date === calSelectedDay;

                            return (
                                <button
                                    key={i}
                                    disabled={!d.day}
                                    onClick={() => setCalSelectedDay(d.date)}
                                    className={`
                                        aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all border
                                        ${!d.day ? 'bg-transparent border-transparent' : 'hover:border-navy-dark/20'}
                                        ${isSelected ? 'bg-navy-dark text-white border-navy-dark shadow-md' : 'bg-white border-slate-100'}
                                        ${isToday && !isSelected ? 'ring-2 ring-orange-400 ring-offset-2' : ''}
                                    `}
                                >
                                    {d.day && (
                                        <>
                                            <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>{d.day}</span>
                                            {dateBookings.length > 0 && (
                                                <div className="flex gap-0.5 mt-1">
                                                    {dateBookings.slice(0, 3).map((b, idx) => (
                                                        <div key={idx} className={`w-1.5 h-1.5 rounded-full ${b.estado === 'pendiente' ? 'bg-amber-400' :
                                                            b.estado === 'confirmada' ? 'bg-blue-400' :
                                                                b.estado === 'en-curso' ? 'bg-emerald-400' :
                                                                    'bg-slate-400'
                                                            }`} />
                                                    ))}
                                                    {dateBookings.length > 3 && <div className="w-1 h-1 rounded-full bg-slate-300" />}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-heading font-bold text-navy-dark">
                            {calSelectedDay ? 'Viajes el ' + new Date(calSelectedDay + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long' }) : 'Selecciona un día'}
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {!calSelectedDay ? (
                            <div className="text-center py-10">
                                <Calendar size={40} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 text-sm">Toca un día para ver los detalles de los viajes programados.</p>
                            </div>
                        ) : selectedDayBookings.length === 0 ? (
                            <div className="text-center py-10">
                                <Clock size={40} className="mx-auto text-slate-100 mb-4" />
                                <p className="text-slate-400 text-sm">No hay viajes registrados para este día.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedDayBookings.map(b => (
                                    <BookingItemMini
                                        key={b._id}
                                        booking={b}
                                        onStatusChange={onStatusChange}
                                        formatDate={formatDate}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const BookingItemMini = ({ booking, onStatusChange, formatDate }) => {
    const estado = estadoConfig[booking.estado] || estadoConfig.pendiente;
    const c = colorClasses[estado.color];
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-4 bg-white text-left flex items-start gap-3"
            >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                    <estado.icon size={14} className={c.text} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-navy-dark truncate">{booking.clienteNombre}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{booking.horaInicio} - {booking.codigo}</p>
                </div>
                <ChevronDown size={14} className={`mt-1 text-slate-300 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden bg-slate-50/50 border-t border-slate-100"
                    >
                        <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <DetailField icon={<Ship size={11} />} label="Boat" value={booking.boatId?.nombre || '—'} />
                                <DetailField icon={<Users size={11} />} label="Pax" value={booking.pasajeros} />
                                <DetailField icon={<Navigation size={11} />} label="Destino" value={booking.destino || '—'} />
                                <DetailField icon={<Clock size={11} />} label="Horas" value={booking.duracionHoras || '—'} />
                            </div>

                            {booking.estado !== 'completada' && booking.estado !== 'cancelada' && (
                                <div className="flex flex-wrap gap-1.5 pt-2">
                                    {booking.estado === 'pendiente' && (
                                        <StatusButton label="Confirmar" color="blue" onClick={() => onStatusChange(booking._id, 'confirmada')} />
                                    )}
                                    {(booking.estado === 'pendiente' || booking.estado === 'confirmada') && (
                                        <StatusButton label="Iniciar" color="emerald" onClick={() => onStatusChange(booking._id, 'en-curso')} />
                                    )}
                                    {booking.estado === 'en-curso' && (
                                        <StatusButton label="Cerrar" color="slate" onClick={() => onStatusChange(booking._id, 'completada')} />
                                    )}
                                    <StatusButton label="Anular" color="red" onClick={() => onStatusChange(booking._id, 'cancelada')} />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
