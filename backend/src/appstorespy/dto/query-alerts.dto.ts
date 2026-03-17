import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TriggerType } from '@prisma/client';

export class QueryAlertsDto {
    @ApiPropertyOptional({
        enum: TriggerType,
        description: 'Filter by trigger type'
    })
    @IsEnum(TriggerType)
    @IsOptional()
    triggerType?: TriggerType;

    @ApiPropertyOptional({ description: 'Tracked App ID' })
    @IsInt()
    @IsOptional()
    @Type(() => Number)
    trackedAppId?: number;

    @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD)' })
    @IsDateString()
    @IsOptional()
    from?: string;

    @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)' })
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
