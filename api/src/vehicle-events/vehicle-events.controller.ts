import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VehicleEventsService } from './vehicle-events.service';
import { CreateVehicleEventDto } from './dto/create-vehicle-event.dto';

@Controller('vehicle-events')
@UseGuards(AuthGuard('jwt'))
export class VehicleEventsController {
    constructor(private readonly service: VehicleEventsService) {}

    @Post()
    create(@Req() req, @Body() dto: CreateVehicleEventDto) {
        return this.service.create(req.user.id, dto);
    }

    @Get('vehicle/:vehicleId')
    findByVehicle(@Req() req, @Param('vehicleId', ParseIntPipe) vehicleId: number) {
        return this.service.findByVehicle(vehicleId, req.user.id);
    }

    @Delete(':id')
    remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id, req.user.id);
    }
}
