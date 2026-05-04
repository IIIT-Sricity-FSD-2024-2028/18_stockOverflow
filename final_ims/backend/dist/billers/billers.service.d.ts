import { JsonCollectionService } from '../common/collection.service';
import { Biller, BillerRequest } from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { ApproveBillerRequestDto } from './dto/approve-biller-request.dto';
import { CreateBillerDto } from './dto/create-biller.dto';
import { CreateBillerRequestDto } from './dto/create-biller-request.dto';
import { UpdateBillerDto } from './dto/update-biller.dto';
import { UsersService } from '../users/users.service';
import { StoresService } from '../stores/stores.service';
export declare class BillersService extends JsonCollectionService<Biller, 'billers'> {
    private readonly usersService;
    private readonly storesService;
    protected readonly collectionKey: "billers";
    protected readonly entityName = "Biller";
    private readonly avatarPalette;
    constructor(db: JsonDbService, usersService: UsersService, storesService: StoresService);
    findAll(retailerId?: string, storeId?: string): import("../common/database.types").BillerRecord[];
    create(createBillerDto: CreateBillerDto): import("../common/database.types").BillerRecord;
    update(id: number, updateBillerDto: UpdateBillerDto): import("../common/database.types").BillerRecord;
    createRequest(requestData: CreateBillerRequestDto): BillerRequest;
    getRequests(): BillerRequest[];
    approveRequest(id: string, approvalScope?: ApproveBillerRequestDto): {
        request: BillerRequest;
        biller: import("../common/database.types").BillerRecord;
    };
    rejectRequest(id: string): BillerRequest;
    private matchesScope;
    private upsertApprovedBiller;
    private ensureBillerUserExists;
    private resolveRequestScope;
    private normalizeText;
    private normalizeEmail;
}
