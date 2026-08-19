import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import type { VehicleDocumentType } from '../entities/vehicle-document.entity';

export class CreateVehicleDocumentDto {
    @IsEnum(['soap', 'revision_tecnica', 'permiso_circulacion', 'padron', 'seguro_complementario', 'otro'])
    type: VehicleDocumentType;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    label?: string;

    @IsNotEmpty()
    @IsString()
    photoUrl: string;

    @IsOptional()
    @IsString()
    expiryDate?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
