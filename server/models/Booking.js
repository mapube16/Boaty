import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    codigo: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    boatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Boat',
        required: true,
    },
    operatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        required: true,
    },
    // Datos del cliente
    clienteNombre: {
        type: String,
        required: [true, 'El nombre del cliente es requerido'],
        trim: true,
    },
    clienteEmail: {
        type: String,
        trim: true,
        lowercase: true,
        default: '',
    },
    clienteTelefono: {
        type: String,
        trim: true,
        default: '',
    },
    pasajeros: {
        type: Number,
        required: true,
        min: 1,
    },
    // Fechas y horarios
    fecha: {
        type: Date,
        required: [true, 'La fecha del viaje es requerida'],
    },
    horaInicio: {
        type: String,
        required: true,
        trim: true,
    },
    horaFin: {
        type: String,
        trim: true,
        default: '',
    },
    duracionHoras: {
        type: Number,
        default: null,
    },
    // Detalles del viaje
    destino: {
        type: String,
        trim: true,
        default: '',
    },
    tipoViaje: {
        type: String,
        enum: ['paseo', 'pesca', 'excursion', 'evento', 'traslado', 'otro'],
        default: 'paseo',
    },
    notas: {
        type: String,
        trim: true,
        default: '',
    },
    // Precio
    precioTotal: {
        type: Number,
        default: 0,
    },
    // Estado
    estado: {
        type: String,
        enum: ['pendiente', 'confirmada', 'en-curso', 'completada', 'cancelada'],
        default: 'pendiente',
    },
}, {
    timestamps: true,
});

bookingSchema.index({ operatorId: 1, fecha: 1 });
bookingSchema.index({ boatId: 1, fecha: 1 });
bookingSchema.index({ providerId: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
