import { IsOptional, IsString } from 'class-validator';

export class UpdateTokenDto {
    @IsOptional()
    @IsString()
    token: string | null;
}
