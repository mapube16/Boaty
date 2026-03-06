/**
 * WhatsApp notifications via Twilio WhatsApp API.
 *
 * Required env vars:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_WHATSAPP_FROM    (e.g. whatsapp:+14155238886 — sandbox)
 *   TWILIO_CONTENT_SID      (pre-approved template SID, e.g. HXb5b62575e6e4ff6129ad7c8efe1f983e)
 *
 * Template (Appointment Reminders):
 *   "Your appointment is coming up on {{1}} at {{2}}. If you need to change it, please reply back and let us know."
 *   {{1}} = date string, {{2}} = time string
 */

function formatPhone(phone) {
    if (!phone) return null;
    const cleaned = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+')) return `+${cleaned}`;
    return cleaned;
}

/**
 * Send a templated WhatsApp message.
 * @param {string} to - recipient phone number (with or without leading +)
 * @param {{ date: string, time: string }} vars - template variables
 */
async function sendWhatsApp(to, { date, time }) {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, TWILIO_CONTENT_SID } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM || !TWILIO_CONTENT_SID) return;

    const phone = formatPhone(to);
    if (!phone) return;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    const params = new URLSearchParams();
    params.append('From', TWILIO_WHATSAPP_FROM);
    params.append('To', `whatsapp:${phone}`);
    params.append('ContentSid', TWILIO_CONTENT_SID);
    params.append('ContentVariables', JSON.stringify({ '1': date, '2': time }));

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });

    if (!res.ok) {
        const err = await res.text();
        console.error(`[WA] Error enviando WhatsApp a ${phone}: ${res.status} ${err}`);
    }
}

export async function notifyBookingCreated(booking, boatName) {
    const date = new Date(booking.fecha).toLocaleDateString('es-CO', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    const time = booking.horaInicio || 'N/A';

    // staffMsg is returned so notifications.js can send it to operator/provider/admin
    const staffMsg = { date: `${date} — ${boatName || 'N/A'} (${booking.clienteNombre})`, time };

    const promises = [];
    if (booking.clienteTelefono) {
        promises.push(
            sendWhatsApp(booking.clienteTelefono, { date, time }).catch(e =>
                console.error('[WA] Error cliente:', e.message))
        );
    }

    await Promise.all(promises);
    return { staffMsg };
}

export async function notifyBookingStatusChanged(booking, boatName) {
    const date = new Date(booking.fecha).toLocaleDateString('es-CO', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    const estadoMap = {
        confirmada: 'CONFIRMADA',
        'en-curso': 'EN CURSO',
        completada: 'COMPLETADA',
        cancelada: 'CANCELADA',
        pendiente: 'PENDIENTE',
    };
    const estadoLabel = estadoMap[booking.estado] || booking.estado.toUpperCase();
    const time = `${booking.horaInicio || 'N/A'} — Estado: ${estadoLabel}`;

    const staffMsg = {
        date: `${date} — ${boatName || 'N/A'} (${booking.clienteNombre})`,
        time: `Estado: ${estadoLabel}`,
    };

    const promises = [];
    if (booking.clienteTelefono) {
        promises.push(
            sendWhatsApp(booking.clienteTelefono, { date, time }).catch(e =>
                console.error('[WA] Error cliente:', e.message))
        );
    }

    await Promise.all(promises);
    return { staffMsg };
}

export { sendWhatsApp };
