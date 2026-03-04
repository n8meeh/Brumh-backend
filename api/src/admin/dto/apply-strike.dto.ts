import { IsInt, IsPositive } from 'class-validator';

export class ApplyStrikeDto {
    @IsInt()
    @IsPositive()
    userId: number;
}
