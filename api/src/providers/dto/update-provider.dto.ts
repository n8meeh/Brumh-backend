import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderDto } from './create-provider.dto';
import { IsBoolean, IsOptional, IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Clase anidada para validar contactos
export class ContactsDto {
    @IsOptional() @IsString() whatsapp?: string;
    @IsOptional() @IsString() instagram?: string;
    @IsOptional() @IsString() facebook?: string;
    @IsOptional() @IsString() tiktok?: string;
    @IsOptional() @IsString() website?: string;
    @IsOptional() @IsString() phone?: string;
}

export class UpdateProviderDto extends PartialType(CreateProviderDto) {
    // 🟢 EXCLUSIVO DE EDICIÓN

    // Para activar/desactivar el taller manualmente (Modo Vacaciones)
    @IsOptional()
    @IsBoolean()
    isVisible?: boolean;

    // Múltiples especialidades secundarias
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    secondaryCategories?: string[];

    // Servicio a domicilio
    @IsOptional()
    @IsBoolean()
    isHomeService?: boolean;

    // Imágenes del negocio
    @IsOptional()
    @IsString()
    logoUrl?: string;

    @IsOptional()
    @IsString()
    coverUrl?: string;

    // Contactos validados
    @IsOptional()
    @ValidateNested()
    @Type(() => ContactsDto)
    contacts?: ContactsDto;
}