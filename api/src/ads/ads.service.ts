import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, IsNull, Or, MoreThanOrEqual, Repository } from 'typeorm';
import { NativeAd } from './entities/native-ad.entity';

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(NativeAd) private adsRepository: Repository<NativeAd>,
  ) {}

  findActive(): Promise<NativeAd[]> {
    const now = new Date();
    return this.adsRepository.find({
      where: {
        isActive: true,
        startDate: Or(IsNull(), LessThanOrEqual(now)),
        endDate: Or(IsNull(), MoreThanOrEqual(now)),
      },
      order: { createdAt: 'DESC' },
    });
  }
}
