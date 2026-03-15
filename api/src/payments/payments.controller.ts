import {
  Body,
  Controller,
  Post,
  Query,
  HttpCode,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * POST /payments/create-preference
   * Crea una preferencia de Mercado Pago para el pago Premium.
   * Requiere autenticación JWT — solo providers pueden pagar.
   */
  @Post('create-preference')
  @UseGuards(AuthGuard('jwt'))
  async createPreference(@Request() req: any) {
    const user = req.user;

    // Validar que el usuario tenga rol de provider (o provider_admin)
    if (!['provider', 'provider_admin'].includes(user.role)) {
      throw new ForbiddenException(
        'Solo los proveedores pueden activar Premium.',
      );
    }

    // Obtener el providerId:
    // 1. Si user.providerId existe en el JWT (viene de users.provider_id), usarlo directo
    // 2. Si es 'provider' (dueño): buscar en providers por userId
    let providerId: number | null = user.providerId || null;

    if (!providerId && user.role === 'provider') {
      // El dueño del negocio: buscar el provider asociado a su userId
      providerId = await this.paymentsService.getProviderIdByUserId(
        user.userId || user.id,
      );
    }

    if (!providerId) {
      throw new ForbiddenException(
        'No se encontró un negocio asociado a tu cuenta.',
      );
    }

    return this.paymentsService.createPreference(providerId);
  }

  /**
   * POST /payments/webhook
   * Recibe notificaciones de Mercado Pago (IPN).
   * NO requiere autenticación — Mercado Pago lo llama directamente.
   */
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Body() body: any,
    @Query('id') queryId?: string,
    @Query('topic') topic?: string,
  ) {
    // Mercado Pago puede enviar notificaciones en dos formatos:
    // 1. IPN v2 (JSON body con type y data.id)
    // 2. IPN legacy (query params: ?id=xxx&topic=payment)

    if (body?.type && body?.data?.id) {
      // Formato moderno (v2)
      return this.paymentsService.handleWebhook(body);
    }

    if (topic === 'payment' && queryId) {
      // Formato legacy — convertir a formato v2
      return this.paymentsService.handleWebhook({
        type: 'payment',
        data: { id: queryId },
      });
    }

    // Otro tipo de notificación
    return { received: true };
  }
}
