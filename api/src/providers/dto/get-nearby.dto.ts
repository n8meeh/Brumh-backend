import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetNearbyDto {
    @IsNotEmpty()
    @Type(() => Number) // Convierte "string" a número automáticamente
    @IsNumber()
    lat: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    lng: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    radius?: number = 10; // Si no mandan nada, buscamos en 10km
}