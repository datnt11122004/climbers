import { IsDateString, IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryDailyDataDto {
    @ApiPropertyOptional({ description: 'Tracked App ID' })
    @IsInt()
    @IsOptional()
    @Type(() => Number)
    trackedAppId?: number;

    @ApiPropertyOptional({
        description: 'Start date (YYYY-MM-DD)',
        example: '2026-03-01'
    })
    @IsDateString()
    @IsOptional()
    from?: string;

    @ApiPropertyOptional({
        description: 'End date (YYYY-MM-DD)',
        example: '2026-03-08'
    })
    @IsDateString()
    @IsOptional()
    to?: string;

    @ApiPropertyOptional({ description: 'Page number', default: 1 })
    @IsInt()
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Items per page', default: 50 })
    @IsInt()
    @IsOptional()
    @Type(() => Number)
    limit?: number = 50;
}
