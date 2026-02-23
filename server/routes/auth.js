import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { InviteToken } from '../models/InviteToken.js';
import { Session } from '../models/Session.js';
import { Provider } from '../models/Provider.js';
import { generateToken, hashToken } from '../utils/crypto.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const parseDurationMs = (value, fallbackMs) => {
    if (!value || typeof value !== 'string') return fallbackMs;
    const match = value.match(/^(\d+)([mhd])$/);
    if (!match) return fallbackMs;
    const amount = Number(match[1]);
    const unit = match[2];
    const unitMs = unit === 'm' ? 60 * 1000 : unit === 'h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    return amount * unitMs;
};

const accessTokenTtl = process.env.ACCESS_TOKEN_TTL || '15m';
const refreshTokenTtl = process.env.REFRESH_TOKEN_TTL || '7d';
const accessTokenMaxAge = parseDurationMs(accessTokenTtl, 15 * 60 * 1000);
const refreshTokenMaxAge = parseDurationMs(refreshTokenTtl, 7 * 24 * 60 * 60 * 1000);

const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
};

const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie('access_token', accessToken, { ...cookieOptions, maxAge: accessTokenMaxAge });
    res.cookie('refresh_token', refreshToken, { ...cookieOptions, maxAge: refreshTokenMaxAge });
};

const clearAuthCookies = (res) => {
    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);
};

const createAccessToken = (user) => jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: accessTokenTtl },
);

const createSession = async (user, req) => {
    const refreshToken = generateToken(32);
    const refreshTokenHash = hashToken(refreshToken);
    const session = await Session.create({
        userId: user._id,
        refreshTokenHash,
        expiresAt: new Date(Date.now() + refreshTokenMaxAge),
        userAgent: req.get('user-agent') || null,
        ipAddress: req.ip || null,
    });

    return { session, refreshToken };
};

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';
        if (!normalizedEmail || !password) {
            return res.status(400).json({ success: false, message: 'Email y password son requeridos.' });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user || user.status !== 'active' || !user.passwordHash) {
            return res.status(401).json({ success: false, message: 'Credenciales invalidas.' });
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            return res.status(401).json({ success: false, message: 'Credenciales invalidas.' });
        }

        user.lastLoginAt = new Date();
        await user.save();

        const accessToken = createAccessToken(user);
        const { refreshToken } = await createSession(user, req);
        setAuthCookies(res, accessToken, refreshToken);

        return res.json({
            success: true,
            user: { id: user._id, email: user.email, role: user.role },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

router.post('/logout', async (req, res) => {
    try {
        const refreshToken = req.cookies?.refresh_token;
        if (refreshToken) {
            await Session.deleteOne({ refreshTokenHash: hashToken(refreshToken) });
        }
        clearAuthCookies(res);
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies?.refresh_token;
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'No autenticado.' });
        }

        const session = await Session.findOne({ refreshTokenHash: hashToken(refreshToken) });
        if (!session || session.expiresAt < new Date()) {
            return res.status(401).json({ success: false, message: 'Sesion expirada.' });
        }

        const user = await User.findById(session.userId);
        if (!user || user.status !== 'active') {
            return res.status(401).json({ success: false, message: 'Sesion invalida.' });
        }

        const accessToken = createAccessToken(user);
        const newRefreshToken = generateToken(32);
        session.refreshTokenHash = hashToken(newRefreshToken);
        session.expiresAt = new Date(Date.now() + refreshTokenMaxAge);
        await session.save();

        setAuthCookies(res, accessToken, newRefreshToken);
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

router.get('/me', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.sub).select('email role status');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }
        return res.json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

router.post('/complete-invite', async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || typeof token !== 'string' || !password || password.length < 8) {
            return res.status(400).json({ success: false, message: 'Token y password valido son requeridos.' });
        }

        const tokenHash = hashToken(token);
        const invite = await InviteToken.findOne({ tokenHash, usedAt: null, expiresAt: { $gt: new Date() } });
        if (!invite) {
            return res.status(400).json({ success: false, message: 'Token invalido o expirado.' });
        }

        const user = await User.findById(invite.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }

        user.passwordHash = await bcrypt.hash(password, 12);
        user.status = 'active';
        await user.save();

        invite.usedAt = new Date();
        await invite.save();

        if (user.providerId) {
            await Provider.updateOne({ _id: user.providerId }, { estado: 'activo' });
        }

        const accessToken = createAccessToken(user);
        const { refreshToken } = await createSession(user, req);
        setAuthCookies(res, accessToken, refreshToken);

        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

export default router;
