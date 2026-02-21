import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { VehicleType } from './vehicle-type.entity';

@Entity('vehicle_brands')
export class VehicleBrand {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ name: 'logo_url', nullable: true })
    logoUrl: string;

    @ManyToMany(() => VehicleType)
    @JoinTable({
        name: 'vehicle_brand_types',
        joinColumn: { name: 'brand_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'type_id', referencedColumnName: 'id' }
    })
    supportedTypes: VehicleType[];
}