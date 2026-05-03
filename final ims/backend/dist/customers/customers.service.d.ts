import { CustomerRecord } from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersService {
    private readonly db;
    constructor(db: JsonDbService);
    findAll(retailerId?: string, storeId?: string): CustomerRecord[];
    findOne(id: string, retailerId?: string, storeId?: string): CustomerRecord;
    create(createCustomerDto: CreateCustomerDto): CustomerRecord;
    update(id: string, updateCustomerDto: UpdateCustomerDto): CustomerRecord;
    remove(id: string): {
        message: string;
        item: CustomerRecord;
    };
    registerPurchase(customerName: string, finalTotal: number, retailerId?: string, storeId?: string, customerEmail?: string, customerId?: string): CustomerRecord;
    private getCustomers;
    private saveCustomers;
    private buildCustomerRecord;
    private normalizeCustomer;
    private matchesScope;
    private resolveName;
    private normalizeText;
    private toSafeInteger;
    private toMoney;
    private clampRating;
    private formatDateLabel;
}
