import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserBlock } from './entities/user-block.entity';
import { UserFollow } from './entities/user-follow.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Post } from '../posts/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserBlock, UserFollow, Vehicle, Post])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exportamos para usarlo en Auth luego
})
export class UsersModule { }