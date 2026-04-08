import mongoose from 'mongoose';

const boatSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true,
    },
    tipo: {
        type: String,
        required: [true, 'El tipo es requerido'],
        trim: true,
    },
    capacidad: {
        type: Number,
        required: true,
        min: 1,
    },
    pies: {
        type: Number,
        default: null,
        min: 1,
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        required: true,
    },
    operatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    ubicacion: {
        type: String,
        trim: true,
        default: '',
    },
    estado: {
        type: String,
        enum: ['activa', 'mantenimiento', 'inactiva'],
        default: 'activa',
    },
    descripcion: {
        type: String,
        trim: true,
        default: '',
    },
    matricula: {
        type: String,
        trim: true,
        default: '',
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
}, {
    timestamps: true,
});

boatSchema.index({ providerId: 1 });
boatSchema.index({ operatorId: 1 });

export const Boat = mongoose.model('Boat', boatSchema);
