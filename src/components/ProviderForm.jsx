import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, Mail, Phone, ChevronRight, AlertCircle } from 'lucide-react';

const boatTypes = ['Lancha', 'Velero', 'Catamarán', 'Yate', 'Bote a motor', 'Otro'];

const initialForm = {
    nombre: '',
    telefono: '',
    tipoEmbarcacion: '',
    pies: '',
    capacidadPasajeros: '',
    necesitaFotografia: '',
    sonido: false,
    nevera: false,
    cuartos: false,
    banos: false,
    tipoServicio: '',
};

export const ProviderForm = () => {
    const [formData, setFormData] = useState(initialForm);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!formData.nombre.trim()) e.nombre = 'Nombre requerido';
        if (!formData.telefono.trim()) e.telefono = 'Número de contacto requerido';
        if (!formData.tipoEmbarcacion) e.tipoEmbarcacion = 'Selecciona un tipo';
        if (!formData.pies || Number(formData.pies) < 1) e.pies = 'Ingresa los pies de la embarcación';
        if (!formData.capacidadPasajeros || Number(formData.capacidadPasajeros) < 1) e.capacidadPasajeros = 'Ingresa la capacidad';
        if (formData.necesitaFotografia === '') e.necesitaFotografia = 'Selecciona una opción';
        if (!formData.tipoServicio) e.tipoServicio = 'Selecciona el tipo de servicio';
        return e;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
        if (errors.submit) setErrors(prev => ({ ...prev, submit: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
        setLoading(true);
        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    telefono: formData.telefono,
                    tipoEmbarcacion: formData.tipoEmbarcacion,
                    pies: Number(formData.pies),
                    capacidadPasajeros: Number(formData.capacidadPasajeros),
                    necesitaFotografia: formData.necesitaFotografia === 'si',
                    amenidades: { sonido: formData.sonido, nevera: formData.nevera, cuartos: formData.cuartos, banos: formData.banos },
                    tipoServicio: formData.tipoServicio,
                }),
            });
            const data = await response.json();
            if (!response.ok) { setErrors({ submit: data?.message || 'Error al enviar el formulario.' }); return; }
            setSubmitted(true);
        } catch {
            setErrors({ submit: 'Error de conexión. Verifica tu conexión a internet.' });
        } finally {
            setLoading(false);
        }
    };

    const inp = (field) => `w-full bg-white/50 backdrop-blur-sm border ${errors[field] ? 'border-red-300 ring-1 ring-red-100' : 'border-cream focus:border-orange'} px-5 py-4 rounded-2xl text-navy-dark font-medium text-sm transition-all outline-none placeholder:text-navy-dark/30`;
    const lbl = 'block text-[10px] uppercase tracking-widest font-black text-navy-dark/40 mb-2 ml-1';
    const err = (field) => errors[field] && <p role="alert" className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-wide">{errors[field]}</p>;

    if (submitted) {
        return (
            <section id="registro" className="py-32 bg-cream-light relative">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl mx-auto glass-premium p-16 rounded-[48px] text-center border-orange/10 shadow-premium"
                    >
                        <div className="w-24 h-24 bg-orange rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-premium-orange rotate-3">
                            <CheckCircle className="text-white" size={48} />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-heading font-black text-navy-dark mb-6">REGISTRO RECIBIDO.</h2>
                        <p className="text-navy-dark/50 text-xl font-medium">
                            Gracias, <span className="text-navy-dark underline decoration-orange underline-offset-4">{formData.nombre}</span>. El equipo de BOATY se pondrá en contacto contigo pronto.
                        </p>
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section id="registro" className="py-32 bg-cream-light relative overflow-hidden">
            <div className="container mx-auto max-w-7xl px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    {/* Left Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <span className="text-orange font-bold text-[10px] uppercase tracking-[0.4em] mb-6 block">REGISTRO DE SOCIOS</span>
                        <h2 className="text-6xl md:text-7xl font-heading font-black text-navy-dark leading-[0.9] mb-10 tracking-tightest">
                            ÚNETE AL <br />
                            <span className="text-gradient underline decoration-navy-dark/5 underline-offset-8">CAPITAL NÁUTICO.</span>
                        </h2>
                        <div className="space-y-8 mt-12">
                            {[
                                { icon: Mail, label: 'Soporte Directo', val: 'partners@boaty.com' },
                                { icon: Phone, label: 'Línea Partners', val: '+57 300 BOATY' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-6 group">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:bg-navy-dark transition-colors duration-300">
                                        <item.icon className="text-navy-dark group-hover:text-white transition-colors" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-black text-navy-dark/30 mb-0.5">{item.label}</p>
                                        <p className="text-navy-dark font-bold text-lg">{item.val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Side: Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="glass-premium p-10 md:p-14 rounded-[56px] shadow-premium border-white/60 relative"
                    >
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Sección 1: Contacto */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-navy-dark text-white font-heading font-black text-xs flex items-center justify-center">1</div>
                                    <h3 className="font-heading font-extrabold text-navy-dark uppercase tracking-widest text-sm">Contacto</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={lbl}>Nombre</label>
                                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Tu nombre" className={inp('nombre')} />
                                        {err('nombre')}
                                    </div>
                                    <div>
                                        <label className={lbl}>Número de Contacto</label>
                                        <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+57 300 000 0000" className={inp('telefono')} />
                                        {err('telefono')}
                                    </div>
                                </div>
                            </div>

                            <div className="h-[1px] bg-navy-dark/5" />

                            {/* Sección 2: Embarcación */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-navy-dark text-white font-heading font-black text-xs flex items-center justify-center">2</div>
                                    <h3 className="font-heading font-extrabold text-navy-dark uppercase tracking-widest text-sm">Embarcación</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1">
                                        <label className={lbl}>Tipo</label>
                                        <select name="tipoEmbarcacion" value={formData.tipoEmbarcacion} onChange={handleChange} className={inp('tipoEmbarcacion')}>
                                            <option value="">Seleccionar</option>
                                            {boatTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        {err('tipoEmbarcacion')}
                                    </div>
                                    <div>
                                        <label className={lbl}>Pies</label>
                                        <input type="number" name="pies" value={formData.pies} onChange={handleChange} placeholder="Ej: 28" min="1" step="1" className={inp('pies')} />
                                        {err('pies')}
                                    </div>
                                    <div>
                                        <label className={lbl}>Capacidad Pax</label>
                                        <input type="number" name="capacidadPasajeros" value={formData.capacidadPasajeros} onChange={handleChange} placeholder="Ej: 10" min="1" step="1" className={inp('capacidadPasajeros')} />
                                        {err('capacidadPasajeros')}
                                    </div>
                                </div>
                            </div>

                            <div className="h-[1px] bg-navy-dark/5" />

                            {/* Sección 3: Servicios */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-navy-dark text-white font-heading font-black text-xs flex items-center justify-center">3</div>
                                    <h3 className="font-heading font-extrabold text-navy-dark uppercase tracking-widest text-sm">Servicios</h3>
                                </div>

                                {/* Fotografía */}
                                <div>
                                    <label className={lbl}>¿Necesita Fotografía?</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[{ val: 'si', label: 'Sí' }, { val: 'no', label: 'No' }].map(({ val, label }) => (
                                            <label key={val} className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all font-heading font-black text-sm uppercase tracking-widest ${formData.necesitaFotografia === val ? 'border-orange bg-orange/5 text-orange' : 'border-cream text-navy-dark/40 hover:border-orange/30'}`}>
                                                <input type="radio" name="necesitaFotografia" value={val} checked={formData.necesitaFotografia === val} onChange={handleChange} className="hidden" />
                                                {label}
                                            </label>
                                        ))}
                                    </div>
                                    {err('necesitaFotografia')}
                                </div>

                                {/* Tipo de Servicio */}
                                <div>
                                    <label className={lbl}>Tipo de Servicio</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[{ val: 'dia', label: 'Día' }, { val: 'noche', label: 'Noche' }, { val: 'ambos', label: 'Ambos' }].map(({ val, label }) => (
                                            <label key={val} className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all font-heading font-black text-sm uppercase tracking-widest ${formData.tipoServicio === val ? 'border-navy-dark bg-navy-dark text-white' : 'border-cream text-navy-dark/40 hover:border-navy-dark/30'}`}>
                                                <input type="radio" name="tipoServicio" value={val} checked={formData.tipoServicio === val} onChange={handleChange} className="hidden" />
                                                {label}
                                            </label>
                                        ))}
                                    </div>
                                    {err('tipoServicio')}
                                </div>

                                {/* Amenidades */}
                                <div>
                                    <label className={lbl}>Amenidades</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { name: 'sonido', label: 'Sonido' },
                                            { name: 'nevera', label: 'Nevera' },
                                            { name: 'cuartos', label: 'Cuartos' },
                                            { name: 'banos', label: 'Baños' },
                                        ].map(({ name, label }) => (
                                            <label key={name} className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all font-heading font-black text-xs uppercase tracking-widest select-none ${formData[name] ? 'border-orange bg-orange/5 text-orange' : 'border-cream text-navy-dark/40 hover:border-orange/30'}`}>
                                                <input type="checkbox" name={name} checked={formData[name]} onChange={handleChange} className="hidden" />
                                                {formData[name] && <CheckCircle size={14} />}
                                                {label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Error global */}
                            <AnimatePresence>
                                {errors.submit && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        className="bg-red-50 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border border-red-100 uppercase tracking-wide">
                                        <AlertCircle size={16} />
                                        {errors.submit}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-navy-dark text-white py-6 rounded-[24px] font-heading font-black text-sm uppercase tracking-[0.3em] hover:bg-navy-light transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-4 group"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        ENVIAR REGISTRO
                                        <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-orange/5 rounded-full blur-[100px] -translate-x-1/2 z-0" />
        </section>
    );
};
