import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Provider } from './provider.entity';
import { User } from '../../users/entities/user.entity';

@Entity('provider_team')
export class ProviderTeam {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'provider_id' })
    providerId: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ type: 'enum', enum: ['admin', 'staff', 'viewer'], default: 'staff' })
    role: string;

    @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
    status: string;

    @ManyToOne(() => Provider)
    @JoinColumn({ name: 'provider_id' })
    provider: Provider;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}