import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Provider } from '../../providers/entities/provider.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'order_id', unique: true })
    orderId: number;

    @OneToOne(() => Order, { nullable: false })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @Column({ name: 'author_id', nullable: false })
    authorId: number;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'author_id' })
    author: User;

    @Column({ name: 'provider_id', nullable: false })
    providerId: number;

    @ManyToOne(() => Provider, { nullable: false })
    @JoinColumn({ name: 'provider_id' })
    provider: Provider;

    // --- LAS CALIFICACIONES ---

    @Column({ name: 'rating_overall' })
    ratingOverall: number; // El promedio o nota final (1-5)

    @Column({ name: 'rating_quality' })
    ratingQuality: number; // Tu nota "General" (1-5)

    // Opcionales (Detallistas)
    @Column({ name: 'rating_comm', nullable: true })
    ratingComm: number;

    @Column({ name: 'rating_speed', nullable: true })
    ratingSpeed: number;

    @Column({ name: 'rating_price', nullable: true })
    ratingPrice: number;

    // --- CONTENIDO ---

    @Column({ type: 'text', nullable: true })
    comment: string;

    // --- LA RÉPLICA DEL TALLER ---
    @Column({ name: 'provider_reply', type: 'text', nullable: true })
    providerReply: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}