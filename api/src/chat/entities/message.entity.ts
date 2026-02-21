import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Entidad Message
 * Representa un mensaje individual en una conversación
 */
@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'chat_id' })
    chatId: number;

    @ManyToOne(() => Chat, (chat) => chat.messages)
    @JoinColumn({ name: 'chat_id' })
    chat: Chat;

    @Column({ name: 'sender_id' })
    senderId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'sender_id' })
    sender: User;

    @Column({ type: 'text' })
    content: string;

    @Column({ name: 'is_read', default: false })
    isRead: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'read_at', type: 'datetime', nullable: true })
    readAt: Date;
}
