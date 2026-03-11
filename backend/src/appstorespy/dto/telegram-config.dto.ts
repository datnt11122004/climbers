import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTelegramConfigDto {
	@ApiProperty({ description: 'Bot ID', example: 1 })
	@IsInt()
	@Type(() => Number)
	botId: number;

	@ApiProperty({ description: 'Telegram Chat ID (group/channel)', example: '-1001234567890' })
	@IsString()
	chatId: string;

	@ApiPropertyOptional({ description: 'Topic/Thread ID (for supergroups with topics)', example: 5 })
	@IsInt()
	@IsOptional()
	@Type(() => Number)
	topicId?: number;

	@ApiPropertyOptional({ description: 'Human-readable group name', example: 'AppSpy Alerts' })
	@IsString()
	@IsOptional()
	groupName?: string;

	@ApiPropertyOptional({ description: 'Whether this config is active', default: true })
	@IsBoolean()
	@IsOptional()
	active?: boolean;
}

export class UpdateTelegramConfigDto {
	@ApiPropertyOptional()
	@IsInt()
	@IsOptional()
	@Type(() => Number)
	botId?: number;

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	chatId?: string;

	@ApiPropertyOptional()
	@IsInt()
	@IsOptional()
	@Type(() => Number)
	topicId?: number;

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	groupName?: string;

	@ApiPropertyOptional()
	@IsBoolean()
	@IsOptional()
	active?: boolean;
}
