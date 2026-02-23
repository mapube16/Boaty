import express from 'express';
import bcrypt from 'bcryptjs';
import { Provider } from '../models/Provider.js';
import { User } from '../models/User.js';
import { InviteToken } from '../models/InviteToken.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { generateToken, hashToken } from '../utils/crypto.js';
import { sendInviteEmail } from '../utils/email.js';

const router = express.Router();

const normalizeEmail = (email) => (typeof email === 'string' ? email.toLowerCase().trim() : '');

const validateRole = (role) => ['ADMIN', 'OPERATOR', 'CLIENT', 'STAFF'].includes(role);
const validateStatus = (status) => ['pending', 'active', 'suspended'].includes(status);

// Bootstrap endpoint for creating the first STAFF user (use only in POC)
router.post('/bootstrap-user', async (req, res) => {
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

// Bootstrap endpoint to create any user in one call (use only in POC)
router.post('/bootstrap-create-user', async (req, res) => {
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

export default router;
