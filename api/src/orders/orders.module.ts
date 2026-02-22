import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { Negotiation } from '../negotiations/entities/negotiation.entity';
import { Provider } from '../providers/entities/provider.entity';
import { PostsModule } from '../posts/posts.module';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Negotiation, Provider, Vehicle]),
    PostsModule,
    NotificationsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule { }
