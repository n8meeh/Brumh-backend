import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entities/review.entity';     // <--- 1. IMPORTAR
import { Order } from '../orders/entities/order.entity';     // <--- 1. IMPORTAR
import { Provider } from '../providers/entities/provider.entity'; // <--- 1. IMPORTAR
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Order, Provider, User]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule { }