import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateVehicleEventDto {
    @IsInt()
    vehicleId: number;

    @IsEnum(['maintenance', 'repair', 'inspection', 'document', 'mileage'])
    type: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    cost?: number;

    @IsOptional()
    @IsInt()
    mileage?: number;

    @IsOptional()
    @IsString()
    attachmentUrl?: string;

    @IsOptional()
    @IsInt()
    orderId?: number;
}
