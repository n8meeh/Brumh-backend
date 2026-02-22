import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) { }

  /** Guarda una notificación en base de datos para que el usuario la vea en la App. */
  async createInApp(userId: number, title: string, body: string): Promise<void> {
    const notification = this.notificationRepo.create({ userId, title, body });
    await this.notificationRepo.save(notification);
  }

  // Función genérica para enviar Push
  async sendPushNotification(token: string, title: string, body: string, data?: any) {
    if (!token) return; // Si el usuario no tiene celular registrado, no hacemos nada

    try {
      await admin.messaging().send({
        token: token,
        notification: {
          title: title,
          body: body,
        },
        // Data sirve para que al tocar la notif, la App sepa a dónde ir (ej: ir a la orden 4)
        data: {
          click_action: 'FLUTTER_NOTIFICATION_CLICK', // O lo que use tu frontend
          ...data
        }
      });
      console.log(`🔔 Notificación enviada a: ${token.substring(0, 10)}...`);
    } catch (error) {
      console.error('Error enviando notificación:', error.message);
      // Aquí podrías borrar el token si Firebase dice que ya no es válido (opcional)
    }
  }
}