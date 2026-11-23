/**
 * productsSlice.js - Redux Slice for Wholesale Product Catalog & Inventory
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages the supplier's wholesale catalog:
 * 1. Storing and searching active products supplied to retailers.
 * 2. Adding new products with validation, unit prices, stock, MOQ, and categories.
 * 3. Editing existing product specifications and live inventory stock.
 * 4. Deleting products and syncing changes with backend supplier record.
 * 5. Managing modal state and form inputs for add/edit product workflows.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { updateSupplier } from '../../api/supplierApi.js';
import { initSupplierProfile } from './profileSlice.js';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/**
 * Saves a product (adds new or updates existing) and synchronizes with backend.
 */
export const saveSupplierProduct = createAsyncThunk(
  'supplierProducts/saveProduct',
  async ({ productForm, editingProductIdx, supplierId, currentProducts }, { rejectWithValue }) => {
    try {
      if (!productForm.name || !productForm.price) {
        throw new Error('Please fill in Product Name and Unit Price.');
      }

      const newProd = {
        ...productForm,
        id: productForm.sku || productForm.id || `SKU-${Date.now()}`,
        sku: productForm.sku || productForm.id || `SKU-${Date.now()}`,
        name: productForm.name.trim(),
        brand: productForm.brand?.trim() || '—',
        variant: productForm.variant?.trim() || '',
        cat: productForm.cat || 'Electronics',
        category: productForm.cat || 'Electronics',
        unit: productForm.unit || 'Piece',
        price: Number(productForm.price),
        unitPrice: Number(productForm.price),
        stock: Number(productForm.stock || 0),
        stockAvailable: Number(productForm.stock || 0),
        moq: Number(productForm.moq || 1),
        minOrderQty: Number(productForm.moq || 1),
        status: 'active',
        desc: productForm.desc?.trim() || '',
        description: productForm.desc?.trim() || '',
      };

      let updated;
      if (editingProductIdx !== null && editingProductIdx !== undefined && editingProductIdx >= 0) {
        updated = currentProducts.map((p, i) => (i === editingProductIdx ? newProd : p));
      } else {
        updated = [newProd, ...currentProducts];
      }

      if (supplierId) {
        try {
          await updateSupplier(supplierId, { products: updated });
        } catch (backendErr) {
          console.warn('Failed to update products in backend:', backendErr);
        }
      }

      return {
        updatedProducts: updated,
        isEdit: editingProductIdx !== null && editingProductIdx !== undefined && editingProductIdx >= 0,
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save product');
    }
  }
);

/**
 * Deletes a product from the supplier catalog and synchronizes with backend.
 */
export const deleteSupplierProduct = createAsyncThunk(
  'supplierProducts/deleteProduct',
  async ({ productId, supplierId, currentProducts }, { rejectWithValue }) => {
    try {
      const updated = currentProducts.filter((p) => p.id !== productId && p.sku !== productId);

      if (supplierId) {
        try {
          await updateSupplier(supplierId, { products: updated });
        } catch (backendErr) {
          console.warn('Failed to delete product in backend:', backendErr);
        }
      }

      return updated;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete product');
    }
  }
);

// ─── Default Form Values ──────────────────────────────────────────────────────
const createDefaultProductForm = () => ({
  name: '',
  sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
  brand: '',
  variant: '',
  cat: 'Electronics',
  unit: 'Piece',
  price: '',
  stock: '100',
  moq: '1',
  desc: '',
});

// ─── Slice Definition ─────────────────────────────────────────────────────────

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    loading: false,
    error: null,
    productSearch: '',
    productModalOpen: false,
    editingProductIdx: null,
    productForm: createDefaultProductForm(),
  },
  reducers: {
    setProducts: (state, action) => {
      state.products = Array.isArray(action.payload) ? action.payload : [];
    },
    setProductSearch: (state, action) => {
      state.productSearch = action.payload;
    },
    openProductModal: (state, action) => {
      const idx = action.payload;
      if (idx !== null && idx !== undefined && state.products[idx]) {
        state.editingProductIdx = idx;
        state.productForm = { ...state.products[idx] };
      } else {
        state.editingProductIdx = null;
        state.productForm = createDefaultProductForm();
      }
      state.productModalOpen = true;
    },
    closeProductModal: (state) => {
      state.productModalOpen = false;
      state.editingProductIdx = null;
      state.productForm = createDefaultProductForm();
    },
    setProductForm: (state, action) => {
      state.productForm = { ...state.productForm, ...action.payload };
    },
    updateProductFormField: (state, action) => {
      const { field, value } = action.payload;
      state.productForm[field] = value;
    },
    resetProductForm: (state) => {
      state.productForm = createDefaultProductForm();
      state.editingProductIdx = null;
    },
    clearProductsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Auto-populate when profile loads
      .addCase(initSupplierProfile.fulfilled, (state, action) => {
        const s = action.payload.supplierRecord;
        if (s && Array.isArray(s.products)) {
          state.products = s.products.map((p) => ({
            ...p,
            id: p.sku || p.id || `SKU-${Date.now()}`,
            sku: p.sku || p.id || '',
            cat: p.category || p.cat || 'Electronics',
            category: p.category || p.cat || 'Electronics',
            price: Number(p.unitPrice ?? p.price ?? 0),
            unitPrice: Number(p.unitPrice ?? p.price ?? 0),
            stock: Number(p.stockAvailable ?? p.stock ?? 0),
            stockAvailable: Number(p.stockAvailable ?? p.stock ?? 0),
            moq: Number(p.minOrderQty ?? p.moq ?? 1),
            minOrderQty: Number(p.minOrderQty ?? p.moq ?? 1),
            unit: p.unit || 'Piece',
            status: p.status || 'active',
            desc: p.description || p.desc || '',
          }));
        } else if (!s) {
          state.products = [];
        }
      })

      // Save product
      .addCase(saveSupplierProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveSupplierProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.updatedProducts;
        state.productModalOpen = false;
        state.editingProductIdx = null;
        state.productForm = createDefaultProductForm();
      })
      .addCase(saveSupplierProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to save product';
      })

      // Delete product
      .addCase(deleteSupplierProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSupplierProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(deleteSupplierProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete product';
      });
  },
});

export const {
  setProducts,
  setProductSearch,
  openProductModal,
  closeProductModal,
  setProductForm,
  updateProductFormField,
  resetProductForm,
  clearProductsError,
} = productsSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectSupplierProducts = (state) => state.products.products;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;
export const selectProductSearch = (state) => state.products.productSearch;
export const selectProductModalOpen = (state) => state.products.productModalOpen;
export const selectEditingProductIdx = (state) => state.products.editingProductIdx;
export const selectProductForm = (state) => state.products.productForm;

export const selectFilteredProducts = (state) => {
  const products = state.products.products;
  const q = (state.products.productSearch || '').toLowerCase().trim();
  if (!q) return products;
  return products.filter(
    (p) =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.id && p.id.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.cat && p.cat.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q))
  );
};

export default productsSlice.reducer;
