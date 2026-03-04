import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { ProviderService } from './entities/provider-service.entity';
import { CreateProviderServiceDto } from './dto/create-service.dto';
import { VehicleBrand } from '../vehicles/entities/vehicle-brand.entity';
import { UpdateBrandsDto } from './dto/update-brands.dto';
import { User } from '../users/entities/user.entity';
import { UpdateProviderServiceDto } from './dto/update-provider-service.dto';
import { VehicleType } from '../vehicles/entities/vehicle-type.entity';
import { UpdateSpecialtiesDto } from './dto/update-specialties.dto';
import { Specialty } from './entities/specialty.entity';
import { UsersService } from '../users/users.service';
import { MetricsService } from './metrics.service';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider) private providersRepository: Repository<Provider>,
    @InjectRepository(ProviderService) private providerServicesRepo: Repository<ProviderService>,
    @InjectRepository(VehicleBrand) private brandsRepo: Repository<VehicleBrand>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(VehicleType) private vehicleTypesRepo: Repository<VehicleType>,
    @InjectRepository(Specialty) private specialtiesRepo: Repository<Specialty>,
    private usersService: UsersService,
    private metricsService: MetricsService,
  ) { }

  // --- GESTIÓN DE TIPOS DE VEHÍCULO ---
  async updateVehicleTypes(userId: number, typeIds: number[]) {
    const found = await this.findOneByUserId(userId);
    if (!found) throw new BadRequestException('No eres un proveedor');

    // Recargar con la relación específica necesaria
    const provider = await this.providersRepository.findOne({
      where: { id: found.id },
      relations: ['vehicleTypes']
    });
    if (!provider) throw new NotFoundException('Proveedor no encontrado');

    // Si el array está vacío, borramos todas las relaciones
    if (typeIds.length === 0) {
      provider.vehicleTypes = [];
      return await this.providersRepository.save(provider);
    }

    // Validar que todos los IDs existan
    const types = await this.vehicleTypesRepo.findBy({
      id: In(typeIds)
    });

    if (types.length !== typeIds.length) {
      throw new BadRequestException('Alguno de los tipos de vehículo enviados no existe');
    }

    // Sync: Reemplazar la lista actual con la nueva
    provider.vehicleTypes = types;
    return await this.providersRepository.save(provider);
  }

  // --- TALLER ---
  async update(userId: number, dto: UpdateProviderDto) {
    const provider = await this.findOneByUserId(userId);
    if (!provider) throw new BadRequestException('No eres un proveedor');

    // Actualizamos todos los campos del DTO (incluyendo secondaryCategories)
    // TypeORM convierte automáticamente el array a JSON al guardar
    Object.assign(provider, dto);

    const savedProvider = await this.providersRepository.save(provider);

    // 🧹 LIMPIEZA: Quitamos el usuario de la respuesta
    // Usamos (savedProvider as any) para evitar el error TS2790
    if (savedProvider.user) {
      delete (savedProvider as any).user;
    }

    return savedProvider;
  }

  async deleteProvider(userId: number) {
    const provider = await this.findOneByUserId(userId);
    if (!provider) throw new BadRequestException('No eres un proveedor');

    // 1. Lo ocultamos del mapa
    await this.providersRepository.update(provider.id, { isVisible: false });

    // 2. Ejecutamos el Soft Delete (Sin tocar el rol del usuario)
    await this.providersRepository.softDelete(provider.id);

    return { message: 'Taller cerrado correctamente. Historial preservado.' };
  }

  async updateSpecialtyBrands(userId: number, dto: UpdateBrandsDto) {
    const found = await this.findOneByUserId(userId);
    if (!found) throw new BadRequestException('No eres un proveedor');

    const provider = await this.providersRepository.findOne({
      where: { id: found.id },
      relations: ['specialtyBrands']
    });
    if (!provider) throw new NotFoundException('Proveedor no encontrado');

    // Si el array está vacío, borramos todas las relaciones y marcamos como multimarca
    if (dto.brandIds.length === 0) {
      provider.specialtyBrands = [];
      provider.isMultibrand = true; // Sin marcas específicas = multimarca
      return await this.providersRepository.save(provider);
    }

    // Validar que todas las marcas existan
    const newBrands = await this.brandsRepo.findBy({
      id: In(dto.brandIds)
    });

    if (newBrands.length !== dto.brandIds.length) {
      throw new BadRequestException('Alguna de las marcas enviadas no existe');
    }

    // Sync: Reemplazar la lista actual con la nueva
    provider.specialtyBrands = newBrands;
    provider.isMultibrand = false; // Tiene marcas específicas = NO multimarca

    return await this.providersRepository.save(provider);
  }

  // 🆕 Actualizar todas las especialidades en un solo endpoint
  async updateSpecialties(userId: number, dto: UpdateSpecialtiesDto) {
    const found = await this.findOneByUserId(userId);
    if (!found) throw new BadRequestException('No eres un proveedor');

    const provider = await this.providersRepository.findOne({
      where: { id: found.id },
      relations: ['specialtyBrands', 'vehicleTypes', 'specialties']
    });
    if (!provider) throw new NotFoundException('Proveedor no encontrado');

    // 🆕 SISTEMA JERÁRQUICO: Actualizar especialidades
    if (dto.specialtyIds !== undefined) {
      if (dto.specialtyIds.length === 0) {
        // Remover todas las especialidades
        provider.specialties = [];
      } else {
        // Validar que todas las especialidades existan
        const specialties = await this.specialtiesRepo.findBy({
          id: In(dto.specialtyIds)
        });

        if (specialties.length !== dto.specialtyIds.length) {
          throw new BadRequestException('Alguna de las especialidades enviadas no existe');
        }

        // Sincronizar: Reemplazar la lista actual con la nueva
        provider.specialties = specialties;
      }
    }

    // 🎨 MULTIMARCA: Manejar lógica de multimarca
    if (dto.isMultibrand !== undefined) {
      if (dto.isMultibrand === true) {
        // Si es multimarca, eliminar todas las marcas específicas
        provider.specialtyBrands = [];
        provider.isMultibrand = true;
      } else {
        // Si NO es multimarca, debe proporcionar marcas específicas
        provider.isMultibrand = false;

        // Solo actualizar marcas si se proporcionaron brandIds
        if (dto.brandIds !== undefined) {
          if (dto.brandIds.length === 0) {
            throw new BadRequestException('Debes especificar al menos una marca si no eres multimarca');
          }

          const brands = await this.brandsRepo.findBy({
            id: In(dto.brandIds)
          });

          if (brands.length !== dto.brandIds.length) {
            throw new BadRequestException('Alguna de las marcas enviadas no existe');
          }

          provider.specialtyBrands = brands;
        }
      }
    } else if (dto.brandIds !== undefined) {
      // 🔧 LEGACY: Si no se especificó isMultibrand pero sí brandIds
      // Mantener compatibilidad con la lógica anterior
      const brands = await this.brandsRepo.findBy({
        id: In(dto.brandIds)
      });

      if (brands.length !== dto.brandIds.length) {
        throw new BadRequestException('Alguna de las marcas enviadas no existe');
      }

      provider.specialtyBrands = brands;
      if (brands.length > 0) provider.isMultibrand = false;
    }

    // 🚗 LEGACY: Actualizar tipos de vehículos
    if (dto.vehicleTypeIds !== undefined) {
      const types = await this.vehicleTypesRepo.findBy({
        id: In(dto.vehicleTypeIds)
      });

      if (types.length !== dto.vehicleTypeIds.length) {
        throw new BadRequestException('Alguno de los tipos de vehículo no existe');
      }

      provider.vehicleTypes = types;
    }

    return await this.providersRepository.save(provider);
  }

  async create(userId: number, createProviderDto: CreateProviderDto) {
    let savedProvider: Provider;

    // 🆕 ASEGURAR CATEGORÍA POR DEFECTO: Si no se proporciona, usar 'other'
    const providerData = {
      ...createProviderDto,
      category: createProviderDto.category || 'other', // Defecto a 'other' si es undefined
    };

    // 1. Buscamos si ya existe (incluso si está borrado "soft-delete")
    const existingProvider = await this.providersRepository.findOne({
      where: { userId },
      withDeleted: true,
    });

    if (existingProvider) {
      // SI YA EXISTE (Activo o Borrado):

      // A) Restauramos (quita la fecha de borrado si la tenía)
      if (existingProvider.deletedAt) {
        await this.providersRepository.restore(existingProvider.id);
        existingProvider.deletedAt = null; // Actualizamos en memoria
      }

      // B) Aseguramos que sea visible
      existingProvider.isVisible = true;

      // C) Actualizamos los datos viejos con los nuevos (con categoría garantizada)
      const providerToUpdate = this.providersRepository.merge(existingProvider, providerData);

      // D) Guardamos los cambios
      savedProvider = await this.providersRepository.save(providerToUpdate);
    } else {
      // 2. SI NO EXISTE: Creamos uno nuevo desde cero (con categoría garantizada)
      const newProvider = this.providersRepository.create({
        ...providerData,
        userId: userId,
        isVisible: true,
      });

      savedProvider = await this.providersRepository.save(newProvider);
    }

    // 🆕 LÓGICA DE ASCENSO: Actualizar rol del usuario a 'provider'
    await this.usersService.updateRole(userId, 'provider');

    // 🧹 LIMPIEZA: Quitamos el usuario de la respuesta para seguridad
    // Usamos (savedProvider as any) para evitar el error TS2790
    if (savedProvider.user) {
      delete (savedProvider as any).user;
    }

    return savedProvider;
  }

  findAll() {
    return this.providersRepository
      .createQueryBuilder('provider')
      .innerJoin('provider.user', 'user')
      .where('user.isVisible = :visible', { visible: true })
      .andWhere('user.deletedAt IS NULL')
      .getMany();
  }

  async findOne(id: number) {
    const provider = await this.providersRepository
      .createQueryBuilder('provider')
      .leftJoinAndSelect('provider.user', 'user')
      .leftJoinAndSelect('provider.services', 'services')
      .leftJoinAndSelect('services.vehicleType', 'vehicleType')
      .leftJoinAndSelect('provider.specialtyBrands', 'specialtyBrands')
      .leftJoinAndSelect('provider.vehicleTypes', 'vehicleTypes')
      .leftJoinAndSelect('provider.specialties', 'specialties')
      .leftJoinAndSelect('specialties.category', 'category')
      .loadRelationCountAndMap('provider.reviewsCount', 'provider.reviews')
      .where('provider.id = :id', { id })
      .getOne();

    return provider;
  }

  async findOneByUserId(userId: number) {
    if (!userId) return null;

    // 1. Buscar como dueño directo
    let provider = await this.providersRepository.findOne({
      where: { userId },
      relations: [
        'user',
        'services',
        'services.vehicleType',
        'specialtyBrands',
        'vehicleTypes',
        'specialties',
        'specialties.category'
      ],
      order: {
        services: {
          id: 'DESC'
        },
      }
    });

    // 2. Si no es dueño, buscar como staff
    if (!provider) {
      const user = await this.usersRepo.findOne({ where: { id: userId } });
      if (user?.providerId) {
        provider = await this.providersRepository.findOne({
          where: { id: user.providerId },
          relations: [
            'user',
            'services',
            'services.vehicleType',
            'specialtyBrands',
            'vehicleTypes',
            'specialties',
            'specialties.category'
          ],
          order: {
            services: {
              id: 'DESC'
            },
          }
        });
      }
    }

    return provider || null;
  }

  /**
   * Resuelve el provider para un usuario (dueño o staff), versión ligera.
   */
  async resolveProviderForUser(userId: number): Promise<Provider | null> {
    const asOwner = await this.providersRepository.findOne({ where: { userId } });
    if (asOwner) return asOwner;

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (user?.providerId) {
      return this.providersRepository.findOne({ where: { id: user.providerId } });
    }
    return null;
  }

  async findNearby(lat: number, lng: number, radius: number, category?: string) {
    // Log de debugging para verificar parámetros recibidos

    const query = this.providersRepository
      .createQueryBuilder('provider')
      .leftJoinAndSelect('provider.specialties', 'specialties')
      .leftJoinAndSelect('specialties.category', 'category')
      .leftJoinAndSelect('provider.vehicleTypes', 'vehicleTypes')
      .leftJoinAndSelect('provider.specialtyBrands', 'specialtyBrands')
      .leftJoinAndSelect('provider.user', 'user')
      .addSelect(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(provider.lat)) * cos(radians(provider.lng) - radians(:lng)) + sin(radians(:lat)) * sin(radians(provider.lat))))`,
        'distance'
      )
      .where('provider.lat IS NOT NULL')
      .andWhere('provider.lng IS NOT NULL')
      // Filtramos solo los visibles (No mostramos los que están de vacaciones)
      .andWhere('provider.isVisible = :visible', { visible: true })
      // Solo usuarios activos y no eliminados
      .andWhere('user.isVisible = :userVisible', { userVisible: true })
      .andWhere('user.deletedAt IS NULL');

    // LÓGICA DE FILTRADO POR CATEGORÍA (Principal O Secundaria)
    if (category && category !== 'all') {
      query.andWhere(
        '(provider.category = :category OR provider.secondaryCategories LIKE :jsonCategory)',
        {
          category: category,
          jsonCategory: `%"${category}"%` // Busca ej: "electrician" dentro del string JSON
        }
      );
    }

    const results = await query
      .having('distance <= :radius')
      .orderBy('distance', 'ASC')
      .setParameters({ lat, lng, radius })
      .getMany();

    return results;
  }

  // --- SERVICIOS ---
  async addService(userId: number, dto: CreateProviderServiceDto) {
    const provider = await this.findOneByUserId(userId);
    if (!provider) throw new BadRequestException('No eres un proveedor');
    const newService = this.providerServicesRepo.create({
      providerId: provider.id,
      ...dto
    });
    return await this.providerServicesRepo.save(newService);
  }

  async getMyServices(userId: number) {
    const provider = await this.findOneByUserId(userId);
    if (!provider) throw new BadRequestException('No eres un proveedor');
    return this.providerServicesRepo.find({
      where: { providerId: provider.id },
      relations: ['vehicleType']
    });
  }

  async updateService(userId: number, serviceId: number, dto: UpdateProviderServiceDto) {
    const provider = await this.findOneByUserId(userId);
    if (!provider) throw new BadRequestException('No eres un proveedor');
    const service = await this.providerServicesRepo.findOne({
      where: { id: serviceId, providerId: provider.id }
    });
    if (!service) throw new NotFoundException('Servicio no encontrado');

    Object.assign(service, dto);
    return await this.providerServicesRepo.save(service);
  }

  async deleteService(userId: number, serviceId: number) {
    const provider = await this.findOneByUserId(userId);
    if (!provider) throw new BadRequestException('No eres un proveedor');
    const service = await this.providerServicesRepo.findOne({
      where: { id: serviceId, providerId: provider.id }
    });
    if (!service) throw new NotFoundException('Servicio no encontrado');

    await this.providerServicesRepo.remove(service);
    return { message: 'Servicio eliminado' };
  }

  // Interruptor de "Vacaciones" (Ocultar/Mostrar en mapa)
  async toggleVisibility(userId: number) {
    const provider = await this.findOneByUserId(userId);
    if (!provider) throw new BadRequestException('No eres un proveedor');
    provider.isVisible = !provider.isVisible;
    await this.providersRepository.save(provider);

    return {
      message: provider.isVisible ? 'Tu taller ahora es visible en el mapa 🟢' : 'Tu taller está oculto (Modo Vacaciones) 🔴',
      isVisible: provider.isVisible
    };
  }

  // --- MÉTRICAS DE NEGOCIO ---
  async getMyMetrics(userId: number) {
    const provider = await this.findOneByUserId(userId);
    if (!provider) throw new BadRequestException('No eres un proveedor');

    const stats = await this.metricsService.getAggregated(provider.id);
    const conversionRate = stats.profileViews > 0
      ? Math.round((stats.totalClicks / stats.profileViews) * 100 * 10) / 10
      : 0;

    return {
      ...stats,
      conversionRate,
      ratingAvg: Number(provider.ratingAvg) || 0,
      reviewCount: (provider as any).reviewsCount ?? 0,
    };
  }

  async trackProfileView(providerId: number): Promise<void> {
    await this.metricsService.track(providerId, 'profile_views');
  }
}