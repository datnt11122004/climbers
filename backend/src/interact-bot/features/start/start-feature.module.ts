import { Module } from '@nestjs/common';
import { StartFeatureService } from '#root/interact-bot/features/start/start-feature.service';

@Module({
	imports: [],
	providers: [StartFeatureService],
	exports: [StartFeatureService],
})
export class StartFeatureModule {}
