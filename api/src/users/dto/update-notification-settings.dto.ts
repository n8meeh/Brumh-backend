import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateNotificationSettingsDto {
    @IsOptional()
    @IsBoolean()
    socialLike?: boolean;

    @IsOptional()
    @IsBoolean()
    socialComment?: boolean;

    @IsOptional()
    @IsBoolean()
    socialFollow?: boolean;

    @IsOptional()
    @IsBoolean()
    chatMessage?: boolean;

    @IsOptional()
    @IsBoolean()
    postSolved?: boolean;

    @IsOptional()
    @IsBoolean()
    groupJoinRequest?: boolean;

    @IsOptional()
    @IsBoolean()
    groupRequestUpdate?: boolean;

    @IsOptional()
    @IsBoolean()
    orderUpdate?: boolean;
}
