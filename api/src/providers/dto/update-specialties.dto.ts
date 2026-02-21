import { IsArray, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class UpdateSpecialtiesDto {
    // 🆕 SISTEMA JERÁRQUICO: Array de IDs de especialidades
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    specialtyIds?: number[]; // Ej: [1, 5, 12, 23] (Múltiples especialidades de diferentes categorías)

    // 🔧 LEGACY: Marcas de vehículos especializadas (mantener por compatibilidad)
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    brandIds?: number[];

    // 🚗 LEGACY: Tipos de vehículos que atiende (mantener por compatibilidad)
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    vehicleTypeIds?: number[];

    // 🎨 MULTIMARCA: Indica si el proveedor atiende todas las marcas
    @IsOptional()
    @IsBoolean()
    isMultibrand?: boolean;
}
