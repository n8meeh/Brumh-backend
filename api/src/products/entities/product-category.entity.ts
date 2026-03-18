import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProviderProduct } from './provider-product.entity';

@Entity('product_categories')
export class ProductCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 100, unique: true })
    slug: string;

    @Column({ nullable: true })
    icon: string;

    @Column({ name: 'parent_id', nullable: true })
    parentId: number | null;

    @Column({ name: 'display_order', default: 0 })
    displayOrder: number;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @OneToMany(() => ProviderProduct, (product) => product.category)
    products: ProviderProduct[];
}
