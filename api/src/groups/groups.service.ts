import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
    private readonly MAX_GROUPS_PER_USER = 2;

    constructor(
        @InjectRepository(Group) private groupsRepo: Repository<Group>,
        @InjectRepository(GroupMember) private membersRepo: Repository<GroupMember>,
        @InjectRepository(Post) private postsRepo: Repository<Post>,
        @InjectRepository(User) private usersRepo: Repository<User>,
    ) {}

    // ==================== GRUPOS CRUD ====================

    async create(userId: number, dto: CreateGroupDto): Promise<Group> {
        // Verificar límite de 2 grupos por usuario
        const myGroupsCount = await this.groupsRepo.count({
            where: { creatorId: userId, isActive: true },
        });
        if (myGroupsCount >= this.MAX_GROUPS_PER_USER) {
            throw new BadRequestException(`Solo puedes crear un máximo de ${this.MAX_GROUPS_PER_USER} grupos.`);
        }

        const group = this.groupsRepo.create({
            ...dto,
            creatorId: userId,
            membersCount: 1,
        });
        const saved = await this.groupsRepo.save(group);

        // Agregar al creador como miembro con rol 'creator'
        await this.membersRepo.save({
            groupId: saved.id,
            userId,
            role: 'creator',
            status: 'active',
        });

        return this.findOne(saved.id, userId);
    }

    async findOne(groupId: number, requesterId?: number): Promise<any> {
        const group = await this.groupsRepo.findOne({
            where: { id: groupId },
            relations: ['creator', 'members', 'members.user'],
        });
        if (!group) throw new NotFoundException('Grupo no encontrado');

        // Info del miembro actual
        let myMembership = null;
        if (requesterId) {
            myMembership = group.members.find((m) => m.userId === requesterId);
        }

        return {
            ...group,
            creator: {
                id: group.creator.id,
                fullName: group.creator.fullName,
                avatarUrl: group.creator.avatarUrl,
            },
            members: group.members
                .filter((m) => m.status === 'active')
                .map((m) => ({
                    id: m.id,
                    userId: m.userId,
                    role: m.role,
                    joinedAt: m.joinedAt,
                    user: {
                        id: m.user.id,
                        fullName: m.user.fullName,
                        avatarUrl: m.user.avatarUrl,
                    },
                })),
            pendingMembers: group.members
                .filter((m) => m.status === 'pending')
                .map((m) => ({
                    id: m.id,
                    userId: m.userId,
                    joinedAt: m.joinedAt,
                    user: {
                        id: m.user.id,
                        fullName: m.user.fullName,
                        avatarUrl: m.user.avatarUrl,
                    },
                })),
            myRole: myMembership?.role || null,
            myStatus: myMembership?.status || null,
            isMember: myMembership?.status === 'active',
            isPending: myMembership?.status === 'pending',
        };
    }

    async update(groupId: number, userId: number, dto: UpdateGroupDto): Promise<Group> {
        const group = await this.groupsRepo.findOne({ where: { id: groupId } });
        if (!group) throw new NotFoundException('Grupo no encontrado');

        // Solo creator o admin puede editar
        const member = await this.membersRepo.findOne({
            where: { groupId, userId, status: 'active' },
        });
        if (!member || (member.role !== 'creator' && member.role !== 'admin')) {
            throw new ForbiddenException('No tienes permisos para editar este grupo');
        }

        Object.assign(group, dto);
        await this.groupsRepo.save(group);
        return this.findOne(groupId, userId);
    }

    async closeGroup(groupId: number, userId: number): Promise<{ message: string }> {
        const group = await this.groupsRepo.findOne({ where: { id: groupId } });
        if (!group) throw new NotFoundException('Grupo no encontrado');
        if (group.creatorId !== userId) {
            throw new ForbiddenException('Solo el creador puede cerrar el grupo');
        }

        group.isActive = false;
        await this.groupsRepo.save(group);
        return { message: 'Grupo cerrado correctamente' };
    }

    // ==================== LISTADOS ====================

    async findMyGroups(userId: number): Promise<any[]> {
        const memberships = await this.membersRepo.find({
            where: { userId, status: 'active' },
            relations: ['group', 'group.creator'],
        });

        return memberships
            .filter((m) => m.group.isActive)
            .map((m) => ({
                ...m.group,
                myRole: m.role,
                creator: {
                    id: m.group.creator.id,
                    fullName: m.group.creator.fullName,
                    avatarUrl: m.group.creator.avatarUrl,
                },
            }));
    }

    async findPublicGroups(userId?: number): Promise<any[]> {
        const groups = await this.groupsRepo.find({
            where: { isPublic: true, isActive: true },
            relations: ['creator'],
            order: { membersCount: 'DESC' },
        });

        // Si hay usuario, verificar si ya es miembro
        let myMemberships = new Map<number, string>();
        if (userId) {
            const memberships = await this.membersRepo.find({
                where: { userId },
            });
            memberships.forEach((m) => myMemberships.set(m.groupId, m.status));
        }

        return groups.map((g) => ({
            ...g,
            creator: {
                id: g.creator.id,
                fullName: g.creator.fullName,
                avatarUrl: g.creator.avatarUrl,
            },
            myStatus: myMemberships.get(g.id) || null,
            isMember: myMemberships.get(g.id) === 'active',
            isPending: myMemberships.get(g.id) === 'pending',
        }));
    }

    // ==================== MIEMBROS ====================

    async joinGroup(groupId: number, userId: number): Promise<{ message: string; status: string }> {
        const group = await this.groupsRepo.findOne({ where: { id: groupId, isActive: true } });
        if (!group) throw new NotFoundException('Grupo no encontrado');

        // Verificar si ya es miembro o tiene solicitud
        const existing = await this.membersRepo.findOne({
            where: { groupId, userId },
        });

        if (existing) {
            if (existing.status === 'active') throw new BadRequestException('Ya eres miembro de este grupo');
            if (existing.status === 'pending') throw new BadRequestException('Ya tienes una solicitud pendiente');
            if (existing.status === 'banned') throw new ForbiddenException('Has sido expulsado de este grupo');
        }

        const status = group.isPublic ? 'active' : 'pending';
        await this.membersRepo.save({
            groupId,
            userId,
            role: 'member',
            status,
        });

        if (status === 'active') {
            group.membersCount = (group.membersCount || 0) + 1;
            await this.groupsRepo.save(group);
        }

        return {
            message: group.isPublic
                ? 'Te has unido al grupo'
                : 'Solicitud enviada. Espera la aprobación del administrador.',
            status,
        };
    }

    async leaveGroup(groupId: number, userId: number): Promise<{ message: string }> {
        const group = await this.groupsRepo.findOne({ where: { id: groupId } });
        if (!group) throw new NotFoundException('Grupo no encontrado');

        if (group.creatorId === userId) {
            throw new BadRequestException('El creador no puede abandonar el grupo. Ciérralo en su lugar.');
        }

        const member = await this.membersRepo.findOne({
            where: { groupId, userId, status: 'active' },
        });
        if (!member) throw new BadRequestException('No eres miembro de este grupo');

        await this.membersRepo.remove(member);
        group.membersCount = Math.max(0, (group.membersCount || 1) - 1);
        await this.groupsRepo.save(group);

        return { message: 'Has abandonado el grupo' };
    }

    async approveMember(groupId: number, adminId: number, targetUserId: number): Promise<{ message: string }> {
        await this.verifyAdminRole(groupId, adminId);

        const member = await this.membersRepo.findOne({
            where: { groupId, userId: targetUserId, status: 'pending' },
        });
        if (!member) throw new NotFoundException('Solicitud no encontrada');

        member.status = 'active';
        await this.membersRepo.save(member);

        const group = await this.groupsRepo.findOne({ where: { id: groupId } });
        group.membersCount = (group.membersCount || 0) + 1;
        await this.groupsRepo.save(group);

        return { message: 'Miembro aprobado' };
    }

    async rejectMember(groupId: number, adminId: number, targetUserId: number): Promise<{ message: string }> {
        await this.verifyAdminRole(groupId, adminId);

        const member = await this.membersRepo.findOne({
            where: { groupId, userId: targetUserId, status: 'pending' },
        });
        if (!member) throw new NotFoundException('Solicitud no encontrada');

        await this.membersRepo.remove(member);
        return { message: 'Solicitud rechazada' };
    }

    async kickMember(groupId: number, adminId: number, targetUserId: number): Promise<{ message: string }> {
        const group = await this.groupsRepo.findOne({ where: { id: groupId } });
        if (!group) throw new NotFoundException('Grupo no encontrado');

        // No se puede expulsar al creador
        if (targetUserId === group.creatorId) {
            throw new ForbiddenException('No puedes expulsar al creador del grupo');
        }

        await this.verifyAdminRole(groupId, adminId);

        const member = await this.membersRepo.findOne({
            where: { groupId, userId: targetUserId, status: 'active' },
        });
        if (!member) throw new NotFoundException('Miembro no encontrado');

        member.status = 'banned';
        await this.membersRepo.save(member);

        group.membersCount = Math.max(0, (group.membersCount || 1) - 1);
        await this.groupsRepo.save(group);

        return { message: 'Miembro expulsado del grupo' };
    }

    async promoteToAdmin(groupId: number, creatorId: number, targetUserId: number): Promise<{ message: string }> {
        const group = await this.groupsRepo.findOne({ where: { id: groupId } });
        if (!group) throw new NotFoundException('Grupo no encontrado');
        if (group.creatorId !== creatorId) {
            throw new ForbiddenException('Solo el creador puede delegar administradores');
        }

        const member = await this.membersRepo.findOne({
            where: { groupId, userId: targetUserId, status: 'active' },
        });
        if (!member) throw new NotFoundException('Miembro no encontrado');

        member.role = 'admin';
        await this.membersRepo.save(member);
        return { message: 'Miembro promovido a administrador' };
    }

    async demoteAdmin(groupId: number, creatorId: number, targetUserId: number): Promise<{ message: string }> {
        const group = await this.groupsRepo.findOne({ where: { id: groupId } });
        if (!group) throw new NotFoundException('Grupo no encontrado');
        if (group.creatorId !== creatorId) {
            throw new ForbiddenException('Solo el creador puede quitar administradores');
        }

        const member = await this.membersRepo.findOne({
            where: { groupId, userId: targetUserId, status: 'active', role: 'admin' },
        });
        if (!member) throw new NotFoundException('Administrador no encontrado');

        member.role = 'member';
        await this.membersRepo.save(member);
        return { message: 'Administrador degradado a miembro' };
    }

    // ==================== POSTS DEL GRUPO ====================

    async getGroupPosts(groupId: number, userId: number): Promise<Post[]> {
        // Verificar que es miembro activo
        const member = await this.membersRepo.findOne({
            where: { groupId, userId, status: 'active' },
        });
        if (!member) throw new ForbiddenException('Debes ser miembro del grupo para ver las publicaciones');

        return this.postsRepo.find({
            where: { groupId, status: 'active' },
            relations: ['author', 'vehicle', 'tags', 'provider'],
            order: { createdAt: 'DESC' },
        });
    }

    // ==================== HELPERS ====================

    private async verifyAdminRole(groupId: number, userId: number): Promise<GroupMember> {
        const member = await this.membersRepo.findOne({
            where: { groupId, userId, status: 'active' },
        });
        if (!member || (member.role !== 'creator' && member.role !== 'admin')) {
            throw new ForbiddenException('No tienes permisos de administrador en este grupo');
        }
        return member;
    }
}
