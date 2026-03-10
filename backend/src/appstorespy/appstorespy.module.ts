import { Module } from '@nestjs/common';
import { AppStoreSpyService } from './appstorespy.service';
import { AppStoreSpyCrawlService } from './appstorespy-crawl.service';
import { AppStoreSpyTriggerService } from './appstorespy-trigger.service';
import { AppStoreSpyNotifyService } from './appstorespy-notify.service';
import { AppStoreSpyController } from './appstorespy.controller';
import { AuthModule } from '#root/auth/auth.module';

@Module({
	providers: [
		AppStoreSpyService,
		AppStoreSpyNotifyService,
		AppStoreSpyTriggerService,
		AppStoreSpyCrawlService,
	],
	controllers: [AppStoreSpyController],
	exports: [AppStoreSpyService, AppStoreSpyCrawlService],
	imports: [AuthModule],
})
export class AppStoreSpyModule {}