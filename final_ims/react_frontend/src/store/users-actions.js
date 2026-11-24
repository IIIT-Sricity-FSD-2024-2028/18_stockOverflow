import { userActions } from './users-slice';
import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from '../admin/utils/api_admin';

export const fetchUsersData = () => {
  return async (dispatch) => {
    dispatch(userActions.fetchUsersStarted());
    try {
      const data = await fetchAdminUsers();
      dispatch(userActions.displayUsers(Array.isArray(data) ? data : []));
    } catch (err) {
      dispatch(userActions.usersFailed(err.message || 'Failed to load users'));
    }
  };
};

export const createUserData = (userData) => {
  return async (dispatch) => {
    const created = await createAdminUser(userData);
    // Only update Redux state after backend DB confirms creation
    dispatch(userActions.addUser(created));
    return created;
  };
};

export const updateUserData = (id, userData) => {
  return async (dispatch) => {
    const updated = await updateAdminUser(id, userData);
    // Only update Redux state after backend DB confirms update
    dispatch(userActions.updateUserInState(updated));
    return updated;
  };
};

export const deleteUserData = (id) => {
  return async (dispatch) => {
    await deleteAdminUser(id);
    // Only update Redux state after backend DB confirms delete
    dispatch(userActions.removeUserFromState(id));
  };
};

