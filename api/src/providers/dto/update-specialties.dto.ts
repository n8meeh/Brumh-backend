import { IsArray, IsNumber, IsOptional, IsBoolean, IsString } from 'class-validator';

export class UpdateSpecialtiesDto {
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    specialtyIds?: number[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    brandNames?: string[];

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    vehicleTypeIds?: number[];

    @IsOptional()
    @IsBoolean()
    isMultibrand?: boolean;
}
