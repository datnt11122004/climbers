import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class TelegramLoginDto {
    @ApiProperty({ example: 123456789 })
    @Type(() => Number)
    @IsNumber()
    id: number;

    @ApiProperty({ example: 'John' })
    @IsString()
    first_name: string;

    @ApiPropertyOptional({ example: 'Doe' })
    @IsOptional()
    @IsString()
    last_name?: string;

    @ApiPropertyOptional({ example: 'johndoe' })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiPropertyOptional({ example: 'https://t.me/i/userpic/320/photo.jpg' })
    @IsOptional()
    @IsString()
    photo_url?: string;

    @ApiProperty({ example: 1709856000 })
    @Type(() => Number)
    @IsNumber()
    auth_date: number;

    @ApiProperty({ example: 'abc123def456...' })
    @IsString()
    hash: string;
}
