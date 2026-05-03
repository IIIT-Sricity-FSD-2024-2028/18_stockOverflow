import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnDto } from './dto/update-return.dto';
import { ReturnsService } from './returns.service';
export declare class ReturnsController {
    private readonly returnsService;
    constructor(returnsService: ReturnsService);
    findAll(retailerId?: string, storeId?: string, customerLookup?: string): import("../common/database.types").ReturnRecord[];
    findOne(id: string, retailerId?: string, storeId?: string, customerLookup?: string): import("../common/database.types").ReturnRecord;
    create(createReturnDto: CreateReturnDto): import("../common/database.types").ReturnRecord;
    update(id: string, updateReturnDto: UpdateReturnDto): import("../common/database.types").ReturnRecord;
}
