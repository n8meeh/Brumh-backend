import { Injectable, Logger } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

@Injectable()
export class SubscriptionsScheduler {
  private readonly logger = new Logger(SubscriptionsScheduler.name);

  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // El cron de expiración está deshabilitado: todos los negocios tienen premium permanente.
  // async handleExpiredSubscriptions() { ... }
}
