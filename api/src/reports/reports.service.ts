import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentReport } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Provider } from '../providers/entities/provider.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(ContentReport) private reportRepo: Repository<ContentReport>,
        @InjectRepository(Post) private postRepo: Repository<Post>,
        @InjectRepository(Comment) private commentRepo: Repository<Comment>,
        @InjectRepository(Provider) private providerRepo: Repository<Provider>,
        @InjectRepository(User) private userRepo: Repository<User>,
        private notificationsService: NotificationsService,
    ) { }

    async create(reporterId: number, dto: CreateReportDto) {
        // Determinar el reportedUserId según el contentType
        let reportedUserId = dto.reportedUserId;

        if (!reportedUserId) {
            switch (dto.contentType) {
                case 'post':
                    const post = await this.postRepo.findOne({ where: { id: dto.contentId } });
                    if (!post) throw new NotFoundException('Post no encontrado');
                    reportedUserId = post.authorId;
                    break;

                case 'comment':
                    const comment = await this.commentRepo.findOne({ where: { id: dto.contentId } });
                    if (!comment) throw new NotFoundException('Comentario no encontrado');
                    reportedUserId = comment.authorId;
                    break;

                case 'provider':
                    const provider = await this.providerRepo.findOne({ where: { id: dto.contentId } });
                    if (!provider) throw new NotFoundException('Proveedor no encontrado');
                    reportedUserId = provider.userId;
                    break;

                case 'user':
                    // Para 'user', el contentId es directamente el userId
                    reportedUserId = dto.contentId;
                    break;

                default:
                    throw new NotFoundException('Tipo de contenido no válido');
            }
        }

        const report = this.reportRepo.create({
            ...dto,
            reporterId,
            reportedUserId,
        });
        return await this.reportRepo.save(report);
    }

    /**
     * Devuelve todos los reportes pendientes con datos del reportero y reportado.
     * Solo accesible para admins.
     */
    async findAllPending() {
        return this.reportRepo.createQueryBuilder('report')
            .leftJoinAndSelect('report.reporter', 'reporter')
            .leftJoinAndSelect('report.reportedUser', 'reportedUser')
            .where('report.status = :status', { status: 'pending' })
            .orderBy('report.createdAt', 'DESC')
            .getMany();
    }

    /**
     * Resuelve un reporte con una de las tres acciones: dismiss, strike, ban.
     * Solo accesible para admins.
     */
    async resolve(id: number, dto: ResolveReportDto) {
        const report = await this.reportRepo.findOne({ where: { id } });
        if (!report) throw new NotFoundException('Reporte no encontrado');

        const { action, banDays = 7 } = dto;

        if (action === 'strike') {
            // Sumar +1 al contador de strikes del usuario reportado
            await this.userRepo.increment({ id: report.reportedUserId }, 'strikesCount', 1);
            await this.notificationsService.createInApp(
                report.reportedUserId,
                '⚠️ Advertencia en tu cuenta',
                'Hemos recibido un reporte sobre tu contenido. Tu cuenta ha acumulado un strike adicional. Por favor, revisa las normas de la comunidad.',
            );
        } else if (action === 'ban') {
            // Calcular fecha de fin de baneo
            const bannedUntil = new Date();
            bannedUntil.setDate(bannedUntil.getDate() + banDays);
            await this.userRepo.update(report.reportedUserId, { bannedUntil });
            const bannedUntilStr = bannedUntil.toLocaleDateString('es-ES', {
                day: '2-digit', month: 'long', year: 'numeric',
            });
            await this.notificationsService.createInApp(
                report.reportedUserId,
                '🚫 Tu cuenta ha sido suspendida',
                `Tu cuenta ha sido suspendida temporalmente debido a una infracción de nuestras normas. Podrás volver a acceder el ${bannedUntilStr}.`,
            );
        }
        // 'dismiss' no tiene efecto en el usuario, solo cierra el reporte

        report.status = 'resolved';
        return this.reportRepo.save(report);
    }

    /**
     * Crea una apelación de suspensión (endpoint público, no requiere auth).
     * El usuario baneado no tiene token, así que se identifica por email.
     */
    async createAppeal(dto: CreateAppealDto) {
        // Buscar usuario por email
        const user = await this.userRepo.findOne({ where: { email: dto.email } });
        if (!user) {
            throw new NotFoundException('No se encontró una cuenta con ese email.');
        }

        // Verificar que realmente esté baneado
        if (!user.bannedUntil || new Date() >= new Date(user.bannedUntil)) {
            throw new BadRequestException('Tu cuenta no se encuentra suspendida actualmente.');
        }

        // Verificar que no tenga ya una apelación pendiente
        const existingAppeal = await this.reportRepo.findOne({
            where: {
                reportedUserId: user.id,
                contentType: 'appeal',
                status: 'pending',
            },
        });

        if (existingAppeal) {
            throw new BadRequestException('Ya tienes una apelación pendiente de revisión. Por favor espera a que sea procesada.');
        }

        // Crear apelación como ContentReport
        const appeal = this.reportRepo.create({
            reporterId: user.id,       // El que apela es el mismo usuario
            reportedUserId: user.id,   // Se reporta a sí mismo (apelación)
            contentType: 'appeal',
            contentId: user.id,
            reason: 'appeal',
            description: dto.message,
            status: 'pending',
        });

        await this.reportRepo.save(appeal);

        return { message: 'Tu apelación ha sido enviada. Será revisada por nuestro equipo.' };
    }
}
