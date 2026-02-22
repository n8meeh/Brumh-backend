import { IsEnum, IsOptional, IsNumber, Min } from 'class-validator';

export class ResolveReportDto {
    @IsEnum(['dismiss', 'strike', 'ban'])
    action: 'dismiss' | 'strike' | 'ban';

    /** Días de baneo. Solo aplica cuando action === 'ban'. Default: 7 días. */
    @IsOptional()
    @IsNumber()
    @Min(1)
    banDays?: number;
}
