import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomersService } from './customers.service';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findAll(): import("../common/database.types").CustomerRecord[];
    findOne(id: string): import("../common/database.types").CustomerRecord;
    create(createCustomerDto: CreateCustomerDto): import("../common/database.types").CustomerRecord;
    update(id: string, updateCustomerDto: UpdateCustomerDto): import("../common/database.types").CustomerRecord;
    remove(id: string): {
        message: string;
        item: import("../common/database.types").CustomerRecord;
    };
}
