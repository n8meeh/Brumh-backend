import { IsOptional, IsString } from 'class-validator';

export class UpdateVehicleDocumentDto {
    @IsOptional() @IsString() photoUrl?: string;
    @IsOptional() @IsString() expiryDate?: string;
    @IsOptional() @IsString() notes?: string;
}
