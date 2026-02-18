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
    },
    capacidadPersonas: {
        type: Number,
        default: null,
    },
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
    timestamps: true, // adds createdAt and updatedAt automatically
});

export const Provider = mongoose.model('Provider', providerSchema);
