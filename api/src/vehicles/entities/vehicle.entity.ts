import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { VehicleType } from './vehicle-type.entity';

@Entity('vehicles')
export class Vehicle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'vehicle_type_id' })
    vehicleTypeId: number;

    @ManyToOne(() => VehicleType)
    @JoinColumn({ name: 'vehicle_type_id' })
    vehicleType: VehicleType;

    @Column({ length: 100 })
    brand: string;

    @Column({ length: 100 })
    model: string;

    @Column({ nullable: true })
    year: number;

    @Column({ nullable: true })
    vin: string;

    @Column({ nullable: true })
    plate: string;

    @Column({ nullable: true })
    alias: string;

    @Column({ name: 'photo_url', nullable: true })
    photoUrl: string;

    @Column({
        name: 'fuel_type',
        type: 'enum',
        enum: ['gasoline', 'diesel', 'electric', 'hybrid', 'gas', 'other'],
        default: 'gasoline',
    })
    fuelType: string;

    @Column({
        name: 'transmission',
        type: 'enum',
        enum: ['manual', 'automatic'],
        default: 'manual',
    })
    transmission: string;

    @Column({ name: 'engine_size', length: 20, nullable: true })
    engineSize: string;

    @Column({ name: 'last_mileage', default: 0 })
    lastMileage: number;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;
}
