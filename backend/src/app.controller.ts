import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '#root/common/types';

@Controller()
export class AppController {
	@Get('health')
	getHealth(): ApiResponse<string> {
		return ApiResponse.OK();
	}
}
