import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true,
    },
    apellido: {
        type: String,
        required: [true, 'El apellido es requerido'],
        trim: true,
    },
    empresa: {
        type: String,
        trim: true,
        default: '',
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Email inválido'],
    },
    telefono: {
        type: String,
        required: [true, 'El teléfono es requerido'],
        trim: true,
    },
    destino: {
        type: String,
        required: [true, 'El destino es requerido'],
    },
    tipoEmbarcacion: {
        type: String,
        required: [true, 'El tipo de embarcación es requerido'],
    },
    cantidadEmbarcaciones: {
        type: Number,
        required: [true, 'La cantidad de embarcaciones es requerida'],
        min: 1,
        validate: {
            validator: Number.isInteger,
            message: 'La cantidad de embarcaciones debe ser un entero',
        },
    },
    capacidadPersonas: {
        type: Number,
        default: null,
        min: 1,
        validate: {
            validator: (value) => value === null || Number.isInteger(value),
            message: 'La capacidad debe ser un entero',
        },
    },
    pies: {
        type: Number,
        default: null,
        min: 1,
    },
    // Amenidades
    amenidades: {
        sonido: { type: Boolean, default: false },
        nevera: { type: Boolean, default: false },
        cuartos: { type: Number, default: 0, min: 0 },
        banos: { type: Number, default: 0, min: 0 },
    },
    // Servicio ofrecido
    tipoServicio: {
        type: String,
        enum: ['dia', 'noche', 'ambos'],
        default: 'dia',
    },
    // Si necesita fotografía profesional del equipo BOATY
    necesitaFotografia: {
        type: Boolean,
        default: false,
    },
    fotos: [{
        url: { type: String, required: true },
        publicId: { type: String, required: true },
    }],
    descripcion: {
        type: String,
        trim: true,
        default: '',
    },
    estado: {
        type: String,
        enum: ['pendiente', 'revisado', 'activo', 'rechazado'],
        default: 'pendiente',
    },
}, {
    timestamps: true,
});

export const Provider = mongoose.model('Provider', providerSchema);
