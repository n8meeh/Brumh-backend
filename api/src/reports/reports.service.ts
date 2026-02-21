import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentReport } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Provider } from '../providers/entities/provider.entity';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(ContentReport) private reportRepo: Repository<ContentReport>,
        @InjectRepository(Post) private postRepo: Repository<Post>,
        @InjectRepository(Comment) private commentRepo: Repository<Comment>,
        @InjectRepository(Provider) private providerRepo: Repository<Provider>,
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
}