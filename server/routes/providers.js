import express from 'express';
import { Provider } from '../models/Provider.js';

const router = express.Router();

// POST /api/providers — Register a new provider
router.post('/', async (req, res) => {
    try {
        const {
            nombre,
            apellido,
            empresa,
            email,
            telefono,
            destino,
            tipoEmbarcacion,
            cantidadEmbarcaciones,
            capacidadPersonas,
            pies,
            amenidades,
            tipoServicio,
            necesitaFotografia,
            descripcion,
            fotos,
        } = req.body;

        const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';
        if (!normalizedEmail) {
            return res.status(400).json({
                success: false,
                message: 'El email es requerido.',
            });
        }

        // Check for duplicate email
        const existing = await Provider.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un proveedor registrado con este correo electrónico.',
            });
        }

        const cantidadNumber = Number(cantidadEmbarcaciones);
        if (!Number.isFinite(cantidadNumber) || !Number.isInteger(cantidadNumber) || cantidadNumber < 1) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad de embarcaciones debe ser un entero mayor o igual a 1.',
            });
        }

        const capacidadNumber = capacidadPersonas ? Number(capacidadPersonas) : null;
        if (capacidadNumber !== null && (!Number.isFinite(capacidadNumber) || !Number.isInteger(capacidadNumber) || capacidadNumber < 1)) {
            return res.status(400).json({
                success: false,
                message: 'La capacidad debe ser un entero mayor o igual a 1.',
            });
        }

        const piesNumber = pies ? Number(pies) : null;

        const provider = new Provider({
            nombre,
            apellido,
            empresa,
            email: normalizedEmail,
            telefono,
            destino,
            tipoEmbarcacion,
            cantidadEmbarcaciones: cantidadNumber,
            capacidadPersonas: capacidadNumber,
            pies: piesNumber,
            amenidades: amenidades ? {
                sonido: Boolean(amenidades.sonido),
                nevera: Boolean(amenidades.nevera),
                cuartos: amenidades.cuartos ? Number(amenidades.cuartos) : 0,
                banos: amenidades.banos ? Number(amenidades.banos) : 0,
            } : undefined,
            tipoServicio: tipoServicio || 'dia',
            necesitaFotografia: typeof necesitaFotografia === 'boolean' ? necesitaFotografia : false,
            fotos: Array.isArray(fotos) ? fotos : [],
            descripcion,
        });

        await provider.save();

        console.log(`✅ Nuevo proveedor registrado: ${nombre} ${apellido} (${email})`);

        return res.status(201).json({
            success: true,
            message: 'Registro exitoso. El equipo de BOATY se pondrá en contacto contigo pronto.',
            id: provider._id,
        });
    } catch (error) {
        console.error('Error al registrar proveedor:', error);

        // Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor. Intenta de nuevo más tarde.',
        });
    }
});

// GET /api/providers — List all providers (for internal use)
router.get('/', async (req, res) => {
    try {
        const providers = await Provider.find().sort({ createdAt: -1 });
        res.json({ success: true, count: providers.length, data: providers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener proveedores.' });
    }
});

export default router;
