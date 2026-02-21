import { Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('user_blocks')
export class UserBlock {
    @PrimaryColumn({ name: 'blocker_id' })
    blockerId: number;

    @PrimaryColumn({ name: 'blocked_id' })
    blockedId: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}