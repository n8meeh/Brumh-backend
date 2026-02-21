import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetNearbyDto } from './dto/get-nearby.dto';
import { CreateProviderServiceDto } from './dto/create-service.dto';
import { UpdateBrandsDto } from './dto/update-brands.dto';
import { AddStaffDto } from './dto/add-staff.dto';
import { UpdateProviderServiceDto } from './dto/update-provider-service.dto';
import { UpdateVehicleTypesDto } from './dto/update-vehicle-types.dto';
import { UpdateSpecialtiesDto } from './dto/update-specialties.dto';
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) { }

  // --- RUTAS ESPECÍFICAS (Siempre van PRIMERO) ---

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req, @Body() createProviderDto: CreateProviderDto) {
    return this.providersService.create(req.user.userId, createProviderDto);
  }



  @UseGuards(AuthGuard('jwt'))
  @Post('vehicle-types') // POST /providers/vehicle-types
  updateVehicleTypes(@Request() req, @Body() dto: UpdateVehicleTypesDto) {
    return this.providersService.updateVehicleTypes(req.user.userId, dto.typeIds);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch() // PATCH /providers (Edita MI taller)
  update(@Request() req, @Body() dto: UpdateProviderDto) {
    return this.providersService.update(req.user.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete() // DELETE /providers (Cierra MI taller)
  delete(@Request() req) {
    return this.providersService.deleteProvider(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-provider')
  findMyProvider(@Request() req) {
    return this.providersService.findOneByUserId(req.user.userId);
  }

  // En providers.controller.ts
  @Get('nearby')
  findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string, // Radius es opcional
    @Query('category') category?: string
  ) {
    // Conversión explícita y segura a números
    const latitude = Number(lat);
    const longitude = Number(lng);
    const radiusKm = radius ? Number(radius) : 10; // Default 10km si no se especifica
    
    
    return this.providersService.findNearby(latitude, longitude, radiusKm, category);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('visibility') // PATCH /providers/visibility
  toggleVisibility(@Request() req) {
    return this.providersService.toggleVisibility(req.user.userId);
  }

  // --- SUB-RECURSOS: MARCAS ---

  @UseGuards(AuthGuard('jwt'))
  @Post('brands')
  updateBrands(@Request() req, @Body() dto: UpdateBrandsDto) {
    return this.providersService.updateSpecialtyBrands(req.user.userId, dto);
  }

  // 🆕 Actualizar todas las especialidades en un solo endpoint
  @UseGuards(AuthGuard('jwt'))
  @Post('specialties')
  updateSpecialties(@Request() req, @Body() dto: UpdateSpecialtiesDto) {
    return this.providersService.updateSpecialties(req.user.userId, dto);
  }

  // --- SUB-RECURSOS: STAFF (EQUIPO) ---

  @UseGuards(AuthGuard('jwt'))
  @Post('team')
  addStaffMember(@Request() req, @Body() dto: AddStaffDto) {
    return this.providersService.addStaff(req.user.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('team')
  getTeam(@Request() req) {
    return this.providersService.getMyStaff(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('team/:id')
  updateStaff(@Request() req, @Param('id') id: string, @Body('role') role: string) {
    return this.providersService.updateStaff(req.user.userId, +id, role);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('team/:id')
  removeStaff(@Request() req, @Param('id') id: string) {
    return this.providersService.removeStaff(req.user.userId, +id);
  }

  // --- SUB-RECURSOS: SERVICIOS (MENÚ) ---

  @UseGuards(AuthGuard('jwt'))
  @Post('services')
  addService(@Request() req, @Body() dto: CreateProviderServiceDto) {
    return this.providersService.addService(req.user.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('services')
  getMyServices(@Request() req) {
    return this.providersService.getMyServices(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('services/:id')
  updateService(@Request() req, @Param('id') id: string, @Body() dto: UpdateProviderServiceDto) {
    return this.providersService.updateService(req.user.userId, +id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('services/:id')
  deleteService(@Request() req, @Param('id') id: string) {
    return this.providersService.deleteService(req.user.userId, +id);
  }

  // --- RUTAS GENÉRICAS (Siempre van AL FINAL) ---

  @Get()
  findAll() {
    return this.providersService.findAll();
  }

  @Get(':id') // Captura cualquier número, por eso va al final
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(+id);
  }

  // (Eliminé el método 'remove' genérico para evitar accidentes)
}