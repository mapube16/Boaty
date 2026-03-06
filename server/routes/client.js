import express from 'express';
import crypto from 'crypto';
import { Booking } from '../models/Booking.js';
import { Boat } from '../models/Boat.js';
import { Provider } from '../models/Provider.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { dispatchBookingCreated } from '../utils/notifications.js';


const router = express.Router();

// GET /api/client/bookings — reservas del cliente (por su email)
router.get('/bookings', requireAuth, requireRole('CLIENT'), async (req, res) => {
    try {
        const bookings = await Booking.find({ clienteEmail: req.user.email })
            .populate('boatId', 'nombre tipo capacidad matricula ubicacion descripcion')
            .populate('providerId', 'nombre apellido empresa email telefono destino')
            .sort({ fecha: -1 });

        return res.json({ success: true, bookings });
    } catch (error) {
        console.error('[CLIENT] Error obteniendo reservas:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// GET /api/client/available-boats — listado de lanchas activas
router.get('/available-boats', requireAuth, requireRole('CLIENT'), async (req, res) => {
    try {
        const boats = await Boat.find({ estado: 'activa' })
            .populate('providerId', 'empresa nombre apellido destino')
            .sort({ nombre: 1 });

        return res.json({ success: true, boats });
    } catch (error) {
        console.error('[CLIENT] Error obteniendo lanchas:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// POST /api/client/bookings — crear una nueva reserva
router.post('/bookings', requireAuth, requireRole('CLIENT'), async (req, res) => {
    try {
        const {
            boatId,
            fecha,
            horaInicio,
            pasajeros,
            destino,
            tipoViaje,
            notas,
            duracionHoras
        } = req.body;

        // Validaciones básicas
        if (!boatId || !fecha || !horaInicio || !pasajeros) {
            return res.status(400).json({ success: false, message: 'Faltan campos requeridos.' });
        }

        const boat = await Boat.findById(boatId);
        if (!boat) {
            return res.status(404).json({ success: false, message: 'Embarcación no encontrada.' });
        }

        if (boat.estado !== 'activa') {
            return res.status(400).json({ success: false, message: 'La embarcación no está disponible.' });
        }

        // Generar código único
        const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
        const codigo = `BK-CL-${randomStr}`;

        // Crear reserva
        const booking = await Booking.create({
            codigo,
            boatId,
            providerId: boat.providerId,
            operatorId: boat.operatorId, // Asumimos el operador asignado a la lancha
            clienteNombre: req.user.nombre || 'Cliente Boaty',
            clienteEmail: req.user.email,
            clienteTelefono: req.user.telefono || '',
            pasajeros,
            fecha: new Date(fecha),
            horaInicio,
            destino: destino || boat.ubicacion,
            tipoViaje: tipoViaje || 'paseo',
            notas,
            duracionHoras: duracionHoras || 4,
            estado: 'pendiente'
        });

        // Fire-and-forget notifications (email + WhatsApp + SSE)
        dispatchBookingCreated(booking, boat.nombre).catch(e =>
            console.error('[CLIENT] Error en notificaciones:', e.message));

        return res.status(201).json({ success: true, booking });
    } catch (error) {
        console.error('[CLIENT] Error creando reserva:', error.message);
        return res.status(500).json({ success: false, message: 'Error al procesar la reserva.' });
    }
});

export default router;
