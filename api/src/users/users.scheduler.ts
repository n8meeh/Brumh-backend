import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from './users.service';

@Injectable()
export class UsersScheduler {
  private readonly logger = new Logger(UsersScheduler.name);

  constructor(private readonly usersService: UsersService) {}

  /**
   * Se ejecuta todos los días a las 02:00 AM.
   * Oculta automáticamente a los proveedores que no han iniciado sesión
   * en los últimos 14 días para mantener el mapa limpio.
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleInactiveProviders() {
    this.logger.log('⏰ Iniciando revisión de proveedores inactivos...');
    try {
      const count = await this.usersService.hideInactiveProviders();
      this.logger.log(`✅ Revisión completada. Proveedores ocultados: ${count}`);
    } catch (error) {
      this.logger.error('❌ Error en tarea de proveedores inactivos:', error);
    }
  }
}
