import { roleActions } from './roles-slice';
import {
  fetchAdminRoles,
  createAdminRole,
  updateAdminRole,
  deleteAdminRole,
} from '../admin/utils/api_admin';

export const fetchRolesData = () => {
  return async (dispatch) => {
    dispatch(roleActions.fetchRolesStarted());
    try {
      const data = await fetchAdminRoles();
      dispatch(roleActions.displayRoles(Array.isArray(data) ? data : []));
    } catch (err) {
      dispatch(roleActions.rolesFailed(err.message || 'Failed to load roles'));
    }
  };
};

export const createRoleData = (roleData) => {
  return async (dispatch) => {
    const created = await createAdminRole(roleData);
    dispatch(roleActions.addRole(created));
    return created;
  };
};

export const updateRoleData = (id, roleData) => {
  return async (dispatch) => {
    const updated = await updateAdminRole(id, roleData);
    dispatch(roleActions.updateRoleInState(updated));
    return updated;
  };
};

export const deleteRoleData = (id) => {
  return async (dispatch) => {
    await deleteAdminRole(id);
    dispatch(roleActions.removeRoleFromState(id));
  };
};

