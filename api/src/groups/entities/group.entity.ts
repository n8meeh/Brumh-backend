import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { GroupMember } from './group-member.entity';

@Entity('groups')
export class Group {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50 })
    name: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    description: string;

    @Column({ name: 'image_url', nullable: true })
    imageUrl: string;

    @Column({ name: 'creator_id' })
    creatorId: number;

    @Column({ name: 'is_public', default: true })
    isPublic: boolean;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'members_count', default: 1 })
    membersCount: number;

    @Column({ name: 'posts_count', default: 0 })
    postsCount: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relaciones
    @ManyToOne(() => User)
    @JoinColumn({ name: 'creator_id' })
    creator: User;

    @OneToMany(() => GroupMember, (member) => member.group)
    members: GroupMember[];
}
