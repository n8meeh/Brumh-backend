import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProviderService } from './provider-service.entity';
import { VehicleBrand } from '../../vehicles/entities/vehicle-brand.entity';
import { DeleteDateColumn } from 'typeorm'; // Importar esto
import { VehicleType } from '../../vehicles/entities/vehicle-type.entity'; // Asegúrate de importar esto
import { ProviderTeam } from './provider-team.entity';
import { Specialty } from './specialty.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Exclude } from 'class-transformer';
@Entity('providers')
export class Provider {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    // 👇 AGREGAR ESTA RELACIÓN
    @ManyToMany(() => VehicleBrand)
    @JoinTable({
        name: 'provider_brands', // Nombre exacto de tu tabla en BD
        joinColumn: { name: 'provider_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'brand_id', referencedColumnName: 'id' }
    })
    specialtyBrands: VehicleBrand[];

    @ManyToMany(() => VehicleType)
    @JoinTable({
        name: 'provider_vehicle_types', // Nombre de la tabla nueva
        joinColumn: { name: 'provider_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'vehicle_type_id', referencedColumnName: 'id' }
    })
    vehicleTypes: VehicleType[];

    // Relación: Un proveedor puede tener múltiples especialidades jerárquicas
    @ManyToMany(() => Specialty, (specialty) => specialty.providers)
    @JoinTable({
        name: 'provider_specialties',
        joinColumn: { name: 'provider_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'specialty_id', referencedColumnName: 'id' }
    })
    specialties: Specialty[];

    @OneToMany(() => ProviderService, (service) => service.provider)
    services: ProviderService[];

    // Relación 1 a 1: Un Proveedor ES Un Usuario
    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    // Relación 1 a N: Un Proveedor tiene muchos miembros de equipo
    @OneToMany(() => ProviderTeam, (team) => team.provider)
    team: ProviderTeam[];

    // Relación 1 a N: Un Proveedor tiene muchas reseñas
    @OneToMany(() => Review, (review) => review.provider)
    reviews: Review[];

    @Column({ name: 'business_name' })
    businessName: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: ['mechanic', 'electrician', 'body_shop', 'tires', 'audio_security', 'tow', 'wash', 'store', 'driving_school', 'other']
    })
    category: string;

    // ...
    // 👇 CAMBIA ESTO: Agrega { name: 'secondary_categories' }
    @Column({ name: 'secondary_categories', type: 'json', nullable: true })
    secondaryCategories: string[];
    // ...
    @Column({ name: 'is_home_service', default: false })
    isHomeService: boolean;

    // Imágenes del negocio
    @Column({ name: 'logo_url', nullable: true })
    logoUrl: string;

    @Column({ name: 'cover_url', nullable: true })
    coverUrl: string;

    // Contactos es un JSON en la BD
    @Column({ type: 'json', nullable: true })
    contacts: {
        whatsapp?: string;
        instagram?: string;
        facebook?: string;
        tiktok?: string;
        website?: string;
        phone?: string;
    };

    @Column({ name: 'opening_hours', nullable: true })
    openingHours: string;

    @Column({ name: 'is_multibrand', default: false })
    isMultibrand: boolean;

    @Column({ name: 'is_visible', default: true })
    isVisible: boolean;

    // Ubicación
    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    lat: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    lng: number;

    @Column({ nullable: true })
    address: string;

    @Column({ name: 'rating_avg', type: 'decimal', precision: 3, scale: 2, default: 0 })
    ratingAvg: number;

    @Column({ name: 'is_premium', default: false })
    isPremium: boolean;

    @Column({ name: 'is_verified', default: false })
    isVerified: boolean;

    // ... otras columnas

    // 👇 ¿TIENES ESTO ASÍ?
    @DeleteDateColumn({ name: 'deleted_at' })
    @Exclude() // 🔒 OCULTO - Información técnica
    deletedAt: Date | null;

    // ... relaciones

}