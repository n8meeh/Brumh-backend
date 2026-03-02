import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class InviteStaffDto {
    @IsEmail({}, { message: 'Email inválido' })
    @IsNotEmpty({ message: 'El email es requerido' })
    email: string;

    @IsEnum(['provider_admin', 'provider_staff'], { message: 'Rol debe ser provider_admin o provider_staff' })
    @IsNotEmpty({ message: 'El rol es requerido' })
    role: 'provider_admin' | 'provider_staff';
}
