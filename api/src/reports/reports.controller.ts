import { Controller, Post, Get, Patch, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    /**
     * POST /reports/appeal
     * Crear una apelación de suspensión (PÚBLICO — no requiere auth).
     * El usuario baneado no tiene token, se identifica por email.
     * DEBE ir antes de @Post() para que NestJS lo matchee primero.
     */
    @Post('appeal')
    createAppeal(@Body() createAppealDto: CreateAppealDto) {
        return this.reportsService.createAppeal(createAppealDto);
    }

    /** Crear un reporte de contenido (cualquier usuario autenticado) */
    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Request() req, @Body() createReportDto: CreateReportDto) {
        return this.reportsService.create(req.user.userId, createReportDto);
    }

    /** Obtener todos los reportes pendientes (solo admins) */
    @UseGuards(AdminGuard)
    @Get()
    findAllPending() {
        return this.reportsService.findAllPending();
    }

    /** Resolver un reporte: dismiss | strike | ban (solo admins) */
    @UseGuards(AdminGuard)
    @Patch(':id/resolve')
    resolve(
        @Param('id', ParseIntPipe) id: number,
        @Body() resolveReportDto: ResolveReportDto,
    ) {
        return this.reportsService.resolve(id, resolveReportDto);
    }
}
