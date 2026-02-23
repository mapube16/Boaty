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
