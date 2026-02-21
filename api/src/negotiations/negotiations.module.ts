import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NegotiationsService } from './negotiations.service';
import { NegotiationsController } from './negotiations.controller';
import { Negotiation } from './entities/negotiation.entity';
import { Order } from '../orders/entities/order.entity'; // <--- IMPORTAR
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Negotiation, Order]), NotificationsModule], // <--- REGISTRAR
  controllers: [NegotiationsController],
  providers: [NegotiationsService],
  exports: [NegotiationsService] // (Ya lo tenías exportado para orders)
})
export class NegotiationsModule { }