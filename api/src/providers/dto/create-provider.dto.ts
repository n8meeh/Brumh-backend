import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ContactsDto {
    @IsOptional() @IsString() whatsapp?: string;
    @IsOptional() @IsString() instagram?: string;
    @IsOptional() @IsString() facebook?: string;
    @IsOptional() @IsString() tiktok?: string;
    @IsOptional() @IsString() website?: string;
    @IsOptional() @IsString() phone?: string;
}

export class CreateProviderDto {
    // 🟢 OBLIGATORIOS
    @IsString()
    @IsNotEmpty({ message: 'El nombre del negocio es obligatorio' })
    businessName: string;

    @IsString()
    @IsNotEmpty({ message: 'La descripción es obligatoria' })
    description: string;

    // 📞 CONTACTOS: Obligatorio y Validado
    @IsNotEmpty({ message: 'Debes agregar al menos un contacto' })
    @ValidateNested()
    @Type(() => ContactsDto)
    contacts: ContactsDto;

    // 📍 UBICACIÓN: Coordenadas Obligatorias
    @IsNumber()
    @IsNotEmpty()
    lat: number;

    @IsNumber()
    @IsNotEmpty()
    lng: number;

    // 🟡 OPCIONALES
    @IsOptional()
    @IsString()
    openingHours?: string;

    // URL del catálogo externo (MercadoLibre, sitio web, etc.)
    @IsOptional()
    @IsUrl({}, { message: 'El catálogo debe ser una URL válida' })
    catalogUrl?: string;

    // Dirección escrita (Opcional por privacidad si es a domicilio)
    @IsOptional()
    @IsString()
    address?: string;

    // Servicio a domicilio (Default: false)
    @IsOptional()
    @IsBoolean()
    isHomeService?: boolean;
}