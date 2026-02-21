import { IsArray, IsNumber } from 'class-validator';

export class UpdateBrandsDto {
    @IsArray()
    @IsNumber({}, { each: true })
    brandIds: number[]; // Ej: [1, 5, 10]
}