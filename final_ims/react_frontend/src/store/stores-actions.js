import { storeActions } from './stores-slice';
import {
  fetchAdminStores,
  createAdminStore,
  updateAdminStore,
  deleteAdminStore,
  fetchAdminProducts,
  fetchAdminTransactions,
} from '../admin/utils/api_admin';

export const fetchStoresData = () => {
  return async (dispatch) => {
    dispatch(storeActions.fetchStoresStarted());
    try {
      const data = await fetchAdminStores();
      dispatch(storeActions.displayStores(Array.isArray(data) ? data : []));
    } catch (err) {
      dispatch(storeActions.storesFailed(err.message || 'Failed to load stores'));
    }
  };
};

export const createStoreData = (storeData) => {
  return async (dispatch) => {
    const created = await createAdminStore(storeData);
    dispatch(storeActions.addStore(created));
    return created;
  };
};

export const updateStoreData = (id, storeData) => {
  return async (dispatch) => {
    const updated = await updateAdminStore(id, storeData);
    dispatch(storeActions.updateStoreInState(updated));
    return updated;
  };
};

export const deleteStoreData = (id) => {
  return async (dispatch) => {
    await deleteAdminStore(id);
    dispatch(storeActions.removeStoreFromState(id));
  };
};

export const fetchStoreDetailsData = () => {
  return async (dispatch) => {
    try {
      const [products, transactions] = await Promise.all([
        fetchAdminProducts().catch(() => []),
        fetchAdminTransactions().catch(() => []),
      ]);
      dispatch(
        storeActions.displayStoreDetails({
          products: Array.isArray(products) ? products : [],
          transactions: Array.isArray(transactions) ? transactions : [],
        })
      );
    } catch (err) {
      console.error('Failed to load store details:', err);
    }
  };
};

