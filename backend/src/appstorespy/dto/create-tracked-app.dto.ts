import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Store } from '@prisma/client';

export class CreateTrackedAppDto {
	@ApiProperty({ description: 'App ID / Bundle ID on the store', example: 'com.twitter.android' })
	@IsString()
	@IsNotEmpty()
	appId: string;

	@ApiProperty({ enum: Store, default: Store.PLAY, description: 'Store type: PLAY or IOS' })
	@IsEnum(Store)
	@IsOptional()
	store?: Store = Store.PLAY;

	@ApiProperty({ description: 'App display name', example: 'Twitter / X' })
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiPropertyOptional({ description: 'App category', example: 'SOCIAL' })
	@IsString()
	@IsOptional()
	category?: string;

	@ApiPropertyOptional({ description: 'App icon URL' })
	@IsString()
	@IsOptional()
	icon?: string;
}
