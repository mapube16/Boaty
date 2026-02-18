import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import providersRouter from './routes/providers.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
}));
app.use(express.json());

// Routes
app.use('/api/providers', providersRouter);

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
