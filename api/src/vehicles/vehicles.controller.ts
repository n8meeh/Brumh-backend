import { Controller, Post, Body, Get, UseGuards, Request, Query, Patch, Param, Delete } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateMileageDto } from './dto/update-mileage.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) { }

  @Post()
  create(@Request() req, @Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(req.user.userId, createVehicleDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.vehiclesService.findAllByUser(req.user.userId);
  }

  @Patch(':id/mileage')
  updateMileage(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateMileageDto
  ) {
    return this.vehiclesService.updateMileage(+id, req.user.userId, dto.mileage);
  }

  @Get('types')
  getTypes() {
    return this.vehiclesService.findAllTypes();
  }

  @Get(':id/mileage-logs')
  getMileageLogs(@Request() req, @Param('id') id: string) {
    return this.vehiclesService.getMileageLogs(+id, req.user.userId);
  }

  @Get(':id/timeline')
  getTimeline(@Request() req, @Param('id') id: string) {
    return this.vehiclesService.getTimeline(+id, req.user.userId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(+id, req.user.userId, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.vehiclesService.remove(+id, req.user.userId);
  }
}
