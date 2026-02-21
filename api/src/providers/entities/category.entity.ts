import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Specialty } from './specialty.entity';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 100, unique: true })
    slug: string;

    @Column({ nullable: true })
    icon: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'display_order', default: 0 })
    displayOrder: number;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    // Relación: Una categoría tiene muchas especialidades
    @OneToMany(() => Specialty, (specialty) => specialty.category)
    specialties: Specialty[];
}
