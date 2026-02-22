import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { Provider } from './entities/provider.entity';
import { User } from '../users/entities/user.entity';
import { VehicleBrand } from '../vehicles/entities/vehicle-brand.entity';
// 👇 1. IMPORTA LA NUEVA ENTIDAD
import { ProviderService } from './entities/provider-service.entity';
import { VehicleType } from '../vehicles/entities/vehicle-type.entity'; // 👈 IMPORTAR
import { Category } from './entities/category.entity';
import { Specialty } from './entities/specialty.entity';
import { UsersModule } from '../users/users.module'; // 🆕 Para acceder a UsersService

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Provider,
      ProviderService,
      VehicleBrand,
      User,
      VehicleType,    // 👈 AGREGAR AQUÍ
      Category,       // 🆕 Sistema jerárquico
      Specialty       // 🆕 Sistema jerárquico
    ]),
    UsersModule // 🆕 Importar UsersModule para acceder a UsersService
  ],
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService] // Útil si otros módulos necesitan buscar proveedores
})
export class ProvidersModule { }