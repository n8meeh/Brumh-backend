import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from './post.entity';

@Entity('poll_votes')
@Unique(['userId', 'postId']) // Un usuario solo vota 1 vez por encuesta
export class PollVote {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'post_id' })
    postId: number;

    @Column({ name: 'option_index' })
    optionIndex: number; // 0, 1, 2... (Indica cuál opción del array eligió)

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Post)
    @JoinColumn({ name: 'post_id' })
    post: Post;
}