import { IsInt } from 'class-validator';

export class CreateChatDto {
    @IsInt()
    user1Id: number;

    @IsInt()
    user2Id: number;
}
