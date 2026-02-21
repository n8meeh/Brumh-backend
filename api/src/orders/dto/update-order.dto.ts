import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
// 👇 1. Importa los validadores
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
    
    // 👇 2. Agrega los decoradores para que NestJS acepte el campo
    @IsOptional()
    @IsString()
    @IsEnum(['pending', 'accepted', 'completed', 'cancelled']) // Valida que sea uno de estos
    status?: string;

    @IsOptional()
    @IsNumber()
    finalPrice?: number;
}