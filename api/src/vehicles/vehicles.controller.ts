import { Controller, Post, Body, Get, UseGuards, Request, Query, Patch, Param, Delete } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateMileageDto } from './dto/update-mileage.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@UseGuards(AuthGuard('jwt')) // <--- Protegemos TODO el controlador de una vez
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) { }

  @Post()
  create(@Request() req, @Body() createVehicleDto: CreateVehicleDto) {
    // El usuario "mecanico" también puede tener auto propio
    return this.vehiclesService.create(req.user.userId, createVehicleDto);
  }

  @Get()
  findAll(@Request() req) {
    // Solo devuelve los autos del usuario logueado
    return this.vehiclesService.findAllByUser(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/mileage')
  updateMileage(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateMileageDto
  ) {
    return this.vehiclesService.updateMileage(+id, req.user.userId, dto.mileage);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('types') // GET /vehicles/types
  getTypes() {
    return this.vehiclesService.findAllTypes();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/mileage-logs')
  getMileageLogs(@Request() req, @Param('id') id: string) {
    return this.vehiclesService.getMileageLogs(+id, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/timeline')
  getTimeline(@Request() req, @Param('id') id: string) {
    return this.vehiclesService.getTimeline(+id, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id') // PATCH /vehicles/5
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(+id, req.user.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id') // DELETE /vehicles/5
  remove(@Request() req, @Param('id') id: string) {
    return this.vehiclesService.remove(+id, req.user.userId);
  }

  @Get('brands')
  getBrands(@Query('typeId') typeId?: string) {
    return this.vehiclesService.findAllBrands(typeId ? +typeId : undefined);
  }

  @Get('models')
  getModels(@Query('brandId') brandId: string) {
    // En la app llamarás a: {{url}}/vehicles/models?brandId=1
    return this.vehiclesService.findAllModels(+brandId);
  }
}