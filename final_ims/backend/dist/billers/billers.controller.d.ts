import { BillersService } from './billers.service';
import { CreateBillerDto } from './dto/create-biller.dto';
export declare class BillersController {
    private readonly billersService;
    constructor(billersService: BillersService);
    create(createBillerDto: CreateBillerDto): import("../common/database.types").BillerRecord;
    findAll(retailerId?: string, storeId?: string): import("../common/database.types").BillerRecord[];
    createRequest(requestData: any): any;
    getRequests(): import("../common/database.types").BillerRequest[];
    approveRequest(id: string, approvalScope?: {
        retailerId?: string;
        storeId?: string;
    }): {
        request: import("../common/database.types").BillerRequest;
        biller: import("../common/database.types").BillerRecord;
    };
    rejectRequest(id: string): import("../common/database.types").BillerRequest;
    findOne(id: number): import("../common/database.types").BillerRecord;
}
