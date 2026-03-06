import express from 'express';
import bcrypt from 'bcryptjs';
import { Provider } from '../models/Provider.js';
import { User } from '../models/User.js';
import { InviteToken } from '../models/InviteToken.js';
import { Boat } from '../models/Boat.js';
import { Booking } from '../models/Booking.js';
import { FinancialInfo } from '../models/FinancialInfo.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { generateToken, hashToken } from '../utils/crypto.js';
import { sendInviteEmail } from '../utils/email.js';

const router = express.Router();

// GET /api/admin/users-stats — Listado de usuarios y sus estadísticas
router.get('/users-stats', requireAuth, requireRole('STAFF'), async (req, res) => {
    try {
        // Agregación de reservas por cliente
        const clientStats = await Booking.aggregate([
            {
                $group: {
                    _id: '$clienteEmail',
                    nombre: { $first: '$clienteNombre' },
                    telefono: { $first: '$clienteTelefono' },
                    totalViajes: { $sum: 1 },
                    totalGastado: { $sum: '$precioTotal' },
                    ultimaReserva: { $max: '$fecha' }
                }
            },
            { $sort: { totalViajes: -1 } }
        ]);

        // Disponibilidad de lanchas
        const boats = await Boat.find({})
            .select('nombre tipo estado capacidad matricula')
            .sort({ nombre: 1 });

        return res.json({
            success: true,
            clients: clientStats,
            boats: boats
        });
    } catch (error) {
        console.error('[ADMIN] Error obteniendo estadísticas de usuarios:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

const normalizeEmail = (email) => (typeof email === 'string' ? email.toLowerCase().trim() : '');

const validateRole = (role) => ['ADMIN', 'OPERATOR', 'CLIENT', 'STAFF'].includes(role);
const validateStatus = (status) => ['pending', 'active', 'suspended'].includes(status);

// Bootstrap endpoint for creating the first STAFF user (POC only — disabled in production)
router.post('/bootstrap-user', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ success: false, message: 'Not found.' });
    }
    try {
        const secret = req.headers['x-bootstrap-secret'] || req.body?.bootstrapSecret || req.query?.bootstrapSecret;
        if (!process.env.BOOTSTRAP_SECRET || secret !== process.env.BOOTSTRAP_SECRET) {
            return res.status(403).json({ success: false, message: 'No autorizado.' });
        }

        const { email, password, role = 'STAFF' } = req.body;
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail || !password || password.length < 8) {
            return res.status(400).json({ success: false, message: 'Email y password valido son requeridos.' });
        }
        if (!validateRole(role)) {
            return res.status(400).json({ success: false, message: 'Rol invalido.' });
        }

        const exists = await User.findOne({ email: normalizedEmail });
        if (exists) {
            return res.status(409).json({ success: false, message: 'Ya existe un usuario con ese email.' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await User.create({
            email: normalizedEmail,
            passwordHash,
            role,
            status: 'active',
        });

        return res.status(201).json({
            success: true,
            user: { id: user._id, email: user.email, role: user.role },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// Bootstrap endpoint to create any user in one call (POC only — disabled in production)
router.post('/bootstrap-create-user', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ success: false, message: 'Not found.' });
    }
    try {
        const secret = req.headers['x-bootstrap-secret'] || req.body?.bootstrapSecret || req.query?.bootstrapSecret;

        if (!process.env.BOOTSTRAP_SECRET || secret !== process.env.BOOTSTRAP_SECRET) {
            return res.status(403).json({ success: false, message: 'No autorizado.' });
        }

        const { email, password, role = 'CLIENT', status = 'active' } = req.body;
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail || !password || password.length < 8) {
            return res.status(400).json({ success: false, message: 'Email y password valido son requeridos.' });
        }
        if (!validateRole(role)) {
            return res.status(400).json({ success: false, message: 'Rol invalido.' });
        }
        if (!validateStatus(status)) {
            return res.status(400).json({ success: false, message: 'Estado invalido.' });
        }

        const exists = await User.findOne({ email: normalizedEmail });
        if (exists) {
            return res.status(409).json({ success: false, message: 'Ya existe un usuario con ese email.' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await User.create({
            email: normalizedEmail,
            passwordHash,
            role,
            status,
        });

        return res.status(201).json({
            success: true,
            user: { id: user._id, email: user.email, role: user.role, status: user.status },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// Staff endpoint to create users from Postman
router.post('/users', requireAuth, requireRole('STAFF'), async (req, res) => {
    try {
        const { email, password, role = 'CLIENT', status = 'active' } = req.body;
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail || !password || password.length < 8) {
            return res.status(400).json({ success: false, message: 'Email y password valido son requeridos.' });
        }
        if (!validateRole(role)) {
            return res.status(400).json({ success: false, message: 'Rol invalido.' });
        }
        if (!validateStatus(status)) {
            return res.status(400).json({ success: false, message: 'Estado invalido.' });
        }

        const exists = await User.findOne({ email: normalizedEmail });
        if (exists) {
            return res.status(409).json({ success: false, message: 'Ya existe un usuario con ese email.' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await User.create({
            email: normalizedEmail,
            passwordHash,
            role,
            status,
        });

        return res.status(201).json({
            success: true,
            user: { id: user._id, email: user.email, role: user.role, status: user.status },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

router.post('/providers/:id/approve', requireAuth, requireRole('STAFF'), async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id);
        if (!provider) {
            return res.status(404).json({ success: false, message: 'Proveedor no encontrado.' });
        }

        const normalizedEmail = typeof provider.email === 'string' ? provider.email.toLowerCase().trim() : '';
        if (!normalizedEmail) {
            return res.status(400).json({ success: false, message: 'El proveedor no tiene email valido.' });
        }

        const existingUser = await User.findOne({ providerId: provider._id });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Ya existe un usuario para este proveedor.' });
        }

        const user = await User.create({
            email: normalizedEmail,
            role: 'ADMIN',
            status: 'pending',
            providerId: provider._id,
        });

        const token = generateToken(32);
        const tokenHash = hashToken(token);
        const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await InviteToken.create({
            userId: user._id,
            tokenHash,
            expiresAt: inviteExpiresAt,
        });

        const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
        const inviteLink = `${baseUrl}/invite?token=${token}`;
        const fromEmail = process.env.MAILERSEND_FROM || 'info@domain.com';

        // Send email BEFORE updating provider status
        try {
            await sendInviteEmail({
                to: normalizedEmail,
                from: fromEmail,
                inviteLink,
                providerName: provider.nombre || '',
            });
            console.log(`[ADMIN] Email de invitacion enviado a ${normalizedEmail}`);
        } catch (emailError) {
            console.error(`[ADMIN] Error enviando email a ${normalizedEmail}:`, emailError.message);
            // Cleanup: remove user and invite token since email failed
            await InviteToken.deleteOne({ tokenHash });
            await User.deleteOne({ _id: user._id });
            return res.status(502).json({
                success: false,
                message: `Error enviando email: ${emailError.message}`,
            });
        }

        // Only update provider status after email was sent successfully
        provider.estado = 'revisado';
        await provider.save();

        return res.json({
            success: true,
            message: 'Proveedor aprobado e invitacion enviada.',
            inviteLink,
        });
    } catch (error) {
        console.error('[ADMIN] Error en approve:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// ─── Seed endpoint: carga datos de prueba para un operador (POC only — disabled in production) ───
router.post('/seed-operator-data', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ success: false, message: 'Not found.' });
    }
    try {
        const secret = req.headers['x-bootstrap-secret'] || req.body?.bootstrapSecret || req.query?.bootstrapSecret;
        if (!process.env.BOOTSTRAP_SECRET || secret !== process.env.BOOTSTRAP_SECRET) {
            return res.status(403).json({ success: false, message: 'No autorizado.' });
        }

        const { operatorEmail } = req.body;
        if (!operatorEmail) {
            return res.status(400).json({ success: false, message: 'operatorEmail es requerido.' });
        }

        const operator = await User.findOne({ email: operatorEmail.toLowerCase().trim(), role: 'OPERATOR' });
        if (!operator) {
            return res.status(404).json({ success: false, message: 'Operador no encontrado.' });
        }

        // Buscar o crear un provider de prueba
        let provider = await Provider.findOne({ email: 'proveedor-demo@boaty.com' });
        if (!provider) {
            provider = await Provider.create({
                nombre: 'Carlos',
                apellido: 'Martínez',
                empresa: 'Marina del Sol S.A.',
                email: 'proveedor-demo@boaty.com',
                telefono: '+57 300 123 4567',
                destino: 'Cartagena',
                tipoEmbarcacion: 'Yate',
                cantidadEmbarcaciones: 3,
                capacidadPersonas: 12,
                descripcion: 'Empresa de alquiler de yates premium en Cartagena.',
                estado: 'activo',
            });
        }

        // Crear embarcaciones de prueba
        const boatsData = [
            { nombre: 'Sea Breeze', tipo: 'Yate', capacidad: 12, ubicacion: 'Cartagena - Muelle Turístico', estado: 'activa', matricula: 'CTG-2024-001', descripcion: 'Yate de lujo con 3 camarotes, cocina equipada y terraza superior.' },
            { nombre: 'Coral Runner', tipo: 'Lancha rápida', capacidad: 8, ubicacion: 'Cartagena - Bocagrande', estado: 'activa', matricula: 'CTG-2024-015', descripcion: 'Lancha rápida ideal para traslados a las islas del Rosario.' },
            { nombre: 'Blue Horizon', tipo: 'Catamarán', capacidad: 20, ubicacion: 'Cartagena - Castillogrande', estado: 'mantenimiento', matricula: 'CTG-2024-030', descripcion: 'Catamarán espacioso para eventos y excursiones grupales.' },
        ];

        const boats = [];
        for (const bd of boatsData) {
            const existingBoat = await Boat.findOne({ matricula: bd.matricula });
            if (existingBoat) {
                existingBoat.operatorId = operator._id;
                await existingBoat.save();
                boats.push(existingBoat);
            } else {
                const boat = await Boat.create({ ...bd, providerId: provider._id, operatorId: operator._id });
                boats.push(boat);
            }
        }

        // Crear reservas de prueba
        const today = new Date();
        const bookingsData = [
            {
                codigo: 'BOK-001',
                boatId: boats[0]._id,
                clienteNombre: 'María García López',
                clienteEmail: 'maria.garcia@email.com',
                clienteTelefono: '+57 311 234 5678',
                pasajeros: 6,
                fecha: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                horaInicio: '09:00',
                horaFin: '13:00',
                duracionHoras: 4,
                destino: 'Islas del Rosario',
                tipoViaje: 'excursion',
                notas: 'Cliente VIP, llevar snacks y bebidas premium. Celebración de cumpleaños.',
                precioTotal: 1800000,
                estado: 'confirmada',
            },
            {
                codigo: 'BOK-002',
                boatId: boats[1]._id,
                clienteNombre: 'Andrés Rodríguez',
                clienteEmail: 'andres.r@email.com',
                clienteTelefono: '+57 315 876 5432',
                pasajeros: 4,
                fecha: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                horaInicio: '14:00',
                horaFin: '18:00',
                duracionHoras: 4,
                destino: 'Isla Barú',
                tipoViaje: 'paseo',
                notas: 'Incluye parada para snorkeling.',
                precioTotal: 950000,
                estado: 'pendiente',
            },
            {
                codigo: 'BOK-003',
                boatId: boats[0]._id,
                clienteNombre: 'Familia Hernández',
                clienteEmail: 'hernandez.fam@email.com',
                clienteTelefono: '+57 320 111 2233',
                pasajeros: 10,
                fecha: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
                horaInicio: '08:00',
                horaFin: '16:00',
                duracionHoras: 8,
                destino: 'Islas del Rosario - Isla Grande',
                tipoViaje: 'excursion',
                notas: 'Grupo familiar con 3 niños. Necesitan chalecos infantiles.',
                precioTotal: 3200000,
                estado: 'confirmada',
            },
            {
                codigo: 'BOK-004',
                boatId: boats[1]._id,
                clienteNombre: 'Pedro Sánchez Mora',
                clienteEmail: 'pedro.sm@email.com',
                clienteTelefono: '+57 318 999 0011',
                pasajeros: 3,
                fecha: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
                horaInicio: '06:00',
                horaFin: '12:00',
                duracionHoras: 6,
                destino: 'Zona de pesca - Mar abierto',
                tipoViaje: 'pesca',
                notas: 'Cliente trae su propio equipo de pesca. Necesita hielo.',
                precioTotal: 1200000,
                estado: 'pendiente',
            },
            {
                codigo: 'BOK-005',
                boatId: boats[0]._id,
                clienteNombre: 'Empresa TechCo',
                clienteEmail: 'eventos@techco.com',
                clienteTelefono: '+57 601 555 0000',
                pasajeros: 12,
                fecha: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
                horaInicio: '17:00',
                horaFin: '21:00',
                duracionHoras: 4,
                destino: 'Bahía de Cartagena - Sunset tour',
                tipoViaje: 'evento',
                notas: 'Evento corporativo. Catering contratado aparte.',
                precioTotal: 4500000,
                estado: 'completada',
            },
        ];

        const createdBookings = [];
        for (const bd of bookingsData) {
            const existing = await Booking.findOne({ codigo: bd.codigo });
            if (existing) {
                existing.operatorId = operator._id;
                existing.providerId = provider._id;
                await existing.save();
                createdBookings.push(existing);
            } else {
                const booking = await Booking.create({
                    ...bd,
                    operatorId: operator._id,
                    providerId: provider._id,
                });
                createdBookings.push(booking);
            }
        }

        // Crear registros FinancialInfo para reservas completadas
        for (const bk of createdBookings) {
            if (bk.estado === 'completada') {
                await FinancialInfo.findOneAndUpdate(
                    { bookingId: bk._id },
                    {
                        operatorId: operator._id,
                        bookingId: bk._id,
                        clienteNombre: bk.clienteNombre,
                        codigoReserva: bk.codigo,
                        destino: bk.destino || '',
                        tipoViaje: bk.tipoViaje || '',
                        fecha: bk.fecha,
                        pasajeros: bk.pasajeros,
                        duracionHoras: bk.duracionHoras || null,
                        montoCobrado: bk.precioTotal || 0,
                        estadoRegistro: 'completada',
                    },
                    { upsert: true, new: true }
                );
            }
        }

        return res.status(201).json({
            success: true,
            message: `Seed completado: ${boats.length} embarcaciones, ${createdBookings.length} reservas creadas para ${operatorEmail}`,
            boats: boats.map(b => ({ id: b._id, nombre: b.nombre })),
            bookings: createdBookings.map(b => ({ id: b._id, codigo: b.codigo, cliente: b.clienteNombre })),
        });
    } catch (error) {
        console.error('[ADMIN] Error en seed:', error.message);
        return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
});

// GET /api/admin/system-users — Lista usuarios del sistema con teléfono
router.get('/system-users', requireAuth, requireRole('STAFF'), async (req, res) => {
    try {
        const [users, providers] = await Promise.all([
            User.find({ role: { $in: ['OPERATOR', 'STAFF', 'ADMIN', 'CLIENT'] } })
                .select('_id email role status telefono')
                .sort({ role: 1, email: 1 })
                .lean(),
            Provider.find({})
                .select('_id nombre apellido empresa email telefono estado')
                .sort({ nombre: 1 })
                .lean(),
        ]);
        return res.json({ success: true, users, providers });
    } catch (error) {
        console.error('[ADMIN] Error obteniendo system-users:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// PATCH /api/admin/users/:id/telefono — Actualizar teléfono de un usuario
router.patch('/users/:id/telefono', requireAuth, requireRole('STAFF'), async (req, res) => {
    try {
        const { telefono } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { telefono: telefono || null },
            { new: true }
        ).select('_id email role telefono');
        if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        return res.json({ success: true, user });
    } catch (error) {
        console.error('[ADMIN] Error actualizando telefono usuario:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// PATCH /api/admin/providers/:id/telefono — Actualizar teléfono de un proveedor
router.patch('/providers/:id/telefono', requireAuth, requireRole('STAFF'), async (req, res) => {
    try {
        const { telefono } = req.body;
        const provider = await Provider.findByIdAndUpdate(
            req.params.id,
            { telefono: telefono || null },
            { new: true }
        ).select('_id nombre email telefono');
        if (!provider) return res.status(404).json({ success: false, message: 'Proveedor no encontrado.' });
        return res.json({ success: true, provider });
    } catch (error) {
        console.error('[ADMIN] Error actualizando telefono proveedor:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// GET /api/admin/financial-info — Resumen financiero por operador (solo STAFF)
router.get('/financial-info', requireAuth, requireRole('STAFF'), async (req, res) => {
    try {
        const grouped = await FinancialInfo.aggregate([
            {
                $group: {
                    _id: '$operatorId',
                    totalViajes: { $sum: 1 },
                    totalIngresos: { $sum: '$montoCobrado' },
                    viajesCompletados: {
                        $sum: { $cond: [{ $eq: ['$estadoRegistro', 'completada'] }, 1, 0] },
                    },
                    viajesCancelados: {
                        $sum: { $cond: [{ $eq: ['$estadoRegistro', 'cancelada'] }, 1, 0] },
                    },
                    ultimaActividad: { $max: '$fecha' },
                    registros: {
                        $push: {
                            _id: '$_id',
                            bookingId: '$bookingId',
                            clienteNombre: '$clienteNombre',
                            codigoReserva: '$codigoReserva',
                            destino: '$destino',
                            tipoViaje: '$tipoViaje',
                            fecha: '$fecha',
                            pasajeros: '$pasajeros',
                            duracionHoras: '$duracionHoras',
                            montoCobrado: '$montoCobrado',
                            estadoRegistro: '$estadoRegistro',
                        },
                    },
                },
            },
            { $sort: { totalIngresos: -1 } },
        ]);

        const operatorIds = grouped.map(g => g._id);
        const operators = await User.find({ _id: { $in: operatorIds } }, 'email role');
        const operatorMap = {};
        operators.forEach(op => { operatorMap[op._id.toString()] = op; });

        const result = grouped.map(g => ({
            operadorId: g._id,
            operadorEmail: operatorMap[g._id?.toString()]?.email || 'Desconocido',
            totalViajes: g.totalViajes,
            totalIngresos: g.totalIngresos,
            viajesCompletados: g.viajesCompletados,
            viajesCancelados: g.viajesCancelados,
            ultimaActividad: g.ultimaActividad,
            registros: g.registros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
        }));

        return res.json({ success: true, data: result });
    } catch (error) {
        console.error('[ADMIN] Error obteniendo financial-info:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// NEW ADMIN CRUD ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/overview — Dashboard KPIs
router.get('/overview', requireAuth, requireRole('STAFF'), async (req, res) => {
    try {
        const [
            totalProviders,
            pendingProviders,
            activeProviders,
            totalBoats,
            activeBoats,
            totalBookings,
            pendingBookings,
            completedBookings,
            totalUsers,
            revenueAgg,
        ] = await Promise.all([
            Provider.countDocuments(),
            Provider.countDocuments({ estado: 'pendiente' }),
            Provider.countDocuments({ estado: 'activo' }),
            Boat.countDocuments(),
            Boat.countDocuments({ estado: 'activa' }),
            Booking.countDocuments(),
            Booking.countDocuments({ estado: 'pendiente' }),
            Booking.countDocuments({ estado: 'completada' }),
            User.countDocuments(),
            FinancialInfo.aggregate([{ $group: { _id: null, total: { $sum: '$montoCobrado' }, count: { $sum: 1 } } }]),
        ]);

        const revenue = revenueAgg[0] || { total: 0, count: 0 };

        return res.json({
            success: true,
            data: {
                providers: { total: totalProviders, pending: pendingProviders, active: activeProviders },
                boats: { total: totalBoats, active: activeBoats },
                bookings: { total: totalBookings, pending: pendingBookings, completed: completedBookings },
                users: { total: totalUsers },
                revenue: { total: revenue.total, trips: revenue.count },
            },
        });
    } catch (error) {
        console.error('[ADMIN] Error overview:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// PATCH /api/admin/providers/:id — Update provider fields
router.patch('/providers/:id', requireAuth, requireRole('STAFF'), async (req, res) => {
    try {
        const allowedFields = ['nombre', 'apellido', 'empresa', 'email', 'telefono', 'destino', 'tipoEmbarcacion', 'cantidadEmbarcaciones', 'capacidadPersonas', 'descripcion', 'estado'];
        const updates = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }
        if (updates.email) updates.email = updates.email.toLowerCase().trim();
        if (updates.cantidadEmbarcaciones !== undefined) updates.cantidadEmbarcaciones = Number(updates.cantidadEmbarcaciones);
        if (updates.capacidadPersonas !== undefined) updates.capacidadPersonas = updates.capacidadPersonas ? Number(updates.capacidadPersonas) : null;

        const provider = await Provider.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!provider) return res.status(404).json({ success: false, message: 'Proveedor no encontrado.' });
        return res.json({ success: true, provider });
    } catch (error) {
        console.error('[ADMIN] Error actualizando proveedor:', error.message);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// DELETE /api/admin/providers/:id — Delete provider
router.delete('/providers/:id', requireAuth, requireRole('STAFF'), async (req, res) => {
    try {
        const provider = await Provider.findByIdAndDelete(req.params.id);
        if (!provider) return res.status(404).json({ success: false, message: 'Proveedor no encontrado.' });
        return res.json({ success: true, message: 'Proveedor eliminado.' });
    } catch (error) {
        console.error('[ADMIN] Error eliminando proveedor:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// GET /api/admin/boats — List all boats with provider/operator populated
router.get('/boats', requireAuth, requireRole('STAFF'), async (req, res) => {
    try {
        const boats = await Boat.find()
            .populate('providerId', 'nombre apellido empresa email')
            .populate('operatorId', 'email role')
            .sort({ createdAt: -1 })
            .lean();
        return res.json({ success: true, data: boats });
    } catch (error) {
        console.error('[ADMIN] Error obteniendo boats:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// PATCH /api/admin/boats/:id — Update boat fields
router.patch('/boats/:id', requireAuth, requireRole('STAFF'), async (req, res) => {
    try {
        const allowedFields = ['nombre', 'tipo', 'capacidad', 'ubicacion', 'estado', 'descripcion', 'matricula'];
        const updates = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }
        if (updates.capacidad !== undefined) updates.capacidad = Number(updates.capacidad);

        const boat = await Boat.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
            .populate('providerId', 'nombre apellido empresa email')
            .populate('operatorId', 'email role');
        if (!boat) return res.status(404).json({ success: false, message: 'Embarcación no encontrada.' });
        return res.json({ success: true, boat });
    } catch (error) {
        console.error('[ADMIN] Error actualizando boat:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// GET /api/admin/bookings — List all bookings
router.get('/bookings', requireAuth, requireRole('STAFF'), async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('boatId', 'nombre tipo matricula')
            .populate('operatorId', 'email')
            .populate('providerId', 'nombre apellido empresa')
            .sort({ fecha: -1 })
            .lean();
        return res.json({ success: true, data: bookings });
    } catch (error) {
        console.error('[ADMIN] Error obteniendo bookings:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// PATCH /api/admin/bookings/:id — Update booking fields
router.patch('/bookings/:id', requireAuth, requireRole('STAFF'), async (req, res) => {
    try {
        const allowedFields = ['estado', 'clienteNombre', 'clienteEmail', 'clienteTelefono', 'pasajeros', 'fecha', 'horaInicio', 'horaFin', 'duracionHoras', 'destino', 'tipoViaje', 'notas', 'precioTotal'];
        const updates = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }
        if (updates.pasajeros !== undefined) updates.pasajeros = Number(updates.pasajeros);
        if (updates.precioTotal !== undefined) updates.precioTotal = Number(updates.precioTotal);
        if (updates.duracionHoras !== undefined) updates.duracionHoras = updates.duracionHoras ? Number(updates.duracionHoras) : null;

        const booking = await Booking.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
            .populate('boatId', 'nombre tipo matricula')
            .populate('operatorId', 'email')
            .populate('providerId', 'nombre apellido empresa');
        if (!booking) return res.status(404).json({ success: false, message: 'Reserva no encontrada.' });
        return res.json({ success: true, booking });
    } catch (error) {
        console.error('[ADMIN] Error actualizando booking:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// PATCH /api/admin/users/:id — Update user fields (role, status, email, telefono)
router.patch('/users/:id', requireAuth, requireRole('STAFF'), async (req, res) => {
    try {
        const allowedFields = ['role', 'status', 'email', 'telefono'];
        const updates = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }
        if (updates.role && !validateRole(updates.role)) {
            return res.status(400).json({ success: false, message: 'Rol inválido.' });
        }
        if (updates.status && !validateStatus(updates.status)) {
            return res.status(400).json({ success: false, message: 'Estado inválido.' });
        }
        if (updates.email) updates.email = updates.email.toLowerCase().trim();

        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
            .select('_id email role status telefono createdAt lastLoginAt');
        if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        return res.json({ success: true, user });
    } catch (error) {
        console.error('[ADMIN] Error actualizando usuario:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// DELETE /api/admin/users/:id — Delete user
router.delete('/users/:id', requireAuth, requireRole('STAFF'), async (req, res) => {
    try {
        // Prevent deleting self
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'No puedes eliminar tu propia cuenta.' });
        }
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        return res.json({ success: true, message: 'Usuario eliminado.' });
    } catch (error) {
        console.error('[ADMIN] Error eliminando usuario:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// GET /api/admin/all-users — Full users list for admin management
router.get('/all-users', requireAuth, requireRole('STAFF'), async (req, res) => {
    try {
        const users = await User.find()
            .select('_id email role status telefono createdAt lastLoginAt providerId')
            .sort({ createdAt: -1 })
            .lean();
        return res.json({ success: true, data: users });
    } catch (error) {
        console.error('[ADMIN] Error obteniendo all-users:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

export default router;
