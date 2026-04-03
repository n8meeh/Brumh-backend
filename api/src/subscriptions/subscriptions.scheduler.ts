import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionsService } from './subscriptions.service';

@Injectable()
export class SubscriptionsScheduler {
  private readonly logger = new Logger(SubscriptionsScheduler.name);

  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * Se ejecuta todos los días a las 03:00 AM.
   * Expira automáticamente las suscripciones cuya fecha de fin ya pasó
   * y desactiva isPremium en el proveedor.
   */
  @Cron('0 3 * * *', { timeZone: 'America/Santiago' })
  async handleExpiredSubscriptions() {
    this.logger.log('⏰ Iniciando revisión de suscripciones expiradas...');
    try {
      const count = await this.subscriptionsService.expireSubscriptions();
      this.logger.log(`✅ Revisión completada. Suscripciones expiradas: ${count}`);
    } catch (error) {
      this.logger.error('❌ Error en tarea de expiración de suscripciones:', error);
    }
  }
}
