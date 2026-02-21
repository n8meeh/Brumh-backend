import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
    @IsInt({ message: 'orderId debe ser un número entero' })
    orderId: number;

    @IsNumber({}, { message: 'ratingQuality debe ser un número' })
    @Min(1, { message: 'ratingQuality debe ser al menos 1' })
    @Max(5, { message: 'ratingQuality no puede ser mayor a 5' })
    ratingQuality: number; // La obligatoria "General"

    // Opcionales
    @IsOptional()
    @IsNumber({}, { message: 'ratingComm debe ser un número' })
    @Min(1, { message: 'ratingComm debe ser al menos 1' })
    @Max(5, { message: 'ratingComm no puede ser mayor a 5' })
    ratingComm?: number;

    @IsOptional()
    @IsNumber({}, { message: 'ratingSpeed debe ser un número' })
    @Min(1, { message: 'ratingSpeed debe ser al menos 1' })
    @Max(5, { message: 'ratingSpeed no puede ser mayor a 5' })
    ratingSpeed?: number;

    @IsOptional()
    @IsNumber({}, { message: 'ratingPrice debe ser un número' })
    @Min(1, { message: 'ratingPrice debe ser al menos 1' })
    @Max(5, { message: 'ratingPrice no puede ser mayor a 5' })
    ratingPrice?: number;

    @IsOptional()
    @IsString({ message: 'comment debe ser una cadena de texto' })
    comment?: string;
}