import { JsonDbService } from '../common/json-db.service';
import { ReturnRecord } from '../common/database.types';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnDto } from './dto/update-return.dto';
export declare class ReturnsService {
    private readonly db;
    constructor(db: JsonDbService);
    findAll(): ReturnRecord[];
    findOne(id: string): ReturnRecord;
    create(createReturnDto: CreateReturnDto): ReturnRecord;
    update(id: string, updateReturnDto: UpdateReturnDto): ReturnRecord;
    private buildReturnRecord;
    private saveReturns;
    private normalizeReturnRecord;
    private resolveTransactionContext;
    private findTransactionItem;
    private resolveCustomer;
    private resolveProduct;
    private resolveAmount;
    private normalizeStatus;
    private normalizePriority;
    private inferPriority;
    private normalizeDate;
    private toDateNumber;
    private toMoney;
    private buildFallbackImage;
    private normalizeText;
}
