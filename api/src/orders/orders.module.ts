import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { Negotiation } from '../negotiations/entities/negotiation.entity';
import { Provider } from '../providers/entities/provider.entity';
import { User } from '../users/entities/user.entity';
import { PostsModule } from '../posts/posts.module';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehicleMileageLog } from '../vehicles/entities/vehicle-mileage-log.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { VehicleEventsModule } from '../vehicle-events/vehicle-events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Negotiation, Provider, Vehicle, VehicleMileageLog, User]),
    PostsModule,
    NotificationsModule,
    VehicleEventsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule { }
