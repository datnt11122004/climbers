import {
	Injectable,
	CanActivate,
	ExecutionContext,
	UnauthorizedException,
	Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { APP_CONFIG, AppConfig } from '#root/config';
import { PrismaService } from '#root/prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly prisma: PrismaService,
		@Inject(APP_CONFIG) private readonly config: AppConfig,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.extractToken(request);

		if (!token) {
			throw new UnauthorizedException('Missing authorization token');
		}

		try {
			const payload = this.jwtService.verify(token, {
				secret: this.config.JWT_SECRET,
			});

			const user = await this.prisma.telegramUser.findUnique({
				where: { id: payload.sub },
			});

			if (!user) {
				throw new UnauthorizedException('User not found');
			}

			request.user = user;
			return true;
		} catch (error) {
			if (error instanceof UnauthorizedException) throw error;
			throw new UnauthorizedException('Invalid or expired token');
		}
	}

	private extractToken(request: any): string | null {
		const authHeader = request.headers['authorization'];
		if (!authHeader) return null;
		const [type, token] = authHeader.split(' ');
		return type === 'Bearer' ? token : null;
	}
}
