import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Message } from './message.entity';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';

/**
 * Entidad Chat/Conversación
 * Representa una conversación entre dos usuarios (cliente y proveedor) vinculada a una orden
 */
@Entity('chats')
export class Chat {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user1_id' })
    user1Id: number;

    @Column({ name: 'user2_id' })
    user2Id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user1_id' })
    user1: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user2_id' })
    user2: User;

    @Column({ name: 'order_id', nullable: true })
    orderId: number;

    @ManyToOne(() => Order, { nullable: true })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @Column({ name: 'last_message', type: 'text', nullable: true })
    lastMessage: string;

    @Column({ name: 'last_message_at', type: 'datetime', nullable: true })
    lastMessageAt: Date;

    @Column({ name: 'unread_count_user1', default: 0 })
    unreadCountUser1: number;

    @Column({ name: 'unread_count_user2', default: 0 })
    unreadCountUser2: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Message, (message) => message.chat)
    messages: Message[];
}
