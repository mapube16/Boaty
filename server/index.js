import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
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

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

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
