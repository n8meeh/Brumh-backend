import { Controller, Get, Param, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * GET /categories/tree
   * Obtiene el árbol completo de categorías con sus especialidades anidadas
   * Público - Usado por el frontend para el selector de especialidades
   */
  @Get('tree')
  getCategoriesTree() {
    return this.categoriesService.getCategoriesTree();
  }

  /**
   * GET /categories/search?term=frenos
   * Busca especialidades por término
   * Público - Útil para autocompletado en el frontend
   */
  @Get('search')
  searchSpecialties(@Query('term') term: string) {
    if (!term || term.length < 2) {
      return [];
    }
    return this.categoriesService.searchSpecialties(term);
  }

  /**
   * GET /categories/:id
   * Obtiene una categoría específica con sus especialidades
   * Público
   */
  @Get(':id')
  getCategoryById(@Param('id') id: string) {
    return this.categoriesService.getCategoryById(+id);
  }

  /**
   * GET /categories/:id/specialties
   * Obtiene solo las especialidades de una categoría
   * Público
   */
  @Get(':id/specialties')
  getSpecialtiesByCategory(@Param('id') id: string) {
    return this.categoriesService.getSpecialtiesByCategory(+id);
  }
}
