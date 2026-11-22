/**
 * productsSlice.js - Redux Slice for Retailer Products & Inventory Catalog
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages the core inventory catalog for the retailer:
 * 1. Fetching all retail products scoped by retailerId and current store.
 * 2. Adding new products to the catalog (including multi-step wizard details).
 * 3. Updating existing product information, pricing, variants, and stock thresholds.
 * 4. Deleting products from the catalog.
 * 5. Calculating inventory analytics (total SKUs, total units, valuation, low/out of stock counts).
 * 6. Generating reorder recommendations based on min/max stock thresholds.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { retailerApi } from '../../api/retailerApi';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchProducts = createAsyncThunk(
  'retailerProducts/fetchProducts',
  async ({ retailerId = '', storeId = '' } = {}, { rejectWithValue }) => {
    try {
      const data = await retailerApi.getProducts(retailerId, storeId);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'retailerProducts/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await retailerApi.getProductById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || `Failed to fetch product ${id}`);
    }
  }
);

export const createProduct = createAsyncThunk(
  'retailerProducts/createProduct',
  async (productData, { rejectWithValue, dispatch }) => {
    try {
      const result = await retailerApi.createProduct(productData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'retailerProducts/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const result = await retailerApi.updateProduct(id, productData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'retailerProducts/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await retailerApi.deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete product');
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    selectedProduct: null,
    loading: false,
    submitting: false,
    error: null,
    message: null,
  },
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    clearProductError: (state) => {
      state.error = null;
    },
    clearProductMessage: (state) => {
      state.message = null;
    },
    setLocalProducts: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) {
          state.items.unshift(action.payload);
        }
        state.message = 'Product created successfully';
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload && action.payload.id) {
          const index = state.items.findIndex((p) => p.id === action.payload.id);
          if (index !== -1) {
            state.items[index] = action.payload;
          }
          if (state.selectedProduct?.id === action.payload.id) {
            state.selectedProduct = action.payload;
          }
        }
        state.message = 'Product updated successfully';
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((p) => p.id !== action.payload);
        if (state.selectedProduct?.id === action.payload) {
          state.selectedProduct = null;
        }
        state.message = 'Product deleted successfully';
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedProduct,
  clearSelectedProduct,
  clearProductError,
  clearProductMessage,
  setLocalProducts,
} = productsSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectProducts = (state) => state.products.items;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsSubmitting = (state) => state.products.submitting;
export const selectProductsError = (state) => state.products.error;
export const selectProductsMessage = (state) => state.products.message;
export const selectSelectedProduct = (state) => state.products.selectedProduct;

export const selectLowStockProducts = (state) => {
  const items = state.products.items;
  return items.filter((p) => Number(p.qty || p.quantity || 0) <= Number(p.min || 10));
};

export const selectOutOfStockProducts = (state) => {
  const items = state.products.items;
  return items.filter((p) => Number(p.qty || p.quantity || 0) === 0);
};

export const selectInventoryStats = (state) => {
  const items = state.products.items;
  const totalSKUs = items.length;
  const totalUnits = items.reduce((acc, p) => acc + (Number(p.qty || p.quantity) || 0), 0);
  const totalValue = items.reduce(
    (acc, p) => acc + (Number(p.qty || p.quantity) || 0) * (Number(p.price) || 0),
    0
  );

  const lowStock = items.filter(
    (p) => (Number(p.qty || p.quantity) || 0) <= (Number(p.min) || 10) && (Number(p.qty || p.quantity) || 0) > 0
  );
  const outStock = items.filter((p) => (Number(p.qty || p.quantity) || 0) === 0);
  const inStock = items.filter(
    (p) => (Number(p.qty || p.quantity) || 0) > (Number(p.min) || 10)
  );

  const inStockUnits = inStock.reduce((acc, p) => acc + (Number(p.qty || p.quantity) || 0), 0);
  const lowStockUnits = lowStock.reduce((acc, p) => acc + (Number(p.qty || p.quantity) || 0), 0);
  const outStockUnits = outStock.reduce((acc, p) => acc + (Number(p.qty || p.quantity) || 0), 0);

  const inStockPct = totalUnits > 0 ? Math.round((inStockUnits / totalUnits) * 100) : 0;
  const lowStockPct = totalUnits > 0 ? Math.round((lowStockUnits / totalUnits) * 100) : 0;
  const outStockPct = totalUnits > 0 ? Math.max(0, 100 - inStockPct - lowStockPct) : 0;
  const inStockRate = totalSKUs > 0 ? Math.round(((totalSKUs - outStock.length) / totalSKUs) * 100) : 0;

  return {
    totalSKUs,
    totalUnits,
    totalValue,
    lowStockCount: lowStock.length,
    outStockCount: outStock.length,
    inStockCount: inStock.length,
    inStockUnits,
    lowStockUnits,
    outStockUnits,
    inStockPct,
    lowStockPct,
    outStockPct,
    inStockRate,
  };
};

export const selectReorderRecommendations = (state) => {
  const items = state.products.items;
  return items.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    qty: Number(p.qty || 0),
    min: Number(p.min || 10),
    suggested: Math.max(20, (Number(p.max || 50)) - (Number(p.qty || 0))),
    supplier: p.supplier || 'Primary Supplier',
    leadTime: '3 Days',
    status: Number(p.qty || 0) <= 5 ? 'Critical' : Number(p.qty || 0) <= Number(p.min || 10) ? 'Low Stock' : 'Adequate',
    statusColor: Number(p.qty || 0) <= 5 ? '#ef4444' : Number(p.qty || 0) <= Number(p.min || 10) ? '#f59e0b' : '#22c55e',
  }));
};

export default productsSlice.reducer;
