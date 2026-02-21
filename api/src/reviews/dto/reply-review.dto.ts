import { IsNotEmpty, IsString } from 'class-validator';

export class ReplyReviewDto {
    @IsNotEmpty({ message: 'La respuesta no puede estar vacía' })
    @IsString({ message: 'La respuesta debe ser un texto' })
    response: string; // El texto de defensa del taller
}