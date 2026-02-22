import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { Provider } from '../providers/entities/provider.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription) private subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(Provider) private providersRepository: Repository<Provider>,
  ) {}

  async getMySubscription(userId: number) {
    const provider = await this.providersRepository.findOne({ where: { userId } });
    if (!provider) return null;

    return this.subscriptionsRepository.findOne({
      where: { providerId: provider.id },
      order: { createdAt: 'DESC' },
    });
  }

  async activateTrial(userId: number) {
    // 1. Verificar que sea proveedor
    const provider = await this.providersRepository.findOne({ where: { userId } });
    if (!provider) {
      throw new BadRequestException('Solo los proveedores pueden activar el período de prueba');
    }

    // 2. Verificar que no haya tenido trial/premium antes
    const existingSub = await this.subscriptionsRepository.findOne({
      where: { providerId: provider.id },
    });
    if (existingSub) {
      throw new ConflictException('Ya has usado tu período de prueba gratuito o tienes una suscripción activa');
    }

    // 3. Crear suscripción trial de 30 días
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const subscription = this.subscriptionsRepository.create({
      providerId: provider.id,
      plan: 'trial',
      status: 'active',
      startDate,
      endDate,
      paymentPlatform: 'simulated',
      externalReference: `trial_${provider.id}_${Date.now()}`,
    });

    const saved = await this.subscriptionsRepository.save(subscription);

    // 4. Activar is_premium en el proveedor
    provider.isPremium = true;
    await this.providersRepository.save(provider);

    return {
      message: '¡Tu mes gratis Premium ha sido activado! Disfruta de propuestas ilimitadas y más.',
      subscription: saved,
      isPremium: true,
      expiresAt: endDate.toISOString(),
    };
  }
}
