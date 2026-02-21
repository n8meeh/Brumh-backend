import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVehicleDto {
    @IsNumber()
    @IsNotEmpty()
    modelId: number;

    @IsNumber()
    @IsOptional()
    year?: number;

    @IsString()
    @IsOptional()
    vin?: string;

    @IsString()
    @IsOptional()
    plate?: string;

    @IsString()
    @IsOptional()
    alias?: string;

    @IsNumber()
    @IsOptional()
    lastMileage?: number;

    @IsString()
    @IsOptional()
    photoUrl?: string;
}