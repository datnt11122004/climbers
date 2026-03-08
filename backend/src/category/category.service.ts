import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '#root/prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoryService {
	constructor(private readonly prisma: PrismaService) {}

	// ─── Admin CRUD ───────────────────────────────────────

	async create(dto: CreateCategoryDto) {
		return this.prisma.appCategory.create({ data: dto });
	}

	async findAll() {
		return this.prisma.appCategory.findMany({
			orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
			include: { _count: { select: { followers: true } } },
		});
	}

	async findOne(id: number) {
		const category = await this.prisma.appCategory.findUnique({
			where: { id },
			include: { _count: { select: { followers: true } } },
		});
		if (!category) {
			throw new NotFoundException(`Category with id ${id} not found`);
		}
		return category;
	}

	async update(id: number, dto: UpdateCategoryDto) {
		await this.findOne(id); // throws if not found
		return this.prisma.appCategory.update({
			where: { id },
			data: dto,
		});
	}

	async remove(id: number) {
		await this.findOne(id); // throws if not found
		return this.prisma.appCategory.delete({ where: { id } });
	}

	// ─── User Category Follows ────────────────────────────

	async findAllWithFollowStatus(userId: number) {
		const categories = await this.prisma.appCategory.findMany({
			where: { active: true },
			orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
			include: {
				followers: {
					where: { userId },
					select: { id: true },
				},
				_count: { select: { followers: true } },
			},
		});

		return categories.map((cat) => ({
			id: cat.id,
			name: cat.name,
			slug: cat.slug,
			description: cat.description,
			icon: cat.icon,
			color: cat.color,
			sortOrder: cat.sortOrder,
			followersCount: cat._count.followers,
			isFollowed: cat.followers.length > 0,
		}));
	}

	async syncUserFollows(userId: number, categoryIds: number[]) {
		// Verify user exists
		const user = await this.prisma.telegramUser.findUnique({
			where: { id: userId },
			select: { id: true },
		});
		if (!user) {
			throw new NotFoundException(`User with id ${userId} not found`);
		}

		// Use a transaction: delete all current follows, then create new ones
		await this.prisma.$transaction(async (tx) => {
			// Remove all existing follows for this user
			await tx.userCategoryFollow.deleteMany({
				where: { userId },
			});

			// Create new follows (only for valid category IDs)
			if (categoryIds.length > 0) {
				const validCategories = await tx.appCategory.findMany({
					where: { id: { in: categoryIds }, active: true },
					select: { id: true },
				});

				const data = validCategories.map((cat) => ({
					userId,
					categoryId: cat.id,
				}));

				await tx.userCategoryFollow.createMany({ data });
			}
		});

		// Return updated follow status
		return this.findAllWithFollowStatus(userId);
	}
}
