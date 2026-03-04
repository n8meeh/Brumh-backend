import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, OneToOne, JoinColumn, CreateDateColumn, ManyToMany, ManyToOne } from 'typeorm';
import { Provider } from '../../providers/entities/provider.entity';
import { Post } from '../../posts/entities/post.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    @Exclude() // 🔒 OCULTO
    password: string;

    @Column({ name: 'full_name', nullable: true })
    fullName: string;

    @Column({ nullable: true })
    bio: string;

    @Column({ type: 'enum', enum: ['user', 'provider', 'provider_admin', 'provider_staff', 'admin'], default: 'user' })
    role: string;

    // Staff: Vincula un miembro de equipo al negocio (provider) al que pertenece
    @Column({ name: 'provider_id', nullable: true })
    providerId: number | null;

    @ManyToOne(() => Provider, (provider) => provider.staffMembers, { nullable: true })
    @JoinColumn({ name: 'provider_id' })
    staffProvider: Provider;

    // 👇 SOLUCIÓN: Agregamos type: 'varchar' explícitamente
    @Column({ name: 'avatar_url', nullable: true, type: 'varchar' })
    avatarUrl: string | null;

    @OneToOne(() => Provider, (provider) => provider.user)
    provider: Provider;

    // 👇 SOLUCIÓN: Agregamos type: 'varchar' explícitamente
    @Column({ name: 'current_session_token', nullable: true, select: false, type: 'varchar' })
    currentSessionToken: string | null;

    // 👇 SOLUCIÓN: Agregamos type: 'varchar' explícitamente
    @Column({ name: 'fcm_token', nullable: true, type: 'varchar' })
    @Exclude() // 🔒 OCULTO
    fcmToken: string | null;

    @Column({ name: 'last_login_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    lastLoginAt: Date;

    @Column({ name: 'is_visible', default: true })
    isVisible: boolean;

    @Column({ name: 'solutions_count', default: 0 })
    solutionsCount: number;

    @Column({ name: 'strikes_count', default: 0 })
    @Exclude() // 🔒 OCULTO - Información administrativa
    strikesCount: number;

    @Column({ name: 'banned_until', type: 'datetime', nullable: true })
    @Exclude() // 🔒 OCULTO
    bannedUntil: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    @Exclude() // 🔒 OCULTO - No necesario en el frontend
    createdAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    @Exclude() // 🔒 OCULTO - Información técnica
    deletedAt: Date;

    // ...

    // 👇 SOLUCIÓN: Agregamos "type: 'varchar'" explícitamente
    @Column({ name: 'reset_token', type: 'varchar', nullable: true })
    @Exclude() // 🔒 OCULTO
    resetPasswordToken: string | null;

    // 👇 Asegúrate que este tenga "type: 'datetime'"
    @Column({ name: 'reset_expires', type: 'datetime', nullable: true })
    @Exclude() // 🔒 OCULTO
    resetPasswordExpires: Date | null;

    // Relación inversa para Likes en Posts
    @ManyToMany(() => Post, (post) => post.likes)
    likedPosts: Post[];

    // ...
}