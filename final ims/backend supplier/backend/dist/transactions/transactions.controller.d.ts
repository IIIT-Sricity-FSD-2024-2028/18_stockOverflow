import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    findAll(): import("../common/database.types").TransactionRecord[];
    findLatest(): import("../common/database.types").TransactionRecord;
    findPurchasedProducts(): {
        sku: string;
        name: string;
        totalQty: number;
        totalSpent: number;
        lastOrderedAt: string;
        lastOrderId: string;
        productImg: string;
        emoji: string;
    }[];
    findOne(orderId: string): import("../common/database.types").TransactionRecord;
    create(createTransactionDto: CreateTransactionDto): import("../common/database.types").TransactionRecord;
    update(orderId: string, updateTransactionDto: UpdateTransactionDto): import("../common/database.types").TransactionRecord;
    remove(orderId: string): {
        message: string;
        item: import("../common/database.types").TransactionRecord;
    };
    reconcileInventory(): {
        message: string;
        transactions: number;
        products: number;
    };
}
