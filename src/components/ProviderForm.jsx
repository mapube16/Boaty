import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, Mail, Phone, ChevronRight, AlertCircle, Music, Refrigerator, BedDouble, Bath, Sun, Moon, Sparkles, Camera } from 'lucide-react';

const boatTypes = [
    'Lancha deportiva',
    'Velero',
    'Catamarán',
    'Yate',
    'Bote a motor',
    'Otro',
];

const destinations = [
    'Cartagena / Islas del Rosario / Barú',
    'Santa Marta',
    'San Andrés',
    'Coveñas / Tolú',
    'Guatapé',
    'Otro destino',
];

export const ProviderForm = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        empresa: '',
        email: '',
        telefono: '',
        destino: '',
        tipoEmbarcacion: '',
        cantidadEmbarcaciones: '',
        capacidadPersonas: '',
        pies: '',
        amenidades: {
            sonido: false,
            nevera: false,
            cuartos: '',
            banos: '',
        },
        tipoServicio: '',
        necesitaFotografia: null,
        descripcion: '',
        aceptaTerminos: false,
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!formData.nombre.trim()) newErrors.nombre = 'Nombre requerido';
        if (!formData.apellido.trim()) newErrors.apellido = 'Apellido requerido';
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
        if (!formData.telefono.trim()) newErrors.telefono = 'Teléfono requerido';
        if (!formData.destino) newErrors.destino = 'Selecciona un destino';
        if (!formData.tipoEmbarcacion) newErrors.tipoEmbarcacion = 'Selecciona un tipo';
        if (!formData.tipoServicio) newErrors.tipoServicio = 'Selecciona un tipo de servicio';
        if (formData.necesitaFotografia === null) newErrors.necesitaFotografia = 'Indica si necesitas fotografía';

        const cantidadValue = Number(formData.cantidadEmbarcaciones);
        if (!formData.cantidadEmbarcaciones) {
            newErrors.cantidadEmbarcaciones = 'Requerido';
        } else if (!Number.isFinite(cantidadValue) || !Number.isInteger(cantidadValue) || cantidadValue < 1) {
            newErrors.cantidadEmbarcaciones = 'Debe ser un entero mayor o igual a 1';
        }

        const capacidadValue = formData.capacidadPersonas ? Number(formData.capacidadPersonas) : null;
        if (!formData.capacidadPersonas) {
            newErrors.capacidadPersonas = 'Requerido';
        } else if (capacidadValue !== null && (!Number.isFinite(capacidadValue) || !Number.isInteger(capacidadValue) || capacidadValue < 1)) {
            newErrors.capacidadPersonas = 'Debe ser un entero mayor o igual a 1';
        }

        if (!formData.aceptaTerminos) newErrors.aceptaTerminos = 'Acepta los términos';
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
        if (errors.submit) setErrors(prev => ({ ...prev, submit: undefined }));
    };

    const handleAmenidad = (key, value) => {
        setFormData(prev => ({
            ...prev,
            amenidades: { ...prev.amenidades, [key]: value },
        }));
    };

    const handleServicio = (value) => {
        setFormData(prev => ({ ...prev, tipoServicio: value }));
        if (errors.tipoServicio) setErrors(prev => ({ ...prev, tipoServicio: undefined }));
    };

    const handleFotografia = (value) => {
        setFormData(prev => ({ ...prev, necesitaFotografia: value }));
        if (errors.necesitaFotografia) setErrors(prev => ({ ...prev, necesitaFotografia: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/providers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    empresa: formData.empresa,
                    email: formData.email,
                    telefono: formData.telefono,
                    destino: formData.destino,
                    tipoEmbarcacion: formData.tipoEmbarcacion,
                    cantidadEmbarcaciones: Number(formData.cantidadEmbarcaciones),
                    capacidadPersonas: formData.capacidadPersonas ? Number(formData.capacidadPersonas) : null,
                    pies: formData.pies ? Number(formData.pies) : null,
                    amenidades: {
                        sonido: formData.amenidades.sonido,
                        nevera: formData.amenidades.nevera,
                        cuartos: formData.amenidades.cuartos ? Number(formData.amenidades.cuartos) : 0,
                        banos: formData.amenidades.banos ? Number(formData.amenidades.banos) : 0,
                    },
                    tipoServicio: formData.tipoServicio,
                    necesitaFotografia: formData.necesitaFotografia,
                    descripcion: formData.descripcion,
                }),
            });

            const contentType = response.headers.get('content-type') || '';
            const data = contentType.includes('application/json') ? await response.json() : null;

            if (!response.ok) {
                console.error('❌ [FORM] Error en la respuesta:', data?.message || response.statusText);
                setErrors({ submit: data?.message || 'Error al enviar el formulario.' });
                return;
            }

            console.log('✅ [FORM] Registro completado con éxito!');
            setSubmitted(true);
        } catch (err) {
            console.error('🚨 [FORM] ERROR FATAL EN FETCH:', err);
            setErrors({ submit: 'Error de conexión. Verifica que el servidor esté corriendo.' });
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = (field) => `
        w-full bg-white/50 backdrop-blur-sm border ${errors[field] ? 'border-red-300 ring-1 ring-red-100' : 'border-cream focus:border-orange'}
        px-5 py-4 rounded-2xl text-navy-dark font-medium text-sm transition-all outline-none placeholder:text-navy-dark/30
    `;

    const labelClasses = "block text-[10px] uppercase tracking-widest font-black text-navy-dark/40 mb-2 ml-1";

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
                        <p className="text-navy-dark/50 text-xl font-medium mb-12">
                            Gracias, <span className="text-navy-dark underline decoration-orange underline-offset-4">{formData.nombre}</span>. El equipo de BOATY revisará tu flota en las próximas 24-48 horas.
                        </p>
                        <div className="bg-white/40 rounded-3xl p-8 text-left border border-white/60">
                            <h4 className="font-heading font-bold text-navy-dark mb-4 text-sm uppercase tracking-widest">Protocolo de Onboarding</h4>
                            <div className="space-y-4">
                                {[
                                    'Análisis técnico de disponibilidad y flota.',
                                    'Sesión de configuración estratégica vía Concierge.',
                                    'Acceso exclusivo a la plataforma de gestión.',
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 text-navy-dark/60 text-sm font-medium">
                                        <div className="w-2 h-2 rounded-full bg-orange" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section id="registro" className="py-32 bg-cream-light relative overflow-hidden">
            <div className="container mx-auto max-w-7xl px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    {/* Left Side: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <span className="text-orange font-bold text-[10px] uppercase tracking-[0.4em] mb-6 block">
                            REGISTRO DE SOCIOS
                        </span>
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

                            {/* ── Sección 1: Identidad ── */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-8 rounded-full bg-navy-dark text-white font-heading font-black text-xs flex items-center justify-center">1</div>
                                    <h3 className="font-heading font-extrabold text-navy-dark uppercase tracking-widest text-sm">Identidad</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="f-nombre" className={labelClasses}>Primer Nombre</label>
                                        <input id="f-nombre" type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Julian" className={inputClasses('nombre')} aria-required="true" aria-describedby={errors.nombre ? 'err-nombre' : undefined} />
                                        {errors.nombre && <p id="err-nombre" role="alert" className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-wide">{errors.nombre}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="f-apellido" className={labelClasses}>Apellido</label>
                                        <input id="f-apellido" type="text" name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Ej: Reyes" className={inputClasses('apellido')} aria-required="true" aria-describedby={errors.apellido ? 'err-apellido' : undefined} />
                                        {errors.apellido && <p id="err-apellido" role="alert" className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-wide">{errors.apellido}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="f-email" className={labelClasses}>Email Corporativo</label>
                                    <input id="f-email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="socio@empresa.com" autoComplete="email" className={inputClasses('email')} aria-required="true" aria-describedby={errors.email ? 'err-email' : undefined} />
                                    {errors.email && <p id="err-email" role="alert" className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-wide">{errors.email}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="f-telefono" className={labelClasses}>Número de Contacto</label>
                                        <input id="f-telefono" type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+57 ---" autoComplete="tel" className={inputClasses('telefono')} aria-required="true" aria-describedby={errors.telefono ? 'err-telefono' : undefined} />
                                        {errors.telefono && <p id="err-telefono" role="alert" className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-wide">{errors.telefono}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="f-empresa" className={labelClasses}>Empresa</label>
                                        <input id="f-empresa" type="text" name="empresa" value={formData.empresa} onChange={handleChange} placeholder="Nombre Comercial" autoComplete="organization" className={inputClasses('empresa')} />
                                    </div>
                                </div>
                            </div>

                            <div className="h-[1px] bg-navy-dark/5 my-10" />

                            {/* ── Sección 2: Embarcación ── */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-8 rounded-full bg-navy-dark text-white font-heading font-black text-xs flex items-center justify-center">2</div>
                                    <h3 className="font-heading font-extrabold text-navy-dark uppercase tracking-widest text-sm">Embarcación</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="f-destino" className={labelClasses}>Destino</label>
                                        <select id="f-destino" name="destino" value={formData.destino} onChange={handleChange} className={inputClasses('destino')} aria-required="true" aria-describedby={errors.destino ? 'err-destino' : undefined}>
                                            <option value="">Seleccionar</option>
                                            {destinations.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        {errors.destino && <p id="err-destino" role="alert" className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-wide">{errors.destino}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="f-tipo" className={labelClasses}>Tipo de Embarcación</label>
                                        <select id="f-tipo" name="tipoEmbarcacion" value={formData.tipoEmbarcacion} onChange={handleChange} className={inputClasses('tipoEmbarcacion')} aria-required="true" aria-describedby={errors.tipoEmbarcacion ? 'err-tipo' : undefined}>
                                            <option value="">Seleccionar</option>
                                            {boatTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        {errors.tipoEmbarcacion && <p id="err-tipo" role="alert" className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-wide">{errors.tipoEmbarcacion}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <label htmlFor="f-cantidad" className={labelClasses}>Cantidad</label>
                                        <input id="f-cantidad" type="number" name="cantidadEmbarcaciones" value={formData.cantidadEmbarcaciones} onChange={handleChange} placeholder="0" min="1" step="1" className={inputClasses('cantidadEmbarcaciones')} aria-required="true" aria-describedby={errors.cantidadEmbarcaciones ? 'err-cantidad' : undefined} />
                                        {errors.cantidadEmbarcaciones && <p id="err-cantidad" role="alert" className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-wide">{errors.cantidadEmbarcaciones}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="f-capacidad" className={labelClasses}>Capacidad Pax</label>
                                        <input id="f-capacidad" type="number" name="capacidadPersonas" value={formData.capacidadPersonas} onChange={handleChange} placeholder="Personas" min="1" step="1" className={inputClasses('capacidadPersonas')} aria-required="true" aria-describedby={errors.capacidadPersonas ? 'err-capacidad' : undefined} />
                                        {errors.capacidadPersonas && <p id="err-capacidad" role="alert" className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-wide">{errors.capacidadPersonas}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="f-pies" className={labelClasses}>Pies</label>
                                        <input id="f-pies" type="number" name="pies" value={formData.pies} onChange={handleChange} placeholder="Ej: 32" min="1" step="1" className={inputClasses('pies')} />
                                    </div>
                                </div>
                            </div>

                            <div className="h-[1px] bg-navy-dark/5 my-10" />

                            {/* ── Sección 3: Amenidades ── */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-8 rounded-full bg-navy-dark text-white font-heading font-black text-xs flex items-center justify-center">3</div>
                                    <h3 className="font-heading font-extrabold text-navy-dark uppercase tracking-widest text-sm">Amenidades</h3>
                                </div>

                                {/* Toggles: Sonido y Nevera */}
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { key: 'sonido', label: 'Sonido', icon: Music },
                                        { key: 'nevera', label: 'Nevera', icon: Refrigerator },
                                    ].map(({ key, label, icon: Icon }) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => handleAmenidad(key, !formData.amenidades[key])}
                                            className={`flex items-center gap-3 px-5 py-4 rounded-2xl border text-sm font-bold transition-all duration-300 ${
                                                formData.amenidades[key]
                                                    ? 'bg-navy-dark text-white border-navy-dark shadow-lg'
                                                    : 'bg-white/50 text-navy-dark/50 border-cream hover:border-navy-dark/20'
                                            }`}
                                        >
                                            <Icon size={16} />
                                            {label}
                                            {formData.amenidades[key] && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="ml-auto w-4 h-4 rounded-full bg-orange flex items-center justify-center"
                                                >
                                                    <CheckCircle size={10} className="text-white" />
                                                </motion.div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Cuartos y Baños */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="f-cuartos" className={labelClasses}>
                                            <span className="flex items-center gap-1"><BedDouble size={10} className="inline" /> Cuartos</span>
                                        </label>
                                        <input
                                            id="f-cuartos"
                                            type="number"
                                            value={formData.amenidades.cuartos}
                                            onChange={(e) => handleAmenidad('cuartos', e.target.value)}
                                            placeholder="0"
                                            min="0"
                                            step="1"
                                            className={inputClasses('cuartos')}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="f-banos" className={labelClasses}>
                                            <span className="flex items-center gap-1"><Bath size={10} className="inline" /> Baños</span>
                                        </label>
                                        <input
                                            id="f-banos"
                                            type="number"
                                            value={formData.amenidades.banos}
                                            onChange={(e) => handleAmenidad('banos', e.target.value)}
                                            placeholder="0"
                                            min="0"
                                            step="1"
                                            className={inputClasses('banos')}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="h-[1px] bg-navy-dark/5 my-10" />

                            {/* ── Sección 4: Tipo de Servicio ── */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-8 rounded-full bg-navy-dark text-white font-heading font-black text-xs flex items-center justify-center">4</div>
                                    <h3 className="font-heading font-extrabold text-navy-dark uppercase tracking-widest text-sm">Tipo de Servicio</h3>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { value: 'dia', label: 'De Día', icon: Sun },
                                        { value: 'noche', label: 'De Noche', icon: Moon },
                                        { value: 'ambos', label: 'Ambos', icon: Sparkles },
                                    ].map(({ value, label, icon: Icon }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => handleServicio(value)}
                                            className={`flex flex-col items-center gap-2 px-4 py-5 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                                                formData.tipoServicio === value
                                                    ? 'bg-navy-dark text-white border-navy-dark shadow-lg'
                                                    : 'bg-white/50 text-navy-dark/50 border-cream hover:border-navy-dark/20'
                                            }`}
                                        >
                                            <Icon size={20} />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                {errors.tipoServicio && <p role="alert" className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-wide">{errors.tipoServicio}</p>}
                            </div>

                            <div className="h-[1px] bg-navy-dark/5 my-10" />

                            {/* ── Sección 5: Fotografía ── */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-8 rounded-full bg-navy-dark text-white font-heading font-black text-xs flex items-center justify-center">5</div>
                                    <h3 className="font-heading font-extrabold text-navy-dark uppercase tracking-widest text-sm">Fotografía Profesional</h3>
                                </div>

                                <p className="text-navy-dark/40 text-xs font-medium leading-relaxed">
                                    ¿Necesitas que el equipo BOATY tome fotografías profesionales de tu embarcación?
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { value: true, label: 'Sí, necesito fotos' },
                                        { value: false, label: 'Ya tengo mis fotos' },
                                    ].map(({ value, label }) => (
                                        <button
                                            key={String(value)}
                                            type="button"
                                            onClick={() => handleFotografia(value)}
                                            className={`flex items-center gap-3 px-5 py-4 rounded-2xl border text-sm font-bold transition-all duration-300 ${
                                                formData.necesitaFotografia === value
                                                    ? 'bg-navy-dark text-white border-navy-dark shadow-lg'
                                                    : 'bg-white/50 text-navy-dark/50 border-cream hover:border-navy-dark/20'
                                            }`}
                                        >
                                            <Camera size={16} />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                {errors.necesitaFotografia && <p role="alert" className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-wide">{errors.necesitaFotografia}</p>}
                            </div>

                            <div className="h-[1px] bg-navy-dark/5 my-10" />

                            {/* ── Descripción ── */}
                            <div>
                                <label htmlFor="f-descripcion" className={labelClasses}>Descripción <span className="normal-case tracking-normal font-medium opacity-60">(opcional)</span></label>
                                <textarea
                                    id="f-descripcion"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    placeholder="Cuéntanos sobre tu flota, servicios adicionales, etc."
                                    rows={3}
                                    className={`${inputClasses('descripcion')} resize-none`}
                                />
                            </div>

                            {/* ── Términos ── */}
                            <div className="pt-6">
                                <label
                                    htmlFor="f-terminos"
                                    className="flex items-start gap-4 cursor-pointer group select-none"
                                >
                                    <div className="relative mt-0.5 shrink-0">
                                        <input
                                            id="f-terminos"
                                            type="checkbox"
                                            name="aceptaTerminos"
                                            checked={formData.aceptaTerminos}
                                            onChange={handleChange}
                                            className="absolute opacity-0 w-6 h-6 cursor-pointer -top-0.5 -left-0.5 z-10"
                                            aria-required="true"
                                            aria-describedby={errors.aceptaTerminos ? 'err-terminos' : undefined}
                                        />
                                        <div aria-hidden="true" className={`w-6 h-6 border-2 rounded-lg transition-all duration-300 flex items-center justify-center ${formData.aceptaTerminos ? 'bg-orange border-orange shadow-premium-orange' : 'border-navy-dark/10 bg-white group-hover:border-orange/30'}`}>
                                            {formData.aceptaTerminos && (
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -20 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                >
                                                    <CheckCircle className="text-white" size={14} />
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-navy-dark/40 text-[10px] uppercase tracking-widest font-black leading-relaxed pt-0.5">
                                        Confirmo que los activos cumplen con los estándares de seguridad y acepto los términos de socio BOATY.
                                    </span>
                                </label>
                                {errors.aceptaTerminos && (
                                    <motion.p
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-red-500 text-[10px] font-bold mt-3 uppercase tracking-wide ml-10"
                                    >
                                        {errors.aceptaTerminos}
                                    </motion.p>
                                )}
                            </div>

                            {/* ── Error global ── */}
                            <AnimatePresence>
                                {errors.submit && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border border-red-100 uppercase tracking-wide">
                                        <AlertCircle size={16} />
                                        {errors.submit}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* ── Submit ── */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-navy-dark text-white py-6 rounded-[24px] font-heading font-black text-sm uppercase tracking-[0.3em] hover:bg-navy-light transition-all shadow-xl hover:shadow-navy-dark/20 disabled:opacity-50 flex items-center justify-center gap-4 group"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : (
                                    <>
                                        SOLICITAR ACCESO
                                        <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>

            {/* Decorative background blur */}
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-orange/5 rounded-full blur-[100px] -translate-x-1/2 z-0" />
        </section>
    );
};
