import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Request,
    UseGuards,
    ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    // ─── Públicos ──────────────────────────────────────

    /**
     * GET /products/categories
     * Lista todas las categorías de productos activas.
     */
    @Get('categories')
    getCategories() {
        return this.productsService.getCategories();
    }

    /**
     * GET /products/search?query=...&categoryId=...&vehicleTypeId=...&condition=...
     * Búsqueda pública de productos.
     */
    @Get('search')
    searchProducts(
        @Query('query') query?: string,
        @Query('categoryId') categoryId?: string,
        @Query('vehicleTypeId') vehicleTypeId?: string,
        @Query('condition') condition?: string,
    ) {
        return this.productsService.searchProducts({
            query,
            categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
            vehicleTypeId: vehicleTypeId ? parseInt(vehicleTypeId, 10) : undefined,
            condition,
        });
    }

    /**
     * GET /products/provider/:providerId
     * Productos activos de un proveedor (vista pública).
     */
    @Get('provider/:providerId')
    getProductsByProvider(@Param('providerId', ParseIntPipe) providerId: number) {
        return this.productsService.getProductsByProvider(providerId);
    }

    // ─── Autenticados (negocio) ────────────────────────

    /**
     * GET /products/my
     * Mis productos (incluye inactivos).
     */
    @Get('my')
    @UseGuards(AuthGuard('jwt'))
    getMyProducts(@Request() req: any) {
        const providerId = req.user.providerId;
        if (!providerId) {
            throw new ForbiddenException('No tienes un negocio asociado.');
        }
        return this.productsService.getMyProducts(providerId);
    }

    /**
     * POST /products
     * Crear un producto nuevo.
     */
    @Post()
    @UseGuards(AuthGuard('jwt'))
    createProduct(@Request() req: any, @Body() body: any) {
        const providerId = req.user.providerId;
        if (!providerId) {
            throw new ForbiddenException('No tienes un negocio asociado.');
        }
        return this.productsService.createProduct(providerId, body);
    }

    /**
     * PATCH /products/:id
     * Actualizar un producto existente.
     */
    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    updateProduct(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: any,
        @Body() body: any,
    ) {
        const providerId = req.user.providerId;
        if (!providerId) {
            throw new ForbiddenException('No tienes un negocio asociado.');
        }
        return this.productsService.updateProduct(id, providerId, body);
    }

    /**
     * DELETE /products/:id
     * Eliminar un producto.
     */
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    deleteProduct(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: any,
    ) {
        const providerId = req.user.providerId;
        if (!providerId) {
            throw new ForbiddenException('No tienes un negocio asociado.');
        }
        return this.productsService.deleteProduct(id, providerId);
    }
}
