import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_follows')
export class UserFollow {
    @PrimaryColumn({ name: 'follower_id' })
    followerId: number;

    @PrimaryColumn({ name: 'followed_id' })
    followedId: number;

    // Relaciones (Opcionales, pero útiles si quieres listar seguidores con sus datos)
    @ManyToOne(() => User)
    @JoinColumn({ name: 'follower_id' })
    follower: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'followed_id' })
    followed: User;
}