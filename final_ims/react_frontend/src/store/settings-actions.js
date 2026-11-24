import { settingsActions } from './settings-slice';
import { fetchAdminSettings, updateAdminSettings } from '../admin/utils/api_admin';

export const fetchSettingsData = () => {
  return async (dispatch) => {
    dispatch(settingsActions.fetchSettingsStarted());
    try {
      const data = await fetchAdminSettings();
      if (data) dispatch(settingsActions.displaySettings(data));
    } catch (err) {
      dispatch(settingsActions.settingsFailed(err.message || 'Failed to load settings'));
    }
  };
};

export const updateSettingsData = (settingsData) => {
  return async (dispatch) => {
    dispatch(settingsActions.saveSettingsStarted());
    try {
      const updated = await updateAdminSettings(settingsData);
      dispatch(settingsActions.saveSettingsSuccess(updated));
      return updated;
    } catch (err) {
      dispatch(settingsActions.settingsFailed(err.message || 'Failed to save settings'));
      throw err;
    }
  };
};

