import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderDto } from './create-provider.dto';
import { IsBoolean, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
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

    // Servicio a domicilio
    @IsOptional()
    @IsBoolean()
    isHomeService?: boolean;

    // URL del catálogo externo (MercadoLibre, sitio web, etc.)
    @IsOptional()
    @IsUrl({}, { message: 'El catálogo debe ser una URL válida' })
    catalogUrl?: string;

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