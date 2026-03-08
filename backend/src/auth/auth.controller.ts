import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TelegramLoginDto } from './dto';
import { JwtAuthGuard } from './guards';
import { CurrentUser } from './decorators';
import { ApiResponse } from '#root/common/types';
import { TelegramUser } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('telegram')
	@ApiOperation({ summary: 'Login via Telegram Login Widget' })
	async telegramLogin(@Body() dto: TelegramLoginDto) {
		const data = await this.authService.validateTelegramLogin(dto);
		return ApiResponse.OK(data);
	}

	@Get('me')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get current authenticated user profile' })
	async getMe(@CurrentUser() user: TelegramUser) {
		return ApiResponse.OK({
			id: user.id,
			telegramId: user.telegramId.toString(),
			firstName: user.firstName,
			lastName: user.lastName,
			username: user.username,
			avatar: user.avatar,
			role: user.role,
		});
	}
}
