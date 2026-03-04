import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('vehicle_events')
export class VehicleEvent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'vehicle_id' })
    vehicleId: number;

    @ManyToOne(() => Vehicle)
    @JoinColumn({ name: 'vehicle_id' })
    vehicle: Vehicle;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'order_id', nullable: true })
    orderId: number | null;

    @ManyToOne(() => Order, { nullable: true })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @Column({
        type: 'enum',
        enum: ['maintenance', 'repair', 'inspection', 'document', 'mileage'],
    })
    type: string;

    @Column({ length: 120 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    cost: number;

    @Column({ nullable: true })
    mileage: number;

    @Column({ name: 'attachment_url', type: 'varchar', length: 500, nullable: true })
    attachmentUrl: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
