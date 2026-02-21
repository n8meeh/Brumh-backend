import { IsEnum, IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

// 🔥 ENUM ROBUSTO PARA CATEGORÍAS DE PROVIDER
export enum ProviderCategoryEnum {
  MECHANIC = 'mechanic',
  ELECTRICIAN = 'electrician',
  BODY_SHOP = 'body_shop',
  TIRES = 'tires',
  TOW = 'tow',
  WASH = 'wash',
  STORE = 'store',
  DRIVING_SCHOOL = 'driving_school',
  OTHER = 'other',
}

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

    // 🆕 OPCIONAL: Categoría con Enum Robusto (Default: 'other')
    @IsOptional()
    @IsEnum(ProviderCategoryEnum, { message: 'category debe ser una de las categorías permitidas' })
    category: string = ProviderCategoryEnum.OTHER;

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

    // Dirección escrita (Opcional por privacidad si es a domicilio)
    @IsOptional()
    @IsString()
    address?: string;

    // Categorías extra
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    secondaryCategories?: string[];

    // Servicio a domicilio (Default: false)
    @IsOptional()
    @IsBoolean()
    isHomeService?: boolean;
}