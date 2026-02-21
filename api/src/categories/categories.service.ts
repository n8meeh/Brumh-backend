import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../providers/entities/category.entity';
import { Specialty } from '../providers/entities/specialty.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private categoriesRepo: Repository<Category>,
    @InjectRepository(Specialty) private specialtiesRepo: Repository<Specialty>,
  ) {}

  /**
   * Obtiene el árbol completo de categorías con sus especialidades
   * Usado por el frontend para mostrar el selector de especialidades
   */
  async getCategoriesTree() {
    return this.categoriesRepo.find({
      where: { isActive: true },
      relations: ['specialties'],
      order: {
        displayOrder: 'ASC',
        specialties: {
          name: 'ASC'
        }
      }
    });
  }

  /**
   * Obtiene una categoría específica con sus especialidades
   */
  async getCategoryById(id: number) {
    return this.categoriesRepo.findOne({
      where: { id, isActive: true },
      relations: ['specialties']
    });
  }

  /**
   * Obtiene una categoría por slug
   */
  async getCategoryBySlug(slug: string) {
    return this.categoriesRepo.findOne({
      where: { slug, isActive: true },
      relations: ['specialties']
    });
  }

  /**
   * Obtiene todas las especialidades de una categoría
   */
  async getSpecialtiesByCategory(categoryId: number) {
    return this.specialtiesRepo.find({
      where: { 
        categoryId,
        isActive: true 
      },
      order: { name: 'ASC' }
    });
  }

  /**
   * Busca especialidades por término de búsqueda
   */
  async searchSpecialties(searchTerm: string) {
    return this.specialtiesRepo
      .createQueryBuilder('specialty')
      .leftJoinAndSelect('specialty.category', 'category')
      .where('specialty.is_active = :active', { active: true })
      .andWhere('category.is_active = :active', { active: true })
      .andWhere('(specialty.name LIKE :term OR specialty.slug LIKE :term OR category.name LIKE :term)', 
        { term: `%${searchTerm}%` })
      .orderBy('category.display_order', 'ASC')
      .addOrderBy('specialty.name', 'ASC')
      .getMany();
  }
}
