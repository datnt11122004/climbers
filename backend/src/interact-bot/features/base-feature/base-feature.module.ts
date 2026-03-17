import { Module } from '@nestjs/common';
import { BaseFeature } from '#root/interact-bot/features/base-feature/base-feature';

@Module({
    imports: [],
    providers: [BaseFeature],
    exports: [BaseFeature]
})
export class BaseFeatureModule {}
