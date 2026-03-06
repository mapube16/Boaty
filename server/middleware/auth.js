import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const requireAuth = async (req, res, next) => {
    const token = req.cookies?.access_token;
    if (!token) {
        return res.status(401).json({ success: false, message: 'No autenticado.' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // Always fetch the current role from DB to avoid stale JWT role
        const user = await User.findById(payload.sub).select('email role status');
        if (!user || user.status !== 'active') {
            return res.status(401).json({ success: false, message: 'Sesion invalida.' });
        }
        req.user = { _id: user._id, sub: payload.sub, role: user.role, email: user.email };
        return next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Sesion invalida.' });
    }
};

export const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        console.log(`[AUTH] Role check failed: user role="${req.user?.role}", required="${roles.join(',')}"`);
        return res.status(403).json({ success: false, message: 'No autorizado.' });
    }
    return next();
};
