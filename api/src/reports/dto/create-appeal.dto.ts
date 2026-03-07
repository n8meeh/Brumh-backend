import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateAppealDto {
    @IsEmail({}, { message: 'El email no es válido' })
    email: string;

    @IsString()
    @MinLength(10, { message: 'La apelación debe tener al menos 10 caracteres' })
    @MaxLength(500, { message: 'La apelación no puede exceder los 500 caracteres' })
    message: string;
}
