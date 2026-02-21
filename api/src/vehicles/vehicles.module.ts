import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleBrand } from './entities/vehicle-brand.entity';
import { VehicleModel } from './entities/vehicle-model.entity';
import { VehicleType } from './entities/vehicle-type.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle, VehicleBrand, VehicleModel, VehicleType]) // <--- AGREGAR AQUÍ
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService] // Exportar por si Provider lo necesita
})
export class VehiclesModule { }