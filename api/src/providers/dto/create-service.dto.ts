import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProviderServiceDto {
    @IsString()
    name: string; // Ej: "Cambio de Pastillas"

    @IsNumber()
    vehicleTypeId: number; // Ej: 1 (Auto), 2 (Moto)

    @IsNumber()
    @IsOptional()
    priceMin: number;

    @IsNumber()
    @IsOptional()
    priceMax: number;
}