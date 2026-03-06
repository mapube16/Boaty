/**
 * Script para generar datos Mockup y visualizar las nuevas funcionalidades de Boaty.
 * Ejecutar con: node server/scripts/seed_mock_data.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Provider } from '../models/Provider.js';
import { Boat } from '../models/Boat.js';
import { Booking } from '../models/Booking.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/boaty';

const seed = async () => {
    try {
        console.log('--- Conectando a la base de datos... ---');
        await mongoose.connect(MONGODB_URI);
        console.log('Conectado.');

        // 1. Limpiar datos previos de prueba (opcional, solo para estos correos específicos)
        const testEmails = [
            'admin@boaty.co',
            'operador@boaty.co',
            'cliente@boaty.co',
            'cliente1@gmail.com',
            'cliente2@gmail.com',
            'cliente3@gmail.com'
        ];

        console.log('Limpiando registros previos...');
        await User.deleteMany({ email: { $in: testEmails } });
        // No borramos todos los bookings, solo los que crearemos para no romper otros datos del usuario
        // Pero para visualización limpia, borraremos los que tengan estos correos de cliente
        await Booking.deleteMany({ clienteEmail: { $in: testEmails } });

        const passwordHash = await bcrypt.hash('password123', 12);

        // 2. Crear Usuarios de prueba
        console.log('Creando usuarios...');
        const admin = await User.create({
            email: 'admin@boaty.co',
            passwordHash,
            role: 'STAFF',
            status: 'active'
        });

        const operator = await User.create({
            email: 'operador@boaty.co',
            passwordHash,
            role: 'OPERATOR',
            status: 'active'
        });

        const clientUser = await User.create({
            email: 'cliente@boaty.co',
            passwordHash,
            role: 'CLIENT',
            status: 'active'
        });

        // 3. Crear un Proveedor activo
        console.log('Creando proveedor y lanchas...');
        const provider = await Provider.create({
            nombre: 'Juan',
            apellido: 'Pérez',
            empresa: 'Boaty Rentals SAS',
            email: 'juan@provider.co',
            telefono: '3001234567',
            destino: 'Cartagena',
            tipoEmbarcacion: 'Lancha Deportiva',
            cantidadEmbarcaciones: 3,
            capacidadPersonas: 12,
            estado: 'activo'
        });

        // 4. Crear Lanchas
        const boat1 = await Boat.create({
            nombre: 'Sea Breeze ⚓',
            tipo: 'Lancha Deportiva',
            capacidad: 10,
            providerId: provider._id,
            operatorId: operator._id,
            matricula: 'CP-05-1234-A',
            estado: 'activa',
            descripcion: 'Perfecta para paseos rápidos por las islas.'
        });

        const boat2 = await Boat.create({
            nombre: 'Blue Ocean 🌊',
            tipo: 'Yate Mediano',
            capacidad: 15,
            providerId: provider._id,
            operatorId: operator._id,
            matricula: 'CP-05-5678-B',
            estado: 'mantenimiento',
            descripcion: 'En mantenimiento preventivo de motores.'
        });

        const boat3 = await Boat.create({
            nombre: 'Sun Hunter ☀️',
            tipo: 'Catamarán',
            capacidad: 25,
            providerId: provider._id,
            operatorId: operator._id,
            matricula: 'CP-05-9012-C',
            estado: 'activa',
            descripcion: 'Ideal para eventos y grupos grandes.'
        });

        // 5. Crear Reservas (Bookings)
        console.log('Creando reservas de prueba...');
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        // --- Reservas para HOY (Timing Engine) ---

        // 1. Una que empieza YA o está atrasada (hace 30 min)
        const t1 = new Date();
        t1.setMinutes(t1.getMinutes() - 30);
        const h1 = `${String(t1.getHours()).padStart(2, '0')}:${String(t1.getMinutes()).padStart(2, '0')}`;

        await Booking.create({
            codigo: 'BK-TODAY-1',
            boatId: boat1._id,
            operatorId: operator._id,
            providerId: provider._id,
            clienteNombre: 'Carlos Rodriguez',
            clienteEmail: 'cliente1@gmail.com',
            clienteTelefono: '3109876543',
            pasajeros: 6,
            fecha: todayStr,
            horaInicio: h1,
            horaFin: '17:00',
            destino: 'Islas del Rosario',
            precioTotal: 1250000,
            estado: 'confirmada' // Para que aparezca "Atrasado/Inicia ya"
        });

        // 2. Una que inicia PRONTO (en 45 min)
        const t2 = new Date();
        t2.setMinutes(t2.getMinutes() + 45);
        const h2 = `${String(t2.getHours()).padStart(2, '0')}:${String(t2.getMinutes()).padStart(2, '0')}`;

        await Booking.create({
            codigo: 'BK-TODAY-2',
            boatId: boat3._id,
            operatorId: operator._id,
            providerId: provider._id,
            clienteNombre: 'Andrés Mendoza',
            clienteEmail: 'cliente2@gmail.com',
            clienteTelefono: '3201112233',
            pasajeros: 15,
            fecha: todayStr,
            horaInicio: h2,
            horaFin: '19:00',
            destino: 'Barú',
            precioTotal: 3400000,
            estado: 'confirmada' // Para que aparezca "Inicia pronto"
        });

        // 3. Una EN CURSO
        await Booking.create({
            codigo: 'BK-TODAY-3',
            boatId: boat1._id,
            operatorId: operator._id,
            providerId: provider._id,
            clienteNombre: 'Mariana Silva',
            clienteEmail: 'cliente3@gmail.com',
            clienteTelefono: '3156667788',
            pasajeros: 4,
            fecha: todayStr,
            horaInicio: '09:00',
            horaFin: '13:00',
            destino: 'Cholón',
            precioTotal: 950000,
            estado: 'en-curso'
        });

        // 4. Reserva específica para el cliente final
        await Booking.create({
            codigo: 'BK-FINAL-CLIENT',
            boatId: boat2._id, // Blue Ocean (mantenimiento en DB pero reserva existente)
            operatorId: operator._id,
            providerId: provider._id,
            clienteNombre: 'Final User',
            clienteEmail: 'cliente@boaty.co',
            clienteTelefono: '3000000000',
            pasajeros: 5,
            fecha: todayStr,
            horaInicio: '10:00',
            horaFin: '14:00',
            destino: 'Islas del Rosario',
            precioTotal: 1800000,
            estado: 'confirmada'
        });

        // --- Reservas FUTURAS (Pestaña Pendientes) ---
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        await Booking.create({
            codigo: 'BK-FUT-1',
            boatId: boat1._id,
            operatorId: operator._id,
            providerId: provider._id,
            clienteNombre: 'Carlos Rodriguez', // Repite cliente para ver stats agrupados
            clienteEmail: 'cliente1@gmail.com',
            pasajeros: 8,
            fecha: tomorrowStr,
            horaInicio: '10:00',
            horaFin: '16:00',
            destino: 'Tierra Bomba',
            precioTotal: 1100000,
            estado: 'pendiente'
        });

        // --- Reservas PASADAS (Para Admin Stats) ---
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastWeekStr = lastWeek.toISOString().split('T')[0];

        await Booking.create({
            codigo: 'BK-HIST-1',
            boatId: boat3._id,
            operatorId: operator._id,
            providerId: provider._id,
            clienteNombre: 'Andrés Mendoza',
            clienteEmail: 'cliente2@gmail.com',
            pasajeros: 20,
            fecha: lastWeekStr,
            horaInicio: '08:00',
            horaFin: '17:00',
            destino: 'Islas',
            precioTotal: 4500000,
            estado: 'completada'
        });

        console.log('\n--- DATOS GENERADOS EXITOSAMENTE ---');
        console.log('Credenciales para probar:');
        console.log('- Admin: admin@boaty.co / password123');
        console.log('- Operador: operador@boaty.co / password123');
        console.log('- Cliente: cliente@boaty.co / password123');
        console.log('------------------------------------\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error en el seed:', err);
        process.exit(1);
    }
};

seed();
