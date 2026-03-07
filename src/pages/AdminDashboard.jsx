import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    LogOut, RefreshCw, CheckCircle, Clock, Users, Ship, ChevronDown,
    Mail, Phone, Building, MapPin, Anchor, Calendar, DollarSign,
    TrendingUp, BarChart2, CheckSquare, XSquare, Hash, Activity,
    Edit2, Save, X, Trash2, Eye, LayoutDashboard, FileText, Search,
    AlertCircle, ChevronRight, Shield, UserCheck, Sailboat, Menu
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD — Unified management panel
// ═══════════════════════════════════════════════════════════════════════════════

export const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [section, setSection] = useState('overview');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Shared state
    const [actionMsg, setActionMsg] = useState('');
    const [error, setError] = useState('');

    const showMsg = (msg, isError = false) => {
        if (isError) setError(msg); else setActionMsg(msg);
        setTimeout(() => { setError(''); setActionMsg(''); }, 4000);
    };

    const handleLogout = async () => { await logout(); navigate('/'); };

    const sections = [
        { id: 'overview', label: 'Vista General', icon: <LayoutDashboard size={18} /> },
        { id: 'providers', label: 'Proveedores', icon: <Building size={18} /> },
        { id: 'boats', label: 'Embarcaciones', icon: <Ship size={18} /> },
        { id: 'bookings', label: 'Reservas', icon: <FileText size={18} /> },
        { id: 'users', label: 'Usuarios', icon: <Users size={18} /> },
        { id: 'financial', label: 'Finanzas', icon: <DollarSign size={18} /> },
    ];

    // SSE for real-time events
    useEffect(() => {
        const es = new EventSource('/api/events', { withCredentials: true });
        es.addEventListener('booking_event', (e) => {
            const payload = JSON.parse(e.data);
            if (payload.type === 'new_booking') {
                showMsg(`Nueva reserva: ${payload.booking?.codigo} — ${payload.booking?.clienteNombre}`);
            } else if (payload.type === 'booking_status') {
                showMsg(`Reserva ${payload.codigo} → ${payload.estado.toUpperCase()}`);
            }
        });
        es.onerror = () => { };
        return () => es.close();
    }, []);

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* ── Mobile overlay ── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside className={`bg-navy-dark text-white flex flex-col transition-all duration-300
                fixed inset-y-0 left-0 z-50
                ${sidebarCollapsed ? 'w-[68px]' : 'w-60'}
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-4 flex items-center gap-3 border-b border-white/10">
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0">
                        <Sailboat size={20} />
                    </button>
                    {!sidebarCollapsed && (
                        <div className="min-w-0">
                            <p className="font-heading font-extrabold text-sm tracking-widest">BOATY</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Admin</p>
                        </div>
                    )}
                </div>

                <nav className="flex-1 py-4 space-y-1 px-2">
                    {sections.map(s => (
                        <button
                            key={s.id}
                            onClick={() => { setSection(s.id); setMobileOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm font-medium ${section === s.id
                                ? 'bg-white/15 text-white'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                                }`}
                            title={sidebarCollapsed ? s.label : undefined}
                        >
                            <span className="flex-shrink-0">{s.icon}</span>
                            {!sidebarCollapsed && <span>{s.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    {!sidebarCollapsed && (
                        <div className="mb-3">
                            <p className="text-xs text-white/60 truncate">{user?.email}</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest">{user?.role}</p>
                        </div>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors py-2" title="Cerrar sesión">
                        <LogOut size={16} />
                        {!sidebarCollapsed && <span>Salir</span>}
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-60'}`}>
                {/* Mobile top bar */}
                <div className="lg:hidden bg-navy-dark px-4 py-3 flex items-center gap-3 sticky top-0 z-30 border-b border-white/10">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                    >
                        <Menu size={18} />
                    </button>
                    <span className="text-white font-heading font-extrabold text-sm tracking-widest">BOATY Admin</span>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    {/* Alerts */}
                    <AnimatePresence>
                        {actionMsg && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-5 py-3 text-sm font-semibold mb-6 flex items-center gap-2">
                                <CheckCircle size={16} /> {actionMsg}
                            </motion.div>
                        )}
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-3 text-sm font-semibold mb-6 flex items-center gap-2">
                                <AlertCircle size={16} /> {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Section Router */}
                    {section === 'overview' && <OverviewSection showMsg={showMsg} />}
                    {section === 'providers' && <ProvidersSection showMsg={showMsg} />}
                    {section === 'boats' && <BoatsSection showMsg={showMsg} />}
                    {section === 'bookings' && <BookingsSection showMsg={showMsg} />}
                    {section === 'users' && <UsersSection showMsg={showMsg} />}
                    {section === 'financial' && <FinancialSection showMsg={showMsg} />}
                </div>
            </main>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
const formatCOP = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const formatDateTime = (d) => d ? new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const SectionHeader = ({ title, subtitle, onRefresh, loading, children }) => (
    <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
            <h1 className="text-2xl font-heading font-black text-navy-dark">{title}</h1>
            {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
            {children}
            {onRefresh && (
                <button onClick={onRefresh} disabled={loading}
                    className="flex items-center gap-2 rounded-xl bg-navy-dark text-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-navy-dark/90 transition-all disabled:opacity-50">
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Recargar
                </button>
            )}
        </div>
    </div>
);

const KpiCard = ({ label, value, icon, color = 'blue', sub }) => {
    const colors = {
        blue: 'from-blue-500 to-blue-600',
        emerald: 'from-emerald-500 to-emerald-600',
        amber: 'from-amber-500 to-amber-600',
        violet: 'from-violet-500 to-violet-600',
        rose: 'from-rose-500 to-rose-600',
        slate: 'from-slate-500 to-slate-600',
    };
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-5 text-white shadow-lg`}>
            <div className="flex items-center gap-2 mb-2 opacity-80">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-2xl font-heading font-black">{value}</p>
            {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
        </motion.div>
    );
};

const Badge = ({ text, color = 'slate' }) => {
    const map = {
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        blue: 'bg-blue-50 text-blue-600',
        red: 'bg-red-50 text-red-500',
        violet: 'bg-violet-50 text-violet-600',
        slate: 'bg-slate-100 text-slate-500',
        rose: 'bg-rose-50 text-rose-600',
    };
    return <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${map[color] || map.slate}`}>{text}</span>;
};

const statusColor = (estado) => {
    const map = {
        pendiente: 'amber', revisado: 'blue', activo: 'emerald', rechazado: 'red',
        confirmada: 'blue', 'en-curso': 'violet', completada: 'emerald', cancelada: 'red',
        activa: 'emerald', mantenimiento: 'amber', inactiva: 'slate',
        active: 'emerald', pending: 'amber', suspended: 'red',
    };
    return map[estado] || 'slate';
};

const EmptyState = ({ icon, text, sub }) => (
    <div className="text-center py-16">
        <div className="mx-auto text-slate-300 mb-4">{icon}</div>
        <p className="text-slate-400 text-sm font-semibold">{text}</p>
        {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
    </div>
);

const SearchBar = ({ value, onChange, placeholder }) => (
    <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || 'Buscar...'}
            className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 w-full sm:w-64" />
    </div>
);

const TableCard = ({ children }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">{children}</div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW SECTION
// ═══════════════════════════════════════════════════════════════════════════════
const OverviewSection = ({ showMsg }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/overview', { credentials: 'include' });
            const json = await res.json();
            if (json.success) setData(json.data);
            else showMsg(json.message || 'Error cargando resumen.', true);
        } catch { showMsg('Error de conexión.', true); }
        finally { setLoading(false); }
    }, [showMsg]);

    useEffect(() => { load(); }, [load]);

    if (!data) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-navy-dark/20 border-t-navy-dark rounded-full animate-spin" /></div>;

    return (
        <>
            <SectionHeader title="Vista General" subtitle="Resumen del estado actual de la plataforma" onRefresh={load} loading={loading} />
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                <KpiCard label="Proveedores" value={data.providers.total} icon={<Building size={14} />} color="blue" sub={`${data.providers.pending} pendientes`} />
                <KpiCard label="Embarcaciones" value={data.boats.total} icon={<Ship size={14} />} color="emerald" sub={`${data.boats.active} activas`} />
                <KpiCard label="Reservas" value={data.bookings.total} icon={<FileText size={14} />} color="amber" sub={`${data.bookings.pending} pendientes`} />
                <KpiCard label="Completadas" value={data.bookings.completed} icon={<CheckSquare size={14} />} color="violet" />
                <KpiCard label="Usuarios" value={data.users.total} icon={<Users size={14} />} color="slate" />
                <KpiCard label="Ingresos" value={formatCOP(data.revenue.total)} icon={<DollarSign size={14} />} color="rose" sub={`${data.revenue.trips} viajes`} />
            </div>
        </>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDERS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
const ProvidersSection = ({ showMsg }) => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [expandedId, setExpandedId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/providers', { credentials: 'include' });
            const json = await res.json();
            if (json.success) setProviders(json.data || []);
            else showMsg(json.message || 'Error cargando proveedores.', true);
        } catch { showMsg('Error de conexión.', true); }
        finally { setLoading(false); }
    }, [showMsg]);

    useEffect(() => { load(); }, [load]);

    const startEdit = (p) => {
        setEditingId(p._id);
        setExpandedId(null);
        setEditData({
            nombre: p.nombre, apellido: p.apellido, empresa: p.empresa || '', email: p.email,
            telefono: p.telefono, destino: p.destino, tipoEmbarcacion: p.tipoEmbarcacion,
            cantidadEmbarcaciones: p.cantidadEmbarcaciones, capacidadPersonas: p.capacidadPersonas || '',
            descripcion: p.descripcion || '', estado: p.estado,
        });
    };

    const saveEdit = async (id) => {
        try {
            const res = await fetch(`/api/admin/providers/${id}`, {
                method: 'PATCH', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });
            const json = await res.json();
            if (json.success) { showMsg('Proveedor actualizado.'); setEditingId(null); load(); }
            else showMsg(json.message || 'Error al guardar.', true);
        } catch { showMsg('Error de conexión.', true); }
    };

    const approve = async (id) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/providers/${id}/approve`, { method: 'POST', credentials: 'include' });
            const json = await res.json();
            if (res.ok) showMsg(json.message || 'Proveedor aprobado.');
            else showMsg(json.message || 'Error al aprobar.', true);
            load();
        } catch { showMsg('Error de conexión.', true); }
        finally { setLoading(false); }
    };

    const deleteProvider = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
        try {
            const res = await fetch(`/api/admin/providers/${id}`, { method: 'DELETE', credentials: 'include' });
            const json = await res.json();
            if (json.success) { showMsg('Proveedor eliminado.'); load(); }
            else showMsg(json.message || 'Error.', true);
        } catch { showMsg('Error de conexión.', true); }
    };

    const changeStatus = async (id, estado) => {
        try {
            const res = await fetch(`/api/admin/providers/${id}`, {
                method: 'PATCH', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado }),
            });
            const json = await res.json();
            if (json.success) { showMsg(`Estado cambiado a "${estado}".`); load(); }
            else showMsg(json.message || 'Error.', true);
        } catch { showMsg('Error de conexión.', true); }
    };

    const filtered = providers.filter(p => {
        const q = search.toLowerCase();
        return !q || [p.nombre, p.apellido, p.email, p.empresa, p.destino].some(f => (f || '').toLowerCase().includes(q));
    });

    const pendientes = providers.filter(p => p.estado === 'pendiente').length;

    return (
        <>
            <SectionHeader title="Proveedores" subtitle={`${providers.length} registrados · ${pendientes} pendientes`} onRefresh={load} loading={loading}>
                <SearchBar value={search} onChange={setSearch} placeholder="Buscar proveedor..." />
            </SectionHeader>

            <TableCard>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <th className="px-5 py-3">Nombre</th>
                                <th className="px-5 py-3">Contacto</th>
                                <th className="px-5 py-3">Destino</th>
                                <th className="px-5 py-3">Embarcación</th>
                                <th className="px-5 py-3">Estado</th>
                                <th className="px-5 py-3">Fecha</th>
                                <th className="px-5 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr><td colSpan="7"><EmptyState icon={<Building size={40} />} text="No hay proveedores." /></td></tr>
                            ) : filtered.map(p => (
                                <React.Fragment key={p._id}>
                                    <tr className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-5 py-4">
                                            <p className="font-bold text-navy-dark">{p.nombre} {p.apellido}</p>
                                            {p.empresa && <p className="text-xs text-slate-400">{p.empresa}</p>}
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-xs text-slate-600">{p.email}</p>
                                            <p className="text-xs text-slate-400">{p.telefono}</p>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">{p.destino}</td>
                                        <td className="px-5 py-4">
                                            <p className="text-slate-600">{p.tipoEmbarcacion}</p>
                                            <p className="text-xs text-slate-400">{p.cantidadEmbarcaciones} emb. · {p.capacidadPersonas || '—'} pax</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <Badge text={p.estado} color={statusColor(p.estado)} />
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-400">{formatDate(p.createdAt)}</td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setExpandedId(expandedId === p._id ? null : p._id); setEditingId(null); }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy-dark transition-colors" title="Ver detalles">
                                                    <Eye size={14} />
                                                </button>
                                                <button onClick={() => startEdit(p)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Editar">
                                                    <Edit2 size={14} />
                                                </button>
                                                {p.estado === 'pendiente' && (
                                                    <button onClick={() => approve(p._id)} className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors" title="Aprobar">
                                                        <CheckCircle size={14} />
                                                    </button>
                                                )}
                                                <button onClick={() => deleteProvider(p._id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Expanded details / Edit form */}
                                    {(expandedId === p._id || editingId === p._id) && (
                                        <tr>
                                            <td colSpan="7" className="bg-slate-50/80 px-5 py-5">
                                                {editingId === p._id ? (
                                                    <ProviderEditForm data={editData} onChange={setEditData} onSave={() => saveEdit(p._id)} onCancel={() => setEditingId(null)} />
                                                ) : (
                                                    <div>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                            <DetailField label="Email" value={p.email} />
                                                            <DetailField label="Teléfono" value={p.telefono} />
                                                            <DetailField label="Empresa" value={p.empresa || '—'} />
                                                            <DetailField label="Destino" value={p.destino} />
                                                            <DetailField label="Tipo embarcación" value={p.tipoEmbarcacion} />
                                                            <DetailField label="Cantidad" value={p.cantidadEmbarcaciones} />
                                                            <DetailField label="Capacidad" value={p.capacidadPersonas || '—'} />
                                                            <DetailField label="Registrado" value={formatDateTime(p.createdAt)} />
                                                        </div>
                                                        {p.descripcion && (
                                                            <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4">
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Descripción</p>
                                                                <p className="text-sm text-slate-700">{p.descripcion}</p>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Cambiar estado:</span>
                                                            {['pendiente', 'revisado', 'activo', 'rechazado'].filter(s => s !== p.estado).map(s => (
                                                                <button key={s} onClick={() => changeStatus(p._id, s)}
                                                                    className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors">
                                                                    {s}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TableCard>
        </>
    );
};

const ProviderEditForm = ({ data, onChange, onSave, onCancel }) => {
    const set = (key, val) => onChange({ ...data, [key]: val });
    return (
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Editar proveedor</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <EditField label="Nombre" value={data.nombre} onChange={v => set('nombre', v)} />
                <EditField label="Apellido" value={data.apellido} onChange={v => set('apellido', v)} />
                <EditField label="Email" value={data.email} onChange={v => set('email', v)} type="email" />
                <EditField label="Teléfono" value={data.telefono} onChange={v => set('telefono', v)} />
                <EditField label="Empresa" value={data.empresa} onChange={v => set('empresa', v)} />
                <EditField label="Destino" value={data.destino} onChange={v => set('destino', v)} />
                <EditField label="Tipo embarcación" value={data.tipoEmbarcacion} onChange={v => set('tipoEmbarcacion', v)} />
                <EditField label="Cantidad emb." value={data.cantidadEmbarcaciones} onChange={v => set('cantidadEmbarcaciones', v)} type="number" />
                <EditField label="Capacidad pax" value={data.capacidadPersonas} onChange={v => set('capacidadPersonas', v)} type="number" />
                <div className="col-span-2">
                    <EditField label="Descripción" value={data.descripcion} onChange={v => set('descripcion', v)} />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Estado</label>
                    <select value={data.estado} onChange={e => set('estado', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                        {['pendiente', 'revisado', 'activo', 'rechazado'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex gap-2 mt-4">
                <button onClick={onSave} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors">
                    <Save size={14} /> Guardar
                </button>
                <button onClick={onCancel} className="flex items-center gap-2 bg-slate-200 text-slate-600 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-300 transition-colors">
                    <X size={14} /> Cancelar
                </button>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// BOATS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
const BoatsSection = ({ showMsg }) => {
    const [boats, setBoats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/boats', { credentials: 'include' });
            const json = await res.json();
            if (json.success) setBoats(json.data || []);
            else showMsg(json.message || 'Error cargando embarcaciones.', true);
        } catch { showMsg('Error de conexión.', true); }
        finally { setLoading(false); }
    }, [showMsg]);

    useEffect(() => { load(); }, [load]);

    const startEdit = (b) => {
        setEditingId(b._id);
        setEditData({
            nombre: b.nombre, tipo: b.tipo, capacidad: b.capacidad,
            ubicacion: b.ubicacion || '', estado: b.estado, descripcion: b.descripcion || '', matricula: b.matricula || '',
        });
    };

    const saveEdit = async (id) => {
        try {
            const res = await fetch(`/api/admin/boats/${id}`, {
                method: 'PATCH', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });
            const json = await res.json();
            if (json.success) { showMsg('Embarcación actualizada.'); setEditingId(null); load(); }
            else showMsg(json.message || 'Error.', true);
        } catch { showMsg('Error de conexión.', true); }
    };

    const filtered = boats.filter(b => {
        const q = search.toLowerCase();
        return !q || [b.nombre, b.tipo, b.matricula, b.ubicacion].some(f => (f || '').toLowerCase().includes(q));
    });

    return (
        <>
            <SectionHeader title="Embarcaciones" subtitle={`${boats.length} registradas`} onRefresh={load} loading={loading}>
                <SearchBar value={search} onChange={setSearch} placeholder="Buscar embarcación..." />
            </SectionHeader>

            <TableCard>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <th className="px-5 py-3">Embarcación</th>
                                <th className="px-5 py-3">Matrícula</th>
                                <th className="px-5 py-3">Capacidad</th>
                                <th className="px-5 py-3">Ubicación</th>
                                <th className="px-5 py-3">Proveedor</th>
                                <th className="px-5 py-3">Operador</th>
                                <th className="px-5 py-3">Estado</th>
                                <th className="px-5 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr><td colSpan="8"><EmptyState icon={<Ship size={40} />} text="No hay embarcaciones." /></td></tr>
                            ) : filtered.map(b => (
                                <React.Fragment key={b._id}>
                                    <tr className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-5 py-4">
                                            <p className="font-bold text-navy-dark">{b.nombre}</p>
                                            <p className="text-xs text-slate-400">{b.tipo}</p>
                                        </td>
                                        <td className="px-5 py-4 text-slate-500 font-mono text-xs">{b.matricula || '—'}</td>
                                        <td className="px-5 py-4 text-slate-600">{b.capacidad} pax</td>
                                        <td className="px-5 py-4 text-xs text-slate-500">{b.ubicacion || '—'}</td>
                                        <td className="px-5 py-4 text-xs text-slate-500">
                                            {b.providerId ? `${b.providerId.nombre} ${b.providerId.apellido || ''}` : '—'}
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-500">{b.operatorId?.email || '—'}</td>
                                        <td className="px-5 py-4"><Badge text={b.estado} color={statusColor(b.estado)} /></td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEdit(b)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Editar">
                                                    <Edit2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {editingId === b._id && (
                                        <tr>
                                            <td colSpan="8" className="bg-slate-50/80 px-5 py-5">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Editar embarcación</p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    <EditField label="Nombre" value={editData.nombre} onChange={v => setEditData({ ...editData, nombre: v })} />
                                                    <EditField label="Tipo" value={editData.tipo} onChange={v => setEditData({ ...editData, tipo: v })} />
                                                    <EditField label="Capacidad" value={editData.capacidad} onChange={v => setEditData({ ...editData, capacidad: v })} type="number" />
                                                    <EditField label="Matrícula" value={editData.matricula} onChange={v => setEditData({ ...editData, matricula: v })} />
                                                    <EditField label="Ubicación" value={editData.ubicacion} onChange={v => setEditData({ ...editData, ubicacion: v })} />
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Estado</label>
                                                        <select value={editData.estado} onChange={e => setEditData({ ...editData, estado: e.target.value })}
                                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                                                            {['activa', 'mantenimiento', 'inactiva'].map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <EditField label="Descripción" value={editData.descripcion} onChange={v => setEditData({ ...editData, descripcion: v })} />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-4">
                                                    <button onClick={() => saveEdit(b._id)} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors">
                                                        <Save size={14} /> Guardar
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="flex items-center gap-2 bg-slate-200 text-slate-600 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-300 transition-colors">
                                                        <X size={14} /> Cancelar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TableCard>
        </>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKINGS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
const BookingsSection = ({ showMsg }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/bookings', { credentials: 'include' });
            const json = await res.json();
            if (json.success) setBookings(json.data || []);
            else showMsg(json.message || 'Error cargando reservas.', true);
        } catch { showMsg('Error de conexión.', true); }
        finally { setLoading(false); }
    }, [showMsg]);

    useEffect(() => { load(); }, [load]);

    const startEdit = (b) => {
        setEditingId(b._id);
        setExpandedId(null);
        setEditData({
            estado: b.estado, clienteNombre: b.clienteNombre, clienteEmail: b.clienteEmail || '',
            clienteTelefono: b.clienteTelefono || '', pasajeros: b.pasajeros, destino: b.destino || '',
            horaInicio: b.horaInicio, horaFin: b.horaFin || '', duracionHoras: b.duracionHoras || '',
            tipoViaje: b.tipoViaje, notas: b.notas || '', precioTotal: b.precioTotal || 0,
        });
    };

    const saveEdit = async (id) => {
        try {
            const res = await fetch(`/api/admin/bookings/${id}`, {
                method: 'PATCH', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });
            const json = await res.json();
            if (json.success) { showMsg('Reserva actualizada.'); setEditingId(null); load(); }
            else showMsg(json.message || 'Error.', true);
        } catch { showMsg('Error de conexión.', true); }
    };

    const changeStatus = async (id, estado) => {
        try {
            const res = await fetch(`/api/admin/bookings/${id}`, {
                method: 'PATCH', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado }),
            });
            const json = await res.json();
            if (json.success) { showMsg(`Estado cambiado a "${estado}".`); load(); }
            else showMsg(json.message || 'Error.', true);
        } catch { showMsg('Error de conexión.', true); }
    };

    const filtered = bookings.filter(b => {
        const q = search.toLowerCase();
        const matchSearch = !q || [b.clienteNombre, b.codigo, b.destino, b.clienteEmail].some(f => (f || '').toLowerCase().includes(q));
        const matchEstado = !filterEstado || b.estado === filterEstado;
        return matchSearch && matchEstado;
    });

    return (
        <>
            <SectionHeader title="Reservas" subtitle={`${bookings.length} totales`} onRefresh={load} loading={loading}>
                <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-200">
                    <option value="">Todos los estados</option>
                    {['pendiente', 'confirmada', 'en-curso', 'completada', 'cancelada'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <SearchBar value={search} onChange={setSearch} placeholder="Buscar reserva..." />
            </SectionHeader>

            <TableCard>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <th className="px-5 py-3">Código</th>
                                <th className="px-5 py-3">Cliente</th>
                                <th className="px-5 py-3">Destino</th>
                                <th className="px-5 py-3">Fecha</th>
                                <th className="px-5 py-3">Embarcación</th>
                                <th className="px-5 py-3">Pax</th>
                                <th className="px-5 py-3">Precio</th>
                                <th className="px-5 py-3">Estado</th>
                                <th className="px-5 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr><td colSpan="9"><EmptyState icon={<FileText size={40} />} text="No hay reservas." /></td></tr>
                            ) : filtered.map(b => (
                                <React.Fragment key={b._id}>
                                    <tr className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-5 py-4 font-mono text-xs font-bold text-navy-dark">{b.codigo}</td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-navy-dark">{b.clienteNombre}</p>
                                            <p className="text-xs text-slate-400">{b.clienteEmail}</p>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 text-xs">{b.destino || '—'}</td>
                                        <td className="px-5 py-4 text-xs text-slate-500">
                                            {formatDate(b.fecha)}
                                            <p className="text-slate-400">{b.horaInicio}{b.horaFin ? ` - ${b.horaFin}` : ''}</p>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-500">{b.boatId?.nombre || '—'}</td>
                                        <td className="px-5 py-4 text-center text-slate-600">{b.pasajeros}</td>
                                        <td className="px-5 py-4 font-bold text-navy-dark">{formatCOP(b.precioTotal)}</td>
                                        <td className="px-5 py-4"><Badge text={b.estado} color={statusColor(b.estado)} /></td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setExpandedId(expandedId === b._id ? null : b._id); setEditingId(null); }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy-dark transition-colors" title="Detalles">
                                                    <Eye size={14} />
                                                </button>
                                                <button onClick={() => startEdit(b)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Editar">
                                                    <Edit2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {expandedId === b._id && editingId !== b._id && (
                                        <tr>
                                            <td colSpan="9" className="bg-slate-50/80 px-5 py-5">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                    <DetailField label="Cliente" value={b.clienteNombre} />
                                                    <DetailField label="Email" value={b.clienteEmail || '—'} />
                                                    <DetailField label="Teléfono" value={b.clienteTelefono || '—'} />
                                                    <DetailField label="Tipo viaje" value={b.tipoViaje} />
                                                    <DetailField label="Embarcación" value={b.boatId?.nombre || '—'} />
                                                    <DetailField label="Operador" value={b.operatorId?.email || '—'} />
                                                    <DetailField label="Proveedor" value={b.providerId ? `${b.providerId.nombre} ${b.providerId.apellido || ''}` : '—'} />
                                                    <DetailField label="Duración" value={b.duracionHoras ? `${b.duracionHoras}h` : '—'} />
                                                </div>
                                                {b.notas && (
                                                    <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notas</p>
                                                        <p className="text-sm text-slate-700">{b.notas}</p>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Cambiar estado:</span>
                                                    {['pendiente', 'confirmada', 'en-curso', 'completada', 'cancelada'].filter(s => s !== b.estado).map(s => (
                                                        <button key={s} onClick={() => changeStatus(b._id, s)}
                                                            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors">
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {editingId === b._id && (
                                        <tr>
                                            <td colSpan="9" className="bg-slate-50/80 px-5 py-5">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Editar reserva {b.codigo}</p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    <EditField label="Cliente" value={editData.clienteNombre} onChange={v => setEditData({ ...editData, clienteNombre: v })} />
                                                    <EditField label="Email" value={editData.clienteEmail} onChange={v => setEditData({ ...editData, clienteEmail: v })} type="email" />
                                                    <EditField label="Teléfono" value={editData.clienteTelefono} onChange={v => setEditData({ ...editData, clienteTelefono: v })} />
                                                    <EditField label="Pasajeros" value={editData.pasajeros} onChange={v => setEditData({ ...editData, pasajeros: v })} type="number" />
                                                    <EditField label="Destino" value={editData.destino} onChange={v => setEditData({ ...editData, destino: v })} />
                                                    <EditField label="Hora inicio" value={editData.horaInicio} onChange={v => setEditData({ ...editData, horaInicio: v })} />
                                                    <EditField label="Hora fin" value={editData.horaFin} onChange={v => setEditData({ ...editData, horaFin: v })} />
                                                    <EditField label="Duración (h)" value={editData.duracionHoras} onChange={v => setEditData({ ...editData, duracionHoras: v })} type="number" />
                                                    <EditField label="Precio total" value={editData.precioTotal} onChange={v => setEditData({ ...editData, precioTotal: v })} type="number" />
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Tipo viaje</label>
                                                        <select value={editData.tipoViaje} onChange={e => setEditData({ ...editData, tipoViaje: e.target.value })}
                                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                                                            {['paseo', 'pesca', 'excursion', 'evento', 'traslado', 'otro'].map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Estado</label>
                                                        <select value={editData.estado} onChange={e => setEditData({ ...editData, estado: e.target.value })}
                                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                                                            {['pendiente', 'confirmada', 'en-curso', 'completada', 'cancelada'].map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <EditField label="Notas" value={editData.notas} onChange={v => setEditData({ ...editData, notas: v })} />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-4">
                                                    <button onClick={() => saveEdit(b._id)} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors">
                                                        <Save size={14} /> Guardar
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="flex items-center gap-2 bg-slate-200 text-slate-600 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-300 transition-colors">
                                                        <X size={14} /> Cancelar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TableCard>
        </>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// USERS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
const UsersSection = ({ showMsg }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/all-users', { credentials: 'include' });
            const json = await res.json();
            if (json.success) setUsers(json.data || []);
            else showMsg(json.message || 'Error cargando usuarios.', true);
        } catch { showMsg('Error de conexión.', true); }
        finally { setLoading(false); }
    }, [showMsg]);

    useEffect(() => { load(); }, [load]);

    const startEdit = (u) => {
        setEditingId(u._id);
        setEditData({ email: u.email, role: u.role, status: u.status, telefono: u.telefono || '' });
    };

    const saveEdit = async (id) => {
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'PATCH', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });
            const json = await res.json();
            if (json.success) { showMsg('Usuario actualizado.'); setEditingId(null); load(); }
            else showMsg(json.message || 'Error.', true);
        } catch { showMsg('Error de conexión.', true); }
    };

    const deleteUser = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', credentials: 'include' });
            const json = await res.json();
            if (json.success) { showMsg('Usuario eliminado.'); load(); }
            else showMsg(json.message || 'Error.', true);
        } catch { showMsg('Error de conexión.', true); }
    };

    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        const matchSearch = !q || [u.email, u.role].some(f => (f || '').toLowerCase().includes(q));
        const matchRole = !filterRole || u.role === filterRole;
        return matchSearch && matchRole;
    });

    const roleColor = (r) => ({ STAFF: 'violet', ADMIN: 'blue', OPERATOR: 'emerald', CLIENT: 'slate' })[r] || 'slate';

    return (
        <>
            <SectionHeader title="Usuarios" subtitle={`${users.length} registrados`} onRefresh={load} loading={loading}>
                <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-200">
                    <option value="">Todos los roles</option>
                    {['STAFF', 'ADMIN', 'OPERATOR', 'CLIENT'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <SearchBar value={search} onChange={setSearch} placeholder="Buscar usuario..." />
            </SectionHeader>

            <TableCard>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <th className="px-5 py-3">Email</th>
                                <th className="px-5 py-3">Rol</th>
                                <th className="px-5 py-3">Estado</th>
                                <th className="px-5 py-3">Teléfono</th>
                                <th className="px-5 py-3">Creado</th>
                                <th className="px-5 py-3">Último login</th>
                                <th className="px-5 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr><td colSpan="7"><EmptyState icon={<Users size={40} />} text="No hay usuarios." /></td></tr>
                            ) : filtered.map(u => (
                                <React.Fragment key={u._id}>
                                    <tr className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-navy-dark">{u.email}</p>
                                            {u.providerId && <p className="text-[10px] text-slate-400">Vinculado a proveedor</p>}
                                        </td>
                                        <td className="px-5 py-4"><Badge text={u.role} color={roleColor(u.role)} /></td>
                                        <td className="px-5 py-4"><Badge text={u.status} color={statusColor(u.status)} /></td>
                                        <td className="px-5 py-4 text-xs text-slate-500">{u.telefono || '—'}</td>
                                        <td className="px-5 py-4 text-xs text-slate-400">{formatDate(u.createdAt)}</td>
                                        <td className="px-5 py-4 text-xs text-slate-400">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'Nunca'}</td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEdit(u)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Editar">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => deleteUser(u._id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {editingId === u._id && (
                                        <tr>
                                            <td colSpan="7" className="bg-slate-50/80 px-5 py-5">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Editar usuario</p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    <EditField label="Email" value={editData.email} onChange={v => setEditData({ ...editData, email: v })} type="email" />
                                                    <EditField label="Teléfono" value={editData.telefono} onChange={v => setEditData({ ...editData, telefono: v })} />
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Rol</label>
                                                        <select value={editData.role} onChange={e => setEditData({ ...editData, role: e.target.value })}
                                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                                                            {['STAFF', 'ADMIN', 'OPERATOR', 'CLIENT'].map(r => <option key={r} value={r}>{r}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Estado</label>
                                                        <select value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })}
                                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                                                            {['active', 'pending', 'suspended'].map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-4">
                                                    <button onClick={() => saveEdit(u._id)} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors">
                                                        <Save size={14} /> Guardar
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="flex items-center gap-2 bg-slate-200 text-slate-600 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-300 transition-colors">
                                                        <X size={14} /> Cancelar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TableCard>
        </>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// FINANCIAL SECTION
// ═══════════════════════════════════════════════════════════════════════════════
const FinancialSection = ({ showMsg }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/financial-info', { credentials: 'include' });
            const json = await res.json();
            if (json.success) setData(json.data || []);
            else showMsg(json.message || 'Error cargando finanzas.', true);
        } catch { showMsg('Error de conexión.', true); }
        finally { setLoading(false); }
    }, [showMsg]);

    useEffect(() => { load(); }, [load]);

    const totalIngresos = data.reduce((s, o) => s + (o.totalIngresos || 0), 0);
    const totalViajes = data.reduce((s, o) => s + (o.totalViajes || 0), 0);
    const totalCompletados = data.reduce((s, o) => s + (o.viajesCompletados || 0), 0);

    return (
        <>
            <SectionHeader title="Resumen Financiero" subtitle="Ingresos procesados por operador" onRefresh={load} loading={loading} />

            {data.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <KpiCard label="Ingresos Totales" value={formatCOP(totalIngresos)} icon={<TrendingUp size={14} />} color="violet" />
                    <KpiCard label="Viajes Procesados" value={totalViajes} icon={<Activity size={14} />} color="emerald" sub={`${totalCompletados} completados`} />
                    <KpiCard label="Operadores Activos" value={data.length} icon={<Users size={14} />} color="blue" />
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-navy-dark/20 border-t-navy-dark rounded-full animate-spin" /></div>
            ) : data.length === 0 ? (
                <EmptyState icon={<DollarSign size={40} />} text="No hay registros financieros aún." sub="Se crean cuando un operador completa un viaje." />
            ) : (
                <div className="space-y-3">
                    {data.map((op) => {
                        const isExpanded = expandedId === op.operadorId;
                        return (
                            <TableCard key={op.operadorId}>
                                <button onClick={() => setExpandedId(isExpanded ? null : op.operadorId)}
                                    className={`w-full px-5 py-4 flex items-center gap-4 text-left transition-colors ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}>
                                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                                        <Users size={18} className="text-violet-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-navy-dark truncate">{op.operadorEmail}</p>
                                        <div className="flex items-center gap-4 mt-1 flex-wrap">
                                            <span className="text-xs text-slate-400">{op.totalViajes} viaje{op.totalViajes !== 1 ? 's' : ''}</span>
                                            <span className="text-xs text-emerald-500">{op.viajesCompletados} completado{op.viajesCompletados !== 1 ? 's' : ''}</span>
                                            {op.viajesCancelados > 0 && <span className="text-xs text-red-400">{op.viajesCancelados} cancelado{op.viajesCancelados !== 1 ? 's' : ''}</span>}
                                            {op.ultimaActividad && <span className="text-xs text-slate-400">Último: {formatDate(op.ultimaActividad)}</span>}
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-lg font-heading font-black text-violet-700">{formatCOP(op.totalIngresos)}</p>
                                    </div>
                                    <ChevronDown size={16} className={`transition-transform text-slate-300 ${isExpanded ? 'rotate-180 text-navy-dark' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }} className="overflow-hidden border-t border-slate-200">
                                            <div className="px-5 pb-5 pt-4">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Detalle de viajes ({op.registros.length})</p>
                                                <div className="space-y-2">
                                                    {op.registros.map(r => (
                                                        <div key={r._id} className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-4 flex-wrap text-xs">
                                                            <Badge text={r.estadoRegistro} color={r.estadoRegistro === 'completada' ? 'emerald' : 'red'} />
                                                            <span className="text-slate-500 font-mono">{r.codigoReserva}</span>
                                                            <span className="font-semibold text-navy-dark flex-1 min-w-[100px]">{r.clienteNombre}</span>
                                                            {r.destino && <span className="text-slate-400"><MapPin size={10} className="inline mr-1" />{r.destino}</span>}
                                                            <span className="text-slate-400">{formatDate(r.fecha)}</span>
                                                            <span className="text-slate-400">{r.pasajeros} pax</span>
                                                            {r.duracionHoras && <span className="text-slate-400">{r.duracionHoras}h</span>}
                                                            <span className={`font-black ml-auto ${r.estadoRegistro === 'completada' ? 'text-emerald-600' : 'text-slate-400 line-through'}`}>
                                                                {formatCOP(r.montoCobrado)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-4 bg-violet-50 rounded-xl px-4 py-3 flex items-center justify-between border border-violet-100">
                                                    <span className="text-xs font-bold text-violet-700 uppercase tracking-widest">Total operador</span>
                                                    <span className="text-lg font-heading font-black text-violet-700">{formatCOP(op.totalIngresos)}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </TableCard>
                        );
                    })}
                </div>
            )}
        </>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED TINY COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
const DetailField = ({ label, value }) => (
    <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
    </div>
);

const EditField = ({ label, value, onChange, type = 'text' }) => (
    <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
    </div>
);
