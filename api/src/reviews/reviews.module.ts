import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entities/review.entity';     // <--- 1. IMPORTAR
import { Order } from '../orders/entities/order.entity';     // <--- 1. IMPORTAR
import { Provider } from '../providers/entities/provider.entity'; // <--- 1. IMPORTAR

@Module({
  imports: [
    // 👇👇👇 AGREGAR LAS 3 ENTIDADES AQUÍ 👇👇👇
    TypeOrmModule.forFeature([Review, Order, Provider]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule { }