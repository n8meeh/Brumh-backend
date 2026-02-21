import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService {

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