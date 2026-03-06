import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import providersRouter from './routes/providers.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import operatorRouter from './routes/operator.js';
import clientRouter from './routes/client.js';
import paymentsRouter from './routes/payments.js';
import { requireAuth } from './middleware/auth.js';
import { addClient } from './sse.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

// ── Security middleware ────────────────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false, // Relaxed for SPA; tighten per-domain in production
}));

// ── CORS — configurable via CORS_ORIGINS env var ───────────────────────────────
const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// ── Rate limiting ──────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,                  // 30 attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
});

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,  // 1 minute
    max: 120,                  // 120 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Rate limit excedido. Intenta de nuevo en un momento.' },
});

// Apply rate limiters
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/', apiLimiter);

// Routes
app.use('/api/providers', providersRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/operator', operatorRouter);
app.use('/api/client', clientRouter);
app.use('/api/payments', paymentsRouter);

// SSE — real-time event stream (authenticated)
app.get('/api/events', requireAuth, (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // nginx: disable buffering
    res.flushHeaders();

    // Register client
    addClient(req.user._id, req.user.role, res);

    // Keep-alive ping every 25 s
    const ping = setInterval(() => {
        try { res.write(': ping\n\n'); } catch (_) { clearInterval(ping); }
    }, 25000);

    req.on('close', () => clearInterval(ping));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    const distPath = join(__dirname, '..', 'dist');
    if (existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get('*', (req, res) => res.sendFile(join(distPath, 'index.html')));
    }
}

// Connect to MongoDB and start server

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('\n✅ [SERVER] CONEXIÓN EXITOSA A MONGODB!');
        app.listen(PORT, () => {
            console.log(`🚀 [SERVER] API corriendo en: http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('\n❌ [SERVER] ERROR CRÍTICO CONECTANDO A MONGODB:');
        console.error('Mensaje:', err.message);
        console.error('Stack:', err.stack?.substring(0, 100));

        if (err.message.includes('whitelsit') || err.message.includes('whitelist') || err.message.includes('Could not connect')) {
            console.log('\n💡 [SERVER] TIP: El error indica que Atlas no permite tu IP.');
            console.log('1. Ve a Security -> Network Access en Atlas.');
            console.log('2. Asegúrate de que 0.0.0.0/0 esté en verde (Active).');
        }
        process.exit(1);
    });
