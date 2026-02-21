import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Post } from './post.entity';

@Entity('tags')
export class Tag {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string; // Ej: "toyota" (siempre en minúsculas para facilitar búsqueda)

    @Column({ name: 'usage_count', default: 0 })
    usageCount: number; // Para saber cuáles son Trending Topic

    // Relación inversa (opcional, pero útil)
    @ManyToMany(() => Post, (post) => post.tags)
    posts: Post[];
}