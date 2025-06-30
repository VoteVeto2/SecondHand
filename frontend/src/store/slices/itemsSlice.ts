import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Item, ItemStatusType, ApiResponse } from '../../types';
import { apiService } from '../../services/api';

interface ItemsState {
  items: Item[];
  currentItem: Item | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    category?: string;
    status?: ItemStatusType;
    priceMin?: number;
    priceMax?: number;
    search?: string;
  };
}

const initialState: ItemsState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  },
  filters: {},
};

export const fetchItems = createAsyncThunk(
  'items/fetchItems',
  async (params: {
    page?: number;
    limit?: number;
    category?: string;
    status?: ItemStatusType;
    priceMin?: number;
    priceMax?: number;
    search?: string;
  }, { rejectWithValue }) => {
    try {
      const response: ApiResponse<Item[]> = await apiService.get('/items', params);
      if (response.success && response.data) {
        return { items: response.data, pagination: { page: 1, limit: 12, total: response.data.length, totalPages: 1 } };
      }
      return rejectWithValue(response.error || 'Failed to fetch items');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch items');
    }
  }
);

export const fetchItemById = createAsyncThunk(
  'items/fetchItemById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response: ApiResponse<Item> = await apiService.get(`/items/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to fetch item');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch item');
    }
  }
);

export const createItem = createAsyncThunk(
  'items/createItem',
  async (itemData: FormData, { rejectWithValue }) => {
    try {
      const response: ApiResponse<Item> = await apiService.post('/items', itemData);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to create item');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create item');
    }
  }
);

export const updateItem = createAsyncThunk(
  'items/updateItem',
  async ({ id, data }: { id: string; data: Partial<Item> }, { rejectWithValue }) => {
    try {
      const response: ApiResponse<Item> = await apiService.put(`/items/${id}`, data);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to update item');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update item');
    }
  }
);

export const deleteItem = createAsyncThunk(
  'items/deleteItem',
  async (id: string, { rejectWithValue }) => {
    try {
      const response: ApiResponse = await apiService.delete(`/items/${id}`);
      if (response.success) {
        return id;
      }
      return rejectWithValue(response.error || 'Failed to delete item');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete item');
    }
  }
);

export const fetchUserItems = createAsyncThunk(
  'items/fetchUserItems',
  async (_, { rejectWithValue }) => {
    try {
      const response: ApiResponse<Item[]> = await apiService.get('/items/my-items');
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to fetch user items');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user items');
    }
  }
);

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<ItemsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.pagination.page = 1;
    },
    updateItemStatus: (state, action: PayloadAction<{ id: string; status: ItemStatusType }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.status = action.payload.status;
      }
      if (state.currentItem && state.currentItem.id === action.payload.id) {
        state.currentItem.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchItemById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItemById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload;
        state.error = null;
      })
      .addCase(fetchItemById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        state.error = null;
      })
      .addCase(createItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentItem && state.currentItem.id === action.payload.id) {
          state.currentItem = action.payload;
        }
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.currentItem && state.currentItem.id === action.payload) {
          state.currentItem = null;
        }
      })
      .addCase(fetchUserItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchUserItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setFilters, clearFilters, updateItemStatus, setPage } = itemsSlice.actions;
export default itemsSlice.reducer;