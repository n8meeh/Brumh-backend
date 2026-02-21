import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { VehicleBrand } from './vehicle-brand.entity';
import { VehicleType } from './vehicle-type.entity';

@Entity('vehicle_models')
export class VehicleModel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'brand_id' })
    brandId: number;

    @Column({ name: 'type_id' })
    typeId: number;

    @Column()
    name: string;

    @ManyToOne(() => VehicleBrand)
    @JoinColumn({ name: 'brand_id' })
    brand: VehicleBrand;

    @ManyToOne(() => VehicleType)
    @JoinColumn({ name: 'type_id' })
    type: VehicleType;
}