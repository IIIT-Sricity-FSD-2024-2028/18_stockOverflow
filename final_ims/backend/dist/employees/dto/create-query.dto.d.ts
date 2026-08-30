export declare class CreateQueryDto {
    userId?: string;
    userName: string;
    userEmail: string;
    userRole?: string;
    subject: string;
    message: string;
    priority?: 'low' | 'medium' | 'high';
}
