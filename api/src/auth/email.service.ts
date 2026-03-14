import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend | null = null;
  private readonly logger = new Logger(EmailService.name);
  private readonly from = 'Brumh <seguridad@brumh.cl>';

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY no está configurada. Los correos no se enviarán.',
      );
    } else {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend inicializado correctamente.');
    }
  }

  async sendPasswordResetEmail(to: string, code: string): Promise<void> {
    const year = new Date().getFullYear();

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu código de verificación - Brumh</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;">

          <!-- ══════ HEADER + LOGO TEXTO ══════ -->
          <tr>
            <td style="background:linear-gradient(145deg,#0f172a 0%,#1e293b 100%);padding:40px 40px 32px;text-align:center;">
              <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:2px;line-height:1;">
                <span style="color:#ffffff;">bru</span><span style="color:#2563eb;">m</span><span style="color:#ffffff;">h</span>
              </p>
              <p style="margin:10px 0 0;color:#64748b;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:500;">
                Tu comunidad automotriz
              </p>
            </td>
          </tr>

          <!-- ══════ CUERPO ══════ -->
          <tr>
            <td style="padding:36px 40px 16px;">
              <h2 style="margin:0 0 10px;color:#0f172a;font-size:22px;font-weight:700;text-align:center;">
                Tu código de verificación
              </h2>
              <p style="margin:0;color:#475569;font-size:14px;line-height:1.7;text-align:center;">
                Ingresa este código en la app de Brumh para restablecer tu contraseña. No lo compartas con nadie.
              </p>
            </td>
          </tr>

          <!-- ══════ CÓDIGO ══════ -->
          <tr>
            <td align="center" style="padding:20px 40px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;width:100%;">
                <tr>
                  <td style="padding:20px 24px;text-align:center;">
                    <p style="margin:0 0 8px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">
                      Tu código
                    </p>
                    <p style="margin:0;color:#2563eb;font-size:40px;font-weight:800;letter-spacing:12px;font-family:'Courier New',Courier,monospace;line-height:1;">
                      ${code}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════ AVISO ══════ -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fffbeb;border-left:4px solid #f59e0b;border-radius:8px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0;color:#92400e;font-size:13px;line-height:1.6;">
                      ⏱ Este código expira en <strong>1 hora</strong>. Si no solicitaste este cambio, ignora este correo.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════ SEPARADOR ══════ -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0;">
            </td>
          </tr>

          <!-- ══════ FOOTER ══════ -->
          <tr>
            <td style="padding:24px 40px 28px;text-align:center;">
              <p style="margin:0 0 4px;color:#94a3b8;font-size:11px;">
                © ${year} Brumh · Todos los derechos reservados
              </p>
              <p style="margin:0;color:#cbd5e1;font-size:10px;">
                Correo automático — no respondas a este mensaje
              </p>
            </td>
          </tr>

        </table>

        <!-- Texto fuera de tarjeta -->
        <table role="presentation" width="520" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:16px 40px 0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:10px;line-height:1.5;">
                Recibiste este correo porque alguien solicitó restablecer la contraseña de tu cuenta en Brumh.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

    if (!this.resend) {
      this.logger.warn(`No se puede enviar correo a ${to}: RESEND_API_KEY no configurada.`);
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to: [to],
        subject: `${code} — Código de verificación Brumh`,
        html,
      });

      if (error) {
        this.logger.error(`Error al enviar email a ${to}: ${JSON.stringify(error)}`);
        throw new Error(`Error al enviar el correo: ${error.message}`);
      }

      this.logger.log(`Correo con código enviado a ${to} (ID: ${data?.id})`);
    } catch (err) {
      this.logger.error(`Fallo al enviar correo a ${to}: ${err.message}`);
      throw err;
    }
  }
}
