import {
    IsString,
    IsOptional,
    IsInt,
    MaxLength,
    IsBoolean
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Remote Control', maxLength: 100 })
    @IsString()
    @MaxLength(100)
    name: string;

    @ApiProperty({ example: 'remote', maxLength: 100 })
    @IsString()
    @MaxLength(100)
    slug: string;

    @ApiPropertyOptional({
        example: 'Ứng dụng điều khiển từ xa, remote desktop',
        maxLength: 500
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional({ example: 'monitor-smartphone', maxLength: 50 })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    icon?: string;

    @ApiPropertyOptional({ example: 'blue', maxLength: 30 })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    color?: string;

    @ApiPropertyOptional({ example: 0 })
    @IsOptional()
    @IsInt()
    sortOrder?: number;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    active?: boolean;
}
