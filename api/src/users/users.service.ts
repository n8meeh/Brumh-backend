import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull, In } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserBlock } from './entities/user-block.entity';
import { UserFollow } from './entities/user-follow.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Post } from '../posts/entities/post.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(UserBlock) private blockRepo: Repository<UserBlock>,
    @InjectRepository(UserFollow) private followRepo: Repository<UserFollow>,
    @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Post) private postRepo: Repository<Post>,
  ) { }

  /**
   * Toggle de Bloqueo: Bloquea si no está bloqueado, desbloquea si ya lo está
   */
  async toggleBlock(blockerId: number, blockedId: number) {
    if (blockerId === blockedId) {
      throw new BadRequestException('No puedes bloquearte a ti mismo');
    }

    // Verificar si el usuario objetivo existe
    const targetUser = await this.usersRepository.findOne({ where: { id: blockedId } });
    if (!targetUser) throw new NotFoundException('Usuario no encontrado');

    // Buscar si ya existe un bloqueo
    const existingBlock = await this.blockRepo.findOne({
      where: { blockerId, blockedId }
    });

    if (existingBlock) {
      // Ya está bloqueado → DESBLOQUEAR
      await this.blockRepo.remove(existingBlock);
      return {
        status: 'unblocked',
        message: `Has desbloqueado a ${targetUser.fullName}`
      };
    } else {
      // No está bloqueado → BLOQUEAR
      const newBlock = this.blockRepo.create({ blockerId, blockedId });
      await this.blockRepo.save(newBlock);
      return {
        status: 'blocked',
        message: `Has bloqueado a ${targetUser.fullName}`
      };
    }
  }

  async saveResetToken(userId: number, token: string, expires: Date) {
    return this.usersRepository.update(userId, {
      resetPasswordToken: token,
      resetPasswordExpires: expires
    });
  }

  // Buscar por token válido (que no haya expirado)
  async findByResetToken(token: string) {
    return this.usersRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date()) // Que la fecha de expiración sea MAYOR a ahora
      }
    });
  }

  // Cambiar clave y borrar token
  async updatePasswordAndClearToken(userId: number, hashedPassword: string) {
    return this.usersRepository.update(userId, {
      password: hashedPassword,
      // Gracias al cambio en el Paso 1, esto ya no dará error rojo
      resetPasswordToken: null,
      resetPasswordExpires: null
    });
  }
  /**
   * Actualiza el rol de un usuario
   * @param userId ID del usuario
   * @param newRole Nuevo rol (user, provider, admin)
   */
  async updateRole(userId: number, newRole: 'user' | 'provider' | 'admin') {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    
    
    user.role = newRole;
    const updatedUser = await this.usersRepository.save(user);
    
    
    return updatedUser;
  }

  async create(createUserDto: CreateUserDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role || 'user',
    });
    return await this.usersRepository.save(newUser);
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.deletedAt = new Date();
    user.isVisible = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    user.fullName = 'Usuario Eliminado';

    // Solución al error de tipos: Casting a 'any' o asegurar que la entidad acepte null
    user.avatarUrl = null;
    user.fcmToken = null;
    user.currentSessionToken = null;

    return await this.usersRepository.save(user);
  }



  /**
   * Obtener perfil completo del usuario con contadores sociales
   * Usado para GET /users/profile (mi perfil) y GET /users/:id (perfil de otro)
   */
  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['provider'],
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        bio: true,
        solutionsCount: true,
        provider: {
          id: true,
          businessName: true,
        }
      }
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    // ➕ Contar seguidores (quiénes me siguen)
    const followersCount = await this.followRepo.count({
      where: { followedId: id }
    });

    // ➕ Contar seguidos (a quiénes sigo)
    const followingCount = await this.followRepo.count({
      where: { followerId: id }
    });

    // ➕ Contar publicaciones activas
    const postsCount = await this.postRepo.count({
      where: { 
        authorId: id,
        status: 'active'
      }
    });

    return {
      ...user,
      followersCount,
      followingCount,
      postsCount
    };
  }

  /**
   * Perfil Público Enriquecido con vehículos, contadores sociales y estado de seguimiento
   * @param id ID del usuario cuyo perfil se consulta
   * @param currentUserId ID del usuario que está consultando (opcional, para isFollowing)
   */
  async findPublicProfile(id: number, currentUserId?: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['provider'],
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        bio: true,
        solutionsCount: true,
        createdAt: true,
        provider: {
          id: true,
          businessName: true,
          ratingAvg: true,
          category: true
        }
      }
    });
    
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // 1. Obtener vehículos no eliminados
    const vehicles = await this.vehicleRepo.find({
      where: {
        userId: id,
        deletedAt: IsNull()
      },
      relations: ['model', 'model.brand'],
      select: {
        id: true,
        alias: true,
        year: true,
        plate: true,
        photoUrl: true,
        model: {
          id: true,
          name: true,
          brand: {
            id: true,
            name: true,
            logoUrl: true
          }
        }
      },
      order: { id: 'DESC' }
    });

    // 2. Contar seguidores (quienes siguen a este usuario)
    const followersCount = await this.followRepo.count({
      where: { followedId: id }
    });

    // 3. Contar seguidos (a quienes sigue este usuario)
    const followingCount = await this.followRepo.count({
      where: { followerId: id }
    });

    // 4. Verificar si el usuario actual lo está siguiendo
    let isFollowing = false;
    let isBlocked = false;
    
    // 🔍 DEBUG: Verificar tipos de datos antes de conversión
    
    // ✅ Convertir explícitamente a números para evitar problemas de comparación
    const userIdNum = currentUserId ? Number(currentUserId) : null;
    const profileIdNum = Number(id);
    
    if (userIdNum && !isNaN(userIdNum) && userIdNum !== profileIdNum) {
      
      // Buscar relación de seguimiento usando count() para mayor confiabilidad
      // followerId = quien sigue (currentUser)
      // followedId = quien es seguido (profile)
      const followCount = await this.followRepo.count({
        where: { 
          followerId: userIdNum, 
          followedId: profileIdNum 
        }
      });
      
      isFollowing = followCount > 0;

      // Verificar si el usuario actual lo tiene bloqueado
      const blockCount = await this.blockRepo.count({
        where: { 
          blockerId: userIdNum, 
          blockedId: profileIdNum 
        }
      });
      isBlocked = blockCount > 0;
    } else {
      console.log(`⚠️ [PUBLIC_PROFILE] Sin autenticación, mismo usuario, o IDs inválidos - isFollowing = false`);
      console.log(`   Razón: userIdNum=${userIdNum}, isNaN=${userIdNum ? isNaN(userIdNum) : 'N/A'}, sonIguales=${userIdNum === profileIdNum}`);
    }

    return {
      ...user,
      vehicles,
      followersCount,
      followingCount,
      isFollowing,
      isBlocked
    };
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'fullName', 'fcmToken']
    });
  }

  async updateSessionToken(id: number, token: string) {
    return this.usersRepository.update(id, { currentSessionToken: token });
  }

  findAll() { return this.usersRepository.find(); }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // 1. Si viene password, hashearlo
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    // 2. Si viene email, verificar duplicados
    if (updateUserDto.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email }
      });
      // Si existe y NO es el mismo usuario que está editando
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('El email ya está en uso por otro usuario');
      }
    }

    await this.usersRepository.update(id, updateUserDto);
    const user = await this.findOne(id);
    const { password, ...result } = user;
    return result;
  }

  async toggleFollow(followerId: number, followedId: number) {
    
    if (followerId === followedId) {
      throw new BadRequestException('No puedes seguirte a ti mismo');
    }

    const targetUser = await this.usersRepository.findOne({ where: { id: followedId } });
    if (!targetUser) throw new NotFoundException('Usuario no encontrado');

    const existingFollow = await this.followRepo.findOne({
      where: { followerId, followedId }
    });

    if (existingFollow) {
      await this.followRepo.remove(existingFollow);
      return { status: 'unfollowed', message: `Dejaste de seguir a ${targetUser.fullName}` };
    } else {
      const newFollow = this.followRepo.create({ followerId, followedId });
      await this.followRepo.save(newFollow);
      return { status: 'followed', message: `Ahora sigues a ${targetUser.fullName}` };
    }
  }

  /**
   * Obtener la lista de usuarios que este usuario sigue
   */
  async getFollowing(userId: number) {
    const follows = await this.followRepo.find({
      where: { followerId: userId },
      relations: ['followed', 'followed.provider']
    });

    return follows.map(follow => ({
      id: follow.followed.id,
      fullName: follow.followed.fullName,
      avatarUrl: follow.followed.avatarUrl,
      role: follow.followed.role,
      bio: follow.followed.bio,
      provider: follow.followed.provider ? {
        id: follow.followed.provider.id,
        businessName: follow.followed.provider.businessName,
        category: follow.followed.provider.category
      } : null
    }));
  }

  /**
   * Obtener la lista de usuarios que siguen a este usuario (seguidores)
   */
  async getFollowers(userId: number) {
    const follows = await this.followRepo.find({
      where: { followedId: userId },
      relations: ['follower', 'follower.provider']
    });

    return follows.map(follow => ({
      id: follow.follower.id,
      fullName: follow.follower.fullName,
      avatarUrl: follow.follower.avatarUrl,
      role: follow.follower.role,
      bio: follow.follower.bio,
      provider: follow.follower.provider ? {
        id: follow.follower.provider.id,
        businessName: follow.follower.provider.businessName,
        category: follow.follower.provider.category
      } : null
    }));
  }

  /**
   * Obtener la lista de usuarios que este usuario ha bloqueado
   */
  async getBlockedUsers(userId: number) {
    if (!userId || isNaN(userId)) {
      throw new BadRequestException('ID de usuario inválido');
    }

    const blocks = await this.blockRepo.find({
      where: { blockerId: userId }
    });

    if (blocks.length === 0) {
      return [];
    }

    // Obtener los IDs de los usuarios bloqueados
    const blockedIds = blocks.map(block => block.blockedId);

    // Buscar la información de esos usuarios
    const blockedUsers = await this.usersRepository.find({
      where: { id: In(blockedIds) },
      relations: ['provider'],
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        bio: true,
        provider: {
          id: true,
          businessName: true,
          category: true
        }
      }
    });

    return blockedUsers.map(user => ({
      id: user.id,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      bio: user.bio,
      provider: user.provider ? {
        id: user.provider.id,
        businessName: user.provider.businessName,
        category: user.provider.category
      } : null
    }));
  }
}