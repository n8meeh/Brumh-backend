import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { Category } from './category.entity';
import { Provider } from './provider.entity';

@Entity('specialties')
export class Specialty {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'category_id' })
    categoryId: number;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 100 })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    icon: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    // Relación: Una especialidad pertenece a una categoría
    @ManyToOne(() => Category, (category) => category.specialties)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    // Relación: Muchos proveedores pueden tener esta especialidad
    @ManyToMany(() => Provider, (provider) => provider.specialties)
    providers: Provider[];
}
