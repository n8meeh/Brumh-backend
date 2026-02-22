import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';
import { NativeAd } from './entities/native-ad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NativeAd])],
  controllers: [AdsController],
  providers: [AdsService],
})
export class AdsModule {}
