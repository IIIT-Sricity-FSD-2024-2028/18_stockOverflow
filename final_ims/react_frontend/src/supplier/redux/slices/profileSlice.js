/**
 * profileSlice.js - Redux Slice for Supplier Profile, Identification & Documents
 * 
 * IN LAYMAN'S TERMS:
 * This slice manages:
 * 1. Supplier identity resolution (supplier ID auto-detection from session, storage, or backend).
 * 2. Supplier business profile fields (name, GST, category, contact, address, plan tier).
 * 3. 5-step initial setup wizard submission (`submitSupplierSetup`).
 * 4. Document vault management (fetching, uploading, and deleting legal/tax certificates).
 * 5. Subscription plan and billing tier updates.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  readSupplierId,
  writeSupplierId,
  readSession,
  writeSession,
  getSupplier,
  updateSupplier,
  createSupplierSetup,
  fetchSupplierDocuments,
  deleteSupplierDocument,
  uploadSupplierDocument,
  updateUser,
  supplierRequest,
} from '../../api/supplierApi.js';

// ─── Initial State Helpers ───────────────────────────────────────────────────

const getInitialProfile = () => {
  try {
    const sess = JSON.parse(localStorage.getItem('so_session') || '{}');
    const p = sess.profile || {};
    if (sess && (sess.role === 'supplier' || sess.role === 'wholesale')) {
      return {
        supplierName: p.businessName || sess.name || 'Supplier',
        supplierCode: p.supplierCode || sess.profileId || '',
        email: p.businessEmail || sess.email || '',
        phone: p.businessPhone || sess.phone || '',
        category: p.primaryCategory || sess.category || 'General Wholesale',
        state: p.state || sess.state || 'Gujarat',
        paymentTerms: p.paymentTerms || 'Net 30',
        address: p.address || sess.address || '',
        website: p.website || sess.website || '',
        gstNumber: p.taxId || '',
        taxId: p.taxId || '',
        leadTime: '3',
        description: p.description || '',
        planTier: sess.plan === 'enterprise' ? 'Bharat Enterprise' : (sess.plan === 'growth' ? 'Bharat Growth' : 'Starter Kirana'),
        planPrice: sess.plan === 'enterprise' ? 3499 : (sess.plan === 'growth' ? 1499 : 0),
        profileStatus: p.profileStatus || 'active',
      };
    }
  } catch {}
  return {
    supplierName: 'Supplier',
    supplierCode: '',
    email: '',
    phone: '',
    category: 'General Wholesale',
    state: 'Gujarat',
    paymentTerms: 'Net 30',
    address: '',
    website: '',
    gstNumber: '',
    taxId: '',
    leadTime: '3',
    description: '',
    planTier: 'Starter Kirana',
    planPrice: 0,
    profileStatus: 'active',
  };
};

const getInitialSupplierId = () => {
  try {
    return readSupplierId() || '';
  } catch {
    return '';
  }
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/**
 * Initializes and auto-resolves the active supplier profile from session, URL, or backend.
 */
export const initSupplierProfile = createAsyncThunk(
  'supplierProfile/initSupplierProfile',
  async (_, { rejectWithValue }) => {
    try {
      const sess = readSession() || {};
      let sid = readSupplierId() || sess.profileId || sess.supplierId || '';

      if (!sid) {
        try {
          const p = new URLSearchParams(window.location.search).get('supplierId');
          if (p) {
            sid = p;
            writeSupplierId(p);
          }
        } catch {}
      }

      let s = null;
      if (sid) {
        try {
          s = await getSupplier(sid);
        } catch (err) {
          console.warn('Failed to load supplier with sid:', sid, err);
          s = null;
        }
      }

      // If supplier not found by ID, search by logged-in user email
      if (!s && (sess.email || sess.profileId || sess.supplierId)) {
        try {
          const sups = await supplierRequest('/suppliers').catch(() => []);
          if (Array.isArray(sups) && sups.length > 0) {
            const userEmail = (sess.email || '').toLowerCase();
            const matched = sups.find(
              (sup) =>
                (sup.id && (sup.id === sess.profileId || sup.id === sess.supplierId)) ||
                (sup.business?.businessEmail && sup.business.businessEmail.toLowerCase() === userEmail) ||
                (sup.primaryContact?.directEmail && sup.primaryContact.directEmail.toLowerCase() === userEmail) ||
                (sup.email && sup.email.toLowerCase() === userEmail)
            );
            if (matched) {
              sid = matched.id;
              writeSupplierId(sid);
              s = matched;
            }
          }
        } catch (e) {
          console.error('Error auto-resolving supplier:', e);
        }
      }

      let documents = [];
      if (sid) {
        try {
          const docs = await fetchSupplierDocuments(sid);
          if (Array.isArray(docs)) documents = docs;
        } catch (docErr) {
          console.warn('Documents fetch note:', docErr);
        }
      }

      return {
        supplierId: sid,
        supplierRecord: s,
        documents,
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to initialize supplier profile');
    }
  }
);

/**
 * Updates supplier business profile details in backend.
 */
export const updateSupplierProfile = createAsyncThunk(
  'supplierProfile/updateProfile',
  async ({ supplierId, profileData }, { rejectWithValue }) => {
    try {
      if (supplierId) {
        await updateSupplier(supplierId, profileData);
      }
      return profileData;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update supplier profile');
    }
  }
);

/**
 * Submits the initial 3-step setup wizard and creates supplier in backend.
 */
export const submitSupplierSetup = createAsyncThunk(
  'supplierProfile/submitSetup',
  async ({ business, contact, products, user, saveSession, refreshUser }, { rejectWithValue }) => {
    try {
      const cleanSid = business.supplierCode.trim() || `SUP-${Math.floor(1000 + Math.random() * 9000)}`;

      const payload = {
        supplierCode: cleanSid,
        business: {
          companyName: business.companyName.trim(),
          businessType: business.businessType,
          businessEmail: business.businessEmail.trim(),
          phoneNumber: business.phoneNumber.trim(),
          gstNumber: business.gstNumber.trim(),
          supplierCode: cleanSid,
          currency: business.currency,
          businessAddress: business.businessAddress.trim(),
          state: business.state,
          website: business.website.trim(),
          primaryCategory: business.primaryCategory,
          paymentTerms: business.paymentTerms,
          sellingType: business.sellingType,
          description: business.description.trim(),
        },
        primaryContact: {
          fullName: contact.fullName.trim(),
          designation: contact.designation.trim(),
          directEmail: contact.directEmail.trim() || undefined,
        },
        retailers: [],
        products: products.map((p) => ({
          sku: p.sku || `SKU-${Date.now()}`,
          name: p.name,
          brand: p.brand || undefined,
          variant: p.variant || undefined,
          category: p.cat || p.category || 'General',
          stockAvailable: Number(p.stock || 0),
          unitPrice: Number(p.price || 0),
          minOrderQty: Number(p.moq || 1),
          unit: p.unit || 'Piece',
          expiryDate: p.expiryDate || undefined,
          reviewSummary: p.reviewSummary || undefined,
          description: p.description || undefined,
        })),
        profileStatus: user?.profile?.profileStatus === 'active' ? 'active' : 'pending',
      };

      const res = await createSupplierSetup(payload);
      const supplierId = res?.id || res?.supplier?.id || cleanSid || `sup-${Date.now()}`;
      writeSupplierId(supplierId);

      if (user?.id) {
        try {
          await updateUser(user.id, {
            profileId: supplierId,
            status: user.status === 'Active' ? 'Active' : 'Pending',
          });
        } catch (e) {
          console.warn('Could not link profileId to user in backend:', e);
        }
        try {
          localStorage.setItem(`so_supplier_setup_completed_${user.id}`, 'true');
        } catch {}
      }

      // Trigger employee task distribution in round-robin
      try {
        await fetch('/api/employees/assignments/distribute', { method: 'POST' });
      } catch (_distErr) {
        console.warn('Distribution trigger note:', _distErr);
      }

      const updatedProfile = {
        businessName: business.companyName.trim(),
        businessEmail: business.businessEmail.trim(),
        businessPhone: business.phoneNumber.trim(),
        supplierCode: business.supplierCode.trim(),
        address: business.businessAddress.trim(),
        website: business.website.trim(),
        businessType: business.businessType,
        currency: business.currency,
        primaryCategory: business.primaryCategory,
        paymentTerms: business.paymentTerms,
        sellingType: business.sellingType,
        description: business.description.trim(),
        state: business.state,
        ownerName: contact.fullName.trim(),
        ownerTitle: contact.designation.trim(),
        ownerEmail: contact.directEmail.trim(),
        profileStatus: user?.profile?.profileStatus === 'active' ? 'active' : 'pending',
        retailers: [],
        productCount: products.length,
      };

      const newSession = {
        ...(user || {}),
        profileId: supplierId,
        supplierId: supplierId,
        profile: updatedProfile,
      };

      if (saveSession) saveSession(newSession);
      writeSession(newSession);

      if (refreshUser) {
        await refreshUser();
      }

      return {
        supplierId,
        profile: updatedProfile,
        products,
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to submit supplier setup');
    }
  }
);

/**
 * Fetches legal documents for supplier.
 */
export const fetchDocuments = createAsyncThunk(
  'supplierProfile/fetchDocuments',
  async (supplierId, { rejectWithValue }) => {
    try {
      const docs = await fetchSupplierDocuments(supplierId);
      return docs || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch documents');
    }
  }
);

/**
 * Uploads a legal document for supplier.
 */
export const uploadDocument = createAsyncThunk(
  'supplierProfile/uploadDocument',
  async ({ supplierId, formData }, { rejectWithValue, dispatch }) => {
    try {
      const res = await uploadSupplierDocument(supplierId, formData);
      dispatch(fetchDocuments(supplierId));
      return res;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to upload document');
    }
  }
);

/**
 * Deletes a legal document.
 */
export const deleteDocument = createAsyncThunk(
  'supplierProfile/deleteDocument',
  async ({ supplierId, docId }, { rejectWithValue }) => {
    try {
      await deleteSupplierDocument(supplierId, docId);
      return docId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete document');
    }
  }
);

// ─── Slice Definition ─────────────────────────────────────────────────────────

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    supplierId: getInitialSupplierId(),
    profile: getInitialProfile(),
    documents: [],
    loading: false,
    saving: false,
    setupLoading: false,
    error: null,
  },
  reducers: {
    setSupplierId: (state, action) => {
      state.supplierId = action.payload;
      writeSupplierId(action.payload);
    },
    setProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    updateProfileField: (state, action) => {
      const { field, value } = action.payload;
      state.profile[field] = value;
      if (field === 'gstNumber') {
        state.profile.taxId = value;
      }
    },
    setPlanTier: (state, action) => {
      const { planTier, planPrice } = action.payload;
      state.profile.planTier = planTier;
      state.profile.planPrice = planPrice;
    },
    clearProfileError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // initSupplierProfile
      .addCase(initSupplierProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initSupplierProfile.fulfilled, (state, action) => {
        state.loading = false;
        const { supplierId, supplierRecord, documents } = action.payload;
        if (supplierId) {
          state.supplierId = supplierId;
        }
        if (supplierRecord) {
          const s = supplierRecord;
          state.profile = {
            ...state.profile,
            supplierName: s.business?.companyName || s.supplierName || s.name || state.profile.supplierName,
            supplierCode: s.business?.supplierCode || s.supplierCode || s.code || state.profile.supplierCode,
            email: s.business?.businessEmail || s.email || state.profile.email,
            phone: s.business?.phoneNumber || s.primaryContact?.mobileNumber || s.phone || state.profile.phone,
            category: s.business?.primaryCategory || s.category || state.profile.category,
            state: s.business?.state || s.state || state.profile.state,
            paymentTerms: s.business?.paymentTerms || s.paymentTerms || state.profile.paymentTerms,
            address: s.business?.businessAddress || s.address || state.profile.address,
            website: s.business?.website || s.website || state.profile.website,
            gstNumber: s.business?.gstNumber || s.gstNumber || s.taxId || state.profile.gstNumber,
            description: s.business?.description || s.description || state.profile.description,
          };
        }
        if (Array.isArray(documents)) {
          state.documents = documents;
        }
      })
      .addCase(initSupplierProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to initialize profile';
      })

      // updateSupplierProfile
      .addCase(updateSupplierProfile.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateSupplierProfile.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload) {
          state.profile = { ...state.profile, ...action.payload };
        }
      })
      .addCase(updateSupplierProfile.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || 'Failed to save profile';
      })

      // submitSupplierSetup
      .addCase(submitSupplierSetup.pending, (state) => {
        state.setupLoading = true;
        state.error = null;
      })
      .addCase(submitSupplierSetup.fulfilled, (state, action) => {
        state.setupLoading = false;
        const { supplierId, profile } = action.payload;
        state.supplierId = supplierId;
        state.profile = { ...state.profile, ...profile };
      })
      .addCase(submitSupplierSetup.rejected, (state, action) => {
        state.setupLoading = false;
        state.error = action.payload || 'Failed to complete supplier setup';
      })

      // fetchDocuments
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.documents = action.payload;
      })

      // deleteDocument
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter((d) => d.id !== action.payload);
      });
  },
});

export const {
  setSupplierId,
  setProfile,
  updateProfileField,
  setPlanTier,
  clearProfileError,
} = profileSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectSupplierId = (state) => state.profile.supplierId;
export const selectSupplierProfile = (state) => state.profile.profile;
export const selectSupplierDocuments = (state) => state.profile.documents;
export const selectProfileLoading = (state) => state.profile.loading;
export const selectProfileSaving = (state) => state.profile.saving;
export const selectSetupLoading = (state) => state.profile.setupLoading;
export const selectProfileError = (state) => state.profile.error;

export default profileSlice.reducer;
