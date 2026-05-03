import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private users;
    findAll(): User[];
    findOne(id: string): User;
    create(createUserDto: CreateUserDto): User;
    update(id: string, updateUserDto: UpdateUserDto): User;
    remove(id: string): boolean;
    login(email: string, password: string): User;
}
