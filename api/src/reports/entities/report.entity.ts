import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('content_reports')
export class ContentReport {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'reporter_id' })
    reporterId: number;

    @Column({ name: 'reported_user_id' })
    reportedUserId: number;

    @Column({ name: 'content_type', type: 'enum', enum: ['post', 'comment', 'review', 'user'] })
    contentType: string;

    @Column({ name: 'content_id' })
    contentId: number;

    @Column({ type: 'enum', enum: ['spam', 'hate_speech', 'scam', 'other'] })
    reason: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ default: 'pending' })
    status: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}