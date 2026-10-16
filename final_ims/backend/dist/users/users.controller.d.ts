import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    login(loginData: LoginUserDto): Omit<import("./user.entity").User, "password"> & {
        token?: string;
    };
    create(createUserDto: CreateUserDto): Omit<import("./user.entity").User, "password"> & {
        token?: string;
    };
    findAll(role?: string, email?: string): (Omit<import("./user.entity").User, "password"> & {
        token?: string;
    })[];
    findOne(id: string): Omit<import("./user.entity").User, "password"> & {
        token?: string;
    };
    update(id: string, updateUserDto: UpdateUserDto): Omit<import("./user.entity").User, "password"> & {
        token?: string;
    };
    updateProfile(id: string, profile: Record<string, unknown>): Omit<import("./user.entity").User, "password"> & {
        token?: string;
    };
    remove(id: string): boolean;
}
