import { IsArray, IsNumber } from 'class-validator';

export class UpdateVehicleTypesDto {
    @IsArray()
    @IsNumber({}, { each: true })
    typeIds: number[]; // Ej: [1, 2]
}