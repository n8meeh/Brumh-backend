import { IsNumber, IsNotEmpty } from 'class-validator';

export class SolveCommentDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
