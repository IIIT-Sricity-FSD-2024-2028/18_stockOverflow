import { createSlice } from '@reduxjs/toolkit';

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    settings: {
      reorderThreshold: 10,
      lowStockAlertEnabled: true,
      autoReorderEnabled: false,
      maxOrderQuantity: 100,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
    },
    loading: false,
    saving: false,
    saved: false,
    error: null,
  },
  reducers: {
    fetchSettingsStarted(state) {
      state.loading = true;
      state.error = null;
    },
    displaySettings(state, action) {
      state.settings = action.payload;
      state.loading = false;
      state.saving = false;
      state.error = null;
    },
    saveSettingsStarted(state) {
      state.saving = true;
      state.saved = false;
      state.error = null;
    },
    saveSettingsSuccess(state, action) {
      state.settings = action.payload;
      state.saving = false;
      state.saved = true;
      state.error = null;
    },
    clearSavedFlag(state) {
      state.saved = false;
    },
    settingsFailed(state, action) {
      state.loading = false;
      state.saving = false;
      state.error = action.payload;
    },
  },
});

export const settingsActions = settingsSlice.actions;

export default settingsSlice;

