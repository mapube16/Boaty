import express from 'express';
import { Lead } from '../models/Lead.js';

const router = express.Router();

// POST /api/leads — Register a new lead
router.post('/', async (req, res) => {
    try {
        const {
            nombre,
            telefono,
            tipoEmbarcacion,
            pies,
            capacidadPasajeros,
            necesitaFotografia,
            amenidades,
            tipoServicio,
        } = req.body;

        const lead = new Lead({
            nombre,
            telefono,
            tipoEmbarcacion,
            pies: Number(pies),
            capacidadPasajeros: Number(capacidadPasajeros),
            necesitaFotografia: Boolean(necesitaFotografia),
            amenidades: {
                sonido: Boolean(amenidades?.sonido),
                nevera: Boolean(amenidades?.nevera),
                cuartos: Boolean(amenidades?.cuartos),
                banos: Boolean(amenidades?.banos),
            },
            tipoServicio,
        });

        await lead.save();

        console.log(`✅ Nuevo lead registrado: ${nombre} (${telefono})`);

        return res.status(201).json({
            success: true,
            message: 'Registro exitoso. El equipo de BOATY se pondrá en contacto contigo pronto.',
            id: lead._id,
        });
    } catch (error) {
        console.error('Error al registrar lead:', error);

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

// GET /api/leads — List all leads (internal use)
router.get('/', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.json({ success: true, count: leads.length, data: leads });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener leads.' });
    }
});

export default router;
