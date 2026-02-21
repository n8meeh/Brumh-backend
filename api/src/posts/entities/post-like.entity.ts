import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from './post.entity';

@Entity('post_likes')
export class PostLike {
    @PrimaryColumn({ name: 'user_id' })
    userId: number;

    @PrimaryColumn({ name: 'post_id' })
    postId: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Post)
    @JoinColumn({ name: 'post_id' })
    post: Post;
}