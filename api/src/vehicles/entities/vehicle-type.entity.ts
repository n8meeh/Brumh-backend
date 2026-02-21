import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('vehicle_types')
export class VehicleType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string; // Auto, Moto, SUV...
    // 👇 CORRECCIÓN AQUÍ
    // Agregamos { name: 'icon_url' } para mapearlo correctamente
    @Column({ name: 'icon_url', nullable: true })
    iconUrl: string;
}