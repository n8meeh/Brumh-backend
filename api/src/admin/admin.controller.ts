import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminService } from './admin.service';
import { ApplyStrikeDto } from './dto/apply-strike.dto';
import { UnbanUserDto } from './dto/unban-user.dto';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    /**
     * POST /admin/strike
     * Aplica un strike al usuario y calcula el ban automáticamente.
     */
    @Post('strike')
    applyStrike(@Body() dto: ApplyStrikeDto) {
        return this.adminService.applyStrike(dto.userId);
    }

    /**
     * POST /admin/unban
     * Desbanea a un usuario y restaura su visibilidad.
     */
    @Post('unban')
    unbanUser(@Body() dto: UnbanUserDto) {
        return this.adminService.unbanUser(dto.userId);
    }

    /**
     * GET /admin/moderation/:userId
     * Consulta info de moderación de un usuario.
     */
    @Get('moderation/:userId')
    getModerationInfo(@Param('userId', ParseIntPipe) userId: number) {
        return this.adminService.getUserModerationInfo(userId);
    }
}
