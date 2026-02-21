import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';

export class CreateMessageDto {
    @IsNumber()
    @IsNotEmpty()
    orderId: number;

    @IsString()
    @IsNotEmpty()
    message: string;

    @IsNumber()
    @IsOptional()
    proposedPrice?: number; // Opcional: El usuario podría decir "Te doy 35.000"

    @IsDateString()
    @IsOptional()
    proposedDate?: string; // Opcional: Fecha propuesta en formato ISO8601

    @IsBoolean()
    @IsOptional()
    proposedIsHomeService?: boolean; // Opcional: Si el servicio debe ser a domicilio
}