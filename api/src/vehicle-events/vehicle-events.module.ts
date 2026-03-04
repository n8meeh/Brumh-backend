import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleEvent } from './entities/vehicle-event.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehicleEventsService } from './vehicle-events.service';
import { VehicleEventsController } from './vehicle-events.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([VehicleEvent, Vehicle]),
    ],
    controllers: [VehicleEventsController],
    providers: [VehicleEventsService],
    exports: [VehicleEventsService],
})
export class VehicleEventsModule {}
