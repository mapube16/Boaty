import express from 'express';
import crypto from 'crypto';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { Booking } from '../models/Booking.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// MercadoPago client — uses MP_ACCESS_TOKEN from .env
const mp = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || '',
    options: { timeout: 5000 },
});

/**
 * POST /api/payments/create-preference
 * Creates a MercadoPago Checkout Pro preference and returns the payment URL.
 */
router.post('/create-preference', requireAuth, async (req, res) => {
    try {
        const { bookingCode } = req.body;

        if (!bookingCode) {
            return res.status(400).json({ success: false, message: 'bookingCode requerido' });
        }

        const booking = await Booking.findOne({ codigo: bookingCode }).populate('boatId');
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
        }

        const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
        // MP rejects unit_price = 0; use a minimum of 1000 COP for safety
        const amount = Math.max(booking.precioTotal || 0, 1000);

        // Only send notification_url if it's a real public URL (not localhost).
        // MP validates the URL is reachable and rejects preferences with localhost URLs.
        const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
        const webhookBase = process.env.MP_WEBHOOK_URL; // explicit override (e.g. ngrok URL)
        const notificationUrl = webhookBase
            ? `${webhookBase}/api/payments/webhook`
            : isLocalhost ? undefined
            : `${baseUrl}/api/payments/webhook`;

        // Use raw fetch to get the full MP error response body (SDK swallows it)
        const body = {
            items: [{
                id:          bookingCode,
                title:       `Reserva Boaty - ${booking.boatId?.nombre || 'Embarcacion'}`,
                quantity:    1,
                unit_price:  amount,
                currency_id: 'COP',
            }],
            external_reference: bookingCode,
            back_urls: {
                success: `${baseUrl}/client-dashboard?payment=success&ref=${bookingCode}`,
                failure: `${baseUrl}/client-dashboard?payment=failure&ref=${bookingCode}`,
                pending: `${baseUrl}/client-dashboard?payment=pending&ref=${bookingCode}`,
            },
            // auto_return requires real public back_urls — omit when running on localhost
            ...(!isLocalhost && { auto_return: 'approved' }),
            ...(notificationUrl && { notification_url: notificationUrl }),
        };

        const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const result = await mpRes.json();
        console.log('[PAYMENTS] MP HTTP status:', mpRes.status);
        console.log('[PAYMENTS] MP response:', JSON.stringify(result, null, 2));

        if (!mpRes.ok) {
            return res.status(500).json({
                success: false,
                message: result.message || result.error || 'Error MP',
                mpStatus: mpRes.status,
                mpError: result,
            });
        }

        res.json({
            success:            true,
            init_point:         result.init_point,
            sandbox_init_point: result.sandbox_init_point,
        });
    } catch (error) {
        console.error('[PAYMENTS] Error inesperado:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/payments/webhook
 * MercadoPago sends a notification here when a payment status changes.
 * Verify with MP_WEBHOOK_SECRET if set.
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body)
                   : Buffer.isBuffer(req.body)    ? JSON.parse(req.body.toString())
                   : req.body;

        const { type, data } = body;

        // Verify MercadoPago webhook signature when secret is configured
        if (process.env.MP_WEBHOOK_SECRET) {
            const xSignature = req.headers['x-signature'];
            const xRequestId = req.headers['x-request-id'];
            if (xSignature) {
                const parts = {};
                xSignature.split(',').forEach(p => {
                    const [k, v] = p.trim().split('=');
                    parts[k] = v;
                });
                const manifest = `id:${data?.id};request-id:${xRequestId};ts:${parts.ts};`;
                const hmac = crypto.createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
                    .update(manifest).digest('hex');
                if (hmac !== parts.v1) {
                    console.warn('[PAYMENTS] Webhook signature mismatch — request rejected');
                    return res.status(401).json({ error: 'Invalid signature' });
                }
            }
        }

        console.log(`[PAYMENTS] Webhook MP: type=${type}, id=${data?.id}`);

        if (type === 'payment' && data?.id) {
            const paymentClient = new Payment(mp);
            const payment = await paymentClient.get({ id: data.id });

            const status    = payment.status;           // approved | rejected | pending
            const reference = payment.external_reference; // our bookingCode

            console.log(`[PAYMENTS] Pago ${data.id} => ${status} / ref: ${reference}`);

            if (status === 'approved' && reference) {
                await Booking.findOneAndUpdate(
                    { codigo: reference },
                    { estado: 'confirmada' },
                    { new: true }
                );
                console.log(`[PAYMENTS] Reserva ${reference} CONFIRMADA`);
            }
        }

        // Always respond 200 so MP doesn't retry
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('[PAYMENTS] Error en webhook:', error.message);
        res.status(500).json({ success: false });
    }
});

export default router;
