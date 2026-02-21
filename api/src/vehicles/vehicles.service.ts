import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
// Asegúrate de que estos archivos existan en src/vehicles/entities/
import { VehicleBrand } from './entities/vehicle-brand.entity';
import { VehicleModel } from './entities/vehicle-model.entity';
import { VehicleType } from './entities/vehicle-type.entity';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle) private vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(VehicleBrand) private brandsRepository: Repository<VehicleBrand>,
    @InjectRepository(VehicleModel) private modelsRepository: Repository<VehicleModel>,
    @InjectRepository(VehicleType) private vehicleTypesRepo: Repository<VehicleType>,) { }

  async create(userId: number, createVehicleDto: CreateVehicleDto) {
    const newVehicle = this.vehiclesRepository.create({
      userId: userId,
      modelId: createVehicleDto.modelId,
      year: createVehicleDto.year,
      vin: createVehicleDto.vin,
      plate: createVehicleDto.plate,
      alias: createVehicleDto.alias,
      lastMileage: createVehicleDto.lastMileage || 0,
      photoUrl: createVehicleDto.photoUrl,
    });
    return await this.vehiclesRepository.save(newVehicle);
  }



  async findAllByUser(userId: number) {
    return this.vehiclesRepository.find({
      where: {
        userId: userId,
        deletedAt: IsNull()
      },
      relations: ['model', 'model.brand', 'model.type'],
      order: { id: 'DESC' }
    });
  }

  async findAllTypes() {
    return await this.vehicleTypesRepo.find({
      order: { name: 'ASC' } // Orden alfabético o por ID
    });
  }

  async findAllBrands(typeId?: number) {
    const queryBuilder = this.brandsRepository.createQueryBuilder('brand')
      .leftJoinAndSelect('brand.supportedTypes', 'types')
      .orderBy('brand.name', 'ASC');

    // Si se especifica un typeId, filtramos las marcas que soporten ese tipo
    if (typeId) {
      queryBuilder.where('types.id = :typeId', { typeId });
    }

    const brands = await queryBuilder.getMany();

    // Formateamos la respuesta para incluir supportedTypeIds como array de números
    return brands.map(brand => ({
      id: brand.id,
      name: brand.name,
      logoUrl: brand.logoUrl,
      supportedTypeIds: brand.supportedTypes?.map(type => type.id) || []
    }));
  }

  async findAllModels(brandId: number) {
    return this.modelsRepository.find({
      where: { brandId },
      order: { name: 'ASC' }
    });
  }

  async updateMileage(id: number, userId: number, mileage: number) {
    const vehicle = await this.vehiclesRepository.findOne({ where: { id } });

    if (!vehicle) throw new NotFoundException('Vehículo no encontrado');
    if (vehicle.userId !== userId) throw new ForbiddenException('No tienes permiso para editar este vehículo');

    // Validamos que el kilometraje nuevo no sea menor al anterior (opcional, pero lógico)
    if (mileage < vehicle.lastMileage) {
      throw new BadRequestException('El nuevo kilometraje no puede ser menor al actual');
    }

    vehicle.lastMileage = mileage;
    return await this.vehiclesRepository.save(vehicle);
  }

  findAll() { return `This action returns all vehicles`; }
  findOne(id: number) { return `This action returns a #${id} vehicle`; }

  // Editar Vehículo (Alias, Foto, Patente, Año)
  async update(id: number, userId: number, dto: UpdateVehicleDto) {
    // Buscamos el auto asegurando que pertenezca al usuario
    const vehicle = await this.vehiclesRepository.findOne({ where: { id, userId } });

    if (!vehicle) throw new NotFoundException('Vehículo no encontrado o no te pertenece');

    Object.assign(vehicle, dto);
    return await this.vehiclesRepository.save(vehicle);
  }

  // Eliminar Vehículo (Soft Delete)
  async remove(id: number, userId: number) {
    const vehicle = await this.vehiclesRepository.findOne({ where: { id, userId } });

    if (!vehicle) throw new NotFoundException('Vehículo no encontrado o no te pertenece');

    // Usamos softDelete gracias a @DeleteDateColumn que agregamos a la entidad
    await this.vehiclesRepository.softDelete(vehicle.id);

    return { message: 'Vehículo eliminado del garaje' };
  }
}