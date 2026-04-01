import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Controller('groups')
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) {}

    // ==================== GRUPOS CRUD ====================

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Request() req, @Body() dto: CreateGroupDto) {
        return this.groupsService.create(req.user.userId, dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('mine')
    findMyGroups(@Request() req) {
        return this.groupsService.findMyGroups(req.user.userId);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Get('explore')
    findPublicGroups(@Request() req) {
        const userId = req.user?.userId ?? null;
        return this.groupsService.findPublicGroups(userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.groupsService.findOne(+id, req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() dto: UpdateGroupDto) {
        return this.groupsService.update(+id, req.user.userId, dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/close')
    closeGroup(@Request() req, @Param('id') id: string) {
        return this.groupsService.closeGroup(+id, req.user.userId);
    }

    // ==================== MIEMBROS ====================

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/join')
    joinGroup(@Request() req, @Param('id') id: string) {
        return this.groupsService.joinGroup(+id, req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/leave')
    leaveGroup(@Request() req, @Param('id') id: string) {
        return this.groupsService.leaveGroup(+id, req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/members/:userId/approve')
    approveMember(@Request() req, @Param('id') id: string, @Param('userId') userId: string) {
        return this.groupsService.approveMember(+id, req.user.userId, +userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/members/:userId/reject')
    rejectMember(@Request() req, @Param('id') id: string, @Param('userId') userId: string) {
        return this.groupsService.rejectMember(+id, req.user.userId, +userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/members/:userId/kick')
    kickMember(@Request() req, @Param('id') id: string, @Param('userId') userId: string) {
        return this.groupsService.kickMember(+id, req.user.userId, +userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/members/:userId/promote')
    promoteToAdmin(@Request() req, @Param('id') id: string, @Param('userId') userId: string) {
        return this.groupsService.promoteToAdmin(+id, req.user.userId, +userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/members/:userId/demote')
    demoteAdmin(@Request() req, @Param('id') id: string, @Param('userId') userId: string) {
        return this.groupsService.demoteAdmin(+id, req.user.userId, +userId);
    }

    // ==================== POSTS DEL GRUPO ====================

    @UseGuards(AuthGuard('jwt'))
    @Get(':id/posts')
    getGroupPosts(@Request() req, @Param('id') id: string) {
        return this.groupsService.getGroupPosts(+id, req.user.userId);
    }
}
