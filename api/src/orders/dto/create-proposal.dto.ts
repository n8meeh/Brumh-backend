import { IsNumber, IsString, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateProposalDto {
    @IsNumber()
    @IsNotEmpty()
    postId: number;

    @IsString()
    @IsNotEmpty()
    message: string;

    @IsNumber()
    @IsPositive()
    price: number;
}