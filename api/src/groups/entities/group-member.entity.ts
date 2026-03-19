import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Group } from './group.entity';

@Entity('group_members')
@Unique(['groupId', 'userId'])
export class GroupMember {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'group_id' })
    groupId: number;

    @Column({ name: 'user_id' })
    userId: number;

    // 'creator' | 'admin' | 'member'
    @Column({ type: 'enum', enum: ['creator', 'admin', 'member'], default: 'member' })
    role: string;

    // 'active' | 'pending' | 'banned'
    @Column({ type: 'enum', enum: ['active', 'pending', 'banned'], default: 'active' })
    status: string;

    @CreateDateColumn({ name: 'joined_at' })
    joinedAt: Date;

    // Relaciones
    @ManyToOne(() => Group, (group) => group.members)
    @JoinColumn({ name: 'group_id' })
    group: Group;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
