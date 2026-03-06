/**
 * Central notification dispatcher.
 * Called after booking creation or status change.
 * Sends: email + WhatsApp + SSE real-time event.
 */

import { User } from '../models/User.js';
import { Provider } from '../models/Provider.js';
import {
    sendBookingCreatedClient,
    sendBookingCreatedInternal,
    sendBookingStatusChanged,
} from './email.js';
import { notifyBookingCreated, notifyBookingStatusChanged, sendWhatsApp } from './whatsapp.js';
import { sendToUsers, sendToRoles } from '../sse.js';

/**
 * Gather all recipient user IDs + emails for a booking:
 * - operator (booking.operatorId is a User _id)
 * - provider user (User where providerId = booking.providerId)
 * - all ADMIN / STAFF users
 */
async function resolveRecipients(booking) {
    const promises = [
        // All admin/staff
        User.find({ role: { $in: ['ADMIN', 'STAFF'] }, status: 'active' }).select('_id email telefono role').lean(),
    ];

    // Provider user account
    if (booking.providerId) {
        promises.push(
            User.findOne({ providerId: booking.providerId, status: 'active' })
                .select('_id email telefono role').lean()
        );
    } else {
        promises.push(Promise.resolve(null));
    }

    // Operator user
    if (booking.operatorId) {
        promises.push(
            User.findById(booking.operatorId).select('_id email telefono role').lean()
        );
    } else {
        promises.push(Promise.resolve(null));
    }

    // Provider model (for phone + email)
    if (booking.providerId) {
        promises.push(Provider.findById(booking.providerId).select('nombre email telefono').lean());
    } else {
        promises.push(Promise.resolve(null));
    }

    const [admins, providerUser, operatorUser, provider] = await Promise.all(promises);
    return { admins: admins || [], providerUser, operatorUser, provider };
}

/**
 * Fired when a client creates a new booking.
 */
export async function dispatchBookingCreated(booking, boatName) {
    const { admins, providerUser, operatorUser, provider } = await resolveRecipients(booking);

    // ── SSE real-time ──────────────────────────────────────────────────────────
    const ssePayload = {
        type: 'new_booking',
        booking: {
            _id: booking._id,
            codigo: booking.codigo,
            clienteNombre: booking.clienteNombre,
            clienteEmail: booking.clienteEmail,
            estado: booking.estado,
            fecha: booking.fecha,
            horaInicio: booking.horaInicio,
            pasajeros: booking.pasajeros,
            destino: booking.destino,
        },
        boatName,
    };

    // To operator
    if (operatorUser) sendToUsers([operatorUser._id], 'booking_event', ssePayload);
    // To provider user
    if (providerUser) sendToUsers([providerUser._id], 'booking_event', ssePayload);
    // To all admins/staff
    sendToRoles(['ADMIN', 'STAFF'], 'booking_event', ssePayload);

    // ── Email notifications ────────────────────────────────────────────────────
    const emailJobs = [];

    // Client
    if (booking.clienteEmail) {
        emailJobs.push(
            sendBookingCreatedClient({ to: booking.clienteEmail, booking, boatName })
                .catch(e => console.error('[NOTIFY] Email client:', e.message))
        );
    }

    // Operator
    if (operatorUser?.email) {
        emailJobs.push(
            sendBookingCreatedInternal({
                to: operatorUser.email,
                recipientName: 'Operador',
                booking,
                boatName,
            }).catch(e => console.error('[NOTIFY] Email operator:', e.message))
        );
    }

    // Provider (owner) — via Provider model email
    if (provider?.email) {
        emailJobs.push(
            sendBookingCreatedInternal({
                to: provider.email,
                recipientName: provider.nombre || 'Propietario',
                booking,
                boatName,
            }).catch(e => console.error('[NOTIFY] Email provider:', e.message))
        );
    }

    // All admins/staff
    for (const admin of admins) {
        emailJobs.push(
            sendBookingCreatedInternal({
                to: admin.email,
                recipientName: 'Staff BOATY',
                booking,
                boatName,
            }).catch(e => console.error('[NOTIFY] Email admin:', e.message))
        );
    }

    // ── WhatsApp notifications ─────────────────────────────────────────────────
    const { staffMsg } = await notifyBookingCreated(booking, boatName)
        .catch(e => { console.error('[NOTIFY] WA client:', e.message); return {}; });

    // Operator WhatsApp
    if (operatorUser?.telefono) {
        emailJobs.push(
            sendWhatsApp(operatorUser.telefono, staffMsg).catch(e =>
                console.error('[NOTIFY] WA operator:', e.message))
        );
    }

    // Provider WhatsApp
    if (provider?.telefono) {
        emailJobs.push(
            sendWhatsApp(provider.telefono, staffMsg).catch(e =>
                console.error('[NOTIFY] WA provider:', e.message))
        );
    }

    // Admin/staff WhatsApp
    for (const admin of admins) {
        if (admin.telefono) {
            emailJobs.push(
                sendWhatsApp(admin.telefono, staffMsg).catch(e =>
                    console.error('[NOTIFY] WA admin:', e.message))
            );
        }
    }

    await Promise.all(emailJobs);
}

/**
 * Fired when a booking's status changes (operator action).
 */
export async function dispatchBookingStatusChanged(booking, boatName) {
    const { admins, providerUser, operatorUser, provider } = await resolveRecipients(booking);

    // Find client user by email for SSE
    const clientUser = await User.findOne({ email: booking.clienteEmail, status: 'active' })
        .select('_id').lean();

    // ── SSE real-time ──────────────────────────────────────────────────────────
    const ssePayload = {
        type: 'booking_status',
        bookingId: String(booking._id),
        codigo: booking.codigo,
        estado: booking.estado,
        boatName,
        clienteNombre: booking.clienteNombre,
        fecha: booking.fecha,
    };

    if (clientUser) sendToUsers([clientUser._id], 'booking_event', ssePayload);
    if (operatorUser) sendToUsers([operatorUser._id], 'booking_event', ssePayload);
    if (providerUser) sendToUsers([providerUser._id], 'booking_event', ssePayload);
    sendToRoles(['ADMIN', 'STAFF'], 'booking_event', ssePayload);

    // ── Email + WhatsApp ───────────────────────────────────────────────────────
    const jobs = [];

    // Client
    if (booking.clienteEmail) {
        jobs.push(
            sendBookingStatusChanged({
                to: booking.clienteEmail,
                recipientName: booking.clienteNombre,
                booking,
                boatName,
                isClient: true,
            }).catch(e => console.error('[NOTIFY] Email status client:', e.message))
        );
    }

    // Operator
    if (operatorUser?.email) {
        jobs.push(
            sendBookingStatusChanged({
                to: operatorUser.email,
                recipientName: 'Operador',
                booking,
                boatName,
                isClient: false,
            }).catch(e => console.error('[NOTIFY] Email status operator:', e.message))
        );
    }

    // Provider
    if (provider?.email) {
        jobs.push(
            sendBookingStatusChanged({
                to: provider.email,
                recipientName: provider.nombre || 'Propietario',
                booking,
                boatName,
                isClient: false,
            }).catch(e => console.error('[NOTIFY] Email status provider:', e.message))
        );
    }

    // Admins/staff
    for (const admin of admins) {
        jobs.push(
            sendBookingStatusChanged({
                to: admin.email,
                recipientName: 'Staff BOATY',
                booking,
                boatName,
                isClient: false,
            }).catch(e => console.error('[NOTIFY] Email status admin:', e.message))
        );
    }

    // WhatsApp
    const { staffMsg } = await notifyBookingStatusChanged(booking, boatName)
        .catch(e => { console.error('[NOTIFY] WA status:', e.message); return {}; });

    if (staffMsg) {
        if (operatorUser?.telefono) {
            jobs.push(sendWhatsApp(operatorUser.telefono, staffMsg).catch(e =>
                console.error('[NOTIFY] WA status operator:', e.message)));
        }
        if (provider?.telefono) {
            jobs.push(sendWhatsApp(provider.telefono, staffMsg).catch(e =>
                console.error('[NOTIFY] WA status provider:', e.message)));
        }
        for (const admin of admins) {
            if (admin.telefono) {
                jobs.push(sendWhatsApp(admin.telefono, staffMsg).catch(e =>
                    console.error('[NOTIFY] WA status admin:', e.message)));
            }
        }
    }

    await Promise.all(jobs);
}
