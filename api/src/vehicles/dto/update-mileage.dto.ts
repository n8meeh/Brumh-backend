import { IsNumber, Min } from 'class-validator';

export class UpdateMileageDto {
    @IsNumber()
    @Min(0)
    mileage: number;
}