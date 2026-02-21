import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ContentReport } from './entities/report.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Provider } from '../providers/entities/provider.entity';

@Module({
    imports: [
        // Registramos todas las entidades necesarias para los repositorios
        TypeOrmModule.forFeature([ContentReport, Post, Comment, Provider])
    ],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule { }