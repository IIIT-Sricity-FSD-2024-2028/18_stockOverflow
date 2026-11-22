/**
 * purchaseOrdersSlice.js - Redux Slice for Wholesale Purchase Orders & Supplier Catalogs
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages procurement and inventory restocking:
 * 1. Fetching existing purchase orders history with status (Draft, Pending, In Transit, Delivered).
 * 2. Creating and transmitting purchase orders to suppliers.
 * 3. Browsing wholesale supplier product catalogues with live wholesale prices & lead times.
 * 4. Storing staged items to be attached to a new purchase order.
 * 5. Viewing complete PO invoice and delivery breakdowns.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { retailerApi } from '../../api/retailerApi';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchPurchaseOrders = createAsyncThunk(
  'retailerPO/fetchPurchaseOrders',
  async ({ retailerId = '', storeId = '' } = {}, { rejectWithValue }) => {
    try {
      const data = await retailerApi.getPurchaseOrders(retailerId, storeId);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch purchase orders');
    }
  }
);

export const createPurchaseOrder = createAsyncThunk(
  'retailerPO/createPurchaseOrder',
  async (poData, { rejectWithValue }) => {
    try {
      const result = await retailerApi.createPurchaseOrder(poData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create purchase order');
    }
  }
);

export const fetchPOCatalogue = createAsyncThunk(
  'retailerPO/fetchPOCatalogue',
  async ({ supplierName = '', supplierId = '', retailerId = '' }, { rejectWithValue }) => {
    try {
      const [suppliersRes, productsRes] = await Promise.all([
        retailerApi.getSuppliers().catch(() => []),
        retailerApi.getProducts(retailerId).catch(() => []),
      ]);

      let items = [];

      // 1. Check if supplier has specific catalogue products
      if (Array.isArray(suppliersRes)) {
        const sNameLower = supplierName.toLowerCase().trim();
        const foundSup = suppliersRes.find((s) => {
          if (supplierId && s.id === supplierId) return true;
          const name = (s.name || s.companyName || s.business?.companyName || '').toLowerCase().trim();
          return name === sNameLower || name.includes(sNameLower) || sNameLower.includes(name);
        });

        if (foundSup && Array.isArray(foundSup.products) && foundSup.products.length > 0) {
          foundSup.products.forEach((sp, idx) => {
            const price = Math.round(Number(sp.unitPrice || sp.price || 500));
            items.push({
              id: sp.sku || sp.id || `SUP-${idx + 1}`,
              name: sp.name || 'Supplier Product',
              emoji: sp.emoji || '📦',
              sku: sp.sku || `SKU-SUP-${idx + 1}`,
              cat: sp.category || 'General',
              price: price,
              stock: Number(sp.stockAvailable || sp.stock || 80),
              stockStatus: Number(sp.stockAvailable || 80) > 10 ? 'ok' : Number(sp.stockAvailable || 80) > 0 ? 'low' : 'out',
              brand: sp.brand || supplierName,
              supplier: supplierName,
              profitMargin: 10,
            });
          });
        }
      }

      // 2. Fallback to existing products catalog
      if (items.length === 0 && Array.isArray(productsRes) && productsRes.length > 0) {
        items = productsRes.map((p) => {
          const retailPrice = Number(p.price || 500);
          const wholesalePrice = p.cost ? Number(p.cost) : Math.round(retailPrice * 0.7);
          const stock = Number(p.qty != null ? p.qty : 15);
          return {
            id: p.id,
            name: p.name,
            emoji: p.emoji || '📦',
            sku: p.sku || 'SKU-001',
            cat: p.category || 'General',
            price: wholesalePrice,
            stock: stock,
            stockStatus: stock > 10 ? 'ok' : stock > 0 ? 'low' : 'out',
            brand: p.brand || supplierName,
            supplier: supplierName,
            profitMargin: retailPrice > wholesalePrice ? Math.round(((retailPrice - wholesalePrice) / retailPrice) * 100) : 15,
          };
        });
      }

      return items;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch PO catalogue');
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────

const purchaseOrdersSlice = createSlice({
  name: 'purchaseOrders',
  initialState: {
    orders: [],
    selectedPODetail: null,
    catalogue: [],
    stagedPOProducts: {},
    selectedSupplierForPO: null,
    loading: false,
    catalogueLoading: false,
    submitting: false,
    error: null,
    message: null,
  },
  reducers: {
    setSelectedPODetail: (state, action) => {
      state.selectedPODetail = action.payload;
    },
    clearSelectedPODetail: (state) => {
      state.selectedPODetail = null;
    },
    setSelectedSupplierForPO: (state, action) => {
      state.selectedSupplierForPO = action.payload;
    },
    setStagedPOProducts: (state, action) => {
      state.stagedPOProducts = action.payload || {};
    },
    clearStagedPOProducts: (state) => {
      state.stagedPOProducts = {};
    },
    clearPOError: (state) => {
      state.error = null;
    },
    clearPOMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Purchase Orders
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Purchase Order
      .addCase(createPurchaseOrder.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) {
          state.orders.unshift(action.payload);
        }
        state.stagedPOProducts = {};
        state.message = 'Purchase order submitted successfully';
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // Fetch Catalogue
      .addCase(fetchPOCatalogue.pending, (state) => {
        state.catalogueLoading = true;
      })
      .addCase(fetchPOCatalogue.fulfilled, (state, action) => {
        state.catalogueLoading = false;
        state.catalogue = action.payload;
      })
      .addCase(fetchPOCatalogue.rejected, (state) => {
        state.catalogueLoading = false;
      });
  },
});

export const {
  setSelectedPODetail,
  clearSelectedPODetail,
  setSelectedSupplierForPO,
  setStagedPOProducts,
  clearStagedPOProducts,
  clearPOError,
  clearPOMessage,
} = purchaseOrdersSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectPurchaseOrders = (state) => state.purchaseOrders.orders;
export const selectSelectedPODetail = (state) => state.purchaseOrders.selectedPODetail;
export const selectSelectedSupplierForPO = (state) => state.purchaseOrders.selectedSupplierForPO;
export const selectStagedPOProducts = (state) => state.purchaseOrders.stagedPOProducts;
export const selectPOCatalogue = (state) => state.purchaseOrders.catalogue;
export const selectPOLoading = (state) => state.purchaseOrders.loading;
export const selectCatalogueLoading = (state) => state.purchaseOrders.catalogueLoading;
export const selectPOSubmitting = (state) => state.purchaseOrders.submitting;
export const selectPOError = (state) => state.purchaseOrders.error;
export const selectPOMessage = (state) => state.purchaseOrders.message;

export default purchaseOrdersSlice.reducer;
