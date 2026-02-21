import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { Negotiation } from '../negotiations/entities/negotiation.entity';
import { Provider } from '../providers/entities/provider.entity';
import { PostsModule } from '../posts/posts.module';
// 👇 1. IMPORTA LA ENTIDAD VEHICLE
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { ProviderTeam } from '../providers/entities/provider-team.entity';

@Module({
  imports: [
    // 👇 2. AGREGA "Vehicle" A ESTA LISTA
    TypeOrmModule.forFeature([Order, Negotiation, Provider, Vehicle, ProviderTeam]),
    PostsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule { }