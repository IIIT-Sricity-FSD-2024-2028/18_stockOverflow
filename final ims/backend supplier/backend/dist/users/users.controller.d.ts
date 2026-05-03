import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    login(loginData: {
        email: string;
        password: string;
    }): import("./user.entity").User;
    create(createUserDto: CreateUserDto): import("./user.entity").User;
    findAll(): import("./user.entity").User[];
    findOne(id: string): import("./user.entity").User;
    update(id: string, updateUserDto: UpdateUserDto): import("./user.entity").User;
    remove(id: string): boolean;
}
