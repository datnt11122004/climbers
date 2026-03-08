import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Put,
	Body,
	Param,
	ParseIntPipe,
	UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto, SyncFollowsDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '#root/auth/guards';
import { Roles, CurrentUser } from '#root/auth/decorators';
import { ApiResponse } from '#root/common/types';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	// ─── Admin Endpoints ──────────────────────────────────

	@Post()
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	@ApiOperation({ summary: 'Create a new app category (Admin only)' })
	async create(@Body() dto: CreateCategoryDto) {
		const data = await this.categoryService.create(dto);
		return ApiResponse.OK(data);
	}

	@Patch(':id')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	@ApiOperation({ summary: 'Update a category (Admin only)' })
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateCategoryDto,
	) {
		const data = await this.categoryService.update(id, dto);
		return ApiResponse.OK(data);
	}

	@Delete(':id')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	@ApiOperation({ summary: 'Delete a category (Admin only)' })
	async remove(@Param('id', ParseIntPipe) id: number) {
		await this.categoryService.remove(id);
		return ApiResponse.OK();
	}

	// ─── Public Endpoints ─────────────────────────────────

	@Get()
	@ApiOperation({ summary: 'List all app categories' })
	async findAll() {
		const data = await this.categoryService.findAll();
		return ApiResponse.OK(data);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a single category by ID' })
	async findOne(@Param('id', ParseIntPipe) id: number) {
		const data = await this.categoryService.findOne(id);
		return ApiResponse.OK(data);
	}

	// ─── User Endpoints (requires login) ──────────────────

	@Get('user/:userId')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get all categories with user follow status' })
	async findAllForUser(@Param('userId', ParseIntPipe) userId: number) {
		const data = await this.categoryService.findAllWithFollowStatus(userId);
		return ApiResponse.OK(data);
	}

	@Put('user/:userId/follows')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Sync user followed categories (replace all)' })
	async syncFollows(
		@Param('userId', ParseIntPipe) userId: number,
		@Body() dto: SyncFollowsDto,
	) {
		const data = await this.categoryService.syncUserFollows(userId, dto.categoryIds);
		return ApiResponse.OK(data);
	}
}
