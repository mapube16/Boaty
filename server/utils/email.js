const MAILERSEND_URL = 'https://api.mailersend.com/v1/email';

const buildInviteHtml = ({ inviteLink, providerName }) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f4f7fa;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); padding:32px 40px; text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:1px;">
                ⛵ BOATY
              </h1>
              <p style="margin:8px 0 0;color:#94a3b8;font-size:14px;">
                Plataforma de alquiler de embarcaciones
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;font-weight:600;">
                ¡Tu solicitud ha sido aprobada!
              </h2>
              <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
                Hola${providerName ? ` <strong>${providerName}</strong>` : ''},
              </p>
              <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.6;">
                Nos complace informarte que tu solicitud como proveedor en <strong>BOATY</strong> ha sido
                revisada y <span style="color:#059669;font-weight:600;">aprobada</span>. Ya puedes completar
                tu registro y comenzar a publicar tus embarcaciones.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="${inviteLink}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#0284c7);color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:14px 40px;border-radius:8px;letter-spacing:0.5px;">
                      Completar mi registro
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;color:#64748b;font-size:13px;line-height:1.5;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:0 0 24px;word-break:break-all;">
                <a href="${inviteLink}" style="color:#0284c7;font-size:13px;text-decoration:underline;">${inviteLink}</a>
              </p>

              <div style="border-top:1px solid #e2e8f0;padding-top:20px;margin-top:8px;">
                <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">
                  ⏳ Este enlace expira en <strong>7 días</strong>. Si no solicitaste esto, ignora este correo.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;">
                © ${new Date().getFullYear()} BOATY. Todos los derechos reservados.
              </p>
              <p style="margin:0;color:#cbd5e1;font-size:11px;">
                Este es un correo automático, por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const buildInviteText = ({ inviteLink, providerName }) =>
  `Hola${providerName ? ` ${providerName}` : ''}!\n\n` +
  `Tu solicitud como proveedor en BOATY ha sido aprobada.\n\n` +
  `Completa tu registro aqui: ${inviteLink}\n\n` +
  `Este enlace expira en 7 dias.\n\n` +
  `— Equipo BOATY`;

export const sendInviteEmail = async ({ to, from, inviteLink, providerName }) => {
  if (!process.env.MAILERSEND_API_KEY) {
    throw new Error('MAILERSEND_API_KEY no esta configurada');
  }

  const response = await fetch(MAILERSEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: { email: from, name: 'BOATY' },
      to: [{ email: to, name: providerName || '' }],
      subject: '⛵ Tu solicitud en BOATY ha sido aprobada',
      text: buildInviteText({ inviteLink, providerName }),
      html: buildInviteHtml({ inviteLink, providerName }),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`MailerSend fallo: ${response.status} ${body}`);
  }
};
export const sendResetPasswordEmail = async ({ to, from, resetLink }) => {
  if (!process.env.MAILERSEND_API_KEY) throw new Error('MAILERSEND_API_KEY no esta configurada');

  const html = `
    <div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:40px; border:1px solid #e2e8f0; border-radius:12px;">
      <h1 style="color:#0f172a; font-size:24px;">Restablecer contraseña ⛵</h1>
      <p style="color:#64748b; line-height:1.6;">Recibimos una solicitud para restablecer tu contraseña en BOATY. Haz clic en el siguiente botón para continuar:</p>
      <div style="text-align:center; padding:32px 0;">
        <a href="${resetLink}" style="background:#0ea5e9; color:white; padding:12px 32px; text-decoration:none; border-radius:8px; font-weight:600;">Restablecer Contraseña</a>
      </div>
      <p style="color:#94a3b8; font-size:12px;">Este enlace expira en 1 hora. Si no solicitaste esto, puedes ignorar este correo de forma segura.</p>
    </div>`;

  await fetch(MAILERSEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: { email: from, name: 'BOATY' },
      to: [{ email: to }],
      subject: 'Restablece tu contraseña en BOATY',
      text: `Restablece tu contraseña aqui: ${resetLink}`,
      html: html,
    }),
  });
};

// ── Booking notifications ────────────────────────────────────────────────────

const buildBookingDetailsHtml = (booking, boatName) => {
    const date = new Date(booking.fecha).toLocaleDateString('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    return `
      <div style="background:#f8fafc;border-radius:10px;padding:20px;margin:20px 0;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#334155;">
          <tr><td style="padding:6px 0;font-weight:600;width:140px;">Codigo:</td><td>${booking.codigo}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;">Embarcacion:</td><td>${boatName || 'N/A'}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;">Fecha:</td><td>${date}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;">Hora:</td><td>${booking.horaInicio}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;">Pasajeros:</td><td>${booking.pasajeros}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;">Destino:</td><td>${booking.destino || 'Por confirmar'}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;">Tipo de viaje:</td><td>${booking.tipoViaje || 'N/A'}</td></tr>
          ${booking.notas ? `<tr><td style="padding:6px 0;font-weight:600;">Notas:</td><td>${booking.notas}</td></tr>` : ''}
        </table>
      </div>`;
};

const bookingEmailWrapper = (title, bodyContent) => `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f4f7fa;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa;padding:40px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0"
             style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:1px;">BOATY</h1>
            <p style="margin:8px 0 0;color:#94a3b8;font-size:14px;">Plataforma de alquiler de embarcaciones</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;font-weight:600;">${title}</h2>
            ${bodyContent}
          </td>
        </tr>
        <tr>
          <td style="background-color:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">© ${new Date().getFullYear()} BOATY — Este es un correo automatico.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

async function sendMail(to, subject, html, text) {
    if (!process.env.MAILERSEND_API_KEY) return;
    const from = process.env.MAILERSEND_FROM;
    await fetch(MAILERSEND_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}`,
        },
        body: JSON.stringify({
            from: { email: from, name: 'BOATY' },
            to: [{ email: to }],
            subject,
            text: text || subject,
            html,
        }),
    });
}

/**
 * Send booking-created notification to the CLIENT.
 */
export const sendBookingCreatedClient = async ({ to, booking, boatName }) => {
    const html = bookingEmailWrapper(
        'Tu reserva ha sido recibida',
        `<p style="color:#334155;font-size:15px;line-height:1.6;">
          Hola <strong>${booking.clienteNombre}</strong>, hemos registrado tu solicitud de reserva.
          En breve el equipo la confirmara.
        </p>
        ${buildBookingDetailsHtml(booking, boatName)}
        <p style="color:#64748b;font-size:13px;">Estado actual: <strong style="color:#d97706;">PENDIENTE</strong></p>`
    );
    await sendMail(to, 'Tu reserva en BOATY fue recibida', html,
        `Hola ${booking.clienteNombre}, tu reserva ${booking.codigo} fue registrada.`);
};

/**
 * Send booking-created notification to STAFF / OPERATOR / PROVIDER.
 */
export const sendBookingCreatedInternal = async ({ to, recipientName, booking, boatName }) => {
    const html = bookingEmailWrapper(
        'Nueva reserva recibida',
        `<p style="color:#334155;font-size:15px;line-height:1.6;">
          Hola <strong>${recipientName}</strong>, se ha registrado una nueva reserva en el sistema.
        </p>
        <div style="background:#f8fafc;border-radius:10px;padding:20px;margin:20px 0;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#334155;">
            <tr><td style="padding:6px 0;font-weight:600;width:140px;">Codigo:</td><td>${booking.codigo}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600;">Cliente:</td><td>${booking.clienteNombre}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600;">Email cliente:</td><td>${booking.clienteEmail}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600;">Tel cliente:</td><td>${booking.clienteTelefono || 'N/A'}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600;">Embarcacion:</td><td>${boatName || 'N/A'}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600;">Fecha:</td><td>${new Date(booking.fecha).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600;">Hora:</td><td>${booking.horaInicio}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600;">Pasajeros:</td><td>${booking.pasajeros}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600;">Destino:</td><td>${booking.destino || 'Por confirmar'}</td></tr>
          </table>
        </div>
        <p style="color:#64748b;font-size:13px;">Ingresa al panel para gestionar esta reserva.</p>`
    );
    await sendMail(to, `BOATY — Nueva reserva ${booking.codigo}`, html,
        `Nueva reserva ${booking.codigo} de ${booking.clienteNombre}.`);
};

/**
 * Send booking status-change notification.
 */
export const sendBookingStatusChanged = async ({ to, recipientName, booking, boatName, isClient }) => {
    const estadoMap = {
        confirmada: { label: 'CONFIRMADA', color: '#0284c7' },
        'en-curso': { label: 'EN CURSO', color: '#059669' },
        completada: { label: 'COMPLETADA', color: '#475569' },
        cancelada: { label: 'CANCELADA', color: '#dc2626' },
        pendiente: { label: 'PENDIENTE', color: '#d97706' },
    };
    const { label, color } = estadoMap[booking.estado] || { label: booking.estado.toUpperCase(), color: '#334155' };

    const body = isClient
        ? `<p style="color:#334155;font-size:15px;line-height:1.6;">
            Hola <strong>${recipientName}</strong>, el estado de tu reserva ha cambiado.
           </p>
           ${buildBookingDetailsHtml(booking, boatName)}
           <p style="color:#64748b;font-size:15px;">Nuevo estado: <strong style="color:${color};">${label}</strong></p>`
        : `<p style="color:#334155;font-size:15px;line-height:1.6;">
            Hola <strong>${recipientName}</strong>, el estado de la reserva <strong>${booking.codigo}</strong> cambio a
            <strong style="color:${color};">${label}</strong>.
           </p>
           ${buildBookingDetailsHtml(booking, boatName)}`;

    const html = bookingEmailWrapper(`Reserva ${booking.codigo} — ${label}`, body);
    await sendMail(to, `BOATY — Reserva ${booking.codigo}: ${label}`, html,
        `La reserva ${booking.codigo} de ${booking.clienteNombre} cambio a ${label}.`);
};

export const sendTimingEmail = async ({ to, from, booking, messageType }) => {
  if (!process.env.MAILERSEND_API_KEY) return;

  const subjects = {
    'inicia-pronto': '⛵ ¡Tu viaje inicia pronto!',
    'atrasado': '⛵ Importante: Tu viaje ya debió iniciar',
    'confirmacion': '⛵ Confirmación de tu reserva en BOATY',
    'completado': '⛵ ¡Gracias por navegar con BOATY!',
  };

  const html = `
    <div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:40px; border:1px solid #e2e8f0; border-radius:12px;">
      <h1 style="color:#0f172a; font-size:24px;">Hola ${booking.clienteNombre} 👋</h1>
      <p style="color:#64748b; line-height:1.6;">${subjects[messageType]}</p>
      <div style="background:#f8fafc; padding:20px; border-radius:12px; margin:24px 0;">
        <p style="margin:5px 0;"><strong>Código:</strong> ${booking.codigo}</p>
        <p style="margin:5px 0;"><strong>Fecha:</strong> ${new Date(booking.fecha).toLocaleDateString()}</p>
        <p style="margin:5px 0;"><strong>Hora:</strong> ${booking.horaInicio}</p>
      </div>
      <p style="color:#64748b; line-height:1.6;">Si tienes dudas, contáctanos vía WhatsApp.</p>
    </div>`;

  await fetch(MAILERSEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: { email: from, name: 'BOATY' },
      to: [{ email: to }],
      subject: subjects[messageType] || 'Notificación de BOATY',
      html: html,
    }),
  });
};
