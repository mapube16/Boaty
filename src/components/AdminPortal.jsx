import React, { useEffect, useState } from 'react';

export const AdminPortal = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [providers, setProviders] = useState([]);
    const [actionStatus, setActionStatus] = useState('');

    const handleError = (message) => {
        setError(message || 'Error inesperado.');
        setTimeout(() => setError(''), 4000);
    };

    const loadMe = async () => {
        try {
            const response = await fetch('/api/auth/me', { credentials: 'include' });
            if (!response.ok) {
                setUser(null);
                return;
            }
            const data = await response.json();
            if (data?.success && data.user) {
                setUser(data.user);
            }
        } catch (err) {
            setUser(null);
        }
    };

    const loadProviders = async () => {
        setLoading(true);
        setActionStatus('');
        try {
            const response = await fetch('/api/providers', { credentials: 'include' });
            const data = await response.json();
            if (!response.ok || !data?.success) {
                handleError(data?.message || 'No se pudieron cargar proveedores.');
                return;
            }
            setProviders(data.data || []);
        } catch (err) {
            handleError('Error de conexion al cargar proveedores.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setActionStatus('');
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                handleError(data?.message || 'Credenciales invalidas.');
                return;
            }
            setUser(data.user || null);
            await loadProviders();
        } catch (err) {
            handleError('Error de conexion al iniciar sesion.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        setActionStatus('');
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            setUser(null);
            setProviders([]);
        } catch (err) {
            handleError('Error de conexion al cerrar sesion.');
        } finally {
            setLoading(false);
        }
    };

    const approveProvider = async (id) => {
        setLoading(true);
        setActionStatus('');
        try {
            const response = await fetch(`/api/admin/providers/${id}/approve`, {
                method: 'POST',
                credentials: 'include',
            });
            const data = await response.json();
            if (!response.ok) {
                handleError(data?.message || 'No se pudo aprobar el proveedor.');
                return;
            }
            setActionStatus(data?.message || 'Proveedor aprobado.');
            await loadProviders();
        } catch (err) {
            handleError('Error de conexion al aprobar proveedor.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMe();
    }, []);

    return (
        <section id="admin" className="py-28 bg-slate-50 border-t border-slate-200">
            <div className="container mx-auto max-w-5xl px-6">
                <div className="flex flex-col gap-6">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-black">Portal interno</p>
                        <h2 className="text-4xl md:text-5xl font-heading font-black text-navy-dark mt-3">Admin Login</h2>
                        <p className="text-slate-500 mt-3">Prueba el login y la aprobacion de proveedores desde aqui.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                            {!user ? (
                                <form onSubmit={handleLogin} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                                            placeholder="staff@boaty.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full rounded-2xl bg-navy-dark text-white py-3 text-sm font-black uppercase tracking-[0.25em] disabled:opacity-60"
                                    >
                                        {loading ? 'Cargando...' : 'Iniciar sesion'}
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-500">Sesion activa</p>
                                    <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-600">
                                        <div>Email: <span className="font-semibold text-slate-900">{user.email}</span></div>
                                        <div>Rol: <span className="font-semibold text-slate-900">{user.role}</span></div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        disabled={loading}
                                        className="w-full rounded-2xl border border-slate-300 text-slate-700 py-3 text-sm font-black uppercase tracking-[0.25em] disabled:opacity-60"
                                    >
                                        Cerrar sesion
                                    </button>
                                    <button
                                        type="button"
                                        onClick={loadProviders}
                                        disabled={loading}
                                        className="w-full rounded-2xl bg-slate-900 text-white py-3 text-sm font-black uppercase tracking-[0.25em] disabled:opacity-60"
                                    >
                                        Recargar proveedores
                                    </button>
                                    {actionStatus && <p className="text-sm text-emerald-600 font-semibold">{actionStatus}</p>}
                                    {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-heading font-black text-navy-dark">Proveedores</h3>
                                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">{providers.length} registros</span>
                            </div>
                            <div className="space-y-4 max-h-[420px] overflow-auto pr-2">
                                {providers.length === 0 && (
                                    <p className="text-sm text-slate-400">No hay proveedores cargados. Inicia sesion y recarga.</p>
                                )}
                                {providers.map((provider) => (
                                    <div key={provider._id} className="border border-slate-200 rounded-2xl p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-slate-900">{provider.nombre} {provider.apellido}</p>
                                                <p className="text-sm text-slate-500">{provider.email}</p>
                                                <p className="text-xs uppercase tracking-widest text-slate-400 mt-2">Estado: {provider.estado}</p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {provider.estado === 'pendiente' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => approveProvider(provider._id)}
                                                        disabled={loading}
                                                        className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest disabled:opacity-60"
                                                    >
                                                        Aprobar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
