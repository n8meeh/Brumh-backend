import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';

@Entity('order_negotiations')
export class Negotiation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'order_id' })
    orderId: number;

    @ManyToOne(() => Order)
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @Column({ name: 'author_id' })
    authorId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'author_id' })
    author: User;

    @Column({ type: 'text', nullable: true })
    message: string;

    // Si este campo tiene valor, es una OFERTA formal. Si es null, es solo chat.
    @Column({ name: 'proposed_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
    proposedPrice: number;

    @Column({ name: 'proposed_date', type: 'datetime', nullable: true })
    proposedDate: Date;

    @Column({ name: 'proposed_is_home_service', nullable: true })
    proposedIsHomeService: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}