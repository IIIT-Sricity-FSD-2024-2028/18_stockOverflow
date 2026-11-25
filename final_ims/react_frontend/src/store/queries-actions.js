import { queryActions } from './queries-slice';
import {
  fetchEmployeeQueries,
  createEmployeeQuery,
  resolveEmployeeQuery,
} from '../employee/utils/api_employee';

export const fetchQueriesData = () => {
  return async (dispatch) => {
    dispatch(queryActions.fetchQueriesStarted());
    try {
      const data = await fetchEmployeeQueries();
      dispatch(queryActions.displayQueries(Array.isArray(data) ? data : []));
    } catch (err) {
      dispatch(queryActions.queriesFailed(err.message || 'Failed to load support queries'));
    }
  };
};

export const createQueryData = (queryData) => {
  return async (dispatch) => {
    const created = await createEmployeeQuery(queryData);
    dispatch(queryActions.addQuery(created));
    return created;
  };
};

export const resolveQueryData = (id, payload) => {
  return async (dispatch) => {
    const res = await resolveEmployeeQuery(id, payload);
    const updated = res?.query || { id, ...payload };
    dispatch(queryActions.updateQueryInState(updated));
    return updated;
  };
};

