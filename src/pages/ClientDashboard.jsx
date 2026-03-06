import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    LogOut, Ship, MapPin, Users, Calendar, Clock, ChevronDown,
    Phone, Mail, Anchor, Hash, MessageCircle, CheckCircle,
    AlertCircle, Play, XCircle, Navigation,
    Waves, Compass, ArrowRight
} from 'lucide-react';

// Pexels free images by boat type (no API key needed for CDN)
const BOAT_IMAGES = {
    lancha:    'https://img.getmyboat.com/images/6cedd94e-0d6e-43a8-b12a-cea1b4999b7a/-processed.jpg?w=900&dpr=2',
    speedboat: 'https://images.pexels.com/photos/5579732/pexels-photo-5579732.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    yate:      'https://images.pexels.com/photos/6752179/pexels-photo-6752179.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    yacht:     'https://images.pexels.com/photos/163236/pexels-photo-163236.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    velero:    'https://images.pexels.com/photos/9881700/pexels-photo-9881700.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    pesca:     'https://images.pexels.com/photos/13633294/pexels-photo-13633294.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    catamaran: 'https://images.pexels.com/photos/843633/pexels-photo-843633.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    tour:      'https://images.pexels.com/photos/1576700/pexels-photo-1576700.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    default:   'https://images.pexels.com/photos/1555313/pexels-photo-1555313.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
};

// Hero background — aerial ocean shot
const HERO_IMAGE = 'https://images.pexels.com/photos/1295138/pexels-photo-1295138.jpeg?auto=compress&cs=tinysrgb&w=1600&h=600&fit=crop';

const getBoatImage = (tipo = '') => {
    // Normalize: lowercase + strip diacritics ("Catamarán" → "catamaran")
    const key = tipo.toLowerCase().trim()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    // Specific subtypes FIRST so "Lancha de Pesca" doesn't match "lancha" before "pesca"
    if (key.includes('pesca'))                                              return BOAT_IMAGES.pesca;
    if (key.includes('catamaran'))                                          return BOAT_IMAGES.catamaran;
    if (key.includes('yate') || key.includes('yacht'))                      return BOAT_IMAGES.yate;
    if (key.includes('velero'))                                             return BOAT_IMAGES.velero;
    if (key.includes('tour') || key.includes('paseo'))                      return BOAT_IMAGES.tour;
    if (key.includes('deportiva') || key.includes('rapida') || key.includes('speed')) return BOAT_IMAGES.speedboat;
    if (key.includes('lancha'))                                             return BOAT_IMAGES.lancha;
    return BOAT_IMAGES.default;
};

const estadoConfig = {
    pendiente:  { label: 'Pendiente',  color: 'amber',   icon: Clock },
    confirmada: { label: 'Confirmada', color: 'blue',    icon: CheckCircle },
    'en-curso': { label: 'En curso',   color: 'emerald', icon: Play },
    completada: { label: 'Completada', color: 'slate',   icon: CheckCircle },
    cancelada:  { label: 'Cancelada',  color: 'red',     icon: XCircle },
};

const colorClasses = {
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',  dot: 'bg-amber-400',  glow: 'shadow-amber-100' },
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',   dot: 'bg-blue-400',   glow: 'shadow-blue-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',dot: 'bg-emerald-400',glow: 'shadow-emerald-100' },
    slate:   { bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-200',  dot: 'bg-slate-400',  glow: 'shadow-slate-100' },
    red:     { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',    dot: 'bg-red-400',    glow: 'shadow-red-100' },
};

const SUPPORT_WHATSAPP = '+573001234567';

export const ClientDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('reservations');
    const [bookings, setBookings] = useState([]);
    const [availableBoats, setAvailableBoats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [selectedBoat, setSelectedBoat] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    const loadBookings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/client/bookings', { credentials: 'include' });
            const data = await res.json();
            if (data.success) setBookings(data.bookings || []);
        } catch (err) {
            console.error('[CLIENT] Error loading bookings:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadAvailableBoats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/client/available-boats', { credentials: 'include' });
            const data = await res.json();
            if (data.success) setAvailableBoats(data.boats || []);
        } catch (err) {
            console.error('[CLIENT] Error loading boats:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // MercadoPago Checkout Pro doesn't require any frontend script —
    // payment happens on MP's hosted page after we redirect the user.

    const handlePayment = async (booking) => {
        try {
            const res = await fetch('/api/payments/create-preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ bookingCode: booking.codigo }),
            });
            const data = await res.json();

            if (!data.success || !data.init_point) {
                throw new Error(data.detail || data.message || 'No se pudo iniciar el pago');
            }

            // Open MercadoPago Checkout Pro in a new tab
            // (sandbox_init_point is used automatically in TEST mode by MP)
            window.open(data.sandbox_init_point || data.init_point, '_blank');
        } catch (err) {
            console.error('[CLIENT] Error al iniciar pago:', err);
            alert('Error al conectar con la pasarela de pagos.');
        }
    };

    useEffect(() => {
        if (tab === 'reservations') loadBookings();
        else loadAvailableBoats();
    }, [tab, loadBookings, loadAvailableBoats]);

    // Real-time SSE: update booking state instantly when operator changes it
    useEffect(() => {
        const es = new EventSource('http://localhost:3002/api/events', { withCredentials: true });
        es.addEventListener('booking_event', (e) => {
            const payload = JSON.parse(e.data);
            if (payload.type === 'booking_status') {
                setBookings(prev =>
                    prev.map(b => b._id === payload.bookingId ? { ...b, estado: payload.estado } : b)
                );
            } else if (payload.type === 'new_booking') {
                loadBookings();
            }
        });
        es.onerror = () => { /* browser handles reconnect */ };
        return () => es.close();
    }, [loadBookings]);

    const handleLogout = async () => { await logout(); navigate('/'); };

    const formatDate = (d) => new Date(d).toLocaleDateString('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const openSupport = (booking) => {
        const msg = encodeURIComponent(
            `Hola! Necesito ayuda con mi reserva Boaty.\n\nCódigo: ${booking.codigo}\nFecha: ${formatDate(booking.fecha)}\nEmbarcación: ${booking.boatId?.nombre || 'N/A'}`
        );
        window.open(`https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, '')}?text=${msg}`, '_blank');
    };

    const active = bookings.filter(b => ['pendiente', 'confirmada', 'en-curso'].includes(b.estado));
    const past   = bookings.filter(b => ['completada', 'cancelada'].includes(b.estado));

    // Next upcoming booking (closest future date)
    const nextBooking = active
        .filter(b => new Date(b.fecha) >= new Date())
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0];

    const firstName = user?.nombre?.split(' ')[0] || user?.email?.split('@')[0] || 'Viajero';

    return (
        <div className="min-h-screen bg-[#f0f4f8]">
            {/* ── Sticky Nav ── */}
            <header className="bg-navy-dark/95 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
                <div className="container mx-auto max-w-6xl px-6 py-3.5 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-3 group">
                        {/* Logo mark */}
                        <div className="w-8 h-8 rounded-xl bg-orange flex items-center justify-center shadow-premium-orange">
                            <Anchor size={16} className="text-white" />
                        </div>
                        <span className="text-white font-heading font-extrabold text-lg tracking-widest">BOATY</span>
                    </a>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
                            {/* Avatar initials */}
                            <div className="w-6 h-6 rounded-full bg-orange flex items-center justify-center text-white text-[10px] font-black">
                                {firstName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white/70 text-xs font-semibold">{firstName}</span>
                        </div>
                        <button onClick={handleLogout}
                            className="flex items-center gap-2 text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                            <LogOut size={15} />
                            <span className="hidden sm:inline">Salir</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Hero Banner ── */}
            <div className="relative overflow-hidden bg-navy-dark">
                {/* Real ocean background photo */}
                <img
                    src={HERO_IMAGE}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-25"
                />
                {/* Dark gradient overlay so text stays readable */}
                <div className="absolute inset-0 bg-gradient-to-br from-navy-dark/95 via-navy-dark/80 to-[#1a4a7a]/70" />
                {/* Decorative circles */}
                <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-orange/5 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 left-10 w-72 h-72 rounded-full bg-blue-400/5 blur-3xl pointer-events-none" />
                {/* Wave divider */}
                <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden">
                    <svg viewBox="0 0 1200 48" preserveAspectRatio="none" className="w-full h-full">
                        <path d="M0,24 C200,48 400,0 600,24 C800,48 1000,0 1200,24 L1200,48 L0,48 Z"
                            fill="#f0f4f8" />
                    </svg>
                </div>

                <div className="container mx-auto max-w-6xl px-6 py-10 pb-16 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                            <p className="text-orange text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Waves size={12} />
                                Bienvenido de vuelta
                            </p>
                            <h1 className="text-3xl md:text-4xl font-heading font-black text-white leading-tight">
                                Hola, {firstName}
                            </h1>
                            <p className="text-white/40 mt-1.5 text-sm">
                                {bookings.length > 0
                                    ? `Tienes ${active.length} reserva${active.length !== 1 ? 's' : ''} activa${active.length !== 1 ? 's' : ''}.`
                                    : 'Comienza tu primera aventura náutica.'}
                            </p>
                        </motion.div>

                        {/* Next trip highlight card */}
                        {nextBooking && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.15 }}
                                className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4 min-w-0 md:max-w-sm w-full"
                            >
                                {/* Icon */}
                                <div className="w-12 h-12 rounded-2xl bg-orange flex items-center justify-center flex-shrink-0 shadow-premium-orange">
                                    <Ship size={22} className="text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-0.5">
                                        Proximo viaje
                                    </p>
                                    <p className="text-white font-bold text-sm truncate">
                                        {nextBooking.boatId?.nombre || 'Embarcación'}
                                    </p>
                                    <p className="text-white/50 text-xs mt-0.5 flex items-center gap-1">
                                        <Calendar size={10} />
                                        {formatDate(nextBooking.fecha)}
                                    </p>
                                </div>
                                {/* Status pill */}
                                <div className={`ml-auto flex-shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${colorClasses[estadoConfig[nextBooking.estado]?.color || 'amber'].bg} ${colorClasses[estadoConfig[nextBooking.estado]?.color || 'amber'].text}`}>
                                    {estadoConfig[nextBooking.estado]?.label}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Stat pills */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap gap-3 mt-7"
                    >
                        {[
                            { icon: <Ship size={13} />,        label: `${bookings.length} reservas totales` },
                            { icon: <Play size={13} />,         label: `${active.length} activas` },
                            { icon: <CheckCircle size={13} />,  label: `${past.filter(b=>b.estado==='completada').length} completadas` },
                        ].map(({ icon, label }) => (
                            <div key={label}
                                className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-full px-3.5 py-1.5 text-white/60 text-[11px] font-semibold">
                                {icon}
                                {label}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* ── Main content ── */}
            <main className="container mx-auto max-w-6xl px-6 pt-8 pb-16">

                {/* Tab bar */}
                <div className="flex items-center gap-2 mb-8">
                    <TabBtn active={tab === 'reservations'} onClick={() => setTab('reservations')} icon={<Anchor size={14} />} label="Mis Reservas" />
                    <TabBtn active={tab === 'explore'} onClick={() => setTab('explore')} icon={<Compass size={14} />} label="Explorar" accent />
                </div>

                <AnimatePresence mode="wait">
                    {tab === 'reservations' ? (
                        <motion.div key="res" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                            {loading ? <LoadingState /> : bookings.length === 0 ? (
                                <EmptyState
                                    message="Aun no tienes reservas"
                                    submessage="Explora nuestras lanchas y vive tu proxima aventura"
                                    cta="Explorar lanchas"
                                    onCta={() => setTab('explore')}
                                />
                            ) : (
                                <div className="space-y-10">
                                    {active.length > 0 && (
                                        <section>
                                            <SectionHeader icon={<Play size={14} />} label="Reservas activas" count={active.length} />
                                            <div className="space-y-3 mt-4">
                                                {active.map((b, i) => (
                                                    <BookingCard key={b._id} booking={b}
                                                        expanded={expanded === b._id}
                                                        onToggle={() => setExpanded(expanded === b._id ? null : b._id)}
                                                        onSupport={() => openSupport(b)}
                                                        onPay={() => handlePayment(b)}
                                                        formatDate={formatDate} delay={i * 0.05} />
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                    {past.length > 0 && (
                                        <section>
                                            <SectionHeader icon={<Clock size={14} />} label="Historial" count={past.length} muted />
                                            <div className="space-y-3 mt-4">
                                                {past.map((b, i) => (
                                                    <BookingCard key={b._id} booking={b}
                                                        expanded={expanded === b._id}
                                                        onToggle={() => setExpanded(expanded === b._id ? null : b._id)}
                                                        onSupport={() => openSupport(b)}
                                                        formatDate={formatDate} delay={i * 0.05} muted />
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="explore" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                            {loading ? <LoadingState /> : availableBoats.length === 0 ? (
                                <EmptyState message="No hay lanchas disponibles" submessage="Vuelve pronto para ver nuevas opciones." />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {availableBoats.map((boat, i) => (
                                        <BoatCard key={boat._id} boat={boat} delay={i * 0.06}
                                            onBook={() => { setSelectedBoat(boat); setShowBookingModal(true); }} />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <AnimatePresence>
                {showBookingModal && selectedBoat && (
                    <BookingModal
                        boat={selectedBoat}
                        onClose={() => { setShowBookingModal(false); setSelectedBoat(null); }}
                        onSuccess={() => { setShowBookingModal(false); setSelectedBoat(null); setTab('reservations'); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

/* ─── TabBtn ─── */
const TabBtn = ({ active, onClick, icon, label, accent }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-200
            ${active
                ? accent
                    ? 'bg-orange text-white shadow-premium-orange'
                    : 'bg-navy-dark text-white shadow-premium'
                : 'bg-white border border-slate-200 text-slate-400 hover:text-navy-dark hover:border-slate-300'
            }`}
    >
        {icon}
        {label}
    </button>
);

/* ─── SectionHeader ─── */
const SectionHeader = ({ icon, label, count, muted }) => (
    <div className={`flex items-center gap-2 ${muted ? 'text-slate-400' : 'text-navy-dark'}`}>
        <span className={`p-1.5 rounded-lg ${muted ? 'bg-slate-100' : 'bg-navy-dark/8'}`}>{icon}</span>
        <span className="text-xs font-black uppercase tracking-widest">{label}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${muted ? 'bg-slate-100 text-slate-400' : 'bg-navy-dark/8 text-navy-dark'}`}>
            {count}
        </span>
    </div>
);

/* ─── BookingCard ─── */
const BookingCard = ({ booking, expanded, onToggle, onSupport, onPay, formatDate, delay = 0, muted = false }) => {
    const est   = estadoConfig[booking.estado] || estadoConfig.pendiente;
    const EstIcon = est.icon;
    const c     = colorClasses[est.color];
    const provider = booking.providerId;
    const boat  = booking.boatId;

    // Color accent strip per status
    const accentMap = {
        amber: 'bg-amber-400', blue: 'bg-blue-500',
        emerald: 'bg-emerald-500', slate: 'bg-slate-300', red: 'bg-red-400'
    };

    return (
        <motion.div layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`rounded-2xl border overflow-hidden transition-all duration-300 bg-white
                ${expanded ? 'border-slate-300 shadow-premium' : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'}
                ${muted ? 'opacity-65 hover:opacity-100' : ''}`}
        >
            {/* Colored accent strip on the left */}
            <div className="flex">
                <div className={`w-1 flex-shrink-0 ${accentMap[est.color]}`} />

                <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-center">
                        <button onClick={onToggle} className="flex-1 px-5 py-4 flex items-center gap-4 text-left min-w-0 hover:bg-slate-50/60 transition-colors">
                            {/* Status icon badge */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${c.bg}`}>
                                <EstIcon size={16} className={c.text} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-heading font-bold text-navy-dark text-sm truncate">
                                        {boat?.nombre || 'Embarcacion'}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
                                        {est.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                        <Hash size={9} />{booking.codigo}
                                    </span>
                                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                        <Calendar size={9} />{formatDate(booking.fecha)}
                                    </span>
                                    {booking.pasajeros && (
                                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                            <Users size={9} />{booking.pasajeros} pers.
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>

                        {/* Inline pay button (pendiente only) */}
                        {!muted && booking.estado === 'pendiente' && !expanded && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onPay(); }}
                                className="mr-4 flex-shrink-0 bg-orange text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-dark transition-all shadow-sm active:scale-95"
                            >
                                Pagar
                            </button>
                        )}

                        <button onClick={onToggle} className="pr-5 py-5 flex-shrink-0 flex items-center">
                            <ChevronDown size={16}
                                className={`transition-transform duration-300 ${expanded ? 'rotate-180 text-navy-dark' : 'text-slate-300'}`} />
                        </button>
                    </div>

                    {/* Expanded detail */}
                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="overflow-hidden border-t border-slate-100"
                            >
                                <div className="px-5 pb-5 pt-4">
                                    {/* Pay banner */}
                                    {booking.estado === 'pendiente' && (
                                        <div className="bg-gradient-to-r from-amber-50 to-orange/5 border border-amber-100 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Total a pagar</p>
                                                <p className="text-2xl font-black text-navy-dark">
                                                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(booking.precioTotal || 0)}
                                                </p>
                                            </div>
                                            <button onClick={onPay}
                                                className="w-full sm:w-auto bg-orange text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-dark transition-all shadow-premium-orange active:scale-95">
                                                Pagar con MercadoPago
                                            </button>
                                        </div>
                                    )}

                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Detalle del viaje</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                                        {boat && <Detail icon={<Ship size={13} />}       label="Embarcacion" value={boat.nombre} />}
                                        {boat?.tipo && <Detail icon={<Anchor size={13} />} label="Tipo"       value={boat.tipo} />}
                                        {booking.destino && <Detail icon={<Navigation size={13} />} label="Destino" value={booking.destino} />}
                                        <Detail icon={<Users size={13} />}              label="Pasajeros"   value={booking.pasajeros} />
                                        {booking.duracionHoras && <Detail icon={<Clock size={13} />} label="Duracion" value={`${booking.duracionHoras}h`} />}
                                        {booking.tipoViaje && <Detail icon={<MapPin size={13} />} label="Tipo viaje" value={booking.tipoViaje} />}
                                    </div>

                                    {booking.notas && (
                                        <div className="bg-slate-50 rounded-xl p-3 mb-5 border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notas</p>
                                            <p className="text-sm text-slate-600">{booking.notas}</p>
                                        </div>
                                    )}

                                    {provider && (
                                        <div className="bg-navy-dark/3 rounded-xl border border-slate-200 p-4 mb-5">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Proveedor</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <Detail icon={<Users size={13} />} label="Nombre"
                                                    value={provider.empresa || `${provider.nombre} ${provider.apellido}`} />
                                                {provider.email && <Detail icon={<Mail size={13} />} label="Email" value={provider.email} />}
                                                {provider.telefono && <Detail icon={<Phone size={13} />} label="Telefono" value={provider.telefono} />}
                                            </div>
                                        </div>
                                    )}

                                    <button onClick={onSupport}
                                        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-3 text-sm font-bold uppercase tracking-widest transition-colors shadow-sm">
                                        <MessageCircle size={16} />
                                        Contactar soporte por WhatsApp
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

/* ─── BoatCard ─── */
const BoatCard = ({ boat, onBook, delay = 0 }) => {
    const [imgError, setImgError] = useState(false);
    const imgSrc = getBoatImage(boat.tipo);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden hover:shadow-premium hover:-translate-y-1 transition-all duration-300 group flex flex-col"
        >
            {/* Photo header */}
            <div className="relative h-44 overflow-hidden bg-navy-dark/10">
                {!imgError ? (
                    <img
                        src={imgSrc}
                        alt={boat.nombre}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    // Gradient fallback if image fails to load
                    <div className="w-full h-full bg-gradient-to-br from-navy-dark to-navy-light flex items-center justify-center">
                        <Ship size={36} className="text-white/30" />
                    </div>
                )}
                {/* Dark scrim so badges are always readable */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/60 via-transparent to-transparent" />
                {/* Available badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Disponible
                </div>
                {/* Capacity badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[9px] font-bold px-2.5 py-1 rounded-full">
                    <Users size={9} />
                    {boat.capacidad} pers.
                </div>
                {/* Boat name over image */}
                <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-white font-heading font-bold text-base leading-tight drop-shadow">{boat.nombre}</p>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-0.5">{boat.tipo}</p>
                </div>
            </div>

            {/* Card body */}
            <div className="p-4 flex flex-col flex-1">
                {/* Location row */}
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4">
                    <MapPin size={12} className="flex-shrink-0" />
                    <span className="truncate font-semibold">{boat.ubicacion || 'Cartagena'}</span>
                </div>

                <button
                    onClick={onBook}
                    className="w-full flex items-center justify-center gap-2 bg-navy-dark text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange transition-all duration-200 active:scale-[0.98] group/btn"
                >
                    Reservar ahora
                    <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
};

/* ─── BookingModal ─── */
const BookingModal = ({ boat, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        fecha: new Date().toISOString().split('T')[0],
        horaInicio: '09:00',
        pasajeros: 1,
        destino: boat.ubicacion || '',
        tipoViaje: 'paseo',
        notas: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/client/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, boatId: boat._id }),
            });
            const data = await res.json();
            if (data.success) onSuccess();
            else setError(data.message || 'Error al crear la reserva');
        } catch {
            setError('Error de conexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6 bg-navy-dark/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="bg-white w-full sm:max-w-lg sm:rounded-[28px] rounded-t-[28px] shadow-2xl overflow-hidden relative"
            >
                {/* Modal header with gradient */}
                <div className="bg-gradient-to-r from-navy-dark to-navy-light px-8 pt-8 pb-6 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-orange/10 blur-xl" />
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-orange text-[10px] font-bold uppercase tracking-widest mb-1">Nueva reserva</p>
                            <h2 className="text-xl font-heading font-black text-white">{boat.nombre}</h2>
                            <p className="text-white/40 text-sm">{boat.tipo} · hasta {boat.capacidad} personas</p>
                        </div>
                        {/* Close — min 44x44 touch target */}
                        <button
                            onClick={onClose}
                            aria-label="Cerrar"
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
                        >
                            <XCircle size={20} />
                        </button>
                    </div>
                </div>

                <div className="px-8 py-6">
                    {error && (
                        <div className="mb-5 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100">
                            <AlertCircle size={16} className="flex-shrink-0" />
                            <p className="text-sm font-semibold">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Fecha">
                                <input type="date" required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange/20 focus:border-orange/30 transition-all outline-none"
                                    value={formData.fecha}
                                    onChange={e => setFormData({ ...formData, fecha: e.target.value })} />
                            </FormField>
                            <FormField label="Hora inicio">
                                <input type="time" required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange/20 focus:border-orange/30 transition-all outline-none"
                                    value={formData.horaInicio}
                                    onChange={e => setFormData({ ...formData, horaInicio: e.target.value })} />
                            </FormField>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Pasajeros">
                                <input type="number" min="1" max={boat.capacidad} required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange/20 focus:border-orange/30 transition-all outline-none"
                                    value={formData.pasajeros}
                                    onChange={e => setFormData({ ...formData, pasajeros: e.target.value })} />
                            </FormField>
                            <FormField label="Tipo de viaje">
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange/20 focus:border-orange/30 transition-all outline-none appearance-none"
                                    value={formData.tipoViaje}
                                    onChange={e => setFormData({ ...formData, tipoViaje: e.target.value })}
                                >
                                    <option value="paseo">Paseo</option>
                                    <option value="pesca">Pesca</option>
                                    <option value="evento">Evento</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </FormField>
                        </div>
                        <FormField label="Destino sugerido">
                            <input type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange/20 focus:border-orange/30 transition-all outline-none"
                                placeholder="Ej: Islas del Rosario"
                                value={formData.destino}
                                onChange={e => setFormData({ ...formData, destino: e.target.value })} />
                        </FormField>
                        <FormField label="Notas adicionales">
                            <textarea
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange/20 focus:border-orange/30 transition-all outline-none resize-none h-20"
                                placeholder="Alguna peticion especial..."
                                value={formData.notas}
                                onChange={e => setFormData({ ...formData, notas: e.target.value })} />
                        </FormField>

                        <button type="submit" disabled={loading}
                            className="w-full bg-orange text-white py-3.5 rounded-2xl font-black tracking-widest uppercase text-xs shadow-premium-orange hover:bg-orange-dark transition-all active:scale-[0.98] disabled:opacity-50 mt-2 flex items-center justify-center gap-2">
                            {loading ? (
                                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Procesando...</>
                            ) : (
                                <>Confirmar reserva <ArrowRight size={14} /></>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

/* ─── Helpers ─── */
const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-24">
        <div className="w-12 h-12 border-4 border-navy-dark/10 border-t-orange rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-semibold">Cargando...</p>
    </div>
);

const EmptyState = ({ message, submessage, cta, onCta }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
        {/* Ocean illustration */}
        <div className="w-20 h-20 mx-auto mb-5 rounded-[28px] bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 flex items-center justify-center">
            <Ship size={36} className="text-blue-200" />
        </div>
        <p className="text-navy-dark font-heading font-bold text-lg">{message}</p>
        <p className="text-slate-400 text-sm mt-1.5 max-w-xs mx-auto">{submessage}</p>
        {cta && onCta && (
            <button onClick={onCta}
                className="mt-6 inline-flex items-center gap-2 bg-navy-dark text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange transition-all shadow-premium">
                <Compass size={13} /> {cta}
            </button>
        )}
    </motion.div>
);

const FormField = ({ label, children }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        {children}
    </div>
);

const Detail = ({ icon, label, value }) => (
    <div className="flex items-start gap-2">
        <span className="text-slate-400 mt-0.5 flex-shrink-0">{icon}</span>
        <div className="min-w-0">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-semibold text-slate-700 truncate">{value}</p>
        </div>
    </div>
);
