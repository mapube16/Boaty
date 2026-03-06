/**
 * seed-financial.mjs — run from /server: node seed-financial.mjs
 * Inserts fake FinancialInfo records for visual testing.
 */
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://straicop_db_user:PPtMDsIA4fepz6Jy@cluster0.vjovxwe.mongodb.net/boaty?retryWrites=true&w=majority&appName=Cluster0';

const userSchema = new mongoose.Schema({ email: String, role: String });
const User = mongoose.model('User', userSchema, 'users');

const financialInfoSchema = new mongoose.Schema({
    operatorId: mongoose.Schema.Types.ObjectId,
    bookingId: mongoose.Schema.Types.ObjectId,
    clienteNombre: String,
    codigoReserva: String,
    destino: String,
    tipoViaje: String,
    fecha: Date,
    pasajeros: Number,
    duracionHoras: Number,
    montoCobrado: Number,
    estadoRegistro: { type: String, enum: ['completada', 'cancelada'] },
}, { timestamps: true });

const FinancialInfo = mongoose.model('FinancialInfo', financialInfoSchema, 'financialinfos');

const trips = [
    { cliente: 'María García López', codigo: 'DEMO-001', destino: 'Islas del Rosario', tipo: 'excursion', pasajeros: 6, duracion: 4, monto: 1800000, estado: 'completada', daysAgo: 0 },
    { cliente: 'Andrés Rodríguez Pérez', codigo: 'DEMO-002', destino: 'Isla Barú', tipo: 'paseo', pasajeros: 4, duracion: 4, monto: 950000, estado: 'completada', daysAgo: 1 },
    { cliente: 'Familia Hernández', codigo: 'DEMO-003', destino: 'Isla Grande', tipo: 'excursion', pasajeros: 10, duracion: 8, monto: 3200000, estado: 'completada', daysAgo: 2 },
    { cliente: 'Empresa TechCo', codigo: 'DEMO-004', destino: 'Bahía Sunset Tour', tipo: 'evento', pasajeros: 12, duracion: 4, monto: 4500000, estado: 'completada', daysAgo: 3 },
    { cliente: 'Luis Martínez', codigo: 'DEMO-005', destino: 'Mar abierto - Pesca', tipo: 'pesca', pasajeros: 3, duracion: 6, monto: 0, estado: 'cancelada', daysAgo: 4 },
    { cliente: 'Sara Gómez', codigo: 'DEMO-006', destino: 'Playa Blanca', tipo: 'paseo', pasajeros: 8, duracion: 5, monto: 2100000, estado: 'completada', daysAgo: 5 },
    { cliente: 'Grupo Aventura Colombia', codigo: 'DEMO-007', destino: 'Archipiélago del Rosario', tipo: 'excursion', pasajeros: 15, duracion: 7, monto: 5800000, estado: 'completada', daysAgo: 7 },
    { cliente: 'Juan Pablos', codigo: 'DEMO-008', destino: 'Traslado Castillo', tipo: 'traslado', pasajeros: 2, duracion: 1, monto: 350000, estado: 'completada', daysAgo: 10 },
];

async function seed() {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected!\n');

    const operators = await User.find({ role: 'OPERATOR' }).limit(3);
    if (operators.length === 0) {
        console.log('❌ No OPERATOR users found. Please run seed-operator-data first.');
        process.exit(0);
    }

    console.log(`👤 Found ${operators.length} operator(s): ${operators.map(o => o.email).join(', ')}\n`);

    for (let i = 0; i < trips.length; i++) {
        const t = trips[i];
        const op = operators[i % operators.length];
        const date = new Date();
        date.setDate(date.getDate() - t.daysAgo);

        await FinancialInfo.findOneAndUpdate(
            { codigoReserva: t.codigo },
            {
                operatorId: op._id,
                bookingId: new mongoose.Types.ObjectId(),
                clienteNombre: t.cliente,
                codigoReserva: t.codigo,
                destino: t.destino,
                tipoViaje: t.tipo,
                fecha: date,
                pasajeros: t.pasajeros,
                duracionHoras: t.duracion,
                montoCobrado: t.monto,
                estadoRegistro: t.estado,
            },
            { upsert: true, new: true }
        );
        const symbol = t.estado === 'completada' ? '✅' : '❌';
        console.log(`  ${symbol} ${t.codigo} → ${op.email} | ${t.cliente} | $${t.monto.toLocaleString('es-CO')} [${t.estado}]`);
    }

    console.log('\n🎉 Done! 8 fake records inserted into financialinfos.');
    console.log('👉 Log in as STAFF → /admin → "Resumen Financiero" tab to preview.');
    console.log('🗑️  To delete: in Atlas filter collection financialinfos where codigoReserva starts with "DEMO-".\n');
    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
