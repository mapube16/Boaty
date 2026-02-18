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
            descripcion,
        } = req.body;

        // Check for duplicate email
        const existing = await Provider.findOne({ email: email?.toLowerCase().trim() });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un proveedor registrado con este correo electrónico.',
            });
        }

        const provider = new Provider({
            nombre,
            apellido,
            empresa,
            email,
            telefono,
            destino,
            tipoEmbarcacion,
            cantidadEmbarcaciones: Number(cantidadEmbarcaciones),
            capacidadPersonas: capacidadPersonas ? Number(capacidadPersonas) : null,
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
