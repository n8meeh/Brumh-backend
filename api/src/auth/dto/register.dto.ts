import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Email inválido' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;

    @IsString()
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    fullName: string; // ✅ Usamos camelCase para el frontend

    @IsOptional()
    @IsEnum(['user', 'mechanic', 'tow'], { message: 'Rol inválido' })
    role?: string; // Opcional, por defecto será 'user'
}
