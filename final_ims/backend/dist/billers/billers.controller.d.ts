import { BillersService } from './billers.service';
import { ApproveBillerRequestDto } from './dto/approve-biller-request.dto';
import { CreateBillerDto } from './dto/create-biller.dto';
import { CreateBillerRequestDto } from './dto/create-biller-request.dto';
export declare class BillersController {
    private readonly billersService;
    constructor(billersService: BillersService);
    create(createBillerDto: CreateBillerDto): import("../common/database.types").BillerRecord;
    findAll(retailerId?: string, storeId?: string): import("../common/database.types").BillerRecord[];
    createRequest(requestData: CreateBillerRequestDto): import("../common/database.types").BillerRequest;
    getRequests(): import("../common/database.types").BillerRequest[];
    approveRequest(id: string, approvalScope?: ApproveBillerRequestDto): {
        request: import("../common/database.types").BillerRequest;
        biller: import("../common/database.types").BillerRecord;
    };
    rejectRequest(id: string): import("../common/database.types").BillerRequest;
    findOne(id: number): import("../common/database.types").BillerRecord;
}
