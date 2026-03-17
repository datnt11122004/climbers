import { IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AddTrackedAppDto {
    @ApiPropertyOptional({
        description:
            'Full Google Play Store URL (e.g. https://play.google.com/store/apps/details?id=com.example.app)',
        example:
            'https://play.google.com/store/apps/details?id=com.twitter.android'
    })
    @IsString()
    @IsOptional()
    url?: string;

    @ApiPropertyOptional({
        description: 'Raw bundle/package ID',
        example: 'com.twitter.android'
    })
    @IsString()
    @IsOptional()
    bundleId?: string;
}
