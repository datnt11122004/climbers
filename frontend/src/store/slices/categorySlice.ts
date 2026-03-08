import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category } from '@/services/category.service';

type CategoryState = {
  categories: Category[];
  loading: boolean;
  error: string | null;
};

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setCategories(state, action: PayloadAction<Category[]>) {
      state.categories = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCategoryLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
      if (action.payload) state.error = null;
    },
    setCategoryError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    updateCategory(state, action: PayloadAction<Category>) {
      const idx = state.categories.findIndex(c => c.id === action.payload.id);
      if (idx !== -1) state.categories[idx] = action.payload;
    },
    addCategory(state, action: PayloadAction<Category>) {
      state.categories.push(action.payload);
    },
    removeCategory(state, action: PayloadAction<number>) {
      state.categories = state.categories.filter(c => c.id !== action.payload);
    },
    toggleFollow(state, action: PayloadAction<number>) {
      const cat = state.categories.find(c => c.id === action.payload);
      if (cat) cat.isFollowed = !cat.isFollowed;
    },
  },
});

export const {
  setCategories,
  setCategoryLoading,
  setCategoryError,
  updateCategory,
  addCategory,
  removeCategory,
  toggleFollow,
} = categorySlice.actions;
export default categorySlice.reducer;
