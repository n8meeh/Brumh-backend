import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleEvent } from './entities/vehicle-event.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { CreateVehicleEventDto } from './dto/create-vehicle-event.dto';

@Injectable()
export class VehicleEventsService {
    constructor(
        @InjectRepository(VehicleEvent)
        private readonly eventsRepo: Repository<VehicleEvent>,
        @InjectRepository(Vehicle)
        private readonly vehiclesRepo: Repository<Vehicle>,
    ) {}

    async create(userId: number, dto: CreateVehicleEventDto): Promise<VehicleEvent> {
        // Verify vehicle belongs to user
        const vehicle = await this.vehiclesRepo.findOne({ where: { id: dto.vehicleId } });
        if (!vehicle) {
            throw new NotFoundException('Vehículo no encontrado');
        }
        if (vehicle.userId !== userId) {
            throw new ForbiddenException('No tienes permiso para agregar eventos a este vehículo');
        }

        const event = this.eventsRepo.create({
            ...dto,
            userId,
        });

        return this.eventsRepo.save(event);
    }

    /**
     * Create event from a completed order (system-initiated).
     * No ownership check since it's triggered by the system.
     */
    async createFromOrder(params: {
        vehicleId: number;
        userId: number;
        orderId: number;
        title: string;
        description?: string;
        cost?: number;
        mileage?: number;
        type?: string;
    }): Promise<VehicleEvent> {
        const event = this.eventsRepo.create({
            vehicleId: params.vehicleId,
            userId: params.userId,
            orderId: params.orderId,
            type: params.type || 'repair',
            title: params.title,
            description: params.description,
            cost: params.cost,
            mileage: params.mileage,
        });

        return this.eventsRepo.save(event);
    }

    async findByVehicle(vehicleId: number, userId: number): Promise<VehicleEvent[]> {
        // Verify vehicle belongs to user
        const vehicle = await this.vehiclesRepo.findOne({ where: { id: vehicleId } });
        if (!vehicle) {
            throw new NotFoundException('Vehículo no encontrado');
        }
        if (vehicle.userId !== userId) {
            throw new ForbiddenException('No tienes permiso para ver los eventos de este vehículo');
        }

        return this.eventsRepo.find({
            where: { vehicleId },
            order: { createdAt: 'DESC' },
            relations: ['order'],
        });
    }

    async remove(id: number, userId: number): Promise<void> {
        const event = await this.eventsRepo.findOne({ where: { id } });
        if (!event) {
            throw new NotFoundException('Evento no encontrado');
        }
        if (event.userId !== userId) {
            throw new ForbiddenException('No tienes permiso para eliminar este evento');
        }
        await this.eventsRepo.delete(id);
    }
}
