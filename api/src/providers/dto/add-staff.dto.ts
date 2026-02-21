import { IsEmail, IsEnum, IsOptional } from 'class-validator';

export class AddStaffDto {
    @IsEmail()
    email: string; // Buscamos al empleado por correo

    @IsEnum(['admin', 'staff', 'viewer'])
    @IsOptional()
    role?: string = 'staff';
}