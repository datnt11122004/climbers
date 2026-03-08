import { HttpClient } from './http';

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  active?: boolean;
  followersCount?: number;
  isFollowed?: boolean;
  _count?: { followers: number };
};

type CategoriesResponse = {
  success: boolean;
  data: Category[];
};

type CategoryResponse = {
  success: boolean;
  data: Category;
};

export type CreateCategoryDto = {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  active?: boolean;
};

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

export class CategoryService {
  static async getAll(): Promise<Category[]> {
    const res = await HttpClient.get<CategoriesResponse>('/categories');
    return res.data;
  }

  static async getOne(id: number): Promise<Category> {
    const res = await HttpClient.get<CategoryResponse>(`/categories/${id}`);
    return res.data;
  }

  static async getForUser(userId: number): Promise<Category[]> {
    const res = await HttpClient.get<CategoriesResponse>(`/categories/user/${userId}`);
    return res.data;
  }

  static async syncFollows(userId: number, categoryIds: number[]): Promise<Category[]> {
    const res = await HttpClient.put<CategoriesResponse>(`/categories/user/${userId}/follows`, { categoryIds });
    return res.data;
  }

  static async create(dto: CreateCategoryDto): Promise<Category> {
    const res = await HttpClient.post<CategoryResponse>('/categories', dto);
    return res.data;
  }

  static async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const res = await HttpClient.patch<CategoryResponse>(`/categories/${id}`, dto);
    return res.data;
  }

  static async delete(id: number): Promise<void> {
    await HttpClient.delete(`/categories/${id}`);
  }
}
