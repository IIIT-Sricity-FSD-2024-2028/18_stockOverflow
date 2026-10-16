export declare class ResolveAssignmentDto {
    action?: 'approve' | 'reject' | 'approved' | 'rejected';
    status?: string;
    rejectionReason?: string;
    notes?: string;
    employeeId?: string;
}
