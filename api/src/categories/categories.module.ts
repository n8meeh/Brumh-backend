import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from '../providers/entities/category.entity';
import { Specialty } from '../providers/entities/specialty.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Specialty
    ])
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService]
})
export class CategoriesModule { }

