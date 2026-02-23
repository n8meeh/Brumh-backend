import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Vehicle } from './vehicle.entity';

@Entity('vehicle_mileage_logs')
export class VehicleMileageLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'vehicle_id' })
    vehicleId: number;

    @ManyToOne(() => Vehicle, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vehicle_id' })
    vehicle: Vehicle;

    @Column()
    mileage: number;

    @Column({ type: 'varchar', length: 50, default: 'manual' })
    source: string; // 'manual' | 'order_completion'

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
