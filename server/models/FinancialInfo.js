import mongoose from 'mongoose';

const financialInfoSchema = new mongoose.Schema({
    operatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true,
    },
    clienteNombre: {
        type: String,
        trim: true,
        default: '',
    },
    codigoReserva: {
        type: String,
        trim: true,
        default: '',
    },
    destino: {
        type: String,
        trim: true,
        default: '',
    },
    tipoViaje: {
        type: String,
        trim: true,
        default: '',
    },
    fecha: {
        type: Date,
        default: null,
    },
    pasajeros: {
        type: Number,
        default: 0,
    },
    duracionHoras: {
        type: Number,
        default: null,
    },
    montoCobrado: {
        type: Number,
        default: 0,
        min: 0,
    },
    estadoRegistro: {
        type: String,
        enum: ['completada', 'cancelada'],
        default: 'completada',
    },
}, {
    timestamps: true,
});

financialInfoSchema.index({ operatorId: 1, fecha: -1 });
financialInfoSchema.index({ bookingId: 1 }, { unique: true });

export const FinancialInfo = mongoose.model('FinancialInfo', financialInfoSchema);
