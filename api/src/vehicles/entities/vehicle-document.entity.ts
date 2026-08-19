import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Vehicle } from './vehicle.entity';

export type VehicleDocumentType = 'soap' | 'revision_tecnica' | 'permiso_circulacion' | 'padron' | 'seguro_complementario' | 'otro';

@Entity('vehicle_documents')
export class VehicleDocument {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'vehicle_id' })
    vehicleId: number;

    @ManyToOne(() => Vehicle, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vehicle_id' })
    vehicle: Vehicle;

    @Column({
        type: 'enum',
        enum: ['soap', 'revision_tecnica', 'permiso_circulacion', 'padron', 'seguro_complementario', 'otro'],
        default: 'otro',
    })
    type: VehicleDocumentType;

    @Column({ length: 100, nullable: true })
    label: string;

    @Column({ name: 'photo_url', length: 500 })
    photoUrl: string;

    @Column({ name: 'expiry_date', type: 'date', nullable: true })
    expiryDate: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
