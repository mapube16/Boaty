import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true,
    },
    telefono: {
        type: String,
        required: [true, 'El número de contacto es requerido'],
        trim: true,
    },
    tipoEmbarcacion: {
        type: String,
        required: [true, 'El tipo de embarcación es requerido'],
        enum: ['Lancha', 'Velero', 'Catamarán', 'Yate', 'Bote a motor', 'Otro'],
    },
    pies: {
        type: Number,
        required: [true, 'Los pies de la embarcación son requeridos'],
        min: [1, 'Debe ser mayor a 0'],
    },
    capacidadPasajeros: {
        type: Number,
        required: [true, 'La capacidad de pasajeros es requerida'],
        min: [1, 'Debe ser mayor a 0'],
    },
    necesitaFotografia: {
        type: Boolean,
        required: true,
        default: false,
    },
    amenidades: {
        sonido: { type: Boolean, default: false },
        nevera: { type: Boolean, default: false },
        cuartos: { type: Boolean, default: false },
        banos: { type: Boolean, default: false },
    },
    tipoServicio: {
        type: String,
        required: [true, 'El tipo de servicio es requerido'],
        enum: ['dia', 'noche', 'ambos'],
    },
}, {
    timestamps: true,
});

export const Lead = mongoose.model('Lead', leadSchema);
