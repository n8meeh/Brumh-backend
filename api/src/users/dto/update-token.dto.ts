import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTokenDto {
    @IsString()
    @IsNotEmpty()
    token: string;
}