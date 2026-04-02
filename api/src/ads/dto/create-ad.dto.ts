import { IsArray, IsBoolean, IsDateString, IsEnum, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

type Location = 'home_feed' | 'group_list' | 'provider_list';

export class CreateAdDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  targetUrl?: string;

  @IsArray()
  @IsEnum(['home_feed', 'group_list', 'provider_list'], { each: true })
  location: Location[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ValidateIf((o) => o.startDate !== null && o.startDate !== undefined)
  @IsDateString()
  startDate?: string | null;

  @ValidateIf((o) => o.endDate !== null && o.endDate !== undefined)
  @IsDateString()
  endDate?: string | null;
}
