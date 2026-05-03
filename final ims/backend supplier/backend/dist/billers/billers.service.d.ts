import { JsonCollectionService } from '../common/collection.service';
import { Biller } from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { CreateBillerDto } from './dto/create-biller.dto';
import { UpdateBillerDto } from './dto/update-biller.dto';
import { UsersService } from '../users/users.service';
export declare class BillersService extends JsonCollectionService<Biller, 'billers'> {
    private readonly usersService;
    protected readonly collectionKey: "billers";
    protected readonly entityName = "Biller";
    private readonly avatarPalette;
    constructor(db: JsonDbService, usersService: UsersService);
    findAll(): import("../common/database.types").BillerRecord[];
    create(createBillerDto: CreateBillerDto): import("../common/database.types").BillerRecord;
    update(id: number, updateBillerDto: UpdateBillerDto): import("../common/database.types").BillerRecord;
    createRequest(requestData: any): any;
    getRequests(): import("../common/database.types").BillerRequest[];
    approveRequest(id: string): {
        request: import("../common/database.types").BillerRequest;
        biller: import("../common/database.types").BillerRecord;
    };
    rejectRequest(id: string): import("../common/database.types").BillerRequest;
}
