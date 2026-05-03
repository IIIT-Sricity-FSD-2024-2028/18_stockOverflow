import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private users: User[] = [
    { id: 'u-admin-1', name: 'System Administrator', email: 'admin@stockoverflow.com', password: 'pass1234', role: 'admin', status: 'Active', store: 'Global Hub' },
    { id: 'u-retailer-1', name: 'Primary Retailer', email: 'retailer@stockoverflow.com', password: 'pass1234', role: 'retailer', status: 'Active', store: 'Downtown Store' },
    { id: 'u-supplier-1', name: 'Primary Supplier', email: 'supplier@stockoverflow.com', password: 'pass1234', role: 'supplier', status: 'Active', store: 'Global Hub' },
    { id: 'u-consumer-1', name: 'Primary Consumer', email: 'consumer@stockoverflow.com', password: 'pass1234', role: 'consumer', status: 'Active', store: 'Downtown Store' }
  ];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User {
    return this.users.find(user => user.id === id);
  }

  create(createUserDto: CreateUserDto): User {
    const existingUser = this.users.find(user => user.email.toLowerCase() === createUserDto.email.toLowerCase());
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user: User = {
      id: Date.now().toString(),
      status: 'Active',
      store: createUserDto.store || (createUserDto.role === 'retailer' ? 'Downtown Store' : 'Global Hub'),
      ...createUserDto,
    };
    this.users.push(user);
    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto): User {
    const index = this.users.findIndex(user => user.id === id);
    if (index > -1) {
      this.users[index] = { ...this.users[index], ...updateUserDto };
      return this.users[index];
    }
    return null;
  }

  remove(id: string): boolean {
    const index = this.users.findIndex(user => user.id === id);
    if (index > -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }

  login(email: string, password: string): User {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (user.status !== 'Active') {
      throw new UnauthorizedException('Account is inactive');
    }
    return user;
  }
}