import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength, IsEmail } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsOptional()
    @IsString()
    fullName?: string; // Para llenar ese NULL de la base de datos

    @IsOptional()
    @IsString()
    bio?: string; // Una descripción corta

    @IsOptional()
    @IsString()
    avatarUrl?: string; // La URL que viene de Firebase

    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string; // Por si quiere cambiar su clave

    @IsOptional()
    @IsString()
    @IsEmail()
    email?: string;
}