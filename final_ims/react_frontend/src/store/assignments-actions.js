import { assignmentActions } from './assignments-slice';
import {
  distributeEmployeeWork,
  fetchEmployeeAssignments,
  resolveEmployeeAssignment,
} from '../employee/utils/api_employee';

export const fetchAssignmentsData = () => {
  return async (dispatch) => {
    dispatch(assignmentActions.fetchAssignmentsStarted());
    try {
      await distributeEmployeeWork().catch(() => {});
      const data = await fetchEmployeeAssignments();
      dispatch(assignmentActions.displayAssignments(Array.isArray(data) ? data : []));
    } catch (err) {
      dispatch(
        assignmentActions.assignmentsFailed(err.message || 'Failed to load verification queue')
      );
    }
  };
};

export const resolveAssignmentData = (id, payload) => {
  return async (dispatch) => {
    const res = await resolveEmployeeAssignment(id, payload);
    const updated = res?.assignment || {
      id,
      status: payload.action === 'approve' ? 'approved' : 'rejected',
      notes: payload.notes || payload.rejectionReason || '',
    };
    dispatch(assignmentActions.updateAssignmentInState(updated));
    return updated;
  };
};

