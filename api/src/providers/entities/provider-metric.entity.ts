import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Provider } from './provider.entity';

@Entity('provider_metrics')
@Unique(['providerId', 'date'])
export class ProviderMetric {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'provider_id' })
    providerId: number;

    @ManyToOne(() => Provider, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'provider_id' })
    provider: Provider;

    @Column({ type: 'date' })
    date: string; // YYYY-MM-DD

    @Column({ name: 'profile_views', default: 0 })
    profileViews: number;

    @Column({ name: 'clicks_whatsapp', default: 0 })
    clicksWhatsapp: number;

    @Column({ name: 'clicks_call', default: 0 })
    clicksCall: number;

    @Column({ name: 'clicks_route', default: 0 })
    clicksRoute: number;
}
