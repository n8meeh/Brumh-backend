import { Controller } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  // HE BORRADO TODOS LOS MÉTODOS CRUD (create, findAll, etc.)
  // PORQUE NO LOS NECESITAMOS Y CAUSAN ERROR.
}