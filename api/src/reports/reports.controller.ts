import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Request() req, @Body() createReportDto: CreateReportDto) {
        return this.reportsService.create(req.user.userId, createReportDto);
    }
}