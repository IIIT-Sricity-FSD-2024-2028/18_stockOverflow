import { CustomersService } from '../customers/customers.service';
import { TransactionRecord } from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { ProductsService } from '../products/products.service';
import { ReservationsService } from '../reservations/reservations.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
export declare class TransactionsService {
    private readonly db;
    private readonly productsService;
    private readonly customersService;
    private readonly reservationsService;
    constructor(db: JsonDbService, productsService: ProductsService, customersService: CustomersService, reservationsService: ReservationsService);
    findAll(retailerId?: string, storeId?: string, customerLookup?: string | string[]): TransactionRecord[];
    findLatest(retailerId?: string, storeId?: string, customerLookup?: string | string[]): TransactionRecord;
    findOne(orderId: string, retailerId?: string, storeId?: string, customerLookup?: string | string[]): TransactionRecord;
    create(createTransactionDto: CreateTransactionDto): TransactionRecord;
    update(orderId: string, updateTransactionDto: UpdateTransactionDto): TransactionRecord;
    remove(orderId: string): {
        message: string;
        item: TransactionRecord;
    };
    reconcileInventory(): {
        message: string;
        transactions: number;
        products: number;
    };
    attachReceipt(orderId: string, receiptUrl: string): TransactionRecord;
    getPurchasedProducts(retailerId?: string, storeId?: string, customerLookup?: string | string[]): {
        sku: string;
        name: string;
        totalQty: number;
        totalSpent: number;
        lastOrderedAt: string;
        lastOrderId: string;
        productImg: string;
        emoji: string;
    }[];
    private buildTransactionRecord;
    private enrichCustomerFromReservation;
    private normalizeItem;
    private ensureInventoryAvailability;
    private collectTransactionRequestIds;
    private resolveStoreId;
    private generateOrderId;
    private matchesScope;
    private normalizeText;
    private toMoney;
}
