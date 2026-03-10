import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetFeedDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    userId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    lat?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    lng?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    radius?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit?: number = 20;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    offset?: number = 0;

    @IsOptional()
    @IsEnum(['nearby', 'following', 'popular', 'recent'])
    filter?: 'nearby' | 'following' | 'popular' | 'recent';

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    tag?: string;
}