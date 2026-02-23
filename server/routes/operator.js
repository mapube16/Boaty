import express from 'express';
import { Boat } from '../models/Boat.js';
import { Booking } from '../models/Booking.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/operator/boats — Embarcaciones asignadas al operador
router.get('/boats', requireAuth, requireRole('OPERATOR'), async (req, res) => {
    try {
        const boats = await Boat.find({ operatorId: req.user._id })
            .populate('providerId', 'nombre apellido empresa')
            .sort({ nombre: 1 });

        return res.json({ success: true, boats });
    } catch (error) {
        console.error('[OPERATOR] Error obteniendo embarcaciones:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// GET /api/operator/bookings — Viajes asignados al operador
router.get('/bookings', requireAuth, requireRole('OPERATOR'), async (req, res) => {
    try {
        const { estado, desde, hasta } = req.query;
        const filter = { operatorId: req.user._id };

        if (estado) {
            filter.estado = estado;
        }

        if (desde || hasta) {
            filter.fecha = {};
            if (desde) filter.fecha.$gte = new Date(desde);
            if (hasta) filter.fecha.$lte = new Date(hasta);
        }

        const bookings = await Booking.find(filter)
            .populate('boatId', 'nombre tipo capacidad matricula')
            .populate('providerId', 'nombre apellido empresa')
            .sort({ fecha: 1, horaInicio: 1 });

        return res.json({ success: true, bookings });
    } catch (error) {
        console.error('[OPERATOR] Error obteniendo reservas:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// GET /api/operator/bookings/:id — Detalle de un viaje
router.get('/bookings/:id', requireAuth, requireRole('OPERATOR'), async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, operatorId: req.user._id })
            .populate('boatId', 'nombre tipo capacidad matricula ubicacion estado')
            .populate('providerId', 'nombre apellido empresa email telefono');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Reserva no encontrada.' });
        }

        return res.json({ success: true, booking });
    } catch (error) {
        console.error('[OPERATOR] Error obteniendo detalle de reserva:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// GET /api/operator/summary — Resumen del operador (stats)
router.get('/summary', requireAuth, requireRole('OPERATOR'), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [totalBoats, totalBookings, todayBookings, pendingBookings, activeBookings] = await Promise.all([
            Boat.countDocuments({ operatorId: req.user._id }),
            Booking.countDocuments({ operatorId: req.user._id }),
            Booking.countDocuments({ operatorId: req.user._id, fecha: { $gte: today, $lt: tomorrow } }),
            Booking.countDocuments({ operatorId: req.user._id, estado: 'pendiente' }),
            Booking.countDocuments({ operatorId: req.user._id, estado: { $in: ['confirmada', 'en-curso'] } }),
        ]);

        return res.json({
            success: true,
            summary: {
                totalBoats,
                totalBookings,
                todayBookings,
                pendingBookings,
                activeBookings,
            },
        });
    } catch (error) {
        console.error('[OPERATOR] Error obteniendo resumen:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// PATCH /api/operator/bookings/:id/status — Actualizar estado de un viaje
router.patch('/bookings/:id/status', requireAuth, requireRole('OPERATOR'), async (req, res) => {
    try {
        const { estado } = req.body;
        const validStates = ['pendiente', 'confirmada', 'en-curso', 'completada', 'cancelada'];

        if (!validStates.includes(estado)) {
            return res.status(400).json({ success: false, message: 'Estado inválido.' });
        }

        const booking = await Booking.findOne({ _id: req.params.id, operatorId: req.user._id });
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Reserva no encontrada.' });
        }

        booking.estado = estado;
        await booking.save();

        return res.json({ success: true, booking });
    } catch (error) {
        console.error('[OPERATOR] Error actualizando estado:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

export default router;
