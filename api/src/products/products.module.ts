import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProviderProduct } from './entities/provider-product.entity';
import { ProductCategory } from './entities/product-category.entity';
import { Provider } from '../providers/entities/provider.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ProviderProduct, ProductCategory, Provider])],
    controllers: [ProductsController],
    providers: [ProductsService],
    exports: [ProductsService],
})
export class ProductsModule {}
