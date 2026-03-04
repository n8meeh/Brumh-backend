import { IsInt, IsPositive } from 'class-validator';

export class UnbanUserDto {
    @IsInt()
    @IsPositive()
    userId: number;
}
