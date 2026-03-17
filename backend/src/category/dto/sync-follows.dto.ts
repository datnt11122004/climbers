import { IsArray, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SyncFollowsDto {
    @ApiProperty({
        example: [1, 2, 3],
        description: 'Array of category IDs to follow'
    })
    @IsArray()
    @IsInt({ each: true })
    categoryIds: number[];
}
